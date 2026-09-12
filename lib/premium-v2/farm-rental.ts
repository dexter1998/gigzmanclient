/**
 * The farmhouse-rental page family.
 *
 * Autosuggest for this belt is dominated by letting intent, not purchase
 * intent — "farmhouse in gurgaon for party", "for day outing", "for wedding",
 * "for one day", "under 10000", "with swimming pool", "for night stay". The
 * site answered none of it: /rental-yield went from its calculator straight to
 * the closing CTA, and the whole of the rest of the site is written for a
 * buyer.
 *
 * Pages are generated from three axes rather than hand-written, but each one
 * carries facts the axis itself supplies — what the occasion actually needs
 * from a farmhouse, what it costs in this belt, what the area is like to
 * reach — so a page is a different document per combination rather than the
 * same paragraph with one noun swapped.
 *
 * Only tenants whose inventory is farmhouses publish these; see
 * `farmRentalEnabled`.
 */
import { inventoryNoun } from "@/lib/premium-v2/imagery";

const FARM = "/verticals/realestate/templates/premium-v2/farmhouses";

export interface RentalFaq {
  q: string;
  a: string;
}

export interface RentalOccasion {
  slug: string;
  /** "a birthday party", used mid-sentence. */
  phrase: string;
  /** Title-case label for headings and chips. */
  label: string;
  /** Typical group size, as people describe it when they call. */
  capacity: string;
  /** Honest day-rate band for this belt, in rupees. */
  budget: [number, number];
  /** Whether the day usually runs overnight. */
  overnight: boolean;
  /** What this occasion actually needs from the property. */
  needs: string[];
  /** One paragraph specific to running this occasion here. */
  intro: string;
  photo: string;
}

export interface RentalArea {
  slug: string;
  name: string;
  /** Matches `properties.locality` where the inventory has rows for it. */
  locality?: string;
  /** How people get there, and how long it takes. */
  access: string;
  /** What is distinctive about renting here rather than the next pocket. */
  character: string;
}

/**
 * Occasions, ordered by how often they come up in search rather than
 * alphabetically. Budget bands are day rates for a one-acre property in this
 * belt and are stated as ranges on the page, never as a quoted price.
 */
