"use client";

import { Phone } from "lucide-react";
import { analytics } from "@/lib/analytics";

/**
 * A plain <a> with an onClick handler requires its containing file to be
 * "use client" — split out as its own tiny component so the rest of the
 * detail page (data fetching, JSON-LD-adjacent markup) stays a Server
 * Component.
 */
export default function PremiumV2CallLink({ telHref, phone }: { telHref: string; phone: string }) {
  return (
    <a
      href={telHref}
      onClick={() => analytics.clickCall("enquiry_panel", "property_detail")}
      className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-forest-900)] px-4 text-[13px] font-semibold uppercase tracking-[0.03em] text-[color:var(--gp-forest-900)] transition-colors hover:bg-[color:var(--gp-forest-900)] hover:text-white"
    >
      <Phone className="h-4 w-4" aria-hidden="true" />
      {phone}
    </a>
  );
}
