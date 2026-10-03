import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { newWidgetId } from "@/lib/id";
import { WidgetTypeSchema, parseConfigForType } from "@/lib/types";
import { z } from "zod";

export async function GET() {
  const widgets = await store.listWidgets();
  return NextResponse.json({ widgets });
}

const CreateWidgetSchema = z.object({
  type: WidgetTypeSchema,
  name: z.string().min(1).max(80),
  transparent: z.boolean().optional().default(true),
  config: z.unknown(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CreateWidgetSchema.safeParse(body);
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

  const now = new Date().toISOString();
  const widget = {
    id: newWidgetId(),
    type: parsed.data.type,
    name: parsed.data.name,
    transparent: parsed.data.transparent,
    config,
    createdAt: now,
    updatedAt: now,
  };

  await store.saveWidget(widget);
  return NextResponse.json({ widget }, { status: 201 });
}
