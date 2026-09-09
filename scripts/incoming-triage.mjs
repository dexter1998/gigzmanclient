/**
 * Triage + contact sheets for the search-sourced batch in _incoming/.
 *
 * Same discipline as the first batch: arithmetic first (a picture that shows up
 * under several unrelated projects is a stock shot or a site logo, not the
 * project), then eyes on what survives. Nothing moves into the live folder
 * until it has been looked at.
 *
 *   node scripts/incoming-triage.mjs          # report + sheets
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public/verticals/realestate/clients/high-properties/_incoming");
const REPORT = path.join(ROOT, "scripts/data/incoming-triage.json");
const SHEETS = "/tmp/sheets";
const SHARED_LIMIT = 3;

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
for (const e of files) {
  try {
    e.hash = await dhash(e.file);
    const g = byHash.get(e.hash) ?? new Set();
    g.add(e.project);
    byHash.set(e.hash, g);
  } catch {
    e.reject = "unreadable";
  }
}
for (const e of files) {
  if (e.reject) continue;
  const n = byHash.get(e.hash).size;
  if (n >= SHARED_LIMIT) e.reject = `shared across ${n} projects`;
}

const kept = files.filter((f) => !f.reject);

/**
 * One picture per project, reviewed by eye, rather than five per project
 * reviewed never. Search-sourced photography is the weaker source of the two,
 * so every project gets a single verified card image; the projects with real
 * developer galleries already have theirs from the first crawl.
 *
 * Candidates are ordered by the search's own ranking, so the lowest-numbered
 * surviving file is the best guess for each project.
 */
const heroes = new Map();
for (const k of kept.sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }))) {
  if (!heroes.has(k.project)) heroes.set(k.project, k);
}
const seen = new Map();
for (const k of heroes.values()) if (!seen.has(k.hash)) seen.set(k.hash, k);
// These come straight from the in-memory scan, so `file` is absolute here —
// unlike the JSON report, which stores paths relative to the repo root.
const distinct = [...seen.values()].map((d) => ({ ...d, abs: d.file }));

fs.writeFileSync(
  REPORT,
  JSON.stringify(
    {
      kept: kept.map(({ project, file, hash }) => ({ project, file: path.relative(ROOT, file), hash })),
      rejected: files.filter((f) => f.reject).map(({ project, file, reject, hash }) => ({
        project,
        file: path.relative(ROOT, file),
        reason: reject,
        hash,
      })),
      distinct: distinct.map(({ project, abs, hash }) => ({ project, file: path.relative(ROOT, abs), hash })),
    },
    null,
    1,
  ),
);

console.log(`incoming files    ${files.length} across ${new Set(files.map((f) => f.project)).size} projects`);
console.log(`  auto-rejected   ${files.length - kept.length}`);
console.log(`  kept            ${kept.length} (${distinct.length} distinct pictures)`);

// contact sheets over the distinct set
const COLS = 6, ROWS = 5, CELL = 300, LABEL = 26, PER = COLS * ROWS;
fs.mkdirSync(SHEETS, { recursive: true });
fs.writeFileSync(
  path.join(SHEETS, "incoming-index.json"),
  JSON.stringify(distinct.map(({ project, abs, hash }) => ({ project, file: path.relative(ROOT, abs), hash })), null, 1),
);
for (let s = 0; s < Math.ceil(distinct.length / PER); s++) {
  const slice = distinct.slice(s * PER, (s + 1) * PER);
  const tiles = [];
  for (const [i, e] of slice.entries()) {
    const n = s * PER + i;
    const x = (i % COLS) * CELL;
    const y = Math.floor(i / COLS) * (CELL + LABEL);
    try {
      tiles.push({
        input: await sharp(e.abs).resize(CELL - 6, CELL - 6, { fit: "cover" }).toBuffer(),
        left: x + 3,
        top: y + 3,
      });
    } catch {}
    tiles.push({
      input: Buffer.from(
        `<svg width="${CELL}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/>` +
          `<text x="6" y="18" font-family="monospace" font-size="15" fill="#fff">#${n}</text>` +
          `<text x="52" y="18" font-family="monospace" font-size="11" fill="#9ca">${e.project.slice(0, 34)}</text></svg>`,
      ),
      left: x,
      top: y + CELL,
    });
  }
  await sharp({ create: { width: COLS * CELL, height: ROWS * (CELL + LABEL), channels: 3, background: "#222" } })
    .composite(tiles)
    .jpeg({ quality: 78 })
    .toFile(path.join(SHEETS, `incoming-${String(s).padStart(2, "0")}.jpg`));
}
console.log(`sheets: ${Math.ceil(distinct.length / PER)} in ${SHEETS}/incoming-*.jpg`);
