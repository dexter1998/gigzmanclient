/**
 * Downscales and re-encodes the self-hosted project photography.
 *
 * Developer sites serve full-bleed originals — the raw download runs to
 * ~540 MB, which is far too much to carry in the repo and ship to the edge.
 * Nothing on a listing page renders wider than the gallery, so 1600px on the
 * long edge at WebP q78 is lossless in practice and cuts the payload by an
 * order of magnitude.
 *
 * Rewrites scripts/data/project-image-map.json in place, then re-run
 * `node scripts/rera-to-properties.mjs` to pick up the new extensions.
 *
 *   node scripts/optimise-project-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const MAP = path.join(ROOT, "scripts/data/project-image-map.json");
const PUBLIC = path.join(ROOT, "public");

const MAX_EDGE = 1600;
const QUALITY = 78;
const CONCURRENCY = 6;

const map = JSON.parse(fs.readFileSync(MAP, "utf8"));
const tasks = [];
for (const [slug, imgs] of Object.entries(map)) {
  imgs.forEach((img, i) => tasks.push({ slug, i, img }));
}

let before = 0, after = 0, done = 0, failed = 0;

async function convert(t) {
  const abs = path.join(PUBLIC, t.img.path.replace(/^\//, ""));
  if (!fs.existsSync(abs)) {
    failed++;
    return;
  }
  const src = fs.statSync(abs).size;
  const out = abs.replace(/\.(jpe?g|png|webp|avif)$/i, ".webp");
  try {
    const buf = await sharp(abs)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    // Keep whichever is smaller, but always land on the .webp path so the
    // generated YAML has one extension to reason about.
    const keep = buf.length < src ? buf : fs.readFileSync(abs);
    fs.writeFileSync(out, keep);
    if (out !== abs) fs.unlinkSync(abs);
    before += src;
    after += keep.length;
    map[t.slug][t.i] = { ...t.img, path: t.img.path.replace(/\.(jpe?g|png|avif)$/i, ".webp") };
  } catch {
    failed++;
  }
  done++;
  if (done % 200 === 0) {
    console.log(`  ${done}/${tasks.length} · ${(before / 1e6).toFixed(0)} MB → ${(after / 1e6).toFixed(0)} MB`);
  }
}

console.log(`optimising ${tasks.length} images`);
const queue = [...tasks];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await convert(queue.shift());
  }),
);
fs.writeFileSync(MAP, JSON.stringify(map, null, 1));
console.log(
  `DONE — ${done} converted, ${failed} failed · ${(before / 1e6).toFixed(0)} MB → ${(after / 1e6).toFixed(0)} MB ` +
    `(${before ? Math.round((1 - after / before) * 100) : 0}% smaller)`,
);
