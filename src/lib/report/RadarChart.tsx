/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { Svg, Polygon, Circle, Line, Path, Text as SvgText } from "@react-pdf/renderer";
import type { CompetencyId, ScoreResult } from "@/lib/types";
import { COMPETENCIES } from "@/config/competencies";

/** Radar chart of the seven competency scores (spec §26 suggested chart). */
export function RadarChart({ scores, size = 280 }: { scores: ScoreResult; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 46;
  const n = COMPETENCIES.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });

  // Grid rings for values 1..5.
  const rings = [1, 2, 3, 4, 5].map((v) => {
    const r = (v / 5) * R;
    const pts = COMPETENCIES.map((_, i) => {
      const p = point(i, r);
      return `${p.x},${p.y}`;
    }).join(" ");
    return pts;
  });

  // Data polygon.
  const dataPts = COMPETENCIES.map((c, i) => {
    const val = scores.byCompetency[c.id as CompetencyId] || 0;
    const p = point(i, (val / 5) * R);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <Svg width={size} height={size}>
      {rings.map((pts, idx) => (
        <Polygon key={idx} points={pts} stroke="#cdc3d2" strokeWidth={0.75} fill="none" />
      ))}
      {COMPETENCIES.map((_, i) => {
        const p = point(i, R);
        return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e6ff" strokeWidth={0.75} />;
      })}
      <Polygon points={dataPts} fill="#7047a4" fillOpacity={0.22} stroke="#7047a4" strokeWidth={2} />
      {COMPETENCIES.map((c, i) => {
        const val = scores.byCompetency[c.id as CompetencyId] || 0;
        const p = point(i, (val / 5) * R);
        return <Circle key={c.id} cx={p.x} cy={p.y} r={3} fill={c.color} />;
      })}
      {COMPETENCIES.map((c, i) => {
        const p = point(i, R + 16);
        return (
          <SvgText
            key={`l-${c.id}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            style={{ fontSize: 7, fill: "#4b4451" }}
          >
            {c.label}
          </SvgText>
        );
      })}
      <Path d="" />
    </Svg>
  );
}

/** Horizontal bar per competency (used in the report body for clarity). */
export function ScoreBars({ scores, width = 360 }: { scores: ScoreResult; width?: number }) {
  const rowH = 26;
  const labelW = 120;
  const barMax = width - labelW - 36;
  const height = COMPETENCIES.length * rowH + 8;
  return (
    <Svg width={width} height={height}>
      {COMPETENCIES.map((c, i) => {
        const val = scores.byCompetency[c.id as CompetencyId] || 0;
        const y = i * rowH + 4;
        const w = (val / 5) * barMax;
        return (
          <React.Fragment key={c.id}>
            <SvgText x={0} y={y + 13} style={{ fontSize: 8, fill: "#161a32" }}>
              {c.label}
            </SvgText>
            <Path
              d={roundedRect(labelW, y + 4, barMax, 12, 6)}
              fill="#ececff"
            />
            <Path d={roundedRect(labelW, y + 4, Math.max(w, 6), 12, 6)} fill={c.color} />
            <SvgText x={labelW + barMax + 6} y={y + 13} style={{ fontSize: 8, fill: "#4b4451" }}>
              {val ? val.toFixed(2) : "—"}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, h / 2, w / 2);
  return `M${x + rr},${y} h${w - 2 * rr} a${rr},${rr} 0 0 1 ${rr},${rr} v${h - 2 * rr} a${rr},${rr} 0 0 1 -${rr},${rr} h-${w - 2 * rr} a${rr},${rr} 0 0 1 -${rr},-${rr} v-${h - 2 * rr} a${rr},${rr} 0 0 1 ${rr},-${rr} z`;
}
