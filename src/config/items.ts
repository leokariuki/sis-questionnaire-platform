import type { AgeGroup, CompetencyId, CompetencyItem } from "@/lib/types";

/**
 * The 42 competency items (spec §16, pages 16–22), transcribed verbatim.
 * Wording differs by age group; the image *mission* is identical but the
 * depicted students' apparent age matches the questionnaire group (spec §10).
 */

interface ItemSeed {
  code: string;
  competencyId: CompetencyId;
  kids: string;
  teens: string;
  /** Scene description from the spec ("Image: ..."). */
  scene: string;
}

const STYLE_PREAMBLE =
  "Friendly, semi-realistic illustration. Diverse group of international students, culturally neutral, " +
  "no stereotypes, no identifiable real children. Simple uncluttered background, one clear action, " +
  "warm soft lighting, soft modern color palette. Absolutely no text, letters, or numbers anywhere in the image.";

const AGE_DESCRIPTOR: Record<AgeGroup, string> = {
  KIDS_9_12: "The students look approximately 9–12 years old.",
  TEENS_13_17: "The students look approximately 13–17 years old.",
};

function buildPrompt(scene: string, age: AgeGroup): string {
  return `${STYLE_PREAMBLE} Scene: ${scene} ${AGE_DESCRIPTOR[age]}`;
}

