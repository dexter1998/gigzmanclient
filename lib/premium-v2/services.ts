/**
 * Service, construction and documentation copy.
 *
 * Lifted from the client's previous site (the Hostinger build) so the wording
 * is theirs rather than re-invented — only the layout changes. Kept here so
 * the sections stay presentational and the copy is editable in one place.
 */

export interface ServiceLine {
  key: string;
  title: string;
  blurb: string;
  /** Short capability tags, shown as text under the blurb. */
  tags: string[];
  /** Where the card leads; relative to the tenant base path. */
  href: string;
}

const GENERAL_SERVICE_LINES: ServiceLine[] = [
  {
    key: "residential",
    title: "Residential Properties",
    blurb:
      "Flats, villas, builder floors and independent houses across all sectors of Gurugram and Delhi NCR. Find your perfect home.",
    tags: ["Buy", "Sell", "Rent"],
    href: "/properties?purpose=buy",
  },
  {
    key: "commercial",
    title: "Commercial Spaces",
    blurb:
      "Office spaces, retail shops, showrooms and commercial complexes. Prime locations on Dwarka Expressway and Golf Course Road.",
    tags: ["Lease", "Buy", "Sell"],
    href: "/properties?type=commercial",
  },
  {
    key: "industrial",
    title: "Industrial Properties",
    blurb:
      "Warehouses, factories, industrial plots and logistics parks. Strategically located across NCR industrial corridors.",
    tags: ["Lease", "Sale"],
    href: "/properties?type=industrial",
  },
  {
    key: "construction",
    title: "Construction & Collaboration",
    blurb:
      "End-to-end construction services, land collaboration deals and joint development agreements with Vastu compliance.",
    tags: ["Build", "JDA", "Vastu"],
    href: "#construction",
  },
  {
    key: "agriculture",
    title: "Agricultural Properties",
    blurb:
      "Farmland, orchards and agricultural plots across the Sohna and Manesar belts, with land-use status and mutation checked before you commit.",
    tags: ["Buy", "Sell", "Land use"],
    href: "/properties?type=agriculture",
  },
  // Loans and documentation were one card. They are different engagements —
  // one is a bank tie-up and an EMI, the other is registry, mutation and NOC
  // work people come to us for on its own — and a single card sent both to
  // the EMI calculator.
  {
    key: "loans",
    title: "Home Loans",
    blurb:
      "EMI calculations and loan tie-ups with SBI, HDFC, ICICI, Axis and 10+ banks, including balance transfer and top-up.",
    tags: ["Loans", "EMI", "Balance transfer"],
    href: "/home-loan",
  },
  {
    key: "documentation",
    title: "Documentation",
    blurb:
      "Registry, mutation, NOC, khata transfer and every other paper a Gurugram sale turns on — handled end to end.",
    tags: ["Registry", "Mutation", "NOC"],
    href: "/documentation",
  },
  // Split for the same reason: a Vastu consultation is booked without any
  // interior work, and interior clients do not all want Vastu.
  {
    key: "interiors",
    title: "Interior Design",
    blurb:
      "Turnkey interiors for homes and offices — layouts, material selection, execution and handover.",
    tags: ["Interior", "Turnkey", "Plans"],
    href: "#construction",
  },
  {
    key: "vastu",
    title: "Vastu Consultation",
    blurb:
      "Direction, room placement and plot-level Vastu guidance, read against the actual floor plan rather than a generic chart.",
    tags: ["Vastu", "Floor plan", "Plot"],
    href: "/vastu",
  },
];

/**
 * Evergreen sells farm houses and land in the Sohna belt, so none of the
 * general lines above describe what they actually do — no industrial sheds,
 * no SCO retail, and the paperwork that matters is mutation and fard rather
 * than society NOCs.
 */
