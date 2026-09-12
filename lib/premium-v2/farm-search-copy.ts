/**
 * Titles, headings and body copy for the `/farmhouse/{slug}` family.
 *
 * Kept out of the page component because the component is one file serving
 * eight page shapes, and mixing the layout with eight copy variants makes
 * both unreadable. Everything here is a pure function of the resolved page
 * plus the market data behind it — no invented figures.
 */
import {
  BELT_STATS,
  acres,
  crore,
  estatesOf,
  facetCount,
  perSqft,
  statsFor,
  type FarmPage,
  type Geo,
  type MarketStats,
} from "@/lib/premium-v2/farm-search";
import { pocketsNear } from "@/lib/premium-v2/farm-geo";

export interface PageCopy {
  /** Browser title, without the firm name. */
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  /** Two or three sentences under the h1, all of them true of this page. */
  intro: string;
  /** Section heading above the "what the data shows" band. */
  dataHeading: string;
  /** Paragraphs of the body, in order. */
  body: string[];
  faqs: { q: string; a: string }[];
}

const where = (geo?: Geo) => (geo ? geo.name : "the Sohna belt");
const stats = (geo?: Geo): MarketStats => geo?.stats ?? BELT_STATS;

/** "Figures here are the four pockets this road runs through." */
function sourceLine(geo?: Geo): string {
  if (!geo || geo.kind === "village" || geo.sources.length === 0) return "";
  const names = geo.sources.map((v) => `${v.name} (${v.listings})`).join(", ");
  return geo.kind === "road"
    ? `No listing is filed against the road itself — these figures are the pockets it runs through: ${names}.`
    : `We hold no listing in ${geo.name} today. These figures are the pockets next to it: ${names}.`;
}

/** "306 listings, median ₹4 Cr on 0.5 acre, about ₹1,574/sq ft." */
function factLine(s: MarketStats, name: string): string {
  return `${name} carries ${s.listings} ${s.listings === 1 ? "listing" : "listings"} in our data, with a median asking price of ${crore(s.medianPrice)} on a median plot of ${acres(s.medianArea)} — roughly ${perSqft(s.medianPerSqft)}.`;
}

/** How the belt compares, so a village page is not a number in isolation. */
function versusBelt(s: MarketStats): string {
  if (!s.medianPerSqft || !BELT_STATS.medianPerSqft) return "";
  const diff = Math.round(((s.medianPerSqft - BELT_STATS.medianPerSqft) / BELT_STATS.medianPerSqft) * 100);
  if (Math.abs(diff) < 8) return "That is about the belt's own median, so you are paying the going rate here rather than a premium or a discount.";
  return diff > 0
    ? `That is roughly ${diff}% above the belt's median of ${perSqft(BELT_STATS.medianPerSqft)} — this pocket prices at a premium, and it is worth knowing what you are paying it for.`
    : `That is roughly ${Math.abs(diff)}% below the belt's median of ${perSqft(BELT_STATS.medianPerSqft)}. Cheaper per square foot is not automatically better value on farm land; check the approach road and the land classification before you conclude it is.`;
}

const DISCLAIMER =
  "Figures are asking prices from listing data on the belt, not transacted rates or a valuation.";

