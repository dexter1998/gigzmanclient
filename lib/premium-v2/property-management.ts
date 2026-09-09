/**
 * Copy and data for the property-management landing page.
 *
 * Kept out of the components so the sections stay presentational and the
 * wording is editable in one place. None of it is client-specific enough to
 * belong in the database yet — when the client starts revising these figures
 * themselves, the metrics and corridors are the first things to move.
 *
 * Figures here are illustrative and the page says so on the metrics that
 * carry numbers; do not present them as audited portfolio data.
 */

export interface ManagementService {
  key: string;
  title: string;
  /** Shown under the title on the large card only. */
  subtitle?: string;
  tile: string;
}

const TILES = "/verticals/realestate/templates/premium-v2/property-management-page/tiles";

export const FEATURED_SERVICE: ManagementService = {
  key: "residential",
  title: "Residential Management",
  subtitle: "Apartments · Villas · Builder Floors",
  tile: `${TILES}/residential.webp`,
};

export const MANAGEMENT_SERVICES: ManagementService[] = [
  { key: "tenant-sourcing", title: "Tenant Sourcing & Screening", tile: `${TILES}/tenant-sourcing.webp` },
  { key: "rent-collection", title: "Rent Collection & Follow-ups", tile: `${TILES}/rent-collection.webp` },
  { key: "inspections", title: "Inspections & Maintenance", tile: `${TILES}/inspections.webp` },
  { key: "agreements", title: "Agreements & Documentation", tile: `${TILES}/agreements.webp` },
];

/** Secondary service lines, shown as a link row under the mosaic. */
export const SERVICE_LINES = [
  { key: "commercial", label: "Commercial & SCO" },
  { key: "plots", label: "Plots & Vacant Homes" },
  { key: "nri", label: "NRI Property Care" },
] as const;

export const CONTROL_CENTRE_FEATURES = [
  {
    key: "occupancy",
    title: "Live occupancy & rent status",
    body: "Track performance across all your properties in real time.",
  },
  {
    key: "maintenance",
    title: "Maintenance approvals",
    body: "Review and approve service requests instantly.",
  },
  {
    key: "reporting",
    title: "Agreements & reports",
    body: "Access contracts, statements and detailed reports.",
  },
  {
    key: "advisor",
    title: "Advisor support",
    body: "Get expert guidance whenever you need it.",
  },
] as const;

export const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Property assessment",
    body: "We evaluate your property's potential and prepare it for success.",
  },
  {
    step: "02",
    title: "Marketing & tenant search",
    body: "Your property is listed across trusted channels to attract quality tenants.",
  },
  {
    step: "03",
    title: "Verification & agreement",
    body: "We verify tenants and prepare legally sound agreements.",
  },
  {
    step: "04",
    title: "Move-in & rent collection",
    body: "We handle a smooth move-in and ensure timely rent collection.",
  },
  {
    step: "05",
    title: "Ongoing care & reporting",
    body: "We maintain your property and keep you informed with clear reports.",
  },
] as const;

export const VERIFICATION_CHECKS = [
  "ID & address verification",
  "Employment/income checks",
  "Police verification support",
  "Digital lease documentation",
  "Security-deposit records",
] as const;

export const MAINTENANCE_STEPS = [
  {
    step: "01",
    title: "Report issue",
    body: "Tenants raise a request anytime via phone, WhatsApp or portal.",
  },
  {
    step: "02",
    title: "Diagnose & estimate",
    body: "Our team inspects, diagnoses the issue and shares a clear estimate.",
  },
  {
    step: "03",
    title: "Owner approval",
    body: "We get your approval before any work begins.",
  },
  {
    step: "04",
    title: "Repair & closure",
    body: "Work completed, quality checked and documented with photos.",
  },
] as const;

export const INSPECTION_BADGES = ["42-point inspection", "Photo documented", "Owner approved"] as const;

export const PERFORMANCE_METRICS = [
  { value: "94%", label: "Average occupancy" },
  { value: "6.2%", label: "Average rental yield" },
  { value: "8 days", label: "Average tenant turnaround" },
] as const;

