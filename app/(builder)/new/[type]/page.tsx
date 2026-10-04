import { notFound } from "next/navigation";
import WidgetEditor from "@/components/builder/WidgetEditor";
import { newFieldId } from "@/lib/id";
import { WidgetTypeSchema, type WidgetConfig } from "@/lib/types";

function defaultConfigFor(type: string): WidgetConfig {
  switch (type) {
    case "button":
      return {
        label: "Click me",
        subLabelColor: "#e2e8f0",
        subLabelSize: 12,
        url: "https://",
        style: "solid",
        color: "#2563eb",
        openInNewTab: true,
        fullWidth: false,
        backgroundType: "solid",
        gradientColor: "#7c3aed",
        gradientAngle: 135,
        backgroundOpacity: 100,
        textColor: "#ffffff",
        cornerGlow: false,
        cornerGlowColor: "#22d3ee",
        cornerGlowPosition: "top-left",
        cornerGlowSize: 160,
        cornerGlowOpacity: 60,
        accentLine: false,
        accentLineColor: "#22d3ee",
        accentLineWidth: 3,
        accentLineLength: 40,
        borderRadius: 12,
        fontFamily: "system",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: 0,
        uppercase: false,
        italic: false,
      };
    case "form":
      return {
        title: "Quick form",
        fields: [{ id: newFieldId(), label: "Name", type: "text", required: true }],
        submitLabel: "Submit",
        successMessage: "Thanks! Your response was recorded.",
        accentColor: "#2563eb",
      };
    case "gallery":
      return {
        layout: "grid",
        columns: 3,
        items: [{ id: newFieldId(), imageUrl: "", caption: "" }],
      };
    case "progress":
      return { mode: "bar", label: "Goal", color: "#2563eb", current: 0, target: 100 };
    default:
      throw new Error("unreachable");
  }
}

export default async function NewWidgetTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const parsed = WidgetTypeSchema.safeParse(type);
  if (!parsed.success) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
        New {parsed.data} widget
      </h1>
      {/* key={parsed.data} forces a remount when navigating from one "New
          widget" type straight to another, same reasoning as the edit page. */}
      <WidgetEditor key={parsed.data} type={parsed.data} defaultConfig={defaultConfigFor(parsed.data)} />
    </div>
  );
}
