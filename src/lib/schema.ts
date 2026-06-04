import { z } from "zod";
import { codeSchema } from "@/lib/code";

/**
 * Validation for an incoming questionnaire submission.
 * Answers are loosely typed (number | string | string[]) and validated
 * structurally; competency completeness is checked server-side against
 * the questionnaire definition.
 */
const answerValue = z.union([z.number(), z.string(), z.array(z.string())]);

export const submissionSchema = z.object({
  questionnaireId: z.string().min(1),
  code: codeSchema,
  answers: z.record(answerValue),
  /** Client-generated draft id for idempotent autosave/resume (optional). */
  draftId: z.string().optional(),
});

export type SubmissionPayload = z.infer<typeof submissionSchema>;