export const RENTAL_OCCASIONS: RentalOccasion[] = [
  {
    slug: "party",
    phrase: "a party",
    label: "Party",
    capacity: "30–150 guests",
    budget: [15000, 60000],
    overnight: false,
    needs: ["Sound till a stated hour", "Lawn plus a covered area for rain", "Parking off the road", "Bar and kitchen access"],
    intro:
      "A party is the single most common reason a farmhouse in this belt gets booked, and the two things that decide whether it goes well are the sound cut-off and the parking. Ask both before the rate.",
    photo: `${FARM}/06-gurgaon-farmhouse.webp`,
  },
  {
    slug: "wedding",
    phrase: "a wedding",
    label: "Wedding",
    capacity: "150–600 guests",
    budget: [125000, 600000],
    overnight: true,
    needs: ["Lawn that takes a full mandap and dining", "Rooms for the family to change and stay", "Generator backup sized for the lighting", "Vendor entry separate from guest entry"],
    intro:
      "A farmhouse wedding is really a three-day booking — haldi or mehendi, the wedding, and the morning after. Rates quoted per day look reasonable until you add the setup and teardown days, so agree the full window in writing before anything else.",
    photo: `${FARM}/02-gurgaon-farmhouse.webp`,
  },
  {
    slug: "birthday-party",
    phrase: "a birthday party",
    label: "Birthday Party",
    capacity: "20–100 guests",
    budget: [12000, 45000],
    overnight: false,
    needs: ["Fenced lawn if children are coming", "Pool with a depth you are told in advance", "Shade for the middle of the day", "Cake and catering entry allowed"],
    intro:
      "For a children's birthday the pool is the first question and the fencing is the second. Ask for the pool's depth at both ends in writing — several properties in the belt have a single-depth pool that is too deep for young children.",
    photo: `${FARM}/13-gurgaon-farmhouse.webp`,
  },
  {
    slug: "day-outing",
    phrase: "a day outing",
    label: "Day Outing",
    capacity: "10–60 guests",
    budget: [8000, 30000],
    overnight: false,
    needs: ["Clear in-and-out timings", "Pool and lawn access included", "Kitchen you may cook in, or catering allowed", "Indoor room if the weather turns"],
    intro:
      "Day outings run roughly 10am to 7pm and are the cheapest way to use a farmhouse here. The catch is that day rates often exclude the pool or the kitchen, so confirm what the rate actually covers rather than assuming the whole property.",
    photo: `${FARM}/17-gurgaon-farmhouse.webp`,
  },
  {
    slug: "corporate-offsite",
    phrase: "a corporate offsite",
    label: "Corporate Offsite",
    capacity: "20–120 people",
    budget: [35000, 150000],
    overnight: true,
    needs: ["Working Wi-Fi, tested before you book", "A covered space that seats everyone", "Power backup that carries projectors", "A proper invoice with GST"],
    intro:
      "Sohna is close enough to Cyber City that a team can leave after standup and be on a lawn by mid-morning. What separates a workable offsite property from a party venue is boring: bandwidth, a room that seats everyone out of the sun, and a GST invoice your finance team accepts.",
    photo: `${FARM}/21-gurgaon-farmhouse.webp`,
  },
  {
    slug: "pre-wedding-shoot",
    phrase: "a pre-wedding shoot",
    label: "Pre-Wedding Shoot",
    capacity: "5–20 people",
    budget: [10000, 40000],
    overnight: false,
    needs: ["Early-morning or golden-hour access", "A changing room", "Backdrops that are not all the same lawn", "Permission for drones stated up front"],
    intro:
      "Shoot bookings are short and early, and most owners price them per half-day. The property's value here is variety in a small area — a treeline, a pool edge, a driveway, an interior — so ask for photographs of all four rather than the front elevation.",
    photo: `${FARM}/23-gurgaon-farmhouse.webp`,
  },
  {
    slug: "night-stay",
    phrase: "a night stay",
    label: "Night Stay",
    capacity: "6–30 guests",
    budget: [15000, 70000],
    overnight: true,
    needs: ["Bedrooms with working air-conditioning", "Hot water and clean linen confirmed", "A caretaker on the property overnight", "Heater or bonfire in winter"],
    intro:
      "An overnight booking is where the difference between a well-kept farmhouse and a neglected one shows. Air-conditioning, hot water and linen are the three things most commonly missing, and none of them appears in a listing photograph.",
    photo: `${FARM}/29-gurgaon-farmhouse.webp`,
  },
  {
    slug: "family-get-together",
    phrase: "a family get-together",
    label: "Family Get-Together",
    capacity: "15–80 guests",
    budget: [12000, 50000],
    overnight: false,
    needs: ["Shaded seating for elders", "A kitchen you can actually cook in", "Level ground from the parking to the lawn", "Clean, accessible washrooms"],
    intro:
      "The details that matter for a family day are the ones nobody photographs: how far the parking is from the lawn, whether that walk is level, and whether the washrooms are clean. Ask to see the washrooms on the site visit.",
    photo: `${FARM}/04-gurgaon-farmhouse.webp`,
  },
  {
    slug: "picnic",
    phrase: "a picnic",
    label: "Picnic",
    capacity: "10–50 guests",
    budget: [6000, 25000],
    overnight: false,
    needs: ["Open lawn with real shade", "Outside food allowed", "Pool access if the day is warm", "Simple, stated in-and-out hours"],
    intro:
      "A picnic booking is the lowest-cost way into the belt, and the one where an outside-food restriction most often ruins the plan. Confirm it before you pay anything.",
    photo: `${FARM}/08-gurgaon-farmhouse.webp`,
  },
  {
    slug: "photo-and-film-shoot",
    phrase: "a photo or film shoot",
    label: "Photo & Film Shoot",
    capacity: "10–60 crew",
    budget: [20000, 120000],
    overnight: false,
    needs: ["Truck access to the gate", "Three-phase power or a generator point", "Permission in writing for the property to appear on screen", "A neighbour who has been told"],
    intro:
      "Production bookings need things a party never asks for: a gate a truck fits through, a power point that carries lights, and written permission to show the property on screen. Sort the last one first — it is the one that gets refused late.",
    photo: `${FARM}/27-gurgaon-farmhouse.webp`,
  },
];

