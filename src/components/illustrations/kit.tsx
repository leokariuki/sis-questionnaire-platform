import React from "react";

/**
 * Flat-vector illustration kit. Culturally neutral, text-free, friendly figures
 * and props composed into competency scenes (spec §10). Coordinate space is the
 * 320×192 viewBox used by CompetencyImage. No external assets — pure SVG.
 */

export const SKINS = ["#f4c9a6", "#e6ab7e", "#c68642", "#8d5a3c", "#ffd9b3"];
export const HAIRS = ["#2c2420", "#4a342a", "#1f1a17", "#5c3b28", "#3a2d2b"];
export const SHIRTS = ["#7047a4", "#2f6df0", "#16a06a", "#f08a24", "#1fb6c9", "#f0584f", "#8b4fd1"];

export function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

type ArmPose = "rest" | "up" | "point" | "wave" | "out" | "cross" | "think";

interface PersonProps {
  cx: number;
  cy: number; // top of head
  h?: number; // overall height
  seed?: number;
  skin?: string;
  hair?: string;
  shirt?: string;
  flip?: boolean;
  arm?: ArmPose;
  /** simple mood via mouth/eyebrows */
  mood?: "happy" | "neutral" | "calm" | "thinking";
}

/** A friendly upright figure. */
export function Person({
  cx,
  cy,
  h = 90,
  seed = 0,
  skin,
  hair,
  shirt,
  flip = false,
  arm = "rest",
  mood = "happy",
}: PersonProps) {
  const sk = skin ?? pick(SKINS, seed);
  const hr = hair ?? pick(HAIRS, seed + 1);
  const sh = shirt ?? pick(SHIRTS, seed + 2);
  const headR = h * 0.17;
  const headCy = cy + headR;
  const bodyTop = headCy + headR * 0.95;
  const bodyW = h * 0.42;
  const bodyH = h * 0.5;
  const bodyX = cx - bodyW / 2;

  const dir = flip ? -1 : 1;

  return (
    <g>
      {/* body */}
      <path
        d={`M ${bodyX} ${bodyTop + bodyH}
            L ${bodyX} ${bodyTop + bodyH * 0.32}
            Q ${bodyX} ${bodyTop} ${bodyX + bodyW * 0.5} ${bodyTop}
            Q ${bodyX + bodyW} ${bodyTop} ${bodyX + bodyW} ${bodyTop + bodyH * 0.32}
            L ${bodyX + bodyW} ${bodyTop + bodyH} Z`}
        fill={sh}
      />
      {/* neck */}
      <rect x={cx - headR * 0.32} y={headCy + headR * 0.4} width={headR * 0.64} height={headR * 0.7} fill={sk} />
      {/* head */}
      <circle cx={cx} cy={headCy} r={headR} fill={sk} />
      {/* hair */}
      <path
        d={`M ${cx - headR} ${headCy}
            Q ${cx - headR} ${headCy - headR * 1.4} ${cx} ${headCy - headR * 1.25}
            Q ${cx + headR} ${headCy - headR * 1.4} ${cx + headR} ${headCy}
            Q ${cx + headR * 0.6} ${headCy - headR * 0.5} ${cx} ${headCy - headR * 0.5}
            Q ${cx - headR * 0.6} ${headCy - headR * 0.5} ${cx - headR} ${headCy} Z`}
        fill={hr}
      />
      {/* eyes */}
      <circle cx={cx - headR * 0.38} cy={headCy + headR * 0.05} r={headR * 0.1} fill="#2b2330" />
      <circle cx={cx + headR * 0.38} cy={headCy + headR * 0.05} r={headR * 0.1} fill="#2b2330" />
      {/* mouth */}
      {mood === "happy" && (
        <path d={`M ${cx - headR * 0.32} ${headCy + headR * 0.45} Q ${cx} ${headCy + headR * 0.78} ${cx + headR * 0.32} ${headCy + headR * 0.45}`} stroke="#2b2330" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      )}
      {mood === "neutral" && (
        <line x1={cx - headR * 0.28} y1={headCy + headR * 0.55} x2={cx + headR * 0.28} y2={headCy + headR * 0.55} stroke="#2b2330" strokeWidth={1.4} strokeLinecap="round" />
      )}
      {mood === "calm" && (
        <path d={`M ${cx - headR * 0.28} ${headCy + headR * 0.5} Q ${cx} ${headCy + headR * 0.66} ${cx + headR * 0.28} ${headCy + headR * 0.5}`} stroke="#2b2330" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      )}
      {mood === "thinking" && (
        <circle cx={cx + headR * 0.1} cy={headCy + headR * 0.55} r={headR * 0.12} fill="none" stroke="#2b2330" strokeWidth={1.2} />
      )}

      {/* arms */}
      {renderArm(arm, cx, bodyTop, bodyW, bodyH, sk, sh, dir)}
    </g>
  );
}

