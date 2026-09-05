import type { JSX } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";

interface RecentDealsV2Props {
  p: (path: string) => string;
}

const IMAGE = "/verticals/realestate/templates/premium-v2/images/property-valuation.png";

interface DealRow {
  corridor: string;
  configuration: string;
  price: string;
  month: string;
}

/**
 * Six illustrative rows only — this is not a feed of real closed transactions,
 * hence the caption above and below the table. Numbers are round, plausible
 * figures for the corridors this template already covers elsewhere (Golf
 * Course Road, Dwarka Expressway, Sohna Road, SPR, New Gurugram).
 */
const DEALS: DealRow[] = [
  { corridor: "Golf Course Road", configuration: "4 BHK Apartment", price: "₹6.4 – 6.9 Cr", month: "Aug 2026" },
  { corridor: "Dwarka Expressway", configuration: "3 BHK Apartment", price: "₹2.6 – 2.9 Cr", month: "Aug 2026" },
  { corridor: "Sohna Road", configuration: "Independent Villa", price: "₹5.5 – 6.1 Cr", month: "Jul 2026" },
  { corridor: "New Gurugram", configuration: "Retail Shop", price: "₹1.1 – 1.3 Cr", month: "Jul 2026" },
  { corridor: "Southern Peripheral Road", configuration: "3 BHK Builder Floor", price: "₹1.7 – 1.9 Cr", month: "Jun 2026" },
  { corridor: "Golf Course Road", configuration: "Commercial Office", price: "₹4.2 – 4.8 Cr", month: "Jun 2026" },
];

export default function RecentDealsV2({ p }: { p: (path: string) => string }): JSX.Element {
  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-stretch">
          <div>
            <GpEyebrow>Market Proof</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Recent activity across our corridors
            </h2>

            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
              Illustrative recent activity — not individual transaction records
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="gp-eyebrow py-3 pr-4 font-semibold text-[color:var(--gp-muted)]">
                      Corridor
                    </th>
                    <th className="gp-eyebrow py-3 pr-4 font-semibold text-[color:var(--gp-muted)]">
                      Configuration
                    </th>
                    <th className="gp-eyebrow py-3 pr-4 font-semibold text-[color:var(--gp-muted)]">
                      Price Range
                    </th>
                    <th className="gp-eyebrow py-3 font-semibold text-[color:var(--gp-muted)]">Month</th>
                  </tr>
                </thead>
                <tbody>
                  {DEALS.map((deal) => (
                    <tr key={`${deal.corridor}-${deal.month}-${deal.configuration}`} className="border-b border-line">
                      <td className="py-3.5 pr-4 font-display text-[15px] text-[color:var(--gp-ink)]">
                        {deal.corridor}
                      </td>
                      <td className="py-3.5 pr-4 text-[13px] text-[color:var(--gp-body)]">
                        {deal.configuration}
                      </td>
                      <td className="py-3.5 pr-4 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)]">
                        {deal.price}
                      </td>
                      <td className="py-3.5 text-[13px] text-[color:var(--gp-muted)]">{deal.month}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[11.5px] leading-relaxed text-[color:var(--gp-muted)]">
              Figures above are indicative and anonymised for illustration; they are not verified
              transaction records. Ask an advisor for corridor-specific, sourced comparables.
            </p>
          </div>

          <a
            href={p("/calculators")}
            className="group relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[var(--gp-radius-lg)]"
          >
            <Image
              src={IMAGE}
              alt="Property valuation review"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />
            <div className="relative p-7 sm:p-8">
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">Ready to Sell?</GpEyebrow>
              <h3 className="gp-overlay-title font-display mt-2 max-w-[280px] text-white">
                Get a free valuation for your property
              </h3>
              <p className="mt-2 max-w-[260px] text-[12.5px] leading-relaxed text-white/70">
                Comparable listings, current demand and corridor-level context — reviewed by an
                advisor.
              </p>
              <span className="mt-5 inline-flex min-h-[46px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[13px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors group-hover:bg-[color:var(--gp-gold-300)]">
                Get a Free Valuation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </a>
        </div>
      </GpContainer>
    </GpSection>
  );
}
