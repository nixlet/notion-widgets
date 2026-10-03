import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, MASTER_ID, masterFingerprint, parseSessionToken } from "@/lib/session";

// Password gate for the builder dashboard. Public widget pages (/w/*),
// their public submit API, and the login page itself are always left
// open - Notion (and anyone you share a widget URL with) must be able to
// load them without authenticating.
//
// If ADMIN_PASSWORD is not set, the gate is disabled entirely and the
// builder is open to anyone who can reach the deployment URL.
//
// Two kinds of sessions:
// - The master login (just the ADMIN_PASSWORD, no email) - can do
//   everything, including managing the user list at /users.
// - Regular users (created from /users) - can manage widgets, but can't
//   see or change the user list.

export async function proxy(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const isPublic =
    pathname.startsWith("/w/") ||
    pathname === "/login" ||
    pathname === "/api/login" ||
    (pathname.startsWith("/api/widgets/") && pathname.endsWith("/submit"));

  if (isPublic) return NextResponse.next();

  const authSecret = process.env.AUTH_SECRET ?? "";
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const session = await parseSessionToken(cookie, authSecret);

  let authed = false;
  if (session) {
    if (session.userId === MASTER_ID) {
      authed = session.fingerprint === (await masterFingerprint(adminPassword));
    } else {
      // Signature already proves this token was issued by us for this
      // user id (see lib/session.ts) - that's enough to let a regular
      // user through to everything except the user list below.
      authed = true;
    }

    const isOwnerOnly = pathname === "/users" || pathname.startsWith("/api/users");
    if (authed && isOwnerOnly && session.userId !== MASTER_ID) {
      authed = false;
    }
  }

  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
