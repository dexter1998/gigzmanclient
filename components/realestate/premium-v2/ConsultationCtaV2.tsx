"use client";

import type { JSX } from "react";
import Image from "next/image";
import { Phone } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { GpEyebrow } from "./gp-primitives";
import { openLeadPopup } from "./leadPopup";

const IMAGE = "/verticals/realestate/templates/premium-v2/images/hero-luxury-advisory.png";

export default function ConsultationCtaV2({ phone }: { phone?: string | null }): JSX.Element {
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  return (
    <section className="relative flex min-h-[567px] items-center overflow-hidden sm:min-h-[648px]">
      <Image
        src={IMAGE}
        alt="Advisor consultation"
        fill
        sizes="100vw"
        className="object-cover object-[65%_center]"
      />
      {/* One-directional dark scrim — left-to-right so the copy sits on solid
          ground while the photography stays visible on the right. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,46,44,0.92) 0%, rgba(10,46,44,0.66) 45%, rgba(10,46,44,0.15) 100%)",
        }}
      />

      <div className="gp-container relative py-16 sm:py-20">
        <div className="max-w-lg">
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">One Conversation, Clearer Next Steps</GpEyebrow>
          <h2 className="gp-section-title font-display mt-3 text-white">Still deciding where to begin?</h2>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/75">
            Speak with a Gurugram specialist and get a practical next step for buying, selling,
            leasing or investing.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openLeadPopup()}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-7 text-[14px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              Book Consultation
            </button>

            {telHref ? (
              <a
                href={telHref}
                onClick={() => analytics.clickCall("consultation_cta", "home")}
                className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--gp-radius-sm)] border border-white/35 px-7 text-[14px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:border-white"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
