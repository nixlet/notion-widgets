import type { BorderSide, ButtonConfig } from "@/lib/types";
import { getFont, googleFontsUrl } from "@/lib/fonts";

function withAlpha(hex: string, alpha: string) {
  // Best-effort: if it's a hex color, append alpha; otherwise return as-is.
  if (/^#([0-9a-f]{6})$/i.test(hex)) return `${hex}${alpha}`;
  return hex;
}

// One absolutely-positioned bar per enabled edge, each its own flat color or
// 2-stop gradient running along that edge. Relies on the button's own
// `overflow: hidden` + border-radius to get clipped into the right shape.
function borderBarStyle(
  side: BorderSide,
  edge: "top" | "bottom" | "left" | "right"
): React.CSSProperties | null {
  if (!side.enabled) return null;
  const horizontal = edge === "top" || edge === "bottom";
  const background = side.gradient
    ? `linear-gradient(${horizontal ? "90deg" : "180deg"}, ${side.color}, ${side.gradientColor})`
    : side.color;
  const base: React.CSSProperties = { position: "absolute", background };
  if (edge === "top") return { ...base, top: 0, left: 0, right: 0, height: side.thickness };
  if (edge === "bottom") return { ...base, bottom: 0, left: 0, right: 0, height: side.thickness };
  if (edge === "left") return { ...base, top: 0, bottom: 0, left: 0, width: side.thickness };
  return { ...base, top: 0, bottom: 0, right: 0, width: side.thickness };
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
    gradientColor3,
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
    contentGap,
    borderTop,
    borderBottom,
    borderLeft,
    borderRight,
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
    const stops = gradientColor3
      ? `${color}, ${gradientColor}, ${gradientColor3}`
      : `${color}, ${gradientColor}`;
    bgLayerStyle = {
      backgroundImage: `linear-gradient(${gradientAngle}deg, ${stops})`,
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
        {borderTop.enabled && (
          <span aria-hidden className="pointer-events-none" style={borderBarStyle(borderTop, "top")!} />
        )}
        {borderBottom.enabled && (
          <span aria-hidden className="pointer-events-none" style={borderBarStyle(borderBottom, "bottom")!} />
        )}
        {borderLeft.enabled && (
          <span aria-hidden className="pointer-events-none" style={borderBarStyle(borderLeft, "left")!} />
        )}
        {borderRight.enabled && (
          <span aria-hidden className="pointer-events-none" style={borderBarStyle(borderRight, "right")!} />
        )}
        <span className="relative z-10 flex flex-col items-center" style={{ gap: `${contentGap}px` }}>
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
