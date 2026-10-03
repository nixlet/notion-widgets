import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { parseConfigForType, type FormConfig } from "@/lib/types";
import { MASTER_ID } from "@/lib/session";

function canAccess(widget: { ownerId?: string }, userId: string): boolean {
  return userId === MASTER_ID || (widget.ownerId ?? MASTER_ID) === userId;
}

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (v: unknown) => {
    let s = v === undefined || v === null ? "" : String(v);
    // Neutralize spreadsheet formula injection: a cell starting with one of
    // these characters gets interpreted as a formula by Excel/Sheets when
    // the CSV is opened, which would let a form submitter run a "formula"
    // just by typing it into a text field.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = columns.map(escape).join(",");
  const body = rows.map((r) => columns.map((c) => escape(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const widget = await store.getWidget(id);
  const userId = req.headers.get("x-nw-user") ?? MASTER_ID;
  if (!widget || widget.type !== "form" || !canAccess(widget, userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const submissions = await store.listSubmissions(widget.id);
  const format = req.nextUrl.searchParams.get("format");

  if (format === "csv") {
    const config = parseConfigForType("form", widget.config) as FormConfig;
    const columns = ["submittedAt", ...config.fields.map((f) => f.id)];
    const rows = submissions.map((s) => ({
      submittedAt: s.submittedAt,
      ...s.data,
    }));
    const csv = toCsv(rows, columns);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${widget.name.replace(/[^a-z0-9]+/gi, "-")}-submissions.csv"`,
      },
    });
  }

  return NextResponse.json({ submissions });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const widget = await store.getWidget(id);
  const userId = req.headers.get("x-nw-user") ?? MASTER_ID;
  if (!widget || !canAccess(widget, userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await store.deleteSubmissions(id);
  return NextResponse.json({ ok: true });
}
