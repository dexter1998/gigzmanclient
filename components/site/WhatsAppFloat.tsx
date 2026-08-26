"use client";

import { MessageCircle } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface WhatsAppFloatProps {
  number: string;
  firmName: string;
}

/**
 * Present on the large majority of Indian CA practice sites — clients expect to
 * reach the firm this way, so its absence reads as an incomplete site locally.
 */
export default function WhatsAppFloat({ number, firmName }: WhatsAppFloatProps) {
  const digits = number.replace(/\D/g, "");
  // Indian mobile numbers are commonly published as 10 digits or with a leading 0.
  const international = digits.length === 10 ? `91${digits}` : digits.replace(/^0/, "91");

  const message = encodeURIComponent(
    `Hello ${firmName}, I would like to discuss a requirement.`,
  );

  return (
    <a
      href={`https://wa.me/${international}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.clickWhatsapp("float", "site")}
      aria-label="Message the firm on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(15,39,68,0.24)] transition-transform hover:scale-105 md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
