/**
 * What the About page says, per client.
 *
 * Same reasoning as positioning.ts: the template's About page was written for
 * a general Gurugram brokerage — corridors, RERA, branded residences, a
 * developer logo strip. Evergreen sells farm land and weekend houses in the
 * Sohna belt, where a DLF logo is noise and "RERA-verified" is not even the
 * right question (farm land is sold on revenue records, not a RERA number).
 * So the whole page's copy is chosen here and the component only lays it out.
 *
 * Numeric stats marked `listings` / `corridors` are counted from the client's
 * own published content at render time, exactly as the home page's trust row
 * does, so they cannot drift away from what the site is actually showing. A
 * `claim` stat keeps the value stated here — those are assertions about the
 * business that no query can verify.
 */
export type AboutIcon =
  | "Award"
  | "Users"
  | "Signpost"
  | "ShieldCheck"
  | "Trees"
  | "Ruler"
  | "MapPin"
  | "FileCheck";

export interface AboutStat {
  kind: "listings" | "corridors" | "claim";
  /** Only for `claim`. */
  value?: string;
  label: string;
  icon: AboutIcon;
}

export interface LabelledDetail {
  label: string;
  detail: string;
}

export interface AboutCopy {
  heroEyebrow: string;
  /** `{firm}` is substituted with the client's name. */
  heroTitle: string;
  heroBlurb: string;
  heroImage: string;
  primaryCta: string;
  secondaryCta: string;
  stats: AboutStat[];

  storyEyebrow: string;
  storyTitle: string;
  storyLead: string;
  /** Body paragraphs, in order. */
  storyBody: string[];
  storyImage: string;
  storyImageAlt: string;

  principlesEyebrow: string;
  principlesTitle: string;
  principles: LabelledDetail[];

  /**
   * Optional band between the principles and the due-diligence section — the
   * place to explain the location itself. A city brokerage does not need it
   * (buyers already know Golf Course Road); a farm-belt buyer is usually
   * deciding *whether Sohna at all* before deciding which plot.
   */
  belt?: {
    eyebrow: string;
    title: string;
    intro: string;
    items: LabelledDetail[];
  };

  diligenceEyebrow: string;
  diligenceTitle: string;
  diligence: string[];
  diligenceCta: string;
  diligenceImage: string;

  /**
   * The DLF/Emaar/Godrej strip. True for a brokerage that actually resells
   * those developers' inventory; false on a farm-land client, where the
   * logos would claim a relationship that does not exist.
   */
  showDeveloperRibbon: boolean;
}

const IMAGES = "/verticals/realestate/templates/premium-v2/images";
const FARM = "/verticals/realestate/templates/premium-v2/farmhouses";

const DEFAULT_ABOUT: AboutCopy = {
  heroEyebrow: "About {firm}",
  heroTitle: "Local knowledge. Clearer property decisions.",
  heroBlurb:
    "Verified inventory, corridor-level intelligence and dedicated advisors, brought together so every decision in Gurugram real estate is made with clarity.",
  // Not used as a hero anywhere else in Premium V2 (hero-luxury-advisory.png is
  // already the closing-CTA image via ConsultationCtaV2, and
  // hero-curated-inventory.png is already the homepage/mosaic hero) — this
  // variant gets its first use here.
  heroImage: `${IMAGES}/hero-curated-inventory-v2.png`,
  primaryCta: "Meet Our Advisors",
  secondaryCta: "Our Approach",
  stats: [
    { kind: "claim", value: "12+", label: "Years in Gurugram", icon: "Award" },
    { kind: "claim", value: "1,000+", label: "Families Helped", icon: "Users" },
    { kind: "corridors", label: "Corridors Covered", icon: "Signpost" },
    { kind: "listings", label: "Curated Listings", icon: "ShieldCheck" },
  ],

  storyEyebrow: "Our Story",
  storyTitle: "Built around Gurugram, not a generic database.",
  storyLead: "We started with one belief: context matters as much as inventory.",
  storyBody: [
    "{firm} helps buyers, tenants and investors navigate active listings across the Gurugram corridor — with every listing reviewed before it goes live.",
  ],
  // Unused elsewhere in Premium V2 — a Gurugram skyline shot for the "Our
  // Story" band, distinct from the corridor images already spent on the
  // homepage image strip / video testimonials / services mosaic.
  storyImage: `${IMAGES}/corridor-new-gurugram.png`,
  storyImageAlt: "Gurugram skyline",

  principlesEyebrow: "How We Work",
  principlesTitle: "Four principles behind every recommendation",
  principles: [
    {
      label: "Local First",
      detail:
        "Corridor-level knowledge and current on-ground context, not a generic listings feed.",
    },
    {
      label: "Verified",
      detail: "Inventory source and project status checked before anything is shown to you.",
    },
    {
      label: "Unbiased",
      detail: "Options compared before recommendation, with limitations stated clearly.",
    },
    {
      label: "Assisted",
      detail: "One advisor from discovery through site visit and closure — no hand-offs.",
    },
  ],

  diligenceEyebrow: "The Work Behind The Shortlist",
  diligenceTitle: "Due diligence is part of the experience",
  diligence: [
    "RERA and project-status checks",
    "Comparable pricing context",
    "Locality and connectivity review",
    "Document and source verification",
    "Assisted negotiation and site visits",
  ],
  diligenceCta: "See Our Process",
  diligenceImage: `${IMAGES}/due-diligence.webp`,
  showDeveloperRibbon: true,
};

