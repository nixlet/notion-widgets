// Lightweight, dependency-free session tokens.
//
// Used by proxy.ts (edge runtime) and the login/users API routes (Node
// runtime) - so this file must only use Web Crypto (`crypto.subtle`),
// which both runtimes provide, and nothing Node-only (no `crypto.scrypt`,
// no `fs`). Password *hashing* lives in lib/auth.ts instead, which is
// only ever imported from Node API routes.

export const COOKIE_NAME = "nw_auth";
export const MASTER_ID = "master";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// A session token is self-contained: `${userId}.${fingerprint}.${signature}`.
// `fingerprint` ties the token to a credential (the master password, or a
// user's current password hash) so proxy.ts can verify a request without a
// database round-trip on every single page load.
//
// - Master sessions are re-checked against the *live* ADMIN_PASSWORD env
//   var on every request, so rotating that password instantly signs
//   everyone with a master session out.
// - Regular user sessions are only checked for internal consistency (the
//   signature matches what we issued) - proxy.ts does not hit the database
//   to confirm the user still exists. In practice that means removing a
//   user, or changing their password, takes effect the next time they try
//   to log in; an already-open session for them keeps working until the
//   cookie expires (30 days) or AUTH_SECRET is rotated. Fine for a small,
//   trusted team; worth knowing if you ever need to cut someone off
//   immediately (rotate AUTH_SECRET in Railway to force everyone to log
//   back in).
export async function createSessionToken(
  userId: string,
  fingerprint: string,
  authSecret: string
): Promise<string> {
  const sig = await sha256(`${userId}:${fingerprint}:${authSecret}`);
  return `${userId}.${fingerprint}.${sig}`;
}

export interface ParsedSession {
  userId: string;
  fingerprint: string;
}

export async function parseSessionToken(
  token: string | undefined,
  authSecret: string
): Promise<ParsedSession | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, fingerprint, sig] = parts;
  const expected = await sha256(`${userId}:${fingerprint}:${authSecret}`);
  if (sig !== expected) return null;
  return { userId, fingerprint };
}

export async function masterFingerprint(adminPassword: string): Promise<string> {
  return sha256(`master-password:${adminPassword}`);
}
