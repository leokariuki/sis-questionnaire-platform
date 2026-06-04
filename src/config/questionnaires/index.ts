import type { QuestionnaireDefinition } from "@/lib/types";
import { PRE_TEENS_13_17 } from "./pre-teens-13-17";
import { PRE_KIDS_9_12 } from "./pre-kids-9-12";
import { POST_KIDS_9_12 } from "./post-kids-9-12";
import { POST_TEENS_13_17 } from "./post-teens-13-17";

/**
 * Questionnaire registry. The pilot (pre-teens-13-17) is the fully exercised
 * path; the others are generated from the same shared config and can be
 * enabled by flipping `live` to true once content is reviewed.
 */
interface RegistryEntry {
  definition: QuestionnaireDefinition;
  live: boolean;
}

const REGISTRY: RegistryEntry[] = [
  { definition: PRE_TEENS_13_17, live: true }, // PILOT
  { definition: PRE_KIDS_9_12, live: true },
  { definition: POST_KIDS_9_12, live: true },
  { definition: POST_TEENS_13_17, live: true },
];

export const ALL_QUESTIONNAIRES = REGISTRY.map((r) => r.definition);

export const LIVE_QUESTIONNAIRES = REGISTRY.filter((r) => r.live).map((r) => r.definition);

export function getQuestionnaire(id: string): QuestionnaireDefinition | undefined {
  return REGISTRY.find((r) => r.definition.id === id)?.definition;
}

export function isLive(id: string): boolean {
  return REGISTRY.find((r) => r.definition.id === id)?.live ?? false;
}

export function getBySheet(sheet: string): QuestionnaireDefinition | undefined {
  return REGISTRY.find((r) => r.definition.dbSheet === sheet)?.definition;
}
