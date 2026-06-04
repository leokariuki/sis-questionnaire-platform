import type { BackgroundQuestion } from "@/lib/types";
import { CONFIDENCE_SCALE } from "./scale";

/** Background questions BG1–BG5 (spec §17). PRE tests only. */
export const BACKGROUND_QUESTIONS: BackgroundQuestion[] = [
  {
    kind: "multi",
    code: "BG1",
    icon: "🌍",
    prompt: "Main language(s)",
    helper: "Choose up to 2.",
    maxChoices: 2,
    options: [
      "English",
      "Spanish",
      "French",
      "German",
      "Italian",
      "Chinese",
      "Arabic",
      "Portuguese",
      "Russian",
      "Other",
    ],
    dbFields: ["Main_Language_1", "Main_Language_2"],
  },
  {
    kind: "single",
    code: "BG2",
    icon: "🌍",
    prompt: "Your English level",
    options: ["Beginner", "Intermediate", "Advanced"],
    dbField: "English_Level",
  },
  {
    kind: "single",
    code: "BG3",
    icon: "🌍",
    prompt: "Have you been to an international camp before?",
    options: ["No", "Yes, once", "Yes, more than once"],
    dbField: "Previous_International_Camp",
  },
  {
    kind: "single",
    code: "BG4",
    icon: "🌍",
    prompt: "Have you stayed away from home without your family before?",
    options: ["No", "A little", "A lot"],
    dbField: "Previous_Stay_Away_From_Home",
  },
  {
    kind: "scale",
    code: "BG5",
    icon: "🌍",
    prompt: "How confident do you feel using English in activities?",
    options: CONFIDENCE_SCALE,
    dbField: "Confidence_Using_English",
  },
];
