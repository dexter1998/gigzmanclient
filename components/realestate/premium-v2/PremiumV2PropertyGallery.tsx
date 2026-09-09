"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Play, X } from "lucide-react";
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
  /** YouTube watch URL for a property tour, when the listing has one. */
  videoUrl?: string | null;
  /**
   * Set when the photography is a stand-in rather than this property. Some
   * listing feeds ship no usable images, and the generated set used in their
   * place must be labelled as such wherever it sits next to a specific
   * property claim.
   */
  illustrativeImages?: boolean;
}

/** The `v` parameter out of a YouTube watch/short/embed URL. */
function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : null;
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
  videoUrl,
  illustrativeImages = false,
}: PremiumV2PropertyGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const video = youtubeId(videoUrl);

  useEffect(() => {
    analytics.viewProperty(propertyId, propertyType);
    // Fire once per mount only — not on every image/index change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, propertyType]);

  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + images.length) % images.length),
    [images.length],
  );

  /**
   * Advances the hero frame on its own so a listing's later photos are seen
   * at all — most visitors never touch the thumbnail rail. It stops while the
   * lightbox or the video is open, and while the pointer is over the frame,
   * so it never moves the picture someone is actually looking at. Honours
   * `prefers-reduced-motion`.
   */
  useEffect(() => {
    if (images.length < 2 || lightboxOpen || videoOpen || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => go(1), 5000);
    return () => window.clearInterval(id);
  }, [images.length, lightboxOpen, videoOpen, paused, go]);

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
      <div
        className="group relative aspect-[16/9] w-full overflow-hidden rounded-[var(--gp-radius-lg)] bg-[color:var(--gp-forest-800)] sm:aspect-[16/8]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
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

        {video ? (
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="absolute bottom-4 left-4 inline-flex min-h-[44px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-forest-950)]/85 px-4 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-[color:var(--gp-forest-950)] sm:bottom-5 sm:left-5"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            Watch tour
          </button>
        ) : null}

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

      {illustrativeImages ? (
        <p className="mt-3 text-[11.5px] leading-relaxed text-[color:var(--gp-muted)]">
          Photographs are illustrative and show comparable farmhouse properties, not this
          listing. Ask us for the current photographs before a site visit.
        </p>
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

      {/* The tour, in the same overlay treatment as the lightbox. Loaded only
          once opened — 194 of these listings carry a video and mounting every
          iframe up front would pull YouTube's player onto a page that mostly
          nobody plays. */}
      {videoOpen && video ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Video tour — ${title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--gp-forest-950)]/92 p-4"
          onClick={() => setVideoOpen(false)}
        >
          <button
            type="button"
            onClick={() => setVideoOpen(false)}
            aria-label="Close video"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div
            className="aspect-video w-full max-w-5xl overflow-hidden rounded-[var(--gp-radius-md)] bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0`}
              title={`Video tour — ${title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
