/**
 * Second pass at photography, for the projects the developer-site crawl left
 * empty.
 *
 * Search is keyless: DuckDuckGo hands out a `vqd` token on the HTML page and
 * the image endpoint accepts it. Listing portals are blocked outright — their
 * images carry portal watermarks, which is exactly what this is meant to
 * avoid — and the developer's own domain is preferred where the RERA filing
 * gave us one.
 *
 * Downloads land in _incoming/ rather than the live folder: everything here is
 * unreviewed, and the same triage + visual review the first batch went through
 * still has to run over it.
 *
 *   node scripts/image-discover.mjs [--limit N] [--concurrency N]
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const YAML_PATH = path.join(ROOT, "clients/high-properties/content/properties.yaml");
const INCOMING = path.join(ROOT, "public/verticals/realestate/clients/high-properties/_incoming");
const LOG = path.join(ROOT, "scripts/data/image-discovery.json");

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > -1 ? Number(process.argv[i + 1]) : d;
};
const LIMIT = arg("limit", Infinity);
const CONCURRENCY = arg("concurrency", 4);
const WANT = 5; // candidates per project; the review pass will cut this down

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36";

/**
 * Listing portals and aggregators. Their photography is watermarked and is not
 * the developer's to give, so nothing from here is worth having.
 */
const BLOCKED = [
  "magicbricks", "99acres", "housing.com", "housvt", "squareyards", "proptiger", "nobroker",
  "makaan", "commonfloor", "olx.", "quikr", "realestateindia", "indiaproperty", "roofandfloor",
  "sulekha", "justdial", "propertywala", "homeonline", "360realtors", "investoxpert",
  "propertypistol", "realtyassistant", "newhomeinfo", "squareyard", "indiahomes", "propchill",
  "propertyok", "estatesinfo", "gharpedia", "zricks", "propstory", "realtynmore", "pinterest",
  "facebook", "instagram", "youtube", "twitter", "linkedin", "alamy", "shutterstock",
  "gettyimages", "dreamstime", "istockphoto", "123rf", "tripadvisor", "wikimedia", "lookaside",
  // Portals serve images off CDNs that share no string with their brand, so
  // blocking the site name alone let 283 watermarked files through.
  "staticmb.com",        // MagicBricks
  "n7net.in", "housingcdn.com", "housingman.com", // Housing.com
  "imimg.com",           // IndiaMART
  "pinimg.com",          // Pinterest
  "im.proptiger", "sy-cdn", "squarecdn",
  // YouTube thumbnails are built to be clicked, not to show a building: they
  // carry the channel's text overlay and a Subscribe badge burned in. 21% of
  // the first search batch's hero images were these.
  "ytimg.com",
];

const isBlocked = (u) => {
  const h = (() => {
    try {
      return new URL(u).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();
  return !h || BLOCKED.some((b) => h.includes(b));
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Bing's image page carries the full-size URL and dimensions in a JSON blob per
 * tile. DuckDuckGo was the first choice and answered fine for a few dozen
 * queries before rate-limiting the host outright — and it fails by returning an
 * empty list, not an error, which silently burned 655 projects before it was
 * caught. Hence `consecutiveEmpty` below.
 */
async function searchImages(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
  const r = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-IN,en;q=0.9" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!r.ok) return [];
  const html = await r.text();
  const out = [];
  for (const m of html.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)) {
    const image = m[1].replace(/\\u002f/gi, "/").replace(/\\\//g, "/");
    out.push({ image, width: 0, height: 0, title: "", url: "" });
  }
  // Dimensions are on a sibling attribute; pull them where present.
  const dims = [...html.matchAll(/data-t="(\d+)x(\d+)"/g)].map((d) => [Number(d[1]), Number(d[2])]);
  out.forEach((o, i) => {
    if (dims[i]) [o.width, o.height] = dims[i];
  });
  return out;
}

async function download(url, dest) {
  const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25_000) });
  if (!r.ok) return null;
  const type = (r.headers.get("content-type") || "").split(";")[0];
  if (!/^image\/(jpe?g|png|webp|avif)$/.test(type)) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 25_000) return null; // thumbnails and badges
  const meta = await sharp(buf).metadata();
  const w = meta.width ?? 0, h = meta.height ?? 0, ratio = w / Math.max(1, h);
  if (w < 700 || h < 400 || ratio > 2.6 || ratio < 0.75) return null;
  const out = await sharp(buf)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out);
  return out.length;
}

