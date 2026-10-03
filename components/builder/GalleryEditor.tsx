import type { GalleryConfig } from "@/lib/types";
import { newFieldId } from "@/lib/id";
import { field, input, label as labelCls, select, row, smallBtn, smallBtnDanger, sectionTitle } from "./formClasses";

export default function GalleryEditor({
  config,
  onChange,
}: {
  config: GalleryConfig;
  onChange: (c: GalleryConfig) => void;
}) {
  const set = <K extends keyof GalleryConfig>(key: K, value: GalleryConfig[K]) =>
    onChange({ ...config, [key]: value });

  function updateItem(id: string, patch: Partial<GalleryConfig["items"][number]>) {
    set(
      "items",
      config.items.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }

  function addItem() {
    set("items", [...config.items, { id: newFieldId(), imageUrl: "", caption: "" }]);
  }

  function removeItem(id: string) {
    set("items", config.items.filter((it) => it.id !== id));
  }

  return (
    <div className={field}>
      <div>
        <label className={labelCls}>Gallery title (optional)</label>
        <input
          className={input}
          value={config.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Recent work"
        />
      </div>

      <div className={row}>
        <div className="flex-1">
          <label className={labelCls}>Layout</label>
          <select
            className={select}
            value={config.layout}
            onChange={(e) => set("layout", e.target.value as GalleryConfig["layout"])}
          >
            <option value="grid">Grid</option>
            <option value="carousel">Scrolling row</option>
          </select>
        </div>
        {config.layout === "grid" && (
          <div>
            <label className={labelCls}>Columns</label>
            <input
              type="number"
              min={1}
              max={6}
              className={`${input} w-20`}
              value={config.columns}
              onChange={(e) => set("columns", Number(e.target.value) || 1)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className={sectionTitle}>Images</p>
        {config.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <input
              className={input}
              value={item.imageUrl}
              onChange={(e) => updateItem(item.id, { imageUrl: e.target.value })}
              placeholder="Image URL (https://...)"
            />
            <input
              className={input}
              value={item.caption ?? ""}
              onChange={(e) => updateItem(item.id, { caption: e.target.value })}
              placeholder="Caption (optional)"
            />
            <div className="flex gap-2">
              <input
                className={input}
                value={item.link ?? ""}
                onChange={(e) => updateItem(item.id, { link: e.target.value })}
                placeholder="Link when clicked (optional)"
              />
              <button
                type="button"
                className={smallBtnDanger}
                onClick={() => removeItem(item.id)}
                disabled={config.items.length <= 1}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button type="button" className={smallBtn} onClick={addItem}>
          + Add image
        </button>
      </div>
    </div>
  );
}
