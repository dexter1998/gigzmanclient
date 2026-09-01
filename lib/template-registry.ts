import type { VerticalId } from "@/lib/verticals";

export interface TemplateEntry {
  vertical: VerticalId;
  image: { src: string; alt: string };
  includes: string[];
}

/**
 * What each template covers, for card copy on the root library page and the
 * per-industry pages. Kept separate from `VerticalConfig` because this
 * wording is sales-facing, not app config — and because a vertical can
 * eventually carry more than one template here (temp1, temp2, ...) while
 * `VerticalConfig` stays one-per-vertical.
 */
export const TEMPLATES: TemplateEntry[] = [
  {
    vertical: "cafirm",
    image: { src: "/3d/dashboard.png", alt: "" },
    includes: [
      "Services, knowledge centre and FAQ pages",
      "ICAI-compliant footer and no-solicitation notice",
      "Income tax, TDS and GST calculators",
      "Compliance calendar with a live countdown",
      "Lead-capture query form feeding a lightweight CRM dashboard",
    ],
  },
  {
    vertical: "realestate",
    image: { src: "/verticals/realestate/photos/hero-inventory.webp", alt: "" },
    includes: [
      "Filterable property listings and detail pages",
      "Locality market pages (price/sq.ft, YoY change, rental yield)",
      "RERA registration status shown on every listing",
      "EMI, stamp duty and rental yield calculators",
      "Dashboard for managing inventory, photos and localities",
    ],
  },
];
