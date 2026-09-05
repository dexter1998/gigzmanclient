import Link from "next/link";
import type { localities } from "@/lib/db/schema";
import { formatIndianPrice } from "@/lib/format";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";

type Locality = typeof localities.$inferSelect;

/**
 * Plain editorial table (thin dividers, no per-row cards) in the same style
 * as the homepage's RecentDealsV2 — but built from real per-locality tracked
 * figures, not illustrative deal rows, hence no "not verified" caption here.
 */
export default function LocalityCompareTableV2({
  localities,
  p,
}: {
  localities: Locality[];
  p: (path: string) => string;
}) {
  if (localities.length === 0) return null;

  return (
    <GpSection tone="forest">
      <GpContainer>
        <GpEyebrow className="text-[color:var(--gp-gold-300)]">Compare</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 max-w-xl text-white">
          Side-by-side locality intelligence
        </h2>
        <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-white/70">
          The same tracked figures our advisors use when they shortlist a property for you, laid
          out corridor by corridor.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/15">
                <th className="gp-eyebrow py-3 pr-4 font-semibold text-white/50">Locality</th>
                <th className="gp-eyebrow py-3 pr-4 font-semibold text-white/50">Avg. Price</th>
                <th className="gp-eyebrow py-3 pr-4 font-semibold text-white/50">YoY</th>
                <th className="gp-eyebrow py-3 pr-4 font-semibold text-white/50">Yield</th>
                <th className="gp-eyebrow py-3 font-semibold text-white/50">Active Projects</th>
              </tr>
            </thead>
            <tbody>
              {localities.map((locality) => (
                <tr key={locality.id} className="border-b border-white/10">
                  <td className="py-3.5 pr-4">
                    <Link
                      href={p(`/localities/${locality.slug}`)}
                      className="font-display text-[15px] text-white hover:text-[color:var(--gp-gold-300)]"
                    >
                      {locality.name}
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4 text-[13.5px] font-semibold text-[color:var(--gp-gold-300)]">
                    {locality.avgPricePerSqft ? `${formatIndianPrice(locality.avgPricePerSqft)}/sq.ft` : "—"}
                  </td>
                  <td className="py-3.5 pr-4 text-[13px] text-white/80">
                    {locality.yoyChangePercent != null
                      ? `${locality.yoyChangePercent >= 0 ? "+" : ""}${locality.yoyChangePercent}%`
                      : "—"}
                  </td>
                  <td className="py-3.5 pr-4 text-[13px] text-white/80">
                    {locality.rentalYieldPercent != null ? `${locality.rentalYieldPercent}%` : "—"}
                  </td>
                  <td className="py-3.5 text-[13px] text-white/80">
                    {locality.activeProjects != null ? locality.activeProjects : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GpContainer>
    </GpSection>
  );
}
