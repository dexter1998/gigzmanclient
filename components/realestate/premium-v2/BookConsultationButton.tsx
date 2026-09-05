"use client";

import type { ReactNode } from "react";
import { openLeadPopup, type LeadIntentKey } from "./leadPopup";

/**
 * Drop-in replacement for `<Link href={contactHref}>Book Consultation</Link>`
 * — every such CTA site-wide now opens the lead popup instead of navigating
 * to /contact, per client decision. The one exception is FooterV2's own
 * "Contact" link, which still navigates normally (a footer nav list is
 * expected to link somewhere, not pop a dialog).
 */
export default function BookConsultationButton({
  className,
  children,
  intent = "default",
}: {
  className?: string;
  children: ReactNode;
  intent?: LeadIntentKey;
}) {
  return (
    <button type="button" onClick={() => openLeadPopup(intent)} className={className}>
      {children}
    </button>
  );
}
