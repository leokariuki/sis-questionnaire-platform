import type { QuestionnaireDefinition } from "@/lib/types";

/** POST-TEST — Teens 13–17 (spec §24). Generated from shared config. */
export const POST_TEENS_13_17: QuestionnaireDefinition = {
  id: "post-teens-13-17",
  type: "POST",
  ageGroup: "TEENS_13_17",
  title: "Post-Test — Teens 13–17",
  dbSheet: "POST_TEENS_13_17",
  reportTitle: "SIS Skills Profile – Post-Test",
  includesBackground: false,
  includesTransfer: true,
  reflection: {
    icon: "💬",
    prompt: "What did you learn the most? Why is it important?",
    dbField: "Reflection_Open",
  },
};
