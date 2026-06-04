import React from "react";
import {
  Person,
  SpeechBubble,
  Lightbulb,
  Book,
  Tablet,
  Heart,
  Puzzle,
  Clock,
  Star,
  Check,
  Mountains,
  Backpack,
  Globe,
  Flag,
  Ground,
} from "./kit";

/**
 * One bespoke scene per competency item (COM1…TEAM6), composed from the kit.
 * Each depicts the item's action — culturally neutral, text-free (spec §10).
 * Returns null for unknown codes so CompetencyImage can fall back gracefully.
 */

/** Small local helpers used across scenes. */
function Magnifier({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={0} r={9} fill="none" stroke={color} strokeWidth={3} />
      <line x1={7} y1={7} x2={15} y2={15} stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}
function Redo({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -10 0 A 10 10 0 1 1 -6 7" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path d="M -12 -6 L -10 2 L -3 -2 Z" fill={color} />
    </g>
  );
}
function Arrows({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -12 -4 L 10 -4" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path d="M 6 -9 L 12 -4 L 6 1 Z" fill={color} />
      <path d="M 12 8 L -10 8" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path d="M -6 3 L -12 8 L -6 13 Z" fill={color} />
    </g>
  );
}
function Blocks({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-12} y={4} width={14} height={14} rx={2} fill={color} />
      <rect x={4} y={4} width={14} height={14} rx={2} fill={color} opacity={0.7} />
      <rect x={-4} y={-11} width={14} height={14} rx={2} fill={color} opacity={0.85} />
    </g>
  );
}
function Palette({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={15} ry={12} fill="#fff" stroke={color} strokeWidth={2.5} />
      <circle cx={-7} cy={-3} r={2.6} fill="#f0584f" />
      <circle cx={0} cy={-5} r={2.6} fill="#2f6df0" />
      <circle cx={7} cy={-2} r={2.6} fill="#e8b321" />
      <circle cx={3} cy={4} r={2.6} fill="#16a06a" />
    </g>
  );
}
function Options({ x, y, color, n = 3 }: { x: number; y: number; color: string; n?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={i * 20 - (n * 20) / 2} y={0} width={15} height={15} rx={3} fill={color} opacity={0.4 + i * 0.2} />
      ))}
    </g>
  );
}
function Gear({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={0} r={9} fill="none" stroke={color} strokeWidth={3} />
      <circle cx={0} cy={0} r={3} fill={color} />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI) / 3;
        return <line key={i} x1={Math.cos(a) * 9} y1={Math.sin(a) * 9} x2={Math.cos(a) * 14} y2={Math.sin(a) * 14} stroke={color} strokeWidth={3} strokeLinecap="round" />;
      })}
    </g>
  );
}

type Scene = (color: string) => React.ReactNode;

