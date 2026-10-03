import type { GalleryConfig } from "@/lib/types";

function Item({ item }: { item: GalleryConfig["items"][number] }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.imageUrl}
      alt={item.caption ?? ""}
      className="h-full w-full rounded-lg object-cover"
      loading="lazy"
    />
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {item.link ? (
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
      {item.caption && (
        <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">
          {item.caption}
        </p>
      )}
    </div>
  );
}

export default function GalleryWidget({ config }: { config: GalleryConfig }) {
  const { title, layout, columns, items } = config;

  return (
    <div className="flex w-full flex-col gap-3">
      {title && (
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {title}
        </h3>
      )}

      {layout === "grid" ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {items.map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex w-full gap-3 overflow-x-auto pb-1">
          {items.map((item) => (
            <div key={item.id} className="w-36 flex-shrink-0">
              <Item item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
