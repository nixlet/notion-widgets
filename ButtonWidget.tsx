import type { ButtonConfig } from "@/lib/types";
import { getFont, googleFontsUrl } from "@/lib/fonts";

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
    subLabel,
    subLabelColor,
    subLabelSize,
    url,
    style,
    color,
    openInNewTab,
    fullWidth,
    description,
    backgroundType,
    gradientColor,
    gradientAngle,
    backgroundOpacity,
    textColor,
    cornerGlow,
    cornerGlowColor,
    cornerGlowPosition,
    cornerGlowSize,
    cornerGlowOpacity,
    accentLine,
    accentLineColor,
    accentLineWidth,
    accentLineLength,
    width,
    height,
    borderRadius,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    uppercase,
    italic,
  } = config;

  const hasFixedSize = Boolean(width || height);
  const font = getFont(fontFamily);
  const fontUrl = googleFontsUrl(font);

  // The fill (solid color or gradient) lives on its own layer so
  // `backgroundOpacity` can fade it without touching the text or border.
  let bgLayerStyle: React.CSSProperties;
  let borderStyle: React.CSSProperties = {};
  let resolvedTextColor: string;

  if (backgroundType === "gradient") {
    bgLayerStyle = {
      backgroundImage: `linear-gradient(${gradientAngle}deg, ${color}, ${gradientColor})`,
    };
    resolvedTextColor = textColor;
  } else if (style === "outline") {
    bgLayerStyle = { backgroundColor: "transparent" };
    borderStyle = { border: `1.5px solid ${color}` };
    resolvedTextColor = color;
  } else if (style === "ghost") {
    bgLayerStyle = { backgroundColor: withAlpha(color, "1a") };
    resolvedTextColor = color;
  } else {
    bgLayerStyle = { backgroundColor: color };
    resolvedTextColor = textColor;
  }

  const sizeStyle: React.CSSProperties = {
    ...(width ? { width: `${width}px`, flex: "none" } : {}),
    ...(height ? { height: `${height}px` } : {}),
    borderRadius: `${borderRadius}px`,
  };

  const typographyStyle: React.CSSProperties = {
    fontFamily: font.cssFamily,
    fontSize: `${fontSize}px`,
    fontWeight,
    letterSpacing: `${letterSpacing}px`,
    textTransform: uppercase ? "uppercase" : "none",
    fontStyle: italic ? "italic" : "normal",
  };

  const glowOffset = -(cornerGlowSize * 0.4);
  const glowStyle: React.CSSProperties = {
    position: "absolute",
    width: `${cornerGlowSize}px`,
    height: `${cornerGlowSize}px`,
    borderRadius: "9999px",
    background: `radial-gradient(circle, ${cornerGlowColor}, transparent 70%)`,
    opacity: cornerGlowOpacity / 100,
    ...(cornerGlowPosition.startsWith("top") ? { top: glowOffset } : { bottom: glowOffset }),
    ...(cornerGlowPosition.endsWith("left") ? { left: glowOffset } : { right: glowOffset }),
  };

  return (
    <div className={`flex flex-col gap-2 ${fullWidth && !hasFixedSize ? "w-full" : "items-start"}`}>
      {fontUrl && <link rel="stylesheet" href={fontUrl} />}
      <a
        href={url}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        onClick={preview ? (e) => e.preventDefault() : undefined}
        className={`relative inline-flex items-center justify-center overflow-hidden px-5 py-3 text-center leading-snug shadow-sm transition-transform active:scale-[0.98] ${
          fullWidth && !hasFixedSize ? "w-full" : ""
        }`}
        style={{ ...sizeStyle, ...borderStyle, color: resolvedTextColor }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ ...bgLayerStyle, opacity: backgroundOpacity / 100 }} />
        {cornerGlow && <span aria-hidden className="pointer-events-none" style={glowStyle} />}
        <span className="relative z-10 flex flex-col items-center gap-1.5">
          <span style={typographyStyle}>{label}</span>
          {accentLine && (
            <span
              aria-hidden
              style={{
                width: `${accentLineLength}px`,
                height: `${accentLineWidth}px`,
                backgroundColor: accentLineColor,
                borderRadius: "999px",
              }}
            />
          )}
          {subLabel && (
            <span
              style={{
                fontFamily: font.cssFamily,
                fontSize: `${subLabelSize}px`,
                color: subLabelColor,
                fontWeight: 400,
              }}
            >
              {subLabel}
            </span>
          )}
        </span>
      </a>
      {description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      )}
    </div>
  );
}
