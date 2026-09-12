import { vastuSectionEnabled } from "@/lib/premium-v2/home-sections";
import type { MetadataRoute } from "next";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients, services, professionalUpdates, properties, localities } from "@/lib/db/schema";
import { sectorSlug, developerSlug } from "@/lib/register";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { LOCATION_PAGES } from "@/lib/locations";
import { getVerticalConfig } from "@/lib/verticals";
import { getTenantPath } from "@/lib/templates";
import { LOAN_AMOUNTS, amountSlugStem } from "@/lib/home-loan/amounts";
import { homeLoanEnabled } from "@/lib/home-loan/enabled";
import { LENDERS } from "@/lib/home-loan/banks";
import { unitPairs, pairSlug } from "@/lib/calculators/area-units";
import { DIRECTIONS, ROOMS, VASTU_CONTEXTS } from "@/lib/vastu";
import { SECTORS, PLOT_SIZES, PROPERTY_CONTEXTS, sectorAspectSlugs } from "@/lib/vastu/sectors";
import { vastuSectorsEnabled } from "@/lib/vastu/enabled";
import { MAP_AREAS } from "@/lib/maps/areas";
import { allRentalSlugs, farmRentalEnabled } from "@/lib/premium-v2/farm-rental";
import { BLOG_POSTS, blogEnabled } from "@/lib/premium-v2/blog";
import {
  ESTATES,
  PINCODES,
  VILLAGES,
  allFarmSlugs,
  allGeos,
  farmSearchEnabled,
  indexable,
  resolveFarmSlug,
} from "@/lib/premium-v2/farm-search";

type Client = typeof clients.$inferSelect;
type Entries = MetadataRoute.Sitemap;

/**
 * The sitemap is split into one file per content family, indexed from
 * /sitemap.xml.
 *
 * A single file was valid — 4,770 URLs is well inside Google's 50,000 limit —
 * but it made the site unreadable in Search Console. The programmatic vastu
 * set alone is 83% of the URLs, so a coverage problem on the pages that
 * actually earn business (properties, localities, market updates) was a
 * rounding error inside one blob. Split by family, each one reports its own
 * indexed/excluded counts, and the pSEO families can be diagnosed — or
 * withdrawn — without touching the rest.
 *
 * Ordered widest-value first; that is also the order the index lists them in.
 */
export const SITEMAP_FAMILIES = [
  { id: "core", label: "Static pages, hubs and legal" },
  { id: "properties", label: "Property listings" },
  { id: "register", label: "Sector and developer pages" },
  { id: "localities", label: "Corridors and rental-yield pages" },
  { id: "updates", label: "Market updates" },
  { id: "blog", label: "Farmhouse guides" },
  { id: "farm-rental", label: "Farmhouse rental by occasion, area and budget" },
  { id: "farm-search", label: "Farmhouses by village, size, budget and feature" },
  { id: "estates", label: "Named farm estates" },
  { id: "land-rates", label: "Land and circle rates by village" },
  { id: "property-dealer", label: "Property dealer by pocket and road" },
  { id: "pin-code", label: "Pin codes on the belt" },
  { id: "services", label: "Service pages" },
  { id: "maps", label: "Gurugram plot maps" },
  { id: "home-loan", label: "Home-loan amounts and lenders" },
  { id: "area-converter", label: "Land-area conversions" },
  { id: "vastu", label: "Vastu by direction, room and plot" },
  { id: "vastu-sectors", label: "Vastu by Gurugram sector" },
] as const;

export type SitemapFamilyId = (typeof SITEMAP_FAMILIES)[number]["id"];

export function isSitemapFamily(value: string): value is SitemapFamilyId {
  return SITEMAP_FAMILIES.some((f) => f.id === value);
}

/**
 * Clients this deployment is actually serving.
 *
 * Narrowed by `TENANT_ONLY` exactly as `lib/static-params.ts` narrows the
 * build. Without it a client's own domain would advertise every other
 * tenant's URLs in its sitemap — pages that, in host mode, do not resolve on
 * that domain at all.
 */
