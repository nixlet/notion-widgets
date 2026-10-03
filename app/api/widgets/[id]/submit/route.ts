import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { newSubmissionId } from "@/lib/id";
import { parseConfigForType, type FormConfig } from "@/lib/types";
import { z } from "zod";

// Public endpoint - this is what the embedded Notion widget posts to.
// No auth: anyone with the widget URL can submit, same as a public Notion
// share link or a Google Form.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const widget = await store.getWidget(id);
  if (!widget || widget.type !== "form") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const config = parseConfigForType("form", widget.config) as FormConfig;

  const body = await req.json().catch(() => null);
  const parsed = z.object({ data: z.record(z.unknown()) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  // Validate required fields were actually provided.
  for (const field of config.fields) {
    if (field.required) {
      const value = parsed.data.data[field.id];
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "");
      if (empty) {
        return NextResponse.json(
          { error: `"${field.label}" is required.` },
          { status: 400 }
        );
      }
    }
  }

  await store.addSubmission(widget.id, {
    id: newSubmissionId(),
    widgetId: widget.id,
    data: parsed.data.data,
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
