import { useState } from "react";
import type { ScoreResult } from "@/lib/types";
import { getQuestionnaire } from "@/config/questionnaires";
import { calculateScores } from "@/lib/scoring";
import { QuestionnaireRunner, type SubmitInput } from "@/components/questionnaire/QuestionnaireRunner";
import { ReportView } from "@/components/report-web/ReportView";
import { PostReportView } from "@/components/report-web/PostReportView";

/** Runtime configuration injected by WordPress (see config in index.html). */
interface SisConfig {
  apiBase: string;
  questionnaireId: string;
  submitKey?: string;
  imageBase?: string;
}

declare global {
  interface Window {
    SIS_CONFIG?: Partial<SisConfig>;
  }
}

/** Pre-test sheet name for a given questionnaire age group (for POST matching). */
function preSheetFor(ageGroup: string): string {
  return ageGroup === "KIDS_9_12" ? "PRE_KIDS_9_12" : "PRE_TEENS_13_17";
}

function resolveConfig(): SisConfig {
  const c = window.SIS_CONFIG ?? {};
  const urlId = new URLSearchParams(window.location.search).get("q");
  return {
    apiBase: c.apiBase || `${window.location.origin}/wp-json`,
    questionnaireId: urlId || c.questionnaireId || "pre-teens-13-17",
    submitKey: c.submitKey,
    imageBase: c.imageBase,
  };
}

export function App() {
  const config = resolveConfig();
  const def = getQuestionnaire(config.questionnaireId);
  const [preScores, setPreScores] = useState<ScoreResult | null>(null);
  const [matched, setMatched] = useState(false);

  if (!def) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-8 text-center font-body text-body-lg text-on-surface-variant">
        Questionnaire “{config.questionnaireId}” was not found.
      </div>
    );
  }

  async function handleSubmit(input: SubmitInput) {
    const scores = calculateScores(input.answers);
    try {
      const res = await fetch(`${config.apiBase}/sis/v1/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionnaireId: input.questionnaireId,
          code: input.code,
          answers: input.answers,
          scores,
          submitKey: config.submitKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false as const, error: data?.message || "We couldn't save your answers. Please try again." };
      }

      // For POST tests, fetch the matching pre-test scores for a comparison.
      if (def!.type === "POST") {
        try {
          const sheet = preSheetFor(def!.ageGroup);
          const m = await fetch(
            `${config.apiBase}/sis/v1/match?sheet=${encodeURIComponent(sheet)}&code=${encodeURIComponent(input.code.toUpperCase())}`,
          );
          const md = await m.json().catch(() => ({}));
          if (md?.matched && md?.scores) {
            setPreScores(md.scores as ScoreResult);
            setMatched(true);
          }
        } catch {
          /* comparison is optional */
        }
      }

      return {
        ok: true as const,
        result: { studentCode: input.code.toUpperCase(), duplicate: Boolean(data?.duplicate) },
      };
    } catch {
      return { ok: false as const, error: "We couldn't reach the server. Please check your connection and try again." };
    }
  }

  return (
    <QuestionnaireRunner
      def={def}
      onSubmit={handleSubmit}
      renderComplete={(result, restart) =>
        def.type === "POST" ? (
          <PostReportView
            answers={result.answers ?? {}}
            code={result.code ?? result.studentCode}
            def={def}
            postScores={calculateScores(result.answers ?? {})}
            preScores={preScores}
            matched={matched}
            onRestart={restart}
          />
        ) : (
          <ReportView
            answers={result.answers ?? {}}
            code={result.code ?? result.studentCode}
            def={def}
            duplicate={result.duplicate}
            onRestart={restart}
          />
        )
      }
    />
  );
}
