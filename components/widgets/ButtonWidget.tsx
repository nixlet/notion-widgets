import type { ButtonConfig } from "@/lib/types";

function withAlpha(hex: string, alpha: string) {
  // Best-effort: if it's a hex color, append alpha; otherwise return as-is.
  if (/^#([0-9a-f]{6})$/i.test(hex)) return `${hex}${alpha}`;
  return hex;
}

export default function ButtonWidget({
  config,
  preview,
}: {
  config: ButtonConfig;
  preview?: boolean;
}) {
  const { label, url, style, color, openInNewTab, fullWidth, description } = config;

  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-transform active:scale-[0.98] shadow-sm";

  const styleClasses: Record<string, React.CSSProperties> = {
    solid: { backgroundColor: color, color: "#fff" },
    outline: { backgroundColor: "transparent", color, border: `1.5px solid ${color}` },
    ghost: { backgroundColor: withAlpha(color, "1a"), color },
  };

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? "w-full" : "items-start"}`}>
      <a
        href={url}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        onClick={preview ? (e) => e.preventDefault() : undefined}
        className={`${base} ${fullWidth ? "w-full" : ""}`}
        style={styleClasses[style] ?? styleClasses.solid}
      >
        {label}
      </a>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
    </div>
  );
}
