/**
 * Core domain types for the SIS Questionnaire Platform.
 * Everything the runner, scorer, and report generator need is expressed
 * here so the four questionnaires differ only by configuration data.
 */

export type QuestionnaireType = "PRE" | "POST";
export type AgeGroup = "KIDS_9_12" | "TEENS_13_17";

/** The seven competency identifiers (spec §9 / §12). */
export type CompetencyId =
  | "communication"
  | "leadership"
  | "emotional"
  | "thinking"
  | "creativity"
  | "independence"
  | "teamwork";

export interface Competency {
  id: CompetencyId;
  label: string;
  /** Tailwind/CSS hex used in UI accents and report charts. */
  color: string;
  /** Emoji used in section headers (spec §7). */
  icon: string;
  /** Database column prefix, e.g. "COM", "AUTO". */
  dbPrefix: string;
  /** Database score column, e.g. "Communication_Score". */
  scoreField: string;
  /** Number of items (always 6 per spec §12). */
  itemCount: number;
}

/** A single competency item with age-specific wording + image prompts. */
export interface CompetencyItem {
  code: string; // e.g. "COM1"
  competencyId: CompetencyId;
  wording: Record<AgeGroup, string>;
  /** AI image prompts per age group (spec §10). */
  imagePrompt: Record<AgeGroup, string>;
  /** Accessible alt text describing the illustration. */
  imageAlt: string;
}

export interface ScaleOption {
  value: number;
  label: string;
}

/** Background questions (BG1–BG5) — appear only in PRE tests. */
export type BackgroundQuestion =
  | {
      kind: "multi";
      code: string;
      icon: string;
      prompt: string;
      helper?: string;
      maxChoices: number;
      options: string[];
      /** DB columns to spread the chosen values across (e.g. two language cols). */
      dbFields: string[];
    }
  | {
      kind: "single";
      code: string;
      icon: string;
      prompt: string;
      helper?: string;
      options: string[];
      dbField: string;
    }
  | {
      kind: "scale";
      code: string;
      icon: string;
      prompt: string;
      helper?: string;
      options: ScaleOption[];
      dbField: string;
    };

/** Transfer questions (TR1–TR4) — appear only in POST tests. */
export type TransferQuestion =
  | { kind: "scale"; code: string; wording: Record<AgeGroup, string>; dbField: string }
  | { kind: "open"; code: string; icon: string; prompt: string; dbField: string };

/** A questionnaire definition — the single config object per form. */
export interface QuestionnaireDefinition {
  id: string; // url slug, e.g. "pre-teens-13-17"
  type: QuestionnaireType;
  ageGroup: AgeGroup;
  title: string;
  dbSheet: string; // e.g. "PRE_TEENS_13_17"
  reportTitle: string; // e.g. "SIS Skills Profile – Pre-Test"
  includesBackground: boolean;
  includesTransfer: boolean;
  reflection: { icon: string; prompt: string; dbField: string };
}

/** ── Runner step model (derived from a definition) ───────────── */
export type Step =
  | { type: "intro"; id: string }
  | { type: "code"; id: string }
  | { type: "scale-intro"; id: string }
  | { type: "section-intro"; id: string; competencyId: CompetencyId }
  | { type: "background"; id: string; question: BackgroundQuestion }
  | { type: "competency"; id: string; item: CompetencyItem; competencyId: CompetencyId }
  | { type: "transfer-scale"; id: string; question: Extract<TransferQuestion, { kind: "scale" }> }
  | { type: "open"; id: string; icon: string; prompt: string; dbField: string }
  | { type: "review"; id: string };

/** Raw answers keyed by field/code. */
export type AnswerValue = number | string | string[];
export type AnswerMap = Record<string, AnswerValue>;

/** Parsed student code (ABCD12). */
export interface ParsedCode {
  raw: string;
  dormGroup: string;
  morningTrack: string;
  afternoonClub: string;
  familyGroup: string;
  studentNumber: string; // two digits
}

/** Per-competency + overall scores. */
export interface ScoreResult {
  byCompetency: Record<CompetencyId, number>;
  overall: number;
}

export type ScoreBand = "Emerging" | "Developing" | "Strengthening" | "Strong";

/** A persisted questionnaire response row (mirrors the 73-col schema). */
export interface ResponseRecord {
  id: string;
  timestamp: string;
  questionnaireType: QuestionnaireType;
  ageGroup: AgeGroup;
  studentCode: string;
  code: ParsedCode;
  answers: AnswerMap;
  scores: ScoreResult;
  reportUrl: string | null;
  reportStatus: "Pending" | "Generated" | "Error";
}
