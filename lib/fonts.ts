// A small curated set of fonts for widget text. "system" uses the app's
// normal UI font (no extra network request - best default for Notion
// embeds). Everything else loads from Google Fonts on demand.
export interface FontOption {
  id: string;
  label: string;
  cssFamily: string;
  googleFontsParam?: string; // the `family=...` segment for the Google Fonts URL
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "system",
    label: "System default",
    cssFamily:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: "inter",
    label: "Inter",
    cssFamily: "'Inter', sans-serif",
    googleFontsParam: "Inter:wght@400;500;600;700;800",
  },
  {
    id: "poppins",
    label: "Poppins",
    cssFamily: "'Poppins', sans-serif",
    googleFontsParam: "Poppins:wght@400;500;600;700;800",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    cssFamily: "'Montserrat', sans-serif",
    googleFontsParam: "Montserrat:wght@400;500;600;700;800",
  },
  {
    id: "roboto",
    label: "Roboto",
    cssFamily: "'Roboto', sans-serif",
    googleFontsParam: "Roboto:wght@400;500;700;900",
  },
  {
    id: "lato",
    label: "Lato",
    cssFamily: "'Lato', sans-serif",
    googleFontsParam: "Lato:wght@400;700;900",
  },
  {
    id: "nunito",
    label: "Nunito",
    cssFamily: "'Nunito', sans-serif",
    googleFontsParam: "Nunito:wght@400;600;700;800",
  },
  {
    id: "raleway",
    label: "Raleway",
    cssFamily: "'Raleway', sans-serif",
    googleFontsParam: "Raleway:wght@400;500;600;700;800",
  },
  {
    id: "oswald",
    label: "Oswald",
    cssFamily: "'Oswald', sans-serif",
    googleFontsParam: "Oswald:wght@400;500;600;700",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    cssFamily: "'Playfair Display', serif",
    googleFontsParam: "Playfair+Display:wght@400;500;600;700;800",
  },
  {
    id: "merriweather",
    label: "Merriweather",
    cssFamily: "'Merriweather', serif",
    googleFontsParam: "Merriweather:wght@400;700;900",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    cssFamily: "'JetBrains Mono', monospace",
    googleFontsParam: "JetBrains+Mono:wght@400;500;700",
  },
];

export function getFont(id: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
}

export function googleFontsUrl(font: FontOption): string | null {
  if (!font.googleFontsParam) return null;
  return `https://fonts.googleapis.com/css2?family=${font.googleFontsParam}&display=swap`;
}
