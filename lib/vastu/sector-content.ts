/**
 * Copy for the Gurugram sector vastu pages.
 *
 * A sector page is only worth publishing if it says something the generic
 * direction page does not. Two things do that work here: the sector's own
 * character line, and the live corridor row it maps to — price, appreciation
 * and rental yield come from the tenant's seeded locality data, so the page
 * carries real local numbers rather than the same paragraph with a number
 * swapped in. Where no corridor row exists, the market lines are omitted
 * entirely rather than filled with an invented figure.
 */

import type { localities } from "@/lib/db/schema";
import { findDirection, findRoom, type Direction, type RoomDef } from "@/lib/vastu";
import type { Sector, SectorAspect, PropertyContext } from "./sectors";

type Locality = typeof localities.$inferSelect;

export interface SectorMarket {
  corridorName: string;
  pricePerSqft: number | null;
  yoyPercent: number | null;
  rentalYieldPercent: number | null;
  bestFor: string | null;
}

export function marketFor(sector: Sector, rows: Locality[]): SectorMarket | null {
  const row = rows.find((l) => l.slug === sector.corridorSlug);
  if (!row) return null;
  return {
    corridorName: row.name,
    pricePerSqft: row.avgPricePerSqft ?? null,
    yoyPercent: row.yoyChangePercent ?? null,
    rentalYieldPercent: row.rentalYieldPercent ?? null,
    bestFor: row.bestFor ?? null,
  };
}

/**
 * Corridor figures are working averages, not per-sector valuations, and the
 * same row feeds every sector on that corridor. Both facts are stated in the
 * sentence itself rather than only in a footnote, because a reader who sees
 * "₹18,500 in Sector 54" and "₹18,500 in DLF Phase 5" should be told why they
 * match instead of concluding we measured each one.
 */
export const MARKET_PROVENANCE =
  "Corridor figures are indicative working averages across that corridor, not a valuation of this sector, and are not independently verified. Ask us for the recent transacted range in a specific project before you rely on a number.";

/** One sentence of genuinely local context, or null when we have no data. */
export function marketLine(m: SectorMarket | null): string | null {
  if (!m) return null;
  const parts: string[] = [];
  if (m.pricePerSqft) parts.push(`around ₹${m.pricePerSqft.toLocaleString("en-IN")} per square foot`);
  if (m.yoyPercent != null) parts.push(`${m.yoyPercent > 0 ? "up" : "down"} ${Math.abs(m.yoyPercent).toFixed(1)}% year on year`);
  if (m.rentalYieldPercent != null) parts.push(`renting at about ${m.rentalYieldPercent.toFixed(1)}% gross yield`);
  if (!parts.length) return null;
  return `It sits on the ${m.corridorName} corridor, which averages ${parts.join(", ")} — a corridor-wide working figure rather than a reading for this sector alone.`;
}

export function sectorHeading(sector: Sector, aspect: SectorAspect | null): string {
  if (!aspect) return `Vastu in ${sector.name}, Gurugram`;
  switch (aspect.kind) {
    case "direction": {
      const d = findDirection(aspect.slug)!;
      return `${d.name} Facing Properties in ${sector.name}`;
    }
    case "propertyType":
      return `${aspect.context.label} Vastu in ${sector.name}`;
    case "room": {
      const r = findRoom(aspect.slug)!;
      return `${r.name} Vastu in ${sector.name}`;
    }
  }
}

export function sectorIntro(
  sector: Sector,
  aspect: SectorAspect | null,
  m: SectorMarket | null,
): string {
  const local = marketLine(m);
  const base = `${sector.name} is ${sector.character}.${local ? ` ${local}` : ""}`;

  if (!aspect) {
    return `${base} What follows is what the vastu tradition suggests for property here, and — more usefully — how much of it you can actually act on given what is built in this sector.`;
  }
  switch (aspect.kind) {
    case "direction": {
      const d = findDirection(aspect.slug)!;
      return `${base} ${d.summary} How much the facing is worth paying for depends on what is available here, which is covered below.`;
    }
    case "propertyType":
      return `${base} ${typeNote(aspect.context)}`;
    case "room": {
      const r = findRoom(aspect.slug)!;
      return `${base} ${r.guidance}`;
    }
  }
}

