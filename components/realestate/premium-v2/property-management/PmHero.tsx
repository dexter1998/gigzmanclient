import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { GpContainer, GpEyebrow } from "../gp-primitives";
import PmServiceCta from "./PmServiceCta";

const BASE =
  "/verticals/realestate/templates/premium-v2/property-management-page";

const ASSURANCES = [
  "Verified tenants",
  "Transparent reporting",
  "Dedicated advisor",
];

/**
 * Page hero.
 *
 * The phone, its gold orbital line and the marble platform are baked into
 * both hero backgrounds and the asset pack is explicit that they must not be
 * re-composited, so this lays copy over the art rather than assembling it.
 * The two crops are swapped at the md breakpoint instead of one being
 * reframed: the desktop art puts the phone on the right, where the copy is
 * not, and cropping it to a phone width would cut the phone in half.
 */
export default function PmHero({ firmName }: { firmName: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--gp-forest-950)]">
      <Image
        src={`${BASE}/hero-desktop.webp`}
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center md:block"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full md:block md:bg-[linear-gradient(90deg,rgba(3,61,56,0.95)_0%,rgba(3,61,56,0.88)_38%,rgba(3,61,56,0.48)_58%,rgba(3,61,56,0)_78%)]"
      />

      <div className="relative">
        <Image
          src={`${BASE}/hero-desktop.webp`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-left md:hidden"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 h-full w-full bg-[linear-gradient(180deg,rgba(3,61,56,0.93)_0%,rgba(3,61,56,0.9)_60%,rgba(3,61,56,0.86)_100%)] md:hidden"
        />

        <GpContainer className="relative">
          <div className="py-16 sm:py-20 md:flex md:min-h-[min(64vw,880px)] md:items-center md:py-24">
            <div className="max-w-xl md:max-w-[600px] lg:max-w-[700px]">
              <span
                className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
                aria-hidden="true"
              />
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">
                End-to-end property management
              </GpEyebrow>

              <h1 className="gp-hero-title font-display mt-4 text-white">
                Own the property.
                <br />
                We&rsquo;ll manage everything else.
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base">
                From tenant sourcing and rent collection to inspections,
                maintenance and documentation&mdash;
                <span className="font-semibold text-white">
                  {firmName}
                </span>{" "}
                keeps your property performing without the daily follow-up.
              </p>

              <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
                {ASSURANCES.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[14px] text-white/80"
                  >
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <PmServiceCta>Talk to a property manager</PmServiceCta>
                <a
                  href="#management-services"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-[var(--gp-radius-sm)] border border-white/35 px-7 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:border-white"
                >
                  Explore management services
                </a>
              </div>

              <p className="mt-8 flex items-center gap-3 text-[13.5px] text-white/65">
                <span
                  className="h-px w-8 shrink-0 bg-[color:var(--gp-gold-600)]"
                  aria-hidden="true"
                />
                Built for local owners, investors and NRIs.
              </p>
            </div>
          </div>
        </GpContainer>
      </div>

      {/* Below md the art is stacked under the copy so the phone stays whole —
          the portrait crop is 1024x1536 and covering a phone-width section
          with it crops roughly half of each side away. */}
      <div className="relative aspect-[1024/880] w-full md:hidden">
        <Image
          src={`${BASE}/hero-mobile.webp`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,var(--gp-forest-950)_0%,rgba(10,46,44,0)_100%)]"
        />
      </div>
    </section>
  );
}
