import Image from "next/image";
import { MapPin } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "../gp-primitives";
import PmServiceCta from "./PmServiceCta";
import {
  COVERAGE_CORRIDORS,
  PROPERTY_TYPES,
} from "@/lib/premium-v2/property-management";

const BASE =
  "/verticals/realestate/templates/premium-v2/property-management-page";

/**
 * Property types, then Gurugram coverage.
 *
 * The five property types are one panoramic image with diagonal cuts baked
 * in, so they are not sliced the way the services mosaic is — cutting
 * straight rectangles out of diagonal seams leaves a wedge of the neighbour
 * in every tile. The panorama stays whole and the labels sit over it as live
 * links, which is how the design reads them anyway. Below md, where the strip
 * would be unreadably narrow, the labels drop into a plain list beneath it.
 */
export default function PmCoverage({ firmName }: { firmName: string }) {
  return (
    <>
      <GpSection tone="cream" className="!pb-0">
        <GpContainer>
          <span
            className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
            aria-hidden="true"
          />
          <GpEyebrow>What we manage</GpEyebrow>
          <h2 className="gp-section-title font-display mt-3 max-w-2xl text-[color:var(--gp-ink)]">
            From one home to an entire portfolio.
          </h2>
        </GpContainer>

        <div className="relative mt-10 w-full">
          <Image
            src={`${BASE}/property-types-panorama.webp`}
            alt="Apartments, luxury villas, builder floors, commercial buildings and plots across Gurugram"
            width={1891}
            height={832}
            sizes="100vw"
            className="h-[220px] w-full object-cover sm:h-[300px] lg:h-auto"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,46,44,0)_45%,rgba(10,46,44,0.8)_100%)]"
          />
          <ul className="absolute inset-x-0 bottom-0 hidden lg:grid lg:grid-cols-5">
            {PROPERTY_TYPES.map((type) => (
              <li key={type.key} className="px-6 pb-6">
                <PmServiceCta
                  variant="quiet"
                  className="text-[15px] text-white hover:text-[color:var(--gp-gold-300)]"
                >
                  {type.label}
                </PmServiceCta>
              </li>
            ))}
          </ul>
        </div>

        <GpContainer>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-4 py-8 sm:grid-cols-2 lg:hidden">
            {PROPERTY_TYPES.map((type) => (
              <li
                key={type.key}
                className="border-b border-[color:var(--gp-border)] pb-4"
              >
                <PmServiceCta
                  variant="quiet"
                  className="text-[15px] text-[color:var(--gp-ink)] hover:text-[color:var(--gp-gold-600)]"
                >
                  {type.label}
                </PmServiceCta>
              </li>
            ))}
          </ul>
        </GpContainer>
      </GpSection>

      <GpSection tone="forest">
        <GpContainer>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">
                Gurugram
              </GpEyebrow>
              <p className="mt-3 text-[13px] uppercase leading-relaxed tracking-[0.16em] text-white/55">
                Key locations. Stronger care. Closer to you.
              </p>
              <div className="mt-7 overflow-hidden rounded-[var(--gp-radius-lg)] border border-white/10 bg-white/[0.04] p-3">
                <Image
                  src={`${BASE}/coverage-map.webp`}
                  alt="Map of Gurugram showing the corridors High Properties manages across"
                  width={860}
                  height={500}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="w-full rounded-[var(--gp-radius-md)]"
                />
              </div>
            </div>

            <div>
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">
                Local expertise
              </GpEyebrow>
              <h2 className="gp-section-title font-display mt-3 text-white">
                On-ground teams across Gurugram.
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/75">
                Local teams. Faster response. Greater peace of mind. From
                routine maintenance to urgent issues,{" "}
                <span className="font-semibold text-white">{firmName}</span> is
                always close by.
              </p>

              <ul className="mt-8 space-y-3">
                {COVERAGE_CORRIDORS.map((corridor) => (
                  <li
                    key={corridor.name}
                    className="flex items-center justify-between gap-4 border-b border-white/10 pb-3"
                  >
                    <span className="flex items-center gap-3 text-[14px] text-white/85">
                      <MapPin
                        className="h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]"
                        aria-hidden="true"
                      />
                      {corridor.name}
                    </span>
                    <span className="shrink-0 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-gold-600)]/35 px-2.5 py-1 text-[11.5px] font-medium text-[color:var(--gp-gold-300)]">
                      {corridor.response}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <PmServiceCta>Check service in your area</PmServiceCta>
              </div>
            </div>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
