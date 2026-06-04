import type { AnswerMap, CompetencyId, ResponseRecord, ScoreResult } from "@/lib/types";
import { COMPETENCY_BY_ID } from "@/config/competencies";
import {
  BAND_DESCRIPTION,
  bottomCompetencies,
  changeLabel,
  scoreBand,
  topCompetencies,
} from "@/lib/scoring";

/**
 * Rule-based personalization engine (spec §13, §28, §29).
 * No AI required at runtime — deterministic, reviewable, and safe.
 * Language is always encouraging and never judgmental.
 */

/** Student-facing "use SIS to grow" suggestions per competency (spec §28 / §13). */
const STUDENT_SUGGESTIONS: Record<CompetencyId, string[]> = {
  communication: [
    "Try speaking to one new person each day — a small question is a great start.",
    "Ask questions in your classes or clubs, especially in Language Acquisition.",
    "Join group discussions and share one idea with students from other countries.",
  ],
  leadership: [
    "Take one small role in a group activity, like helping organize materials.",
    "In Alpine Leadership or group challenges, offer to lead a tiny part of the task.",
    "Encourage a peer — helping others is a quiet but powerful kind of leadership.",
  ],
  emotional: [
    "Use the family group check-ins to talk about how your day felt.",
    "Try a calm breathing strategy when something feels stressful.",
    "Reflect for a moment after difficult moments — what helped you feel better?",
  ],
  thinking: [
    "Ask 'why' and 'how' questions during classes, excursions and projects.",
    "When you make a choice, practice explaining your reasoning out loud.",
    "In Code & Creativity, enjoy solving problems one step at a time.",
  ],
  creativity: [
    "Explore Performing Arts, Visual Arts, Music & Video Production or Code & Creativity.",
    "Try project-based activities where you can invent your own ideas.",
    "Experiment freely — new ideas are welcome and mistakes are part of learning.",
  ],
  independence: [
    "Build a simple daily routine for preparing your materials and clothes.",
    "Set one small personal goal each day, like getting ready on your own.",
    "Join the family group routines to practice managing your time.",
  ],
  teamwork: [
    "Join clubs, team sports or Cooking & Baking to work closely with others.",
    "Practice sharing tasks fairly and including everyone in your group.",
    "In mixed-group projects, listen to ideas and offer help when you can.",
  ],
};

/** Adviser-facing support strategies per competency (spec §13 / §28). */
const ADVISER_GUIDANCE: Record<CompetencyId, string> = {
  communication: "Pair the student with supportive, welcoming peers and create low-pressure chances to speak.",
  leadership: "Invite the student to take a small, clearly defined role in a group challenge.",
  emotional: "Help the student identify stress triggers and use family group check-ins for emotional awareness.",
  thinking: "In problem-solving activities and excursions, prompt the student to explain their choices.",
  creativity: "Offer open-ended, project-based tasks and reassure the student that trying new ideas is encouraged.",
  independence: "Set small daily independence goals around preparing materials and managing time.",
  teamwork: "Coach the student in listening, sharing tasks and including others during group work.",
};

/** Encouraging description for a strong competency. */
const STRENGTH_BLURB: Record<CompetencyId, string> = {
  communication: "You express your ideas and connect with others with confidence.",
  leadership: "You step up, take responsibility and help your group move forward.",
  emotional: "You understand feelings — your own and others' — and respond with care.",
  thinking: "You think things through, ask good questions and learn from mistakes.",
  creativity: "You bring fresh ideas and enjoy trying new ways of doing things.",
  independence: "You organize yourself well and handle daily challenges on your own.",
  teamwork: "You collaborate generously and help everyone feel part of the team.",
};

export interface ReportAreaItem {
  competencyId: CompetencyId;
  label: string;
  color: string;
  score: number;
  band: ReturnType<typeof scoreBand>;
  blurb: string;
}

export interface PreReportContent {
  kind: "PRE";
  strengths: ReportAreaItem[];
  developing: ReportAreaItem[];
  suggestions: string[];
  adviserGuidance: string[];
  backgroundNotes: string[];
}

function areaItem(competencyId: CompetencyId, scores: ScoreResult, strength: boolean): ReportAreaItem {
  const c = COMPETENCY_BY_ID[competencyId];
  const score = scores.byCompetency[competencyId];
  const band = scoreBand(score);
  return {
    competencyId,
    label: c.label,
    color: c.color,
    score,
    band,
    blurb: strength
      ? STRENGTH_BLURB[competencyId]
      : `This is ${BAND_DESCRIPTION[band]} — a great focus for your SIS summer.`,
  };
}