function renderArm(
  arm: ArmPose,
  cx: number,
  bodyTop: number,
  bodyW: number,
  bodyH: number,
  sk: string,
  sh: string,
  dir: number,
) {
  const shoulderY = bodyTop + bodyH * 0.18;
  const sxR = cx + bodyW * 0.5;
  const sxL = cx - bodyW * 0.5;
  const armW = bodyW * 0.22;
  const stroke = sh;
  const cap = "round" as const;
  const common = { stroke, strokeWidth: armW, strokeLinecap: cap, fill: "none" as const };
  const handR = armW * 0.7;

  switch (arm) {
    case "up":
      return (
        <>
          <path d={`M ${sxR} ${shoulderY} Q ${sxR + 14} ${shoulderY - 18} ${sxR + 6} ${shoulderY - 34}`} {...common} />
          <circle cx={sxR + 6} cy={shoulderY - 36} r={handR} fill={sk} />
        </>
      );
    case "point":
      return (
        <>
          <path d={`M ${sxR} ${shoulderY} L ${sxR + 26 * dir} ${shoulderY + 6}`} {...common} />
          <circle cx={sxR + 26 * dir} cy={shoulderY + 6} r={handR} fill={sk} />
        </>
      );
    case "wave":
      return (
        <>
          <path d={`M ${sxR} ${shoulderY} Q ${sxR + 16} ${shoulderY - 6} ${sxR + 14} ${shoulderY - 26}`} {...common} />
          <circle cx={sxR + 14} cy={shoulderY - 28} r={handR} fill={sk} />
        </>
      );
    case "out":
      return (
        <>
          <path d={`M ${sxL} ${shoulderY} L ${sxL - 22} ${shoulderY + 10}`} {...common} />
          <path d={`M ${sxR} ${shoulderY} L ${sxR + 22} ${shoulderY + 10}`} {...common} />
          <circle cx={sxL - 22} cy={shoulderY + 10} r={handR} fill={sk} />
          <circle cx={sxR + 22} cy={shoulderY + 10} r={handR} fill={sk} />
        </>
      );
    case "cross":
      return (
        <path d={`M ${sxL + 4} ${shoulderY + 6} L ${sxR - 4} ${shoulderY + 18}`} {...common} />
      );
    case "think":
      return (
        <>
          <path d={`M ${sxR} ${shoulderY} L ${cx + 6} ${shoulderY - 18}`} {...common} />
          <circle cx={cx + 6} cy={shoulderY - 20} r={handR} fill={sk} />
        </>
      );
    default:
      return null;
  }
}

/** ── Props ──────────────────────────────────────────────────── */

export function SpeechBubble({ x, y, color = "#7047a4", w = 46, h = 30 }: { x: number; y: number; color?: string; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#fff" stroke={color} strokeWidth={2.5} />
      <path d={`M ${x + w * 0.3} ${y + h} l 6 8 l 6 -8 z`} fill="#fff" stroke={color} strokeWidth={2.5} />
      <circle cx={x + w * 0.3} cy={y + h / 2} r={2.4} fill={color} />
      <circle cx={x + w * 0.5} cy={y + h / 2} r={2.4} fill={color} />
      <circle cx={x + w * 0.7} cy={y + h / 2} r={2.4} fill={color} />
    </g>
  );
}

