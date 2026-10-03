import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { newWidgetId } from "@/lib/id";
import { WidgetTypeSchema, parseConfigForType } from "@/lib/types";
import { findUnsafeUrls } from "@/lib/url";
import { MASTER_ID } from "@/lib/session";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-nw-user");
  // The master login sees everything; everyone else only sees what they made.
  const widgets = await store.listWidgets(userId && userId !== MASTER_ID ? userId : undefined);
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

  const urlErrors = findUnsafeUrls(parsed.data.type, config as unknown as Record<string, unknown>);
  if (urlErrors.length > 0) {
    return NextResponse.json({ error: urlErrors[0] }, { status: 400 });
  }

  const userId = req.headers.get("x-nw-user") ?? MASTER_ID;
  const now = new Date().toISOString();
  const widget = {
    id: newWidgetId(),
    type: parsed.data.type,
    name: parsed.data.name,
    transparent: parsed.data.transparent,
    config,
    ownerId: userId,
    createdAt: now,
    updatedAt: now,
  };

  await store.saveWidget(widget);
  return NextResponse.json({ widget }, { status: 201 });
}
