"use client";

import { analytics } from "@/lib/analytics";
import WhatsAppIconV2 from "./WhatsAppIconV2";

export default function PremiumV2WhatsappLink({
  whatsappHref,
  propertyId,
}: {
  whatsappHref: string;
  propertyId: string;
}) {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        analytics.clickWhatsapp("enquiry_panel", "property_detail");
        analytics.siteVisitRequest(propertyId);
      }}
      className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-4 text-[13px] font-semibold uppercase tracking-[0.03em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
    >
      <WhatsAppIconV2 className="h-4 w-4" />
      WhatsApp
    </a>
  );
}