/**
 * Evergreen's page. Everything specific here is either something the client
 * told us (the family, the village, the numbers they answer on) or something
 * counted from the site's own content — no invented awards, no years-in-
 * business figure, no transacted-volume claim.
 */
const EVERGREEN_ABOUT: AboutCopy = {
  heroEyebrow: "About {firm}",
  heroTitle: "The best farmhouses near Delhi NCR — from the family whose village they stand on.",
  heroBlurb:
    "{firm} deals in one thing: farmhouses, farm land and weekend estates in the Sohna belt south of Gurugram. Our office is at The Westin Sohna Resort & Spa in Karnki, and our family has lived in Karnki for generations — so on any plot in this belt we can usually tell you who owned it before the person selling it to you.",
  heroImage: `${IMAGES}/hero-farmhouse-evergreen.webp`,
  primaryCta: "Meet The Family",
  secondaryCta: "How We Work",
  stats: [
    { kind: "listings", label: "Farm houses listed", icon: "Trees" },
    { kind: "corridors", label: "Corridors in the belt", icon: "Signpost" },
    { kind: "claim", value: "Karnki", label: "Our own village", icon: "MapPin" },
    { kind: "claim", value: "1 acre", label: "Typical plot we deal in", icon: "Ruler" },
  ],

  storyEyebrow: "Our Story",
  storyTitle: "One belt, one family, and forty kilometres of Aravali.",
  storyLead:
    "Evergreen is not a brokerage that added farmhouses to a list of services. Farmhouses are the only thing we have ever sold.",
  storyBody: [
    "The Sohna belt begins where Gurugram's last sector ends. Sohna Road drops out of the city, the Aravalis close in on the right, and the land opens into the farm pockets around Karnki, Damdama, Bhondsi, Raiseena and Alipur — an hour from South Delhi, forty minutes from Cyber City, and a different climate from either. It is the closest real countryside to Delhi NCR, and it is where the Khan family has farmed, built and dealt in land for three generations.",
    "Hasan Khan is the sarpanch of Karnki, the village The Westin Sohna Resort & Spa and the Vatika farm estates stand on. That is not a marketing line — it is the reason our due diligence is different. Land in this belt changes hands through revenue records, mutations and family partitions that never appear on a property portal. When a listing looks cheap, there is usually a reason, and the reason is usually in the village, not in the paperwork.",
    "So Evergreen works from both ends. We source plots directly from owners in the belt, often before they are advertised anywhere. And we check every one against what the village already knows: who the co-sharers are, whether the mutation is clean, whether the approach road is actually a road or a claim, and whether the land is banjar, gair-mumkin or genuinely cultivable.",
    "What we sell ranges from a half-acre semi-developed plot near The Westin to fully built 3 and 6 BHK farmhouses on an acre, and up to multi-acre estates against the Aravali ridge. What we will not do is sell you a plot we would not buy ourselves.",
  ],
  storyImage: `${FARM}/09-gurgaon-farmhouse.webp`,
  storyImageAlt: "Farmhouse in the Sohna belt, south of Gurugram",

  principlesEyebrow: "How We Work",
  principlesTitle: "Four things that decide whether a farmhouse deal is a good one",
  principles: [
    {
      label: "Title Before Price",
      detail:
        "Jamabandi, mutation and the chain of ownership come first. A cheap plot with a disputed intkaal is not a cheap plot.",
    },
    {
      label: "Owner-Direct",
      detail:
        "Most of what we list comes from owners in the belt we already know, so there is one commission in the deal rather than a chain of four.",
    },
    {
      label: "Seen In Person",
      detail:
        "Every plot is walked before it is listed — approach road, boundary, water, power line distance and what is actually built next door.",
    },
    {
      label: "One Family, Start To Finish",
      detail:
        "The person who shows you the land is the person who sits with you at the Tehsil. No hand-offs, no junior sent in later.",
    },
  ],

  belt: {
    eyebrow: "Why The Sohna Belt",
    title: "The closest real countryside to Delhi NCR",
    intro:
      "People buy here for four reasons, and it is worth being honest about which one applies to you — they lead to very different plots.",
    items: [
      {
        label: "Weekend use",
        detail:
          "Roughly an hour from South Delhi and forty minutes from Cyber City on the Sohna elevated road, so it is genuinely usable on a Saturday rather than once a season. Half-acre to one-acre plots, usually built.",
      },
      {
        label: "Second home",
        detail:
          "The Aravali edge around Damdama, Raiseena and Alipur runs several degrees cooler than the city and keeps its tree cover. This is where the larger built farmhouses sit.",
      },
      {
        label: "Land holding",
        detail:
          "Bare agricultural land held for appreciation, driven by the Delhi–Mumbai Expressway interchange, the Sohna elevated corridor and the KMP. Cheaper per sq ft, longer horizon, more paperwork to get right.",
      },
      {
        label: "Events and rentals",
        detail:
          "Built farmhouses in the belt let for shoots, functions and stays. Yield depends almost entirely on approach road and distance from the Westin cluster, so the plot choice matters more than the construction.",
      },
    ],
  },

  diligenceEyebrow: "Before You Pay Anything",
  diligenceTitle: "What we check on every farm-land purchase",
  diligence: [
    "Jamabandi and the ownership chain, read at the Tehsil — not a photocopy the seller supplies",
    "Mutation (intkaal) status, and whether every co-sharer has actually consented",
    "Land classification: cultivable, banjar or gair-mumkin, and what that permits you to build",
    "Approach road — recorded rasta versus an informal track across someone else's field",
    "Registered right of way, boundary demarcation and the actual measured area against the record",
    "Litigation, mortgage, acquisition notice and HSVP/NHAI alignment checks on the khasra number",
    "Circle rate versus asking price, and the stamp duty and registry cost you will actually pay",
  ],
  diligenceCta: "Talk To Us About A Plot",
  diligenceImage: `${FARM}/20-gurgaon-farmhouse.webp`,
  // No developer logos: this client sells farm land from private owners, and
  // a DLF/Emaar strip would claim a relationship that does not exist.
  showDeveloperRibbon: false,
};

const BY_CLIENT: Record<string, AboutCopy> = {
  "evergreen-real-estate": EVERGREEN_ABOUT,
};

/** Resolves the client's About copy with `{firm}` substituted throughout. */
export function aboutCopyFor(clientSlug: string | undefined | null, firmName: string): AboutCopy {
  const copy = (clientSlug && BY_CLIENT[clientSlug]) || DEFAULT_ABOUT;
  const fill = (s: string) => s.replaceAll("{firm}", firmName);
  return {
    ...copy,
    heroEyebrow: fill(copy.heroEyebrow),
    heroTitle: fill(copy.heroTitle),
    heroBlurb: fill(copy.heroBlurb),
    storyLead: fill(copy.storyLead),
    storyBody: copy.storyBody.map(fill),
  };
}