export const RECENT_DEALS = [
  { location: "Golf Course Road", area: "Gurugram", rent: "₹85,000/mo", outcome: "Leased in 6 days" },
  { location: "Dwarka Expressway", area: "Gurugram", rent: "₹62,000/mo", outcome: "Leased in 9 days" },
  { location: "New Gurugram", area: "Gurugram", rent: "₹41,000/mo", outcome: "Renewed" },
] as const;

export const PROPERTY_TYPES = [
  { key: "apartments", label: "Apartments" },
  { key: "villas", label: "Luxury Villas" },
  { key: "builder-floors", label: "Builder Floors" },
  { key: "commercial", label: "Commercial & SCO" },
  { key: "plots", label: "Plots & Vacant Homes" },
] as const;

export const COVERAGE_CORRIDORS = [
  { name: "Golf Course Road", response: "< 2 hours" },
  { name: "Golf Course Extension", response: "< 2 hours" },
  { name: "Dwarka Expressway", response: "< 3 hours" },
  { name: "Southern Peripheral Road (SPR)", response: "< 3 hours" },
  { name: "Sohna Road", response: "< 3 hours" },
  { name: "New Gurugram", response: "< 4 hours" },
] as const;

const TESTIMONIAL_BASE =
  "/verticals/realestate/templates/premium-v2/property-management-page/testimonials";

export const OWNER_STORIES = [
  {
    id: "ananya-mehra",
    name: "Ananya Mehra",
    role: "Owner, Dubai",
    duration: "02:18",
    quote: "My Gurugram home is managed even while I'm abroad.",
    poster: `${TESTIMONIAL_BASE}/ananya-mehra.webp`,
    alt: "Ananya Mehra at home in Dubai, speaking about her managed Gurugram property",
  },
  {
    id: "rohan-kavya",
    name: "Rohan & Kavya",
    role: "Owners, Gurugram",
    duration: "01:46",
    quote: "We found a verified tenant without the usual follow-ups.",
    poster: `${TESTIMONIAL_BASE}/rohan-kavya.webp`,
    alt: "Rohan and Kavya at home in Gurugram, speaking about finding a verified tenant",
  },
  {
    id: "rajiv-malhotra",
    name: "Rajiv Malhotra",
    role: "Investor, Delhi",
    duration: "01:32",
    quote: "Every rent and repair is documented.",
    poster: `${TESTIMONIAL_BASE}/rajiv-malhotra.webp`,
    alt: "Rajiv Malhotra at home in Delhi, speaking about documented rent and repairs",
  },
] as const;

export const OWNER_STATS = [
  { value: "500+", label: "Owners assisted" },
  { value: "25+", label: "Gurugram sectors" },
  { value: "4.8/5", label: "Owner satisfaction" },
  { value: "12+", label: "Years local expertise" },
] as const;

export const MANAGEMENT_FAQS = [
  {
    question: "What does property management include?",
    answer:
      "We handle end-to-end management — tenant sourcing, rent collection, property inspections, maintenance coordination, documentation and regular owner updates.",
  },
  {
    question: "How do you verify tenants?",
    answer:
      "Every prospective tenant goes through ID and address verification, employment or income checks and police verification support, and the lease is documented digitally before move-in.",
  },
  {
    question: "Who approves maintenance expenses?",
    answer:
      "You do. We inspect, diagnose and share an estimate, and no work begins until you approve it. Completed work is photo-documented and closed off in your reports.",
  },
  {
    question: "Can you manage a vacant or NRI-owned property?",
    answer:
      "Yes. Vacant homes get scheduled upkeep and inspection visits, and NRI owners get the same reporting with approvals and updates handled remotely across time zones.",
  },
  {
    question: "How are rent and reports shared?",
    answer:
      "Rent is transferred to your account on collection, and statements, agreements and inspection reports are available to you along with a regular summary of how the property is performing.",
  },
] as const;
