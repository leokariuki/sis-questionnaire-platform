import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuestionnaire, isLive, ALL_QUESTIONNAIRES } from "@/config/questionnaires";
import { QuestionnaireRunner } from "@/components/questionnaire/QuestionnaireRunner";

export function generateStaticParams() {
  return ALL_QUESTIONNAIRES.map((q) => ({ questionnaire: q.id }));
}

export function generateMetadata({ params }: { params: { questionnaire: string } }): Metadata {
  const def = getQuestionnaire(params.questionnaire);
  return { title: def ? `${def.title} — SIS Skills Questionnaire` : "SIS Questionnaire" };
}

export default function QuestionnairePage({ params }: { params: { questionnaire: string } }) {
  const def = getQuestionnaire(params.questionnaire);
  if (!def || !isLive(def.id)) notFound();
  return <QuestionnaireRunner def={def} />;
}