const FARMHOUSE_SERVICE_LINES: ServiceLine[] = [
  // Ordered by what an owner or buyer actually wants done — buy, sell, lease,
  // manage — rather than by category of asset. Two cards that both said
  // "farmland, different words" have become one, and letting and upkeep,
  // which this client does and had no card for, are named.
  {
    key: "buy",
    title: "Buy a Farmhouse",
    blurb:
      "Built estates with lawns, orchards and guest blocks, and farm plots along the Sohna corridor and the Delhi–Mumbai Expressway. Land use, access and khasra checked before we list anything.",
    tags: ["Farmhouses", "Farmland", "Plots"],
    href: "/properties?type=farmhouse",
  },
  {
    key: "sell",
    title: "Sell Your Farmhouse",
    blurb:
      "We price against what has actually transacted on your stretch this year, photograph the property properly, and bring buyers who have already seen the papers.",
    tags: ["Valuation", "Listing", "Buyers"],
    href: "/contact?intent=valuation",
  },
  {
    key: "lease",
    title: "Lease & Events",
    blurb:
      "Monthly lets to families and companies, and day rentals for weddings, shoots and offsites — the two ways a Gurugram farmhouse earns when it is not lived in.",
    tags: ["Rent", "Weddings", "Shoots"],
    href: "/properties?purpose=rent",
  },
  {
    key: "manage",
    title: "Farm Management",
    blurb:
      "Caretakers, security, gardening, borewell and pump upkeep, and rent collection — for owners who visit on weekends and need the place run the rest of the week.",
    tags: ["Caretaker", "Upkeep", "Rent"],
    href: "/contact",
  },
  {
    key: "land-papers",
    title: "Land Documentation",
    blurb:
      "Mutation, jamabandi and fard, registry and change of land use — the paperwork farmland turns on, handled end to end.",
    tags: ["Mutation", "Fard", "CLU"],
    href: "/documentation",
  },
  {
    key: "farm-development",
    title: "Farm Development",
    blurb:
      "Boundary walls, borewells, landscaping and farmhouse construction, taken from an empty plot to a usable estate.",
    tags: ["Build", "Borewell", "Landscape"],
    href: "/#construction",
  },
];

const SERVICE_LINES_BY_CLIENT: Record<string, ServiceLine[]> = {
  "evergreen-real-estate": FARMHOUSE_SERVICE_LINES,
};

export function serviceLinesFor(clientSlug: string | undefined | null): ServiceLine[] {
  return (clientSlug && SERVICE_LINES_BY_CLIENT[clientSlug]) || GENERAL_SERVICE_LINES;
}

/** The six build-and-vastu capabilities, from the same source. */
export const CONSTRUCTION_SERVICES = [
  {
    key: "construction-management",
    title: "Construction Management",
    blurb: "End-to-end project management from foundation to finishing.",
  },
  {
    key: "vastu-consultation",
    title: "Vastu Consultation",
    blurb: "Expert Vastu Shastra analysis for all room orientations and layouts.",
  },
  {
    key: "floor-plan",
    title: "Floor Plan Design",
    blurb: "Floor plan, building map and flat plan design with 3D views.",
  },
  {
    key: "jda",
    title: "JDA / Collaboration",
    blurb: "Joint Development Agreements and land collaboration deals.",
  },
  {
    key: "interior-design",
    title: "Interior Design",
    blurb: "Complete home and office interior design services across NCR.",
  },
  {
    key: "documentation",
    title: "A–Z Documentation",
    blurb: "Sale deed, registry, power of attorney, NOC and all paperwork handled.",
  },
] as const;

/** The eight compass sectors on the vastu wheel, in drawing order from east. */
export const VASTU_WHEEL = [
  {
    label: "Living",
    direction: "E",
    note: "The east face takes the morning sun, so the room the household and its guests use most is placed here. Keep the north-east corner of it open rather than built into storage.",
  },
  {
    label: "Kitchen",
    direction: "SE",
    note: "The south-east is the fire corner (agni). The cooking platform faces east, and the sink is kept away from the hob so water and fire are not adjacent.",
  },
  {
    label: "Store",
    direction: "S",
    note: "Heavy storage sits south because weight belongs on the south and west sides — the same reason staircases and thick walls are placed here rather than north.",
  },
  {
    label: "Bath",
    direction: "SW",
    note: "Toilets go south-west or west, never north-east. Drainage is kept flowing away from the north-east, which is the corner the plan tries to leave light and open.",
  },
  {
    label: "Sleep",
    direction: "W",
    note: "West suits children's and guest bedrooms. The head of the bed points south or east; a bed under a beam or facing a mirror is what gets flagged on most site visits.",
  },
  {
    label: "Entry",
    direction: "NW",
    note: "North-west takes movement — the main door, a guest room or the garage. It is the direction associated with air, so it is kept ventilated rather than sealed.",
  },
  {
    label: "Puja",
    direction: "N",
    note: "The prayer space faces north or north-east, at ground level and not against a bathroom wall. North is also where the plot is kept lower and lighter than the south.",
  },
  {
    label: "Master",
    direction: "NE",
    note: "The north-east (ishaan) is the most auspicious corner — kept open, uncluttered and lightly built. Water features and the main light source belong here.",
  },
] as const;

