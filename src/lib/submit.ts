import { randomUUID } from "crypto";
import type { ResponseRecord } from "@/lib/types";
import type { SubmissionPayload } from "@/lib/schema";
import { getQuestionnaire } from "@/config/questionnaires";
import { parseCode } from "@/lib/code";
import { calculateScores } from "@/lib/scoring";
import { checkCompleteness } from "@/lib/quality";
import { getStore } from "@/lib/db";
import { syncToSheetSafe } from "@/lib/sheets";

export type SubmitOutcome =
  | { ok: true; record: ResponseRecord; duplicate: boolean }
  | { ok: false; error: string; code: "INVALID_QUESTIONNAIRE" | "INCOMPLETE" | "INVALID_CODE"; missing?: string[] };

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

/**
 * Validate + persist a submission. Handles scoring, completeness checks,
 * duplicate detection, Sheets sync, and report-URL assignment.
 */
export async function submitResponse(payload: SubmissionPayload): Promise<SubmitOutcome> {
  const def = getQuestionnaire(payload.questionnaireId);
  if (!def) {
    return { ok: false, error: "Unknown questionnaire.", code: "INVALID_QUESTIONNAIRE" };
  }

  let code;
  try {
    code = parseCode(payload.code);
  } catch {
    return { ok: false, error: "Invalid code format.", code: "INVALID_CODE" };
  }

  const completeness = checkCompleteness(def, payload.answers);
  if (!completeness.complete) {
    return {
      ok: false,
      error: "Some required answers are missing.",
      code: "INCOMPLETE",
      missing: completeness.missing,
    };
  }

  const scores = calculateScores(payload.answers);
  const store = await getStore();

  // Duplicate detection (spec §31): same code already submitted for this sheet.
  const existing = await store.getByCode(def.dbSheet, code.raw);

  const id = randomUUID();
  const record: ResponseRecord = {
    id,
    timestamp: new Date().toISOString(),
    questionnaireType: def.type,
    ageGroup: def.ageGroup,
    studentCode: code.raw,
    code,
    answers: payload.answers,
    scores,
    reportUrl: `${appUrl()}/api/report/${id}`,
    reportStatus: "Generated",
  };

  await store.create(record);

  // Best-effort Google Sheets mirror (never blocks submission).
  await syncToSheetSafe(record);

  return { ok: true, record, duplicate: Boolean(existing) };
}
