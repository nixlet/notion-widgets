import { z } from "zod";

// ---------- Button ----------
export const ButtonConfigSchema = z.object({
  label: z.string().min(1).max(60),
  url: z.string().min(1),
  style: z.enum(["solid", "outline", "ghost"]).default("solid"),
  color: z.string().default("#2563eb"),
  openInNewTab: z.boolean().default(true),
  fullWidth: z.boolean().default(false),
  description: z.string().max(140).optional(),
  // Background: a flat color (uses `style`/`color` above) or a gradient.
  backgroundType: z.enum(["solid", "gradient"]).default("solid"),
  gradientColor: z.string().default("#7c3aed"),
  gradientAngle: z.number().min(0).max(360).default(135),
  // 0-100. Lets the background show through to whatever it's embedded on
  // (Notion page, dark/light mode, etc) without fading the text.
  backgroundOpacity: z.number().min(0).max(100).default(100),
  // Text color override - useful once the background is custom (esp. gradients).
  textColor: z.string().default("#ffffff"),
  // Soft decorative color glow bleeding from one corner, purely visual.
  cornerGlow: z.boolean().default(false),
  cornerGlowColor: z.string().default("#22d3ee"),
  cornerGlowPosition: z
    .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
    .default("top-left"),
  cornerGlowSize: z.number().int().min(20).max(400).default(160),
  cornerGlowOpacity: z.number().min(0).max(100).default(60),
  // Small accent line under the label.
  accentLine: z.boolean().default(false),
  accentLineColor: z.string().default("#22d3ee"),
  accentLineWidth: z.number().int().min(1).max(12).default(3),
  accentLineLength: z.number().int().min(10).max(200).default(40),
  // Explicit size, for a fixed tile/square button. Leave unset for a
  // button that just hugs its label (or stretches via fullWidth).
  width: z.number().int().min(40).max(800).optional(),
  height: z.number().int().min(32).max(800).optional(),
  borderRadius: z.number().int().min(0).max(999).default(12),
  // Typography for the label.
  fontFamily: z.string().default("system"),
  fontSize: z.number().int().min(10).max(72).default(14),
  fontWeight: z.number().int().min(100).max(900).default(500),
  letterSpacing: z.number().min(-2).max(10).default(0),
  uppercase: z.boolean().default(false),
  italic: z.boolean().default(false),
});
export type ButtonConfig = z.infer<typeof ButtonConfigSchema>;

// ---------- Form ----------
export const FormFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(80),
  type: z.enum(["text", "email", "textarea", "select", "checkbox", "number"]),
  required: z.boolean().default(false),
  placeholder: z.string().max(100).optional(),
  options: z.array(z.string()).optional(), // for select
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const FormConfigSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(300).optional(),
  fields: z.array(FormFieldSchema).min(1),
  submitLabel: z.string().min(1).max(40).default("Submit"),
  successMessage: z.string().max(200).default("Thanks! Your response was recorded."),
  accentColor: z.string().default("#2563eb"),
});
export type FormConfig = z.infer<typeof FormConfigSchema>;

// ---------- Gallery ----------
export const GalleryItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string().min(1),
  caption: z.string().max(140).optional(),
  link: z.string().optional(),
});
export type GalleryItem = z.infer<typeof GalleryItemSchema>;

export const GalleryConfigSchema = z.object({
  title: z.string().max(100).optional(),
  layout: z.enum(["grid", "carousel"]).default("grid"),
  columns: z.number().int().min(1).max(6).default(3),
  items: z.array(GalleryItemSchema).min(1),
});
export type GalleryConfig = z.infer<typeof GalleryConfigSchema>;

// ---------- Progress / counter / tracker ----------
export const ProgressConfigSchema = z.object({
  mode: z.enum(["bar", "ring", "countdown", "counter"]).default("bar"),
  label: z.string().max(100).default(""),
  color: z.string().default("#2563eb"),
  // bar / ring
  current: z.number().optional(),
  target: z.number().optional(),
  unit: z.string().max(20).optional(),
  // countdown
  targetDate: z.string().optional(), // ISO date-time
  // counter
  value: z.number().optional(),
});
export type ProgressConfig = z.infer<typeof ProgressConfigSchema>;

// ---------- Users (admin dashboard accounts) ----------
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export interface UserSummary {
  id: string;
  email: string;
  createdAt: string;
}

// ---------- Widget envelope ----------
export const WidgetTypeSchema = z.enum(["button", "form", "gallery", "progress"]);
export type WidgetType = z.infer<typeof WidgetTypeSchema>;

export const WidgetConfigByType = {
  button: ButtonConfigSchema,
  form: FormConfigSchema,
  gallery: GalleryConfigSchema,
  progress: ProgressConfigSchema,
};

export const WidgetSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  name: z.string().min(1).max(80),
  transparent: z.boolean().default(true),
  config: z.unknown(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Widget = z.infer<typeof WidgetSchema>;

export type WidgetConfig = ButtonConfig | FormConfig | GalleryConfig | ProgressConfig;

export function parseConfigForType(type: WidgetType, config: unknown): WidgetConfig {
  const schema = WidgetConfigByType[type];
  return schema.parse(config) as WidgetConfig;
}

export interface WidgetSummary {
  id: string;
  type: WidgetType;
  name: string;
  updatedAt: string;
  submissionCount?: number;
}

export interface Submission {
  id: string;
  widgetId: string;
  data: Record<string, unknown>;
  submittedAt: string;
}
