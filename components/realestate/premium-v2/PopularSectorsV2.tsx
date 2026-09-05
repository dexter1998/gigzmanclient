import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";

/**
 * Discovery links only — there is no per-sector page or tracked market data
 * in this codebase (only the five corridors above have real figures), so
 * each sector here routes to the properties listing's free-text search
 * rather than a dedicated (and inevitably 404ing) sector page.
 */
const SECTORS = [
  "Sector 54",
  "Sector 65",
  "Sector 67",
  "Sector 70",
  "Sector 82",
  "Sector 84",
  "Sector 86",
  "Sector 89",
  "Palam Vihar",
  "Sushant Lok",
  "DLF Phase 1",
  "DLF Phase 5",
];

export default function PopularSectorsV2({ p }: { p: (path: string) => string }) {
  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Browse Deeper</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 max-w-xl text-[color:var(--gp-ink)]">
          Popular sectors and locality pages
        </h2>
        <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-[color:var(--gp-body)]">
          Looking for a specific sector rather than a whole corridor? Search our current listings
          for it directly.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SECTORS.map((sector) => (
            <Link
              key={sector}
              href={p(`/properties?search=${encodeURIComponent(sector)}`)}
              className="group flex min-h-[52px] items-center justify-between gap-2 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-white px-4 text-[13.5px] font-medium text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)]"
            >
              {sector}
              <ArrowUpRight
                className="h-3.5 w-3.5 shrink-0 text-[color:var(--gp-muted)] transition-colors group-hover:text-[color:var(--gp-gold-600)]"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </GpContainer>
    </GpSection>
  );
}
