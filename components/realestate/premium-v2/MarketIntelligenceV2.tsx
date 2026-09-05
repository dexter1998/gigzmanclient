"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import { joinPath } from "@/lib/paths";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";

type Locality = typeof import("@/lib/db/schema").localities.$inferSelect;

const LEGAL_LINKS: { label: string; slug: string }[] = [
  { label: "Calculator Disclaimer", slug: "calculator-disclaimer" },
  { label: "Terms of Use", slug: "terms-of-use" },
  { label: "Privacy Policy", slug: "privacy-policy" },
];

/** Chart geometry, kept small enough to hand-tune without a plotting library. */
const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const CHART_PAD = 32;

export default function MarketIntelligenceV2({
  localities,
  basePath,
}: {
  localities: Locality[];
  basePath: string;
}) {
  const p = (path: string) => joinPath(basePath, path);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setRevealed(true);
      return;
    }
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const priced = localities.filter((loc) => typeof loc.avgPricePerSqft === "number");

  const metrics = useMemo(() => {
    if (priced.length === 0) return null;

    const avgPricePerSqft = Math.round(
      priced.reduce((sum, loc) => sum + (loc.avgPricePerSqft ?? 0), 0) / priced.length,
    );

    const topYoy = localities.reduce<Locality | null>((best, loc) => {
      if (loc.yoyChangePercent == null) return best;
      if (!best || best.yoyChangePercent == null) return loc;
      return loc.yoyChangePercent > best.yoyChangePercent ? loc : best;
    }, null);

    const totalActiveProjects = localities.reduce((sum, loc) => sum + (loc.activeProjects ?? 0), 0);

    const mostRecentVerified = localities.reduce<string | null>((latest, loc) => {
      if (!loc.lastVerifiedAt) return latest;
      if (!latest || loc.lastVerifiedAt > latest) return loc.lastVerifiedAt;
      return latest;
    }, null);

    return { avgPricePerSqft, topYoy, totalActiveProjects, mostRecentVerified };
  }, [localities, priced]);

  const chartPoints = useMemo(() => {
    if (priced.length === 0) return [];
    const maxPrice = Math.max(...priced.map((loc) => loc.avgPricePerSqft ?? 0));
    const barWidth = (CHART_WIDTH - CHART_PAD * 2) / priced.length;
    return priced.map((loc, index) => {
      const value = loc.avgPricePerSqft ?? 0;
      const barHeight = maxPrice > 0 ? (value / maxPrice) * (CHART_HEIGHT - CHART_PAD * 2) : 0;
      return {
        // The locality's own name, not `corridor` — two localities here
        // (Dwarka Expressway and New Gurugram) share the same corridor, so
        // labelling by corridor collapsed them into one ambiguous bar.
        name: loc.name,
        value,
        x: CHART_PAD + index * barWidth,
        width: barWidth * 0.55,
        height: barHeight,
        y: CHART_HEIGHT - CHART_PAD - barHeight,
      };
    });
  }, [priced]);

  if (!metrics) return null;

  return (
    <GpSection
      tone="forest"
      className="relative overflow-hidden"
      background={
        <Image
          src="/verticals/realestate/templates/premium-v2/images/market-report-cover.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-10"
        />
      }
    >
      <GpContainer className="relative">
        <div ref={sectionRef} className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <GpEyebrow>Market Intelligence</GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 text-white">
              Gurugram, Read Corridor by Corridor
            </h2>
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-white/70">
              Corridor-level price movement and supply across the city, to compare before you
              shortlist. Figures are indicative working averages, not certified valuations — see
              the note below.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[var(--gp-radius-md)] border border-white/10 bg-white/[0.04] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
                  Avg. Price / Sqft
                </p>
                <p className="font-sans mt-1.5 text-[26px] font-semibold text-[color:var(--gp-gold-300)]">
                  ₹{metrics.avgPricePerSqft.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-[11px] text-white/45">Across {priced.length} corridors</p>
              </div>
              <div className="rounded-[var(--gp-radius-md)] border border-white/10 bg-white/[0.04] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
                  Strongest YoY Growth
                </p>
                <p className="font-sans mt-1.5 text-[26px] font-semibold text-[color:var(--gp-gold-300)]">
                  {metrics.topYoy?.yoyChangePercent != null
                    ? `+${metrics.topYoy.yoyChangePercent.toFixed(1)}%`
                    : "—"}
                </p>
                <p className="mt-1 text-[11px] text-white/45">{metrics.topYoy?.name ?? "No data yet"}</p>
              </div>
              <div className="rounded-[var(--gp-radius-md)] border border-white/10 bg-white/[0.04] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
                  Active Projects Tracked
                </p>
                <p className="font-sans mt-1.5 text-[26px] font-semibold text-[color:var(--gp-gold-300)]">
                  {metrics.totalActiveProjects}
                </p>
                <p className="mt-1 text-[11px] text-white/45">Across all corridors</p>
              </div>
            </div>

            <p className="mt-6 text-[11.5px] leading-relaxed text-white/45">
              As of {formatDate(metrics.mostRecentVerified)}. Indicative corridor averages
              pending independent verification — not a certified valuation.{" "}
              <a
                href={p("/legal/calculator-disclaimer")}
                className="underline decoration-white/30 underline-offset-2 hover:text-white/70"
              >
                Methodology &amp; disclaimer
              </a>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-white/60">
                Buyer Resources
              </p>
              {LEGAL_LINKS.map((link) => (
                <a
                  key={link.slug}
                  href={p(`/legal/${link.slug}`)}
                  className="text-[12.5px] text-white/60 underline decoration-white/25 underline-offset-2 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={p("/calculators")}
                className="text-[12.5px] text-white/60 underline decoration-white/25 underline-offset-2 hover:text-white"
              >
                All Calculators
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="rounded-[var(--gp-radius-lg)] border border-white/10 bg-white/[0.03] p-6">
              <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">Price / Sqft by Corridor</p>
              <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="mt-4 w-full"
                role="img"
                aria-label="Average price per square foot by corridor"
              >
                <line
                  x1={CHART_PAD}
                  y1={CHART_HEIGHT - CHART_PAD}
                  x2={CHART_WIDTH - CHART_PAD}
                  y2={CHART_HEIGHT - CHART_PAD}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={1}
                />
                {chartPoints.map((point) => (
                  <g key={point.name}>
                    <rect
                      x={point.x}
                      y={revealed ? point.y : CHART_HEIGHT - CHART_PAD}
                      width={point.width}
                      height={revealed ? point.height : 0}
                      fill="var(--gp-gold-600)"
                      rx={2}
                      style={{
                        transition: "y 900ms ease-out, height 900ms ease-out",
                      }}
                    />
                    <text
                      x={point.x + point.width / 2}
                      y={CHART_HEIGHT - CHART_PAD + 16}
                      textAnchor="middle"
                      fontSize="9"
                      fill="rgba(255,255,255,0.55)"
                    >
                      {point.name.length > 12 ? `${point.name.slice(0, 11)}…` : point.name}
                    </text>
                    <text
                      x={point.x + point.width / 2}
                      y={Math.max(12, (revealed ? point.y : CHART_HEIGHT - CHART_PAD) - 6)}
                      textAnchor="middle"
                      fontSize="9"
                      fill="var(--gp-cream-100)"
                      style={{ transition: "y 900ms ease-out", opacity: revealed ? 1 : 0 }}
                    >
                      ₹{point.value.toLocaleString("en-IN")}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-6 rounded-[var(--gp-radius-lg)] bg-white/[0.04] p-6">
              <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">Full Market Notes</p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/70">
                Corridor-level commentary, price movement and new-launch context, published as we
                track it — read in full rather than as a static download.
              </p>
              <a
                href={p("/updates")}
                onClick={() => analytics.reportRequest("gurugram-market-report")}
                className="mt-4 inline-flex min-h-[46px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[13.5px] font-semibold text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
              >
                Read the Market Notes
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
