"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MapPin, ArrowUpRight, BedDouble, Bath, Ruler } from "lucide-react";
import { PROPERTY_TYPE_LABELS, formatIndianPrice } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import { joinPath } from "@/lib/paths";
import { GpContainer, GpSection, GpEyebrow, cn } from "./gp-primitives";

type Property = typeof import("@/lib/db/schema").properties.$inferSelect;

interface ImageRef {
  path: string;
  alt?: string;
}

/** Deterministic pseudo-positions so pins stay put across renders without storing lat/lng yet. */
function pinPosition(seed: string): { top: string; left: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const top = 18 + (hash % 64);
  const left = 12 + ((hash >> 8) % 76);
  return { top: `${top}%`, left: `${left}%` };
}

export default function MapSelectedPropertyV2({
  properties,
  imageMap,
  basePath,
  googleMapsUrl,
}: {
  properties: Property[];
  imageMap: Record<string, ImageRef | undefined>;
  basePath: string;
  googleMapsUrl?: string | null;
}) {
  const p = (path: string) => joinPath(basePath, path);
  const [selectedId, setSelectedId] = useState<string>(properties[0]?.id ?? "");
  const [layer, setLayer] = useState<"map" | "satellite">("map");

  const selected = useMemo(
    () => properties.find((prop) => prop.id === selectedId) ?? properties[0],
    [properties, selectedId],
  );

  if (!selected) return null;

  const selectedImage = imageMap[selected.id];

  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Where They Are</GpEyebrow>
        <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
          Explore Properties on the Map
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:h-[560px] lg:grid-cols-[1.15fr_1fr]">
          {/* ── Placeholder map panel ─────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] lg:h-full">
            <div className="absolute right-4 top-4 z-10 flex gap-1 rounded-[var(--gp-radius-sm)] bg-white/90 p-1 shadow-[var(--shadow-card)]">
              {(["map", "satellite"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLayer(mode)}
                  aria-pressed={layer === mode}
                  className={cn(
                    "min-h-[32px] rounded-[6px] px-3 text-[11.5px] font-semibold capitalize transition-colors",
                    layer === mode
                      ? "bg-navy text-white"
                      : "text-[color:var(--gp-ink)] hover:bg-[color:var(--gp-cream-200)]",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {googleMapsUrl ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 z-10 inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--gp-radius-sm)] bg-white/95 px-3.5 text-[12px] font-semibold text-[color:var(--gp-ink)] shadow-[var(--shadow-card)] hover:text-[color:var(--gp-gold-600)]"
              >
                Open in Google Maps
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}

            {/*
              TODO: replace with @vis.gl/react-google-maps or @googlemaps/js-api-loader —
              see SECTION-BEHAVIOR.md §map for clustering/consent requirements.
              Below is an honest placeholder: a textured panel with pin markers whose
              positions are derived, not real coordinates.
            */}
            <div
              className={cn(
                "relative aspect-[4/3] w-full transition-colors duration-300 lg:aspect-auto lg:h-full",
                layer === "map"
                  ? "bg-[color:var(--gp-cream-200)]"
                  : "bg-[color:var(--gp-forest-800)]",
              )}
              style={{
                backgroundImage:
                  layer === "map"
                    ? "linear-gradient(rgba(19,74,67,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(19,74,67,0.06) 1px, transparent 1px)"
                    : "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            >
              {properties.map((property) => {
                const pos = pinPosition(property.id);
                const isSelected = property.id === selected.id;
                const image = imageMap[property.id];
                return (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => setSelectedId(property.id)}
                    aria-pressed={isSelected}
                    aria-label={`Show ${property.title} on the map`}
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
                        {image ? (
                          <Image src={image.path} alt="" fill sizes="64px" className="object-cover" />
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Selected property detail ──────────────────────────────── */}
          <div className="flex flex-col overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white lg:h-full">
            <div className="relative h-[180px] w-full shrink-0">
              {selectedImage ? (
                <Image
                  src={selectedImage.path}
                  alt={selectedImage.alt ?? selected.title}
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

            <div className="flex shrink-0 flex-col p-5">
              <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">
                {PROPERTY_TYPE_LABELS[selected.propertyType] ?? selected.propertyType}
              </p>
              <h3 className="font-display mt-1.5 text-[16px] text-[color:var(--gp-ink)]">
                {selected.title}
              </h3>
              <p className="mt-1 text-[13px] text-[color:var(--gp-muted)]">
                {selected.locality ?? selected.corridor}
              </p>
              <p className="font-sans mt-3 text-[26px] font-semibold text-[color:var(--gp-gold-600)]">
                {selected.priceLabel ?? (selected.price ? formatIndianPrice(selected.price) : "Price on request")}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[color:var(--gp-border)] pt-4 text-[13px] text-[color:var(--gp-ink-muted)]">
                {selected.beds ? (
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="h-4 w-4 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    {selected.beds} Beds
                  </span>
                ) : null}
                {selected.baths ? (
                  <span className="flex items-center gap-1.5">
                    <Bath className="h-4 w-4 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    {selected.baths} Baths
                  </span>
                ) : null}
                {selected.area ? (
                  <span className="flex items-center gap-1.5">
                    <Ruler className="h-4 w-4 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    {selected.area} {selected.areaUnit ?? "sqft"}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={p(`/properties/${selected.slug}`)}
                  onClick={() => analytics.viewProperty(selected.id, selected.propertyType)}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-navy px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy-soft"
                >
                  View Property
                </a>
                <a
                  href={p(`/contact?intent=site-visit&property=${selected.slug}`)}
                  onClick={() => analytics.siteVisitRequest(selected.id)}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-gold-600)] px-5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)] transition-colors hover:bg-[color:var(--gp-cream-200)]"
                >
                  Schedule Site Visit
                </a>
              </div>
            </div>

            {/* ── Other properties list — clicking syncs both the map pins and the panel above ── */}
            <div className="min-h-0 flex-1 overflow-y-auto border-t border-[color:var(--gp-border)]">
              {properties
                .filter((property) => property.id !== selected.id)
                .map((property) => {
                  const image = imageMap[property.id];
                  return (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => setSelectedId(property.id)}
                      className="flex w-full items-center gap-3 border-b border-[color:var(--gp-border)] px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-[color:var(--gp-cream-200)]"
                    >
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-[6px] bg-[color:var(--gp-cream-200)]">
                        {image ? (
                          <Image
                            src={image.path}
                            alt={image.alt ?? property.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-[color:var(--gp-ink)]">
                          {property.title}
                        </p>
                        <p className="text-[11.5px] text-[color:var(--gp-muted)]">
                          {property.locality ?? property.corridor}
                        </p>
                      </div>
                      <p className="shrink-0 text-[12.5px] font-semibold text-[color:var(--gp-gold-600)]">
                        {property.priceLabel ??
                          (property.price ? formatIndianPrice(property.price) : "POR")}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
