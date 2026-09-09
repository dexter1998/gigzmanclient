"use client";

import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { openLeadPopup } from "../leadPopup";
import { GpContainer } from "../gp-primitives";

/**
 * Mid-page CTA on a plot-map page.
 *
 * A map page has a long dwell time and a natural question at the end of it —
 * "is this plot available, and what does it cost" — but the only prompt used
 * to be the closing section, past the FAQ. This sits directly after the map,
 * where the intent actually forms.
 *
 * Deliberately a band rather than a full section: it interrupts the page
 * without taking a screen of its own on mobile.
 */
export default function MapCtaBandV2({
  areaName,
  propertiesHref,
}: {
  areaName: string;
  propertiesHref: string;
}) {
  return (
    <section className="bg-[color:var(--gp-forest-950)]">
      <GpContainer className="py-8 sm:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-[16px] leading-snug text-white sm:text-[18px]">
              Found a plot in {areaName}?
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-white/70">
              Give us the block and plot number and an advisor will come back with availability and
              the recent transacted range for that pocket.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                analytics.callRequestOpen("map_cta_band", "plot_map");
                openLeadPopup("map");
              }}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13px] font-bold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              Request a callback
            </button>
            <Link
              href={propertiesHref}
              onClick={() => analytics.ctaClick("map_band_listings", "plot_map", "mid_page")}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] border border-white/25 px-6 text-[13px] font-semibold uppercase tracking-[0.05em] text-white transition-colors hover:border-[color:var(--gp-gold-300)] hover:text-[color:var(--gp-gold-300)]"
            >
              Browse listings
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </GpContainer>
    </section>
  );
}
