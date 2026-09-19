/**
 * What the lead forms ask, per client.
 *
 * The template's list was written for a city agency — "Buy a home", "Commercial
 * or office space", "Buy a plot" — and on Evergreen it asked a farmhouse buyer
 * to describe himself in words nobody on the Sohna belt uses. Worse, it had no
 * option for the two things Evergreen is actually asked for most: buying a
 * farmhouse, and renting one for a wedding or a party.
 *
 * The budget bands were wronger still. The stock ladder tops out at "Above ₹5
 * Cr", and 96% of Evergreen's 441 priced listings fall in its top two rungs —
 * a band that holds almost everything tells an advisor nothing. The farmhouse
 * ladder below is cut from the real inventory: the five bands hold 59, 128,
 * 115, 78 and 61 listings, so the answer actually narrows what to show.
 *
 * Keyed by slug for the same reason as advisors.ts and imagery.ts: what a
 * client is asked for is a fact about the client.
 *
 * No migration is needed for any of this. The interest and budget answers are
 * folded into the enquiry's message text by `composeMessage` and never stored
 * in a column of their own, so those lists are free. "You are" is the one
 * exception — it writes to a Postgres enum — so there the values are left
 * exactly as they are and only the wording and the selection change.
 */

export interface LeadOption {
  value: string;
  label: string;
}

const DEFAULT_INTERESTS: LeadOption[] = [
  { value: "buy_home", label: "Buy a home" },
  { value: "buy_plot", label: "Buy a plot" },
  { value: "commercial", label: "Commercial or office space" },
  { value: "investment", label: "Invest in property" },
  { value: "rent", label: "Rent a property" },
  { value: "sell", label: "Sell or lease out my property" },
  { value: "site_visit", label: "Book a site visit" },
  { value: "exploring", label: "Just exploring" },
];

/**
 * Renting leads, and that is deliberate. High Properties puts buying and selling
 * first because that is its business; Evergreen's is the weekend and the wedding,
 * so the two rent rows sit at the top and one of them is what the form opens on.
 *
 * Renting and buying are also split apart rather than sharing a "rent" row: a man
 * buying a ₹4 Cr weekend house and a man booking a lawn for a sangeet are not the
 * same lead, and — see the budget ladders below — they cannot even be asked the
 * same question about money.
 *
 * "List my farmhouse for events" exists because Evergreen both lets its own
 * farmhouses and brokers other owners' — that second group is supply, and it
 * used to arrive disguised as "Sell or lease out my property".
 */
const FARMHOUSE_INTERESTS: LeadOption[] = [
  { value: "rent_event", label: "Rent a farmhouse for an event" },
  { value: "rent_stay", label: "Rent a farmhouse for a stay" },
  { value: "buy_farmhouse", label: "Buy a farmhouse" },
  { value: "buy_farmland", label: "Buy farm land or a plot" },
  { value: "list_farmhouse", label: "List my farmhouse for events" },
  { value: "sell_farmhouse", label: "Sell my farmhouse or land" },
  { value: "investment", label: "Invest in farm land" },
  { value: "site_visit", label: "Book a site visit" },
  { value: "exploring", label: "Just exploring" },
];

/** Rupee ceilings, matching the stock ladder's shape so nothing else changes. */
const DEFAULT_BUDGETS: LeadOption[] = [
  { label: "Under ₹50 L", value: "5000000" },
  { label: "₹50 L – ₹1 Cr", value: "10000000" },
  { label: "₹1 Cr – ₹2 Cr", value: "20000000" },
  { label: "₹2 Cr – ₹5 Cr", value: "50000000" },
  { label: "Above ₹5 Cr", value: "1000000000" },
];

const FARMHOUSE_BUDGETS: LeadOption[] = [
  { label: "Under ₹2 Cr", value: "20000000" },
  { label: "₹2 Cr – ₹4 Cr", value: "40000000" },
  { label: "₹4 Cr – ₹6 Cr", value: "60000000" },
  { label: "₹6 Cr – ₹10 Cr", value: "100000000" },
  { label: "Above ₹10 Cr", value: "1000000000" },
];

/**
 * Renting is priced per 24 hours with catering in, not in crores, so a rent lead
 * gets a different ladder entirely — asking a man booking a sangeet to choose
 * between "₹2 Cr" and "₹4 Cr" is asking him the wrong question.
 *
 * Values are prefixed so they can never collide with the sale ladder's rupee
 * ceilings, which matters because both end up in the same labels map.
 */
const FARMHOUSE_RENT_BUDGETS: LeadOption[] = [
  { value: "rent_30k", label: "₹15,000 – ₹30,000" },
  { value: "rent_50k", label: "₹30,000 – ₹50,000" },
  { value: "rent_75k", label: "₹50,000 – ₹75,000" },
  { value: "rent_75k_plus", label: "₹75,000+" },
];

