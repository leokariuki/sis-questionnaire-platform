import { notFound } from "next/navigation";
import { getQuestionnaire, isLive, ALL_QUESTIONNAIRES } from "@/config/questionnaires";
import { QuestionnaireRunner } from "@/components/questionnaire/QuestionnaireRunner";

/**
 * Iframe-friendly entry point for embedding inside a WordPress page.
 * Identical to /q/<id> but intended to be loaded in an <iframe>; the CSP
 * frame-ancestors header in next.config.mjs controls which origin may embed it.
 */
export function generateStaticParams() {
  return ALL_QUESTIONNAIRES.map((q) => ({ questionnaire: q.id }));
}

export const metadata = { robots: { index: false, follow: false } };

export default function EmbedPage({ params }: { params: { questionnaire: string } }) {
  const def = getQuestionnaire(params.questionnaire);
  if (!def || !isLive(def.id)) notFound();
  return <QuestionnaireRunner def={def} />;
}
