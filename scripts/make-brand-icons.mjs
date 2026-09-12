/**
 * Favicon / home-screen icon set for a tenant, cut from its own logo.
 *
 * The shared deployment cannot use a single app/icon.png — every tenant would
 * get it — so each client's icons live in public/brand/ and are registered in
 * lib/brand-icons.ts. This generates them so the crop is reproducible rather
 * than a one-off in an image editor.
 *
 *   node scripts/make-brand-icons.mjs evergreen-real-estate
 *
 * Wordmarks are unreadable at 32px, so the source is the logo's monogram
 * region only, padded and flattened onto the brand's dark ground (the icons
 * are shown on browser chrome of any colour, so they cannot be transparent).
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Monogram crop within each logo file, plus the ground to sit it on. */
const SOURCES = {
  "evergreen-real-estate": {
    logo: "public/verticals/realestate/templates/premium-v2/brand/evergreen-real-estate-logo.png",
    // The gold roundel at the head of the wordmark, measured from the file's
    // own alpha bounds — everything right of it is the "EVERGREEN" lettering.
    crop: { left: 23, top: 45, width: 194, height: 194 },
    pad: 26,
    background: "#0a2e2c", // --gp-forest-950
  },
};

const slug = process.argv[2];
const source = SOURCES[slug];
if (!source) {
  console.error(`No icon source registered for "${slug}". Known: ${Object.keys(SOURCES).join(", ")}`);
  process.exit(1);
}

const square = await sharp(join(root, source.logo))
  .extract(source.crop)
  .extend({
    top: source.pad,
    bottom: source.pad,
    left: source.pad,
    right: source.pad,
    background: source.background,
  })
  .flatten({ background: source.background })
  .png()
  .toBuffer();

for (const size of [32, 180, 192, 512]) {
  const out = join(root, "public/brand", `${slug}-icon-${size}.png`);
  await sharp(square).resize(size, size, { fit: "cover" }).png().toFile(out);
  console.log(`${slug}-icon-${size}.png`);
}
