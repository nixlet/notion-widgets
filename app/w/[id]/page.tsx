import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { parseConfigForType } from "@/lib/types";
import ButtonWidget from "@/components/widgets/ButtonWidget";
import FormWidget from "@/components/widgets/FormWidget";
import GalleryWidget from "@/components/widgets/GalleryWidget";
import ProgressWidget from "@/components/widgets/ProgressWidget";

export const dynamic = "force-dynamic"; // always read fresh widget state

export default async function PublicWidgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const widget = await store.getWidget(id);
  if (!widget) notFound();

  const config = parseConfigForType(widget.type, widget.config);

  const bg = widget.transparent
    ? "bg-transparent"
    : "bg-white dark:bg-neutral-900";

  return (
    <div className={`embed-root min-h-screen w-full ${bg} p-3`}>
      {widget.type === "button" && (
        <ButtonWidget config={config as any} />
      )}
      {widget.type === "form" && (
        <FormWidget widgetId={widget.id} config={config as any} />
      )}
      {widget.type === "gallery" && (
        <GalleryWidget config={config as any} />
      )}
      {widget.type === "progress" && (
        <ProgressWidget config={config as any} />
      )}
    </div>
  );
}
