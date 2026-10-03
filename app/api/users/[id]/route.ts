import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await store.deleteUser(id);
  return NextResponse.json({ ok: true });
}