/**
 * Pockets of the belt people search by name. `locality` matches the value on
 * the property rows where the inventory carries any, so a page can show real
 * listings rather than a generic strip.
 */
export const RENTAL_AREAS: RentalArea[] = [
  {
    slug: "sohna",
    name: "Sohna",
    locality: "Sohna",
    access: "About 25 km from Rajiv Chowk on the Sohna elevated road — under an hour from most of Gurugram outside peak hours.",
    character: "The deepest supply in the belt, and the widest price spread. Everything from a bare lawn to a fully staffed six-bedroom property.",
  },
  {
    slug: "sohna-road",
    name: "Sohna Road",
    locality: "Sohna Road",
    access: "The corridor itself, so the drive is short from Gurugram but the properties sit closer to traffic than the ones further in.",
    character: "Convenient rather than remote. Good for a half-day booking where travel time matters more than seclusion.",
  },
  {
    slug: "the-westin-vatika",
    name: "The Westin Vatika",
    access: "Inside the Vatika farm estate at Karnki, beside The Westin Sohna Resort & Spa — a gated approach with a maintained internal road.",
    character: "The best-kept pocket in the belt and where our own office sits. Gated, landscaped, and priced accordingly.",
  },
  {
    slug: "karnki",
    name: "Karnki",
    access: "The village the Westin estate stands on, five minutes off the Sohna road.",
    character: "Village-adjacent properties, generally larger plots for the money, with more variation in upkeep than the gated estate next door.",
  },
  {
    slug: "damdama",
    name: "Damdama",
    access: "Past Sohna towards the lake, roughly 15 minutes further than the main cluster.",
    character: "Against the Aravali edge with real tree cover and a few degrees cooler. Worth the extra drive for an overnight booking.",
  },
  {
    slug: "bhondsi",
    name: "Bhondsi",
    locality: "Bhondsi",
    access: "Between Gurugram and Sohna, roughly 20 minutes from Golf Course Extension Road.",
    character: "The shortest drive from the city of any pocket in the belt, and the easiest for guests coming from Delhi in the evening.",
  },
  {
    slug: "manesar",
    name: "Manesar",
    locality: "Manesar",
    access: "West of Gurugram on NH-48, convenient from Dwarka Expressway and the airport side.",
    character: "Better suited to guests arriving from Delhi's west and the airport than the Sohna pocket is.",
  },
  {
    slug: "gurgaon",
    name: "Gurgaon",
    access: "Everything within about an hour of the city — the Sohna belt, Bhondsi, Damdama and Manesar taken together.",
    character: "The whole catchment. Use it when the pocket matters less than the date and the budget.",
  },
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    access: "Roughly an hour from South Delhi, ninety minutes from central Delhi, and about the same from Noida via the Faridabad road.",
    character: "The closest genuine countryside to Delhi. Most of what people find searching from Delhi is in this belt.",
  },
];

/** Budget bands people actually type, in rupees per day. */
export const RENTAL_BUDGETS = [10000, 25000, 50000, 100000, 200000];

export interface RentalQuestionPage {
  slug: string;
  title: string;
  heading: string;
  intro: string;
  photo: string;
  body: { heading: string; paragraphs: string[] }[];
  faqs: RentalFaq[];
}

/**
 * Question pages, written rather than generated. These are the ones with no
 * axis behind them — a person asking "what does it actually cost" is not
 * asking about an occasion or an area.
 */