const TENANT_ONLY = (process.env.TENANT_ONLY ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function sitemapClients(): Promise<Client[]> {
  try {
    const rows = await db.select().from(clients).where(eq(clients.isActive, true));
    return TENANT_ONLY.length > 0 ? rows.filter((r) => TENANT_ONLY.includes(r.slug)) : rows;
  } catch {
    return [];
  }
}

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const HOST_MODE = process.env.TENANT_MODE === "host";

/**
 * Absolute prefix for a client's pages.
 *
 * In host mode the deployment serves exactly one client at its own origin,
 * and that origin — `NEXT_PUBLIC_SITE_URL` — is the canonical one. It is
 * deliberately preferred over `clients.custom_domain` here: that column
 * records which host *resolves* to the tenant, not which host is canonical,
 * and the two differ the moment a site redirects apex to www. Reading the
 * column instead put `https://highproperties.in/...` in every sitemap entry
 * while the site 308s all of it to `https://www.highproperties.in/...`, so
 * every submitted URL was a redirect.
 *
 * The shared multi-tenant deployment still needs the column: it serves many
 * clients from one origin, so each one's own domain (or its path prefix) is
 * the only way to address it.
 */
export function prefixFor(client: Client): string {
  if (HOST_MODE) return siteOrigin();
  return client.customDomain
    ? `https://${client.customDomain}`
    : `${siteOrigin()}${getTenantPath(client.vertical, client.slug)}`;
}

/**
 * `lastModified` is deliberately absent from every config-generated family
 * below, and present only where a row carries a real `updatedAt`.
 *
 * The previous sitemap stamped `new Date()` on all 4,770 URLs, so every fetch
 * claimed the entire site had changed that second. Google's guidance is that
 * a lastmod it cannot trust is one it stops reading; no value at all is
 * treated better than a value that is always "now".
 */

function coreEntries(client: Client, prefix: string): Entries {
  const vertical = getVerticalConfig(client.vertical);
  const entries: Entries = vertical.sitemapPaths.map((entry) => ({
    url: `${prefix}${entry.path}`,
    priority: entry.priority,
  }));

  // Location landing pages are a CA-specific content set (lib/locations.ts);
  // real estate's equivalent local-SEO surface is `localities`.
  if (client.vertical === "cafirm") {
    for (const location of LOCATION_PAGES) {
      entries.push({ url: `${prefix}/${location.slug}`, priority: 0.7 });
    }
  }

  if (client.vertical === "realestate") {
    entries.push(
      { url: `${prefix}/area-converter`, priority: 0.6 },
      { url: `${prefix}/rental-yield`, priority: 0.7 },
      ...(vastuSectionEnabled(client.slug) ? [{ url: `${prefix}/vastu`, priority: 0.7 }] : []),
      { url: `${prefix}/maps/gurgaon`, priority: 0.7 },
      // Only premium-v2 renders /documentation; the other templates 404 it,
      // and a sitemap that lists a 404 is worse than one that omits a page.
      ...(getTemplateKeyForSlug(client.slug) === "premium-v2"
        ? [{ url: `${prefix}/documentation`, priority: 0.7 }]
        : []),
    );
    if (homeLoanEnabled(client.slug)) {
      entries.push({ url: `${prefix}/home-loan`, priority: 0.7 });
    }
    if (vastuSectorsEnabled(client.slug)) {
      entries.push({ url: `${prefix}/vastu/gurugram`, priority: 0.6 });
    }
  }

  return entries;
}

function blogEntries(client: Client, prefix: string): Entries {
  if (!blogEnabled(client.slug)) return [];
  return [
    { url: `${prefix}/blog`, priority: 0.7 },
    ...BLOG_POSTS.map((post) => ({
      url: `${prefix}/blog/${post.slug}`,
      lastModified: post.published,
      priority: 0.6,
    })),
  ];
}

function farmRentalEntries(client: Client, prefix: string): Entries {
  // Gated on the same switch the pages use — the family 404s for every
  // tenant that does not sell farmhouses.
  if (!farmRentalEnabled(client.slug)) return [];
  return [
    { url: `${prefix}/farmhouse-rental`, priority: 0.8 },
    ...allRentalSlugs().map((slug) => ({
      url: `${prefix}/farmhouse-rental/${slug}`,
      // Occasion and question pages are written; the area and budget
      // permutations beneath them are a wider, thinner layer and sit lower.
      priority: slug.includes("-in-") || slug.startsWith("under-") ? 0.4 : 0.6,
    })),
  ];
}

/**
 * The buy-side matrix. Only the combinations that pass the quality gate are
 * listed — a page with nothing to say still renders and is still linked, but
 * offering ~700 near-empty URLs to a crawler is how a domain gets classified
 * as thin. See `indexable()` in lib/premium-v2/farm-search.ts.
 */
function farmSearchEntries(client: Client, prefix: string): Entries {
  if (!farmSearchEnabled(client.slug)) return [];
  const entries: Entries = [{ url: `${prefix}/farmhouse`, priority: 0.9 }];
  for (const slug of allFarmSlugs()) {
    const page = resolveFarmSlug(slug);
    if (!page || !indexable(page)) continue;
    entries.push({
      url: `${prefix}/farmhouse/${slug}`,
      // Village overviews are the hubs of this family; the facets beneath
      // them are wider and thinner, and are priced accordingly.
      priority:
        page.kind === "geo" ? 0.7 : page.kind === "compare" || page.kind === "landmark" ? 0.6 : 0.4,
    });
  }
  return entries;
}

function estateEntries(client: Client, prefix: string): Entries {
  if (!farmSearchEnabled(client.slug)) return [];
  return [
    { url: `${prefix}/estates`, priority: 0.7 },
    ...ESTATES.filter((estate) => estate.listings >= 2).map((estate) => ({
      url: `${prefix}/estates/${estate.slug}`,
      priority: 0.6,
    })),
  ];
}

function landRateEntries(client: Client, prefix: string): Entries {
  if (!farmSearchEnabled(client.slug)) return [];
  return [
    { url: `${prefix}/land-rates`, priority: 0.7 },
    ...VILLAGES.map((village) => ({
      url: `${prefix}/land-rates/${village.slug}`,
      priority: 0.5,
    })),
  ];
}

function dealerEntries(client: Client, prefix: string): Entries {
  if (!farmSearchEnabled(client.slug)) return [];
  return allGeos().map((geo) => ({ url: `${prefix}/property-dealer/${geo.slug}`, priority: 0.5 }));
}

function pincodeEntries(client: Client, prefix: string): Entries {
  if (!farmSearchEnabled(client.slug)) return [];
  return PINCODES.map((pin) => ({ url: `${prefix}/pin-code/${pin.code}`, priority: 0.4 }));
}

function mapEntries(client: Client, prefix: string): Entries {
  if (client.vertical !== "realestate") return [];
  return MAP_AREAS.map((area) => ({
    url: `${prefix}/maps/gurgaon/${area.slug}`,
    priority: 0.6,
  }));
}

function homeLoanEntries(client: Client, prefix: string): Entries {
  // Home-loan pages come from static config rather than a table, so none of
  // the row queries discover them — they are enumerated explicitly.
  if (!homeLoanEnabled(client.slug)) return [];
  const entries: Entries = [];

  for (const amount of LOAN_AMOUNTS) {
    entries.push({ url: `${prefix}/home-loan/${amount.slug}`, priority: 0.6 });
  }

  for (const lender of LENDERS) {
    entries.push({ url: `${prefix}/home-loan/${lender.slug}`, priority: 0.6 });
    // The lender x amount matrix sits at a lower priority than either parent
    // — it is the widest and least differentiated layer.
    for (const amount of LOAN_AMOUNTS) {
      entries.push({
        url: `${prefix}/home-loan/${lender.slug}/${amountSlugStem(amount)}`,
        priority: 0.4,
      });
    }
  }

  return entries;
}

function areaConverterEntries(client: Client, prefix: string): Entries {
  if (client.vertical !== "realestate") return [];
  return unitPairs().map((pair) => ({
    url: `${prefix}/area-converter/${pairSlug(pair.from, pair.to)}`,
    priority: 0.4,
  }));
}

function vastuEntries(client: Client, prefix: string): Entries {
  if (client.vertical !== "realestate") return [];
  // Gated on the same switch the pages use. Without it a tenant with vastu
  // turned off — Evergreen — advertised 244 URLs that all 404, which is worse
  // than publishing none: the sitemap is the one place Search Console takes
  // as a promise that a URL exists. Same reasoning as vastuSectorEntries and
  // the /documentation entry in coreEntries.
  if (!vastuSectionEnabled(client.slug)) return [];
  const entries: Entries = [];

  for (const direction of DIRECTIONS) {
    for (const context of VASTU_CONTEXTS) {
      entries.push({ url: `${prefix}/vastu/${direction.slug}-facing-${context.slug}`, priority: 0.5 });
    }
  }

  for (const room of ROOMS) {
    entries.push({ url: `${prefix}/vastu/${room.slug}-vastu`, priority: 0.5 });
    for (const direction of DIRECTIONS) {
      entries.push({ url: `${prefix}/vastu/${room.slug}-in-${direction.slug}-vastu`, priority: 0.4 });
    }
  }

  for (const direction of DIRECTIONS) {
    for (const size of PLOT_SIZES) {
      entries.push({ url: `${prefix}/vastu/${size}-plot-${direction.slug}-facing-vastu`, priority: 0.4 });
    }
    for (const context of PROPERTY_CONTEXTS) {
      entries.push({ url: `${prefix}/vastu/${context.slug}-${direction.slug}-facing-vastu`, priority: 0.4 });
    }
  }

  return entries;
}

function vastuSectorEntries(client: Client, prefix: string): Entries {
  // Gated on the same allowlist the pages use — listing sector URLs for a
  // client whose routes 404 would be a sitemap full of dead links.
  if (client.vertical !== "realestate" || !vastuSectorsEnabled(client.slug)) return [];

  const aspects = sectorAspectSlugs(
    DIRECTIONS.map((d) => d.slug),
    ROOMS.map((r) => r.slug),
  );
  const entries: Entries = [];

  for (const sector of SECTORS) {
    entries.push({ url: `${prefix}/vastu/gurugram/${sector.slug}`, priority: 0.5 });
    for (const aspect of aspects) {
      entries.push({ url: `${prefix}/vastu/gurugram/${sector.slug}/${aspect}`, priority: 0.3 });
    }
  }

  return entries;
}

async function propertyEntries(client: Client, prefix: string): Promise<Entries> {
  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.clientId, client.id), eq(properties.isActive, true)));
  return rows.map((property) => ({
    url: `${prefix}/properties/${property.slug}`,
    lastModified: property.updatedAt,
    priority: property.isFeatured ? 0.8 : 0.7,
  }));
}