export interface DocumentationGroup {
  step: string;
  title: string;
  /** Anchor on /documentation the landing card's "View details" jumps to. */
  slug: string;
  /**
   * One line saying what this stage actually is. The landing cards used to
   * print all six document names, which read as a list to skim past rather
   * than a service to enquire about — the names live on the detail page now.
   */
  summary: string;
  /** What we do at this stage, for the detail page. */
  detail: string;
  items: string[];
}

/**
 * The A-to-Z documentation set, verbatim from the client's own list. These are
 * the papers they say they handle; nothing has been added to the list here.
 */
export const DOCUMENTATION_GROUPS: DocumentationGroup[] = [
  {
    step: "01",
    title: "Property Buying Docs",
    slug: "property-buying",
    summary:
      "Everything that has to exist before money moves — and proof that it does.",
    detail:
      "Before a rupee changes hands we read the chain of title back through every previous owner, pull the encumbrance certificate ourselves rather than accepting a copy, and confirm the society or builder has no dues standing against the unit. Most disputes we are called into later started as a gap at this stage that nobody checked.",
    items: [
      "Sale Agreement / Sale Deed",
      "Title Verification Report",
      "Encumbrance Certificate",
      "NOC from Society / Builder",
      "Possession Letter",
      "Allotment Letter",
    ],
  },
  {
    step: "02",
    title: "Registry & Mutation",
    slug: "registry-mutation",
    summary:
      "The transfer itself, from stamp duty to your name in the revenue record.",
    detail:
      "Registration is only half of it. A sale is not finished until mutation is recorded and the khata sits in your name, and in Gurugram that is a separate application to a separate office with its own queue. We calculate the stamp duty, book the sub-registrar slot, attend the appointment with you, and then follow the mutation through until the updated jamabandi comes back.",
    items: [
      "Sub-Registrar Registration",
      "Stamp Duty Payment",
      "Mutation Application",
      "Khata Transfer",
      "Record of Rights (RoR)",
      "Jamabandi / Fard",
    ],
  },
  {
    step: "03",
    title: "Home Loan Docs",
    slug: "home-loan",
    summary:
      "The paperwork the bank needs, prepared once instead of five times.",
    detail:
      "Every lender asks for the same file in a slightly different order, which is why applications stall. We assemble the income, KYC and property set once, get the valuation and legal opinion moving in parallel rather than in sequence, and coordinate disbursement with the registry date so the draft is ready on the day.",
    items: [
      "Income & Bank Statements",
      "Property Valuation Report",
      "Loan Application & KYC",
      "Legal Opinion Letter",
      "Disbursement Coordination",
      "Balance Transfer Docs",
    ],
  },
  {
    step: "04",
    title: "Legal Documents",
    slug: "legal",
    summary:
      "Deeds and instruments for the cases a plain sale does not cover.",
    detail:
      "Inheritance, a division between siblings, a gift within the family, a sale conducted on someone's behalf — each needs its own instrument, correctly drafted and correctly executed. We draft, notarise and register these, and tell you plainly when a power of attorney is not the shortcut it is being sold as.",
    items: [
      "Power of Attorney (PoA)",
      "Will / Relinquishment Deed",
      "Gift Deed",
      "Partition Deed",
      "Affidavits & Notarization",
      "Succession Certificate",
    ],
  },
  {
    step: "05",
    title: "Construction Docs",
    slug: "construction",
    summary:
      "Approvals and certificates, from sanctioned plan to occupancy.",
    detail:
      "A building without an occupancy certificate is difficult to sell, refinance or insure, and the gap usually traces back to a deviation from the sanctioned plan. We handle plan approval, RERA registration, structural safety and the completion and occupancy certificates, and flag deviations while they are still cheap to correct.",
    items: [
      "Building Plan Approval",
      "Occupancy Certificate (OC)",
      "Completion Certificate",
      "Contractor Agreements",
      "RERA Registration",
      "Structural Safety Certificate",
    ],
  },
  {
    step: "06",
    title: "NRI & Special Cases",
    slug: "nri",
    summary:
      "Buying, selling or repatriating from abroad, without flying in.",
    detail:
      "An overseas power of attorney has to be attested in the right order or the sub-registrar will refuse it. We prepare that chain, apply the correct TDS rate on the transaction rather than the default one, keep the purchase FEMA-compliant, and handle repatriation paperwork so the proceeds can actually leave the country.",
    items: [
      "NRI Property Purchase Help",
      "Repatriation Documents",
      "TDS on NRI Transactions",
      "FEMA Compliance",
      "Overseas PoA Attestation",
      "PIO / OCI Card Docs",
    ],
  },
];
