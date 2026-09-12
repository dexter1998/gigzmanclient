/**
 * Builds the dataset the farmhouse pSEO pages are written from.
 *
 *   node scripts/build-farm-market.mjs
 *
 * Reads the 442-listing scrape vendored under source-data/ and emits
 * lib/premium-v2/farm-market.data.ts — per-village and per-estate counts,
 * median asking price, median plot size, price per sq ft, and the
 * distribution of bedrooms, facing, ownership and features actually present.
 *
 * Generated rather than hand-written for one reason: a programmatic page is
 * only worth publishing if it says something true and specific, and the only
 * specific thing most of these pages can say is what this belt's own listings
 * show. A page that says "12 farmhouses in Bhondsi, median ₹10.1 Cr on half
 * an acre" is a different document from the same page for Raiseena. A page
 * that says "farmhouses in {village}" is not.
 *
 * The figures are asking prices from one portal on one day. Every page that
 * renders them says so.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "source-data/99acres-farmhouse-gurgaon/farmhouses-gurgaon.json");
const OUT = join(root, "lib/premium-v2/farm-market.data.ts");

const ACRE = 43560;

const rows = JSON.parse(readFileSync(SRC, "utf8"));

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const median = (values) => {
  const sorted = values.filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

/** Counts by value, highest first, dropping empties. */
const tally = (values) => {
  const counts = new Map();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};


/**
 * A robust centroid for a locality.
 *
 * The scrape's coordinates are not clean: some rows carry latitude and
 * longitude the wrong way round, and a handful are somewhere else entirely —
 * averaging them naively put Manesar in Punjab and Panchgaon in Kazakhstan.
 * So: swap back anything that is obviously transposed, discard whatever falls
 * outside the Gurugram belt's bounding box, and take the median rather than
 * the mean so one surviving outlier cannot drag the point.
 */
const BELT_BOUNDS = { minLat: 27.8, maxLat: 28.8, minLng: 76.5, maxLng: 77.5 };

function inBelt(lat, lng) {
  return (
    lat >= BELT_BOUNDS.minLat &&
    lat <= BELT_BOUNDS.maxLat &&
    lng >= BELT_BOUNDS.minLng &&
    lng <= BELT_BOUNDS.maxLng
  );
}

function centroid(group) {
  const points = [];
  for (const row of group) {
    let lat = Number(row.latitude);
    let lng = Number(row.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (!inBelt(lat, lng) && inBelt(lng, lat)) [lat, lng] = [lng, lat];
    if (!inBelt(lat, lng)) continue;
    points.push([lat, lng]);
  }
  if (points.length === 0) return [null, null];
  const mid = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    return Number(sorted[Math.floor(sorted.length / 2)].toFixed(5));
  };
  return [mid(points.map((p) => p[0])), mid(points.map((p) => p[1]))];
}

function statsFor(group) {
  const prices = group.map((r) => Number(r.price_inr));
  const areas = group.map((r) => Number(r.area_sqft));
  const perSqft = group.map((r) => Number(r.price_per_sqft));
  return {
    listings: group.length,
    medianPrice: median(prices),
    minPrice: prices.filter(Boolean).length ? Math.min(...prices.filter(Boolean)) : null,
    maxPrice: prices.filter(Boolean).length ? Math.max(...prices.filter(Boolean)) : null,
    medianArea: median(areas),
    medianPerSqft: median(perSqft),
    bedrooms: tally(group.map((r) => (r.bedrooms ? String(r.bedrooms) : null))),
    facings: tally(group.map((r) => r.facing)),
    ownership: tally(group.map((r) => r.ownership)),
    gated: group.filter((r) => r.gated === "Y").length,
    corner: group.filter((r) => r.corner_property === "Y").length,
    pool: group.filter((r) => /swimming pool/i.test(r.amenities ?? "")).length,
    park: group.filter((r) => /\bPark\b/i.test(r.amenities ?? "")).length,
    vaastu: group.filter((r) => /vaastu/i.test(r.amenities ?? "")).length,
    readyToMove: group.filter((r) => r.availability === "I").length,
  };
}

// ── Villages ─────────────────────────────────────────────────────────
const byLocality = new Map();
for (const row of rows) {
  const name = (row.locality ?? "").trim();
  if (!name) continue;
  if (!byLocality.has(name)) byLocality.set(name, []);
  byLocality.get(name).push(row);
}

const villages = [...byLocality.entries()]
  .map(([name, group]) => {
    const [lat, lng] = centroid(group);
    return {
      slug: slugify(name),
      name,
      ...statsFor(group),
      estates: tally(group.map((r) => r.society)).slice(0, 5),
      lat,
      lng,
    };
  })
  .sort((a, b) => b.listings - a.listings);

// ── Estates (the `society` field) ────────────────────────────────────
const bySociety = new Map();
for (const row of rows) {
  const name = (row.society ?? "").trim();
  if (!name) continue;
  if (!bySociety.has(name)) bySociety.set(name, []);
  bySociety.get(name).push(row);
}

const estates = [...bySociety.entries()]
  .map(([name, group]) => ({
    slug: slugify(name),
    name,
    ...statsFor(group),
    villages: tally(group.map((r) => r.locality)).slice(0, 4),
  }))
  .sort((a, b) => b.listings - a.listings);

const belt = statsFor(rows);

const header = `/**
 * GENERATED by scripts/build-farm-market.mjs — do not edit by hand.
 *
 * Aggregated from the ${rows.length} farmhouse listings vendored under
 * source-data/99acres-farmhouse-gurgaon/. These are asking prices from one
 * portal on one day, not transacted rates, and every page that renders them
 * says so.
 */

export interface MarketStats {
  listings: number;
  medianPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  medianArea: number | null;
  medianPerSqft: number | null;
  /** [value, count], highest count first. */
  bedrooms: [string, number][];
  facings: [string, number][];
  ownership: [string, number][];
  gated: number;
  corner: number;
  pool: number;
  park: number;
  vaastu: number;
  readyToMove: number;
}

export interface VillageRow extends MarketStats {
  slug: string;
  name: string;
  estates: [string, number][];
  lat: number | null;
  lng: number | null;
}

export interface EstateRow extends MarketStats {
  slug: string;
  name: string;
  villages: [string, number][];
}

/** One acre in square feet — the unit every plot figure here is scaled from. */
export const ACRE_SQFT = ${ACRE};

export const BELT_STATS: MarketStats = ${JSON.stringify(belt, null, 2)};

export const VILLAGES: VillageRow[] = ${JSON.stringify(villages, null, 2)};

export const ESTATES: EstateRow[] = ${JSON.stringify(estates, null, 2)};
`;

writeFileSync(OUT, header);

console.log(`villages ${villages.length}`);
console.log(`estates  ${estates.length}`);
console.log(`listings ${rows.length}`);
console.log(
  `top      ${villages
    .slice(0, 6)
    .map((v) => `${v.name}(${v.listings})`)
    .join(", ")}`,
);