const doc = YAML.parse(fs.readFileSync(YAML_PATH, "utf8"));
const targets = doc.properties
  .filter((p) => p._rera && (!p.images || p.images.length === 0))
  // Active listings first: those are the ones that actually show on the site.
  .sort((a, b) => Number(b.is_active) - Number(a.is_active))
  .slice(0, LIMIT);

console.log(`projects needing photography: ${targets.length}`, `(concurrency ${CONCURRENCY})`, flushLine());
function flushLine() {
  return "";
}

const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : {};
let done = 0, found = 0, saved = 0, consecutiveEmpty = 0, halted = false;

async function work(p) {
  if (log[p.slug]?.done) {
    done++;
    return;
  }
  const sector = p.sector ? ` Sector ${p.sector}` : "";
  const query = `${p.title}${sector} ${p.locality || "Gurugram"} ${p.developer || ""}`.replace(/\s+/g, " ").trim();
  const ownDomain = (() => {
    try {
      return new URL(/^https?:/i.test(p.specs?.["Source"] ?? "") ? p.specs["Source"] : "https://x").hostname;
    } catch {
      return "";
    }
  })();

  if (halted) return;
  let results = [];
  try {
    results = await searchImages(query);
  } catch {}
  if (results.length === 0) {
    if (++consecutiveEmpty >= 25) {
      halted = true;
      console.error(
        `\nHALTED: 25 searches in a row returned nothing — the engine is refusing us.\n` +
          `${done} projects done. Re-run later to continue; finished projects are skipped.`,
      );
      return;
    }
  } else consecutiveEmpty = 0;

  const candidates = results
    .filter((r) => !isBlocked(r.image))
    // Bing does not always report dimensions, so size is enforced on the
    // downloaded file rather than on the search result.
    .filter((r) => !r.width || (r.width >= 700 && r.height >= 400))
    // Developer's own domain first, then everything else in relevance order.
    .sort((a, b) => {
      const aOwn = ownDomain && a.image.includes(ownDomain) ? 0 : 1;
      const bOwn = ownDomain && b.image.includes(ownDomain) ? 0 : 1;
      return aOwn - bOwn;
    });

  const kept = [];
  for (const c of candidates) {
    if (kept.length >= WANT) break;
    const dest = path.join(INCOMING, p.slug, `${kept.length}.webp`);
    try {
      const size = await download(c.image, dest);
      if (size) {
        kept.push({
          path: `/verticals/realestate/clients/high-properties/_incoming/${p.slug}/${kept.length}.webp`,
          source: c.image,
          sourcePage: c.url ?? "",
          host: new URL(c.image).hostname,
          title: c.title ?? "",
        });
      }
    } catch {}
  }

  log[p.slug] = { done: true, query, candidates: candidates.length, kept };
  done++;
  if (kept.length) found++;
  saved += kept.length;
  if (done % 20 === 0) {
    console.log(`  ${done}/${targets.length} · projects with candidates ${found} · images ${saved}`);
    fs.writeFileSync(LOG, JSON.stringify(log, null, 1));
  }
  await sleep(700 + Math.random() * 700);
}

const queue = [...targets];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await work(queue.shift());
  }),
);
fs.writeFileSync(LOG, JSON.stringify(log, null, 1));
console.log(`DONE — ${done} projects · ${found} with candidates · ${saved} images into _incoming/`);
