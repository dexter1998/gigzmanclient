"use client";

import { usePathname } from "next/navigation";
import { PhoneCall } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { openLeadPopup } from "./leadPopup";

/**
 * A standing "request a callback" control.
 *
 * In Indian real estate the callback is the path buyers actually take — they
 * want a person on the phone rather than an email thread — so it gets its own
 * always-available control instead of being reachable only from whichever CTA
 * happens to be on screen. It reports as `call_request_open`, separately from
 * generic enquiries, so its share of leads is visible rather than buried.
 *
 * Sits above the WhatsApp float on desktop and hides on small screens, where
 * MobileActionBarV2 already occupies the bottom of the viewport and a second
 * floating control would cover content.
 */
export default function CallbackFloatV2() {
  const pathname = usePathname();

  const pageType = pathname.includes("/maps/")
    ? "plot_map"
    : pathname.includes("/home-loan")
      ? "home_loan"
      : pathname.includes("/vastu")
        ? "vastu"
        : pathname.includes("/properties")
          ? "properties"
          : "site";

  return (
    <button
      type="button"
      onClick={() => {
        analytics.callRequestOpen("float", pageType);
        openLeadPopup("callback");
      }}
      className="fixed bottom-[104px] right-5 z-40 hidden min-h-[46px] items-center gap-2 rounded-full bg-[color:var(--gp-forest-950)] px-4 text-[13px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(10,46,44,0.55)] transition-colors hover:bg-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-950)] lg:inline-flex"
    >
      <PhoneCall className="h-4 w-4" aria-hidden="true" />
      Request a callback
    </button>
  );
}
