import type { ButtonConfig } from "@/lib/types";
import { field, input, label as labelCls, select, row, checkboxRow } from "./formClasses";

export default function ButtonEditor({
  config,
  onChange,
}: {
  config: ButtonConfig;
  onChange: (c: ButtonConfig) => void;
}) {
  const set = <K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className={field}>
      <div>
        <label className={labelCls}>Button label</label>
        <input
          className={input}
          value={config.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder="Book a call"
        />
      </div>

      <div>
        <label className={labelCls}>Link URL</label>
        <input
          className={input}
          value={config.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://cal.com/you"
        />
      </div>

      <div>
        <label className={labelCls}>Helper text (optional)</label>
        <input
          className={input}
          value={config.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Replies within one business day"
        />
      </div>

      <div className={row}>
        <div className="flex-1">
          <label className={labelCls}>Style</label>
          <select
            className={select}
            value={config.style}
            onChange={(e) => set("style", e.target.value as ButtonConfig["style"])}
          >
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Color</label>
          <input
            type="color"
            className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
            value={config.color}
            onChange={(e) => set("color", e.target.value)}
          />
        </div>
      </div>

      <label className={checkboxRow}>
        <input
          type="checkbox"
          checked={config.openInNewTab}
          onChange={(e) => set("openInNewTab", e.target.checked)}
        />
        Open link in a new tab
      </label>

      <label className={checkboxRow}>
        <input
          type="checkbox"
          checked={config.fullWidth}
          onChange={(e) => set("fullWidth", e.target.checked)}
        />
        Full width
      </label>
    </div>
  );
}