export function copyFor(page: FarmPage): PageCopy {
  switch (page.kind) {
    // ── Village overview and its three intent variants ──────────────
    case "geo": {
      const { geo, intent } = page;
      const s = geo.stats;
      const noun = intent.noun;
      const title =
        intent.slug === "for-rent"
          ? `${noun} in ${geo.name}, Gurgaon`
          : `${noun} in ${geo.name}, Gurgaon — ${s.listings} listings`;
      return {
        title,
        description: `${noun} in ${geo.name}: ${s.listings} listings, median asking ${crore(s.medianPrice)} on ${acres(s.medianArea)}. Plot sizes, ownership and price per sq ft set out plainly.`,
        eyebrow: `${geo.name} · Sohna belt`,
        h1: `${noun} in ${geo.name}`,
        intro: intent.blurb,
        dataHeading: `What ${geo.name} looks like right now`,
        body: [
          factLine(s, geo.name),
          versusBelt(s),
          sourceLine(geo),
          estatesOf(geo).length > 0
            ? `Most of what trades here sits inside ${estatesOf(geo)
                .slice(0, 2)
                .map(([name, count]) => `${name} (${count})`)
                .join(" and ")}, so the estate's own approach road and upkeep matter as much as the individual plot.`
            : "Inventory here is spread across individual holdings rather than concentrated in one estate, so each plot's approach road and boundary have to be checked on their own.",
          s.ownership.length > 0
            ? `Ownership on these listings runs ${s.ownership
                .map(([kind, count]) => `${count} ${kind.toLowerCase()}`)
                .join(", ")}. Anything other than freehold changes what you are actually buying, and is the first thing we read on the record.`
            : "",
          intent.slug === "farm-land"
            ? "On bare land the classification decides what you may build. Cultivable, banjar and gair-mumkin are three different purchases, and the seller's description is not the record."
            : intent.slug === "for-rent"
              ? "Letting in this belt happens by the day for events far more than on an annual tenancy. What a property earns depends mostly on its approach road and its distance from the Westin cluster."
              : "",
        ].filter(Boolean),
        faqs: [
          {
            q: `What does a farmhouse in ${geo.name} cost?`,
            a: `Asking prices on the ${s.listings} current ${s.listings === 1 ? "listing" : "listings"} run from ${crore(s.minPrice)} to ${crore(s.maxPrice)}, with a median of ${crore(s.medianPrice)}. ${DISCLAIMER}`,
          },
          {
            q: `What plot size is normal in ${geo.name}?`,
            a: `The median plot here is ${acres(s.medianArea)}. The belt as a whole medians ${acres(BELT_STATS.medianArea)}, so ${geo.name} runs ${(s.medianArea ?? 0) >= (BELT_STATS.medianArea ?? 0) ? "at or above" : "below"} the typical size.`,
          },
          {
            q: `Is the land in ${geo.name} freehold?`,
            a: s.ownership.length
              ? `On these listings, ${s.ownership.map(([k, c]) => `${c} ${k.toLowerCase()}`).join(", ")}. We read the jamabandi at the Tehsil before recommending any of them — a power of attorney is not ownership.`
              : "Ownership type is not stated on every listing here. We read the jamabandi at the Tehsil before recommending any plot.",
          },
          {
            q: `How far is ${geo.name} from Delhi?`,
            a: "Roughly an hour from South Delhi and forty minutes from Cyber City on the Sohna elevated corridor, traffic permitting.",
          },
        ],
      };
    }

    // ── Plot size ───────────────────────────────────────────────────
    case "size": {
      const { size, geo: village, land } = page;
      const s = stats(village);
      const subject = land ? "farm land" : "farmhouses";
      const place = where(village);
      return {
        title: `${size.label} ${subject} in ${place}`,
        description: `${size.label} ${subject} in ${place} — what that size costs here, what it is big enough for, and what to check before you buy it.`,
        eyebrow: `${size.label} · ${place}`,
        h1: `${size.label} ${subject} in ${place}`,
        intro: `At ${perSqft(s.medianPerSqft)} — the median rate in ${place} — a ${size.label.toLowerCase()} plot works out at roughly ${crore(Math.round(((size.min + size.max) / 2) * (s.medianPerSqft ?? 0)))} before anything is built on it.`,
        dataHeading: `${size.label} in ${place}`,
        body: [
          factLine(s, place === "the Sohna belt" ? "The belt" : place),
          sizeGuidance(size.slug),
          land
            ? "Bare land at this size is bought either to build on or to hold. Both need the same checks — jamabandi, mutation, land classification and a recorded approach road — but only the first needs the plot to be a shape you can actually build on, so walk it before you decide."
            : "At this size the question is usually what is already built on the plot and whether it is worth keeping. A structure that has to come down is a cost, not an inclusion.",
          versusBelt(s),
        ].filter(Boolean),
        faqs: [
          {
            q: `What does ${size.label.toLowerCase()} cost in ${place}?`,
            a: `At the local median of ${perSqft(s.medianPerSqft)}, roughly ${crore(Math.round(size.min * (s.medianPerSqft ?? 0)))} to ${crore(Math.round(size.max * (s.medianPerSqft ?? 0)))} for the land. Built property sits above that. ${DISCLAIMER}`,
          },
          { q: "How many square feet is that?", a: `${size.min.toLocaleString("en-IN")}–${size.max.toLocaleString("en-IN")} sq ft, which is how the listings measure it. In square yards, divide by nine.` },
          {
            q: `Is ${size.label.toLowerCase()} the common size here?`,
            a: `The median plot in ${place} is ${acres(s.medianArea)}, so ${size.label.toLowerCase()} sits ${(size.min + size.max) / 2 >= (s.medianArea ?? 0) ? "at or above" : "below"} the local norm.`,
          },
        ],
      };
    }

    // ── Budget ──────────────────────────────────────────────────────
    case "budget": {
      const { budget, geo: village, land } = page;
      const s = stats(village);
      const place = where(village);
      const affordableArea = s.medianPerSqft ? Math.round(budget.max / s.medianPerSqft) : null;
      return {
        title: `Farmhouses ${budget.label.toLowerCase()} in ${place}`,
        description: `What ${budget.label.toLowerCase()} buys in ${place} — plot size at the local rate, which pockets it stretches to, and what still sits outside the number.`,
        eyebrow: `${budget.label} · ${place}`,
        h1: `Farmhouses ${budget.label.toLowerCase()} in ${place}`,
        intro:
          budget.slug === "above-15-crore"
            ? `Above ₹15 Cr in ${place} you are buying either several acres or a fully built estate, and the constraint stops being money and starts being what is actually available.`
            : affordableArea
              ? `At ${place}'s median of ${perSqft(s.medianPerSqft)}, ${budget.label.toLowerCase()} is about ${acres(affordableArea)} of land before construction.`
              : `What ${budget.label.toLowerCase()} reaches in ${place}, at the rates the current listings ask.`,
        dataHeading: `${budget.label} against the ${place} market`,
        body: [
          factLine(s, place === "the Sohna belt" ? "The belt" : place),
          budget.max < (s.medianPrice ?? 0)
            ? `That median sits above this budget, so at ${budget.label.toLowerCase()} you are shopping the lower half of ${place} — smaller plots, further from the maintained estates, or land rather than a built house.`
            : `That median sits inside this budget, so ${budget.label.toLowerCase()} reaches most of what ${place} currently has listed.`,
          "Two costs are outside the asking price and are routinely underestimated: stamp duty and registry on the circle-rate value, and the cost of making bare land usable — boundary wall, borewell, power connection and an approach that a car can get down in July.",
          versusBelt(s),
        ].filter(Boolean),
        faqs: [
          {
            q: `Can I buy a farmhouse ${budget.label.toLowerCase()} in ${place}?`,
            a: `Asking prices here run ${crore(s.minPrice)} to ${crore(s.maxPrice)}. ${budget.max >= (s.minPrice ?? 0) ? "So yes, at the lower end of what is listed." : "Not at present on these listings — the cheapest is " + crore(s.minPrice) + "."} ${DISCLAIMER}`,
          },
          { q: "What is left out of the asking price?", a: "Stamp duty and registry charges, calculated on the circle-rate value; brokerage where applicable; and development cost on bare land. Budget for those separately." },
          { q: "Do prices move much by season?", a: "Land here moves with infrastructure news — the Delhi–Mumbai Expressway interchange and the Sohna elevated corridor — rather than with the season. Built-property rents are seasonal; land prices are not." },
        ],
      };
    }

    // ── Configuration ───────────────────────────────────────────────
    case "bhk": {
      const { bhk, geo: village } = page;
      const s = stats(village);
      const place = where(village);
      const count = facetCount(page);
      return {
        title: `${bhk} BHK farmhouses in ${place}`,
        description: `${bhk} BHK farmhouses in ${place} — ${count.matched} of ${count.scope} current listings, with plot sizes, asking prices and what that configuration means on a farm plot.`,
        eyebrow: `${bhk} BHK · ${place}`,
        h1: `${bhk} BHK farmhouses in ${place}`,
        intro:
          count.matched > 0
            ? `${count.matched} of ${place}'s ${count.scope} listings are ${bhk} BHK.`
            : `None of ${place}'s ${count.scope} current listings is ${bhk} BHK — what is available here is set out below, so you can see whether the configuration exists in this pocket at all.`,
        dataHeading: `Configurations available in ${place}`,
        body: [
          factLine(s, place === "the Sohna belt" ? "The belt" : place),
          s.bedrooms.length
            ? `By configuration, these listings run ${s.bedrooms
                .slice(0, 5)
                .map(([value, n]) => `${n} × ${value} BHK`)
                .join(", ")}.`
            : "",
          "On a farm plot the bedroom count says less than it does in a flat. A one-acre plot with a single-bedroom structure is bought for the land; a six-bedroom estate on the same acre is bought as a house. Read the plot size and the bedroom count together, never separately.",
          versusBelt(s),
        ].filter(Boolean),
        faqs: [
          {
            q: `Are there ${bhk} BHK farmhouses in ${place}?`,
            a:
              count.matched > 0
                ? `Yes — ${count.matched} of the ${count.scope} listings we track here. Availability changes weekly, so ask us before you plan a visit.`
                : `Not among the ${count.scope} listings we currently track here. The belt as a whole does have them, and we can tell you which pocket.`,
          },
          { q: "What plot size does that usually come with?", a: `The median plot in ${place} is ${acres(s.medianArea)}, and configuration does not track plot size closely in this belt — a large plot with a small structure is common.` },
          { q: "Can we add rooms later?", a: "On agricultural land what you may build is set by the land's classification and the local rules, not by what the neighbour has built. Check it before you buy on the assumption you can extend." },
        ],
      };
    }

    // ── Orientation ─────────────────────────────────────────────────
    case "facing": {
      const { facing, geo: village } = page;
      const s = stats(village);
      const place = where(village);
      const count = facetCount(page);
      return {
        title: `${facing.label}-facing farmhouses in ${place}`,
        description: `${facing.label}-facing plots in ${place} — ${count.matched} of ${count.scope} listings, and what orientation actually changes on a farm plot.`,
        eyebrow: `${facing.label} facing · ${place}`,
        h1: `${facing.label}-facing farmhouses in ${place}`,
        intro:
          count.matched > 0
            ? `${count.matched} of ${place}'s ${count.scope} listings state a ${facing.label.toLowerCase()} aspect.`
            : `No current listing in ${place} states a ${facing.label.toLowerCase()} aspect. What the ${count.scope} listings here do state is set out below.`,
        dataHeading: `Orientation across ${place}`,
        body: [
          s.facings.length
            ? `By stated aspect, ${place}'s listings run ${s.facings
                .slice(0, 5)
                .map(([value, n]) => `${n} ${value.toLowerCase()}`)
                .join(", ")}.`
            : "Aspect is not stated on most listings in this pocket.",
          "On a plot rather than a flat, orientation changes two practical things before it changes anything else: which side takes the afternoon sun, and where the approach road meets the boundary. Both decide where a house can sensibly sit.",
          "Aspect on these listings is what the seller stated, not something we have verified with a compass on site. We check it on the visit.",
          factLine(s, place === "the Sohna belt" ? "The belt" : place),
        ].filter(Boolean),
        faqs: [
          { q: `Does ${facing.label.toLowerCase()} facing cost more here?`, a: "North and east aspects carry a modest premium in this belt when everything else is equal, but plot access and land classification move the price far more than orientation does." },
          { q: "Is the stated aspect reliable?", a: "It is the seller's description. We confirm it on site, and it is worth confirming — the entry side of a farm plot and the compass direction are frequently confused in listings." },
          { q: "Does Vaastu apply to bare land?", a: "The traditional guidance for a plot is about shape, slope and entry rather than rooms. On land, plot shape and the position of the approach matter most." },
        ],
      };
    }

    // ── Feature ─────────────────────────────────────────────────────
    case "feature": {
      const { feature, geo: village } = page;
      const s = stats(village);
      const place = where(village);
      const count = facetCount(page);
      return {
        title: `Farmhouses ${feature.label} in ${place}`,
        description: `Farmhouses ${feature.label} in ${place} — ${count.matched} of ${count.scope} listings, and what to check before you take the description at face value.`,
        eyebrow: `${place} · filtered`,
        h1: `Farmhouses ${feature.label} in ${place}`,
        intro:
          count.matched > 0
            ? `${count.matched} of ${place}'s ${count.scope} listings say so.`
            : `None of ${place}'s ${count.scope} current listings states this. The rest of what is here is below.`,
        dataHeading: `${place}, filtered`,
        body: [
          feature.note,
          factLine(s, place === "the Sohna belt" ? "The belt" : place),
          `Across ${place}'s listings: ${s.pool} state a pool, ${s.gated} a gated estate, ${s.park} park facing, ${s.corner} a corner plot, and ${s.readyToMove} are described as ready to move.`,
          "Every one of those is the seller's description. We confirm them on the site visit, and photograph what we find rather than reusing the listing's pictures.",
        ].filter(Boolean),
        faqs: [
          { q: `Are these verified?`, a: "No — they are what the listing states. We check them in person before recommending a property, and tell you where the description and the plot disagree." },
          { q: "Does it add to the price?", a: "A pool and a gated approach both do, measurably. Corner and park facing add less than sellers usually ask for them." },
          { q: "Can it be added later?", a: "A pool and landscaping can. A gated approach and a park frontage cannot — those are decided by where the plot is." },
        ],
      };
    }

    // ── Near a landmark ─────────────────────────────────────────────
    case "landmark": {
      const { landmark } = page;
      const near = pocketsNear(landmark.lat, landmark.lng, 5);
      const s = statsFor(page);
      return {
        title: `Farmhouses near ${landmark.name}`,
        description: `Farmhouses and farm land near ${landmark.name} — the ${near.length} closest pockets, what each asks, and how far out you have to go for the price to change.`,
        eyebrow: `Near ${landmark.name}`,
        h1: `Farmhouses near ${landmark.name}`,
        intro: landmark.note,
        dataHeading: `The pockets closest to ${landmark.name}`,
        body: [
          near.length
            ? `The nearest pockets we hold listings in are ${near
                .map((n) => `${n.village.name} (${n.km} km, ${n.village.listings} ${n.village.listings === 1 ? "listing" : "listings"})`)
                .join(", ")}.`
            : "",
          factLine(s, `Those pockets together`),
          "Nothing is filed against a landmark, so these are the figures of the pockets around it rather than of the landmark itself — which is also how you should read any portal page that offers you the same thing.",
          "Distance is the axis people underestimate. Fifteen minutes further out is a different property at the same money, and a different property to persuade guests to visit.",
        ].filter(Boolean),
        faqs: [
          {
            q: `Are there farmhouses near ${landmark.name}?`,
            a: near.length
              ? `The closest pocket with live inventory is ${near[0].village.name}, about ${near[0].km} km away, with ${near[0].village.listings} ${near[0].village.listings === 1 ? "listing" : "listings"}. ${DISCLAIMER}`
              : `Not in our current data. Ask us and we will tell you what is closest.`,
          },
          {
            q: "What do they cost?",
            a: `Across those pockets the median asking price is ${crore(s.medianPrice)} on a median plot of ${acres(s.medianArea)} — about ${perSqft(s.medianPerSqft)}.`,
          },
          { q: "How far is it from Delhi?", a: landmark.note },
        ],
      };
    }

    // ── Luxury ──────────────────────────────────────────────────────
    case "luxury": {
      const village = page.geo;
      const s = stats(village);
      const place = where(village);
      const top = s.maxPrice;
      return {
        title: `Luxury farmhouses in ${place}`,
        description: `Luxury farmhouses in ${place} — where the top of the market actually sits, what separates it from the rest, and what ${crore(top)} buys here.`,
        eyebrow: `Luxury · ${place}`,
        h1: `Luxury farmhouses in ${place}`,
        intro: `The top of the ${place} market currently asks ${crore(top)}, against a median of ${crore(s.medianPrice)}. What separates the two is rarely the house.`,
        dataHeading: `The top of the ${place} market`,
        body: [
          factLine(s, place === "the Sohna belt" ? "The belt" : place),
          sourceLine(village),
          "At the top of this belt you are paying for three things in this order: a maintained, gated approach; plot size and the shape of it; and only then what is built. A ₹15 Cr property on a bad approach road resells like an ₹8 Cr one.",
          `Of these listings ${s.gated} describe a gated estate, ${s.pool} a pool and ${s.readyToMove} are ready to move. Those are the seller's descriptions — we confirm them on the visit.`,
          versusBelt(s),
        ].filter(Boolean),
        faqs: [
          { q: `What is the most expensive farmhouse in ${place}?`, a: `The highest current asking price we track here is ${crore(top)}. ${DISCLAIMER}` },
          { q: "What makes one luxury and another not?", a: "Approach road, gate and plot shape first; construction quality second. In this belt the land decides the price far more than the building on it." },
          { q: "Are these ready to move?", a: `${s.readyToMove} of ${s.listings} are described as ready to move. The rest are plots or part-built.` },
        ],
      };
    }

    // ── Owner-direct ────────────────────────────────────────────────
    case "owner": {
      const village = page.geo;
      const s = stats(village);
      const place = where(village);
      const freehold = s.ownership.find(([k]) => /freehold/i.test(k))?.[1] ?? 0;
      return {
        title: `Owner-direct farmhouses in ${place}`,
        description: `Buying a farmhouse in ${place} direct from the owner — what it actually saves, what it does not, and how to check the seller is the owner.`,
        eyebrow: `Owner direct · ${place}`,
        h1: `Farmhouses in ${place}, direct from the owner`,
        intro:
          "Most of what we source in this belt comes from owners we already know, before it reaches a portal. That is worth something — but not what people usually think it is worth.",
        dataHeading: `Owner-direct in ${place}`,
        body: [
          factLine(s, place === "the Sohna belt" ? "The belt" : place),
          sourceLine(village),
          `Of these listings ${freehold} state freehold title. Freehold is not the same as owner-direct, and neither is the same as the seller being on the record — a power of attorney holder can be none of the three.`,
          "What going direct saves is one commission in the chain, not the price of the land: an owner who knows what the pocket asks does not discount because you came without an agent. What it costs you is the diligence a good agent would have done, which on farm land is the expensive part.",
          "Before you pay a token to anyone calling themselves the owner: read the jamabandi at the Tehsil, check every co-sharer has signed, and confirm the mutation. We do all three whether you buy through us or not.",
        ].filter(Boolean),
        faqs: [
          { q: "Is buying direct cheaper?", a: "It removes one commission from the chain. It does not move the asking price, and it moves the risk onto you." },
          { q: "How do I know the seller is the owner?", a: "The jamabandi at the Tehsil, not the file they hand you. Ask for the khasra number and check it yourself, or send it to us." },
          { q: "Do you charge if we go direct?", a: "We tell you our fee before you visit anything. If you want only the record read, ask — it costs you nothing." },
        ],
      };
    }

    // ── Two pockets compared ────────────────────────────────────────
    case "compare": {
      const { a, b } = page;
      const cheaper = (a.medianPerSqft ?? 0) <= (b.medianPerSqft ?? 0) ? a : b;
      const dearer = cheaper === a ? b : a;
      return {
        title: `${a.name} vs ${b.name}: which to buy a farmhouse in`,
        description: `${a.name} and ${b.name} compared on listing count, median asking price, plot size and price per sq ft — with what the numbers do not tell you.`,
        eyebrow: "Pocket comparison",
        h1: `${a.name} vs ${b.name}`,
        intro: `${cheaper.name} asks ${perSqft(cheaper.medianPerSqft)} against ${dearer.name}'s ${perSqft(dearer.medianPerSqft)}. That gap is the whole question, and the answer is rarely just "buy the cheaper one".`,
        dataHeading: "Side by side",
        body: [
          factLine(a, a.name),
          factLine(b, b.name),
          `On depth of choice, ${a.listings >= b.listings ? a.name : b.name} has more listed — ${Math.max(a.listings, b.listings)} against ${Math.min(a.listings, b.listings)} — which matters more than it sounds. A pocket with two listings gives you no negotiating position at all.`,
          "What the numbers do not tell you is the approach road, whether the surrounding plots are built or empty, and how the village itself is placed. Those decide resale, and we can only tell you them in person.",
        ],
        faqs: [
          { q: `Which is cheaper, ${a.name} or ${b.name}?`, a: `${cheaper.name}, at ${perSqft(cheaper.medianPerSqft)} against ${perSqft(dearer.medianPerSqft)}. ${DISCLAIMER}` },
          { q: "Which has more choice?", a: `${a.listings >= b.listings ? a.name : b.name}, with ${Math.max(a.listings, b.listings)} listings against ${Math.min(a.listings, b.listings)}.` },
          { q: "Which appreciates faster?", a: "Neither number above answers that. Appreciation in this belt follows infrastructure — the expressway interchange and the elevated corridor — not the current asking price. Ask us what has actually changed hands nearby." },
        ],
      };
    }
  }
}

