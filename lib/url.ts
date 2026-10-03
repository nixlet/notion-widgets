// Shared URL safety check, used wherever a user-supplied link is saved
// (button destination, gallery image/link). Blocks dangerous schemes like
// `javascript:` or `data:` that could otherwise turn a widget into a
// self-XSS / phishing vector for whoever clicks it.
const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export function isSafeUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Checks every link embedded in a widget config and returns a list of
 * field-level error messages (empty = all clear). Only called at
 * save-time (POST/PUT) - never retroactively on read, so widgets saved
 * before this check existed keep rendering exactly as they do today.
 */
export function findUnsafeUrls(type: string, config: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (type === "button" && typeof config.url === "string" && config.url.length > 0) {
    if (!isSafeUrl(config.url)) {
      errors.push("Button link must be a normal http:// or https:// URL.");
    }
  }

  if (type === "gallery" && Array.isArray(config.items)) {
    for (const item of config.items as Record<string, unknown>[]) {
      if (typeof item.imageUrl === "string" && item.imageUrl.length > 0 && !isSafeUrl(item.imageUrl)) {
        errors.push("Every gallery image URL must be a normal http:// or https:// URL.");
        break;
      }
    }
    for (const item of config.items as Record<string, unknown>[]) {
      if (typeof item.link === "string" && item.link.length > 0 && !isSafeUrl(item.link)) {
        errors.push("Every gallery item link must be a normal http:// or https:// URL.");
        break;
      }
    }
  }

  return errors;
}
