import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "../gp-primitives";
import PmServiceCta from "./PmServiceCta";
import {
  JOURNEY_STEPS,
  VERIFICATION_CHECKS,
} from "@/lib/premium-v2/property-management";

const BASE =
  "/verticals/realestate/templates/premium-v2/property-management-page";

/**
 * "How it works" followed by the tenant-verification split.
 *
 * The five steps are a connected rail on desktop and a plain numbered list on
 * mobile — the connecting line is decorative and drawn with a border on the
 * step row rather than per-step pseudo elements, so it cannot drift out of
 * alignment when a label wraps to two lines.
 */
export default function PmJourney() {
  return (
    <>
      <GpSection tone="cream">
        <GpContainer>
          <div className="mx-auto max-w-2xl text-center">
            <span
              className="mx-auto mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
              aria-hidden="true"
            />
            <GpEyebrow>How it works</GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
              From keys in hand to complete peace of mind.
            </h2>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {JOURNEY_STEPS.map((step, index) => (
              <li key={step.step} className="relative lg:text-center">
                {/* Rail between steps, desktop only. */}
                {index < JOURNEY_STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-6 hidden h-px w-full bg-[color:var(--gp-gold-600)]/35 lg:block"
                  />
                ) : null}
                <span className="relative z-[1] flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--gp-gold-600)] font-sans text-[15px] font-semibold text-[color:var(--gp-forest-950)] lg:mx-auto">
                  {step.step}
                </span>
                <h3 className="font-display mt-5 text-[16px] text-[color:var(--gp-ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </GpContainer>
      </GpSection>

      <section className="relative isolate grid grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[300px] lg:min-h-[520px]">
          <Image
            src={`${BASE}/tenant-consultation.webp`}
            alt="An advisor taking a couple through tenant verification and lease documents"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex items-center bg-[image:var(--gp-gradient-dark-section)] px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
          <div className="max-w-lg">
            <h2 className="gp-section-title font-display text-white">
              Verified tenants.
              <br />
              Protected ownership.
            </h2>

            <ul className="mt-8 space-y-4">
              {VERIFICATION_CHECKS.map((check) => (
                <li
                  key={check}
                  className="flex items-center gap-3.5 text-[14.5px] text-white/80"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--gp-gold-600)]/60 text-[color:var(--gp-gold-600)]">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {check}
                </li>
              ))}
            </ul>

            <p className="mt-9 inline-flex flex-wrap items-center gap-2.5 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-gold-600)]/40 px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--gp-gold-300)]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              KYC verified
              <span className="text-white/30">&middot;</span>
              Documented
              <span className="text-white/30">&middot;</span>
              Tracked
            </p>

            <div className="mt-8">
              <PmServiceCta>Start tenant search</PmServiceCta>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
