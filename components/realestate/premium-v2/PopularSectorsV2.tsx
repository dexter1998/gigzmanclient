import { MapPin } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import RelatedCardsV2 from "./RelatedCardsV2";

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

        <RelatedCardsV2
          className="mt-8"
          items={SECTORS.map((sector) => ({
            href: p(`/properties?search=${encodeURIComponent(sector)}`),
            title: sector,
            subtitle: "Current listings in this pocket",
          }))}
          icon={MapPin}
        />
      </GpContainer>
    </GpSection>
  );
}