/**
 * One page per sector and per developer on the register. Both are cuts of the
 * same inventory, so they share a family — and a coverage problem in one is
 * almost always a problem in the other.
 *
 * Mirrors the two routes' `generateStaticParams`: developers holding a single
 * project get no page, because it would only restate the listing it links to.
 */
async function registerEntries(client: Client, prefix: string): Promise<Entries> {
  // The routes live under the premium-v2 real-estate template only; listing
  // them for any other tenant advertises URLs that 404 on that tenant's site.
  if (client.vertical !== "realestate" || getTemplateKeyForSlug(client.slug) !== "premium-v2") return [];

  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.clientId, client.id), eq(properties.isActive, true)));

  const latest = (list: typeof rows) =>
    list.reduce<Date | undefined>((a, r) => (!a || r.updatedAt > a ? r.updatedAt : a), undefined);

  const bySector = new Map<string, typeof rows>();
  const byDeveloper = new Map<string, typeof rows>();
  for (const r of rows) {
    if (r.sector) bySector.set(r.sector, [...(bySector.get(r.sector) ?? []), r]);
    if (r.developer) byDeveloper.set(r.developer, [...(byDeveloper.get(r.developer) ?? []), r]);
  }

  const entries: Entries = [
    { url: `${prefix}/sectors`, lastModified: latest(rows), priority: 0.7 },
    { url: `${prefix}/builders`, lastModified: latest(rows), priority: 0.7 },
  ];
  for (const [sector, list] of bySector) {
    entries.push({
      url: `${prefix}/sectors/${sectorSlug(sector)}`,
      lastModified: latest(list),
      priority: 0.6,
    });
  }
  for (const [developer, list] of byDeveloper) {
    if (list.length < 2) continue;
    entries.push({
      url: `${prefix}/builders/${developerSlug(developer)}`,
      lastModified: latest(list),
      priority: 0.6,
    });
  }
  return entries;
}