/** The rent rows, so callers can tell which ladder and which label to show. */
const RENT_INTERESTS = new Set(["rent_event", "rent_stay", "rent"]);

export function isRentInterest(interest: string | undefined | null): boolean {
  return !!interest && RENT_INTERESTS.has(interest);
}

/**
 * What the form opens on. Evergreen opens on renting for an event — it is the
 * single commonest enquiry the firm takes, and a pre-selected first row is worth
 * more than the same row merely being listed first. Everywhere else the field
 * starts empty, which is the template's own behaviour.
 */
const DEFAULT_INTEREST_BY_SLUG: Record<string, string> = {
  "evergreen-real-estate": "rent_event",
};

export function defaultInterestFor(clientSlug: string | undefined | null): string {
  if (!clientSlug) return "";
  return DEFAULT_INTEREST_BY_SLUG[clientSlug] ?? "";
}

const INTERESTS_BY_SLUG: Record<string, LeadOption[]> = {
  "evergreen-real-estate": FARMHOUSE_INTERESTS,
};

const BUDGETS_BY_SLUG: Record<string, LeadOption[]> = {
  "evergreen-real-estate": FARMHOUSE_BUDGETS,
};

export function interestOptionsFor(clientSlug: string | undefined | null): LeadOption[] {
  if (!clientSlug) return DEFAULT_INTERESTS;
  return INTERESTS_BY_SLUG[clientSlug] ?? DEFAULT_INTERESTS;
}

export function budgetOptionsFor(
  clientSlug: string | undefined | null,
  interest?: string | null,
): LeadOption[] {
  if (!clientSlug) return DEFAULT_BUDGETS;
  const sale = BUDGETS_BY_SLUG[clientSlug] ?? DEFAULT_BUDGETS;
  if (clientSlug !== "evergreen-real-estate") return sale;
  return isRentInterest(interest) ? FARMHOUSE_RENT_BUDGETS : sale;
}

/** The wording above the budget field, which differs by what is being priced. */
export function budgetLabelFor(
  clientSlug: string | undefined | null,
  interest?: string | null,
): string {
  return clientSlug === "evergreen-real-estate" && isRentInterest(interest)
    ? "Budget per 24 hours, food included (optional)"
    : "Budget (optional)";
}

/**
 * "You are", per client.
 *
 * Unlike the two lists above, these values ARE a Postgres enum (`client_type`)
 * and existing rows carry them, so the values are fixed and only the wording
 * and the selection change. The stock labels came from an accountancy template
 * — "Proprietorship", "Startup" — and asked a man enquiring about a weekend
 * house to file himself under a business structure.
 *
 * Evergreen drops `startup`, which has no farmhouse meaning at all, and
 * renames the rest to how the buyer would describe himself. `lib/format.ts`
 * keeps the canonical labels untouched, so the dashboard still reads every
 * stored value exactly as before.
 */
const DEFAULT_CLIENT_TYPES: LeadOption[] = [
  { value: "individual", label: "Individual" },
  { value: "salaried_professional", label: "Salaried Professional" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership_llp", label: "Partnership / LLP" },
  { value: "company", label: "Company" },
  { value: "startup", label: "Startup" },
  { value: "other", label: "Other" },
];

const FARMHOUSE_CLIENT_TYPES: LeadOption[] = [
  { value: "individual", label: "Buying or renting for myself" },
  { value: "salaried_professional", label: "Salaried professional" },
  { value: "proprietorship", label: "Business owner" },
  { value: "company", label: "Company — corporate offsite or booking" },
  { value: "partnership_llp", label: "Event planner or agency" },
  { value: "other", label: "Other" },
];

const CLIENT_TYPES_BY_SLUG: Record<string, LeadOption[]> = {
  "evergreen-real-estate": FARMHOUSE_CLIENT_TYPES,
};

export function clientTypeOptionsFor(clientSlug: string | undefined | null): LeadOption[] {
  if (!clientSlug) return DEFAULT_CLIENT_TYPES;
  return CLIENT_TYPES_BY_SLUG[clientSlug] ?? DEFAULT_CLIENT_TYPES;
}

/**
 * Every label this deployment has ever offered, across every client.
 *
 * Deliberately not per-tenant: leads already in the table were written with
 * whatever list was live at the time, and a lookup that only knew today's
 * options would render those older enquiries as "Not specified". Values are
 * unique across the sets, so one flat map is safe.
 */
export const ALL_INTEREST_LABELS: Record<string, string> = Object.fromEntries(
  [...DEFAULT_INTERESTS, ...FARMHOUSE_INTERESTS].map((o) => [o.value, o.label]),
);

export const ALL_BUDGET_LABELS: Record<string, string> = Object.fromEntries(
  [...DEFAULT_BUDGETS, ...FARMHOUSE_BUDGETS, ...FARMHOUSE_RENT_BUDGETS].map((o) => [
    o.value,
    o.label,
  ]),
);
