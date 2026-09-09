import Link from "next/link";
import { ArrowRight, Compass, FileText, HardHat, Handshake, PencilRuler, Sofa } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import { CONSTRUCTION_SERVICES, VASTU_WHEEL } from "@/lib/premium-v2/services";

const ICONS: Record<string, LucideIcon> = {
  "construction-management": HardHat,
  "vastu-consultation": Compass,
  "floor-plan": PencilRuler,
  jda: Handshake,
  "interior-design": Sofa,
  documentation: FileText,
};

/** Soft sector fills, one per compass eighth, in the wheel's drawing order. */
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
 * The build-and-vastu capabilities, with the room-orientation wheel the
 * client's own site used beside them.
 *
 * The wheel is drawn rather than shipped as an image: it is eight labelled
 * sectors and a compass, which is a handful of arithmetic, and drawing it
 * keeps the labels as real text — selectable, translatable and legible to a
 * screen reader through the table alternative below it.
 */
export default function ConstructionVastuV2({ p }: { p: (path: string) => string }) {
  return (
    <GpSection tone="cream" id="construction">
      <GpContainer>
        <div className="max-w-2xl">
          <span className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]" aria-hidden="true" />
          <GpEyebrow>Build &amp; vastu</GpEyebrow>
          <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
            Construction, collaboration &amp; vastu services.
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
            Complete construction management with Vastu Shastra compliance, floor plan design and
            joint development agreements.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <figure className="mx-auto w-full max-w-[420px]">
            <svg viewBox="0 0 400 400" className="h-auto w-full" role="img" aria-labelledby="vastu-wheel-title">
              <title id="vastu-wheel-title">
                Vastu room orientation wheel — the direction each room is traditionally placed in
              </title>

              <circle cx={CENTRE} cy={CENTRE} r={185} fill="none" stroke="var(--gp-gold-600)" strokeWidth={1.5} strokeDasharray="6 7" opacity={0.75} />
              <circle cx={CENTRE} cy={CENTRE} r={168} fill="none" stroke="var(--gp-border)" strokeWidth={1} />

              {VASTU_WHEEL.map((sector, i) => (
                <path key={sector.label} d={sectorPath(i)} fill={SECTOR_FILLS[i]} stroke="#ffffff" strokeWidth={2} />
              ))}

              {VASTU_WHEEL.map((sector, i) => {
                const angle = START + i * SWEEP + SWEEP / 2;
                const at = polar(LABEL_R, angle);
                // Labels follow the radius, but a uniform rotation leaves the
                // left-hand half upside down — flip those back.
                const spin = angle + 90;
                const upright = spin > 90 && spin < 270 ? spin + 180 : spin;
                return (
                  <text
                    key={sector.label}
                    x={at.x}
                    y={at.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${upright} ${at.x} ${at.y})`}
                    className="fill-[color:var(--gp-body)]"
                    fontSize={13}
                  >
                    {sector.label}
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
                    className="fill-[color:var(--gp-gold-600)]"
                    fontSize={14}
                    fontWeight={700}
                  >
                    {point.label}
                  </text>
                );
              })}

              <circle cx={CENTRE} cy={CENTRE} r={52} fill="var(--gp-forest-900)" stroke="var(--gp-gold-600)" strokeWidth={2} />
              <text x={CENTRE} y={CENTRE} textAnchor="middle" dominantBaseline="middle" fill="var(--gp-gold-300)" fontSize={15} letterSpacing={2}>
                VASTU
              </text>
            </svg>
            <figcaption className="mt-4 text-center text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
              {VASTU_WHEEL.map((s) => `${s.label} (${s.direction})`).join(" · ")}
            </figcaption>
          </figure>

          <div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CONSTRUCTION_SERVICES.map((service) => {
                const Icon = ICONS[service.key] ?? HardHat;
                return (
                  <li
                    key={service.key}
                    className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-200)]/60 p-5"
                  >
                    <Icon className="h-5 w-5 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    <h3 className="font-display mt-3.5 text-[16px] leading-snug text-[color:var(--gp-ink)]">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                      {service.blurb}
                    </p>
                  </li>
                );
              })}
            </ul>

            {/* The wheel is the illustration; this is the working version of
                the same idea, and the reason the section sits under the
                calculators band. */}
            <div className="mt-7 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href={p("/vastu")}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
              >
                Open vastu calculator
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={p("/contact?intent=construction")}
                className="inline-flex min-h-[50px] items-center justify-center rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-forest-900)]/30 px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-forest-900)]"
              >
                Discuss a project
              </Link>
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
