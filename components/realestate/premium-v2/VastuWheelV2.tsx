"use client";

import { useState } from "react";
import { VASTU_WHEEL } from "@/lib/premium-v2/services";

const SECTOR_FILLS = [
  "#dbeafe",
  "#fef3c7",
  "#e9d5ff",
  "#fce7f3",
  "#fde68a",
  "#d1fae5",
  "#cffafe",
  "#fecaca",
];

const CENTRE = 200;
const SECTOR_R = 150;
const LABEL_R = 112;
/** Sector 0 starts at due east and each covers 45°, running clockwise. */
const SWEEP = 45;
const START = -22.5;

function polar(radius: number, degrees: number) {
  const rad = (degrees * Math.PI) / 180;
  return { x: CENTRE + radius * Math.cos(rad), y: CENTRE + radius * Math.sin(rad) };
}

function sectorPath(index: number): string {
  const a0 = START + index * SWEEP;
  const a1 = a0 + SWEEP;
  const p0 = polar(SECTOR_R, a0);
  const p1 = polar(SECTOR_R, a1);
  return `M ${CENTRE} ${CENTRE} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${SECTOR_R} ${SECTOR_R} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
}

/**
 * The room-orientation wheel, with each sector explaining itself.
 *
 * The wheel was previously a labelled diagram and nothing more — it named the
 * eight placements without saying why any of them is what it is, which is the
 * whole content of a vastu consultation.
 *
 * Hover and focus both open a sector, so a pointer reads it by moving across
 * and a keyboard reads it by tabbing. On touch there is no hover at all, so
 * tapping a sector selects it and the panel stays open until another is
 * tapped — the panel is rendered below the wheel rather than as a floating
 * tooltip for the same reason: a tooltip anchored to a finger is under the
 * finger.
 */
export default function VastuWheelV2() {
  const [active, setActive] = useState(0);
  const sector = VASTU_WHEEL[active];

  return (
    <figure className="mx-auto w-full max-w-[420px]">
      <svg viewBox="0 0 400 400" className="h-auto w-full" role="img" aria-labelledby="vastu-wheel-title">
        <title id="vastu-wheel-title">
          Vastu room orientation wheel — the direction each room is traditionally placed in
        </title>

        <circle cx={CENTRE} cy={CENTRE} r={185} fill="none" stroke="var(--gp-gold-600)" strokeWidth={1.5} strokeDasharray="6 7" opacity={0.75} />
        <circle cx={CENTRE} cy={CENTRE} r={168} fill="none" stroke="var(--gp-border)" strokeWidth={1} />

        {VASTU_WHEEL.map((s, i) => (
          <path
            key={s.label}
            d={sectorPath(i)}
            fill={SECTOR_FILLS[i]}
            stroke="#ffffff"
            strokeWidth={2}
            tabIndex={0}
            role="button"
            aria-label={`${s.label} — ${s.direction}`}
            aria-pressed={i === active}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className="cursor-pointer outline-none transition-[opacity,stroke] focus-visible:stroke-[color:var(--gp-gold-600)]"
            style={{ opacity: i === active ? 1 : 0.72 }}
          />
        ))}

        {VASTU_WHEEL.map((s, i) => {
          const angle = START + i * SWEEP + SWEEP / 2;
          const at = polar(LABEL_R, angle);
          // Labels follow the radius, but a uniform rotation leaves the
          // left-hand half upside down — flip those back.
          const spin = angle + 90;
          const upright = spin > 90 && spin < 270 ? spin + 180 : spin;
          return (
            <text
              key={s.label}
              x={at.x}
              y={at.y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${upright} ${at.x} ${at.y})`}
              className="pointer-events-none fill-[color:var(--gp-body)]"
              fontSize={13}
              fontWeight={i === active ? 700 : 400}
            >
              {s.label}
            </text>
          );
        })}

        {[
          { label: "E", angle: 0 },
          { label: "S", angle: 90 },
          { label: "W", angle: 180 },
          { label: "N", angle: 270 },
        ].map((point) => {
          const at = polar(196, point.angle);
          return (
            <text
              key={point.label}
              x={at.x}
              y={at.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none fill-[color:var(--gp-gold-600)]"
              fontSize={14}
              fontWeight={700}
            >
              {point.label}
            </text>
          );
        })}

        <circle cx={CENTRE} cy={CENTRE} r={52} fill="var(--gp-forest-900)" stroke="var(--gp-gold-600)" strokeWidth={2} />
        <text x={CENTRE} y={CENTRE} textAnchor="middle" dominantBaseline="middle" fill="var(--gp-gold-300)" fontSize={15} letterSpacing={2} className="pointer-events-none">
          VASTU
        </text>
      </svg>

      <figcaption
        aria-live="polite"
        className="mt-4 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-4"
      >
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-gold-600)]">
          {sector.label} · {sector.direction}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-body)]">{sector.note}</p>
        <p className="mt-3 text-[11.5px] text-[color:var(--gp-muted)]">
          Hover or tap any segment of the wheel.
        </p>
      </figcaption>
    </figure>
  );
}
