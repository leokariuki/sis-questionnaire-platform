import type { AnswerMap, QuestionnaireDefinition } from "@/lib/types";
import { parseCode, describeCode } from "@/lib/code";
import { calculateScores, scoreBand } from "@/lib/scoring";
import { buildPreReport } from "@/lib/personalization";
import { RadarChartWeb, ScoreBarsWeb } from "./Charts";

/**
 * Printable HTML "SIS Skills Profile" shown after submission in the static
 * WordPress build. Students can read it on screen and use "Save as PDF" /
 * print. Mirrors the server PDF report (spec §26) section-for-section.
 */
export function ReportView({
  answers,
  code,
  def,
  duplicate,
  onRestart,
}: {
  answers: AnswerMap;
  code: string;
  def: QuestionnaireDefinition;
  duplicate?: boolean;
  onRestart?: () => void;
}) {
  const scores = calculateScores(answers);
  const content = buildPreReport(answers, scores);
  const parsed = parseCode(code);
  const desc = describeCode(parsed);
  const overallBand = scoreBand(scores.overall);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Action bar — hidden when printing */}
      <div className="glass sticky top-0 z-10 flex items-center justify-between gap-3 px-container-mobile py-3 print:hidden sm:px-container-desktop">
        <span className="font-head text-label-bold text-on-surface-variant">🎉 All done — here is your profile</span>
        <div className="flex gap-2">
          {onRestart && (
            <button onClick={onRestart} className="btn-ghost">
              Start again
            </button>
          )}
          <button onClick={() => window.print()} className="btn-primary min-h-[44px] px-5 text-body-md">
            📄 Save as PDF
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-content px-container-mobile py-stack-lg sm:px-container-desktop">
        <div className="mb-stack-md h-2 w-full rounded-full bg-primary" />
        <h1 className="font-head text-headline-lg text-on-surface">{def.reportTitle}</h1>
        <p className="mt-1 font-body text-body-md text-on-surface-variant">
          Leysin American School Summer Experience · A reflection on your skills, not a grade.
        </p>

        {duplicate && (
          <p className="mt-stack-sm rounded-md bg-tertiary-container/40 px-4 py-2 font-body text-body-md text-on-surface print:hidden">
            Note: a response for this code already existed. Your newest answers were saved too.
          </p>
        )}

        <div className="mt-stack-md flex flex-wrap gap-2">
          {[`Code: ${parsed.raw}`, `Type: Pre-Test (Teens 13–17)`, `Date: ${date}`].map((m) => (
            <span key={m} className="rounded-full bg-surface-container px-3 py-1 font-body text-body-md text-on-surface">
              {m}
            </span>
          ))}
        </div>
        <p className="mt-2 font-body text-body-md text-on-surface-variant">
          {desc.dorm} · {desc.morningTrack} · {desc.afternoonClub} · {desc.familyGroup}
        </p>

        {/* Overview */}
        <section className="mt-stack-lg">
          <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Your skills overview</h2>
          <div className="card flex flex-col items-center gap-stack-md p-6 sm:flex-row sm:items-center">
            <RadarChartWeb scores={scores} size={300} />
            <ScoreBarsWeb scores={scores} />
          </div>
          <p className="mt-stack-sm font-body text-body-md text-on-surface-variant">
            Overall, your answers place you in the “{overallBand}” range ({scores.overall.toFixed(2)} / 5.00). This is a
            snapshot to build on during the summer.
          </p>
        </section>

        {/* Strengths */}
        <section className="mt-stack-lg">
          <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Your strongest skills</h2>
          <div className="grid gap-stack-sm sm:grid-cols-2">
            {content.strengths.map((a) => (
              <AreaCard key={a.competencyId} color={a.color} title={`${a.label} — ${a.score.toFixed(2)} / 5.00`} band={a.band} blurb={a.blurb} />
            ))}
          </div>
        </section>

        {/* Develop */}
        <section className="mt-stack-lg">
          <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Skills to practice during SIS</h2>
          <div className="grid gap-stack-sm sm:grid-cols-2">
            {content.developing.map((a) => (
              <AreaCard key={a.competencyId} color={a.color} title={`${a.label} — ${a.score.toFixed(2)} / 5.00`} band={a.band} blurb={a.blurb} />
            ))}
          </div>
        </section>

        {/* Suggestions */}
        <section className="mt-stack-lg">
          <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Personalized suggestions for your summer</h2>
          <ul className="flex flex-col gap-stack-sm">
            {[...content.suggestions, ...content.backgroundNotes].map((sug, i) => (
              <li key={i} className="card flex items-start gap-3 p-4">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="font-body text-body-md text-on-surface">{sug}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Adviser guidance */}
        <section className="mt-stack-lg">
          <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Adviser guidance</h2>
          <div className="rounded-md bg-surface-container-high p-5">
            <ul className="flex flex-col gap-stack-sm">
              {content.adviserGuidance.map((g, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                  <span className="font-body text-body-md text-on-surface">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Reflection */}
        {answers["Reflection_Open"] ? (
          <section className="mt-stack-lg">
            <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">What you’d like to learn at SIS</h2>
            <p className="card p-5 font-body text-body-lg italic text-on-surface-variant">
              “{String(answers["Reflection_Open"])}”
            </p>
          </section>
        ) : null}

        <p className="mt-stack-lg border-t border-outline-variant pt-stack-sm text-center font-body text-body-md text-on-surface-variant">
          SIS Skills Profile · Private to the student and their advisers · No names or ages are collected.
        </p>
      </div>
    </div>
  );
}

function AreaCard({ color, title, band, blurb }: { color: string; title: string; band: string; blurb: string }) {
  return (
    <div className="card p-5" style={{ backgroundColor: `${color}10` }}>
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-head text-body-lg font-semibold text-on-surface">{title}</span>
      </div>
      <p className="mt-1 font-body text-body-md text-on-surface-variant">{band}</p>
      <p className="mt-2 font-body text-body-md text-on-surface">{blurb}</p>
    </div>
  );
}
