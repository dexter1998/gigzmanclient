import { ArrowLeftRight } from "lucide-react";
import {
  AREA_UNITS,
  COMMON_QUANTITIES,
  convertArea,
  formatArea,
  pairSlug,
  type AreaUnit,
} from "@/lib/calculators/area-units";
import { GpContainer, GpEyebrow, GpSection } from "../gp-primitives";
import RelatedCardsV2 from "../RelatedCardsV2";

/* ─────────────────────────────── conversion table
   The quantity table is the section these pages actually rank with —
   "how many gaj in 100 square feet" style queries resolve to a row,
   not to prose. */

export function ConversionTableV2({ from, to }: { from: AreaUnit; to: AreaUnit }) {
  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Conversion table</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
          {from.name} to {to.name} at a glance
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-[color:var(--gp-cream-200)] text-left text-[11px] uppercase tracking-[0.07em] text-[color:var(--gp-muted)]">
                  <th className="px-4 py-3 font-semibold">{from.name}</th>
                  <th className="px-4 py-3 font-semibold">{to.name}</th>
                </tr>
              </thead>
              <tbody>
                {COMMON_QUANTITIES.map((q) => (
                  <tr key={q} className="border-t border-[color:var(--gp-border)]">
                    <td className="px-4 py-2.5 font-medium text-[color:var(--gp-ink)]">
                      {q.toLocaleString("en-IN")} {from.name}
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--gp-body)]">
                      {formatArea(convertArea(q, from, to))} {to.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-5">
            <div className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-5">
              <h3 className="font-display text-[15px] text-[color:var(--gp-ink)]">
                How many {to.name} in one {from.name}?
              </h3>
              <p className="font-sans mt-2 text-[24px] font-semibold text-[color:var(--gp-gold-600)]">
                {formatArea(convertArea(1, from, to))}
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                One {from.name.toLowerCase()} is {formatArea(from.sqft)} square feet and one{" "}
                {to.name.toLowerCase()} is {formatArea(to.sqft)} square feet, so the conversion is a
                straight division between the two.
              </p>
            </div>

            <div className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-5">
              <h3 className="font-display text-[15px] text-[color:var(--gp-ink)]">About the {from.name.toLowerCase()}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">{from.note}</p>
            </div>

            <div className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-5">
              <h3 className="font-display text-[15px] text-[color:var(--gp-ink)]">About the {to.name.toLowerCase()}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">{to.note}</p>
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}

/* ─────────────────────────────── faceted interlinking */

export function RelatedConversionsV2({
  from,
  to,
  p,
}: {
  from: AreaUnit;
  to: AreaUnit;
  p: (path: string) => string;
}) {
  const card = (pair: { from: AreaUnit; to: AreaUnit }) => ({
    href: p(`/area-converter/${pairSlug(pair.from, pair.to)}`),
    title: `${pair.from.name} to ${pair.to.name}`,
    subtitle: `1 ${pair.from.name.toLowerCase()} = ${formatArea(
      convertArea(1, pair.from, pair.to),
    )} ${pair.to.name.toLowerCase()}`,
  });

  const fromSame = AREA_UNITS.filter((u) => u.slug !== from.slug).map((u) => card({ from, to: u }));
  const toSame = AREA_UNITS.filter((u) => u.slug !== to.slug).map((u) => card({ from: u, to }));

  return (
    <GpSection tone="cream" className="pt-0">
      <GpContainer>
        <div className="space-y-10">
          <RelatedCardsV2
            title={`Convert ${from.name} to other units`}
            items={fromSame}
            icon={ArrowLeftRight}
          />
          <RelatedCardsV2
            title={`Convert other units to ${to.name}`}
            items={toSame}
            icon={ArrowLeftRight}
          />
        </div>
      </GpContainer>
    </GpSection>
  );
}
