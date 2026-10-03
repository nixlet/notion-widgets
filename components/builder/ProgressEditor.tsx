import type { ProgressConfig } from "@/lib/types";
import { field, input, label as labelCls, select, row } from "./formClasses";

export default function ProgressEditor({
  config,
  onChange,
}: {
  config: ProgressConfig;
  onChange: (c: ProgressConfig) => void;
}) {
  const set = <K extends keyof ProgressConfig>(key: K, value: ProgressConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className={field}>
      <div className={row}>
        <div className="flex-1">
          <label className={labelCls}>Type</label>
          <select
            className={select}
            value={config.mode}
            onChange={(e) => set("mode", e.target.value as ProgressConfig["mode"])}
          >
            <option value="bar">Progress bar</option>
            <option value="ring">Progress ring</option>
            <option value="countdown">Countdown timer</option>
            <option value="counter">Simple counter</option>
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

      <div>
        <label className={labelCls}>Label</label>
        <input
          className={input}
          value={config.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder="Reading goal"
        />
      </div>

      {(config.mode === "bar" || config.mode === "ring") && (
        <div className={row}>
          <div className="flex-1">
            <label className={labelCls}>Current</label>
            <input
              type="number"
              className={input}
              value={config.current ?? 0}
              onChange={(e) => set("current", Number(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>Target</label>
            <input
              type="number"
              className={input}
              value={config.target ?? 100}
              onChange={(e) => set("target", Number(e.target.value))}
            />
          </div>
          <div className="w-24">
            <label className={labelCls}>Unit</label>
            <input
              className={input}
              value={config.unit ?? ""}
              onChange={(e) => set("unit", e.target.value)}
              placeholder="books"
            />
          </div>
        </div>
      )}

      {config.mode === "countdown" && (
        <div>
          <label className={labelCls}>Target date &amp; time</label>
          <input
            type="datetime-local"
            className={input}
            value={config.targetDate ? config.targetDate.slice(0, 16) : ""}
            onChange={(e) =>
              set("targetDate", e.target.value ? new Date(e.target.value).toISOString() : "")
            }
          />
        </div>
      )}

      {config.mode === "counter" && (
        <div>
          <label className={labelCls}>Value</label>
          <input
            type="number"
            className={input}
            value={config.value ?? 0}
            onChange={(e) => set("value", Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}
