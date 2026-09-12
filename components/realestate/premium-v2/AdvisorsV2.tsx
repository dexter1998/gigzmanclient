"use client";

import Image from "next/image";
import { Phone } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import WhatsAppIconV2 from "./WhatsAppIconV2";
import type { AdvisorRoster } from "@/lib/premium-v2/advisors";

export default function AdvisorsV2({
  roster,
  phone,
  whatsapp,
}: {
  roster: AdvisorRoster;
  /** Firm line — used for any advisor without a direct number of his own. */
  phone?: string | null;
  whatsapp?: string | null;
}) {
  return (
    <GpSection id="advisors" tone="cream" className="overflow-hidden">
      <GpContainer>
        <GpEyebrow>{roster.eyebrow}</GpEyebrow>
        <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
          {roster.heading}
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[color:var(--gp-muted)]">
          {roster.blurb}
        </p>

        {/* Swipeable below 640px, a plain grid above it. Four advisor cards
            fit a desktop row without scrolling, and a carousel there would
            hide three of them behind an interaction; on a phone the same four
            cards are four full screens of scrolling. `gp-mobile-carousel`
            is the same utility the property rows use, so the gesture is
            consistent down the page. */}
        <div className="gp-mobile-carousel mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {roster.members.map((advisor) => {
            const callNumber = advisor.phone ?? phone;
            const waNumber = advisor.whatsapp ?? advisor.phone ?? whatsapp;
            return (
              <article
                key={advisor.slug}
                className="group relative flex flex-col overflow-hidden rounded-[var(--gp-radius-lg)]"
                style={{
                  background:
                    "radial-gradient(120% 100% at 50% 0%, var(--gp-forest-700) 0%, var(--gp-forest-950) 78%)",
                }}
              >
                {/* Portrait cutout sits directly on the gradient — no white/box background behind it, per client rule. */}
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={advisor.portrait}
                    alt={`${advisor.name}, ${advisor.role}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover object-top"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "var(--gp-gradient-card)" }}
                  />
                </div>

                <div className="relative flex flex-1 flex-col px-5 pb-6 pt-2">
                  <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">{advisor.role}</p>
                  <h3 className="font-display mt-1.5 text-[18px] text-white">{advisor.name}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">
                    {advisor.specialisation}
                  </p>

                  <div className="mt-auto flex items-center gap-3 pt-4">
                    {callNumber ? (
                      <a
                        href={`tel:${callNumber.replace(/\s/g, "")}`}
                        onClick={() => analytics.clickCall("advisor_panel", "home")}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--gp-radius-sm)] border border-white/30 px-3.5 text-[12.5px] font-medium text-white transition-colors hover:border-[color:var(--gp-gold-300)] hover:text-[color:var(--gp-gold-300)]"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        Call
                      </a>
                    ) : null}
                    {waNumber ? (
                      <a
                        href={`https://wa.me/${waNumber.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => analytics.clickWhatsapp("advisor_panel", "home")}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-3.5 text-[12.5px] font-semibold text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
                      >
                        <WhatsAppIconV2 className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </GpContainer>
    </GpSection>
  );
}