const SEEDS: ItemSeed[] = [
  // 🔵 Communication
  { code: "COM1", competencyId: "communication", kids: "I explain my ideas clearly.", teens: "I explain my ideas clearly.", scene: "A student explaining an idea to a small group." },
  { code: "COM2", competencyId: "communication", kids: "I listen carefully when others speak.", teens: "I listen carefully when others speak.", scene: "A student listening carefully while another student speaks." },
  { code: "COM3", competencyId: "communication", kids: "I speak differently with friends, teachers, or new people.", teens: "I change how I speak depending on the person.", scene: "A student speaking with a teacher and with a friend in two simple scenes." },
  { code: "COM4", competencyId: "communication", kids: "I ask questions when I do not understand.", teens: "I ask questions when I do not understand.", scene: "A student raising a hand or asking a question." },
  { code: "COM5", competencyId: "communication", kids: "I can say I disagree in a kind way.", teens: "I can disagree politely.", scene: "Two students discussing different ideas calmly." },
  { code: "COM6", competencyId: "communication", kids: "I feel comfortable speaking in front of a group.", teens: "I feel comfortable speaking in front of a group.", scene: "A student presenting to classmates." },

  // 🟠 Leadership
  { code: "LEAD1", competencyId: "leadership", kids: "I start things without being told.", teens: "I take initiative when something needs to be done.", scene: "A student beginning an activity or helping start a group task." },
  { code: "LEAD2", competencyId: "leadership", kids: "I take responsibility for what I do.", teens: "I take responsibility for my actions.", scene: "A student fixing a mistake or cleaning up after an activity." },
  { code: "LEAD3", competencyId: "leadership", kids: "I help others feel included.", teens: "I help others feel included.", scene: "A student inviting another student to join a group." },
  { code: "LEAD4", competencyId: "leadership", kids: "I help the group reach a goal.", teens: "I help organize people to reach a goal.", scene: "Students planning or organizing a shared task." },
  { code: "LEAD5", competencyId: "leadership", kids: "I stay calm when things are difficult.", teens: "I stay calm when things are difficult.", scene: "A student staying calm during a challenge while others look uncertain." },
  { code: "LEAD6", competencyId: "leadership", kids: "I try to be a good example.", teens: "I try to be a positive example.", scene: "A student behaving responsibly while others follow." },

  // 🟢 Emotional skills
  { code: "EMO1", competencyId: "emotional", kids: "I understand how I feel.", teens: "I understand my feelings.", scene: "A student thinking about feelings, with simple facial expression cues." },
  { code: "EMO2", competencyId: "emotional", kids: "I calm down when I am upset.", teens: "I manage my emotions when I am upset.", scene: "A student taking a calm breath or stepping aside peacefully." },
  { code: "EMO3", competencyId: "emotional", kids: "I stay calm when I feel stressed.", teens: "I handle stress in a healthy way.", scene: "A student relaxing after a difficult task." },
  { code: "EMO4", competencyId: "emotional", kids: "I notice how other people feel.", teens: "I notice how others feel.", scene: "A student noticing that another student looks sad or worried." },
  { code: "EMO5", competencyId: "emotional", kids: "I understand when someone feels sad or worried.", teens: "I show empathy when someone has a problem.", scene: "A student comforting or listening to a worried friend." },
  { code: "EMO6", competencyId: "emotional", kids: "I solve problems without hurting others.", teens: "I resolve conflicts respectfully.", scene: "Two students solving a disagreement calmly with a counselor nearby or in background." },

  // 🟣 Thinking skills
  { code: "CT1", competencyId: "thinking", kids: "I think about choices before deciding.", teens: "I think about options before deciding.", scene: "A student choosing between two or three options." },
  { code: "CT2", competencyId: "thinking", kids: "I explain why I think something is true.", teens: "I explain my reasoning.", scene: "A student explaining an answer or idea to others." },
  { code: "CT3", competencyId: "thinking", kids: "I check if information is true.", teens: "I check evidence before believing information.", scene: "A student checking information on a book, tablet or worksheet." },
  { code: "CT4", competencyId: "thinking", kids: "I solve new problems.", teens: "I solve new problems.", scene: "A student solving a puzzle, challenge or practical problem." },
  { code: "CT5", competencyId: "thinking", kids: "I learn from mistakes.", teens: "I learn from mistakes.", scene: "A student correcting work or trying again after an error." },
  { code: "CT6", competencyId: "thinking", kids: "I ask questions to understand.", teens: "I ask questions to understand more deeply.", scene: "A student asking a thoughtful question during an activity." },

  // 🟡 Creativity
  { code: "CRE1", competencyId: "creativity", kids: "I have original ideas.", teens: "I create original ideas.", scene: "A student with a creative idea during a project." },
  { code: "CRE2", competencyId: "creativity", kids: "I try new ways to solve problems.", teens: "I try new solutions.", scene: "A student testing a different way to complete a task." },
  { code: "CRE3", competencyId: "creativity", kids: "I like trying new things.", teens: "I enjoy experimenting.", scene: "A student trying a new activity or tool." },
  { code: "CRE4", competencyId: "creativity", kids: "I add ideas to others' ideas.", teens: "I build on others' ideas.", scene: "A group brainstorming together." },
  { code: "CRE5", competencyId: "creativity", kids: "I create ideas with few materials.", teens: "I find creative solutions with limited resources.", scene: "A student building or creating something with simple materials." },
  { code: "CRE6", competencyId: "creativity", kids: "I use imagination.", teens: "I use imagination.", scene: "A student working on an imaginative project, art, design or performance." },

  // 🟦 Independence
  { code: "AUTO1", competencyId: "independence", kids: "I plan my time.", teens: "I organize my time.", scene: "A student looking at a simple schedule or checklist." },
  { code: "AUTO2", competencyId: "independence", kids: "I adapt when plans change.", teens: "I adapt when plans change.", scene: "A student calmly changing plan after a schedule change." },
  { code: "AUTO3", competencyId: "independence", kids: "I get ready by myself.", teens: "I prepare independently.", scene: "A student preparing backpack, materials or clothes for an activity." },
  { code: "AUTO4", competencyId: "independence", kids: "I solve daily problems.", teens: "I solve practical problems.", scene: "A student solving a simple problem such as finding materials or reading instructions." },
  { code: "AUTO5", competencyId: "independence", kids: "I make good choices.", teens: "I make responsible decisions.", scene: "A student choosing between safe/responsible options." },
  { code: "AUTO6", competencyId: "independence", kids: "I keep good habits.", teens: "I maintain routines.", scene: "A student organizing belongings, following routine or preparing for the day." },

  // 🔴 Teamwork
  { code: "TEAM1", competencyId: "teamwork", kids: "I work well with others.", teens: "I collaborate effectively.", scene: "Students working together on a shared task." },
  { code: "TEAM2", competencyId: "teamwork", kids: "I share tasks fairly.", teens: "I share responsibilities fairly.", scene: "A group dividing tasks among members." },
  { code: "TEAM3", competencyId: "teamwork", kids: "I share ideas.", teens: "I contribute ideas.", scene: "A student sharing an idea during group work." },
  { code: "TEAM4", competencyId: "teamwork", kids: "I listen to suggestions.", teens: "I accept feedback.", scene: "A student listening to another student's suggestion." },
  { code: "TEAM5", competencyId: "teamwork", kids: "I help others.", teens: "I support others.", scene: "A student helping another student complete a task." },
  { code: "TEAM6", competencyId: "teamwork", kids: "I work well with people from other countries.", teens: "I work well with people from different cultures.", scene: "A diverse group of international students working together." },
];

export const COMPETENCY_ITEMS: CompetencyItem[] = SEEDS.map((s) => ({
  code: s.code,
  competencyId: s.competencyId,
  wording: { KIDS_9_12: s.kids, TEENS_13_17: s.teens },
  imagePrompt: {
    KIDS_9_12: buildPrompt(s.scene, "KIDS_9_12"),
    TEENS_13_17: buildPrompt(s.scene, "TEENS_13_17"),
  },
  imageAlt: s.scene,
}));

export const ITEMS_BY_COMPETENCY: Record<CompetencyId, CompetencyItem[]> = COMPETENCY_ITEMS.reduce(
  (acc, item) => {
    (acc[item.competencyId] ??= []).push(item);
    return acc;
  },
  {} as Record<CompetencyId, CompetencyItem[]>,
);

export const ITEM_BY_CODE: Record<string, CompetencyItem> = Object.fromEntries(
  COMPETENCY_ITEMS.map((i) => [i.code, i]),
);
