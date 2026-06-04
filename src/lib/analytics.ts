import type { CompetencyId, ResponseRecord } from "@/lib/types";
import { COMPETENCIES } from "@/config/competencies";
import { buildQualityReport, type QualityReport } from "@/lib/quality";

/** Group + global analytics (spec §15, §30). All aggregated, no PII. */
export interface CompetencyAggregate {
  id: CompetencyId;
  label: string;
  color: string;
  average: number;
  /** Count of responses at each 1–5 average band (rounded). */
  distribution: number[];
}

export interface Analytics {
  total: number;
  byQuestionnaire: { sheet: string; count: number }[];
  competencies: CompetencyAggregate[];
  strongest: { id: CompetencyId; label: string; average: number } | null;
  needsSupport: { id: CompetencyId; label: string; average: number } | null;
  overallAverage: number;
  quality: QualityReport;
}

function avg(nums: number[]): number {
  const v = nums.filter((n) => n > 0);
  if (!v.length) return 0;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100;
}

export function computeAnalytics(records: ResponseRecord[]): Analytics {
  const competencies: CompetencyAggregate[] = COMPETENCIES.map((c) => {
    const scores = records.map((r) => r.scores.byCompetency[c.id]).filter((n) => n > 0);
    const distribution = [0, 0, 0, 0, 0]; // bands for rounded 1..5
    for (const sc of scores) {
      const idx = Math.min(4, Math.max(0, Math.round(sc) - 1));
      distribution[idx] += 1;
    }
    return { id: c.id, label: c.label, color: c.color, average: avg(scores), distribution };
  });

  const ranked = [...competencies].filter((c) => c.average > 0).sort((a, b) => b.average - a.average);
  const strongest = ranked[0] ? { id: ranked[0].id, label: ranked[0].label, average: ranked[0].average } : null;
  const last = ranked[ranked.length - 1];
  const needsSupport = last ? { id: last.id, label: last.label, average: last.average } : null;

  const sheetCounts = new Map<string, number>();
  for (const r of records) {
    const sheet = `${r.questionnaireType}_${r.ageGroup}`;
    sheetCounts.set(sheet, (sheetCounts.get(sheet) ?? 0) + 1);
  }

  return {
    total: records.length,
    byQuestionnaire: [...sheetCounts.entries()].map(([sheet, count]) => ({ sheet, count })),
    competencies,
    strongest,
    needsSupport,
    overallAverage: avg(records.map((r) => r.scores.overall)),
    quality: buildQualityReport(records),
  };
}
