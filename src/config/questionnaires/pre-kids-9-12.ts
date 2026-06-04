import type { QuestionnaireDefinition } from "@/lib/types";

/** PRE-TEST — Kids 9–12 (spec §24). Generated from shared config. */
export const PRE_KIDS_9_12: QuestionnaireDefinition = {
  id: "pre-kids-9-12",
  type: "PRE",
  ageGroup: "KIDS_9_12",
  title: "Pre-Test — Kids 9–12",
  dbSheet: "PRE_KIDS_9_12",
  reportTitle: "SIS Skills Profile – Pre-Test",
  includesBackground: true,
  includesTransfer: false,
  reflection: {
    icon: "💬",
    prompt: "What would you like to learn at SIS?",
    dbField: "Reflection_Open",
  },
};
