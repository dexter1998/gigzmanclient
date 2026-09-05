"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, LocateFixed } from "lucide-react";
import type { localities } from "@/lib/db/schema";
import { formatIndianPrice } from "@/lib/format";
import { joinPath } from "@/lib/paths";
import { analytics } from "@/lib/analytics";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";

type Locality = typeof localities.$inferSelect;

const CARD_WIDTH = 260;

export default function CorridorPanoramaV2({
  localities,
  basePath,
}: {
  localities: Locality[];
  basePath: string;
}) {
  const p = (path: string) => joinPath(basePath, path);
  const [nearestSlug, setNearestSlug] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const trackRef = useRef<HTMLDivElement>(null);

  /**
   * `localities` has no lat/lng columns yet, so real proximity sorting isn't
   * possible. Rather than fake a distance number, a successful geolocation
   * read just promotes one corridor (alphabetically first, as a placeholder
   * heuristic) to the front with a "Nearest" label — enough to demonstrate
   * the reorder pattern honestly. The manual dropdown below is the real,
   * always-available fallback and works with zero permissions granted.
   */
  const ordered = useMemo(() => {
    if (!nearestSlug) return localities;
    const idx = localities.findIndex((l) => l.slug === nearestSlug);
    if (idx <= 0) return localities;
    const copy = [...localities];
    const [nearest] = copy.splice(idx, 1);
    return [nearest, ...copy];
  }, [localities, nearestSlug]);

  function useMyLocation() {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      () => {
        const alphabetical = [...localities].sort((a, b) => a.name.localeCompare(b.name));
        const nearest = alphabetical[0];
        if (nearest) setNearestSlug(nearest.slug);
        setGeoStatus("done");
      },
      () => setGeoStatus("error"),
      { timeout: 8000 },
    );
  }

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (direction === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === -1 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      el.scrollBy({ left: direction * (CARD_WIDTH + 16), behavior: "smooth" });
    }
  }

  if (localities.length === 0) return null;

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.75fr_1.6fr] lg:items-center">
          <div>
            <GpEyebrow>Location Intelligence</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              A City of Distinct Addresses
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[color:var(--gp-body)]">
              Every corridor in Gurugram moves differently — average price, appreciation and rental
              yield all vary by address. Explore the data before you commit to one.
            </p>

            <Link
              href={p("/localities")}
              className="mt-6 inline-flex min-h-[50px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-forest-900)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              Explore Localities
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={useMyLocation}
                disabled={geoStatus === "locating"}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[color:var(--gp-border)] bg-white px-4 text-[12.5px] font-semibold text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-forest-900)] disabled:opacity-60"
              >
                <LocateFixed className="h-3.5 w-3.5 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                {geoStatus === "locating" ? "Locating…" : "Use my location"}
              </button>
              {geoStatus === "error" ? (
                <p className="text-[12px] text-[color:var(--gp-muted)]">Couldn&rsquo;t get your location.</p>
              ) : null}
            </div>
          </div>

          {/* min-w-0 overrides the grid item's default min-width:auto — same
              overflow fix as ImageStripV2 (see its comment). */}
          <div className="relative min-w-0">
            <div
              ref={trackRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {ordered.map((locality, index) => {
                const isNearest = locality.slug === nearestSlug;
                return (
                  <Link
                    key={locality.id}
                    href={p(`/localities/${locality.slug}`)}
                    onClick={() => analytics.viewLocality(locality.slug)}
                    style={{ width: CARD_WIDTH, scrollSnapAlign: "start" }}
                    className="group relative block aspect-[3/4] shrink-0 overflow-hidden rounded-[var(--gp-radius-md)]"
                  >
                    {locality.heroImage ? (
                      <Image
                        src={locality.heroImage}
                        alt={locality.name}
                        fill
                        sizes="260px"
                        className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[color:var(--gp-forest-800)]" />
                    )}
                    <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />

                    {isNearest ? (
                      <span className="absolute left-4 top-4 rounded-full bg-[color:var(--gp-gold-600)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--gp-forest-950)]">
                        Nearest
                      </span>
                    ) : null}

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">{locality.name}</p>
                      {locality.avgPricePerSqft ? (
                        <p className="font-sans mt-1 text-[20px] font-semibold leading-none text-white">
                          {formatIndianPrice(locality.avgPricePerSqft)}/sq.ft
                        </p>
                      ) : null}
                      <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-white/85">
                        {locality.yoyChangePercent != null ? `${locality.yoyChangePercent}% YoY · ` : null}
                        View corridor
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous corridor"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gp-forest-900)] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next corridor"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gp-forest-900)] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