async function localityEntries(client: Client, prefix: string): Promise<Entries> {
  const rows = await db
    .select()
    .from(localities)
    .where(and(eq(localities.clientId, client.id), eq(localities.isPublished, true)));

  const entries: Entries = [];
  for (const locality of rows) {
    entries.push({
      url: `${prefix}/localities/${locality.slug}`,
      lastModified: locality.updatedAt,
      priority: 0.6,
    });
    if (client.vertical === "realestate") {
      entries.push({
        url: `${prefix}/rental-yield/${locality.slug}`,
        lastModified: locality.updatedAt,
        priority: 0.6,
      });
    }
  }
  return entries;
}

async function updateEntries(client: Client, prefix: string): Promise<Entries> {
  const rows = await db
    .select()
    .from(professionalUpdates)
    .where(
      and(
        eq(professionalUpdates.clientId, client.id),
        sql`${professionalUpdates.status} IN ('published','outdated')`,
      ),
    );
  return rows.map((update) => ({
    url: `${prefix}/updates/${update.slug}`,
    lastModified: update.updatedAt,
    priority: 0.6,
  }));
}

async function serviceEntries(client: Client, prefix: string): Promise<Entries> {
  const rows = await db
    .select()
    .from(services)
    .where(and(eq(services.clientId, client.id), eq(services.isActive, true)));
  return rows.map((service) => ({
    url: `${prefix}/services/${service.slug}`,
    lastModified: service.updatedAt,
    priority: 0.8,
  }));
}

