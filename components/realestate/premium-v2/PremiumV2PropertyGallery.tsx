"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { analytics } from "@/lib/analytics";
import PropertyTypeIcon from "../PropertyTypeIcon";

interface GalleryImage {
  path: string;
  alt: string | null;
}

interface PremiumV2PropertyGalleryProps {
  images: GalleryImage[];
  propertyType: string;
  title: string;
  propertyId: string;
}

/**
 * Photography-forward gallery for the Premium V2 detail page: a full-bleed
 * hero frame with a thumbnail rail below it, and a fullscreen lightbox on
 * click. State/navigation logic mirrors the original PropertyGallery
 * (active index, wraparound prev/next) — only the JSX and the addition of
 * the lightbox + keyboard support are new.
 */
export default function PremiumV2PropertyGallery({
  images,
  propertyType,
  title,
  propertyId,
}: PremiumV2PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    analytics.viewProperty(propertyId, propertyType);
    // Fire once per mount only — not on every image/index change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, propertyType]);

  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, go]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-[var(--gp-radius-lg)] bg-[color:var(--gp-cream-200)]">
        <PropertyTypeIcon propertyType={propertyType} className="h-12 w-12 text-[color:var(--gp-gold-600)]" />
      </div>
    );
  }

  const current = images[active];

  return (
    <div>
      <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-[var(--gp-radius-lg)] bg-[color:var(--gp-forest-800)] sm:aspect-[16/8]">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open photo in fullscreen"
          className="absolute inset-0 h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gp-gold-600)]"
        >
          <Image
            src={current.path}
            alt={current.alt ?? title}
            fill
            sizes="(max-width: 1024px) 100vw, 1120px"
            priority
            className="object-cover"
          />
        </button>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,46,44,0.28) 0%, rgba(10,46,44,0) 22%, rgba(10,46,44,0) 78%, rgba(10,46,44,0.4) 100%)",
          }}
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[color:var(--gp-forest-950)] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gp-gold-600)] sm:left-5"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[color:var(--gp-forest-950)] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gp-gold-600)] sm:right-5"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--gp-forest-950)]/70 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-sm">
          <Expand className="h-3.5 w-3.5" aria-hidden="true" />
          {active + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.path}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active}
              className={`relative h-[68px] w-24 shrink-0 overflow-hidden rounded-[var(--gp-radius-sm)] border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gp-gold-600)] ${
                i === active ? "border-[color:var(--gp-gold-600)]" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <Image src={img.path} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          className="fixed inset-0 z-50 flex flex-col bg-[color:var(--gp-forest-950)]/97 p-4 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-white/70">
              {active + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative mt-3 flex-1">
            <Image
              src={current.path}
              alt={current.alt ?? title}
              fill
              sizes="100vw"
              className="object-contain"
            />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-3"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-3"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
