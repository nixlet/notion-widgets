import Link from "next/link";

const TYPES: { type: string; title: string; description: string; emoji: string }[] = [
  {
    type: "button",
    title: "Button / link card",
    description: "A styled clickable button that links out - great for a dashboard CTA.",
    emoji: "🔘",
  },
  {
    type: "form",
    title: "Form",
    description: "Collect input with text, dropdown, and checkbox fields.",
    emoji: "📝",
  },
  {
    type: "gallery",
    title: "Gallery",
    description: "A grid or scrolling row of images, each optionally linking out.",
    emoji: "🖼️",
  },
  {
    type: "progress",
    title: "Progress / counter / tracker",
    description: "A progress bar, ring, countdown timer, or simple counter.",
    emoji: "📊",
  },
];

export default function NewWidgetPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
        What do you want to build?
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TYPES.map((t) => (
          <Link
            key={t.type}
            href={`/new/${t.type}`}
            className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-blue-400 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <span className="text-2xl">{t.emoji}</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
              {t.title}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {t.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
