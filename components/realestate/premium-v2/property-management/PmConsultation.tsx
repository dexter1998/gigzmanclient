import Image from "next/image";
import { Clock, ShieldCheck, UserRound } from "lucide-react";
import { GpContainer, GpEyebrow } from "../gp-primitives";
import QueryFormV2 from "../QueryFormV2";
import LoanFaqV2 from "../home-loan/LoanFaqV2";
import { MANAGEMENT_FAQS } from "@/lib/premium-v2/property-management";

const BASE =
  "/verticals/realestate/templates/premium-v2/property-management-page";

const ASSURANCES = [
  { icon: Clock, title: "Response within", body: "30 minutes" },
  { icon: ShieldCheck, title: "No obligation", body: "" },
  { icon: UserRound, title: "Local advisor", body: "" },
];

/**
 * The one inline form on the page.
 *
 * Every other service CTA opens the popup instead — this is here for the
 * visitor who reaches the bottom still reading rather than one who has
 * already decided. It reuses QueryFormV2 so enquiries land in the same
 * dashboard queue, with the service preset so the advisor sees where it came
 * from.
 */
export default function PmConsultation({
  thankYouHref,
}: {
  thankYouHref: string;
}) {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[color:var(--gp-forest-950)]">
        <Image
          src={`${BASE}/cta-night.webp`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 h-full w-full bg-[linear-gradient(180deg,rgba(3,61,56,0.93)_0%,rgba(3,61,56,0.8)_100%)] lg:bg-[linear-gradient(90deg,rgba(3,61,56,0.95)_0%,rgba(3,61,56,0.86)_42%,rgba(3,61,56,0.55)_65%,rgba(3,61,56,0.35)_100%)]"
        />

        <GpContainer className="relative">
          <div className="grid grid-cols-1 items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_460px] lg:py-24">
            <div className="max-w-xl">
              <span
                className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
                aria-hidden="true"
              />
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">
                Property management consultation
              </GpEyebrow>
              <h2 className="gp-section-title font-display mt-3 text-white">
                Tell us about your property.
                <br />
                We&rsquo;ll take it from here.
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/75">
                Get a personalised management plan from our local experts.
                Whether you&rsquo;re a local owner or an NRI, we&rsquo;ll handle
                tenants, maintenance, documentation and everything in between.
              </p>

              <ul className="mt-9 flex flex-wrap gap-x-9 gap-y-5">
                {ASSURANCES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="flex items-center gap-3">
                      <Icon
                        className="h-5 w-5 shrink-0 text-[color:var(--gp-gold-600)]"
                        aria-hidden="true"
                      />
                      <span className="text-[13.5px] leading-tight text-white/80">
                        {item.title}
                        {item.body ? (
                          <>
                            <br />
                            {item.body}
                          </>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-gold-600)]/35 bg-[color:var(--gp-cream-100)] p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)] sm:p-7">
              <h3 className="font-display text-[22px] text-[color:var(--gp-ink)]">
                Request a free consultation
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                Share a few details and our property-management advisor will get
                in touch shortly.
              </p>
              <div className="mt-5">
                <QueryFormV2
                  services={[]}
                  defaultService="property-management"
                  thankYouHref={thankYouHref}
                />
              </div>
            </div>
          </div>
        </GpContainer>
      </section>

      <LoanFaqV2
        faqs={[...MANAGEMENT_FAQS]}
        heading="Questions property owners ask."
      />
    </>
  );
}