/** What a plot of this size is actually good for, said once per size. */
function sizeGuidance(slug: string): string {
  switch (slug) {
    case "500-sq-yd":
      return "At this size you are buying a weekend house rather than land — enough for a structure, a small lawn and parking, and not much else. It is the cheapest way into the belt and the hardest to resell to a buyer who wants space.";
    case "1000-sq-yd":
      return "Enough for a house, a lawn that takes forty people and a pool if you want one. This is the size most families actually use, as against the size they first ask for.";
    case "2000-sq-yd":
      return "Just under half an acre. A house, a full lawn, an orchard strip and staff quarters fit comfortably, and it is still small enough to maintain without a full-time gardener.";
    case "half-acre":
      return "The belt's median plot. Big enough to host properly and small enough that upkeep does not become a second job — which is why so much of the inventory sits at this size.";
    case "4000-sq-yd":
      return "Close to an acre without paying for one. Suits a buyer who wants event capacity but not the maintenance of a full acre of lawn.";
    case "1-acre":
      return "The size the belt is priced around, and what most people picture when they say farmhouse. A full lawn, a pool, an orchard and a house, with room between them.";
    case "1-5-acre":
      return "Past the point where you can maintain it casually. Worth it if you are letting the property for events, where lawn capacity is what you are selling.";
    case "2-acre":
      return "Event-grade. Two acres takes a wedding with parking on the property, which is the threshold at which letting income becomes serious rather than incidental.";
    case "3-acre":
      return "Estate scale. At this size the purchase is usually part land bank, part house, and the paperwork almost always involves multiple khasra numbers and multiple co-sharers.";
    case "5-acre":
      return "Land-bank scale. Rarely a single clean holding — expect several khasra numbers, several sellers, and a longer diligence than any built property will ever need.";
    default:
      return "";
  }
}
