import Image from "next/image";
import { Building2, Globe2, MapPin } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "../gp-primitives";
import PmServiceCta from "./PmServiceCta";
import {
  FEATURED_SERVICE,
  MANAGEMENT_SERVICES,
  SERVICE_LINES,
} from "@/lib/premium-v2/property-management";

const LINE_ICONS = {
  commercial: Building2,
  plots: MapPin,
  nri: Globe2,
} as const;

/**
 * The services mosaic: one tall card and a 2x2 grid beside it.
 *
 * The pack ships these five as a single flattened composite; they are sliced
 * into their own files at build-prep time (see the tiles under
 * public/.../property-management-page/) so each card carries a real heading
 * and its own CTA instead of type baked into a photograph.
 */
export default function PmServices() {
  return (
    <GpSection tone="cream" id="management-services">
      <GpContainer>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <span
              className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
              aria-hidden="true"
            />
            <GpEyebrow>Our management services</GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
              Complete care for every property you own.
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-[color:var(--gp-body)] lg:pb-2">
            Proactive management, higher returns and complete peace of mind
            &mdash; so you can focus on what&rsquo;s next.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_1fr]">
          <article className="group relative overflow-hidden rounded-[var(--gp-radius-lg)]">
            <Image
              src={FEATURED_SERVICE.tile}
              alt="A managed residential apartment in Gurugram"
              width={830}
              height={941}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="h-full min-h-[320px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,46,44,0)_45%,rgba(10,46,44,0.85)_100%)]"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
              <span
                className="mb-3 block h-px w-9 bg-[color:var(--gp-gold-600)]"
                aria-hidden="true"
              />
              <h3 className="font-display text-[21px] text-white">
                {FEATURED_SERVICE.title}
              </h3>
              <p className="mt-1 text-[12.5px] text-white/70">
                {FEATURED_SERVICE.subtitle}
              </p>
            </div>
          </article>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {MANAGEMENT_SERVICES.map((service) => (
              <article
                key={service.key}
                className="group relative overflow-hidden rounded-[var(--gp-radius-lg)]"
              >
                <Image
                  src={service.tile}
                  alt=""
                  width={415}
                  height={467}
                  sizes="(max-width: 640px) 100vw, 22vw"
                  className="h-full min-h-[190px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  aria-hidden="true"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,46,44,0)_40%,rgba(10,46,44,0.88)_100%)]"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span
                    className="mb-2.5 block h-px w-8 bg-[color:var(--gp-gold-600)]"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-[16px] leading-snug text-white">
                    {service.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-6 border-t border-[color:var(--gp-border)] pt-7 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-9">
            {SERVICE_LINES.map((line) => {
              const Icon = LINE_ICONS[line.key];
              return (
                <li key={line.key} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--gp-gold-600)]/45 text-[color:var(--gp-gold-600)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <PmServiceCta
                    variant="quiet"
                    className="text-[14px] text-[color:var(--gp-ink)] hover:text-[color:var(--gp-gold-600)]"
                  >
                    {line.label}
                  </PmServiceCta>
                </li>
              );
            })}
          </ul>

          <PmServiceCta className="shrink-0">
            View all management services
          </PmServiceCta>
        </div>
      </GpContainer>
    </GpSection>
  );
}
