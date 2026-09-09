/**
 * What the home page's hero says, per client.
 *
 * The template was written for a general Gurugram agency, so its hero copy
 * ("Curated Addresses. Considered Living.", RERA-verified listings, families
 * placed) assumes apartments and a resale brokerage. Evergreen sells farm
 * houses and land in the Sohna belt, where none of that is the pitch — so the
 * headline, the supporting line and the labels on the trust row are chosen
 * here rather than hardcoded in the component.
 *
 * The trust row's *values* are not in this file: they are counted from the
 * client's own inventory at render time, so they cannot drift away from what
 * the site is actually showing.
 */
export type StatKind = "listings" | "corridors" | "medianPlot" | "medianPrice" | "claim";

export interface HeroStat {
  kind: StatKind;
  label: string;
  /** Only for `claim` — a figure the client asserts, not one we can count. */
  value?: string;
  icon: "Award" | "Users" | "Signpost" | "ShieldCheck" | "Trees" | "Ruler" | "IndianRupee";
}

/**
 * `blurb` is a template with a `{firm}` placeholder rather than a function:
 * the resolved copy is handed to HeroV2, which is a Client Component, and a
 * function cannot cross that boundary ("Functions cannot be passed directly
 * to Client Components").
 */
export interface HeroCopy {
  eyebrow: string;
  headline: [string, string];
  blurb: string;
  searchPlaceholder: string;
  stats: HeroStat[];
}

const DEFAULT: HeroCopy = {
  eyebrow: "Gurugram Real Estate, Reimagined",
  headline: ["Curated Addresses.", "Considered Living."],
  blurb:
    "{firm} brings verified inventory, corridor-level intelligence and dedicated advisors together, so every decision in Gurugram real estate is made with clarity.",
  searchPlaceholder: "Your mobile number",
  stats: [
    { kind: "claim", value: "12+", label: "Years Local Expertise", icon: "Award" },
    { kind: "claim", value: "500+", label: "Families Placed", icon: "Users" },
    { kind: "corridors", label: "Corridors Tracked", icon: "Signpost" },
    { kind: "claim", value: "100%", label: "RERA-Verified Listings", icon: "ShieldCheck" },
  ],
};

const FARMHOUSE: HeroCopy = {
  eyebrow: "Sohna & the Gurugram farm belt",
  headline: ["Land of your own,", "an hour from the city."],
  blurb:
    "{firm} works only on farm houses, weekend estates and agricultural land along the Sohna–Gurugram corridor — with plot sizes, ownership and asking prices set out plainly on every listing.",
  searchPlaceholder: "Your mobile number",
  stats: [
    { kind: "listings", label: "Farm houses listed", icon: "Trees" },
    { kind: "corridors", label: "Corridors covered", icon: "Signpost" },
    { kind: "medianPlot", label: "Median plot size", icon: "Ruler" },
    { kind: "medianPrice", label: "Median asking price", icon: "IndianRupee" },
  ],
};

const BY_CLIENT: Record<string, HeroCopy> = {
  "evergreen-real-estate": FARMHOUSE,
};

export function heroCopyFor(clientSlug: string | undefined | null, firmName: string): HeroCopy {
  const copy = (clientSlug && BY_CLIENT[clientSlug]) || DEFAULT;
  return { ...copy, blurb: copy.blurb.replace("{firm}", firmName) };
}
