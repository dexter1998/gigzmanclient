/**
 * Applies the visual review to the triage result.
 *
 * The arithmetic pass over-reaches in one direction: a phased township
 * legitimately reuses one render across its phases, so "appears on several
 * projects" catches real photography as well as site chrome. Every such
 * picture was looked at; the ones that are genuinely the project are rescued
 * here, and the ones that are not — logos, award trophies, launch-event
 * galleries, stock lifestyle, press clippings — are quarantined along with the
 * junk found among the images the arithmetic had passed.
 *
 *   node scripts/image-apply-verdicts.mjs [--apply]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const REPORT = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/data/image-triage.json"), "utf8"));
const VERDICTS = JSON.parse(fs.readFileSync("/tmp/verdicts.json", "utf8"));
const QUARANTINE = path.join(ROOT, "public/verticals/realestate/clients/high-properties/_quarantine");
const APPLY = process.argv.includes("--apply");

const firstByHash = (rows) => {
  const seen = new Map();
  for (const r of rows) if (!seen.has(r.hash)) seen.set(r.hash, r);
  return [...seen.values()];
};

const keptDistinct = firstByHash(REPORT.kept);
const sharedRejected = REPORT.rejected.filter((r) => r.reason.startsWith("shared"));
const sharedDistinct = firstByHash(sharedRejected);

const killHashes = new Set([
  ...VERDICTS.kept_reject.map((i) => keptDistinct[i]?.hash),
  ...VERDICTS.shared_reject.map((i) => sharedDistinct[i]?.hash),
]);
killHashes.delete(undefined);

// Rescued: shared-rejected pictures the review kept.
const rescuedHashes = new Set(sharedDistinct.filter((_, i) => !VERDICTS.shared_reject.includes(i)).map((d) => d.hash));

const all = [...REPORT.kept, ...REPORT.rejected];
const quarantine = [];
const keep = [];
for (const f of all) {
  const wasSizeReject = REPORT.rejected.includes(f) && !f.reason?.startsWith("shared");
  if (killHashes.has(f.hash)) quarantine.push({ ...f, why: "review: not the project" });
  else if (f.reason && !f.reason.startsWith("shared")) quarantine.push({ ...f, why: f.reason });
  else keep.push(f);
}

console.log(`pictures reviewed   ${keptDistinct.length + sharedDistinct.length} distinct`);
console.log(`  rejected by eye   ${VERDICTS.kept_reject.length + VERDICTS.shared_reject.length}`);
console.log(`  rescued           ${rescuedHashes.size} (real renders the arithmetic would have binned)`);
console.log(`files kept          ${keep.length}`);
console.log(`files quarantined   ${quarantine.length}`);
console.log(`projects with images ${new Set(keep.map((f) => f.project)).size}`);

if (APPLY) {
  for (const f of quarantine) {
    const src = path.join(ROOT, f.file);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(QUARANTINE, f.project, path.basename(f.file));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
  }
  const dir = path.join(ROOT, "public/verticals/realestate/clients/high-properties/projects");
  for (const p of fs.readdirSync(dir)) {
    const full = path.join(dir, p);
    if (fs.statSync(full).isDirectory() && fs.readdirSync(full).length === 0) fs.rmdirSync(full);
  }
  console.log(`\nmoved ${quarantine.length} files to _quarantine/`);
}
