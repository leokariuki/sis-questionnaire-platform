import type { ResponseRecord } from "@/lib/types";
import { COMPETENCIES, competencyItemCodes } from "@/config/competencies";

/**
 * The canonical 73-column schema (spec §4), in order. Shared by the local
 * store, Supabase, and Google Sheets so every backend stays identical.
 */
export const COLUMN_HEADERS: string[] = [
  "Timestamp",
  "Questionnaire_Type",
  "Age_Group",
  "Student_Code",
  "Code_Letter_1",
  "Code_Letter_2",
  "Code_Letter_3",
  "Code_Letter_4",
  "Code_Number_1",
  "Code_Number_2",
  "Main_Language_1",
  "Main_Language_2",
  "English_Level",
  "Previous_International_Camp",
  "Previous_Stay_Away_From_Home",
  "Confidence_Using_English",
  ...COMPETENCIES.flatMap((c) => competencyItemCodes(c)), // COM1..TEAM6 (42)
  "TR1",
  "TR2",
  "TR3",
  "TR4_Open",
  "Reflection_Open",
  "Communication_Score",
  "Leadership_Score",
  "Emotional_Skills_Score",
  "Thinking_Skills_Score",
  "Creativity_Score",
  "Independence_Score",
  "Teamwork_Score",
  "Overall_Score",
  "Report_File_URL",
  "Report_Status",
];

/** Flatten a ResponseRecord into a {column: value} object for any backend. */
export function recordToRow(rec: ResponseRecord): Record<string, string | number> {
  const a = rec.answers;
  // BG1 (multi-choice "main languages") is stored under its code as an array
  // and split across the two language columns here.
  const langs = Array.isArray(a["BG1"]) ? (a["BG1"] as string[]) : [];
  const lang1 = langs[0] ?? (a["Main_Language_1"] as string) ?? "";
  const lang2 = langs[1] ?? (a["Main_Language_2"] as string) ?? "";

  const row: Record<string, string | number> = {
    Timestamp: rec.timestamp,
    Questionnaire_Type: rec.questionnaireType,
    Age_Group: rec.ageGroup,
    Student_Code: rec.studentCode,
    Code_Letter_1: rec.code.dormGroup,
    Code_Letter_2: rec.code.morningTrack,
    Code_Letter_3: rec.code.afternoonClub,
    Code_Letter_4: rec.code.familyGroup,
    Code_Number_1: rec.code.studentNumber[0] ?? "",
    Code_Number_2: rec.code.studentNumber[1] ?? "",
    Main_Language_1: lang1,
    Main_Language_2: lang2,
    English_Level: (a["English_Level"] as string) ?? "",
    Previous_International_Camp: (a["Previous_International_Camp"] as string) ?? "",
    Previous_Stay_Away_From_Home: (a["Previous_Stay_Away_From_Home"] as string) ?? "",
    Confidence_Using_English: (a["Confidence_Using_English"] as number) ?? "",
    TR1: (a["TR1"] as number) ?? "",
    TR2: (a["TR2"] as number) ?? "",
    TR3: (a["TR3"] as number) ?? "",
    TR4_Open: (a["TR4_Open"] as string) ?? "",
    Reflection_Open: (a["Reflection_Open"] as string) ?? "",
    Communication_Score: rec.scores.byCompetency.communication || "",
    Leadership_Score: rec.scores.byCompetency.leadership || "",
    Emotional_Skills_Score: rec.scores.byCompetency.emotional || "",
    Thinking_Skills_Score: rec.scores.byCompetency.thinking || "",
    Creativity_Score: rec.scores.byCompetency.creativity || "",
    Independence_Score: rec.scores.byCompetency.independence || "",
    Teamwork_Score: rec.scores.byCompetency.teamwork || "",
    Overall_Score: rec.scores.overall || "",
    Report_File_URL: rec.reportUrl ?? "",
    Report_Status: rec.reportStatus,
  };

  // All 42 competency items.
  for (const c of COMPETENCIES) {
    for (const code of competencyItemCodes(c)) {
      row[code] = (a[code] as number) ?? "";
    }
  }

  return row;
}

/** Ordered array form, aligned to COLUMN_HEADERS (for Sheets appendRow). */
export function recordToOrderedRow(rec: ResponseRecord): (string | number)[] {
  const row = recordToRow(rec);
  return COLUMN_HEADERS.map((h) => row[h] ?? "");
}
