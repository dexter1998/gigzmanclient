"use client";

import { openLeadPopup } from "./leadPopup";
import { analytics } from "@/lib/analytics";

/**
 * The secondary action on a listing card.
 *
 * Split into its own client component so the card itself stays a Server
 * Component — the cards render in grids hundreds long, and shipping the whole
 * card to the client to get one button would send the formatting helpers and
 * every listing's props down with it.
 */
export default function PropertyEnquireButton({
  propertyId,
  propertyType,
  className,
}: {
  propertyId: string;
  propertyType: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        // The card's title and image are links; this sits inside the same
        // card but must not follow them.
        event.preventDefault();
        event.stopPropagation();
        analytics.viewProperty(propertyId, propertyType);
        openLeadPopup("property");
      }}
      className={className}
    >
      Enquire
    </button>
  );
}
