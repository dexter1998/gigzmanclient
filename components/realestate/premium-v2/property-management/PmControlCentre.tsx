import Image from "next/image";
import { BarChart3, FileText, LifeBuoy, Wrench } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "../gp-primitives";
import PmServiceCta from "./PmServiceCta";
import { CONTROL_CENTRE_FEATURES } from "@/lib/premium-v2/property-management";

const BASE =
  "/verticals/realestate/templates/premium-v2/property-management-page";
const ICONS = {
  occupancy: BarChart3,
  maintenance: Wrench,
  reporting: FileText,
  advisor: LifeBuoy,
} as const;

export default function PmControlCentre({ firmName }: { firmName: string }) {
  return (
    <GpSection tone="forest">
      <GpContainer>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <span
              className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
              aria-hidden="true"
            />
            <GpEyebrow className="text-[color:var(--gp-gold-300)]">
              Owner control centre
            </GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 text-white">
              One clear view of your entire portfolio.
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/75">
              Real-time insights, complete transparency and expert
              support&mdash;
              <span className="font-semibold text-white">{firmName}</span> puts
              you in control, wherever you are.
            </p>

            <ul className="mt-9 space-y-6">
              {CONTROL_CENTRE_FEATURES.map((feature) => {
                const Icon = ICONS[feature.key];
                return (
                  <li key={feature.key} className="flex gap-4">
                    <Icon
                      className="mt-0.5 h-6 w-6 shrink-0 text-[color:var(--gp-gold-600)]"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-display text-[17px] text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-white/65">
                        {feature.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10">
              <PmServiceCta>Request app access</PmServiceCta>
            </div>
            <p className="mt-6 flex items-center gap-3 text-[13px] text-white/55">
              <span
                className="h-px w-8 shrink-0 bg-[color:var(--gp-gold-600)]"
                aria-hidden="true"
              />
              For existing and prospective property owners.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[var(--gp-radius-lg)] border border-white/10 bg-white/[0.04] p-3 sm:p-4">
            <Image
              src={`${BASE}/owner-dashboard.webp`}
              alt="The owner portal showing portfolio value, monthly rent, occupancy and a rent trend chart"
              width={900}
              height={760}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full rounded-[var(--gp-radius-md)] object-cover"
            />
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
