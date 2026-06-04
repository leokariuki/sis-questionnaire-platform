import type { QuestionnaireDefinition } from "@/lib/types";

/** POST-TEST — Kids 9–12 (spec §24). Generated from shared config. */
export const POST_KIDS_9_12: QuestionnaireDefinition = {
  id: "post-kids-9-12",
  type: "POST",
  ageGroup: "KIDS_9_12",
  title: "Post-Test — Kids 9–12",
  dbSheet: "POST_KIDS_9_12",
  reportTitle: "SIS Skills Profile – Post-Test",
  includesBackground: false,
  includesTransfer: true,
  reflection: {
    icon: "💬",
    prompt: "What did you learn the most? Why is it important?",
    dbField: "Reflection_Open",
  },
};
