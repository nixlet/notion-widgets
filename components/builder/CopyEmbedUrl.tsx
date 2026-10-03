"use client";

import { useState } from "react";

export default function CopyEmbedUrl({ widgetId }: { widgetId: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  // Compute on the client so it reflects the actual deployed domain.
  if (typeof window !== "undefined" && !url) {
    setUrl(`${window.location.origin}/w/${widgetId}`);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may be unavailable (e.g. insecure context) - no-op.
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-900">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 truncate bg-transparent text-xs text-neutral-600 outline-none dark:text-neutral-300"
      />
      <button
        type="button"
        onClick={copy}
        className="flex-shrink-0 rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-900"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
