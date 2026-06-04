import type { AnswerMap, CompetencyId, ScoreBand, ScoreResult } from "@/lib/types";
import { COMPETENCIES, competencyItemCodes, COMPETENCY_BY_ID } from "@/config/competencies";

/**
 * Scoring system (spec §12).
 *   competency score = average of its 6 items (1.00–5.00)
 *   overall          = average of the 7 competency scores
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Average the answered items for a competency; ignores missing/non-numeric. */
export function competencyScore(answers: AnswerMap, competencyId: CompetencyId): number {
  const codes = competencyItemCodes(COMPETENCY_BY_ID[competencyId]);
  const values = codes
    .map((code) => answers[code])
    .filter((v): v is number => typeof v === "number" && v >= 1 && v <= 5);
  if (values.length === 0) return 0;
  return round2(values.reduce((a, b) => a + b, 0) / values.length);
}

export function calculateScores(answers: AnswerMap): ScoreResult {
  const byCompetency = {} as Record<CompetencyId, number>;
  for (const c of COMPETENCIES) {
    byCompetency[c.id] = competencyScore(answers, c.id);
  }
  const scored = Object.values(byCompetency).filter((v) => v > 0);
  const overall = scored.length ? round2(scored.reduce((a, b) => a + b, 0) / scored.length) : 0;
  return { byCompetency, overall };
}

/** Positive interpretation bands (spec §12). */
export function scoreBand(score: number): ScoreBand {
  if (score <= 2.0) return "Emerging";
  if (score <= 3.0) return "Developing";
  if (score <= 4.0) return "Strengthening";
  return "Strong";
}

export const BAND_DESCRIPTION: Record<ScoreBand, string> = {
  Emerging: "a skill you are just beginning to build",
  Developing: "a skill that is growing",
  Strengthening: "a skill you are making stronger",
  Strong: "one of your standout strengths",
};

/** Rank competencies high→low; ties broken by questionnaire order. */
export function rankCompetencies(scores: ScoreResult): CompetencyId[] {
  return [...COMPETENCIES]
    .map((c) => c.id)
    .sort((a, b) => scores.byCompetency[b] - scores.byCompetency[a]);
}

export function topCompetencies(scores: ScoreResult, n = 2): CompetencyId[] {
  return rankCompetencies(scores).slice(0, n);
}

export function bottomCompetencies(scores: ScoreResult, n = 2): CompetencyId[] {
  return rankCompetencies(scores).slice(-n).reverse();
}

/** Post-test change labels (spec §29). */
export type ChangeLabel =
  | "strong improvement"
  | "moderate improvement"
  | "stable"
  | "area to keep supporting";

export function changeLabel(delta: number): ChangeLabel {
  if (delta >= 0.5) return "strong improvement";
  if (delta >= 0.2) return "moderate improvement";
  if (delta >= -0.19) return "stable";
  return "area to keep supporting";
}