function typeNote(c: PropertyContext): string {
  return ["flat", "office", "shop"].includes(c.slug)
    ? `A ${c.label.toLowerCase()} here comes with its layout already fixed, so vastu is a filter you apply while choosing rather than something you correct afterwards.`
    : `A ${c.label.toLowerCase()} here usually allows some internal change, which is what makes vastu worth planning for rather than only screening on.`;
}

export function sectorFaqs(
  sector: Sector,
  aspect: SectorAspect | null,
  m: SectorMarket | null,
): { question: string; answer: string }[] {
  const priceAnswer = m?.pricePerSqft
    ? `Working averages for the ${m.corridorName} corridor, which ${sector.name} sits on, run around ₹${m.pricePerSqft.toLocaleString("en-IN")} per square foot${m.yoyPercent != null ? `, ${m.yoyPercent > 0 ? "up" : "down"} ${Math.abs(m.yoyPercent).toFixed(1)}% over the last year` : ""}. That is a corridor-wide figure shared by every sector on it, it is not independently verified, and individual buildings vary well beyond it — treat it as a starting range, not a quote.`
    : `Pricing in ${sector.name} varies enough between buildings that a single figure would mislead. Ask us for the recent transacted range in the specific project you are considering.`;

  if (!aspect) {
    return [
      {
        question: `Is ${sector.name} good as per vastu?`,
        answer: `Vastu does not rate sectors — it rates the placement of rooms inside an individual property. What ${sector.name} does determine is your options: ${sector.character}, so the practical question is which of the properties available here already has a layout close to what the tradition prefers.`,
      },
      {
        question: `Which facing should I look for in ${sector.name}?`,
        answer: `The tradition favours north, north-east and east facings. In practice the supply in any one sector is limited, and holding out for a specific facing narrows your shortlist sharply — often more than the facing is worth. Screening on internal layout usually leaves you more to choose from.`,
      },
      { question: `What do properties in ${sector.name} cost?`, answer: priceAnswer },
    ];
  }

  switch (aspect.kind) {
    case "direction": {
      const d = findDirection(aspect.slug)!;
      return [
        {
          question: `Are ${d.name.toLowerCase()} facing properties available in ${sector.name}?`,
          answer: `Availability depends on how the blocks in a given project are oriented, not on the sector. We can filter current ${sector.name} inventory by facing before you visit — that is faster than checking each listing yourself.`,
        },
        {
          question: `Is a ${d.name.toLowerCase()} facing property good as per vastu?`,
          answer: `${d.summary} None of the eight facings is treated as unusable by the tradition.`,
        },
        {
          question: `Should I pay a premium for a ${d.name.toLowerCase()} facing property in ${sector.name}?`,
          answer: `Sellers in Gurugram do ask more for the facings buyers prefer. Whether that is worth it is a resale-liquidity question rather than a vastu one: a facing more buyers want is easier to sell on. ${priceAnswer}`,
        },
      ];
    }
    case "propertyType":
      return [
        {
          question: `Can vastu be corrected in a ${aspect.context.label.toLowerCase()} in ${sector.name}?`,
          answer: typeNote(aspect.context),
        },
        {
          question: `Are ${aspect.context.plural} available in ${sector.name}?`,
          answer: `${sector.name} is ${sector.character}, so ${aspect.context.plural} may or may not form a large part of what is on the market here at any point. We can tell you what is currently listed.`,
        },
        { question: `What do ${aspect.context.plural} cost in ${sector.name}?`, answer: priceAnswer },
      ];
    case "room": {
      const r = findRoom(aspect.slug)!;
      return [
        {
          question: `Where should the ${r.name.toLowerCase()} be in a ${sector.name} home?`,
          answer: `${r.guidance} The directions traditionally preferred are ${r.preferred.map((d) => findDirection(d)!.name.toLowerCase()).join(", ")}.`,
        },
        {
          question: `What if the ${r.name.toLowerCase()} in my ${sector.name} property is placed differently?`,
          answer: `Where the property is an apartment the layout is fixed, and the tradition's remedies are limited to how the space is lit, coloured and used. Where it is a plot or an independent floor there is usually more room to change things.`,
        },
        { question: `What do homes in ${sector.name} cost?`, answer: priceAnswer },
      ];
    }
  }
}

export type { Direction, RoomDef };
