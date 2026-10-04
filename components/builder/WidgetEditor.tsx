"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Widget, WidgetConfig, WidgetType } from "@/lib/types";
import ButtonEditor from "./ButtonEditor";
import FormEditor from "./FormEditor";
import GalleryEditor from "./GalleryEditor";
import ProgressEditor from "./ProgressEditor";
import WidgetPreviewFrame from "./WidgetPreviewFrame";
import CopyEmbedUrl from "./CopyEmbedUrl";
import ButtonWidget from "@/components/widgets/ButtonWidget";
import FormWidget from "@/components/widgets/FormWidget";
import GalleryWidget from "@/components/widgets/GalleryWidget";
import ProgressWidget from "@/components/widgets/ProgressWidget";
import { input, label as labelCls } from "./formClasses";

const TYPE_LABELS: Record<WidgetType, string> = {
  button: "Button",
  form: "Form",
  gallery: "Gallery",
  progress: "Progress / tracker",
};

export default function WidgetEditor({
  type,
  existing,
  defaultConfig,
}: {
  type: WidgetType;
  existing?: Widget;
  defaultConfig: WidgetConfig;
}) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name ?? `Untitled ${TYPE_LABELS[type]}`);
  const [transparent, setTransparent] = useState(existing?.transparent ?? true);
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedWidget, setSavedWidget] = useState<Widget | null>(existing ?? null);

  // Snapshot of {name, transparent, config} as of the last successful save
  // (or initial load, for a new widget). Comparing the live form state
  // against this is how we know whether there's anything unsaved.
  const [savedSnapshot, setSavedSnapshot] = useState(
    JSON.stringify({ name, transparent, config })
  );
  const isDirty = useMemo(
    () => JSON.stringify({ name, transparent, config }) !== savedSnapshot,
    [name, transparent, config, savedSnapshot]
  );

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        existing ? `/api/widgets/${existing.id}` : "/api/widgets",
        {
          method: existing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, name, transparent, config }),
        }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to save widget.");
      setSavedWidget(body.widget);
      setSavedSnapshot(JSON.stringify({ name, transparent, config }));
      if (!existing) {
        router.replace(`/edit/${body.widget.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save widget.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50/95 px-6 py-3 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isDirty ? (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          ) : (
            "All changes saved"
          )}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="w-fit rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : existing ? "Save changes" : "Create widget"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>Widget name (for your dashboard only)</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
            />
            Transparent background (recommended for Notion)
          </label>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {type === "button" && (
            <ButtonEditor config={config as any} onChange={setConfig as any} />
          )}
          {type === "form" && (
            <FormEditor config={config as any} onChange={setConfig as any} />
          )}
          {type === "gallery" && (
            <GalleryEditor config={config as any} onChange={setConfig as any} />
          )}
          {type === "progress" && (
            <ProgressEditor config={config as any} onChange={setConfig as any} />
          )}
        </div>

        {/*
          This outer div is the grid cell and keeps CSS Grid's default
          stretch behavior, so it's as tall as the (longer) options column.
          The inner div below is the actual sticky element - it's short
          (just its own content height), so it has room inside this tall
          cell to float near the top of the viewport and stay in view while
          the options list scrolls past, instead of scrolling away with it.
        */}
        <div className="flex flex-col">
          <div className="flex flex-col gap-6 lg:sticky lg:top-6">
            <WidgetPreviewFrame transparent={transparent}>
              {type === "button" && <ButtonWidget config={config as any} preview />}
              {type === "form" && (
                <FormWidget widgetId="preview" config={config as any} preview />
              )}
              {type === "gallery" && <GalleryWidget config={config as any} />}
              {type === "progress" && <ProgressWidget config={config as any} />}
            </WidgetPreviewFrame>

            {savedWidget ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Embed URL - paste this into Notion
                </p>
                <CopyEmbedUrl widgetId={savedWidget.id} />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  In Notion, type <code>/embed</code>, paste the URL, and press enter. If
                  Notion offers to create a bookmark instead, choose &quot;Embed link&quot;.
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Save the widget to get its embed URL.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
