"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnswerMap, CompetencyId, QuestionnaireDefinition } from "@/lib/types";
import { COMPETENCY_BY_ID } from "@/config/competencies";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { renderStep } from "./screens";
import { CompletionScreen } from "./CompletionScreen";

/** Active competency color for the current step (tints progress + accents). */
function stepColor(stepCompetency?: CompetencyId): string {
  return stepCompetency ? COMPETENCY_BY_ID[stepCompetency].color : "#7047a4";
}

export interface SubmitInput {
  questionnaireId: string;
  code: string;
  answers: AnswerMap;
}

export interface CompleteResult {
  studentCode: string;
  duplicate: boolean;
  /** Optional server-generated report URL (Next.js path). */
  reportUrl?: string;
  /** Raw answers + code, used by client-side report rendering (static path). */
  answers?: AnswerMap;
  code?: string;
}

export interface QuestionnaireRunnerProps {
  def: QuestionnaireDefinition;
  /**
   * Custom submit handler. Defaults to POSTing the Next.js /api/responses
   * route. The static WordPress build supplies a handler that scores
   * client-side and posts to the WordPress REST API.
   */
  onSubmit?: (input: SubmitInput) => Promise<{ ok: true; result: CompleteResult } | { ok: false; error: string }>;
  /** Custom completion UI. Defaults to the link-based CompletionScreen. */
  renderComplete?: (result: CompleteResult, restart: () => void) => React.ReactNode;
  /** Pre-fill the student code (from a personalised ?code= link). */
  initialCode?: string;
}

async function defaultSubmit(
  input: SubmitInput,
): Promise<{ ok: true; result: CompleteResult } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Something went wrong. Please try again." };
    return {
      ok: true,
      result: { studentCode: data.studentCode, duplicate: data.duplicate, reportUrl: data.reportUrl },
    };
  } catch {
    return { ok: false, error: "We couldn't reach the server. Please check your connection and try again." };
  }
}

export function QuestionnaireRunner({ def, onSubmit, renderComplete, initialCode }: QuestionnaireRunnerProps) {
  const ctrl = useQuestionnaire(def, initialCode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompleteResult | null>(null);

  if (!ctrl.hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-on-surface-variant">Loading…</div>
    );
  }

  if (result) {
    if (renderComplete) {
      return <>{renderComplete(result, () => setResult(null))}</>;
    }
    return (
      <CompletionScreen
        reportUrl={result.reportUrl || "#"}
        studentCode={result.studentCode}
        duplicate={result.duplicate}
      />
    );
  }

  const step = ctrl.current;
  const competencyId =
    step.type === "competency" || step.type === "section-intro" ? step.competencyId : undefined;
  const color = stepColor(competencyId);
  const canGo = ctrl.canAdvance(step);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const handler = onSubmit ?? defaultSubmit;
      const outcome = await handler({ questionnaireId: def.id, code: ctrl.code, answers: ctrl.answers });
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      ctrl.clearDraft();
      setResult({ ...outcome.result, answers: ctrl.answers, code: ctrl.code });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Sticky glass header with progress (spec §6, DESIGN.md §Elevation) */}
      <header className="glass sticky top-0 z-20 px-container-mobile py-3 sm:px-container-desktop">
        <div className="mx-auto w-full max-w-form">
          <ProgressBar
            percent={ctrl.progressPercent}
            color={color}
            label={`Question ${Math.min(ctrl.answeredCount + (canGo ? 0 : 1) || 1, ctrl.totalAnswerable)} of ${ctrl.totalAnswerable}`}
          />
        </div>
      </header>

      {ctrl.resumed && (
        <div className="mx-auto mt-4 w-full max-w-form px-container-mobile sm:px-0">
          <div className="flex items-center justify-between gap-4 rounded-full bg-secondary-container px-5 py-3">
            <span className="font-body text-body-md text-on-secondary-container">
              Welcome back! We saved your place.
            </span>
            <button
              type="button"
              onClick={() => ctrl.setResumed(false)}
              className="font-head text-label-bold text-on-secondary-container underline"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Step content */}
      <main className="flex flex-1 items-start justify-center px-container-mobile py-stack-lg sm:px-container-desktop">
        <div className="w-full max-w-form">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderStep(step, ctrl, def.ageGroup)}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-stack-md rounded-md bg-error-container px-4 py-3 font-body text-body-md text-on-error-container">
              {error}
            </p>
          )}
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="glass sticky bottom-0 z-20 px-container-mobile py-4 sm:px-container-desktop">
        <div className="mx-auto flex w-full max-w-form items-center justify-between gap-4">
          <button type="button" onClick={ctrl.back} disabled={ctrl.isFirst} className="btn-ghost">
            ← Back
          </button>

          {step.type === "review" ? (
            <button type="button" onClick={submit} disabled={submitting} className="btn-primary flex-1 sm:flex-none">
              {submitting ? "Submitting…" : "✅ Submit"}
            </button>
          ) : (
            <button
              type="button"
              onClick={ctrl.next}
              disabled={!canGo}
              className="btn-primary flex-1 sm:flex-none"
              style={{ backgroundImage: `linear-gradient(to bottom, ${color}cc, ${color})` }}
            >
              Next →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
