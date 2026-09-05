/**
 * Gurugram sectors and named colonies, mapped to the corridor each sits on.
 *
 * The corridor mapping is what stops a sector page being the same page with a
 * number swapped in: it lets each one carry that corridor's real pricing,
 * yield and character from the tenant's own locality rows. Ranges below are
 * the broad, well-established groupings used locally — a sector on a boundary
 * is described as being on its nearest corridor rather than claimed
 * definitively, which is how the copy is worded on the page.
 *
 * `corridorSlug` matches the seeded locality slugs so a sector page can pull
 * live corridor figures instead of restating a template.
 */

export interface Sector {
  /** URL segment, e.g. "sector-54" or "dlf-phase-1". */
  slug: string;
  /** Display name. */
  name: string;
  /** Locality slug this sector sits on or nearest to. */
  corridorSlug: string;
  /** Short, factual descriptor of what the sector is known for. */
  character: string;
}

type Range = { from: number; to: number; corridor: string; character: string };

/**
 * Numbered sectors, grouped by the corridor they fall on. Sectors not covered
 * by a range are still generated, mapped to the closest corridor group.
 */
const SECTOR_RANGES: Range[] = [
  { from: 1, to: 14, corridor: "sohna-road", character: "old Gurugram, largely built-out plotted colonies and independent floors" },
  { from: 15, to: 23, corridor: "sohna-road", character: "established residential sectors close to the older city core" },
  { from: 24, to: 32, corridor: "golf-course-road", character: "central sectors within reach of MG Road and the older commercial belt" },
  { from: 33, to: 41, corridor: "sohna-road", character: "the Sohna Road belt, a mix of mid-rise housing and roadside commercial" },
  { from: 42, to: 46, corridor: "golf-course-road", character: "premium Golf Course Road addresses with high-rise and low-rise stock" },
  { from: 47, to: 52, corridor: "sohna-road", character: "the Sohna Road and Nirvana Country side, popular with families" },
  { from: 53, to: 57, corridor: "golf-course-road", character: "the core Golf Course Road stretch, Gurugram's most established premium corridor" },
  { from: 58, to: 67, corridor: "southern-peripheral-road", character: "Golf Course Extension, where newer branded high-rises cluster" },
  { from: 68, to: 75, corridor: "southern-peripheral-road", character: "the SPR belt, still filling in with newer launches" },
  { from: 76, to: 80, corridor: "new-gurugram", character: "New Gurugram, largely newer gated developments" },
  { from: 81, to: 95, corridor: "new-gurugram", character: "the New Gurugram growth belt along the Pataudi and KMP side" },
  { from: 96, to: 98, corridor: "new-gurugram", character: "the outer New Gurugram sectors, closest to the Manesar side" },
  { from: 99, to: 115, corridor: "dwarka-expressway", character: "the Dwarka Expressway corridor, the city's fastest-appreciating stretch" },
];

