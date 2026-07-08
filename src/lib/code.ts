import { z } from "zod";
import type { ParsedCode } from "@/lib/types";
import { codeName } from "@/lib/content";

/**
 * Student code system (spec §5). Format: ABCD12
 *   Letter 1 = Dorm group
 *   Letter 2 = Morning track / course
 *   Letter 3 = Afternoon club
 *   Letter 4 = LAS Summer Family group
 *   Numbers  = anonymous student number (01–99)
 *
 * No names or ages are collected — the code carries the only metadata.
 */

export const DORM_GROUPS: Record<string, string> = {
  A: "Dorm A", B: "Dorm B", C: "Dorm C", D: "Dorm D",
  E: "Dorm E", F: "Dorm F", G: "Dorm G", H: "Dorm H",
  O: "Other / not assigned yet",
};

export const MORNING_TRACKS: Record<string, string> = {
  L: "Language Acquisition",
  A: "Alpine Leadership",
  I: "Innovation, Creativity & Entrepreneurship",
  P: "Performing Arts",
  C: "Code & Creativity",
  E: "Enrichment / not yet specified",
  O: "Other / not assigned yet",
};

export const AFTERNOON_CLUBS: Record<string, string> = {
  T: "Team Sports",
  V: "Visual Arts",
  M: "Music and Video Production",
  H: "Hiking and Climbing",
  B: "Cooking and Baking",
  N: "Tennis",
  O: "Other / not assigned yet",
};

export const FAMILY_GROUPS: Record<string, string> = {
  A: "Family A", B: "Family B", C: "Family C", D: "Family D",
  E: "Family E", F: "Family F", G: "Family G", H: "Family H",
  I: "Family I", J: "Family J", K: "Family K", L: "Family L",
  M: "Family M", N: "Family N", O: "Other / not assigned yet",
};

/** Strict format: 4 letters (A–Z) followed by 2 digits. Always uppercased. */
export const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{4}[0-9]{2}$/, "Your code has 4 letters and 2 numbers, like ABCD12.");

export function isValidCodeFormat(raw: string): boolean {
  return codeSchema.safeParse(raw).success;
}

export function parseCode(raw: string): ParsedCode {
  const value = codeSchema.parse(raw);
  return {
    raw: value,
    dormGroup: value[0],
    morningTrack: value[1],
    afternoonClub: value[2],
    familyGroup: value[3],
    studentNumber: value.slice(4),
  };
}

/** Human-readable expansion of a parsed code (for admin / reports).
 *  Default names can be overridden by the "Codes" section of the editable
 *  Google Sheet (lib/content.ts), so the team can set the real dorm/club/
 *  family names without code changes. */
export function describeCode(code: ParsedCode) {
  return {
    dorm: codeName("dorm", code.dormGroup, DORM_GROUPS[code.dormGroup] ?? `Unknown (${code.dormGroup})`),
    morningTrack: codeName("track", code.morningTrack, MORNING_TRACKS[code.morningTrack] ?? `Unknown (${code.morningTrack})`),
    afternoonClub: codeName("club", code.afternoonClub, AFTERNOON_CLUBS[code.afternoonClub] ?? `Unknown (${code.afternoonClub})`),
    familyGroup: codeName("family", code.familyGroup, FAMILY_GROUPS[code.familyGroup] ?? `Unknown (${code.familyGroup})`),
    studentNumber: code.studentNumber,
  };
}
