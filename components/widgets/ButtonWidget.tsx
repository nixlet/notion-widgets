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
  const {
    label,
    url,
    style,
    color,
    openInNewTab,
    fullWidth,
    description,
    backgroundType,
    gradientColor,
    gradientAngle,
    textColor,
    width,
    height,
    borderRadius,
  } = config;

  const hasFixedSize = Boolean(width || height);

  const background: React.CSSProperties =
    backgroundType === "gradient"
      ? {
          backgroundImage: `linear-gradient(${gradientAngle}deg, ${color}, ${gradientColor})`,
          color: textColor,
        }
      : style === "outline"
        ? { backgroundColor: "transparent", color, border: `1.5px solid ${color}` }
        : style === "ghost"
          ? { backgroundColor: withAlpha(color, "1a"), color }
          : { backgroundColor: color, color: textColor };

  const sizeStyle: React.CSSProperties = {
    ...(width ? { width: `${width}px`, flex: "none" } : {}),
    ...(height ? { height: `${height}px` } : {}),
    borderRadius: `${borderRadius}px`,
  };

  return (
    <div className={`flex flex-col gap-2 ${fullWidth && !hasFixedSize ? "w-full" : "items-start"}`}>
      <a
        href={url}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        onClick={preview ? (e) => e.preventDefault() : undefined}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-center text-sm font-medium leading-snug shadow-sm transition-transform active:scale-[0.98] ${
          fullWidth && !hasFixedSize ? "w-full" : ""
        }`}
        style={{ ...background, ...sizeStyle }}
      >
        {label}
      </a>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
    </div>
  );
}
