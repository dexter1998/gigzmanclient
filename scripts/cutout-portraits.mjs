/**
 * Green-screen cutout for Evergreen's team portraits.
 *
 * The four photographs were shot on a chroma-green backdrop, but the advisor
 * cards render a transparent cutout directly on the card's forest gradient —
 * a rectangular photo with its own background reads as a pasted-in box there.
 * This keys the green out, suppresses the spill it leaves on hair and
 * shoulders, and writes the alpha-WebP the cards actually load.
 *
 *   node scripts/cutout-portraits.mjs
 *
 * Sources are vendored under source-data/evergreen-team-portraits/ so this
 * runs on any checkout rather than depending on one laptop's Downloads
 * folder — same rule as the farmhouse imagery.
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "source-data/evergreen-team-portraits");
const OUT = join(root, "public/verticals/realestate/templates/premium-v2/people");

/**
 * A pixel is backdrop when green leads both other channels by a wide margin.
 * Between the two thresholds alpha ramps rather than switching, so hair edges
 * don't come out as a stair-step cutout.
 */
const HARD = 90; // g − max(r,b) at or above this → fully transparent
const SOFT = 30; // below this → untouched

/** Source file → the person it is, named as the site names them. */
const PORTRAITS = [
  { src: "portrait-01.png", out: "evergreen-hasan-khan.webp" },
  { src: "portrait-02.png", out: "evergreen-munasif-khan.webp" },
  { src: "portrait-03.png", out: "evergreen-aakil-khan.webp" },
  { src: "portrait-04.png", out: "evergreen-aasif-khan.webp" },
];

for (const { src, out } of PORTRAITS) {
  const { data, info } = await sharp(join(SRC, src), { failOn: "none" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dominance = g - Math.max(r, b);
    if (dominance < SOFT) continue;

    const t = Math.min(1, (dominance - SOFT) / (HARD - SOFT));
    data[i + 3] = Math.round(data[i + 3] * (1 - t));
    // Spill suppression on whatever survives the key: pull green back to the
    // mean of the other channels so edge pixels stop reading as green fringe.
    if (data[i + 3] > 0) data[i + 1] = Math.round((r + b) / 2);
  }

  const keyed = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const buf = await sharp(keyed)
    .trim({ threshold: 1 }) // drop the empty border the key leaves behind
    .resize({ width: 900, withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 90, effort: 6 })
    .toBuffer();

  writeFileSync(join(OUT, out), buf);
  const m = await sharp(buf).metadata();
  console.log(`${out.padEnd(30)} ${m.width}x${m.height}  ${(buf.length / 1024).toFixed(0)}KB`);
}
