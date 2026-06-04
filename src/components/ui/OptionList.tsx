"use client";

import { motion } from "framer-motion";

interface OptionListProps {
  options: string[];
  /** Single-select value, or array for multi-select. */
  value?: string | string[];
  onSelect: (value: string) => void;
  multi?: boolean;
  maxChoices?: number;
  color?: string;
}

/** Large pill option cards for single/multi choice questions (spec §6). */
export function OptionList({
  options,
  value,
  onSelect,
  multi = false,
  maxChoices,
  color = "#7047a4",
}: OptionListProps) {
  const selectedSet = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const atLimit = multi && maxChoices !== undefined && selectedSet.size >= maxChoices;

  return (
    <div className="flex flex-col gap-stack-sm" role={multi ? "group" : "radiogroup"}>
      {options.map((opt) => {
        const selected = selectedSet.has(opt);
        const disabled = !selected && atLimit;
        return (
          <motion.button
            key={opt}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onSelect(opt)}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className="flex min-h-[60px] w-full items-center gap-4 rounded-full bg-surface-container-lowest px-6 text-left shadow-ambient transition-all disabled:opacity-40"
            style={{
              boxShadow: selected ? `0 0 0 3px ${color}, 0px 10px 30px rgba(0,0,0,0.05)` : undefined,
            }}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
              style={{
                borderColor: selected ? color : "#cdc3d2",
                backgroundColor: selected ? color : "transparent",
              }}
              aria-hidden
            >
              {selected && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="font-body text-body-lg text-on-surface">{opt}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
