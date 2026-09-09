/**
 * First pass over the scraped project photography: arithmetic only, no taste.
 *
 * The scraper took every large image on a developer's project page, which also
 * caught the page furniture — nav logos, app-store badges, footer banners. Two
 * signals separate those from the project itself without anyone looking:
 *
 *   - the same picture appearing on several projects is the developer's site
 *     chrome, not any one project;
 *   - logos and badges are small, and banners are extreme strips.
 *
 * Rejected files are moved to _quarantine/, never deleted, so a wrong call is
 * one `mv` away from being undone.
 *
 *   node scripts/image-triage.mjs [--apply]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public/verticals/realestate/clients/high-properties/projects");
const QUARANTINE = path.join(ROOT, "public/verticals/realestate/clients/high-properties/_quarantine");
const REPORT = path.join(ROOT, "scripts/data/image-triage.json");
const APPLY = process.argv.includes("--apply");

const SHARED_LIMIT = 3; // on this many projects or more => site chrome
const MIN_W = 700;
const MIN_H = 400;
const MAX_RATIO = 2.6;
const MIN_RATIO = 0.75;

/** 64-bit difference hash — tolerant of re-encoding, strict enough for "same picture". */
async function dhash(file) {
  const buf = await sharp(file).resize(9, 8, { fit: "fill" }).grayscale().raw().toBuffer();
  let bits = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += buf[y * 9 + x] > buf[y * 9 + x + 1] ? "1" : "0";
  return bits;
}

const files = [];
for (const project of fs.readdirSync(DIR)) {
  const p = path.join(DIR, project);
  if (!fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) files.push({ project, file: path.join(p, f) });
}

const byHash = new Map();
for (const entry of files) {
  try {
    const meta = await sharp(entry.file).metadata();
    entry.w = meta.width ?? 0;
    entry.h = meta.height ?? 0;
    entry.ratio = entry.w / Math.max(1, entry.h);
    entry.hash = await dhash(entry.file);
    const g = byHash.get(entry.hash) ?? { projects: new Set(), files: [] };
    g.projects.add(entry.project);
    g.files.push(entry);
    byHash.set(entry.hash, g);
  } catch {
    entry.reject = "unreadable";
  }
}

for (const entry of files) {
  if (entry.reject) continue;
  const shared = byHash.get(entry.hash).projects.size;
  if (shared >= SHARED_LIMIT) entry.reject = `shared across ${shared} projects`;
  else if (entry.w < MIN_W || entry.h < MIN_H) entry.reject = `too small ${entry.w}x${entry.h}`;
  else if (entry.ratio > MAX_RATIO) entry.reject = `banner strip ${entry.ratio.toFixed(2)}`;
  else if (entry.ratio < MIN_RATIO) entry.reject = `portrait ${entry.ratio.toFixed(2)}`;
}

const rejected = files.filter((f) => f.reject);
const kept = files.filter((f) => !f.reject);
const keptDistinct = new Set(kept.map((f) => f.hash));

console.log(`files            ${files.length}`);
console.log(`  rejected       ${rejected.length}`);
for (const [reason, n] of Object.entries(
  rejected.reduce((a, f) => ((a[f.reject.split(" ")[0]] = (a[f.reject.split(" ")[0]] ?? 0) + 1), a), {}),
))
  console.log(`      ${reason.padEnd(14)} ${n}`);
console.log(`  kept           ${kept.length}  (${keptDistinct.size} distinct pictures)`);
console.log(`projects with kept images: ${new Set(kept.map((f) => f.project)).size}`);

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(
  REPORT,
  JSON.stringify(
    {
      kept: kept.map(({ project, file, w, h, hash }) => ({ project, file: path.relative(ROOT, file), w, h, hash })),
      rejected: rejected.map(({ project, file, reject, hash, w, h }) => ({
        project,
        file: path.relative(ROOT, file),
        reason: reject,
        hash,
        w,
        h,
      })),
    },
    null,
    1,
  ),
);

if (APPLY) {
  for (const f of rejected) {
    const dest = path.join(QUARANTINE, f.project, path.basename(f.file));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(f.file, dest);
  }
  // Drop project folders that are now empty.
  for (const project of fs.readdirSync(DIR)) {
    const p = path.join(DIR, project);
    if (fs.statSync(p).isDirectory() && fs.readdirSync(p).length === 0) fs.rmdirSync(p);
  }
  console.log(`\nmoved ${rejected.length} files to _quarantine/`);
}
