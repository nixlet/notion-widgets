export default function WidgetNotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 text-center">
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Widget not found
        </p>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          It may have been deleted, or the link is incorrect.
        </p>
      </div>
    </div>
  );
}
