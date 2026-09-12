/**
 * Who the advisor cards show, per client.
 *
 * The template ships a stock roster of four Gurugram corridor specialists —
 * invented people on stock portraits, fine for a demo and wrong the moment a
 * real client is behind the site. Evergreen is a family firm: the four people
 * on its cards are the four people who actually answer the phone, each on his
 * own number rather than the single firm line, so a buyer reaches the person
 * whose face he clicked.
 *
 * Slug-keyed for the same reason as positioning.ts and imagery.ts: "who are
 * this client's advisors" is a fact about the client, and a map keeps it out
 * of the components, which are shared with every other premium-v2 tenant.
 *
 * The label above each name is `role` rather than a fixed "corridor" heading —
 * a city brokerage divides its people by corridor, a family firm divides them
 * by who does what. Both render in the same slot.
 */
export interface Advisor {
  slug: string;
  name: string;
  /** Eyebrow above the name: a corridor for the stock roster, a role at Evergreen. */
  role: string;
  specialisation: string;
  portrait: string;
  /** Direct line for this person. Falls back to the firm's number when absent. */
  phone?: string;
  /** Direct WhatsApp. Falls back to `phone`, then to the firm's WhatsApp. */
  whatsapp?: string;
}

export interface AdvisorRoster {
  eyebrow: string;
  heading: string;
  blurb: string;
  members: Advisor[];
  /**
   * How many the contact page's compact panel shows. The stock roster drops
   * its fourth card there (that panel is a denser secondary strip, not the
   * full list); Evergreen shows all four, because leaving one brother off the
   * family's own contact page is not a layout decision anyone would defend.
   */
  compactCount: number;
}

const PEOPLE = "/verticals/realestate/templates/premium-v2/people";

const DEFAULT_ROSTER: AdvisorRoster = {
  eyebrow: "Meet Your Advisors",
  heading: "Local Expertise, By Corridor",
  blurb:
    "Every corridor in Gurugram moves differently. Our advisors specialise deeply rather than broadly, so the person you speak to already knows the street.",
  compactCount: 3,
  members: [
    {
      slug: "arjun-mehta",
      name: "Arjun Mehta",
      role: "Golf Course Road",
      specialisation: "Luxury high-rises and branded residences",
      portrait: `${PEOPLE}/advisor-arjun-mehta.png`,
    },
    {
      slug: "isha-kapoor",
      name: "Isha Kapoor",
      role: "Dwarka Expressway",
      specialisation: "New launches and pre-RERA opportunities",
      portrait: `${PEOPLE}/advisor-isha-kapoor.png`,
    },
    {
      slug: "neha-rao",
      name: "Neha Rao",
      role: "Sohna Road",
      specialisation: "Independent villas and low-rise living",
      portrait: `${PEOPLE}/advisor-neha-rao.png`,
    },
    {
      slug: "rahul-sen",
      name: "Rahul Sen",
      role: "Commercial Corridors",
      specialisation: "Commercial assets and rental-yield portfolios",
      portrait: `${PEOPLE}/advisor-rahul-sen.png`,
    },
  ],
};

/**
 * Names, roles and numbers as the client gave them. Hasan Khan is the sarpanch
 * of Karnki, the village the Westin farm belt sits in — on a land purchase
 * that is the single most useful fact on the page, so it leads his card rather
 * than sitting in a bio further down.
 *
 * Portraits are the client's own photographs, keyed off their green backdrop
 * by scripts/cutout-portraits.mjs.
 */
const EVERGREEN_ROSTER: AdvisorRoster = {
  eyebrow: "The People Behind Evergreen",
  heading: "One Family. One Village. Every Deal.",
  blurb:
    "Evergreen is run by the Khan family of Karnki, the village the Westin farm belt stands on. Whoever you call is an owner, not a call-centre — and the same person stays with you from the first site visit to the day the deed is registered.",
  compactCount: 4,
  members: [
    {
      slug: "hasan-khan",
      name: "Hasan Khan",
      role: "Sarpanch, Karnki · Founder",
      specialisation:
        "Land titles, revenue records and village-level history. He has usually known a plot’s owners for two generations.",
      portrait: `${PEOPLE}/evergreen-hasan-khan.webp`,
      phone: "+91 98121 95544",
    },
    {
      slug: "aasif-khan",
      name: "Aasif Khan",
      role: "Acquisitions & Land",
      specialisation:
        "Sourcing farm land and semi-developed plots around The Westin, Vatika Farms and the Karnki belt, and negotiating the price before it reaches a portal.",
      portrait: `${PEOPLE}/evergreen-aasif-khan.webp`,
      phone: "+91 90505 85544",
    },
    {
      slug: "munasif-khan",
      name: "Munasif Khan",
      role: "Documentation & Registry",
      specialisation:
        "Mutation, intkaal, registry and the Tehsil paperwork — the part of a farmhouse purchase that decides whether the land is actually yours.",
      portrait: `${PEOPLE}/evergreen-munasif-khan.webp`,
      phone: "+91 96711 95544",
    },
    {
      slug: "aakil-khan",
      name: "Aakil Khan",
      role: "Sales & Site Visits",
      specialisation:
        "Weekend site visits, plot-to-plot comparisons and matching a budget to the right pocket of the belt — Sohna, Karnki, Damdama or the Aravali edge.",
      portrait: `${PEOPLE}/evergreen-aakil-khan.webp`,
      phone: "+91 80536 13395",
    },
  ],
};

const BY_CLIENT: Record<string, AdvisorRoster> = {
  "evergreen-real-estate": EVERGREEN_ROSTER,
};

export function advisorRosterFor(clientSlug: string | undefined | null): AdvisorRoster {
  return (clientSlug && BY_CLIENT[clientSlug]) || DEFAULT_ROSTER;
}
