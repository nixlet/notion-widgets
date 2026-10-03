import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { verifyPassword } from "@/lib/auth";
import { COOKIE_NAME, MASTER_ID, createSessionToken, masterFingerprint } from "@/lib/session";

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ ok: true }); // gate disabled
  }

  const authSecret = process.env.AUTH_SECRET ?? "";
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  let userId: string | null = null;
  let fingerprint: string | null = null;

  if (!email) {
    // Master login - the one password set in Railway.
    if (password && password === adminPassword) {
      userId = MASTER_ID;
      fingerprint = await masterFingerprint(adminPassword);
    }
  } else {
    const user = await store.getUserByEmail(email);
    if (user && (await verifyPassword(password, user.passwordHash))) {
      userId = user.id;
      fingerprint = user.passwordHash;
    }
  }

  if (!userId || !fingerprint) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  const token = await createSessionToken(userId, fingerprint, authSecret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
