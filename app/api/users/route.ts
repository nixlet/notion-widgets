import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { hashPassword } from "@/lib/auth";
import { newUserId } from "@/lib/id";
import { z } from "zod";

// Only reachable by the master login - proxy.ts blocks regular users from
// every /api/users route before it ever gets here.

export async function GET() {
  const users = await store.listUsers();
  return NextResponse.json({ users });
}

const CreateUserSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid user" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await store.getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
  }

  const user = {
    id: newUserId(),
    email,
    passwordHash: await hashPassword(parsed.data.password),
    createdAt: new Date().toISOString(),
  };

  await store.createUser(user);
  return NextResponse.json(
    { user: { id: user.id, email: user.email, createdAt: user.createdAt } },
    { status: 201 }
  );
}
