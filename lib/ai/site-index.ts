import { getFirmSettings, getProperties, getLocalities, getServices } from "@/lib/content";
import { basePathFor, type Tenant } from "@/lib/tenant";
import { joinPath } from "@/lib/paths";
import { PROPERTY_TYPE_LABELS, formatIndianPrice } from "@/lib/format";
import { serviceLinesFor } from "@/lib/premium-v2/services";
import { MAP_AREAS } from "@/lib/maps/areas";

/**
 * The grounding context handed to the model.
 *
 * Everything the assistant is allowed to say comes from here. It is built
 * from the same database rows the pages render, so an answer cannot describe
 * inventory the site does not have, and every reference carries the path of
 * the page that backs it — the assistant answers and then points at the page,
 * it does not replace it.
 *
 * Deliberately capped. A tenant with 822 listings would blow past a sensible
 * prompt if every row went in, so listings are summarised as counts by type,
 * corridor and sector plus a sample, and the model is told to send people to
 * the filtered listing rather than recite matches it cannot see.
 */
export interface SiteIndex {
  firmName: string;
  context: string;
}

const MAX_SAMPLE = 24;

export async function buildSiteIndex(tenant: Tenant): Promise<SiteIndex | null> {
  const [settings, properties, localities, services] = await Promise.all([
    getFirmSettings(tenant.id),
    getProperties(tenant.id),
    getLocalities(tenant.id),
    getServices(tenant.id),
  ]);
  if (!settings) return null;

  const base = basePathFor(tenant);
  const p = (path: string) => joinPath(base, path) || "/";

  const byType = new Map<string, number>();
  const byCorridor = new Map<string, number>();
  const bySector = new Map<string, number>();
  for (const row of properties) {
    byType.set(row.propertyType, (byType.get(row.propertyType) ?? 0) + 1);
    if (row.corridor) byCorridor.set(row.corridor, (byCorridor.get(row.corridor) ?? 0) + 1);
    if (row.sector) bySector.set(row.sector, (bySector.get(row.sector) ?? 0) + 1);
  }

  const priced = properties
    .filter((r) => r.price != null)
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

  const lines: string[] = [];

  lines.push(`# ${settings.firmName}`);
  if (settings.overview) lines.push(settings.overview);
  lines.push(
    `Contact: phone ${settings.phone ?? "not published"}; address ${[settings.addressLine, settings.locality, settings.region, settings.postalCode].filter(Boolean).join(", ") || "not published"}.`,
  );

  lines.push("\n## Pages");
  const PAGES: [string, string][] = [
    ["Home", "/"],
    ["All properties, filterable by type, locality, sector and budget", "/properties"],
    ["Localities and corridors", "/localities"],
    ["Sectors on the HRERA register", "/sectors"],
    ["Builders and developers", "/builders"],
    ["Plot and sector maps", "/maps/gurgaon"],
    ["Home loans and EMI", "/home-loan"],
    ["Rental yield and payback", "/rental-yield"],
    ["Area unit converter", "/area-converter"],
    ["Vastu guidance", "/vastu"],
    ["Documentation service", "/documentation"],
    ["Property management", "/property-management"],
    ["Market updates", "/updates"],
    ["About the firm", "/firm-profile"],
    ["Contact", "/contact"],
  ];
  for (const [label, path] of PAGES) lines.push(`- ${label}: ${p(path)}`);

  lines.push(`\n## Inventory (${properties.length} active listings)`);
  lines.push(
    "By type: " +
      [...byType.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([t, n]) => `${PROPERTY_TYPE_LABELS[t] ?? t} ${n} → ${p(`/properties?type=${t}`)}`)
        .join("; "),
  );
  if (byCorridor.size) {
    lines.push(
      "By corridor: " +
        [...byCorridor.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([c, n]) => `${c} ${n}`).join("; "),
    );
  }
  if (bySector.size) {
    lines.push(
      "Sectors with listings (link as /properties?sector=NN): " +
        [...bySector.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([s, n]) => `${s} (${n})`).join(", "),
    );
  }
  if (priced.length) {
    lines.push(
      `Published prices run from ${formatIndianPrice(priced[0].price!)} to ${formatIndianPrice(priced[priced.length - 1].price!)}. Many listings carry no published price.`,
    );
  }

  lines.push("\n## Sample listings");
  for (const row of properties.slice(0, MAX_SAMPLE)) {
    lines.push(
      `- ${row.title} — ${PROPERTY_TYPE_LABELS[row.propertyType] ?? row.propertyType}` +
        (row.sector ? `, Sector ${row.sector}` : "") +
        (row.locality ? `, ${row.locality}` : "") +
        (row.price ? `, ${formatIndianPrice(row.price)}` : ", price on request") +
        ` → ${p(`/properties/${row.slug}`)}`,
    );
  }

  if (localities.length) {
    lines.push("\n## Corridors");
    for (const l of localities) lines.push(`- ${l.name} → ${p(`/localities/${l.slug}`)}`);
  }

  lines.push("\n## Services");
  for (const line of serviceLinesFor(tenant.slug)) {
    lines.push(
      `- ${line.title}: ${line.blurb} → ${line.href.startsWith("#") ? `${p("/")}${line.href}` : p(line.href)}`,
    );
  }
  for (const s of services) {
    lines.push(`- ${s.title}${s.summary ? `: ${s.summary}` : ""} → ${p(`/services/${s.slug}`)}`);
  }

  // Every map, not a slice. An earlier cap at 60 dropped the last 15 — Sector
  // 57, Manesar, Udyog Vihar, Pace City among them — so when someone asked for
  // the Sector 57 map the assistant linked the index instead, because it had
  // never been shown the page. These are one short line each; there is nothing
  // to save by truncating them.
  lines.push(`\n## Maps available (${MAP_AREAS.length})`);
  for (const a of MAP_AREAS) {
    lines.push(`- ${a.name} → ${p(`/maps/gurgaon/${a.slug}`)}`);
  }

  return { firmName: settings.firmName, context: lines.join("\n") };
}
