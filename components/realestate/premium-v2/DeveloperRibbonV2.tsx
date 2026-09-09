import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";

const BASE = "/verticals/realestate/templates/premium-v2/developer-logos-v2";

// Real, verified developer partners (confirmed by the client) — official
// logo files sourced from each company's own site or Wikimedia Commons.
// "Enigma" was on the original list but couldn't be matched to a confirmed
// Gurugram real-estate developer of that name (only an unrelated restaurant
// and an Indiabulls project turned up) — left out rather than guessed.
const DEVELOPERS = [
  { src: `${BASE}/dlf.svg`, name: "DLF" },
  { src: `${BASE}/emaar.svg`, name: "Emaar" },
  // Sourced logo is white-on-transparent (built for a dark navbar) — invert
  // to read on this section's light background rather than disappear on it.
  { src: `${BASE}/m3m.webp`, name: "M3M", invert: true },
  { src: `${BASE}/conscient.png`, name: "Conscient" },
  { src: `${BASE}/ats.svg`, name: "ATS" },
  { src: `${BASE}/godrej.svg`, name: "Godrej" },
  { src: `${BASE}/hero-homes.jpg`, name: "Hero Homes" },
];

export default function DeveloperRibbonV2({ p }: { p: (path: string) => string }) {
  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <GpEyebrow>Trusted Ecosystem</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              The names shaping Gurugram
            </h2>
            <p className="mt-2 max-w-md text-[14px] text-[color:var(--gp-muted)]">
              Explore active projects, delivery history and corridor presence.
            </p>
          </div>
          <Link
            href={p("/properties")}
            className="inline-flex min-h-[38px] items-center gap-1.5 text-[13px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
          >
            All developers
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* A grid, not `flex-wrap` with `flex-1`. Seven flexed items plus their
            horizontal padding collapsed the content box to about 8px on a
            phone, so every logo rendered 8x3 and was effectively invisible. */}
        <div className="mt-9 grid grid-cols-2 gap-y-8 border-y border-[color:var(--gp-border)] py-10 sm:grid-cols-3 lg:grid-cols-7 lg:gap-y-0">
          {DEVELOPERS.map((developer, index) => (
            <Link
              key={developer.name}
              // `getProperties` doesn't have a `developer` filter yet — this
              // links forward to the eventual filtered view rather than a
              // bare `/properties`, so the link is meaningful as soon as that
              // filter ships and degrades to "browse everything" until then.
              href={p(`/properties?developer=${encodeURIComponent(developer.name)}`)}
              className={`flex h-20 items-center justify-center px-4 transition-opacity hover:opacity-70 sm:px-6 lg:h-24 ${
                index > 0 ? "lg:border-l lg:border-[color:var(--gp-border)]" : ""
              }`}
            >
              <Image
                src={developer.src}
                alt={developer.name}
                width={220}
                height={110}
                // A set height rather than `max-h`: these files disagree on
                // intrinsic size (Emaar's SVG is 100x39, DLF's is 1073 wide),
                // and a max-only rule leaves the small ones at their own size
                // while the big ones fill the box — Emaar rendered noticeably
                // smaller than every logo beside it. Sizing by height makes
                // them optically consistent whatever the source.
                className={`h-9 w-auto max-w-full object-contain sm:h-10 lg:h-11 ${
                  developer.invert ? "invert" : ""
                }`}
              />
            </Link>
          ))}
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--gp-muted)]">
          Developer Pages / Active Projects / Delivery Track Record / RERA Details
        </p>
      </GpContainer>
    </GpSection>
  );
}
