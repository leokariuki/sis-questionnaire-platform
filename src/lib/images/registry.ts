import type { AgeGroup } from "@/lib/types";
import { COMPETENCY_ITEMS, ITEM_BY_CODE } from "@/config/items";

/**
 * Image architecture (spec §10). Every competency item already carries a
 * culturally-neutral, text-free prompt for both age groups (see config/items.ts).
 * This module exposes them as a registry and defines the generation contract.
 *
 * Required first-wave illustrations (spec priority): one anchor per competency.
 */
export const PRIORITY_IMAGE_CODES = ["COM1", "LEAD1", "EMO1", "CT1", "CRE1", "AUTO1", "TEAM1"];

export interface ImagePromptEntry {
  code: string;
  competencyId: string;
  alt: string;
  prompts: Record<AgeGroup, string>;
  /** Expected asset paths once generated. */
  assets: Record<AgeGroup, string>;
}

export const IMAGE_REGISTRY: ImagePromptEntry[] = COMPETENCY_ITEMS.map((item) => ({
  code: item.code,
  competencyId: item.competencyId,
  alt: item.imageAlt,
  prompts: item.imagePrompt,
  assets: {
    KIDS_9_12: `/images/${item.code}_kids.png`,
    TEENS_13_17: `/images/${item.code}_teens.png`,
  },
}));

export function getImagePrompt(code: string, age: AgeGroup): string | null {
  return ITEM_BY_CODE[code]?.imagePrompt[age] ?? null;
}

/** Negative prompt enforcing the spec's image rules (§10). */
export const NEGATIVE_PROMPT =
  "text, words, letters, numbers, watermark, logo, signature, captions, stereotypes, " +
  "identifiable real people, celebrities, scary or unsafe content, busy cluttered background";
