import type { Competency, CompetencyId } from "@/lib/types";

/**
 * The seven competencies in questionnaire order (spec §9, §12).
 * Colors mirror tailwind `competency.*` tokens.
 */
export const COMPETENCIES: Competency[] = [
  {
    id: "communication",
    label: "Communication",
    color: "#2f6df0",
    icon: "🔵",
    dbPrefix: "COM",
    scoreField: "Communication_Score",
    itemCount: 6,
  },
  {
    id: "leadership",
    label: "Leadership",
    color: "#f08a24",
    icon: "🟠",
    dbPrefix: "LEAD",
    scoreField: "Leadership_Score",
    itemCount: 6,
  },
  {
    id: "emotional",
    label: "Emotional Skills",
    color: "#16a06a",
    icon: "🟢",
    dbPrefix: "EMO",
    scoreField: "Emotional_Skills_Score",
    itemCount: 6,
  },
  {
    id: "thinking",
    label: "Thinking Skills",
    color: "#8b4fd1",
    icon: "🟣",
    dbPrefix: "CT",
    scoreField: "Thinking_Skills_Score",
    itemCount: 6,
  },
  {
    id: "creativity",
    label: "Creativity",
    color: "#e8b321",
    icon: "🟡",
    dbPrefix: "CRE",
    scoreField: "Creativity_Score",
    itemCount: 6,
  },
  {
    id: "independence",
    label: "Independence",
    color: "#1fb6c9",
    icon: "🟦",
    dbPrefix: "AUTO",
    scoreField: "Independence_Score",
    itemCount: 6,
  },
  {
    id: "teamwork",
    label: "Teamwork",
    color: "#f0584f",
    icon: "🔴",
    dbPrefix: "TEAM",
    scoreField: "Teamwork_Score",
    itemCount: 6,
  },
];

export const COMPETENCY_BY_ID: Record<CompetencyId, Competency> = Object.fromEntries(
  COMPETENCIES.map((c) => [c.id, c]),
) as Record<CompetencyId, Competency>;

export function competencyItemCodes(c: Competency): string[] {
  return Array.from({ length: c.itemCount }, (_, i) => `${c.dbPrefix}${i + 1}`);
}
