/**
 * Turns the HRERA Gurugram register into `properties.yaml` rows.
 *
 * Source: scripts/data/hrera-gurugram-projects.json — 1,029 project records
 * built from the authority's registered-projects list plus each project's own
 * Form REP-I filing (haryanarera.gov.in). Everything written here is the
 * promoter's own declaration; nothing is invented.
 *
 * The 12 hand-written placeholder listings already in properties.yaml are kept
 * as-is and re-emitted first — profile.yaml notes their slugs were picked to
 * fill specific Premium V2 homepage sections, so dropping them would leave
 * those sections short. Retire them once the homepage is verified against real
 * inventory.
 *
 *   node scripts/rera-to-properties.mjs
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "scripts/data/hrera-gurugram-projects.json");
const OUT = path.join(ROOT, "clients/high-properties/content/properties.yaml");

const projects = JSON.parse(fs.readFileSync(SRC, "utf8"));

// Written by scripts/fetch-project-images.mjs. Present => listings point at
// our own /public copies; absent => they carry no imagery rather than
// hotlinking the developer's origin.
const IMAGE_MAP = path.join(ROOT, "scripts/data/project-image-map.json");
const localImages = fs.existsSync(IMAGE_MAP) ? JSON.parse(fs.readFileSync(IMAGE_MAP, "utf8")) : {};
const existing = YAML.parse(fs.readFileSync(OUT, "utf8"));
const keep = (existing?.properties ?? []).filter((p) => !p._rera);

const TYPE = {
  "Group Housing": "apartment",
  "Independent Floors": "builder_floor",
  "Plotted / Township": "plot",
  Commercial: "commercial",
  "Affordable Housing": "apartment",
  "Other / Unclassified": "apartment",
};

const MONTH = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TODAY = new Date("2026-09-08");

const iso = (s) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s) : null);
const monthYear = (s) => {
  const d = iso(s);
  return d ? `${MONTH[d.getMonth()]} ${d.getFullYear()}` : null;
};
// Filings are written in caps, so title-casing is needed — but it would also
// flatten the acronyms the trade actually uses (STP, EWS, DG, NOC).
const ACRONYMS = new Set([
  "STP", "ETP", "WTP", "EWS", "LIG", "MIG", "HIG", "DG", "RCC", "CCTV", "NOC",
  "FAR", "PLC", "EDC", "IDC", "SCO", "DDJAY", "PMAY", "HUDA", "HSVP", "DHBVN",
  "TCP", "AAI", "OC", "CC", "LED", "PVC", "RO", "AC", "TV", "BHK", "II", "III", "IV",
  "ATS", "DLF", "BPTP", "SS", "AIPL", "MRG", "ROF", "GLS", "JMS", "M3M", "IREO",
  "CHD", "NBCC", "TDI", "KLJ", "RPS", "SRS", "OSB", "SRB", "VSR",
]);
const titleCase = (s) =>
  String(s || "")
    .split(/(\s+)/)
    .map((w) => {
      const bare = w.replace(/[^A-Za-z0-9]/g, ""); // keep digits: M3M, 3C
      if (bare && ACRONYMS.has(bare.toUpperCase())) return w.toUpperCase();
      return w.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
    })
    .join("")
    .replace(/\bAnd\b/g, "and")
    .replace(/\bOf\b/g, "of");
const n0 = (v) => (v == null ? null : Math.round(v).toLocaleString("en-IN"));

/**
 * `properties.rera_number` is varchar(60), but a register entry can carry a
 * supersession note or a "Lapsed Project" marker after the number itself.
 * Keep the certificate number for the column; the untrimmed string stays in
 * specs so nothing the authority published is lost.
 */
