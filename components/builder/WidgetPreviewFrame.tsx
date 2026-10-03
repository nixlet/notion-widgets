export default function WidgetPreviewFrame({
  transparent,
  children,
}: {
  transparent: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
        Preview - as it will look embedded in Notion
      </p>
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900/40">
        <div
          className={`rounded-xl p-4 ${
            transparent ? "" : "bg-white shadow-sm dark:bg-neutral-900"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
