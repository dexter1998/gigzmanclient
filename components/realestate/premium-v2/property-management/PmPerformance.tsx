import { CheckCircle2 } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "../gp-primitives";
import PmServiceCta from "./PmServiceCta";
import {
  PERFORMANCE_METRICS,
  RECENT_DEALS,
} from "@/lib/premium-v2/property-management";

/**
 * Rental performance.
 *
 * The design shows a dashboard chart panel on the right; the pack ships that
 * only as a flattened reference, and its guidance is that metrics must be
 * live HTML rather than a screenshot. So the numbers are typed here and the
 * panel is built out of the same tokens as the rest of the page — which also
 * means the figures can be corrected without re-exporting an image.
 */
export default function PmPerformance() {
  return (
    <GpSection tone="forest">
      <GpContainer>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <span
              className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
              aria-hidden="true"
            />
            <GpEyebrow className="text-[color:var(--gp-gold-300)] hover:text-white">
              Rental performance
            </GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 text-white">
              Management measured in outcomes.
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/75">
              Transparent reporting across rent, occupancy, maintenance and
              asset performance.
            </p>

            <dl className="mt-10 flex flex-col gap-6 sm:flex-row sm:gap-0">
              {PERFORMANCE_METRICS.map((metric, i) => (
                <div
                  key={metric.label}
                  className={
                    i > 0 ? "sm:border-l sm:border-white/15 sm:pl-8" : "sm:pr-8"
                  }
                >
                  <dt className="font-sans text-[38px] font-semibold leading-none text-[color:var(--gp-gold-300)]">
                    {metric.value}
                  </dt>
                  <dd className="mt-2 text-[13px] text-white/65">
                    {metric.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-[var(--gp-radius-lg)] border border-white/12 bg-white/[0.05] p-6 sm:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-[19px] text-white">
                Recent managed deals
              </h3>
              <PmServiceCta
                variant="quiet"
                className="text-[color:var(--gp-gold-300)]"
              >
                View all deals
              </PmServiceCta>
            </div>

            <ul className="mt-6 divide-y divide-white/10">
              {RECENT_DEALS.map((deal) => (
                <li
                  key={deal.location}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-medium text-white">
                      {deal.location}
                    </p>
                    <p className="text-[12px] text-white/50">{deal.area}</p>
                  </div>
                  <p className="font-sans text-[14.5px] font-semibold text-[color:var(--gp-gold-300)]">
                    {deal.rent}
                  </p>
                  <p className="flex w-full items-center gap-1.5 text-[12.5px] text-white/70 sm:w-auto sm:justify-end">
                    <CheckCircle2
                      className="h-3.5 w-3.5 shrink-0 text-[color:var(--gp-success)]"
                      aria-hidden="true"
                    />
                    {deal.outcome}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-7 border-t border-white/10 pt-7">
              <h3 className="gp-overlay-title font-display text-white">
                Know what your property could earn.
              </h3>
              <div className="mt-5">
                <PmServiceCta>Get rental assessment</PmServiceCta>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-[11.5px] leading-relaxed text-white/45">
          Illustrative portfolio data; actual results vary by property, corridor
          and market conditions at the time of letting.
        </p>
      </GpContainer>
    </GpSection>
  );
}
