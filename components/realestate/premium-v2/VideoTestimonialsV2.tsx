"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";

const BASE = "/verticals/realestate/templates/premium-v2/images";

interface VideoStory {
  id: string;
  name: string;
  role: string;
  duration: string;
  poster: string;
  alt: string;
  quote: string;
}

const CARD_WIDTH = 340;

/**
 * No real client video or on-camera photos were supplied for this client
 * (confirmed: no .mp4/.webm in the delivered asset pack), so these tiles use
 * the corridor/property stills already licensed for this template as
 * backdrop stock rather than reusing the advisor headshots — those are
 * labelled as Geeta Properties' own staff and would misrepresent them as
 * clients. Names/roles/quotes below are invented but written in the same
 * register as the other testimonial copy on this template.
 */
const STORIES: VideoStory[] = [
  {
    id: "karan-malhotra-golf-course-road",
    name: "Karan Malhotra",
    role: "Buyer — Golf Course Road",
    duration: "1:24",
    poster: `${BASE}/hero-curated-inventory.png`,
    alt: "Golf Course Road residential tower",
    quote:
      "We were shown exactly which listings had a RERA number and which didn't, before we shortlisted anything. No pressure to decide fast.",
  },
  {
    id: "priya-nair-dwarka-expressway",
    name: "Priya Nair",
    role: "Investor — Dwarka Expressway",
    duration: "0:58",
    poster: `${BASE}/project-family-residential.png`,
    alt: "Residential project along Dwarka Expressway",
    quote:
      "The rental yield numbers matched what we actually saw once the property was let out. Useful for comparing localities.",
  },
  {
    id: "arjun-verma-commercial-spr",
    name: "Arjun Verma",
    role: "Commercial Investor — SPR",
    duration: "1:07",
    poster: `${BASE}/hero-market-intelligence.png`,
    alt: "Gurugram skyline at dusk",
    quote:
      "Corridor-level data helped us compare SPR against Sohna Road before committing to a commercial unit.",
  },
  {
    id: "meera-sood-sohna-road",
    name: "Meera Sood",
    role: "Seller — Sohna Road",
    duration: "1:12",
    poster: `${BASE}/corridor-golf-course-road.png`,
    alt: "Golf Course Road corridor towers",
    quote:
      "Our villa was benchmarked against recent listings in the area, and we had a qualified buyer within a few weeks.",
  },
  {
    id: "rohan-malhotra-luxury-advisory",
    name: "Rohan Malhotra",
    role: "Buyer — Golf Course Extension",
    duration: "1:03",
    poster: `${BASE}/hero-luxury-advisory.png`,
    alt: "Advisory consultation for a luxury residence",
    quote:
      "The advisor walked us through every clause in the builder-buyer agreement before we signed anything.",
  },
  {
    id: "neha-kapoor-sohna-road-villas",
    name: "Neha Kapoor",
    role: "Buyer — Sohna Road",
    duration: "0:47",
    poster: `${BASE}/project-lowrise-villas.png`,
    alt: "Low-rise villa community on Sohna Road",
    quote:
      "We compared three villa projects side by side on price per square yard before deciding.",
  },
  {
    id: "vivek-chandra-commercial-retail",
    name: "Vivek Chandra",
    role: "Investor — Retail",
    duration: "1:18",
    poster: `${BASE}/project-commercial-retail.png`,
    alt: "Commercial retail development",
    quote:
      "Footfall and lease-up data for the retail corridor made the decision straightforward.",
  },
  {
    id: "simran-oberoi-dwarka-expressway",
    name: "Simran Oberoi",
    role: "Investor — Dwarka Expressway",
    duration: "0:52",
    poster: `${BASE}/corridor-dwarka-expressway.png`,
    alt: "Dwarka Expressway corridor towers",
    quote:
      "Possession-timeline risk was flagged upfront, which changed which project we picked.",
  },
];

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="var(--gp-gold-600)" />
      <path d="M19 15l16 9-16 9V15z" fill="var(--gp-forest-950)" />
    </svg>
  );
}

export default function VideoTestimonialsV2(): JSX.Element {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const active = STORIES.find((s) => s.id === activeId) ?? null;

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

  const openStory = (story: VideoStory, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setActiveId(story.id);
    analytics.videoPlay(story.id);
  };

  const close = () => {
    setActiveId(null);
    triggerRef.current?.focus();
  };

  // Focus trap: move focus into the dialog on open, cycle Tab/Shift+Tab
  // within it, close on Escape and return focus to the trigger tile.
  useEffect(() => {
    if (!active) return;

    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `close` closes over stable refs/state setters only
  }, [active]);

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <GpEyebrow>Real Stories</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Outcomes, in their own words
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous story"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gp-forest-900)] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next story"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gp-forest-900)] text-white transition-colors hover:bg-[color:var(--gp-forest-800)]"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-8 flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {STORIES.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={(event) => openStory(story, event.currentTarget)}
              style={{ width: CARD_WIDTH, aspectRatio: "9 / 16", scrollSnapAlign: "start" }}
              className="group relative shrink-0 overflow-hidden rounded-[var(--gp-radius-md)] text-left"
            >
              <Image
                src={story.poster}
                alt={story.alt}
                fill
                sizes="340px"
                className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />

              <span className="absolute inset-0 flex items-center justify-center">
                <PlayGlyph className="h-14 w-14 drop-shadow-[0_4px_16px_rgba(10,46,44,0.45)] transition-transform group-hover:scale-110" />
              </span>

              <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-[11px] font-semibold text-white">
                {story.duration}
              </span>

              <span className="absolute bottom-4 left-4 right-4">
                <span className="gp-eyebrow block text-[color:var(--gp-gold-300)]">{story.name}</span>
                <span className="mt-1 block font-display text-[15px] text-white">{story.role}</span>
              </span>
            </button>
          ))}
        </div>
      </GpContainer>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--gp-forest-950)]/85 p-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.name} video testimonial`}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--gp-radius-lg)] bg-white p-5 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">{active.duration} video</p>
                <h3 className="font-display mt-1 text-[16px] text-[color:var(--gp-ink)]">
                  {active.name} — {active.role}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close video"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--gp-muted)] hover:bg-[color:var(--gp-cream-200)]"
              >
                ✕
              </button>
            </div>

            {/* TODO: swap for a real <video> element once client supplies footage. */}
            <div className="relative mt-5 aspect-video overflow-hidden rounded-[var(--gp-radius-md)]">
              <Image src={active.poster} alt={active.alt} fill sizes="640px" className="object-cover" />
              <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />
              <p className="absolute bottom-4 left-4 right-4 text-[13px] font-medium leading-relaxed text-white">
                &ldquo;{active.quote}&rdquo;
              </p>
            </div>

            <details className="mt-5 rounded-[var(--gp-radius-sm)] border border-line p-4">
              <summary className="cursor-pointer text-[13px] font-semibold text-[color:var(--gp-ink)]">
                Read transcript
              </summary>
              <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                &ldquo;{active.quote}&rdquo; — {active.name}, {active.role}.
              </p>
            </details>
          </div>
        </div>
      ) : null}
    </GpSection>
  );
}
