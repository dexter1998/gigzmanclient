"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";
import WhatsAppIconV2 from "./WhatsAppIconV2";
import type { AdvisorRoster } from "@/lib/premium-v2/advisors";

/**
 * The same roster as the homepage's AdvisorsV2 — no new names invented here.
 * How many of them this denser secondary panel shows is the roster's own
 * `compactCount`: the stock four-person roster drops its last card (the
 * homepage section is the full list, and "Meet all advisors" links there),
 * while a small family firm shows everyone.
 */
export default function ContactAdvisorsCompactV2({
  roster,
  phone,
  whatsapp,
  advisorsHref,
}: {
  roster: AdvisorRoster;
  /** Firm line — used for any advisor without a direct number of his own. */
  phone?: string | null;
  whatsapp?: string | null;
  advisorsHref: string;
}) {
  const shown = roster.members.slice(0, roster.compactCount);

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <GpEyebrow>Prefer a Specialist?</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Contact a Local Advisor
            </h2>
          </div>
          {shown.length < roster.members.length ? (
            <Link
              href={advisorsHref}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
            >
              Meet all advisors
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>

        <div
          className={`mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 ${
            shown.length >= 4 ? "lg:grid-cols-4" : "sm:grid-cols-3"
          }`}
        >
          {shown.map((advisor) => {
            const callNumber = advisor.phone ?? phone;
            const waNumber = advisor.whatsapp ?? advisor.phone ?? whatsapp;
            return (
              <article
                key={advisor.slug}
                className="group relative flex flex-col overflow-hidden rounded-[var(--gp-radius-md)]"
                style={{
                  background:
                    "radial-gradient(120% 100% at 50% 0%, var(--gp-forest-700) 0%, var(--gp-forest-950) 78%)",
                }}
              >
                {/* Same transparent-cutout-on-gradient treatment as AdvisorsV2 —
                    no white/box background — just a shorter portrait crop to
                    keep this panel denser than the homepage version. */}
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={advisor.portrait}
                    alt={`${advisor.name}, ${advisor.role}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover object-top"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "var(--gp-gradient-card)" }}
                  />
                </div>

                <div className="relative flex flex-1 flex-col px-4 pb-4 pt-2">
                  <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">{advisor.role}</p>
                  <h3 className="font-display mt-1 text-[15px] text-white">{advisor.name}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/65">
                    {advisor.specialisation}
                  </p>

                  <div className="mt-auto flex items-center gap-2.5 pt-3">
                    {callNumber ? (
                      <a
                        href={`tel:${callNumber.replace(/\s/g, "")}`}
                        onClick={() => analytics.clickCall("advisor_panel", "contact")}
                        className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[var(--gp-radius-sm)] border border-white/30 px-3 text-[12px] font-medium text-white transition-colors hover:border-[color:var(--gp-gold-300)] hover:text-[color:var(--gp-gold-300)]"
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
                        onClick={() => analytics.clickWhatsapp("advisor_panel", "contact")}
                        className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-3 text-[12px] font-semibold text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
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
