import type { QuestionnaireDefinition } from "@/lib/types";

/** The pilot questionnaire: PRE-TEST — Teens 13–17 (spec §24 flow). */
export const PRE_TEENS_13_17: QuestionnaireDefinition = {
  id: "pre-teens-13-17",
  type: "PRE",
  ageGroup: "TEENS_13_17",
  title: "Pre-Test — Teens 13–17",
  dbSheet: "PRE_TEENS_13_17",
  reportTitle: "SIS Skills Profile – Pre-Test",
  includesBackground: true,
  includesTransfer: false,
  reflection: {
    icon: "💬",
    prompt: "What would you like to learn at SIS?",
    dbField: "Reflection_Open",
  },
};
