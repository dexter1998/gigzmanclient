/**
 * The blog.
 *
 * Separate from `/updates`, which is short market notes seeded per client from
 * YAML. These are long, illustrated articles written once for the farmhouse
 * belt — the kind of page that answers a question well enough to be read and
 * cited, with real listings dropped into the middle of it rather than a bare
 * call to action at the end.
 *
 * A post is a list of blocks. `listings` is a block too, so where the property
 * row appears is an editorial decision made per article — after the reader has
 * been told what to look for, not before.
 */
import { inventoryNoun } from "@/lib/premium-v2/imagery";

const FARM = "/verticals/realestate/templates/premium-v2/farmhouses";

export type BlogBlock =
  | { type: "para"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "image"; src: string; caption: string }
  | {
      type: "listings";
      eyebrow: string;
      heading: string;
      blurb?: string;
      /** Matches `properties.locality`; falls back to the whole belt. */
      locality?: string;
    }
  | { type: "callout"; heading: string; text: string; href?: string; hrefLabel?: string };

export interface BlogPost {
  slug: string;
  title: string;
  /** Shown on the card and in the hero, one line. */
  standfirst: string;
  /** Search-facing description; kept under 160 characters. */
  description: string;
  category: "Renting" | "Buying" | "The belt" | "Paperwork";
  /** Absolute ISO date. Static, so it never claims to be today's. */
  published: string;
  readMinutes: number;
  hero: string;
  heroCaption: string;
  blocks: BlogBlock[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "farmhouse-near-delhi-ncr-for-party",
    title: "Farmhouse near Delhi NCR for a party: what it costs and what to check",
    standfirst:
      "The Sohna belt is the closest place to Delhi where you can put 100 people on a lawn without a banquet hall. Here is what that actually costs, and the four things that decide whether the evening works.",
    description:
      "What a farmhouse party near Delhi NCR costs in the Sohna belt, plus the sound, parking, power and catering questions to settle before you pay a token.",
    category: "Renting",
    published: "2026-09-12",
    readMinutes: 7,
    hero: `${FARM}/06-gurgaon-farmhouse.webp`,
    heroCaption: "A lawn set for an evening party in the Sohna belt, south of Gurugram",
    blocks: [
      {
        type: "para",
        text: "A farmhouse party in the Sohna belt costs somewhere between ₹15,000 and ₹60,000 for the day. That is a wide range for what sounds like the same thing, and the spread is not really about the property — it is about which day of the week you want, how many people are coming, and how much of the property the rate actually covers.",
      },
      {
        type: "para",
        text: "The belt starts where Gurugram's last sector ends. Sohna Road drops out of the city, the Aravalis close in, and the land opens into the farm pockets around Karnki, Bhondsi, Damdama and the Vatika estate beside The Westin. From South Delhi it is about an hour. From Cyber City, closer to forty minutes. That is near enough that guests will actually come on a weeknight, which is the whole reason this belt fills up.",
      },
      { type: "heading", text: "What the price depends on" },
      {
        type: "list",
        items: [
          "Day of the week. A Saturday in wedding season can be three times the same property on a Tuesday in July. Owners hold their Saturdays back until late.",
          "Guest count, because it decides staff, washrooms and parking rather than lawn space.",
          "Duration. A day slot is roughly 10am to 7pm; running past that is charged, and the rate for running over is rarely quoted up front.",
          "How much of the property is included. Plenty of day rates cover the lawn only — not the pool, not the indoor rooms, not the kitchen.",
        ],
      },
      {
        type: "callout",
        heading: "Ask for the rate and the exclusions in the same message",
        text: "Almost every dispute we see in this belt is about the second list, not the first. Security deposit, generator running charges, cleaning past the stated hours, extra staff above the agreed headcount — get all of it in writing before you pay a token.",
        href: "/farmhouse-rental/what-is-included-when-you-rent-a-farmhouse",
        hrefLabel: "The full included / excluded list",
      },
      { type: "heading", text: "The four things that decide whether the evening works" },
      {
        type: "para",
        text: "Sound comes first. Amplified outdoor sound is restricted after 10pm under the noise rules, and it is enforced here once a neighbour complains. A property that tells you \"music till late, no problem\" is telling you it has not been complained about yet, which is not the same thing. Plan for outdoor sound to stop at ten and move indoors after.",
      },
      {
        type: "para",
        text: "Parking is second, and it is the one people discover too late. Ask how many cars park on the property, not how many can be accommodated — the difference is usually a line of cars on a single-lane village road, which is how the complaint that ends the music starts.",
      },
      {
        type: "para",
        text: "Power is third. Ask what the generator carries, in writing. A generator sized for a house will not hold lighting, sound and air-conditioning at once, and it fails at exactly the moment the party is at its peak.",
      },
      {
        type: "para",
        text: "Catering is fourth. Most properties allow an outside caterer, some charge a kitchen or entry fee, and a few have an exclusive caterer whose rates you will not like. Ask before you shortlist, not after.",
      },
      {
        type: "image",
        src: `${FARM}/13-gurgaon-farmhouse.webp`,
        caption: "Pool depth and fencing are the two questions worth asking when children are coming",
      },
      {
        type: "listings",
        eyebrow: "On the belt",
        heading: "Properties we are working on",
        blurb: "Listed for sale, and several of them let out through us as well. If you have a date, tell us and we will say which of them is free.",
      },
      { type: "heading", text: "Which pocket to pick" },
      {
        type: "para",
        text: "For guests coming from Delhi in the evening, Bhondsi is the shortest drive and the easiest to describe over the phone. For a bigger, better-kept property with a maintained approach road, the Vatika estate beside The Westin is the safest choice and priced accordingly. For a group that wants the day to feel remote — trees, hills, a few degrees cooler — Damdama is worth the extra fifteen minutes.",
      },
      {
        type: "quote",
        text: "The plot choice matters more than the construction. Yield on a let-out farmhouse here depends almost entirely on the approach road and the distance from the Westin cluster.",
      },
      {
        type: "para",
        text: "If you are choosing between two properties at the same price, drive to both. Photographs in this belt are frequently a season out of date, and the approach road is the single thing they never show.",
      },
    ],
  },
  {
    slug: "farmhouse-wedding-near-gurgaon",
    title: "Planning a farmhouse wedding near Gurgaon: the belt, the budget, the booking",
    standfirst:
      "A farmhouse wedding is not a one-day booking. Here is what the Sohna belt charges for the full window, what a lawn has to be able to take, and the clauses worth getting in writing.",
    description:
      "What a farmhouse wedding near Gurgaon costs across the Sohna belt, how many days you are really booking, and the vendor, power and stay clauses to settle in advance.",
    category: "Renting",
    published: "2026-09-12",
    readMinutes: 8,
    hero: `${FARM}/02-gurgaon-farmhouse.webp`,
    heroCaption: "A farm lawn set for a wedding in the Sohna belt",
    blocks: [
      {
        type: "para",
        text: "The first thing to understand about a farmhouse wedding here is that you are not booking a day. You are booking the setup day before it, the wedding, and the morning after — and sometimes the haldi or mehendi as well. Rates quoted per day look reasonable right up until you add the other two, so agree the full window in writing before you talk about anything else.",
      },
      {
        type: "para",
        text: "Across the belt, a wedding-grade booking runs from about ₹1.25 lakh to well past ₹5 lakh for the window. What moves it is the lawn's capacity, whether there are rooms for the family to stay and change, and how much of the setup the property handles versus your vendors.",
      },
      { type: "heading", text: "What a wedding lawn actually has to take" },
      {
        type: "list",
        items: [
          "A mandap and dining laid out at the same time, without one blocking the other's access.",
          "Rooms for the family — to change, to keep things safe, and usually to stay the night.",
          "A generator sized for the lighting, not for a house. Ask what it carries, in writing.",
          "A vendor entry separate from the guest entry, so the caterer's trucks are not arriving through the baraat.",
        ],
      },
      {
        type: "image",
        src: `${FARM}/21-gurgaon-farmhouse.webp`,
        caption: "Vendor access separate from guest access is the difference between a smooth setup and a visible one",
      },
      { type: "heading", text: "Where in the belt" },
      {
        type: "para",
        text: "The Vatika estate beside The Westin Sohna Resort & Spa is the most straightforward answer for a wedding: gated, a maintained internal road, and a hotel next door for guests who will not stay on the property. Karnki, the village the estate stands on, has larger plots for the money with more variation in upkeep. Damdama, further towards the lake, is the choice when you want the Aravali backdrop and are willing to make guests drive fifteen minutes more for it.",
      },
      {
        type: "listings",
        eyebrow: "Sohna",
        heading: "Larger properties on the belt",
        blurb: "The properties we are working on at the moment. For a wedding date, call us rather than filling anything in — availability in season moves too fast for a form.",
        locality: "Sohna",
      },
      { type: "heading", text: "Clauses worth getting in writing" },
      {
        type: "para",
        text: "What happens if it rains, and whether there is a covered alternative or a refund. What the cancellation terms are, and by when. What the security deposit is and how long after the event it comes back. What the property charges if the event runs past the agreed hour. And who is responsible for clearing an event's worth of waste — basic cleaning is normally included, that is not.",
      },
      {
        type: "callout",
        heading: "Sound stops at ten, plan around it",
        text: "Amplified outdoor sound after 10pm is restricted and enforced here after complaints. Every well-run farmhouse wedding in this belt plans for the outdoor music to end at ten and the rest of the night to move indoors or down in volume.",
        href: "/farmhouse-rental/farmhouse-rental-rules-in-haryana",
        hrefLabel: "The rules that actually get enforced",
      },
      {
        type: "para",
        text: "Book early. The belt's good properties are taken for the whole season by late September, and what is left in November is what nobody else wanted.",
      },
    ],
  },
  {
    slug: "buying-a-farmhouse-in-sohna-what-to-check",
    title: "Buying a farmhouse in Sohna: the seven checks that decide whether it is yours",
    standfirst:
      "Farm land in this belt changes hands on revenue records, not RERA numbers. These are the seven things we check on every plot before we let a client anywhere near a token.",
    description:
      "The seven title, mutation, land-classification and access checks that decide whether a farmhouse purchase in the Sohna belt is safe — from the family that lives in the village.",
    category: "Paperwork",
    published: "2026-09-12",
    readMinutes: 9,
    hero: `${FARM}/20-gurgaon-farmhouse.webp`,
    heroCaption: "Farm land in the Sohna belt, south of Gurugram",
    blocks: [
      {
        type: "para",
        text: "If you have bought a flat in Gurugram, almost none of what you learned applies here. There is no RERA number to check, no promoter to hold to a completion date, and no society to take over the common areas. Farm land changes hands through revenue records, mutations and family partitions that never appear on a property portal — and when a listing looks cheap, the reason is usually in the village rather than in the paperwork.",
      },
      { type: "heading", text: "The seven checks" },
      {
        type: "list",
        items: [
          "Jamabandi and the ownership chain, read at the Tehsil — not a photocopy the seller supplies.",
          "Mutation (intkaal) status, and whether every co-sharer has actually consented. A partition where one sibling has not signed is the most common problem in this belt.",
          "Land classification: cultivable, banjar or gair-mumkin — and what each permits you to build.",
          "The approach road. A recorded rasta is a road; a track across someone else's field is a dispute waiting for the day you start construction.",
          "Registered right of way, boundary demarcation, and the measured area against what the record says.",
          "Litigation, mortgage, acquisition notice and HSVP or NHAI alignment against the khasra number.",
          "Circle rate against asking price, so you know the stamp duty and registry cost you will actually pay.",
        ],
      },
      {
        type: "quote",
        text: "When a listing looks cheap, there is usually a reason, and the reason is usually in the village, not in the paperwork.",
      },
      {
        type: "image",
        src: `${FARM}/09-gurgaon-farmhouse.webp`,
        caption: "A built farmhouse on an acre — but the checks that matter are on the land beneath it",
      },
      { type: "heading", text: "Why the village matters more than the file" },
      {
        type: "para",
        text: "Our family has been in Karnki for three generations, and Hasan Khan is the sarpanch of the village the Westin farm estate stands on. That is not a marketing line — it is the reason this list is longer than a broker's. On most plots in this belt we can tell you who owned it before the person selling it to you, which co-sharers exist, and whether the boundary the seller is showing you is the boundary in the record.",
      },
      {
        type: "listings",
        eyebrow: "Currently listed",
        heading: "Farmhouses and plots on the belt",
        blurb: "Plot area, ownership type and asking price are shown plainly on every listing. Ask us for the revenue record on any of them before you visit.",
      },
      { type: "heading", text: "What to do before you pay a token" },
      {
        type: "para",
        text: "Walk the plot with the record in your hand. Confirm the approach road exists on paper, not just on the ground. Get every co-sharer's name and check that each one has signed. And do not pay a token on the strength of photographs — in this belt they are frequently a season out of date, and they never show the road.",
      },
      {
        type: "callout",
        heading: "We will read the record with you",
        text: "Bring us a khasra number and we will tell you what the jamabandi says about it before you spend anything. It costs you nothing and it is the fastest way to rule out the plots that were never going to work.",
        href: "/contact",
        hrefLabel: "Send us a khasra number",
      },
    ],
  },
  {
    slug: "farmhouse-for-day-outing-near-gurgaon",
    title: "Farmhouse for a day outing near Gurgaon: the cheapest way into the belt",
    standfirst:
      "Day bookings run roughly 10am to 7pm and start around ₹8,000. The catch is what the day rate excludes — and it is usually the two things you came for.",
    description:
      "What a farmhouse day outing near Gurgaon costs, what the day rate typically excludes, and which pocket of the Sohna belt suits a short visit.",
    category: "Renting",
    published: "2026-09-12",
    readMinutes: 5,
    hero: `${FARM}/17-gurgaon-farmhouse.webp`,
    heroCaption: "A day booking on a one-acre property in the Sohna belt",
    blocks: [
      {
        type: "para",
        text: "A day outing is the cheapest way to use a farmhouse in this belt. Rates start around ₹8,000 on a weekday and run to about ₹30,000 for a well-kept one-acre property on a weekend. For a group of ten to sixty people it is a better afternoon than any restaurant in Gurugram at the same money.",
      },
      { type: "heading", text: "What a day rate often does not include" },
      {
        type: "para",
        text: "This is where day bookings go wrong. Plenty of day rates cover the lawn and nothing else. The pool is charged separately or not available at all. The indoor rooms are locked. The kitchen is off limits even though outside catering is allowed. Ask for the list of what is included in writing, and ask about the pool and the kitchen by name.",
      },
      {
        type: "list",
        items: [
          "Pool access, and whether cleaning is included or billed on top.",
          "Indoor rooms — for the middle of the day and for if the weather turns.",
          "Kitchen use, as distinct from permission to bring a caterer.",
          "The in and out times, and what running over costs.",
        ],
      },
      {
        type: "image",
        src: `${FARM}/08-gurgaon-farmhouse.webp`,
        caption: "Real shade matters more on a day booking than anything in the listing photographs",
      },
      {
        type: "listings",
        eyebrow: "On the belt",
        heading: "What is currently listed",
        blurb: "Tell us your date and group size and we will come back with what is free.",
      },
      { type: "heading", text: "Which pocket for a short visit" },
      {
        type: "para",
        text: "For a day outing the drive matters more than for anything else, because you are spending a smaller share of the day at the property. Bhondsi is the shortest run from the city, about twenty minutes from Golf Course Extension Road. Sohna Road is quicker still but the properties sit closer to traffic. If the group is coming from Delhi's west or the airport side, Manesar makes more sense than Sohna does.",
      },
    ],
  },
];

export function blogEnabled(clientSlug: string | undefined | null): boolean {
  return inventoryNoun(clientSlug) === "farmhouse";
}

export function postBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

/** Newest first, which is the order the index shows them in. */
export function sortedPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published));
}

export function relatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = postBySlug(slug);
  if (!current) return sortedPosts().slice(0, limit);
  const sameCategory = sortedPosts().filter(
    (post) => post.slug !== slug && post.category === current.category,
  );
  const rest = sortedPosts().filter(
    (post) => post.slug !== slug && post.category !== current.category,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}
