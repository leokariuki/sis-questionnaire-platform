"use client";

import type { AgeGroup, Step } from "@/lib/types";
import { COMPETENCY_BY_ID } from "@/config/competencies";
import { ANSWER_SCALE, SCALE_INTRO } from "@/config/scale";
import { ScaleSelector } from "@/components/ui/ScaleSelector";
import { OptionList } from "@/components/ui/OptionList";
import { CompetencyImage } from "@/components/ui/CompetencyImage";
import { CreditLine } from "@/components/ui/CreditLine";
import type { QuestionnaireController } from "@/hooks/useQuestionnaire";

/** Shared screen frame: icon chip, title, optional helper, then content. */
export function ScreenFrame({
  icon,
  title,
  helper,
  color,
  children,
}: {
  icon?: string;
  title: string;
  helper?: string;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-stack-md">
      {icon && (
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
          style={{ backgroundColor: color ? `${color}1f` : "#ececff" }}
          aria-hidden
        >
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-2">
        <h1 className="font-head text-headline-lg-mobile text-on-surface sm:text-headline-lg">{title}</h1>
        {helper && <p className="font-body text-body-lg text-on-surface-variant">{helper}</p>}
      </div>
      {children}
    </div>
  );
}

const INTRO_LINES = [
  "We want to learn about your experience at SIS.",
  "Read each sentence. Choose the answer that is most true for you.",
  "There are no right or wrong answers. Just answer honestly.",
  "Your answers are private.",
  "If you do not understand a sentence, choose the closest answer.",
  "Thank you for helping us!",
];

export function renderStep(step: Step, ctrl: QuestionnaireController, ageGroup: AgeGroup) {
  switch (step.type) {
    case "intro":
      return (
        <ScreenFrame icon="📘" title="Welcome!">
          <ul className="flex flex-col gap-stack-sm">
            {INTRO_LINES.map((line) => (
              <li key={line} className="font-body text-body-lg text-on-surface-variant">
                {line}
              </li>
            ))}
          </ul>
          <CreditLine className="mt-stack-md border-t border-outline-variant pt-stack-sm" />
        </ScreenFrame>
      );

    case "code":
      return (
        <ScreenFrame icon="🔐" title="Enter your code" helper="Your code has 4 letters and 2 numbers. Example: ABCD12">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={6}
              value={ctrl.code}
              onChange={(e) => ctrl.setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ABCD12"
              aria-label="Student code"
              className="h-16 w-full rounded-full border-2 border-outline-variant bg-white px-6 text-center font-head text-3xl tracking-[0.4em] text-on-surface outline-none transition-all focus:border-primary focus:shadow-glow"
            />
            {ctrl.code.length === 6 && !ctrl.canAdvance(step) && (
              <p className="px-4 font-body text-body-md text-error">
                That code doesn&apos;t look right. It should be 4 letters then 2 numbers.
              </p>
            )}
          </div>
        </ScreenFrame>
      );

    case "scale-intro":
      return (
        <ScreenFrame icon={SCALE_INTRO.icon} title={SCALE_INTRO.title} helper={SCALE_INTRO.helper}>
          <div className="flex flex-col gap-stack-sm">
            {ANSWER_SCALE.map((o) => (
              <div
                key={o.value}
                className="flex items-center gap-4 rounded-full bg-surface-container-low px-5 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-head font-bold text-on-primary">
                  {o.value}
                </span>
                <span className="font-body text-body-lg text-on-surface">{o.label}</span>
              </div>
            ))}
          </div>
        </ScreenFrame>
      );

    case "section-intro": {
      const c = COMPETENCY_BY_ID[step.competencyId];
      return (
        <ScreenFrame icon={c.icon} title={c.label} color={c.color} helper="A few quick questions about this skill.">
          <div className="h-2 w-24 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
        </ScreenFrame>
      );
    }

    case "background": {
      const q = step.question;
      if (q.kind === "scale") {
        return (
          <ScreenFrame icon={q.icon} title={q.prompt} helper={q.helper}>
            <ScaleSelector
              options={q.options}
              value={ctrl.getAnswer(q.dbField) as number | undefined}
              onSelect={(v) => ctrl.setAnswer(q.dbField, v)}
            />
          </ScreenFrame>
        );
      }
      if (q.kind === "single") {
        return (
          <ScreenFrame icon={q.icon} title={q.prompt} helper={q.helper}>
            <OptionList
              options={q.options}
              value={ctrl.getAnswer(q.dbField) as string | undefined}
              onSelect={(v) => ctrl.setAnswer(q.dbField, v)}
            />
          </ScreenFrame>
        );
      }
      // multi
      const current = (ctrl.getAnswer(q.code) as string[] | undefined) ?? [];
      const toggle = (opt: string) => {
        const set = new Set(current);
        if (set.has(opt)) set.delete(opt);
        else if (set.size < q.maxChoices) set.add(opt);
        ctrl.setAnswer(q.code, Array.from(set));
      };
      return (
        <ScreenFrame icon={q.icon} title={q.prompt} helper={q.helper}>
          <OptionList options={q.options} value={current} onSelect={toggle} multi maxChoices={q.maxChoices} />
        </ScreenFrame>
      );
    }

    case "competency": {
      const c = COMPETENCY_BY_ID[step.competencyId];
      return (
        <ScreenFrame icon={c.icon} title={step.item.wording[ageGroup]} color={c.color}>
          <CompetencyImage
            competencyId={step.competencyId}
            code={step.item.code}
            alt={step.item.imageAlt}
            ageGroup={ageGroup}
          />
          <ScaleSelector
            options={ANSWER_SCALE}
            value={ctrl.getAnswer(step.item.code) as number | undefined}
            onSelect={(v) => ctrl.setAnswer(step.item.code, v)}
            color={c.color}
          />
        </ScreenFrame>
      );
    }

    case "transfer-scale":
      return (
        <ScreenFrame icon="🚀" title={step.question.wording[ageGroup]}>
          <ScaleSelector
            options={ANSWER_SCALE}
            value={ctrl.getAnswer(step.question.dbField) as number | undefined}
            onSelect={(v) => ctrl.setAnswer(step.question.dbField, v)}
          />
        </ScreenFrame>
      );

    case "open":
      return (
        <ScreenFrame icon={step.icon} title={step.prompt} helper="You can write a little or a lot — it's up to you.">
          <textarea
            value={(ctrl.getAnswer(step.dbField) as string | undefined) ?? ""}
            onChange={(e) => ctrl.setAnswer(step.dbField, e.target.value)}
            rows={5}
            aria-label={step.prompt}
            placeholder="Type your answer here..."
            className="w-full rounded-md border-2 border-outline-variant bg-white p-4 font-body text-body-lg text-on-surface outline-none transition-all focus:border-primary focus:shadow-glow"
          />
        </ScreenFrame>
      );

    case "review":
      return (
        <ScreenFrame
          icon="✅"
          title="All done — great work!"
          helper="When you press Submit, we'll create your personal SIS Skills Profile."
        >
          <p className="font-body text-body-md text-on-surface-variant">
            You can go back to change any answer before submitting.
          </p>
        </ScreenFrame>
      );

    default:
      return null;
  }
}
