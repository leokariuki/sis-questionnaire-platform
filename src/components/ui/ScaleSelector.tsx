"use client";

import { motion } from "framer-motion";
import type { ScaleOption } from "@/lib/types";

interface ScaleSelectorProps {
  options: ScaleOption[];
  value?: number;
  onSelect: (value: number) => void;
  color?: string;
}

/**
 * Large, tactile 1–5 answer buttons (spec §8). Shows number + text, with a
 * clear selected state using a 3px competency-colored stroke (DESIGN.md §Shapes).
 */
export function ScaleSelector({ options, value, onSelect, color = "#7047a4" }: ScaleSelectorProps) {
  return (
    <div className="flex flex-col gap-stack-sm" role="radiogroup" aria-label="How true is this for you?">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(opt.value)}
            whileTap={{ scale: 0.98 }}
            className="flex min-h-[64px] w-full items-center gap-4 rounded-full bg-surface-container-lowest px-5 text-left shadow-ambient transition-colors"
            style={{
              boxShadow: selected ? `0 0 0 3px ${color}, 0px 10px 30px rgba(0,0,0,0.05)` : undefined,
            }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-head text-body-lg font-bold transition-colors"
              style={{
                backgroundColor: selected ? color : `${color}1f`,
                color: selected ? "#fff" : color,
              }}
            >
              {opt.value}
            </span>
            <span className="font-body text-body-lg text-on-surface">{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
