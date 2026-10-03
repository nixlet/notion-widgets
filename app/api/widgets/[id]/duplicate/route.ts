import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { newWidgetId } from "@/lib/id";
import { MASTER_ID } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const existing = await store.getWidget(id);
  const userId = req.headers.get("x-nw-user") ?? MASTER_ID;

  if (!existing || (userId !== MASTER_ID && (existing.ownerId ?? MASTER_ID) !== userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const widget = {
    ...existing,
    id: newWidgetId(),
    name: `${existing.name} (copy)`,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };

  await store.saveWidget(widget);
  return NextResponse.json({ widget }, { status: 201 });
}
