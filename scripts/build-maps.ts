/**
 * Turns the source plot-map exports into web deliverables.
 *
 * The sources are ~7450x4975 PNGs at 17-23MB each. Shipping those, or even
 * letting `next/image` optimise from them at request time, is what makes a map
 * page feel broken on a phone. Two measurements shaped what this writes:
 *
 *   - RealBetter, who these maps are modelled on, serves its map through
 *     ImageKit at 1312x668 and ~176KB, WebP, lazy-loaded, with no zoom.
 *   - Re-encoding one of these sources to WebP measured:
 *       1312px q72 -> 186KB   1600px q72 -> 259KB
 *       2000px q72 -> 370KB   2560px q72 -> ~520KB
 *
 * So one 2560px WebP is written per map — roughly a 40x reduction — and
 * `next/image` narrows it further per breakpoint for inline display. The extra
 * resolution over RealBetter's 1312px is deliberate: these are plot maps, and
 * plot numbers have to stay legible when a buyer opens the map full screen,
 * which is the one thing their pages cannot do.
 *
 * A 20px blur placeholder is emitted alongside as a base64 data URI, so the
 * page paints something immediately rather than a grey box.
 *
 * Usage: pnpm tsx scripts/build-maps.ts <source-dir> [<source-dir> ...]
 */
import { readdirSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import sharp from "sharp";

const OUT_DIR = "public/verticals/realestate/templates/premium-v2/maps";
const BLUR_FILE = "lib/maps/blur-placeholders.json";

const DISPLAY_WIDTH = 2560;
const QUALITY = 72;

/** `08-dlf-phase-3-clean.png` -> `dlf-phase-3`. */
function slugFor(file: string): string {
  return basename(file)
    .replace(/\.[a-z]+$/i, "")
    .replace(/^\d+-/, "")
    .replace(/-clean$/, "");
}

async function main() {
  const dirs = process.argv.slice(2);
  if (dirs.length === 0) {
    console.error("usage: tsx scripts/build-maps.ts <source-dir> [...]");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync("lib/maps", { recursive: true });

  const sources: string[] = [];
  for (const dir of dirs) {
    for (const f of readdirSync(dir)) {
      if (/\.(png|jpe?g|webp|tiff?)$/i.test(f)) sources.push(join(dir, f));
    }
  }
  sources.sort();

  const blur: Record<string, string> = {};
  let inBytes = 0;
  let outBytes = 0;

  for (const src of sources) {
    const slug = slugFor(src);
    const outPath = join(OUT_DIR, `${slug}.webp`);

    const image = sharp(src);
    const meta = await image.metadata();
    // Never upscale: a source narrower than the target is written as-is.
    const width = Math.min(DISPLAY_WIDTH, meta.width ?? DISPLAY_WIDTH);

    const buf = await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toBuffer();
    writeFileSync(outPath, buf);

    const placeholder = await sharp(src)
      .resize({ width: 20 })
      .webp({ quality: 30 })
      .toBuffer();
    blur[slug] = `data:image/webp;base64,${placeholder.toString("base64")}`;

    inBytes += statSync(src).size;
    outBytes += buf.length;
    console.log(
      `${slug.padEnd(24)} ${meta.width}x${meta.height} -> ${width}px  ` +
        `${(statSync(src).size / 1048576).toFixed(1)}MB -> ${(buf.length / 1024).toFixed(0)}KB`,
    );
  }

  writeFileSync(BLUR_FILE, JSON.stringify(blur, null, 2));

  console.log(
    `\n${sources.length} maps  ${(inBytes / 1048576).toFixed(0)}MB -> ` +
      `${(outBytes / 1048576).toFixed(1)}MB  (${(inBytes / outBytes).toFixed(0)}x smaller)`,
  );
  console.log(`blur placeholders -> ${BLUR_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
