/**
 * Turns the scraped 99acres farm-house dataset into Evergreen Real Estate's
 * property and locality content.
 *
 * Run: node scripts/import-farmhouses.mjs
 *
 * Reads source-data/ (vendored into the repo so this runs on any checkout),
 * writes clients/evergreen-real-estate/content/{properties,localities}.yaml
 * and copies IMAGES_PER_LISTING photos per listing into public/.
 *
 * Locality figures are computed from the listings themselves — median price
 * per sq ft, listing counts, price bands — rather than invented, so the
 * corridor pages carry numbers that can be traced back to the source rows.
 */
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "source-data/99acres-farmhouse-gurgaon";
/**
 * Listing photography.
 *
 * The scraped feed's own images are not usable: half are under 400px wide,
 * the CDN publishes no larger variant, and the set is full of boundary walls,
 * approach roads and empty scrub rather than the property. This is a set of
 * 30 consistent 1672x941 farmhouse exteriors used in their place — see the
 * illustrative-image note written into properties.yaml.
 */
const PHOTO_SRC = "source-data/gurgaon-farmhouses-realistic-hd";
const CLIENT = "clients/evergreen-real-estate/content";
const PUBLIC_DIR = "public/verticals/realestate/templates/premium-v2/farmhouses";
const WEB_BASE = "/verticals/realestate/templates/premium-v2/farmhouses";
/** The listings' own photographs, kept apart from the stand-in pool. */
const REAL_DIR = "public/verticals/realestate/templates/premium-v2/farmhouse-photos";
const REAL_WEB = "/verticals/realestate/templates/premium-v2/farmhouse-photos";
/**
 * The source images are small — half the feed is under 400px wide and the
 * largest is 890x400; the CDN publishes only the "M" size variant, so there
 * is no higher-resolution original to fetch. They are therefore never
 * upscaled: each is written at its own size (capped, not stretched) at a
 * quality high enough not to add compression damage on top.
 */
const IMAGES_PER_LISTING = 3;

/**
 * How many of the listing's OWN photographs to publish after the stand-in
 * pool shots.
 *
 * The feed's images are small — half are under 400px wide — which is why the
 * pool exists and why the first, thumbnail-sized image stays a clean HD shot.
 * But a gallery of nothing but stand-ins shows a farmhouse that is not the
 * one for sale, so the real photographs follow it.
 *
 * Capped at four rather than all 4,309: the full set is 135MB, and this
 * project's Vercel deployment storage is already over its 10GB limit. Four
 * per listing lands around 57MB as webp.
 */
const REAL_PHOTOS_PER_LISTING = 4;
const REAL_SRC = "/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon/images";

const rows = JSON.parse(await readFile(`${SRC}/farmhouses-gurgaon.json`, "utf8"));

/* ── helpers ─────────────────────────────────────────────────────────── */

const slugify = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

const yamlString = (v) => {
  if (v === null || v === undefined || v === "") return "null";
  const s = String(v).replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
};

const median = (nums) => {
  const a = nums.filter((n) => Number.isFinite(n)).sort((x, y) => x - y);
  return a.length ? a[Math.floor(a.length / 2)] : null;
};

/** Sq ft, but only when the row's own numbers are self-consistent. */
function areaSqft(r) {
  const a = Number(r.area_sqft);
  // The feed has rows at 1 sqft and at 4.36 million (100 acres keyed as sqft),
  // and others at a few hundred square yards — none of which is a farmhouse
  // plot. All are data errors rather than listings, so they lose their area
  // rather than publishing an absurd figure like "133 sq yd farmhouse".
  if (!Number.isFinite(a) || a < 4_000 || a > 2_000_000) return null;
  return Math.round(a);
}

/* ── images ──────────────────────────────────────────────────────────── */

if (existsSync(PUBLIC_DIR)) await rm(PUBLIC_DIR, { recursive: true });
await mkdir(PUBLIC_DIR, { recursive: true });
if (existsSync(REAL_DIR)) await rm(REAL_DIR, { recursive: true });
await mkdir(REAL_DIR, { recursive: true });

/**
 * Builds the shared photo pool once, then hands each listing a stable slice
 * of it.
 *
 * Deterministic on `prop_id`, so a listing keeps the same photos across runs
 * and two listings side by side in a grid rarely repeat — a random draw would
 * reshuffle the whole site on every import.
 */
