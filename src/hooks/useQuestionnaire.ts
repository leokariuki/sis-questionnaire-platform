"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnswerMap, AnswerValue, QuestionnaireDefinition, Step } from "@/lib/types";
import { buildSteps, isAnswerableStep } from "@/lib/flow";
import { isValidCodeFormat } from "@/lib/code";

interface DraftState {
  index: number;
  answers: AnswerMap;
  code: string;
  updatedAt: string;
}

function draftKey(id: string): string {
  return `sis:draft:${id}`;
}

/**
 * Drives the one-question-per-screen flow with autosave + resume.
 * Draft state is persisted to localStorage so a student can close the tab
 * and return to exactly where they were (spec §6 resume capability).
 */
export function useQuestionnaire(def: QuestionnaireDefinition, initialCode?: string) {
  const steps = useMemo<Step[]>(() => buildSteps(def), [def]);
  const answerableSteps = useMemo(() => steps.filter(isAnswerableStep), [steps]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [code, setCode] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [resumed, setResumed] = useState(false);
  const firstSave = useRef(true);

  // Hydrate from saved draft on mount.
  useEffect(() => {
    let draftCode = "";
    try {
      const raw = localStorage.getItem(draftKey(def.id));
      if (raw) {
        const d = JSON.parse(raw) as DraftState;
        setAnswers(d.answers ?? {});
        draftCode = d.code ?? "";
        setCode(draftCode);
        setIndex(Math.min(d.index ?? 0, steps.length - 1));
        if ((d.answers && Object.keys(d.answers).length > 0) || d.index > 0) {
          setResumed(true);
        }
      }
    } catch {
      /* ignore corrupt draft */
    }
    // Pre-fill from a personalised link (?code=ABCD12) when no draft code exists,
    // so emailed links open the questionnaire with the student's code already set.
    if (!draftCode && initialCode) {
      const normalized = initialCode.trim().toUpperCase();
      if (isValidCodeFormat(normalized)) setCode(normalized);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.id]);

  // Autosave whenever state changes (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    if (firstSave.current) {
      firstSave.current = false;
    }
    const draft: DraftState = { index, answers, code, updatedAt: new Date().toISOString() };
    try {
      localStorage.setItem(draftKey(def.id), JSON.stringify(draft));
    } catch {
      /* storage full / disabled — non-fatal */
    }
  }, [hydrated, index, answers, code, def.id]);

  const current = steps[index];

  const setAnswer = useCallback((key: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getAnswer = useCallback((key: string) => answers[key], [answers]);

  /** Whether the current step is satisfied and the student may advance. */
  const canAdvance = useCallback(
    (step: Step): boolean => {
      switch (step.type) {
        case "code":
          return isValidCodeFormat(code);
        case "competency":
          return typeof answers[step.item.code] === "number";
        case "transfer-scale":
          return typeof answers[step.question.dbField] === "number";
        case "background": {
          const q = step.question;
          if (q.kind === "multi") {
            const v = answers[q.code];
            return Array.isArray(v) && v.length >= 1;
          }
          if (q.kind === "single") return typeof answers[q.dbField] === "string";
          return typeof answers[q.dbField] === "number";
        }
        case "open":
          return true; // open answers are optional
        default:
          return true; // intro / scale-intro / section-intro / review
      }
    },
    [answers, code],
  );

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const back = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback(
    (id: string) => {
      const i = steps.findIndex((s) => s.id === id);
      if (i >= 0) setIndex(i);
    },
    [steps],
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey(def.id));
    } catch {
      /* ignore */
    }
  }, [def.id]);

  // Progress: how many answerable steps are satisfied vs. total.
  const answeredCount = useMemo(
    () => answerableSteps.filter((s) => canAdvance(s)).length,
    [answerableSteps, canAdvance],
  );
  const totalAnswerable = answerableSteps.length;

  // Position of the current step among answerable steps (for "X of N").
  const currentAnswerablePosition = useMemo(() => {
    const answerableBefore = steps.slice(0, index + 1).filter(isAnswerableStep).length;
    return isAnswerableStep(current) ? answerableBefore : answerableBefore;
  }, [steps, index, current]);

  const progressPercent = totalAnswerable
    ? Math.round((Math.min(answeredCount, totalAnswerable) / totalAnswerable) * 100)
    : 0;

  return {
    steps,
    index,
    current,
    hydrated,
    resumed,
    setResumed,
    answers,
    code,
    setCode,
    setAnswer,
    getAnswer,
    canAdvance,
    next,
    back,
    goTo,
    clearDraft,
    progressPercent,
    answeredCount,
    totalAnswerable,
    currentAnswerablePosition,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
  };
}

export type QuestionnaireController = ReturnType<typeof useQuestionnaire>;
