import type { CompetencyId, ScoreResult } from "@/lib/types";
import { COMPETENCIES } from "@/config/competencies";

/** HTML/SVG radar chart (browser-safe; mirrors the PDF version). */
export function RadarChartWeb({ scores, size = 300 }: { scores: ScoreResult; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 52;
  const n = COMPETENCIES.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });

  const rings = [1, 2, 3, 4, 5].map((v) =>
    COMPETENCIES.map((_, i) => {
      const p = point(i, (v / 6) * R);
      return `${p.x},${p.y}`;
    }).join(" "),
  );

  const dataPts = COMPETENCIES.map((c, i) => {
    const p = point(i, ((scores.byCompetency[c.id as CompetencyId] || 0) / 6) * R);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Skills radar chart">
      {rings.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#cdc3d2" strokeWidth={0.75} />
      ))}
      {COMPETENCIES.map((_, i) => {
        const p = point(i, R);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e6ff" strokeWidth={0.75} />;
      })}
      <polygon points={dataPts} fill="#7047a4" fillOpacity={0.22} stroke="#7047a4" strokeWidth={2} />
      {COMPETENCIES.map((c, i) => {
        const p = point(i, ((scores.byCompetency[c.id as CompetencyId] || 0) / 6) * R);
        return <circle key={c.id} cx={p.x} cy={p.y} r={3.5} fill={c.color} />;
      })}
      {COMPETENCIES.map((c, i) => {
        const p = point(i, R + 18);
        return (
          <text key={`t-${c.id}`} x={p.x} y={p.y} textAnchor="middle" fontSize={8.5} fill="#4b4451">
            {c.label}
          </text>
        );
      })}
    </svg>
  );
}

/** HTML bar list of competency scores. */
export function ScoreBarsWeb({ scores }: { scores: ScoreResult }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {COMPETENCIES.map((c) => {
        const val = scores.byCompetency[c.id as CompetencyId] || 0;
        return (
          <div key={c.id} className="flex items-center gap-3">
            <span className="w-32 shrink-0 font-body text-body-md text-on-surface">{c.label}</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full" style={{ width: `${(val / 6) * 100}%`, backgroundColor: c.color }} />
            </div>
            <span className="w-10 text-right font-head text-label-bold text-on-surface-variant">
              {val ? val.toFixed(2) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
