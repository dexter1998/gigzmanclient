"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Maximize2, Minus, Plus, RotateCcw, Share2, X } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { openLeadPopup } from "../leadPopup";

/**
 * Pan-and-zoom viewer for a plot map.
 *
 * Built against what RealBetter actually does, measured rather than assumed:
 * their viewer has the same four controls, but zooming applies a CSS
 * `transform: scale()` to a 1312x668 image and never requests anything larger.
 * Zoom in and it simply gets blurry — which defeats the purpose, because the
 * only reason to zoom a plot map is to read plot numbers.
 *
 * So this loads in two stages. The page paints a `next/image` at display
 * width — comparable weight to theirs — and the full 2560px source is fetched
 * only when someone zooms or opens full screen. Nobody pays for resolution
 * they never use, and anyone who does zoom gets a sharp map.
 *
 * Hand-rolled rather than pulling in a pan/zoom library: the behaviour needed
 * here is a transform, two pointer handlers and a clamp, and the codebase has
 * no such dependency to reuse.
 */

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const STEP = 0.5;

export default function PlotMapViewerV2({
  slug,
  name,
  src,
  blurDataURL,
}: {
  slug: string;
  name: string;
  src: string;
  blurDataURL?: string;
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [hiRes, setHiRes] = useState(false);
  const [copied, setCopied] = useState(false);
  // Portals need a real document; this stays false through SSR and the first
  // client render so the markup matches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  // Zoom fires on every wheel tick and pinch frame; reporting each one would
  // bury the signal, so only the settled level is sent.
  const zoomReport = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    analytics.viewMap(slug);
  }, [slug]);

  /** Anything that magnifies needs the real pixels behind it. */
  const requireHiRes = useCallback(() => setHiRes(true), []);

  const clamp = useCallback((next: number, x: number, y: number) => {
    const frame = frameRef.current;
    if (!frame) return { x, y };
    // At scale s the image overflows the frame by (s-1)/2 of its size on each
    // side; panning further than that just drags empty space into view.
    const maxX = (frame.clientWidth * (next - 1)) / 2;
    const maxY = (frame.clientHeight * (next - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const applyScale = useCallback(
    (next: number) => {
      const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
      if (s > 1) requireHiRes();
      setScale(s);
      setTx((cx) => clamp(s, cx, ty).x);
      setTy((cy) => clamp(s, tx, cy).y);
      if (s === 1) {
        setTx(0);
        setTy(0);
      }
      if (zoomReport.current) clearTimeout(zoomReport.current);
      zoomReport.current = setTimeout(() => analytics.mapZoom(slug, s), 800);
    },
    [clamp, requireHiRes, slug, tx, ty],
  );

  const reset = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  const toggleFullscreen = () => {
    const next = !fullscreen;
    setFullscreen(next);
    if (next) {
      requireHiRes();
      analytics.mapFullscreen(slug);
    } else {
      reset();
    }
  };

  // Escape closes full screen; the page behind must not scroll while it is open.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullscreen(false);
        reset();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !fullscreen && scale === 1) return; // let the page scroll
    e.preventDefault();
    applyScale(scale + (e.deltaY < 0 ? STEP : -STEP));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale };
    } else if (scale > 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      applyScale(pinchStart.current.scale * (dist / pinchStart.current.dist));
      return;
    }
    const d = dragRef.current;
    if (!d) return;
    const next = clamp(scale, d.tx + (e.clientX - d.x), d.ty + (e.clientY - d.y));
    setTx(next.x);
    setTy(next.y);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };

  /** Tap-to-zoom: the gesture people try first on a phone. */
  const onDoubleClick = () => applyScale(scale > 1 ? 1 : 2.5);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      await navigator.share({ title: `${name} plot map`, url }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const controls = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={share}
        aria-label="Share this map"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gp-border)] bg-white text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => applyScale(scale - STEP)}
        disabled={scale <= MIN_SCALE}
        aria-label="Zoom out"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gp-border)] bg-white text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)] disabled:opacity-40"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => applyScale(scale + STEP)}
        disabled={scale >= MAX_SCALE}
        aria-label="Zoom in"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gp-border)] bg-white text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)] disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
      {scale > 1 ? (
        <button
          type="button"
          onClick={reset}
          aria-label="Reset zoom"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gp-border)] bg-white text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={fullscreen ? "Close full screen" : "Open full screen"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--gp-border)] bg-white text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
      >
        {fullscreen ? <X className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );

  const canvas = (
    <div
      ref={frameRef}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      className={`relative overflow-hidden bg-[color:var(--gp-cream-200)] ${
        fullscreen ? "h-full w-full" : "aspect-[3/2] w-full rounded-[var(--gp-radius-md)]"
      } ${scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
      style={{ touchAction: "none" }}
    >
      <div
        className="h-full w-full origin-center transition-transform duration-100 ease-out"
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
      >
        <Image
          src={src}
          alt={`${name} plot map, Gurugram`}
          fill
          // Below 2x zoom the display-width render is already sharper than the
          // screen; past that the browser needs the full file, so ask for it.
          sizes={hiRes ? "2560px" : "(max-width: 1024px) 100vw, 1200px"}
          quality={hiRes ? 90 : 75}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          priority={false}
          className="object-contain"
          draggable={false}
        />
      </div>

      {scale === 1 && !fullscreen ? (
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-[11.5px] text-white">
          Double-tap or use + to zoom · full screen for plot numbers
        </p>
      ) : null}
      {copied ? (
        <p className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-[11.5px] text-white">
          Link copied
        </p>
      ) : null}
    </div>
  );

  /**
   * Rendered through a portal into <body>, not in place.
   *
   * GpSection wraps its children in a `relative z-[1]` div, which opens a
   * stacking context — so a `z-[100]` overlay nested inside it is still only
   * "z-1" as far as the rest of the page is concerned, and later sections
   * (the FAQ below this one) painted straight over the "full screen" map.
   * A portal moves the overlay out of that context entirely.
   */
  const overlay = fullscreen ? (
      <div className="fixed inset-0 z-[9999] flex flex-col bg-[color:var(--gp-forest-950)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="font-display text-[15px] text-white">{name} — plot map</p>
          {controls}
        </div>
        <div className="min-h-0 flex-1">{canvas}</div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-[11.5px] text-white/50">
            Drag to pan · pinch or scroll to zoom · Esc to close
          </p>
          <button
            type="button"
            onClick={() => openLeadPopup("map")}
            className="inline-flex min-h-[40px] items-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-4 text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)]"
          >
            Ask about this sector
          </button>
        </div>
      </div>
  ) : null;

  return (
    <>
      {mounted && overlay ? createPortal(overlay, document.body) : null}
    <div className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-[15px] text-[color:var(--gp-ink)] sm:text-[15px]">
          {name} Map View
        </h2>
        {controls}
      </div>
      {canvas}
    </div>
    </>
  );
}