export const RENTAL_QUESTIONS: RentalQuestionPage[] = [
  {
    slug: "how-much-does-it-cost-to-rent-a-farmhouse-in-gurgaon",
    title: "How much does it cost to rent a farmhouse in Gurgaon?",
    heading: "What a farmhouse actually costs to rent here",
    intro:
      "Rates in the Sohna belt run from about ₹6,000 for a small picnic booking to well past ₹5 lakh for a full wedding weekend. The number you are quoted depends on four things, and only one of them is the property.",
    photo: `${FARM}/10-gurgaon-farmhouse.webp`,
    body: [
      {
        heading: "The four things that move the price",
        paragraphs: [
          "Day of the week is the biggest single factor. A Saturday in wedding season can be three times a Tuesday in July for the same property, and owners hold their Saturdays back until late.",
          "Guest count is second, because it decides staff, washrooms and parking rather than space. Third is duration — a day booking, a night, or a multi-day event with setup and teardown days that are charged too.",
          "The property itself is fourth. A one-acre lawn with a pool and six bedrooms in the Westin estate is a different product from a bare lawn in a village pocket, and the gap between them is wider than most listings suggest.",
        ],
      },
      {
        heading: "What is usually not in the quoted rate",
        paragraphs: [
          "A security deposit, refundable after the property is checked. Generator running charges billed per hour. A sound-system or DJ charge if you bring your own. Cleaning if the booking runs past the stated hours. Extra staff for a guest count above what was agreed.",
          "Ask for the rate and the exclusions in the same message, in writing. Almost every dispute in this belt is about the second list, not the first.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is there a cheaper season?",
        a: "Yes. July to early September, and the middle of summer, are the softest. December to February and the wedding weeks either side of it are the most expensive.",
      },
      {
        q: "Do owners negotiate?",
        a: "On a weekday, usually. On a Saturday in season, rarely — and a big discount on a peak date is often a sign that something about the property is being left out.",
      },
      {
        q: "How much deposit is normal?",
        a: "Between a quarter and a half of the booking value, refundable. Get the refund condition in writing, including how long after the event it is returned.",
      },
    ],
  },
  {
    slug: "what-is-included-when-you-rent-a-farmhouse",
    title: "What is included when you rent a farmhouse?",
    heading: "What the rate covers, and what it quietly does not",
    intro:
      "\"The whole farmhouse\" means different things to different owners in this belt. Before you pay a token, get a written list of what the booking includes — these are the items that most often turn out to be excluded.",
    photo: `${FARM}/15-gurgaon-farmhouse.webp`,
    body: [
      {
        heading: "Commonly included",
        paragraphs: [
          "The lawn and open areas, basic seating, existing lighting, one caretaker on site, parking on the property, and water.",
        ],
      },
      {
        heading: "Commonly excluded, and worth asking about by name",
        paragraphs: [
          "Pool access and pool cleaning. The indoor rooms — many day rates cover the lawn only. Kitchen use, as opposed to catering entry. Generator fuel. Sound equipment. Bed linen and towels on an overnight booking. Housekeeping between days of a multi-day event.",
          "Air-conditioning is the one to be most careful about. Some properties charge for it per room per night, and on a summer overnight booking that can add more than the room rate itself.",
        ],
      },
    ],
    faqs: [
      { q: "Can we bring our own caterer?", a: "Usually yes, sometimes with a kitchen or entry charge. A few properties have an exclusive caterer — ask before you shortlist, not after." },
      { q: "Is outside alcohol allowed?", a: "It varies by property, and it is a Haryana excise question for a large event. Get the answer in writing from the owner." },
      { q: "Who cleans up afterwards?", a: "Basic cleaning is normally included; clearing an event's worth of waste usually is not. Agree this before the booking." },
    ],
  },
  {
    slug: "farmhouse-rental-rules-in-haryana",
    title: "Farmhouse rental rules in Haryana",
    heading: "The rules that actually get enforced",
    intro:
      "Most of what governs a farmhouse booking in this belt is local and practical rather than a single statute. These are the ones that cause problems when they are ignored.",
    photo: `${FARM}/18-gurgaon-farmhouse.webp`,
    body: [
      {
        heading: "Sound",
        paragraphs: [
          "Amplified sound outdoors is restricted after 10pm under the noise-pollution rules, and this is enforced in the belt after complaints. A property that tells you \"music till late, no problem\" is telling you it has not been complained about yet, which is not the same thing.",
        ],
      },
      {
        heading: "Guest count, staff and safety",
        paragraphs: [
          "Guest counts above what the property is set up for cause the real failures — parking spilling onto the road, washroom queues, and a generator that cannot carry the load. Agree a number and tell the owner if it changes.",
          "For a large event, ask who is responsible for crowd safety and whether there is any event insurance. On most private farmhouses the answer is nobody and no, which is worth knowing in advance.",
        ],
      },
      {
        heading: "If you are the owner letting it out",
        paragraphs: [
          "Letting a farmhouse commercially is a different activity from owning agricultural land, and the land's classification does not automatically permit it. Before advertising a property for events, check the land's classification and any change-of-use requirement for your khasra — the answer differs across the belt.",
        ],
      },
    ],
    faqs: [
      { q: "Until when can we play music?", a: "Plan for amplified outdoor sound to stop at 10pm. Indoor music at a moderate level after that is generally tolerated." },
      { q: "Do we need a permit for a wedding?", a: "For a private gathering on private land, usually not — but excise permission for a bar, and local intimation for a very large gathering, are worth confirming." },
      { q: "Can I let out my own farmhouse for events?", a: "Speak to us first. It depends on the land classification and the approach road, and getting it wrong creates a problem that follows the title." },
    ],
  },
  {
    slug: "farmhouse-rental-income-in-the-sohna-belt",
    title: "What a farmhouse earns on rent in the Sohna belt",
    heading: "What letting actually returns, honestly",
    intro:
      "Owners ask us this constantly, usually after being told a number by somebody selling them a plot. Here is what the belt actually does, and what it costs to get there.",
    photo: `${FARM}/30-gurgaon-farmhouse.webp`,
    body: [
      {
        heading: "Occupancy is the whole answer",
        paragraphs: [
          "A well-run one-acre property in a good pocket lets roughly six to ten days a month across the year, heavily concentrated in October to March. A property with a poor approach road, or one nobody is actively marketing, lets one or two.",
          "That range — six days versus one — is a five-fold difference in income on properties that cost the same to buy. It is decided almost entirely by approach road, distance from the Westin cluster, and whether someone is answering enquiries the same day.",
        ],
      },
      {
        heading: "What it costs to run",
        paragraphs: [
          "A caretaker, garden and pool upkeep, tanker water in summer, electricity and generator fuel, repairs after events, and platform or agent commission. Against gross letting income these routinely take a third to a half.",
          "Set against the purchase price of the land, letting income in this belt is a modest yield. People who do well here do so on appreciation, with letting covering the holding cost — not the other way round. Anyone quoting you a rental yield that competes with the appreciation story is selling something.",
        ],
      },
    ],
    faqs: [
      { q: "Will letting cover my EMI?", a: "On a well-run property in a strong pocket it can cover a meaningful part of it. Assume it will not cover all of it, and be pleased if it does." },
      { q: "Does letting damage the property?", a: "Events do wear a property faster than family use. Budget for repainting and lawn restoration annually if you let for weddings." },
      { q: "Can you manage it for us?", a: "Caretaking and letting management is something we are set up for locally — ask us what it involves for your specific plot." },
    ],
  },
  {
    slug: "farmhouse-with-swimming-pool-near-gurgaon",
    title: "Farmhouses with a swimming pool near Gurgaon",
    heading: "Booking a farmhouse with a pool",
    intro:
      "A pool is the most-requested feature in the belt and the one most often misrepresented. Of the farmhouse listings we track around Sohna, a little over half state a pool — and the state of it varies enormously.",
    photo: `${FARM}/24-gurgaon-farmhouse.webp`,
    body: [
      {
        heading: "Four questions before you book a pool property",
        paragraphs: [
          "When was it last cleaned, and is cleaning included in the rate or billed separately? What is the depth at both ends — a single-depth pool is unsuitable for young children. Is it heated, which matters from November to February? And is pool access included in a day rate, or charged on top?",
          "Ask for a photograph of the pool taken this week, not a listing photograph. It is the single most effective filter in this belt.",
        ],
      },
    ],
    faqs: [
      { q: "Are pools usable in winter?", a: "Only if heated. Unheated pools in this belt are effectively unusable from late November to February." },
      { q: "Is a lifeguard provided?", a: "Almost never. If children are coming, arrange supervision yourself and say so when booking." },
      { q: "Is pool cleaning extra?", a: "Frequently, especially on a day booking. Confirm it in writing." },
    ],
  },
];

/** Only clients whose inventory is farmhouses publish this family. */
export function farmRentalEnabled(clientSlug: string | undefined | null): boolean {
  return inventoryNoun(clientSlug) === "farmhouse";
}

export function occasionBySlug(slug: string): RentalOccasion | undefined {
  return RENTAL_OCCASIONS.find((o) => o.slug === slug);
}

export function areaBySlug(slug: string): RentalArea | undefined {
  return RENTAL_AREAS.find((a) => a.slug === slug);
}

export function questionBySlug(slug: string): RentalQuestionPage | undefined {
  return RENTAL_QUESTIONS.find((q) => q.slug === slug);
}

/** `party-in-sohna` → the occasion and the area it names. */
export function parseOccasionAreaSlug(
  slug: string,
): { occasion: RentalOccasion; area: RentalArea } | null {
  // Occasion slugs themselves contain hyphens, so match against the known
  // lists rather than splitting on the separator.
  for (const occasion of RENTAL_OCCASIONS) {
    const prefix = `${occasion.slug}-in-`;
    if (!slug.startsWith(prefix)) continue;
    const area = areaBySlug(slug.slice(prefix.length));
    if (area) return { occasion, area };
  }
  return null;
}

export function budgetFromSlug(slug: string): number | null {
  const match = /^under-(\d+)$/.exec(slug);
  if (!match) return null;
  const value = Number(match[1]);
  return RENTAL_BUDGETS.includes(value) ? value : null;
}

/** Every slug in the family, for the sitemap and the hub's index. */
export function allRentalSlugs(): string[] {
  return [
    ...RENTAL_OCCASIONS.map((o) => o.slug),
    ...RENTAL_OCCASIONS.flatMap((o) => RENTAL_AREAS.map((a) => `${o.slug}-in-${a.slug}`)),
    ...RENTAL_BUDGETS.map((b) => `under-${b}`),
    ...RENTAL_QUESTIONS.map((q) => q.slug),
  ];
}

export function formatBudget(value: number): string {
  return value >= 100000 ? `₹${value / 100000} lakh` : `₹${(value / 1000).toFixed(0)},000`;
}

/**
 * Indicative day rates for letting a specific property, scaled off its plot
 * size.
 *
 * A listing page that only shows an asking price answers half the question in
 * this belt: the same property is bought for a crore figure and let for a day
 * rate, and buyers ask what it earns before they ask what it costs. The
 * occasion bands in `RENTAL_OCCASIONS` are quoted for a one-acre property, so
 * this scales them by the plot's own area and widens the band rather than
 * narrowing it — these are ranges to start a conversation from, not quotes,
 * and the page says so.
 *
 * Returns `null` when the plot area is unknown; an invented rate is worse
 * than no rate.
 */
const ONE_ACRE_SQFT = 43560;

export interface IndicativeRate {
  slug: string;
  label: string;
  low: number;
  high: number;
  capacity: string;
}

export function indicativeDayRates(
  areaSqft: number | null | undefined,
  occasionSlugs: string[] = ["party", "wedding", "day-outing", "night-stay"],
): IndicativeRate[] | null {
  if (!areaSqft || areaSqft <= 0) return null;

  // Rates do not scale linearly with land — a two-acre lawn does not let for
  // twice a one-acre lawn — so the square root keeps the curve sane, and the
  // result is clamped to the range the belt actually transacts in.
  const scale = Math.min(2.5, Math.max(0.5, Math.sqrt(areaSqft / ONE_ACRE_SQFT)));
  const round = (value: number) => {
    const step = value >= 100000 ? 25000 : value >= 25000 ? 5000 : 1000;
    return Math.max(step, Math.round(value / step) * step);
  };

  return occasionSlugs
    .map((slug) => occasionBySlug(slug))
    .filter((o): o is RentalOccasion => Boolean(o))
    .map((o) => ({
      slug: o.slug,
      label: o.label,
      low: round(o.budget[0] * scale),
      high: round(o.budget[1] * scale),
      capacity: o.capacity,
    }));
}
