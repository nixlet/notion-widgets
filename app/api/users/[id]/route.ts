import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const UpdateUserSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  name: z.string().min(1).max(80).optional(),
});

// Reset a user's password and/or update their name. Master-only - proxy.ts
// blocks everyone else from every /api/users route.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  if (!parsed.data.password && !parsed.data.name) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const patch: { name?: string; passwordHash?: string } = {};
  if (parsed.data.name) patch.name = parsed.data.name.trim();
  if (parsed.data.password) patch.passwordHash = await hashPassword(parsed.data.password);

  const updated = await store.updateUser(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    user: { id: updated.id, name: updated.name, email: updated.email, createdAt: updated.createdAt },
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await store.deleteUser(id);
  return NextResponse.json({ ok: true });
}
