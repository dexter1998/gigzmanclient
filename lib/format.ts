/** Indian statutory deadlines are IST dates, so formatting is pinned to that zone. */
export const IST_TIMEZONE = "Asia/Kolkata";
export const IST_OFFSET = "+05:30";

export function formatInr(value: number, withPaise = false): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: withPaise ? 2 : 0,
    maximumFractionDigits: withPaise ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * Indian real-estate convention: "₹85 L", "₹2.15 Cr" rather than the full
 * digit grouping `formatInr` produces. `properties.priceLabel` lets a listing
 * override this entirely (e.g. "Price on request"); this is the computed
 * fallback for listings that only set a numeric `price`.
 */
export function formatIndianPrice(value: number): string {
  if (value >= 1_00_00_000) {
    const crores = value / 1_00_00_000;
    return `₹${crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2)} Cr`;
  }
  if (value >= 1_00_000) {
    const lakhs = value / 1_00_000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)} L`;
  }
  return formatInr(value);
}

/** Renders a plain `YYYY-MM-DD` without letting the runtime's zone shift the day. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const iso = typeof value === "string" ? value : value.toISOString().slice(0, 10);
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: IST_TIMEZONE,
  }).format(date);
}

/**
 * A statutory due date expires at the end of that day in IST, so the countdown
 * target is 23:59:59 IST rather than midnight UTC.
 */
export function deadlineInstant(isoDate: string): Date {
  return new Date(`${isoDate.slice(0, 10)}T23:59:59${IST_OFFSET}`);
}

export function daysUntil(isoDate: string, from: Date = new Date()): number {
  const target = deadlineInstant(isoDate).getTime();
  return Math.ceil((target - from.getTime()) / 86_400_000);
}

export function todayInIst(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST_TIMEZONE }).format(new Date());
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  taxation: "Taxation",
  gst: "GST & Indirect Tax",
  audit_assurance: "Audit & Assurance",
  business_corporate: "Business & Corporate",
};

export const QUERY_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contact_attempted: "Contact Attempted",
  connected: "Connected",
  qualified: "Qualified",
  consultation_scheduled: "Consultation Scheduled",
  converted: "Converted",
  not_converted: "Not Converted",
  spam: "Spam",
  closed: "Closed",
};

export const NOT_CONVERTED_REASON_LABELS: Record<string, string> = {
  no_response: "No response",
  service_not_available: "Service not available",
  budget_mismatch: "Budget mismatch",
  requirement_postponed: "Requirement postponed",
  selected_another_firm: "Selected another firm",
  invalid_query: "Invalid query",
  duplicate: "Duplicate",
  other: "Other",
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  individual: "Individual",
  salaried_professional: "Salaried Professional",
  proprietorship: "Proprietorship",
  partnership_llp: "Partnership / LLP",
  company: "Company",
  startup: "Startup",
  other: "Other",
};

export const UPDATE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  review_required: "Review Required",
  approved: "Approved",
  published: "Published",
  outdated: "Outdated",
  archived: "Archived",
};

export const CALCULATOR_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  testing: "Testing",
  // The enum value name is a holdover from the CA-only schema; the label is
  // deliberately vertical-neutral since real-estate calculators use the same
  // status column.
  ca_review_required: "Review Required",
  active: "Active",
  update_required: "Update Required",
  archived: "Archived",
};

/**
 * Keys are what the database stores, so the six already in use — apartment,
 * plot, builder_floor, commercial, villa, sco — must keep their spelling or
 * every existing listing loses its label.
 *
 * `sco` used to read "SCO (Shops)", which collapsed two things a buyer
 * searches for separately: an SCO is a shop-cum-office plot sold by the DTCP
 * allotment, a shop is a unit. Retail (a mall or high-street storefront) is a
 * third. They are listed apart for the same reason offices and warehouses are.
 */
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  // Residential
  apartment: "Apartment",
  builder_floor: "Builder Floor",
  villa: "Villa",
  farmhouse: "Farm House",
  affordable: "Affordable Flat",
  // Commercial
  commercial: "Commercial",
  sco: "SCO",
  shop: "Shop",
  retail: "Retail",
  office: "Office Space",
  warehouse: "Warehouse",
  industrial: "Industrial",
  // Land
  plot: "Plot",
  agriculture: "Agricultural Land",
};

/**
 * The dropdown's grouping. Flat lists of a dozen types read as a wall; these
 * are the three decisions a buyer has already made before they open it.
 */
export const PROPERTY_TYPE_GROUPS: { label: string; types: string[] }[] = [
  { label: "Residential", types: ["apartment", "builder_floor", "villa", "farmhouse", "affordable"] },
  { label: "Commercial", types: ["commercial", "sco", "shop", "retail", "office", "warehouse", "industrial"] },
  { label: "Land", types: ["plot", "agriculture"] },
];

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  new_launch: "New Launch",
  under_construction: "Under Construction",
  ready_to_move: "Ready to Move",
};

export const PROPERTY_PURPOSE_LABELS: Record<string, string> = {
  buy: "Buy",
  rent: "Rent",
};

/**
 * Budget bands, shared by the listing filter and every lead form.
 *
 * `value` is a rupee ceiling because that is what the listing filters on;
 * the label is how a Gurugram buyer says it. Kept in one place so a lead
 * saying "₹1 Cr – ₹2 Cr" means the same range the filter used.
 */
export const BUDGET_BANDS: { label: string; value: string }[] = [
  { label: "Under ₹50 L", value: "5000000" },
  { label: "₹50 L – ₹1 Cr", value: "10000000" },
  { label: "₹1 Cr – ₹2 Cr", value: "20000000" },
  { label: "₹2 Cr – ₹5 Cr", value: "50000000" },
  { label: "Above ₹5 Cr", value: "1000000000" },
];

export const BUDGET_LABELS: Record<string, string> = Object.fromEntries(
  BUDGET_BANDS.map((b) => [b.value, b.label]),
);
