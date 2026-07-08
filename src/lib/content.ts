import type { AgeGroup, ScaleOption } from "@/lib/types";

/**
 * Runtime content overrides (the "Google Sheet content editor").
 *
 * The WordPress plugin reads an editable Google Sheet and serves it at
 * `/sis/v1/content`. The static app loads that once at startup and lets the
 * team change question wording and answer labels without touching code.
 *
 * Everything falls back to the built-in defaults, so if the sheet is missing,
 * unreachable, or a cell is blank, the original wording is used. Non-technical
 * editing is therefore safe — a mistake can never blank out the questionnaire.
 */

interface ContentOverrides {
  /** Per-item wording, keyed by item code then age group. */
  items: Record<string, Partial<Record<AgeGroup, string>>>;
  /** Answer-scale labels, keyed by the numeric value (1–6). */
  scale: Record<string, string>;
  /** Code-legend names: { dorm|track|club|family: { LETTER: name } }. */
  codes: Record<string, Record<string, string>>;
}

let CONTENT: ContentOverrides = { items: {}, scale: {}, codes: {} };

/** Install overrides fetched from the WordPress `/sis/v1/content` endpoint. */
export function setContent(data: unknown): void {
  if (!data || typeof data !== "object") return;
  const d = data as Partial<ContentOverrides>;
  CONTENT = {
    items: d.items && typeof d.items === "object" ? (d.items as ContentOverrides["items"]) : {},
    scale: d.scale && typeof d.scale === "object" ? (d.scale as ContentOverrides["scale"]) : {},
    codes: d.codes && typeof d.codes === "object" ? (d.codes as ContentOverrides["codes"]) : {},
  };
}

/** Team-edited name for a code letter (dorm/track/club/family), or the default. */
export function codeName(kind: "dorm" | "track" | "club" | "family", letter: string, fallback: string): string {
  const v = CONTENT.codes[kind]?.[letter];
  return v && v.trim() ? v : fallback;
}

/** Overridden wording for an item, or the built-in default. */
export function itemWording(code: string, age: AgeGroup, fallback: string): string {
  const v = CONTENT.items[code]?.[age];
  return v && v.trim() ? v : fallback;
}

/** Apply any overridden labels to a copy of the answer scale. */
export function applyScale(options: ScaleOption[]): ScaleOption[] {
  return options.map((o) => {
    const v = CONTENT.scale[String(o.value)];
    return v && v.trim() ? { ...o, label: v } : o;
  });
}
