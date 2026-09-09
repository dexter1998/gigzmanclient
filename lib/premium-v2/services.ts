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
    key: "loans",
    title: "Home Loans & Documentation",
    blurb:
      "EMI calculations, loan tie-ups with SBI, HDFC, ICICI, Axis and 10+ banks, plus complete A–Z documentation support.",
    tags: ["Loans", "EMI", "Docs"],
    href: "/calculators/emi",
  },
  {
    key: "interiors",
    title: "Interior Design & Vastu",
    blurb:
      "Professional interior design services with Vastu Shastra consultation for homes and offices in NCR.",
    tags: ["Interior", "Vastu", "Plans"],
    href: "#construction",
  },
];

/**
 * Evergreen sells farm houses and land in the Sohna belt, so none of the
 * general lines above describe what they actually do — no industrial sheds,
 * no SCO retail, and the paperwork that matters is mutation and fard rather
 * than society NOCs.
 */
const FARMHOUSE_SERVICE_LINES: ServiceLine[] = [
  {
    key: "farmhouses",
    title: "Farm Houses",
    blurb:
      "Built farm houses with lawns, orchards and guest blocks across Sohna, Bhondsi and the Aravalli fringe. Ready to move in or to let out.",
    tags: ["Buy", "Sell", "Resale"],
    href: "/properties?type=farmhouse",
  },
  {
    key: "farmland",
    title: "Agricultural Land",
    blurb:
      "Farm plots and khasra land along the Sohna–Gurugram corridor and the Delhi–Mumbai Expressway, with land use and access checked before we list it.",
    tags: ["Plots", "Khasra", "Acreage"],
    href: "/properties?type=farmhouse",
  },
  {
    key: "weekend-homes",
    title: "Weekend & Second Homes",
    blurb:
      "Estates bought to be used, not just held — an hour from Gurugram, close enough for a Friday evening drive.",
    tags: ["Lifestyle", "NCR", "Getaway"],
    href: "/properties?type=farmhouse",
  },
  {
    key: "land-papers",
    title: "Land Documentation",
    blurb:
      "Mutation, jamabandi and fard, registry and change of land use — the paperwork farmland turns on, handled end to end.",
    tags: ["Mutation", "Fard", "Registry"],
    href: "/#documentation",
  },
  {
    key: "farm-development",
    title: "Farm Development",
    blurb:
      "Boundary walls, borewells, landscaping and farmhouse construction, with vastu-compliant layouts where you want them.",
    tags: ["Build", "Landscape", "Vastu"],
    href: "/#construction",
  },
  {
    key: "investment",
    title: "Investment Advisory",
    blurb:
      "What a corridor is asking today, what it was asking last year, and what the expressway alignment is likely to do to it.",
    tags: ["Corridors", "Yield", "Exit"],
    href: "/localities",
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
  { label: "Living", direction: "E" },
  { label: "Kitchen", direction: "SE" },
  { label: "Store", direction: "S" },
  { label: "Bath", direction: "SW" },
  { label: "Sleep", direction: "W" },
  { label: "Entry", direction: "NW" },
  { label: "Puja", direction: "N" },
  { label: "Master", direction: "NE" },
] as const;

export interface DocumentationGroup {
  step: string;
  title: string;
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
