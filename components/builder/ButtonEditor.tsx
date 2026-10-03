import type { ButtonConfig } from "@/lib/types";
import { FONT_OPTIONS } from "@/lib/fonts";
import { field, input, label as labelCls, select, row, checkboxRow, smallBtn, sectionTitle } from "./formClasses";

const ANGLE_PRESETS: { label: string; value: number }[] = [
  { label: "↑", value: 0 },
  { label: "↗", value: 45 },
  { label: "→", value: 90 },
  { label: "↘", value: 135 },
  { label: "↓", value: 180 },
];

const WEIGHT_OPTIONS = [
  { value: 400, label: "Regular (400)" },
  { value: 500, label: "Medium (500)" },
  { value: 600, label: "Semibold (600)" },
  { value: 700, label: "Bold (700)" },
  { value: 800, label: "Extrabold (800)" },
];

const GLOW_POSITIONS: { value: ButtonConfig["cornerGlowPosition"]; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
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

      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <label className={labelCls}>Subtext (shown inside the button, under the label)</label>
        <input
          className={input}
          value={config.subLabel ?? ""}
          onChange={(e) => set("subLabel", e.target.value)}
          placeholder="e.g. Takes 2 minutes"
          maxLength={100}
        />
        {config.subLabel && (
          <div className={row}>
            <div>
              <label className={labelCls}>Color</label>
              <input
                type="color"
                className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
                value={config.subLabelColor}
                onChange={(e) => set("subLabelColor", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Size ({config.subLabelSize}px)</label>
              <input
                type="range"
                min={8}
                max={48}
                className="w-full accent-blue-600"
                value={config.subLabelSize}
                onChange={(e) => set("subLabelSize", Number(e.target.value))}
              />
            </div>
          </div>
        )}
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

        <div>
          <label className={labelCls}>
            Background opacity ({config.backgroundOpacity}%)
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            className="w-full accent-blue-600"
            value={config.backgroundOpacity}
            onChange={(e) => set("backgroundOpacity", Number(e.target.value))}
          />
          <p className="mt-1 text-[11px] text-neutral-400">
            Lower this to let the fill show through to whatever it&apos;s sitting on - the text stays fully solid.
          </p>
        </div>
      </div>

      {/* --- Corner accent --- */}
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <label className={checkboxRow}>
          <input
            type="checkbox"
            checked={config.cornerGlow}
            onChange={(e) => set("cornerGlow", e.target.checked)}
          />
          <span className={sectionTitle}>Corner glow</span>
        </label>

        {config.cornerGlow && (
          <>
            <div className={row}>
              <div className="flex-1">
                <label className={labelCls}>Position</label>
                <select
                  className={select}
                  value={config.cornerGlowPosition}
                  onChange={(e) =>
                    set("cornerGlowPosition", e.target.value as ButtonConfig["cornerGlowPosition"])
                  }
                >
                  {GLOW_POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Color</label>
                <input
                  type="color"
                  className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
                  value={config.cornerGlowColor}
                  onChange={(e) => set("cornerGlowColor", e.target.value)}
                />
              </div>
            </div>
            <div className={row}>
              <div className="flex-1">
                <label className={labelCls}>Size ({config.cornerGlowSize}px)</label>
                <input
                  type="range"
                  min={20}
                  max={400}
                  step={10}
                  className="w-full accent-blue-600"
                  value={config.cornerGlowSize}
                  onChange={(e) => set("cornerGlowSize", Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Glow opacity ({config.cornerGlowOpacity}%)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  className="w-full accent-blue-600"
                  value={config.cornerGlowOpacity}
                  onChange={(e) => set("cornerGlowOpacity", Number(e.target.value))}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- Accent line --- */}
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <label className={checkboxRow}>
          <input
            type="checkbox"
            checked={config.accentLine}
            onChange={(e) => set("accentLine", e.target.checked)}
          />
          <span className={sectionTitle}>Accent line under text</span>
        </label>

        {config.accentLine && (
          <div className={row}>
            <div>
              <label className={labelCls}>Color</label>
              <input
                type="color"
                className="h-9 w-14 cursor-pointer rounded-lg border border-neutral-200 dark:border-neutral-700"
                value={config.accentLineColor}
                onChange={(e) => set("accentLineColor", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Thickness (px)</label>
              <input
                type="number"
                min={1}
                max={12}
                className={input}
                value={config.accentLineWidth}
                onChange={(e) => set("accentLineWidth", Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Length (px)</label>
              <input
                type="number"
                min={10}
                max={200}
                className={input}
                value={config.accentLineLength}
                onChange={(e) => set("accentLineLength", Number(e.target.value))}
              />
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

      {/* --- Text style --- */}
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        <p className={sectionTitle}>Text style</p>

        <div className={row}>
          <div className="flex-1">
            <label className={labelCls}>Font</label>
            <select
              className={select}
              value={config.fontFamily}
              onChange={(e) => set("fontFamily", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={labelCls}>Weight</label>
            <select
              className={select}
              value={config.fontWeight}
              onChange={(e) => set("fontWeight", Number(e.target.value))}
            >
              {WEIGHT_OPTIONS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={row}>
          <div className="flex-1">
            <label className={labelCls}>Size (px)</label>
            <input
              type="number"
              min={10}
              max={72}
              className={input}
              value={config.fontSize}
              onChange={(e) => set("fontSize", Number(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Letter spacing (px)</label>
            <input
              type="number"
              step={0.5}
              min={-2}
              max={10}
              className={input}
              value={config.letterSpacing}
              onChange={(e) => set("letterSpacing", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <label className={checkboxRow}>
            <input
              type="checkbox"
              checked={config.uppercase}
              onChange={(e) => set("uppercase", e.target.checked)}
            />
            Uppercase
          </label>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              checked={config.italic}
              onChange={(e) => set("italic", e.target.checked)}
            />
            Italic
          </label>
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