function reraNumberFor(full) {
  if (!full) return null;
  const primary = String(full)
    .split(/\s*\(/)[0]
    .replace(/\s*(Lapsed|Cancelled|Revoked)\s*Project\s*$/i, "")
    .trim();
  return primary.length <= 60 ? primary : primary.slice(0, 60).trim();
}

/** new_launch / under_construction / ready_to_move from the filing's own dates. */
function statusOf(p) {
  const done = iso(p.delivery?.completion_date);
  const pct = p.delivery?.pct_complete;
  if (pct != null && pct >= 100) return "ready_to_move";
  if (p.stage === "NEW" && done && done > TODAY) return "new_launch";
  return "under_construction";
}

function badgeOf(p) {
  if (p.status === "Lapsed") return "Registration lapsed";
  if (p.delivery?.delayed) return "Past completion date";
  if (p.inventory?.units_unsold) return `${n0(p.inventory.units_unsold)} units unsold`;
  return "RERA registered";
}

/**
 * A paragraph built only from this project's own filed numbers, so no two
 * listings read the same and nothing is asserted that the promoter did not.
 */
function describe(p) {
  const s = [];
  const sec = p.location.sectors?.[0];
  const where = sec ? `Sector ${sec}, ${p.location.subcity}` : p.location.subcity;
  const type = (p.ptype || "project").replace(" / ", " and ").toLowerCase();

  s.push(
    `${p.name} is a ${type} project by ${p.builder} in ${where}, registered with the Haryana Real Estate Regulatory Authority under ${p.rera.registrations?.[0]?.reg_no || "its HRERA registration"}.`,
  );
  if (p.land?.area_acre) {
    s.push(`The promoter has declared a project area of ${p.land.area_acre} acres.`);
  }
  const inv = p.inventory || {};
  if (inv.units_total) {
    s.push(
      inv.units_unsold != null
        ? `Of the ${n0(inv.units_total)} units filed, ${n0(inv.units_booked)} were booked and ${n0(inv.units_unsold)} remained unsold at the date of the filing.`
        : `${n0(inv.units_total)} units are filed for the project.`,
    );
  } else if (inv.plot_min_sqm) {
    s.push(
      `Plot sizes filed for the project run from ${inv.plot_min_sqm} to ${inv.plot_max_sqm} sq m.`,
    );
  }
  const c = p.compliance || {};
  if (c.obtained != null) {
    s.push(
      c.pending
        ? `${c.obtained} statutory approvals are recorded as obtained and ${c.pending} as still pending.`
        : `All ${c.obtained} statutory approvals listed in the filing are recorded as obtained.`,
    );
  }
  const ext = Object.values(c.external || {});
  const extOk = ext.filter((x) => x.approved === "Yes").length;
  if (ext.length) {
    s.push(
      `Agency sign-off for external services stands at ${extOk} of ${ext.length} — covering roads, water, electricity, sewage and storm-water drainage.`,
    );
  }
  const done = monthYear(p.delivery?.completion_date);
  if (done) {
    s.push(
      p.delivery.delayed
        ? `The completion date filed with the authority was ${done}${p.delivery.pct_complete != null ? `, with infrastructure reported ${p.delivery.pct_complete}% complete` : ""} — that date has now passed.`
        : `The filed completion date is ${done}${p.delivery.pct_complete != null ? `, with infrastructure reported ${p.delivery.pct_complete}% complete` : ""}.`,
    );
  }
  if (p.rera?.licences?.length) {
    s.push(`It is developed on town-planning licence ${p.rera.licences.join(", ")}.`);
  }
  if (p.rera?.is_owner_licensee === "No" && p.rera?.licensees?.length) {
    s.push(
      `The land licence is held by ${titleCase(p.rera.licensees[0])}, with the promoter developing under a collaboration arrangement.`,
    );
  }
  s.push(
    "All figures are as declared by the promoter to HRERA Gurugram and are not independently verified.",
  );
  return s.join(" ");
}

/** specs is Record<string,string>, so every value is flattened to a string. */
function specsOf(p) {
  const o = {};
  const put = (k, v) => {
    if (v !== null && v !== undefined && v !== "") o[k] = String(v);
  };
  const r = p.rera || {}, l = p.land || {}, i = p.inventory || {}, d = p.delivery || {}, c = p.compliance || {};
  put("RERA registration", r.registrations?.[0]?.reg_no);
  if (r.n_registrations > 1)
    put("All registrations", r.registrations.map((x) => x.reg_no).join(" · "));
  put("RERA valid up to", r.valid_upto);
  put("Registrations on file", r.n_registrations > 1 ? `${r.n_registrations} (phased)` : null);
  put("Town planning licence", r.licences?.join(", "));
  put("Licensee", r.licensees?.length ? titleCase(r.licensees[0]) : null);
  put("Promoter is licensee", r.is_owner_licensee);
  put("Promoter CIN", r.cin);
  put("Project stage", p.stage === "NEW" ? "New project" : "Ongoing project");
  put("Land area", l.area_acre ? `${l.area_acre} acres` : null);
  put("Permissible FAR", l.far_permissible ? `${l.far_permissible}%` : null);
  put("Proposed FAR", l.far_proposed ? `${l.far_proposed}%` : null);
  put("Total units", n0(i.units_total));
  put("Units booked", n0(i.units_booked));
  put("Units unsold", n0(i.units_unsold));
  put("Sold through", i.pct_sold != null ? `${i.pct_sold}%` : null);
  put("Plot size range", i.plot_min_sqm ? `${i.plot_min_sqm}–${i.plot_max_sqm} sq m` : null);
  // A filing often repeats one label per phase ("PLOT" x6); the reader only
  // needs the distinct set.
  put(
    "Unit types filed",
    i.items?.length ? [...new Set(i.items.map((x) => titleCase(x.type)))].slice(0, 8).join(" · ") : null,
  );
  put("Declared completion", monthYear(d.completion_date));
  put("Infrastructure complete", d.pct_complete != null ? `${d.pct_complete}%` : null);
  put("Delivery status", d.completion_date ? (d.delayed ? "Past filed completion date" : "Within filed timeline") : null);
  put("Layout plan approved", d.layout_plan_date);
  put("Building plan approved", d.building_plan_date);
  put("Statutory approvals", c.obtained != null ? `${c.obtained} obtained, ${c.pending ?? 0} pending` : null);
  const ext = Object.entries(c.external || {});
  if (ext.length) {
    put("External service approvals", `${ext.filter(([, v]) => v.approved === "Yes").length} of ${ext.length} obtained`);
    for (const [k, v] of ext) put(`External — ${titleCase(k)}`, `${v.agency} · ${v.approved === "Yes" ? "approved" : "not taken"}`);
  }
  const pk = p.parking || {};
  const pkTotal = Object.values(pk).reduce((a, b) => a + (b || 0), 0);
  put("Parking bays", pkTotal ? n0(pkTotal) : null);
  put("Project cost", p.cost?.total_lakh ? `₹${(p.cost.total_lakh / 100).toFixed(2)} Cr` : null);
  put("Litigation declared", r.litigation || null);
  put("Source", "HRERA Gurugram — Form REP-I");
  put("Source record", r.certificate_url);
  put("Map", p.maps?.search_url);
  return o;
}

const rows = projects.map((p, idx) => {
  const sec = p.location.sectors?.[0] ?? null;
  const slug = p.slug.replace(/-gurgaon$/, "");
  const where = `${sec ? `Sector ${sec}, ` : ""}${p.location.subcity}`;
  const images = (localImages[slug] ?? []).map((img, j) => ({
    path: img.path,
    alt: j === 0 ? `${p.name}, ${where}` : img.alt,
    is_primary: j === 0,
  }));

  return {
    _rera: true,
    slug,
    title: p.name,
    property_type: TYPE[p.ptype] ?? "apartment",
    purpose: "buy",
    status: statusOf(p),
    price: null,
    // HRERA filings carry no unit pricing — never invent one.
    price_label: "Price on request",
    price_per_sqft: null,
    sector: sec,
    locality: p.location.subcity,
    corridor: p.location.subcity,
    beds: null,
    baths: null,
    // Project-level land area; unit carpet areas live in specs.
    area: p.land?.area_acre != null ? Math.max(1, Math.round(p.land.area_acre)) : null,
    area_unit: "acres",
    badge: badgeOf(p),
    developer: titleCase(p.parent_brand),
    rera_number: reraNumberFor(p.rera?.registrations?.[0]?.reg_no),
    description: describe(p),
    amenities: (p.amenities || []).map(titleCase),
    specs: specsOf(p),
    is_featured: false,
    is_active: p.status === "Active",
    images,
    _sort: idx,
  };
});

// Deterministic order: active first, then most land, so the grid leads with substance.
rows.sort((a, b) => Number(b.is_active) - Number(a.is_active) || (b.area ?? 0) - (a.area ?? 0));
rows.forEach((r) => delete r._sort);

const doc = { ...existing, _status: "verified-hrera", properties: [...keep, ...rows] };

const header = `# Property listings.
#
# The first ${keep.length} entries are the original Premium V2 placeholder listings —
# kept because profile.yaml notes their slugs fill specific homepage sections.
# Everything after them is generated by scripts/rera-to-properties.mjs from the
# HRERA Gurugram register (${rows.length} registered projects). Those rows carry
# \`_rera: true\` and are regenerated wholesale on each run; edit the generator,
# not this file.
#
# Prices are deliberately "Price on request" — RERA filings contain no unit
# pricing, and none is invented here. Imagery is served from our own /public
# copies (scripts/fetch-project-images.mjs); the originals remain the
# developers' property — confirm usage rights per developer before launch.

`;

fs.writeFileSync(OUT, header + YAML.stringify(doc, { lineWidth: 100 }));
console.log(`kept ${keep.length} placeholder + wrote ${rows.length} HRERA rows -> ${path.relative(ROOT, OUT)}`);
console.log(`  active ${rows.filter((r) => r.is_active).length} · with images ${rows.filter((r) => r.images.length).length}`);
