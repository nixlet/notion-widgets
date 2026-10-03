"use client";

import { useState } from "react";
import type { FormConfig } from "@/lib/types";

// Hidden honeypot field name - real users never see or fill this in.
// If it comes back non-empty we silently "succeed" without storing anything.
const HONEYPOT_NAME = "_nw_hp";

export default function FormWidget({
  widgetId,
  config,
  preview,
}: {
  widgetId: string;
  config: FormConfig;
  preview?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const data: Record<string, unknown> = {};

    for (const field of config.fields) {
      if (field.type === "checkbox") {
        data[field.id] = formData.get(field.id) === "on";
      } else {
        data[field.id] = formData.get(field.id) ?? "";
      }
    }

    const honeypot = formData.get(HONEYPOT_NAME);
    if (honeypot) {
      // Bot likely filled the hidden field. Pretend success, save nothing.
      setStatus("done");
      return;
    }

    if (preview) {
      // Just simulate success - nothing is saved while editing.
      setTimeout(() => setStatus("done"), 300);
      return;
    }

    try {
      const res = await fetch(`/api/widgets/${widgetId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong submitting the form.");
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <div className="flex min-h-[80px] w-full items-center justify-center rounded-xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
          {config.successMessage}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      {config.title && (
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {config.title}
        </h3>
      )}
      {config.description && (
        <p className="-mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {config.description}
        </p>
      )}

      {config.fields.map((field) => (
        <div key={field.id} className="flex flex-col gap-1">
          {field.type !== "checkbox" && (
            <label
              htmlFor={field.id}
              className="text-xs font-medium text-neutral-600 dark:text-neutral-300"
            >
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
          )}

          {field.type === "text" || field.type === "email" || field.type === "number" ? (
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900"
              style={{ accentColor: config.accentColor }}
            />
          ) : field.type === "textarea" ? (
            <textarea
              id={field.id}
              name={field.id}
              required={field.required}
              placeholder={field.placeholder}
              rows={3}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          ) : field.type === "select" ? (
            <select
              id={field.id}
              name={field.id}
              required={field.required}
              defaultValue=""
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="" disabled>
                {field.placeholder ?? "Select..."}
              </option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
              <input
                id={field.id}
                name={field.id}
                type="checkbox"
                required={field.required}
                style={{ accentColor: config.accentColor }}
              />
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
          ) : null}
        </div>
      ))}

      {/* Honeypot - hidden from real users via CSS, bots often fill every field */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={HONEYPOT_NAME}>Leave this field empty</label>
        <input id={HONEYPOT_NAME} name={HONEYPOT_NAME} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-60"
        style={{ backgroundColor: config.accentColor }}
      >
        {status === "submitting" ? "Submitting..." : config.submitLabel}
      </button>
    </form>
  );
}
