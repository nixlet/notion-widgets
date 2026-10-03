import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { parseConfigForType, WidgetTypeSchema } from "@/lib/types";
import { findUnsafeUrls } from "@/lib/url";
import { MASTER_ID } from "@/lib/session";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

// Master can touch anything; everyone else only their own widgets. Not
// found (rather than forbidden) on a mismatch, so a regular user can't
// even confirm that some other id exists.
function canAccess(widget: { ownerId?: string }, userId: string): boolean {
  return userId === MASTER_ID || (widget.ownerId ?? MASTER_ID) === userId;
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const widget = await store.getWidget(id);
  const userId = req.headers.get("x-nw-user") ?? MASTER_ID;
  if (!widget || !canAccess(widget, userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ widget });
}

const UpdateWidgetSchema = z.object({
  type: WidgetTypeSchema,
  name: z.string().min(1).max(80),
  transparent: z.boolean().optional().default(true),
  config: z.unknown(),
});

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const existing = await store.getWidget(id);
  const userId = req.headers.get("x-nw-user") ?? MASTER_ID;
  if (!existing || !canAccess(existing, userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateWidgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid widget payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let config;
  try {
    config = parseConfigForType(parsed.data.type, parsed.data.config);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid config for widget type", details: String(err) },
      { status: 400 }
    );
  }

  const urlErrors = findUnsafeUrls(parsed.data.type, config as unknown as Record<string, unknown>);
  if (urlErrors.length > 0) {
    return NextResponse.json({ error: urlErrors[0] }, { status: 400 });
  }

  const widget = {
    ...existing,
    type: parsed.data.type,
    name: parsed.data.name,
    transparent: parsed.data.transparent,
    config,
    updatedAt: new Date().toISOString(),
  };

  await store.saveWidget(widget);
  return NextResponse.json({ widget });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const existing = await store.getWidget(id);
  const userId = req.headers.get("x-nw-user") ?? MASTER_ID;
  if (!existing || !canAccess(existing, userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await store.deleteWidget(id);
  return NextResponse.json({ ok: true });
}
