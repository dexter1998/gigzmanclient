import Image from "next/image";
import { Camera, ClipboardCheck, PhoneCall, ShieldCheck } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "../gp-primitives";
import PmServiceCta from "./PmServiceCta";
import {
  INSPECTION_BADGES,
  MAINTENANCE_STEPS,
} from "@/lib/premium-v2/property-management";

const BASE =
  "/verticals/realestate/templates/premium-v2/property-management-page";
const BADGE_ICONS = [ClipboardCheck, Camera, ShieldCheck];

export default function PmMaintenance({ firmName }: { firmName: string }) {
  return (
    <>
      <section className="relative isolate grid grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[320px] lg:min-h-[560px]">
          <Image
            src={`${BASE}/inspector.webp`}
            alt="A High Properties inspector documenting a unit on a tablet during a scheduled visit"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/* The badge row sits on the photograph rather than under it, as in
              the design — a scrim keeps it legible over the bright interior. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(10,46,44,0)_0%,rgba(10,46,44,0.85)_100%)]"
          />
          <ul className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-[var(--gp-radius-md)] bg-[color:var(--gp-forest-950)]/80 px-5 py-4 backdrop-blur-sm sm:inset-x-6 sm:bottom-6 sm:flex-row sm:items-center sm:justify-between">
            {INSPECTION_BADGES.map((badge, i) => {
              const Icon = BADGE_ICONS[i];
              return (
                <li
                  key={badge}
                  className="flex items-center gap-2.5 text-[13px] text-white/85"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]"
                    aria-hidden="true"
                  />
                  {badge}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center bg-[color:var(--gp-cream-100)] px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
          <div className="max-w-xl">
            <GpEyebrow>Inspections &amp; maintenance</GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
              Every detail inspected.
              <br />
              Every issue handled.
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
              Proactive inspections and responsive maintenance keep your
              property in top condition.{" "}
              <span className="font-semibold text-[color:var(--gp-ink)]">
                {firmName}
              </span>{" "}
              ensures quality living for your tenants and long-term value for
              your asset.
            </p>

            <ol className="mt-9 space-y-6">
              {MAINTENANCE_STEPS.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--gp-gold-600)]/50 font-sans text-[13px] font-semibold text-[color:var(--gp-gold-600)]">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-display text-[16px] text-[color:var(--gp-ink)]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <GpSection tone="forest" className="!py-0">
        <GpContainer>
          <div className="flex flex-col gap-6 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[color:var(--gp-gold-600)]/45 text-[color:var(--gp-gold-600)]">
                <PhoneCall className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">
                  Urgent maintenance support
                </p>
                <p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/80">
                  Priority coordination for plumbing, electrical, HVAC and
                  access issues.
                </p>
              </div>
            </div>
            <PmServiceCta className="shrink-0">Raise a request</PmServiceCta>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