let POOL = [];

async function buildPool() {
  const files = (await readdir(PHOTO_SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  await mkdir(PUBLIC_DIR, { recursive: true });
  const built = [];
  for (const f of files) {
    const name = f.replace(/\.[^.]+$/, ".webp");
    await sharp(`${PHOTO_SRC}/${f}`)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(`${PUBLIC_DIR}/${name}`);
    built.push(`${WEB_BASE}/${name}`);
  }
  return built;
}

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

async function realPhotosFor(propId, heading) {
  const dir = `${REAL_SRC}/${propId}`;
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .slice(0, REAL_PHOTOS_PER_LISTING);

  const out = [];
  for (const [i, f] of files.entries()) {
    const name = `${propId}-${i + 1}.webp`;
    try {
      await sharp(`${dir}/${f}`)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(`${REAL_DIR}/${name}`);
      out.push({
        path: `${REAL_WEB}/${name}`,
        alt: `${heading} — photograph of this property`,
        is_primary: false,
      });
    } catch {
      // A truncated or unreadable file in the feed must not stop the import.
    }
  }
  return out;
}

async function imagesFor(propId, heading) {
  if (POOL.length === 0) return [];
  const start = hash(propId) % POOL.length;
  const stand_ins = Array.from({ length: Math.min(IMAGES_PER_LISTING, POOL.length) }, (_, i) => ({
    path: POOL[(start + i * 7) % POOL.length],
    alt: `${heading} — illustrative photograph`,
    is_primary: i === 0,
  }));
  // Primary stays a pool shot: it is the card thumbnail, and the feed's own
  // first image is often a floor plan or a blurred street view.
  return [...stand_ins, ...(await realPhotosFor(propId, heading))];
}

/* ── properties ──────────────────────────────────────────────────────── */

POOL = await buildPool();

const seenSlug = new Map();
const listings = [];

for (const r of rows) {
  const locality = r.locality || "Gurgaon";
  const beds = Number(r.bedrooms) || null;
  const area = areaSqft(r);
  const price = Number(r.price_inr) || null;

  // Slug from what a person would search: size, type, locality. The prop id
  // keeps it unique — the feed has hundreds of near-identical headings.
  const base = slugify([beds ? `${beds}-bhk` : "", "farmhouse", locality].filter(Boolean).join("-"));
  const n = (seenSlug.get(base) ?? 0) + 1;
  seenSlug.set(base, n);
  const slug = `${base}-${String(r.prop_id).toLowerCase()}`;

  // 259 of the 442 listings sit in one society, so a title built from the
  // society name alone repeats down the whole first page. Plot size is what
  // actually differs between them, and it is what a farmhouse buyer sorts on.
  const acres = area ? area / 43560 : null;
  const size = acres
    ? acres >= 1
      ? `${Number(acres.toFixed(acres % 1 === 0 ? 0 : 1))}-acre`
      : `${Math.round(area / 9).toLocaleString("en-IN")} sq yd`
    : null;
  const place = r.society || locality;
  const title = size
    ? `${size} farmhouse at ${place}`
    : beds
      ? `${beds} BHK farmhouse at ${place}`
      : `Farmhouse at ${place}`;

  const amenities = [
    ...new Set(
      String(r.amenities || "")
        .split("|")
        .map((a) => a.trim())
        .filter((a) => a && !/^code:/i.test(a)),
    ),
  ];

  const specs = {};
  if (r.facing) specs["Facing"] = r.facing;
  if (r.furnishing) specs["Furnishing"] = r.furnishing;
  if (r.ownership) specs["Ownership"] = r.ownership;
  if (r.age) specs["Age"] = `${r.age} years`;
  if (r.total_floors) specs["Floors"] = String(r.total_floors);
  if (area) specs["Plot area"] = `${area.toLocaleString("en-IN")} sq ft`;

  listings.push({
    slug,
    title,
    property_type: "farmhouse",
    purpose: "buy",
    status: "ready_to_move",
    price,
    price_per_sqft: Number(r.price_per_sqft) || null,
    locality,
    corridor: locality,
    society: r.society || null,
    beds,
    baths: Number(r.bathrooms) || null,
    area,
    description: r.description || null,
    amenities,
    specs,
    verified: r.verified === "Y",
    video_url: r.video_youtube || null,
    images: await imagesFor(r.prop_id, title),
    _price: price,
    _sqft: Number(r.price_per_sqft) || null,
    _locality: locality,
  });
}

/**
 * Listing order.
 *
 * `getProperties` orders by `isFeatured` then `sortOrder`, and the seed takes
 * `sortOrder` from this file's order — so sorting here is what decides what a
 * visitor sees first. The score puts the listings that present properly at
 * the top: ones with photography, a video tour, a real price and plot size,
 * and enough description to read. A listing that carries none of that is not
 * hidden, it just stops being the first thing on the page.
 */
function completeness(l) {
  let score = 0;
  if (l.images.length > 0) score += 40;
  if (l.video_url) score += 20;
  if (l.price) score += 12;
  if (l.area) score += 12;
  if (l.beds) score += 6;
  if (l.baths) score += 4;
  if (l.society) score += 4;
  if (l.verified) score += 6;
  if ((l.description ?? "").length > 120) score += 8;
  score += Math.min(l.amenities.length * 2, 8);
  return score;
}

listings.sort((a, b) => completeness(b) - completeness(a) || (b._price ?? 0) - (a._price ?? 0));

/**
 * Spread societies across the order.
 *
 * 259 of the 442 listings are in one society, and they score alike, so a
 * straight quality sort filled the entire first page with the same name and
 * the same plot size. This keeps the quality tiers but deals listings out
 * round-robin by society within each tier, so the first screen shows the
 * range of what is actually on the market. Anything with no society named
 * competes as its own group rather than clumping into one.
 */
function spreadBySociety(rows) {
  const TIER = 10;
  const tiers = new Map();
  for (const row of rows) {
    const tier = Math.floor(completeness(row) / TIER);
    if (!tiers.has(tier)) tiers.set(tier, new Map());
    const groups = tiers.get(tier);
    const key = row.society || `__${row.slug}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const out = [];
  for (const tier of [...tiers.keys()].sort((a, b) => b - a)) {
    const queues = [...tiers.get(tier).values()];
    let remaining = queues.reduce((n, q) => n + q.length, 0);
    while (remaining > 0) {
      for (const queue of queues) {
        const next = queue.shift();
        if (next) {
          out.push(next);
          remaining--;
        }
      }
    }
  }
  return out;
}

const ordered = spreadBySociety(listings);
listings.length = 0;
listings.push(...ordered);

/* Featured picks: the best-presented listings, which the home page's
   asymmetric grid needs images for. */
const featured = new Set(listings.slice(0, 6).map((l) => l.slug));

const propsYaml = [
  "# Property listings — Evergreen Real Estate (farm houses).",
  "#",
  "# Imported from a 99acres scrape of farm houses in Gurgaon (442 listings,",
  "# 2026-09-09) by scripts/import-farmhouses.mjs. Prices, areas, amenities,",
  "# descriptions and video tours are the source listings' own values.",
  "#",
  "# PHOTOGRAPHY IS ILLUSTRATIVE. The feed's own images were unusable — half",
  "# under 400px wide with no larger variant published, and mostly boundary",
  "# walls, approach roads and empty scrub. Listings instead carry images from",
  "# a generated Gurgaon farmhouse set, which are not photographs of the",
  "# property being described. Every image alt says so, and the detail page",
  "# carries the same note. Replace them with the client's own photography",
  "# before this is promoted.",
  "#",
  "# IMPORTANT: these are other dealers' listings as published on 99acres, not",
  "# Evergreen's own mandates — each source row carries its own contact company.",
  "# They are seed content for building the site out; before this goes live the",
  "# client has to replace them with inventory they actually represent.",
  "",
  "_status: placeholder",
  "",
  "properties:",
];

for (const l of listings) {
  propsYaml.push(`  - slug: ${l.slug}`);
  propsYaml.push(`    title: ${yamlString(l.title)}`);
  propsYaml.push(`    property_type: farmhouse`);
  propsYaml.push(`    purpose: buy`);
  propsYaml.push(`    status: ready_to_move`);
  propsYaml.push(`    price: ${l.price ?? "null"}`);
  propsYaml.push(`    price_per_sqft: ${l.price_per_sqft ?? "null"}`);
  propsYaml.push(`    locality: ${yamlString(l.locality)}`);
  propsYaml.push(`    corridor: ${yamlString(l.corridor)}`);
  if (l.society) propsYaml.push(`    developer: ${yamlString(l.society)}`);
  propsYaml.push(`    beds: ${l.beds ?? "null"}`);
  propsYaml.push(`    baths: ${l.baths ?? "null"}`);
  propsYaml.push(`    area: ${l.area ?? "null"}`);
  propsYaml.push(`    area_unit: sqft`);
  if (l.verified) propsYaml.push(`    badge: "Verified"`);
  propsYaml.push(`    description: ${yamlString(l.description)}`);
  propsYaml.push(
    `    amenities: [${l.amenities.map((a) => yamlString(a)).join(", ")}]`,
  );
  const specEntries = Object.entries(l.specs).map(([k, v]) => `${yamlString(k)}: ${yamlString(v)}`);
  propsYaml.push(`    specs: { ${specEntries.join(", ")} }`);
  if (l.video_url) propsYaml.push(`    video_url: ${yamlString(l.video_url)}`);
  propsYaml.push(`    is_featured: ${featured.has(l.slug)}`);
  propsYaml.push(`    is_active: true`);
  if (l.images.length > 0) {
    propsYaml.push(`    images:`);
    for (const img of l.images) {
      propsYaml.push(`      - { path: ${img.path}, alt: ${yamlString(img.alt)}, is_primary: ${img.is_primary} }`);
    }
  } else {
    propsYaml.push(`    images: []`);
  }
}

await writeFile(`${CLIENT}/properties.yaml`, propsYaml.join("\n") + "\n");

/* ── localities, computed from the same rows ─────────────────────────── */

const byLocality = new Map();
for (const l of listings) {
  const k = l._locality;
  if (!byLocality.has(k)) byLocality.set(k, []);
  byLocality.get(k).push(l);
}

const corridors = [...byLocality.entries()]
  .filter(([, list]) => list.length >= 3)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 8);

const locYaml = [
  "# Corridor pages — Evergreen Real Estate (farm houses).",
  "#",
  "# Every figure below is computed from the imported listings themselves",
  "# (scripts/import-farmhouses.mjs): the median asking price per sq ft, the",
  "# median plot size and the live listing count for that corridor. They are",
  "# asking prices from one portal on one day, not transacted market rates —",
  "# which is what the on-page wording says.",
  "",
  "_status: placeholder",
  "",
  "localities:",
];

for (const [name, list] of corridors) {
  const medSqft = median(list.map((l) => l._sqft));
  const medArea = median(list.map((l) => l.area));
  const medPrice = median(list.map((l) => l._price));
  locYaml.push(`  - slug: ${slugify(name)}`);
  locYaml.push(`    name: ${yamlString(name)}`);
  locYaml.push(`    corridor: ${yamlString(name)}`);
  locYaml.push(`    avg_price_per_sqft: ${medSqft ?? "null"}`);
  locYaml.push(`    active_projects: ${list.length}`);
  locYaml.push(`    best_for: ${yamlString("Farmhouses and weekend estates")}`);
  locYaml.push(
    `    description: ${yamlString(
      `${name} carries ${list.length} farm-house listings in this dataset, with a median asking price of ${
        medPrice ? `₹${(medPrice / 1e7).toFixed(2)} crore` : "an unstated figure"
      }${medArea ? ` on a median plot of about ${medArea.toLocaleString("en-IN")} sq ft` : ""}${
        medSqft ? `, working out to roughly ₹${medSqft.toLocaleString("en-IN")} per sq ft` : ""
      }. Figures are asking prices from listing data, not transacted rates.`,
    )}`,
  );
  locYaml.push(`    is_published: true`);
}

await writeFile(`${CLIENT}/localities.yaml`, locYaml.join("\n") + "\n");

console.log(`properties: ${listings.length}`);
console.log(`photo pool: ${POOL.length} images, ${listings.filter((l) => l.images.length).length} listings assigned`);
console.log(`featured: ${featured.size}`);
console.log(`with video: ${listings.filter((l) => l.video_url).length}`);
console.log(`corridors: ${corridors.map(([n, l]) => `${n}(${l.length})`).join(", ")}`);