/**
 * One family's URLs for one client.
 *
 * Split out from `entriesForFamily` so the sitemap can be sliced per tenant
 * as well as per family — see `sitemapFiles`.
 */
async function entriesForClientFamily(
  client: Client,
  family: SitemapFamilyId,
): Promise<Entries> {
  const prefix = prefixFor(client);
  const out: Entries = [];
  switch (family) {
    case "core":
      out.push(...coreEntries(client, prefix));
      break;
    case "maps":
      out.push(...mapEntries(client, prefix));
      break;
    case "home-loan":
      out.push(...homeLoanEntries(client, prefix));
      break;
    case "area-converter":
      out.push(...areaConverterEntries(client, prefix));
      break;
    case "vastu":
      out.push(...vastuEntries(client, prefix));
      break;
    case "vastu-sectors":
      out.push(...vastuSectorEntries(client, prefix));
      break;
    case "properties":
      out.push(...(await propertyEntries(client, prefix)));
      break;
    case "register":
      out.push(...(await registerEntries(client, prefix)));
      break;
    case "localities":
      out.push(...(await localityEntries(client, prefix)));
      break;
    case "updates":
      out.push(...(await updateEntries(client, prefix)));
      break;
    case "blog":
      out.push(...blogEntries(client, prefix));
      break;
    case "farm-rental":
      out.push(...farmRentalEntries(client, prefix));
      break;
    case "farm-search":
      out.push(...farmSearchEntries(client, prefix));
      break;
    case "estates":
      out.push(...estateEntries(client, prefix));
      break;
    case "land-rates":
      out.push(...landRateEntries(client, prefix));
      break;
    case "property-dealer":
      out.push(...dealerEntries(client, prefix));
      break;
    case "pin-code":
      out.push(...pincodeEntries(client, prefix));
      break;
    case "services":
      out.push(...(await serviceEntries(client, prefix)));
      break;
  }

  return out;
}

