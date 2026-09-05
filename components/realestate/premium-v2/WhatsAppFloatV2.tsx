"use client";

import { analytics } from "@/lib/analytics";
import WhatsAppIconV2 from "./WhatsAppIconV2";

/**
 * Premium V2's own float — the shared components/site/WhatsAppFloat.tsx stays
 * untouched for the CA vertical. Hidden below `sm` because MobileActionBarV2
 * already carries a WhatsApp action there, and two overlapping WhatsApp
 * affordances in the same corner is just clutter.
 */
export default function WhatsAppFloatV2({
  number,
  firmName,
}: {
  number: string;
  firmName: string;
}) {
  const digits = number.replace(/\D/g, "");
  const international = digits.length === 10 ? `91${digits}` : digits.replace(/^0/, "91");
  const message = encodeURIComponent(`Hello ${firmName}, I would like to discuss a requirement.`);

  return (
    <a
      href={`https://wa.me/${international}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.clickWhatsapp("float", "site")}
      className="fixed bottom-6 right-6 z-30 hidden min-h-[48px] items-center gap-2.5 rounded-full bg-[#25D366] px-5 text-[13.5px] font-semibold text-white shadow-[0_6px_20px_rgba(10,46,44,0.28)] transition-transform hover:scale-[1.04] sm:inline-flex"
    >
      <WhatsAppIconV2 className="h-5 w-5" />
      WhatsApp Now
    </a>
  );
}
