import Link from "next/link";
import { ArrowRight, Compass, FileText, HardHat, Handshake, PencilRuler, Sofa } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import { CONSTRUCTION_SERVICES } from "@/lib/premium-v2/services";
import VastuWheelV2 from "./VastuWheelV2";

const ICONS: Record<string, LucideIcon> = {
  "construction-management": HardHat,
  "vastu-consultation": Compass,
  "floor-plan": PencilRuler,
  jda: Handshake,
  "interior-design": Sofa,
  documentation: FileText,
};

/** Soft sector fills, one per compass eighth, in the wheel's drawing order. */


/**
 * The build-and-vastu capabilities, with the room-orientation wheel the
 * client's own site used beside them.
 *
 * The wheel is drawn rather than shipped as an image: it is eight labelled
 * sectors and a compass, which is a handful of arithmetic, and drawing it
 * keeps the labels as real text — selectable, translatable and legible to a
 * screen reader through the table alternative below it.
 */
export default function ConstructionVastuV2({ p }: { p: (path: string) => string }) {
  return (
    <GpSection tone="cream" id="construction">
      <GpContainer>
        <div className="max-w-2xl">
          <span className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]" aria-hidden="true" />
          <GpEyebrow>Build &amp; vastu</GpEyebrow>
          <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
            Construction, collaboration &amp; vastu services.
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
            Complete construction management with Vastu Shastra compliance, floor plan design and
            joint development agreements.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <VastuWheelV2 />

          <div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CONSTRUCTION_SERVICES.map((service) => {
                const Icon = ICONS[service.key] ?? HardHat;
                return (
                  <li
                    key={service.key}
                    className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-200)]/60 p-5"
                  >
                    <Icon className="h-5 w-5 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    <h3 className="font-display mt-3.5 text-[16px] leading-snug text-[color:var(--gp-ink)]">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                      {service.blurb}
                    </p>
                  </li>
                );
              })}
            </ul>

            {/* The wheel is the illustration; this is the working version of
                the same idea, and the reason the section sits under the
                calculators band. */}
            <div className="mt-7 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href={p("/vastu")}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
              >
                Open vastu calculator
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={p("/contact?intent=construction")}
                className="inline-flex min-h-[50px] items-center justify-center rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-forest-900)]/30 px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-forest-900)]"
              >
                Discuss a project
              </Link>
            </div>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
