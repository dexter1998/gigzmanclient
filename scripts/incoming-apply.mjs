/**
 * Promotes the reviewed hero images out of _incoming/ into the live folder.
 *
 * One image per project, and only where the review passed it. What the review
 * rejected — broker watermarks, phone-number ads, blog headlines, price cards,
 * launch-event and news screenshots — is dropped rather than quarantined: it
 * can always be re-fetched, and there is no reason to keep 2 GB of it.
 *
 *   node scripts/incoming-apply.mjs [--apply]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const REPORT = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/data/incoming-triage.json"), "utf8"));
const VERDICT = JSON.parse(fs.readFileSync("/tmp/incoming-verdict.json", "utf8"));
const INDEX = JSON.parse(fs.readFileSync("/tmp/sheets/incoming-index.json", "utf8"));
const LIVE = path.join(ROOT, "public/verticals/realestate/clients/high-properties/projects");
const INCOMING = path.join(ROOT, "public/verticals/realestate/clients/high-properties/_incoming");
const MAP = path.join(ROOT, "scripts/data/project-image-map.json");
const LOG = path.join(ROOT, "scripts/data/image-discovery.json");
const APPLY = process.argv.includes("--apply");

const rejectedHashes = new Set(VERDICT.reject.map((i) => INDEX[i]?.hash).filter(Boolean));

// The hero is the lowest-numbered surviving file for each project.
const heroes = new Map();
for (const k of REPORT.kept.sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }))) {
  if (!heroes.has(k.project)) heroes.set(k.project, k);
}

const approved = [...heroes.values()].filter((h) => !rejectedHashes.has(h.hash));
const rejected = [...heroes.values()].filter((h) => rejectedHashes.has(h.hash));

console.log(`projects with a candidate hero  ${heroes.size}`);
console.log(`  passed review                 ${approved.length}`);
console.log(`  rejected by review            ${rejected.length}`);

const discovery = JSON.parse(fs.readFileSync(LOG, "utf8"));
const map = JSON.parse(fs.readFileSync(MAP, "utf8"));
let added = 0;

if (APPLY) {
  for (const h of approved) {
    // Projects that already have developer photography keep it; this only
    // fills the gaps.
    if (map[h.project]?.length) continue;
    const dest = path.join(LIVE, h.project, "0.webp");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(ROOT, h.file), dest);
    const src = discovery[h.project]?.kept?.find((k) => path.basename(k.path) === path.basename(h.file));
    map[h.project] = [
      {
        path: `/verticals/realestate/clients/high-properties/projects/${h.project}/0.webp`,
        source: src?.source ?? "",
        alt: "",
      },
    ];
    added++;
  }
  fs.writeFileSync(MAP, JSON.stringify(map, null, 1));
  fs.rmSync(INCOMING, { recursive: true, force: true });
  console.log(`\npromoted ${added} hero images into the live folder; _incoming/ removed`);
  console.log(`projects in image map: ${Object.keys(map).length}`);
}
