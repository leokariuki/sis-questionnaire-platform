"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  percent: number;
  /** Competency color to tint the fill, defaults to primary. */
  color?: string;
  label?: string;
}

/** Thick, fully-rounded progress bar with animated gradient fill (spec §6, DESIGN.md). */
export function ProgressBar({ percent, color = "#7047a4", label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex items-center justify-between font-head text-label-bold text-on-surface-variant">
          <span>{label}</span>
          <span>{percent}%</span>
        </div>
      )}
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-surface-container-high"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundImage: `linear-gradient(90deg, ${color}cc, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
