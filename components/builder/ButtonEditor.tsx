import type { ButtonConfig } from "@/lib/types";
import { field, input, label as labelCls, select, row, checkboxRow, smallBtn, sectionTitle } from "./formClasses";

const ANGLE_PRESETS: { label: string; value: number }[] = [
  { label: "↑", value: 0 },
  { label: "↗", value: 45 },
  { label: "→", value: 90 },
  { label: "↘", value: 135 },
  { label: "↓", value: 180 },
];

export default function ButtonEditor({
  config,
  onChange,
}: {
  config: ButtonConfig;
  onChange: (c: ButtonConfig) => void;
}) {
  const set = <K extends keyof ButtonConfig>(key: K, value: ButtonConfig[K]) =>
    onChange({ ...config, [key]: value });

  const hasFixedSize = Boolean(config.width || config.height);

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

      {/* --- Background --- */}
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <p className={sectionTitle}>Background</p>

        <select
          className={select}
          value={config.backgroundType}
          onChange={(e) => set("backgroundType", e.target.value as ButtonConfig["backgroundType"])}
        >
          <option value="solid">Solid color</option>
          <option value="gradient">Gradient</option>
        </select>

        {config.backgroundType === "solid" ? (
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
            {config.style === "solid" && (
              <div>
                <label className={labelCls}>Text</label>
                <input
                  type="color"
                  className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
                  value={config.textColor}
                  onChange={(e) => set("textColor", e.target.value)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className={row}>
              <div>
                <label className={labelCls}>Start</label>
                <input
                  type="color"
                  className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
                  value={config.color}
                  onChange={(e) => set("color", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>End</label>
                <input
                  type="color"
                  className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
                  value={config.gradientColor}
                  onChange={(e) => set("gradientColor", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Text</label>
                <input
                  type="color"
                  className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
                  value={config.textColor}
                  onChange={(e) => set("textColor", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Angle ({config.gradientAngle}°)</label>
                <input
                  type="number"
                  min={0}
                  max={360}
                  className={input}
                  value={config.gradientAngle}
                  onChange={(e) => set("gradientAngle", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex gap-1.5">
              {ANGLE_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={smallBtn}
                  onClick={() => set("gradientAngle", p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- Size & shape --- */}
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <p className={sectionTitle}>Size &amp; shape</p>

        <div className={row}>
          <div className="flex-1">
            <label className={labelCls}>Width (px)</label>
            <input
              type="number"
              className={input}
              placeholder="Auto"
              value={config.width ?? ""}
              onChange={(e) => set("width", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Height (px)</label>
            <input
              type="number"
              className={input}
              placeholder="Auto"
              value={config.height ?? ""}
              onChange={(e) => set("height", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Corner radius (px)</label>
            <input
              type="number"
              min={0}
              max={999}
              className={input}
              value={config.borderRadius}
              onChange={(e) => set("borderRadius", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            className={smallBtn}
            onClick={() => {
              const size = config.width ?? config.height ?? 140;
              onChange({ ...config, width: size, height: size });
            }}
          >
            Make it a square
          </button>
          <button type="button" className={smallBtn} onClick={() => set("borderRadius", 24)}>
            Rounded corners
          </button>
          <button type="button" className={smallBtn} onClick={() => set("borderRadius", 999)}>
            Pill shape
          </button>
          <button
            type="button"
            className={smallBtn}
            onClick={() => onChange({ ...config, width: undefined, height: undefined })}
          >
            Reset to auto size
          </button>
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
          disabled={hasFixedSize}
          onChange={(e) => set("fullWidth", e.target.checked)}
        />
        Full width{hasFixedSize && " (ignored while a fixed width is set above)"}
      </label>
    </div>
  );
}
