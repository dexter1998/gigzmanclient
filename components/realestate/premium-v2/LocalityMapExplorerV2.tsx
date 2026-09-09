"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { localities } from "@/lib/db/schema";
import { formatIndianPrice } from "@/lib/format";
import { joinPath } from "@/lib/paths";
import { analytics } from "@/lib/analytics";
import { GpContainer, GpSection, GpEyebrow, cn } from "./gp-primitives";

type Locality = typeof localities.$inferSelect;

/** Deterministic pseudo-positions so pins stay put across renders without storing lat/lng yet. */
function pinPosition(seed: string): { top: string; left: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const top = 18 + (hash % 64);
  const left = 12 + ((hash >> 8) % 76);
  return { top: `${top}%`, left: `${left}%` };
}

export default function LocalityMapExplorerV2({
  localities,
  basePath,
}: {
  localities: Locality[];
  basePath: string;
}) {
  const p = (path: string) => joinPath(basePath, path);
  const [selectedId, setSelectedId] = useState<string>(localities[0]?.id ?? "");

  const selected = useMemo(
    () => localities.find((loc) => loc.id === selectedId) ?? localities[0],
    [localities, selectedId],
  );

  if (!selected) return null;

  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Explore Visually</GpEyebrow>
        <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
          Localities on the map
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:h-[520px] lg:grid-cols-[1.15fr_1fr]">
          {/* ── Placeholder map panel ─────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)]">
            {/*
              TODO: replace with real Maps JS API — see SECTION-BEHAVIOR.md
              §map for clustering/consent requirements. Below is an honest
              placeholder: a textured panel with pin markers whose positions
              are derived, not real coordinates.
            */}
            <div
              className="relative aspect-[4/3] w-full bg-[color:var(--gp-cream-200)] lg:aspect-auto lg:h-full lg:min-h-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(19,74,67,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(19,74,67,0.06) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            >
              {localities.map((locality) => {
                const pos = pinPosition(locality.slug);
                const isSelected = locality.id === selected.id;
                return (
                  <button
                    key={locality.id}
                    type="button"
                    onClick={() => setSelectedId(locality.id)}
                    aria-pressed={isSelected}
                    aria-label={`Show ${locality.name} on the map`}
                    className="absolute -translate-x-1/2 -translate-y-full transition-transform hover:z-10 hover:scale-110"
                    style={{ top: pos.top, left: pos.left, zIndex: isSelected ? 10 : 1 }}
                  >
                    <span className="flex flex-col items-center">
                      <span
                        className={cn(
                          "relative block overflow-hidden rounded-[8px] shadow-[0_4px_12px_rgba(10,46,44,0.35)]",
                          isSelected
                            ? "h-16 w-16 ring-[3px] ring-[color:var(--gp-gold-600)]"
                            : "h-11 w-11 ring-2 ring-white",
                        )}
                      >
                        {locality.heroImage ? (
                          <Image src={locality.heroImage} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-[color:var(--gp-forest-700)]" />
                        )}
                      </span>
                      <MapPin
                        className="-mt-1 h-4 w-4 drop-shadow-[0_2px_4px_rgba(10,46,44,0.4)]"
                        style={{ color: isSelected ? "var(--gp-gold-600)" : "var(--gp-forest-700)" }}
                        fill={isSelected ? "var(--gp-gold-600)" : "var(--gp-forest-700)"}
                        strokeWidth={1.5}
                      />
                    </span>
                    <span
                      className={cn(
                        "mt-1 block rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                        isSelected
                          ? "bg-[color:var(--gp-gold-600)] text-[color:var(--gp-forest-950)]"
                          : "bg-white/90 text-[color:var(--gp-ink)]",
                      )}
                    >
                      {locality.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Selected locality detail — clicking a pin or list row syncs this panel ── */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white">
            <div className="relative aspect-[16/10] w-full shrink-0 lg:aspect-auto lg:h-[190px]">
              {selected.heroImage ? (
                <Image
                  src={selected.heroImage}
                  alt={selected.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[color:var(--gp-cream-200)] text-[12px] text-[color:var(--gp-muted)]">
                  No image available
                </div>
              )}
            </div>

            <div className="flex flex-col p-6">
              {selected.corridor && selected.corridor !== selected.name ? (
                <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">{selected.corridor}</p>
              ) : null}
              <h3 className="font-display mt-1.5 text-[16px] text-[color:var(--gp-ink)]">
                {selected.name}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-ink-muted)]">
                {selected.bestFor ?? "Premium, established, connected."}
              </p>

              {selected.avgPricePerSqft ? (
                <p className="font-sans mt-3 text-[22px] font-semibold text-[color:var(--gp-gold-600)]">
                  {formatIndianPrice(selected.avgPricePerSqft)}/sq.ft
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={p(`/localities/${selected.slug}`)}
                  onClick={() => analytics.viewLocality(selected.slug)}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-navy px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-soft"
                >
                  View Locality
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* ── Other localities list — clicking syncs both the map pins and the panel above ── */}
            <div className="max-h-[220px] flex-1 overflow-y-auto border-t border-[color:var(--gp-border)] lg:max-h-none lg:min-h-0">
              {localities
                .filter((locality) => locality.id !== selected.id)
                .map((locality) => (
                  <button
                    key={locality.id}
                    type="button"
                    onClick={() => setSelectedId(locality.id)}
                    className="flex w-full items-center gap-3 border-b border-[color:var(--gp-border)] px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-[color:var(--gp-cream-200)]"
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-[6px] bg-[color:var(--gp-cream-200)]">
                      {locality.heroImage ? (
                        <Image
                          src={locality.heroImage}
                          alt={locality.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[color:var(--gp-ink)]">
                        {locality.name}
                      </p>
                      <p className="text-[11.5px] text-[color:var(--gp-muted)]">
                        {locality.corridor ?? "Gurugram"}
                      </p>
                    </div>
                    {locality.avgPricePerSqft ? (
                      <p className="shrink-0 text-[12.5px] font-semibold text-[color:var(--gp-gold-600)]">
                        {formatIndianPrice(locality.avgPricePerSqft)}/sq.ft
                      </p>
                    ) : null}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