/** Named colonies people search for by name rather than sector number. */
const NAMED: Sector[] = [
  { slug: "dlf-phase-1", name: "DLF Phase 1", corridorSlug: "golf-course-road", character: "one of Gurugram's oldest planned colonies, largely independent houses" },
  { slug: "dlf-phase-2", name: "DLF Phase 2", corridorSlug: "golf-course-road", character: "established plotted colony adjoining the Cyber City side" },
  { slug: "dlf-phase-3", name: "DLF Phase 3", corridorSlug: "golf-course-road", character: "a mixed residential and office pocket next to Cyber City" },
  { slug: "dlf-phase-4", name: "DLF Phase 4", corridorSlug: "golf-course-road", character: "central, walkable, with a mix of builder floors and older houses" },
  { slug: "dlf-phase-5", name: "DLF Phase 5", corridorSlug: "golf-course-road", character: "premium high-rise condominiums along Golf Course Road" },
  { slug: "sushant-lok-1", name: "Sushant Lok 1", corridorSlug: "golf-course-road", character: "a large established colony with strong rental demand" },
  { slug: "sushant-lok-2", name: "Sushant Lok 2", corridorSlug: "sohna-road", character: "residential pocket off the Sohna Road side" },
  { slug: "sushant-lok-3", name: "Sushant Lok 3", corridorSlug: "sohna-road", character: "plotted and builder-floor stock near Sector 57" },
  { slug: "south-city-1", name: "South City 1", corridorSlug: "golf-course-road", character: "an older planned colony of independent houses" },
  { slug: "south-city-2", name: "South City 2", corridorSlug: "sohna-road", character: "large plotted colony on the Sohna Road side" },
  { slug: "palam-vihar", name: "Palam Vihar", corridorSlug: "dwarka-expressway", character: "a self-contained colony close to the Dwarka Expressway and Delhi border" },
  { slug: "nirvana-country", name: "Nirvana Country", corridorSlug: "sohna-road", character: "a gated township of villas and floors off Sohna Road" },
  { slug: "malibu-towne", name: "Malibu Towne", corridorSlug: "sohna-road", character: "a gated community of independent villas" },
  { slug: "ardee-city", name: "Ardee City", corridorSlug: "sohna-road", character: "planned township with plotted and apartment stock" },
  { slug: "uniworld-city", name: "Uniworld City", corridorSlug: "southern-peripheral-road", character: "a condominium township on the Golf Course Extension side" },
  { slug: "vatika-city", name: "Vatika City", corridorSlug: "sohna-road", character: "an established township along Sohna Road" },
  { slug: "rosewood-city", name: "Rosewood City", corridorSlug: "sohna-road", character: "plotted and floor stock near Sector 49" },
  { slug: "sector-104-dwarka-expressway", name: "Sector 104 Dwarka Expressway", corridorSlug: "dwarka-expressway", character: "newer high-rise launches directly on the expressway" },
  { slug: "golf-course-road", name: "Golf Course Road", corridorSlug: "golf-course-road", character: "the corridor itself, spanning Sectors 42 to 56" },
  { slug: "sohna-road", name: "Sohna Road", corridorSlug: "sohna-road", character: "the arterial road running south from Subhash Chowk" },
  { slug: "new-gurugram", name: "New Gurugram", corridorSlug: "new-gurugram", character: "the newer sectors beyond the Dwarka Expressway interchange" },
  { slug: "dwarka-expressway", name: "Dwarka Expressway", corridorSlug: "dwarka-expressway", character: "the expressway corridor linking Gurugram to Dwarka" },
];

function corridorFor(n: number): Range {
  return (
    SECTOR_RANGES.find((r) => n >= r.from && n <= r.to) ??
    SECTOR_RANGES[SECTOR_RANGES.length - 1]
  );
}

export const SECTORS: Sector[] = [
  ...Array.from({ length: 115 }, (_, i) => i + 1).map((n) => {
    const range = corridorFor(n);
    return {
      slug: `sector-${n}`,
      name: `Sector ${n}`,
      corridorSlug: range.corridor,
      character: range.character,
    };
  }),
  ...NAMED,
];

export function findSector(slug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}

/** Property types a sector page is written for. */
export const PROPERTY_CONTEXTS = [
  { slug: "flat", label: "Flat", plural: "flats" },
  { slug: "builder-floor", label: "Builder floor", plural: "builder floors" },
  { slug: "villa", label: "Villa", plural: "villas" },
  { slug: "plot", label: "Plot", plural: "plots" },
  { slug: "office", label: "Office", plural: "offices" },
  { slug: "shop", label: "Shop", plural: "shops" },
] as const;

export type PropertyContext = (typeof PROPERTY_CONTEXTS)[number];

/** Plot sizes people search vastu layouts for, in feet. */
export const PLOT_SIZES = [
  "20x50", "25x40", "30x40", "30x50", "30x60",
  "40x60", "50x80", "60x90",
] as const;

/* ─────────────────────────────── sector page aspects
   A sector page answers "what should I know about vastu here"; an aspect
   page narrows that to one facing, one property type, or one room. The three
   families are kept in one segment so the URL reads the way people search:
   /vastu/gurugram/sector-54/north-facing, /.../flat, /.../kitchen. */

export type SectorAspect =
  | { kind: "direction"; slug: string }
  | { kind: "propertyType"; context: PropertyContext }
  | { kind: "room"; slug: string };

/** Aspect slugs, given the direction and room slug lists (passed in to keep
 *  this module free of a circular import back into lib/vastu/index.ts). */
export function sectorAspectSlugs(
  directionSlugs: readonly string[],
  roomSlugs: readonly string[],
): string[] {
  return [
    ...directionSlugs.map((d) => `${d}-facing`),
    ...PROPERTY_CONTEXTS.map((c) => c.slug),
    ...roomSlugs,
  ];
}

export function resolveSectorAspect(
  slug: string,
  directionSlugs: readonly string[],
  roomSlugs: readonly string[],
): SectorAspect | null {
  const facing = slug.match(/^(.+)-facing$/);
  if (facing && directionSlugs.includes(facing[1])) {
    return { kind: "direction", slug: facing[1] };
  }
  const context = PROPERTY_CONTEXTS.find((c) => c.slug === slug);
  if (context) return { kind: "propertyType", context };
  if (roomSlugs.includes(slug)) return { kind: "room", slug };
  return null;
}
