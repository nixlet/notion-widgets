import { NextRequest, NextResponse } from "next/server";

// Optional, very lightweight password gate for the builder dashboard.
// Public widget pages (/w/*), their public submit API, and the login
// page itself are always left open - Notion (and anyone you share a
// widget URL with) must be able to load them without authenticating.
//
// If ADMIN_PASSWORD is not set, the gate is disabled entirely and the
// builder is open to anyone who can reach the deployment URL.

const COOKIE_NAME = "nw_auth";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

  const expected = await sha256(adminPassword + (process.env.AUTH_SECRET ?? ""));
  const cookie = req.cookies.get(COOKIE_NAME)?.value;

  if (cookie === expected) return NextResponse.next();

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
