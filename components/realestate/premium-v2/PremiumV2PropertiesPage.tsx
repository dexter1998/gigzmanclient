import { notFound } from "next/navigation";
import InventoryHubV2, { type HubScope } from "./InventoryHubV2";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings, getProperties, getPropertyImagesFor, getPropertyLocalityFacets } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdProps } from "@/lib/schema-org";
import {
  withStats,
  facetsFor,
  developerSlug,
  sectorSlug,
  type ListingRow,
} from "@/lib/register";
import { formatNumber } from "@/lib/format";

/**
 * Every cut of the inventory — the whole register, one sector, one developer —
 * is this page with a different `scope`. Each has its own route so it can be
 * crawled and ranked on its own terms; the layout and the data loading are
 * shared so there is one place to change how inventory reads.
 *
 * Deliberately reads no `searchParams`. Doing so on the server marks the route
 * dynamic, which is what left this page — the highest-intent page on the site —
 * rendering on demand while every other page was served from the CDN. The cut
 * is prerendered here and PropertyResultsV2 narrows it in the browser from the
 * same URL params the filters already write.
 */
export default async function PremiumV2PropertiesPage({
  tenant,
  scope = { kind: "all" },
}: {
  tenant: Tenant;
  scope?: HubScope;
}) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const [settings, inventory, localityFacets] = await Promise.all([
    getFirmSettings(tenant.id),
    getProperties(tenant.id),
    getPropertyLocalityFacets(tenant.id),
  ]);
  if (!settings) notFound();

  // `withStats` parses the numbers each cut needs out of the filing and drops
  // `description`/`specs` — on a register-sourced inventory those two columns
  // alone are ~1.6 MB of client payload, enough to stall hydration.
  const everything = withStats(inventory);
  const rows = filterForScope(everything, scope);
  if (rows.length === 0) notFound();

  const imagesByProperty = await getPropertyImagesFor(rows.map((item) => item.id));
  const imageMap = Object.fromEntries(
    rows.map((property) => {
      const images = imagesByProperty[property.id] ?? [];
      const primary = images.find((img) => img.isPrimary) ?? images[0] ?? null;
      return [property.id, primary ? { path: primary.path, alt: primary.alt } : undefined] as const;
    }),
  );

  const { eyebrow, heading, summary, crumbs, path } = copyFor(scope, rows, p);

  const itemListJsonLd = buildItemListJsonLd(
    rows.map((property) => ({
      name: property.title,
      url: p(`/properties/${property.slug}`),
      image: imageMap[property.id]?.path ?? null,
    })),
  );

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd(
            crumbs.map((c) => ({ name: c.name, url: c.href ?? p(path) })),
          ),
        )}
      />
      {rows.length > 0 ? <script {...jsonLdProps(itemListJsonLd)} /> : null}

      <InventoryHubV2
        scope={scope}
        rows={rows}
        everything={everything}
        imageMap={imageMap}
        localityFacets={localityFacets}
        basePath={basePath}
        crumbs={crumbs}
        eyebrow={eyebrow}
        heading={heading}
        summary={summary}
      />
    </>
  );
}

function filterForScope(rows: ListingRow[], scope: HubScope): ListingRow[] {
  if (scope.kind === "sector") return rows.filter((r) => r.sector && sectorSlug(r.sector) === sectorSlug(scope.sector));
  if (scope.kind === "developer")
    return rows.filter((r) => r.developer && developerSlug(r.developer) === developerSlug(scope.developer));
  if (scope.kind === "locality") return rows.filter((r) => r.locality === scope.locality);
  return rows;
}

/**
 * Headings and the summary line are written from the cut's own numbers, so a
 * sector page reads as a report on that sector rather than a filtered list.
 */
export function copyFor(
  scope: HubScope,
  rows: ListingRow[],
  p: (path: string) => string,
): { eyebrow: string; heading: string; summary: string; crumbs: { name: string; href?: string }[]; path: string } {
  const f = facetsFor(rows);
  const n = (v: number) => formatNumber(v);
  const overdue = f.delayed
    ? ` ${f.delayed} of them ${f.delayed === 1 ? "is" : "are"} past the completion date their promoter filed.`
    : "";
  const stock = f.unsold ? ` Of the ${n(f.units)} units declared, ${n(f.unsold)} were unsold at last filing.` : "";

  if (scope.kind === "sector") {
    const label = `Sector ${scope.sector}`;
    return {
      eyebrow: "Sector record · Gurugram, Haryana",
      heading: `Property in ${label}, Gurgaon`,
      summary:
        `${n(f.projects)} RERA-registered ${f.projects === 1 ? "project" : "projects"} from ${n(f.developers)} ` +
        `${f.developers === 1 ? "developer" : "developers"}${f.acres ? ` across ${n(f.acres)} acres` : ""}.` +
        stock +
        overdue,
      crumbs: [
        { name: "Home", href: p("/") },
        { name: "Sectors", href: p("/sectors") },
        { name: label },
      ],
      path: `/sectors/${sectorSlug(scope.sector)}`,
    };
  }

  if (scope.kind === "developer") {
    return {
      eyebrow: "Developer record · Gurugram, Haryana",
      heading: scope.developer,
      summary:
        `${n(f.projects)} registered ${f.projects === 1 ? "project" : "projects"} on the HRERA Gurugram register` +
        `${f.bySector.length ? ` across ${f.bySector.length} ${f.bySector.length === 1 ? "sector" : "sectors"}` : ""}` +
        `${f.acres ? ` and ${n(f.acres)} acres` : ""}.` +
        stock +
        overdue,
      crumbs: [
        { name: "Home", href: p("/") },
        { name: "Builders", href: p("/builders") },
        { name: scope.developer },
      ],
      path: `/builders/${developerSlug(scope.developer)}`,
    };
  }

  return {
    eyebrow: "Inventory",
    heading: "Every registered project in Gurgaon.",
    summary:
      `${n(f.projects)} projects from ${n(f.developers)} developers, published from the HRERA Gurugram register.` +
      stock +
      overdue +
      " Filter by purpose, type, locality, budget and configuration — RERA status is shown plainly on every listing.",
    crumbs: [{ name: "Home", href: p("/") }, { name: "Properties" }],
    path: "/properties",
  };
}
