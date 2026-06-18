import type { QuestionnaireDefinition, Step } from "@/lib/types";
import { COMPETENCIES } from "@/config/competencies";
import { ITEMS_BY_COMPETENCY } from "@/config/items";
import { BACKGROUND_QUESTIONS } from "@/config/backgroundQuestions";
import { TRANSFER_QUESTIONS } from "@/config/transfer";

/**
 * Builds the ordered list of runner steps for a questionnaire (spec §24).
 *
 * Flow:
 *   intro → code → scale-intro
 *   → [background BG1–BG5]            (PRE only)
 *   → for each competency: section-intro + 6 items
 *   → [transfer TR1–TR4]              (POST only)
 *   → reflection (open)
 *   → review/submit
 *
 * This single function drives all four questionnaires; they differ only in
 * the `includesBackground` / `includesTransfer` flags and age-specific copy.
 */
export function buildSteps(def: QuestionnaireDefinition): Step[] {
  const steps: Step[] = [
    { type: "intro", id: "intro" },
    { type: "code", id: "code" },
  ];

  if (def.includesBackground) {
    for (const q of BACKGROUND_QUESTIONS) {
      steps.push({ type: "background", id: q.code, question: q });
    }
  }

  for (const competency of COMPETENCIES) {
    steps.push({
      type: "section-intro",
      id: `section-${competency.id}`,
      competencyId: competency.id,
    });
    for (const item of ITEMS_BY_COMPETENCY[competency.id]) {
      steps.push({
        type: "competency",
        id: item.code,
        item,
        competencyId: competency.id,
      });
    }
  }

  if (def.includesTransfer) {
    for (const q of TRANSFER_QUESTIONS) {
      if (q.kind === "scale") {
        steps.push({ type: "transfer-scale", id: q.code, question: q });
      } else {
        steps.push({ type: "open", id: q.code, icon: q.icon, prompt: q.prompt, dbField: q.dbField });
      }
    }
  }

  steps.push({
    type: "open",
    id: "reflection",
    icon: def.reflection.icon,
    prompt: def.reflection.prompt,
    dbField: def.reflection.dbField,
  });

  steps.push({ type: "review", id: "review" });

  return steps;
}

/**
 * Steps that count toward the progress bar (questions the student answers).
 * Intro / scale-intro / section-intro / review are navigational, not questions.
 */
export function isAnswerableStep(step: Step): boolean {
  return (
    step.type === "code" ||
    step.type === "background" ||
    step.type === "competency" ||
    step.type === "transfer-scale" ||
    step.type === "open"
  );
}
