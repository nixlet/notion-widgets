import type { FormConfig, FormField } from "@/lib/types";
import { newFieldId } from "@/lib/id";
import { field, input, label as labelCls, select, smallBtn, smallBtnDanger, sectionTitle } from "./formClasses";

const FIELD_TYPES: { value: FormField["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Paragraph" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "number", label: "Number" },
];

export default function FormEditor({
  config,
  onChange,
}: {
  config: FormConfig;
  onChange: (c: FormConfig) => void;
}) {
  const set = <K extends keyof FormConfig>(key: K, value: FormConfig[K]) =>
    onChange({ ...config, [key]: value });

  function updateField(id: string, patch: Partial<FormField>) {
    set(
      "fields",
      config.fields.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  }

  function addField() {
    set("fields", [
      ...config.fields,
      { id: newFieldId(), label: "New field", type: "text", required: false },
    ]);
  }

  function removeField(id: string) {
    set("fields", config.fields.filter((f) => f.id !== id));
  }

  function move(id: string, dir: -1 | 1) {
    const idx = config.fields.findIndex((f) => f.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= config.fields.length) return;
    const next = [...config.fields];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    set("fields", next);
  }

  return (
    <div className={field}>
      <div>
        <label className={labelCls}>Form title (optional)</label>
        <input
          className={input}
          value={config.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Get in touch"
        />
      </div>

      <div>
        <label className={labelCls}>Description (optional)</label>
        <input
          className={input}
          value={config.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="We'll get back to you within a day."
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className={sectionTitle}>Fields</p>
        {config.fields.map((f, i) => (
          <div
            key={f.id}
            className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <div className="flex gap-2">
              <input
                className={input}
                value={f.label}
                onChange={(e) => updateField(f.id, { label: e.target.value })}
                placeholder="Field label"
              />
              <select
                className={`${select} w-36 flex-shrink-0`}
                value={f.type}
                onChange={(e) =>
                  updateField(f.id, { type: e.target.value as FormField["type"] })
                }
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {(f.type === "text" || f.type === "email" || f.type === "textarea" || f.type === "select") && (
              <input
                className={input}
                value={f.placeholder ?? ""}
                onChange={(e) => updateField(f.id, { placeholder: e.target.value })}
                placeholder="Placeholder text (optional)"
              />
            )}

            {f.type === "select" && (
              <input
                className={input}
                value={(f.options ?? []).join(", ")}
                onChange={(e) =>
                  updateField(f.id, {
                    options: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Option A, Option B, Option C"
              />
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => updateField(f.id, { required: e.target.checked })}
                />
                Required
              </label>
              <div className="flex gap-1.5">
                <button type="button" className={smallBtn} onClick={() => move(f.id, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() => move(f.id, 1)}
                  disabled={i === config.fields.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={smallBtnDanger}
                  onClick={() => removeField(f.id)}
                  disabled={config.fields.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className={smallBtn} onClick={addField}>
          + Add field
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls}>Submit button text</label>
          <input
            className={input}
            value={config.submitLabel}
            onChange={(e) => set("submitLabel", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Accent color</label>
          <input
            type="color"
            className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
            value={config.accentColor}
            onChange={(e) => set("accentColor", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Success message</label>
        <input
          className={input}
          value={config.successMessage}
          onChange={(e) => set("successMessage", e.target.value)}
        />
      </div>
    </div>
  );
}
