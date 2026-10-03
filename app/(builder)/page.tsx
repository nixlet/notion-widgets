"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WidgetSummary } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  button: "Button",
  form: "Form",
  gallery: "Gallery",
  progress: "Progress / tracker",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const [widgets, setWidgets] = useState<WidgetSummary[] | null>(null);
  const [origin, setOrigin] = useState("");

  async function load() {
    const res = await fetch("/api/widgets");
    const body = await res.json();
    setWidgets(body.widgets ?? []);
  }

  useEffect(() => {
    load();
    setOrigin(window.location.origin);
  }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This also removes its embed URL and any stored form submissions.`)) {
      return;
    }
    await fetch(`/api/widgets/${id}`, { method: "DELETE" });
    load();
  }

  async function copy(id: string) {
    await navigator.clipboard.writeText(`${origin}/w/${id}`).catch(() => {});
  }

  if (widgets === null) {
    return <p className="text-sm text-neutral-500">Loading...</p>;
  }

  if (widgets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          You haven&apos;t built any widgets yet.
        </p>
        <Link
          href="/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Build your first widget
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {widgets.map((w) => (
        <div
          key={w.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {TYPE_LABELS[w.type] ?? w.type}
              </span>
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                {w.name}
              </p>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Updated {timeAgo(w.updatedAt)}
              {typeof w.submissionCount === "number" &&
                ` · ${w.submissionCount} submission${w.submissionCount === 1 ? "" : "s"}`}
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={() => copy(w.id)}
              className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Copy URL
            </button>
            {w.type === "form" && (
              <Link
                href={`/submissions/${w.id}`}
                className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Submissions
              </Link>
            )}
            <Link
              href={`/edit/${w.id}`}
              className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(w.id, w.name)}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
