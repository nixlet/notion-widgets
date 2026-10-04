import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { parseConfigForType } from "@/lib/types";
import WidgetEditor from "@/components/builder/WidgetEditor";

export default async function EditWidgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const widget = await store.getWidget(id);
  if (!widget) notFound();

  const config = parseConfigForType(widget.type, widget.config);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
        Edit &quot;{widget.name}&quot;
      </h1>
      {/*
        key={widget.id} forces React to fully remount the editor when you
        navigate from editing one widget straight to editing another
        (client-side navigation otherwise reuses the same component
        instance, so its in-memory state - like a color you just changed -
        would stick around and silently get saved onto the next widget).
      */}
      <WidgetEditor key={widget.id} type={widget.type} existing={widget} defaultConfig={config} />
    </div>
  );
}
