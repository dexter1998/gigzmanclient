import type { properties } from "@/lib/db/schema";

type Property = typeof properties.$inferSelect;

/**
 * Listings sourced from the HRERA register keep their filing in `specs` as a
 * flat string map (see scripts/rera-to-properties.mjs). The inventory pages
 * need a handful of those values as numbers — to total land, count unsold
 * stock, and tell which projects have run past the date their promoter filed.
 *
 * Parsing happens once on the server and only these primitives cross to the
 * client: sending the whole `specs` map for ~800 listings is ~1.6 MB and
 * stalls hydration.
 */
export interface RegisterStats {
  /** Project area in acres, already stored on the row by the importer. */
  acres: number | null;
  units: number | null;
  booked: number | null;
  unsold: number | null;
  /** Infrastructure completion the promoter last reported, 0-100. */
  pctComplete: number | null;
  /** Completion date has passed and the filing does not report 100%. */
  delayed: boolean;
  /** Year of the RERA registration, for the launch histogram. */
  regYear: number | null;
  /** Present only on register-sourced rows; hand-written listings have none. */
  isFiling: boolean;
}

const num = (v: string | undefined): number | null => {
  if (!v) return null;
  const m = v.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};

export function registerStats(property: Property): RegisterStats {
  const specs = (property.specs ?? {}) as Record<string, string>;
  const delivery = specs["Delivery status"] ?? "";
  const regYear = specs["RERA registration"]?.match(/(20\d{2})/)?.[1];

  return {
    acres: property.areaUnit === "acres" ? property.area : null,
    units: num(specs["Total units"]),
    booked: num(specs["Units booked"]),
    unsold: num(specs["Units unsold"]),
    pctComplete: num(specs["Infrastructure complete"]),
    delayed: /past/i.test(delivery),
    regYear: regYear ? Number(regYear) : null,
    isFiling: Boolean(specs["RERA registration"] ?? specs["Land area"]),
  };
}

/** A listing plus the parsed numbers, which is what the inventory pages pass around. */
export type ListingRow = Property & { stats: RegisterStats };

export function withStats(rows: Property[]): ListingRow[] {
  return rows.map((row) => ({
    ...row,
    // The two heavy columns never reach the client; `stats` replaces them.
    description: null,
    specs: {},
    stats: registerStats(row),
  }));
}

export interface Facets {
  projects: number;
  developers: number;
  acres: number;
  units: number;
  unsold: number;
  delayed: number;
  lapsed: number;
  avgComplete: number | null;
  /** Descending by count. */
  byType: { key: string; label: string; count: number }[];
  bySector: { key: string; count: number }[];
  byDeveloper: { key: string; count: number }[];
  byLocality: { key: string; count: number }[];
  byYear: { year: number; count: number }[];
}

const TYPE_LABELS: Record<string, string> = {
  apartment: "Group housing",
  builder_floor: "Independent floors",
  plot: "Plots & township",
  villa: "Villas",
  sco: "SCO / shops",
  commercial: "Commercial",
};

function tally<T extends string | number>(values: (T | null | undefined)[]) {
  const counts = new Map<T, number>();
  for (const v of values) if (v != null && v !== "") counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function facetsFor(rows: ListingRow[]): Facets {
  const pct = rows.map((r) => r.stats.pctComplete).filter((v): v is number => v != null);

  return {
    projects: rows.length,
    developers: new Set(rows.map((r) => r.developer).filter(Boolean)).size,
    acres: Math.round(rows.reduce((a, r) => a + (r.stats.acres ?? 0), 0)),
    units: rows.reduce((a, r) => a + (r.stats.units ?? 0), 0),
    unsold: rows.reduce((a, r) => a + (r.stats.unsold ?? 0), 0),
    delayed: rows.filter((r) => r.stats.delayed).length,
    lapsed: rows.filter((r) => /lapsed/i.test(r.badge ?? "")).length,
    avgComplete: pct.length ? Math.round((pct.reduce((a, b) => a + b, 0) / pct.length) * 10) / 10 : null,
    byType: tally(rows.map((r) => r.propertyType)).map(([key, count]) => ({
      key,
      label: TYPE_LABELS[key] ?? key,
      count,
    })),
    bySector: tally(rows.map((r) => r.sector)).map(([key, count]) => ({ key, count })),
    byDeveloper: tally(rows.map((r) => r.developer)).map(([key, count]) => ({ key, count })),
    byLocality: tally(rows.map((r) => r.locality)).map(([key, count]) => ({ key, count })),
    byYear: tally(rows.map((r) => r.stats.regYear))
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year),
  };
}

/** URL-safe developer key, e.g. "Signature Global" -> "signature-global". */
export function developerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Sector labels carry sub-blocks ("63A", "37D"), so keep alphanumerics. */
export function sectorSlug(sector: string): string {
  return sector.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Sector 2 before Sector 10 before Sector 63A. */
export function compareSectors(a: string, b: string): number {
  const na = parseInt(a, 10);
  const nb = parseInt(b, 10);
  if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
  return na - nb || a.localeCompare(b);
}
