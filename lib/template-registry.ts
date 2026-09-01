import type { VerticalId } from "@/lib/verticals";

export interface TemplateEntry {
  vertical: VerticalId;
  /** Demo tenant slug this card links to — a vertical can carry several templates. */
  slug: string;
  label: string;
  summary: string;
  image: { src: string; alt: string };
  includes: string[];
}

/**
 * What each template covers, for card copy on the root library page and the
 * per-industry pages. Kept separate from `VerticalConfig` because this
 * wording is sales-facing, not app config — and because a vertical can carry
 * several templates (the four real-estate landing-page directions below)
 * while `VerticalConfig` stays one-per-vertical.
 */
export const TEMPLATES: TemplateEntry[] = [
  {
    vertical: "cafirm",
    slug: "arora-k-associates",
    label: "Chartered Accountancy",
    summary:
      "Professional-services site for a CA practice: services, calculators, compliance calendar and a lead-capture CRM.",
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
    slug: "high-properties",
    label: "Premium Inventory / Showcase",
    summary: "Property discovery and showcase — search, curated inventory, corridor market data and comparisons.",
    image: { src: "/verticals/realestate/templates/premium-inventory/images/hero-curated-inventory.webp", alt: "" },
    includes: [
      "Filterable property listings and detail pages",
      "Newly launched, browse-by-intent and corridor discovery",
      "RERA registration status shown on every listing",
      "EMI, stamp duty and rental yield calculators",
      "Dashboard for managing inventory, photos and localities",
    ],
  },
  {
    vertical: "realestate",
    slug: "high-properties-advisory",
    label: "Luxury Advisory",
    summary: "Trust-led broker/advisory experience — shortlist builder, advisor profiles, due diligence and valuation.",
    image: { src: "/verticals/realestate/templates/luxury-advisory/images/hero-luxury-advisory.webp", alt: "" },
    includes: [
      "Buy/sell/lease/invest shortlist builder",
      "Named local advisors with direct booking",
      "Due-diligence checklist and property valuation tool",
      "Recent deals and locality expertise sections",
      "Same dashboard architecture as every other template",
    ],
  },
  {
    vertical: "realestate",
    slug: "high-properties-intelligence",
    label: "Market Intelligence",
    summary: "Data-first research hub — live KPIs, corridor performance, price trends and downloadable reports.",
    image: { src: "/verticals/realestate/templates/market-intelligence/images/hero-market-intelligence.webp", alt: "" },
    includes: [
      "Live market snapshot (avg. price, YoY, rental yield, inventory)",
      "Locality ranking and price-trend chart",
      "Corridor performance and sector comparison",
      "Quarterly market report download",
      "Consultation CTA for investors",
    ],
  },
  {
    vertical: "realestate",
    slug: "high-properties-locality",
    label: "Locality / pSEO",
    summary: "Scalable locality/sector directory — built for programmatic SEO across every Gurugram corridor.",
    image: { src: "/verticals/realestate/templates/locality-pseo/images/hero-locality-discovery.webp", alt: "" },
    includes: [
      "Corridor and sector directory with live data",
      "Property-type navigation and new-launch spotlight",
      "Locality comparison tool",
      "Market guides, news and FAQ",
      "Personalised locality report lead form",
    ],
  },
];