const SCENES: Record<string, Scene> = {
  // 🔵 Communication
  COM1: (c) => (<g><Ground color={c} /><Person cx={120} cy={66} seed={1} arm="point" /><SpeechBubble x={150} y={50} color={c} /><Person cx={240} cy={92} h={62} seed={7} mood="neutral" /></g>),
  COM2: (c) => (<g><Ground color={c} /><Person cx={108} cy={70} seed={2} arm="out" /><SpeechBubble x={140} y={52} color={c} /><Person cx={224} cy={70} seed={9} flip mood="neutral" arm="think" /></g>),
  COM3: (c) => (<g><Ground color={c} /><Person cx={160} cy={70} seed={3} /><SpeechBubble x={60} y={48} color={c} w={40} h={26} /><SpeechBubble x={222} y={48} color={c} w={40} h={26} /><Person cx={56} cy={110} h={50} seed={11} mood="neutral" /><Person cx={262} cy={110} h={50} seed={5} flip mood="neutral" /></g>),
  COM4: (c) => (<g><Ground color={c} /><Person cx={150} cy={66} seed={4} arm="up" /><SpeechBubble x={176} y={36} color={c} w={36} h={24} /></g>),
  COM5: (c) => (<g><Ground color={c} /><Person cx={112} cy={72} seed={5} arm="out" mood="calm" /><Person cx={216} cy={72} seed={12} flip arm="out" mood="calm" /><SpeechBubble x={138} y={46} color={c} w={44} h={26} /></g>),
  COM6: (c) => (<g><Ground color={c} /><Person cx={160} cy={56} seed={6} arm="out" /><SpeechBubble x={190} y={42} color={c} /><Person cx={92} cy={120} h={44} seed={2} mood="neutral" /><Person cx={160} cy={124} h={44} seed={8} mood="neutral" /><Person cx={228} cy={120} h={44} seed={4} mood="neutral" /></g>),

  // 🟠 Leadership
  LEAD1: (c) => (<g><Ground color={c} /><Person cx={130} cy={64} seed={1} arm="up" /><Flag x={158} y={36} color={c} s={1.1} /><Person cx={236} cy={104} h={52} seed={6} mood="neutral" /></g>),
  LEAD2: (c) => (<g><Ground color={c} /><Person cx={150} cy={66} seed={2} arm="point" /><Check x={208} y={92} color={c} s={1.2} /></g>),
  LEAD3: (c) => (<g><Ground color={c} /><Person cx={116} cy={68} seed={3} arm="wave" /><Person cx={214} cy={74} h={70} seed={10} flip mood="happy" /><Heart x={168} y={56} color={c} s={0.8} /></g>),
  LEAD4: (c) => (<g><Mountains x={150} y={150} color={c} w={120} /><Ground color={c} /><Person cx={132} cy={70} seed={4} arm="point" /><Flag x={236} y={64} color={c} /><Person cx={206} cy={108} h={48} seed={1} mood="neutral" /></g>),
  LEAD5: (c) => (<g><Mountains x={140} y={150} color={c} w={130} /><Ground color={c} /><Person cx={160} cy={70} seed={5} mood="calm" arm="cross" /><Star x={92} y={60} color={c} s={0.7} /><Star x={232} y={70} color={c} s={0.6} /></g>),
  LEAD6: (c) => (<g><Ground color={c} /><Person cx={120} cy={62} seed={6} /><Star x={120} y={40} color={c} s={1} /><Person cx={206} cy={104} h={50} seed={3} mood="happy" /><Person cx={258} cy={108} h={46} seed={9} mood="happy" /></g>),

  // 🟢 Emotional skills
  EMO1: (c) => (<g><Ground color={c} /><Person cx={150} cy={70} seed={1} arm="think" mood="thinking" /><Heart x={206} y={66} color={c} s={1.1} /></g>),
  EMO2: (c) => (<g><Ground color={c} /><circle cx={160} cy={92} r={54} fill={c} opacity={0.08} /><Person cx={160} cy={72} seed={2} mood="calm" arm="cross" /></g>),
  EMO3: (c) => (<g><Ground color={c} /><Person cx={150} cy={74} seed={3} mood="calm" arm="cross" /><Check x={210} y={96} color={c} /><Star x={96} y={60} color={c} s={0.6} /></g>),
  EMO4: (c) => (<g><Ground color={c} /><Person cx={118} cy={70} seed={4} arm="think" /><Person cx={216} cy={80} h={66} seed={11} flip mood="neutral" /><Heart x={168} y={58} color={c} s={0.7} /></g>),
  EMO5: (c) => (<g><Ground color={c} /><Person cx={120} cy={72} seed={5} arm="out" /><Person cx={206} cy={80} h={64} seed={8} flip mood="calm" /><Heart x={164} y={56} color={c} /></g>),
  EMO6: (c) => (<g><Ground color={c} /><Person cx={112} cy={74} seed={6} arm="out" mood="calm" /><Person cx={208} cy={74} seed={2} flip arm="out" mood="calm" /><Check x={160} y={64} color={c} /></g>),

  // 🟣 Thinking skills
  CT1: (c) => (<g><Ground color={c} /><Person cx={120} cy={70} seed={1} arm="think" mood="thinking" /><Options x={216} y={86} color={c} n={3} /></g>),
  CT2: (c) => (<g><Ground color={c} /><Person cx={130} cy={68} seed={2} arm="point" /><SpeechBubble x={162} y={48} color={c} /><Lightbulb x={210} y={58} color={c} s={0.8} /></g>),
  CT3: (c) => (<g><Ground color={c} /><Person cx={130} cy={70} seed={3} arm="point" /><Tablet x={208} y={96} color={c} /><Magnifier x={232} y={78} color={c} /></g>),
  CT4: (c) => (<g><Ground color={c} /><Person cx={130} cy={70} seed={4} arm="point" /><Puzzle x={212} y={92} color={c} s={1.1} /></g>),
  CT5: (c) => (<g><Ground color={c} /><Person cx={130} cy={70} seed={5} /><Redo x={206} y={84} color={c} /><Check x={236} y={96} color={c} s={0.8} /></g>),
  CT6: (c) => (<g><Ground color={c} /><Person cx={140} cy={70} seed={6} arm="think" mood="thinking" /><SpeechBubble x={176} y={48} color={c} w={40} h={26} /></g>),

  // 🟡 Creativity
  CRE1: (c) => (<g><Ground color={c} /><Person cx={140} cy={70} seed={1} arm="up" /><Lightbulb x={196} y={56} color={c} s={1.2} /><Star x={232} y={48} color={c} s={0.6} /></g>),
  CRE2: (c) => (<g><Ground color={c} /><Person cx={128} cy={70} seed={2} arm="point" /><Puzzle x={206} y={88} color={c} /><Arrows x={244} y={92} color={c} /></g>),
  CRE3: (c) => (<g><Ground color={c} /><Person cx={134} cy={70} seed={3} arm="point" /><Tablet x={210} y={94} color={c} /><Star x={244} y={66} color={c} s={0.7} /></g>),
  CRE4: (c) => (<g><Ground color={c} /><Person cx={96} cy={80} h={64} seed={4} /><Person cx={160} cy={74} h={70} seed={9} /><Person cx={224} cy={80} h={64} seed={2} flip /><Lightbulb x={160} y={44} color={c} /></g>),
  CRE5: (c) => (<g><Ground color={c} /><Person cx={134} cy={70} seed={5} arm="point" /><Blocks x={214} y={86} color={c} /></g>),
  CRE6: (c) => (<g><Ground color={c} /><Person cx={132} cy={70} seed={6} arm="point" /><Palette x={214} y={86} color={c} /><Star x={250} y={60} color={c} s={0.6} /></g>),

  // 🟦 Independence
  AUTO1: (c) => (<g><Ground color={c} /><Person cx={134} cy={70} seed={1} arm="point" /><Clock x={214} y={86} color={c} s={1.1} /></g>),
  AUTO2: (c) => (<g><Ground color={c} /><Person cx={140} cy={72} seed={2} mood="calm" arm="cross" /><Arrows x={216} y={88} color={c} /></g>),
  AUTO3: (c) => (<g><Ground color={c} /><Person cx={134} cy={70} seed={3} arm="point" /><Backpack x={216} y={92} color={c} s={1.1} /></g>),
  AUTO4: (c) => (<g><Ground color={c} /><Person cx={134} cy={70} seed={4} arm="point" /><Gear x={214} y={86} color={c} /></g>),
  AUTO5: (c) => (<g><Ground color={c} /><Person cx={120} cy={70} seed={5} arm="think" mood="thinking" /><Check x={206} y={84} color={c} /><Options x={236} y={104} color={c} n={2} /></g>),
  AUTO6: (c) => (<g><Ground color={c} /><Person cx={130} cy={70} seed={6} /><Clock x={206} y={84} color={c} /><Check x={240} y={98} color={c} s={0.8} /></g>),

  // 🔴 Teamwork
  TEAM1: (c) => (<g><Ground color={c} /><Person cx={112} cy={74} h={70} seed={1} /><Person cx={206} cy={74} h={70} seed={8} flip /><Puzzle x={160} y={92} color={c} /></g>),
  TEAM2: (c) => (<g><Ground color={c} /><Person cx={112} cy={74} h={68} seed={2} /><Person cx={208} cy={74} h={68} seed={6} flip /><Blocks x={160} y={92} color={c} /></g>),
  TEAM3: (c) => (<g><Ground color={c} /><Person cx={100} cy={82} h={60} seed={3} /><Person cx={160} cy={74} h={70} seed={9} arm="up" /><Person cx={222} cy={82} h={60} seed={1} flip /><Lightbulb x={160} y={44} color={c} s={0.8} /></g>),
  TEAM4: (c) => (<g><Ground color={c} /><Person cx={112} cy={74} seed={4} flip mood="neutral" /><Person cx={210} cy={74} seed={10} arm="point" /><SpeechBubble x={150} y={50} color={c} w={44} h={26} /></g>),
  TEAM5: (c) => (<g><Ground color={c} /><Person cx={116} cy={72} seed={5} arm="out" /><Person cx={206} cy={80} h={64} seed={2} flip mood="happy" /><Heart x={166} y={60} color={c} s={0.7} /></g>),
  TEAM6: (c) => (<g><Ground color={c} /><Person cx={96} cy={84} h={58} seed={0} /><Person cx={160} cy={80} h={62} seed={2} /><Person cx={224} cy={84} h={58} seed={3} flip /><Globe x={160} y={44} color={c} s={0.9} /></g>),
};

export function hasScene(code: string): boolean {
  return code in SCENES;
}

export function Scene({ code, color }: { code: string; color: string }) {
  const scene = SCENES[code];
  if (!scene) return null;
  return (
    <svg viewBox="0 0 320 192" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {scene(color)}
    </svg>
  );
}
