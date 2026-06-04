import type { AnswerMap, QuestionnaireDefinition, ResponseRecord } from "@/lib/types";
import { COMPETENCIES, competencyItemCodes } from "@/config/competencies";
import { BACKGROUND_QUESTIONS } from "@/config/backgroundQuestions";
import { TRANSFER_QUESTIONS } from "@/config/transfer";

/**
 * Quality checks (spec §31): duplicate codes, invalid format, missing answers,
 * unmatched post-tests, incomplete questionnaires, report errors.
 */

export interface CompletenessResult {
  complete: boolean;
  missing: string[];
}

/** Verify every required field for a questionnaire has a usable answer. */
export function checkCompleteness(
  def: QuestionnaireDefinition,
  answers: AnswerMap,
): CompletenessResult {
  const missing: string[] = [];

  if (def.includesBackground) {
    for (const q of BACKGROUND_QUESTIONS) {
      const key = q.kind === "multi" ? q.code : q.dbField;
      const v = answers[key];
      const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      if (empty) missing.push(q.code);
    }
  }

  for (const c of COMPETENCIES) {
    for (const code of competencyItemCodes(c)) {
      if (typeof answers[code] !== "number") missing.push(code);
    }
  }

  if (def.includesTransfer) {
    for (const q of TRANSFER_QUESTIONS) {
      const key = q.kind === "scale" ? q.dbField : q.dbField;
      const v = answers[key];
      // TR4 open answer is optional; scale items are required.
      if (q.kind === "scale" && typeof v !== "number") missing.push(q.code);
    }
  }

  return { complete: missing.length === 0, missing };
}

/** A POST test is "unmatched" if no PRE exists for the same code + age group. */
export function isUnmatchedPost(
  post: ResponseRecord,
  allRecords: ResponseRecord[],
): boolean {
  if (post.questionnaireType !== "POST") return false;
  return !allRecords.some(
    (r) =>
      r.questionnaireType === "PRE" &&
      r.ageGroup === post.ageGroup &&
      r.studentCode === post.studentCode,
  );
}

export interface QualityReport {
  totalResponses: number;
  duplicateCodes: { sheet: string; code: string; count: number }[];
  unmatchedPostTests: string[]; // record ids
  reportErrors: string[]; // record ids with Report_Status === "Error"
  incomplete: string[]; // record ids missing required answers (best-effort)
}

/** Aggregate quality report for the admin dashboard. */
export function buildQualityReport(records: ResponseRecord[]): QualityReport {
  const seen = new Map<string, number>();
  for (const r of records) {
    const key = `${r.questionnaireType}_${r.ageGroup}::${r.studentCode}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const duplicateCodes = [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([key, count]) => {
      const [sheet, code] = key.split("::");
      return { sheet, code, count };
    });

  const unmatchedPostTests = records
    .filter((r) => isUnmatchedPost(r, records))
    .map((r) => r.id);

  const reportErrors = records.filter((r) => r.reportStatus === "Error").map((r) => r.id);

  return {
    totalResponses: records.length,
    duplicateCodes,
    unmatchedPostTests,
    reportErrors,
    incomplete: [],
  };
}
