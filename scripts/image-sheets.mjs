/**
 * Contact sheets for reviewing scraped photography by eye.
 *
 * Reviewing 1,500 files one at a time is not practical; reviewing the distinct
 * pictures in labelled grids is. Every tile carries its index so a verdict can
 * be recorded as a list of numbers.
 *
 *   node scripts/image-sheets.mjs kept|shared
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const REPORT = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/data/image-triage.json"), "utf8"));
const OUT = "/tmp/sheets";
const SET = process.argv[2] ?? "kept";

const COLS = 6, ROWS = 5, CELL = 300, LABEL = 26;
const PER = COLS * ROWS;

/** One entry per distinct picture; the first file that carries it stands in. */
function distinct(entries) {
  const seen = new Map();
  for (const e of entries) if (!seen.has(e.hash)) seen.set(e.hash, e);
  return [...seen.values()];
}

let entries;
if (SET === "kept") {
  entries = distinct(REPORT.kept);
} else {
  // Rejected only for being on several projects — a phased township legitimately
  // reuses one render across its phases, so these need eyes before they go.
  entries = distinct(REPORT.rejected.filter((r) => r.reason.startsWith("shared")));
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, `${SET}-index.json`), JSON.stringify(entries, null, 1));

const sheets = Math.ceil(entries.length / PER);
for (let s = 0; s < sheets; s++) {
  const slice = entries.slice(s * PER, (s + 1) * PER);
  const tiles = [];
  for (const [i, e] of slice.entries()) {
    const n = s * PER + i;
    const x = (i % COLS) * CELL;
    const y = Math.floor(i / COLS) * (CELL + LABEL);
    try {
      const img = await sharp(path.join(ROOT, e.file))
        .resize(CELL - 6, CELL - 6, { fit: "cover" })
        .toBuffer();
      tiles.push({ input: img, left: x + 3, top: y + 3 });
    } catch {}
    const caption = Buffer.from(
      `<svg width="${CELL}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/>` +
        `<text x="6" y="18" font-family="monospace" font-size="15" fill="#fff">#${n}</text>` +
        `<text x="52" y="18" font-family="monospace" font-size="11" fill="#9ca">${
          e.project.slice(0, 34)
        }</text></svg>`,
    );
    tiles.push({ input: caption, left: x, top: y + CELL });
  }
  await sharp({
    create: {
      width: COLS * CELL,
      height: ROWS * (CELL + LABEL),
      channels: 3,
      background: "#222",
    },
  })
    .composite(tiles)
    .jpeg({ quality: 78 })
    .toFile(path.join(OUT, `${SET}-${String(s).padStart(2, "0")}.jpg`));
}
console.log(`${entries.length} distinct pictures -> ${sheets} sheets in ${OUT}/${SET}-*.jpg`);