export function Lightbulb({ x, y, color = "#e8b321", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={12} fill={color} />
      <rect x={-5} y={10} width={10} height={6} rx={2} fill="#9a8418" />
      {[-1, 0, 1].map((i) => (
        <line key={i} x1={i * 14} y1={i === 0 ? -20 : -14} x2={i * 9} y2={i === 0 ? -16 : -11} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      ))}
    </g>
  );
}

export function Book({ x, y, color = "#2f6df0", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -16 -12 L 0 -8 L 0 14 L -16 10 Z" fill={color} />
      <path d="M 16 -12 L 0 -8 L 0 14 L 16 10 Z" fill={color} opacity={0.8} />
      <line x1={0} y1={-8} x2={0} y2={14} stroke="#fff" strokeWidth={1.5} />
    </g>
  );
}

export function Tablet({ x, y, color = "#1fb6c9", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-13} y={-17} width={26} height={34} rx={4} fill="#2b2f48" />
      <rect x={-10} y={-13} width={20} height={26} rx={2} fill={color} opacity={0.5} />
    </g>
  );
}

export function Heart({ x, y, color = "#f0584f", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 6 C -8 -4 -16 2 -8 10 L 0 16 L 8 10 C 16 2 8 -4 0 6 Z"
      fill={color}
    />
  );
}

export function Puzzle({ x, y, color = "#8b4fd1", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-12} y={-12} width={24} height={24} rx={4} fill={color} />
      <circle cx={12} cy={0} r={5} fill={color} />
      <circle cx={0} cy={-12} r={5} fill="#fff" opacity={0.85} />
    </g>
  );
}

export function Clock({ x, y, color = "#1fb6c9", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={14} fill="#fff" stroke={color} strokeWidth={3} />
      <line x1={0} y1={0} x2={0} y2={-8} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <line x1={0} y1={0} x2={6} y2={3} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

export function Star({ x, y, color = "#e8b321", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / 5;
    const ai = a + Math.PI / 5;
    return `${Math.cos(a) * 10},${Math.sin(a) * 10} ${Math.cos(ai) * 4.5},${Math.sin(ai) * 4.5}`;
  }).join(" ");
  return <polygon transform={`translate(${x} ${y}) scale(${s})`} points={pts} fill={color} />;
}

export function Check({ x, y, color = "#16a06a", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={12} fill={color} />
      <path d="M -5 0 L -1 5 L 6 -5" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function Mountains({ x, y, color = "#7047a4", w = 90 }: { x: number; y: number; color?: string; w?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={0.5}>
      <path d={`M 0 0 L ${w * 0.3} ${-w * 0.32} L ${w * 0.5} 0 Z`} fill={color} />
      <path d={`M ${w * 0.35} 0 L ${w * 0.68} ${-w * 0.42} L ${w} 0 Z`} fill={color} opacity={0.8} />
    </g>
  );
}

export function Backpack({ x, y, color = "#1fb6c9", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-12} y={-14} width={24} height={30} rx={8} fill={color} />
      <rect x={-8} y={-2} width={16} height={12} rx={3} fill="#fff" opacity={0.8} />
      <path d="M -8 -14 Q 0 -22 8 -14" stroke={color} strokeWidth={3} fill="none" />
    </g>
  );
}

export function Globe({ x, y, color = "#2f6df0", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={14} fill={color} opacity={0.85} />
      <ellipse cx={0} cy={0} rx={6} ry={14} fill="none" stroke="#fff" strokeWidth={1.4} />
      <line x1={-14} y1={0} x2={14} y2={0} stroke="#fff" strokeWidth={1.4} />
    </g>
  );
}

export function Flag({ x, y, color = "#f08a24", s = 1 }: { x: number; y: number; color?: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1={0} y1={-2} x2={0} y2={22} stroke="#7c7482" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M 0 -2 L 18 3 L 0 10 Z" fill={color} />
    </g>
  );
}

/** Ground line + soft sun for grounding most scenes. */
export function Ground({ color }: { color: string }) {
  return (
    <>
      <ellipse cx={160} cy={178} rx={150} ry={16} fill={color} opacity={0.1} />
    </>
  );
}