/** Every URL in one family, across every client this deployment serves. */
export async function entriesForFamily(family: SitemapFamilyId): Promise<Entries> {
  const clientRows = await sitemapClients();
  const out: Entries = [];
  for (const client of clientRows) {
    out.push(...(await entriesForClientFamily(client, family)));
  }
  return out;
}

/**
 * How many URLs one sitemap file may carry.
 *
 * The protocol allows 50,000, and nothing here is close to that — the point
 * of a smaller cap is diagnosis. Search Console reports indexed/excluded per
 * sitemap file, so a 25,000-URL blob tells you a family has a problem while a
 * 5,000-URL slice tells you which part of it does.
 */
const MAX_URLS_PER_FILE = 5000;

/** Neither a tenant slug nor a family id contains a double hyphen. */
const ID_SEPARATOR = "--";

export interface SitemapFile {
  /** The `{file}` segment in /sitemaps/{file}.xml. */
  id: string;
  tenantSlug: string;
  family: SitemapFamilyId;
  /** 1-based. */
  part: number;
  parts: number;
  count: number;
}

function fileId(tenantSlug: string, family: SitemapFamilyId, part: number): string {
  return part <= 1
    ? `${tenantSlug}${ID_SEPARATOR}${family}`
    : `${tenantSlug}${ID_SEPARATOR}${family}${ID_SEPARATOR}${part}`;
}

/**
 * The sitemap index, as a list of files.
 *
 * Sliced by tenant first and family second. Tenant first because that is the
 * boundary that matters operationally: this deployment serves nine sites, a
 * Search Console property covers one of them, and a file mixing tenants
 * cannot be submitted to either. Family second because that is the boundary
 * that matters diagnostically — a coverage problem in the 2,300-page
 * farm-search matrix should not be a rounding error inside the same file as
 * the twenty pages that actually earn business.
 *
 * A family that resolves to nothing for a tenant produces no file at all;
 * an index full of empty sitemaps reports as errors in Search Console.
 */
export async function sitemapFiles(): Promise<SitemapFile[]> {
  const clientRows = await sitemapClients();
  const files: SitemapFile[] = [];

  for (const client of clientRows) {
    for (const family of SITEMAP_FAMILIES) {
      const entries = await entriesForClientFamily(client, family.id);
      if (entries.length === 0) continue;
      const parts = Math.max(1, Math.ceil(entries.length / MAX_URLS_PER_FILE));
      for (let part = 1; part <= parts; part++) {
        const slice = entries.slice((part - 1) * MAX_URLS_PER_FILE, part * MAX_URLS_PER_FILE);
        files.push({
          id: fileId(client.slug, family.id, part),
          tenantSlug: client.slug,
          family: family.id,
          part,
          parts,
          count: slice.length,
        });
      }
    }
  }

  return files;
}

/**
 * Resolves a `/sitemaps/{file}.xml` segment back to its URLs.
 *
 * Accepts both the sliced id (`evergreen-real-estate--farm-search`, optionally
 * with a `--2` part suffix) and a bare family id (`farm-search`), which is
 * what the index used to publish. The bare form still answers so that a
 * sitemap already submitted to Search Console does not start 404ing the day
 * this ships — Google treats a 404 sitemap as a removal signal for
 * everything it listed.
 */
export async function entriesForFile(file: string): Promise<Entries | null> {
  if (isSitemapFamily(file)) return entriesForFamily(file);

  const parts = file.split(ID_SEPARATOR);
  if (parts.length < 2 || parts.length > 3) return null;

  const [tenantSlug, family, partRaw] = parts;
  if (!isSitemapFamily(family)) return null;

  const part = partRaw === undefined ? 1 : Number(partRaw);
  if (!Number.isInteger(part) || part < 1) return null;

  const client = (await sitemapClients()).find((row) => row.slug === tenantSlug);
  if (!client) return null;

  const entries = await entriesForClientFamily(client, family);
  const slice = entries.slice((part - 1) * MAX_URLS_PER_FILE, part * MAX_URLS_PER_FILE);
  return slice.length > 0 ? slice : null;
}
