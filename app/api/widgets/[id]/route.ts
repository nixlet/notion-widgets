import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { parseConfigForType, WidgetTypeSchema } from "@/lib/types";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const widget = await store.getWidget(id);
  if (!widget) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const existing = await store.getWidget(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await store.deleteWidget(id);
  return NextResponse.json({ ok: true });
}
