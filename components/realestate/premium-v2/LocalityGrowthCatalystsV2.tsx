import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";

interface Catalyst {
  title: string;
  detail: string;
}

/**
 * Four well-known, publicly reported Gurugram infrastructure programmes.
 * Presented as editorial context for how the corridors above may develop —
 * explicitly not a live data feed or a guarantee of timeline, in the same
 * honest-disclosure register as PremiumV2LocalityDetailPage's valuation
 * caveat ("corridor averages, not a certified valuation").
 */
const CATALYSTS: Catalyst[] = [
  {
    title: "Dwarka Expressway opening",
    detail:
      "The expressway is progressively opening in phases, expected to ease Delhi–Gurugram travel and lift interest along the corridor it's named for.",
  },
  {
    title: "Metro expansion phase",
    detail:
      "Planned extensions aim to bring rapid transit closer to corridors that today depend entirely on road access.",
  },
  {
    title: "Southern Peripheral Road connectivity",
    detail:
      "SPR continues to be upgraded as a link between Golf Course Road Extension and Sohna Road, shortening cross-city commutes.",
  },
  {
    title: "Global City & business hubs",
    detail:
      "Large mixed-use business district proposals near Dwarka Expressway are expected to add commercial demand to nearby residential corridors over time.",
  },
];

export default function LocalityGrowthCatalystsV2() {
  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Growth Catalysts</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 max-w-xl text-[color:var(--gp-ink)]">
          Infrastructure shaping the next cycle
        </h2>
        <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-[color:var(--gp-body)]">
          Editorial context, not a certified timeline — these are publicly reported programmes
          worth tracking, not confirmed dates or guaranteed outcomes.
        </p>

        <ol className="mt-10 grid grid-cols-1 gap-8 border-t border-[color:var(--gp-border)] pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {CATALYSTS.map((item, index) => (
            <li key={item.title} className="relative pl-9">
              <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--gp-gold-600)] text-[11px] font-semibold text-[color:var(--gp-gold-600)]">
                {index + 1}
              </span>
              <h3 className="font-display text-[16px] text-[color:var(--gp-ink)]">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-muted)]">
                {item.detail}
              </p>
            </li>
          ))}
        </ol>
      </GpContainer>
    </GpSection>
  );
}
