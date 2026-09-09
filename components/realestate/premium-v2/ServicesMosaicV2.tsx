import Link from "next/link";
import { ArrowUpRight, Building2, Factory, FileText, HardHat, Home, Landmark, Sofa, Sprout, Trees, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import type { ServiceLine } from "@/lib/premium-v2/services";

interface ServicesMosaicV2Props {
  p: (path: string) => string;
  /** Which set of service lines this client sells — see serviceLinesFor(). */
  services: ServiceLine[];
}

/**
 * The service lines, as icon cards.
 *
 * This used to be a photo mosaic — nine tiles carrying nothing but a one-word
 * label over stock imagery, which said what the category was called but not
 * what the firm actually does in it. The copy here is the client's own, from
 * their previous site, and each card now carries the sentence that was
 * missing.
 */
const ICONS: Record<string, LucideIcon> = {
  residential: Home,
  farmhouses: Trees,
  farmland: Sprout,
  "weekend-homes": Home,
  "land-papers": FileText,
  "farm-development": HardHat,
  investment: TrendingUp,
  commercial: Building2,
  industrial: Factory,
  construction: HardHat,
  loans: Landmark,
  interiors: Sofa,
};

export default function ServicesMosaicV2({ p, services }: ServicesMosaicV2Props) {
  return (
    <GpSection tone="forest" id="services">
      <GpContainer>
        <div className="max-w-2xl">
          <span className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]" aria-hidden="true" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">What we offer</GpEyebrow>
          <h2 className="gp-section-title font-display mt-3 text-white">
            Complete real-estate solutions under one roof.
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-white/70">
            From buying your dream home to constructing commercial spaces — we handle every step
            with expertise and care.
          </p>
        </div>

        <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = ICONS[service.key] ?? Home;
            // In-page anchors stay as plain anchors: `next/link` would push a
            // history entry for a jump inside the same document.
            const isAnchor = service.href.startsWith("#");
            const href = isAnchor ? service.href : p(service.href);
            const Tag = isAnchor ? "a" : Link;

            return (
              <Tag
                key={service.key}
                href={href}
                className="group flex flex-col rounded-[var(--gp-radius-lg)] border border-white/12 bg-white/[0.04] p-6 transition-colors hover:border-[color:var(--gp-gold-600)]/50 hover:bg-white/[0.07]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gp-gold-600)]/15 text-[color:var(--gp-gold-300)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>

                <h3 className="font-display mt-5 flex items-start justify-between gap-3 text-[19px] leading-snug text-white">
                  {service.title}
                  <ArrowUpRight
                    className="mt-1 h-4 w-4 shrink-0 text-white/35 transition-colors group-hover:text-[color:var(--gp-gold-300)]"
                    aria-hidden="true"
                  />
                </h3>

                <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-white/65">
                  {service.blurb}
                </p>

                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/10 pt-4">
                  {service.tags.map((tag) => (
                    <li
                      key={tag}
                      className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[color:var(--gp-gold-300)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </Tag>
            );
          })}
        </div>
      </GpContainer>
    </GpSection>
  );
}