/** Background-profile rules (spec §28). */
function backgroundNotes(answers: AnswerMap): string[] {
  const notes: string[] = [];
  const confidence = answers["Confidence_Using_English"];
  if (typeof confidence === "number" && confidence <= 2) {
    notes.push(
      "Because using English still feels new, look for safe, low-pressure moments to practice — " +
        "pair work, asking simple questions, and Language Acquisition activities are perfect.",
    );
  }
  if (answers["Previous_International_Camp"] === "No") {
    notes.push(
      "Since this may be your first international camp, lean on daily routines, make friends early, " +
        "and ask for help whenever you need it — that's exactly what advisers are here for.",
    );
  }
  const stay = answers["Previous_Stay_Away_From_Home"];
  if (stay === "No") {
    notes.push(
      "As staying away from home is new, set small independence goals: prepare your materials, " +
        "manage your time, and join the family group routines.",
    );
  }
  return notes;
}

export function buildPreReport(answers: AnswerMap, scores: ScoreResult): PreReportContent {
  const top = topCompetencies(scores, 2);
  const bottom = bottomCompetencies(scores, 2);

  const suggestions: string[] = [];
  for (const id of bottom) {
    // Two suggestions from the lowest, one from the second-lowest → 2–3 total.
    const picks = STUDENT_SUGGESTIONS[id];
    suggestions.push(picks[0]);
  }
  // Add a second suggestion from the lowest competency for depth.
  suggestions.splice(1, 0, STUDENT_SUGGESTIONS[bottom[0]][1]);

  return {
    kind: "PRE",
    strengths: top.map((id) => areaItem(id, scores, true)),
    developing: bottom.map((id) => areaItem(id, scores, false)),
    suggestions: suggestions.slice(0, 3),
    adviserGuidance: bottom.map((id) => ADVISER_GUIDANCE[id]),
    backgroundNotes: backgroundNotes(answers),
  };
}

/** ── Post-test personalization (spec §29) ────────────────────── */
export interface PostChangeItem {
  competencyId: CompetencyId;
  label: string;
  color: string;
  pre: number;
  post: number;
  delta: number;
  label_change: ReturnType<typeof changeLabel>;
}

export interface PostReportContent {
  kind: "POST";
  changes: PostChangeItem[];
  improvements: PostChangeItem[];
  remainedStrong: PostChangeItem[];
  keepDeveloping: PostChangeItem[];
  studentExample: string | null;
  reflection: string | null;
}

export function buildPostReport(
  post: ResponseRecord,
  pre: ResponseRecord | null,
): PostReportContent {
  return buildPostReportFromScores(
    post.scores,
    pre ? pre.scores : null,
    post.answers,
  );
}

/**
 * Client-friendly post report: builds the pre→post comparison from raw score
 * objects + answers (the static build doesn't carry full ResponseRecords).
 * When `preScores` is null (no matched pre-test), deltas are shown as 0/stable.
 */
export function buildPostReportFromScores(
  postScores: ScoreResult,
  preScores: ScoreResult | null,
  answers: AnswerMap,
): PostReportContent {
  const changes: PostChangeItem[] = (Object.keys(postScores.byCompetency) as CompetencyId[]).map(
    (id) => {
      const c = COMPETENCY_BY_ID[id];
      const postScore = postScores.byCompetency[id];
      const preScore = preScores ? preScores.byCompetency[id] : postScore;
      const delta = Math.round((postScore - preScore) * 100) / 100;
      return {
        competencyId: id,
        label: c.label,
        color: c.color,
        pre: preScore,
        post: postScore,
        delta,
        label_change: changeLabel(delta),
      };
    },
  );

  const improvements = [...changes]
    .filter((c) => c.delta >= 0.2)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2);
  const remainedStrong = changes.filter((c) => c.post >= 4.01 && c.delta > -0.2);
  const keepDeveloping = [...changes].sort((a, b) => a.delta - b.delta).slice(0, 2);

  return {
    kind: "POST",
    changes,
    improvements,
    remainedStrong,
    keepDeveloping,
    studentExample: (answers["TR4_Open"] as string) || null,
    reflection: (answers["Reflection_Open"] as string) || null,
  };
}
