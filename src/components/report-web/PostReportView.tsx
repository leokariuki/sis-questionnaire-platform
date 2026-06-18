import type { AnswerMap, QuestionnaireDefinition, ScoreResult } from "@/lib/types";
import { parseCode, describeCode } from "@/lib/code";
import { buildPostReportFromScores } from "@/lib/personalization";
import { CreditLine } from "@/components/ui/CreditLine";

/**
 * Printable POST "SIS Skills Profile" with pre→post comparison (spec §14, §27).
 * Positive, evidence-based, non-causal language ("your answers suggest…").
 */
export function PostReportView({
  answers,
  code,
  def,
  postScores,
  preScores,
  matched,
  onRestart,
}: {
  answers: AnswerMap;
  code: string;
  def: QuestionnaireDefinition;
  postScores: ScoreResult;
  preScores: ScoreResult | null;
  matched: boolean;
  onRestart?: () => void;
}) {
  const content = buildPostReportFromScores(postScores, preScores, answers);
  const parsed = parseCode(code);
  const desc = describeCode(parsed);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="glass sticky top-0 z-10 flex items-center justify-between gap-3 px-container-mobile py-3 print:hidden sm:px-container-desktop">
        <span className="font-head text-label-bold text-on-surface-variant">🎉 All done — here is your progress</span>
        <div className="flex gap-2">
          {onRestart && (
            <button onClick={onRestart} className="btn-ghost">
              Start again
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-content px-container-mobile py-stack-lg sm:px-container-desktop">
        <div className="mb-stack-md h-2 w-full rounded-full bg-primary" />
        <h1 className="font-head text-headline-lg text-on-surface">{def.reportTitle}</h1>
        <p className="mt-1 font-body text-body-md text-on-surface-variant">
          Leysin American School Summer Experience · How your skills grew over the summer.
        </p>

        {!matched && (
          <p className="mt-stack-sm rounded-md bg-tertiary-container/40 px-4 py-2 font-body text-body-md text-on-surface print:hidden">
            We couldn’t find your pre-test for this code, so this shows your current results without a comparison.
          </p>
        )}

        <div className="mt-stack-md flex flex-wrap gap-2">
          {[`Code: ${parsed.raw}`, `Type: Post-Test`, `Date: ${date}`].map((m) => (
            <span key={m} className="rounded-full bg-surface-container px-3 py-1 font-body text-body-md text-on-surface">
              {m}
            </span>
          ))}
        </div>
        <p className="mt-2 font-body text-body-md text-on-surface-variant">
          {desc.dorm} · {desc.morningTrack} · {desc.afternoonClub} · {desc.familyGroup}
        </p>

        {/* Comparison chart */}
        <section className="mt-stack-lg">
          <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">
            {matched ? "Before and after SIS" : "Your current skills"}
          </h2>
          <div className="card flex flex-col gap-3 p-6">
            {content.changes.map((ch) => (
              <div key={ch.competencyId} className="flex items-center gap-3">
                <span className="w-32 shrink-0 font-body text-body-md text-on-surface">{ch.label}</span>
                <div className="flex-1">
                  {matched && (
                    <div className="mb-1 h-2.5 overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full rounded-full opacity-40" style={{ width: `${(ch.pre / 6) * 100}%`, backgroundColor: ch.color }} />
                    </div>
                  )}
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-high">
                    <div className="h-full rounded-full" style={{ width: `${(ch.post / 6) * 100}%`, backgroundColor: ch.color }} />
                  </div>
                </div>
                <span className="w-20 text-right font-head text-label-bold text-on-surface-variant">
                  {matched ? `${ch.pre.toFixed(1)}→${ch.post.toFixed(1)}` : ch.post.toFixed(2)}
                </span>
              </div>
            ))}
            {matched && (
              <p className="mt-1 font-body text-body-md text-on-surface-variant">
                Lighter bar = before · solid bar = after.
              </p>
            )}
          </div>
        </section>

        {/* Improvements */}
        {matched && content.improvements.length > 0 && (
          <section className="mt-stack-lg">
            <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Your biggest improvements</h2>
            <div className="grid gap-stack-sm sm:grid-cols-2">
              {content.improvements.map((ch) => (
                <div key={ch.competencyId} className="card p-5" style={{ backgroundColor: `${ch.color}10` }}>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span className="font-head text-body-lg font-semibold text-on-surface">{ch.label}</span>
                  </div>
                  <p className="mt-2 font-body text-body-md text-on-surface">
                    Your answers suggest growth here (+{ch.delta.toFixed(2)}). Your SIS experience may have helped you build this skill.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Strongest current */}
        <section className="mt-stack-lg">
          <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Skills that are already strong</h2>
          <div className="grid gap-stack-sm sm:grid-cols-2">
            {[...content.changes].sort((a, b) => b.post - a.post).slice(0, 2).map((ch) => (
              <div key={ch.competencyId} className="card p-5" style={{ backgroundColor: `${ch.color}10` }}>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ch.color }} />
                  <span className="font-head text-body-lg font-semibold text-on-surface">
                    {ch.label} — {ch.post.toFixed(2)} / 6.00
                  </span>
                </div>
                <p className="mt-2 font-body text-body-md text-on-surface">This is one of your standout strengths — keep using it.</p>
              </div>
            ))}
          </div>
        </section>

        {/* Student example */}
        {content.studentExample ? (
          <section className="mt-stack-lg">
            <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Something you learned and use</h2>
            <p className="card p-5 font-body text-body-lg italic text-on-surface-variant">“{content.studentExample}”</p>
          </section>
        ) : null}

        {/* Next steps */}
        <section className="mt-stack-lg">
          <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">Suggested next steps after SIS</h2>
          <div className="rounded-md bg-surface-container-high p-5">
            <ul className="flex flex-col gap-stack-sm">
              {content.keepDeveloping.map((ch) => (
                <li key={ch.competencyId} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                  <span className="font-body text-body-md text-on-surface">
                    Keep practicing <strong>{ch.label.toLowerCase()}</strong> at home and school — small steps each week add up.
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {content.reflection ? (
          <section className="mt-stack-lg">
            <h2 className="mb-stack-sm font-head text-headline-md text-on-surface">What you learned most</h2>
            <p className="card p-5 font-body text-body-lg italic text-on-surface-variant">“{content.reflection}”</p>
          </section>
        ) : null}

        <p className="mt-stack-lg border-t border-outline-variant pt-stack-sm text-center font-body text-body-md text-on-surface-variant">
          SIS Skills Profile · Private to the student and their advisers · No names or ages are collected.
        </p>
        <CreditLine className="mt-stack-sm" />
      </div>
    </div>
  );
}
