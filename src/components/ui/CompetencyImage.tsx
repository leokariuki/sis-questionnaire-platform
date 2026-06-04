"use client";

import type { AgeGroup, CompetencyId } from "@/lib/types";
import { COMPETENCY_BY_ID } from "@/config/competencies";
import { Scene, hasScene } from "@/components/illustrations/scenes";

interface CompetencyImageProps {
  competencyId: CompetencyId;
  code: string;
  alt: string;
  ageGroup: AgeGroup;
}

/**
 * Illustration slot for a competency item (spec §10). Priority:
 *   1. A generated raster asset at /images/<code>_<age>.png (if deployed)
 *   2. A bespoke custom SVG scene from the illustration kit
 *   3. The competency emoji on a soft tint (ultimate fallback)
 * All options are culturally neutral and text-free.
 */
export function CompetencyImage({ competencyId, code, alt, ageGroup }: CompetencyImageProps) {
  const c = COMPETENCY_BY_ID[competencyId];
  const scene = hasScene(code);
  const tag = ageGroup === "KIDS_9_12" ? "kids" : "teens";

  // AI-photo overlay: only rendered when a base URL is configured at runtime
  // (window.SIS_CONFIG.imageBase). Until then we never request a missing PNG,
  // so there are no broken-image icons — the SVG scene is the visual.
  const cfg = typeof window !== "undefined" ? (window as any).SIS_CONFIG : undefined;
  const imageBase = cfg?.imageBase;
  const imageVersion = cfg?.imageVersion ?? "1";
  const photoSrc = imageBase
    ? `${String(imageBase).replace(/\/$/, "")}/${code}_${tag}.png?v=${imageVersion}`
    : null;

  return (
    <div
      className="relative mx-auto flex aspect-[5/3] w-full max-w-md items-center justify-center overflow-hidden rounded-md"
      style={{ backgroundColor: `${c.color}14` }}
      role="img"
      aria-label={alt}
    >
      {/* Soft organic background blobs */}
      <svg viewBox="0 0 320 192" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
        <circle cx="64" cy="54" r="78" fill={c.color} opacity="0.10" />
        <circle cx="256" cy="150" r="92" fill={c.color} opacity="0.08" />
        <circle cx="250" cy="40" r="34" fill={c.color} opacity="0.12" />
      </svg>

      {/* Custom SVG scene (primary visual) */}
      {scene && (
        <div className="absolute inset-0" aria-hidden>
          <Scene code={code} color={c.color} />
        </div>
      )}

      {/* AI photo overlay (only when configured) */}
      {photoSrc && (
        <img
          src={photoSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Emoji fallback only when there is no scene */}
      {!scene && (
        <span className="relative select-none text-6xl" aria-hidden>
          {c.icon}
        </span>
      )}
    </div>
  );
}
