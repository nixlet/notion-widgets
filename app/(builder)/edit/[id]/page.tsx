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
      <WidgetEditor type={widget.type} existing={widget} defaultConfig={config} />
    </div>
  );
}
