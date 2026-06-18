import type { ScaleOption } from "@/lib/types";

/** Maximum value on the competency / transfer scale. */
export const SCALE_MAX = 6;

/** The shared 1–6 competency / transfer scale (spec §8). */
export const ANSWER_SCALE: ScaleOption[] = [
  { value: 1, label: "Not true" },
  { value: 2, label: "A little true" },
  { value: 3, label: "Sometimes true" },
  { value: 4, label: "Mostly true" },
  { value: 5, label: "Quite true" },
  { value: 6, label: "Very true" },
];

export const SCALE_INTRO = {
  icon: "📊",
  title: "How true is this for you?",
  helper: "Choose one answer.",
  options: ANSWER_SCALE,
};

/** English-confidence scale used by background question BG5 (spec §17). */
export const CONFIDENCE_SCALE: ScaleOption[] = [
  { value: 1, label: "Not confident" },
  { value: 2, label: "A little confident" },
  { value: 3, label: "Sometimes confident" },
  { value: 4, label: "Mostly confident" },
  { value: 5, label: "Very confident" },
];
