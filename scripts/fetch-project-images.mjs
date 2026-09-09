/**
 * Downloads project photography referenced in the HRERA dataset so the site
 * serves it from our own origin instead of hotlinking ~200 developer domains.
 *
 * Writes to public/verticals/realestate/clients/high-properties/projects/<slug>/
 * and emits scripts/data/project-image-map.json, which rera-to-properties.mjs
 * reads to emit local paths. Re-running skips files already on disk.
 *
 * These remain third-party assets: self-hosting changes where they are served
 * from, not who owns them. Confirm usage rights per developer before launch.
 *
 *   node scripts/fetch-project-images.mjs [--max-per-project 6] [--concurrency 8]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "scripts/data/hrera-gurugram-projects.json");
const OUT_DIR = path.join(ROOT, "public/verticals/realestate/clients/high-properties/projects");
const MAP_OUT = path.join(ROOT, "scripts/data/project-image-map.json");
const PUBLIC_PREFIX = "/verticals/realestate/clients/high-properties/projects";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? Number(process.argv[i + 1]) : dflt;
};
const MAX_PER_PROJECT = arg("max-per-project", 6);
const CONCURRENCY = arg("concurrency", 8);
const MIN_BYTES = 8 * 1024; // below this it is a spacer/logo, not photography
const MAX_BYTES = 6 * 1024 * 1024;

const EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" };

const projects = JSON.parse(fs.readFileSync(SRC, "utf8"));
const map = fs.existsSync(MAP_OUT) ? JSON.parse(fs.readFileSync(MAP_OUT, "utf8")) : {};

const jobs = [];
for (const proj of projects) {
  const m = proj.media || {};
  const urls = [];
  if (m.hero) urls.push(m.hero);
  for (const u of m.gallery || []) if (!urls.includes(u)) urls.push(u);
  if (!urls.length) continue;
  const slug = proj.slug.replace(/-gurgaon$/, "");
  jobs.push({ slug, name: proj.name, urls: urls.slice(0, MAX_PER_PROJECT) });
}

let done = 0, saved = 0, skipped = 0, failed = 0, bytes = 0;

async function fetchOne(slug, url, index) {
  const dir = path.join(OUT_DIR, slug);
  const existing = fs.existsSync(dir)
    ? fs.readdirSync(dir).find((f) => f.startsWith(`${index}.`))
    : null;
  if (existing) {
    skipped++;
    return `${PUBLIC_PREFIX}/${slug}/${existing}`;
  }
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HighPropertiesBot/1.0)" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").split(";")[0].trim();
    const ext = EXT[type];
    if (!ext) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < MIN_BYTES || buf.length > MAX_BYTES) return null;
    fs.mkdirSync(dir, { recursive: true });
    const file = `${index}${ext}`;
    fs.writeFileSync(path.join(dir, file), buf);
    saved++;
    bytes += buf.length;
    return `${PUBLIC_PREFIX}/${slug}/${file}`;
  } catch {
    return null;
  }
}

async function run(job) {
  const out = [];
  for (const [i, url] of job.urls.entries()) {
    const local = await fetchOne(job.slug, url, i);
    if (local) out.push({ path: local, source: url, alt: `${job.name} — view ${i + 1}` });
    else failed++;
  }
  if (out.length) map[job.slug] = out;
  done++;
  if (done % 25 === 0) {
    console.log(`  ${done}/${jobs.length} projects · saved ${saved} · reused ${skipped} · ${(bytes / 1e6).toFixed(0)} MB`);
    fs.writeFileSync(MAP_OUT, JSON.stringify(map, null, 1));
  }
}

console.log(`projects with media: ${jobs.length} · up to ${MAX_PER_PROJECT} images each`);
const queue = [...jobs];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await run(queue.shift());
  }),
);
fs.writeFileSync(MAP_OUT, JSON.stringify(map, null, 1));
console.log(`DONE — ${Object.keys(map).length} projects · ${saved} saved · ${skipped} reused · ${failed} unusable · ${(bytes / 1e6).toFixed(0)} MB`);
