/**
 * Sectors the practice accepts engagements in.
 *
 * Framed as areas of experience rather than specialisation claims — the ICAI
 * guidelines permit publishing the nature of assignments handled, but not
 * comparative or self-laudatory positioning.
 */

export interface Industry {
  slug: string;
  name: string;
  icon: string;
  summary: string;
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "startups",
    name: "Startups & Entrepreneurs",
    icon: "Rocket",
    summary: "Incorporation, founder taxation and the compliance cycle that follows funding.",
  },
  {
    slug: "ecommerce-retail",
    name: "E-commerce & Retail",
    icon: "ShoppingCart",
    summary: "Marketplace reconciliation, GST on inter-state supply and TCS credit.",
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    icon: "Factory",
    summary: "Input credit on capital goods, cost records and statutory audit.",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "Building2",
    summary: "Project accounting, capital gains on transfer and TDS on property.",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    icon: "HeartPulse",
    summary: "Professional receipts, exempt supply treatment and practice accounting.",
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    icon: "Briefcase",
    summary: "Presumptive taxation, service exports and partner remuneration.",
  },
  {
    slug: "education",
    name: "Education",
    icon: "GraduationCap",
    summary: "Trust and society compliance, exemption conditions and annual filings.",
  },
  {
    slug: "it-saas",
    name: "IT & SaaS",
    icon: "Cpu",
    summary: "Export of services, FEMA reporting and ESOP taxation.",
  },
];
