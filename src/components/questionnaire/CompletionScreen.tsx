"use client";

import { motion } from "framer-motion";

export function CompletionScreen({
  reportUrl,
  studentCode,
  duplicate,
}: {
  reportUrl: string;
  studentCode: string;
  duplicate: boolean;
}) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-container-mobile py-stack-lg">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card w-full max-w-form p-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.6, repeat: 1 }}
          className="mx-auto mb-stack-md flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container text-5xl"
          aria-hidden
        >
          🎉
        </motion.div>
        <h1 className="font-head text-headline-lg text-on-surface">Thank you!</h1>
        <p className="mt-2 font-body text-body-lg text-on-surface-variant">
          Your answers are saved. We&apos;ve created your personal SIS Skills Profile.
        </p>

        {duplicate && (
          <p className="mt-stack-md rounded-md bg-tertiary-container/40 px-4 py-3 font-body text-body-md text-on-surface">
            Note: a response for code <strong>{studentCode}</strong> already existed. Your newest answers
            were saved too — an adviser may check which one to keep.
          </p>
        )}

        <div className="mt-stack-lg flex flex-col gap-stack-sm">
          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            📄 View my report
          </a>
          <p className="font-body text-body-md text-on-surface-variant">
            Your code: <span className="font-head font-semibold">{studentCode}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
