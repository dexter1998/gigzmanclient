import { SITEMAP_FAMILIES, entriesForFamily, siteOrigin } from "@/lib/sitemap";

/**
 * The sitemap index.
 *
 * The per-family files live at /sitemaps/{id}.xml; nothing generates an
 * index for them, so without this route /sitemap.xml is a 404 and every
 * sub-sitemap is undiscoverable — robots.txt points here, and Search Console
 * is given this one URL.
 *
 * Families that resolve to nothing for this deployment are left out rather
 * than listed as empty files: `services` is a CA-vertical set, `home-loan`
 * and `vastu-sectors` are per-client allowlists, and an index full of empty
 * sitemaps reports as errors in Search Console.
 */
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;",
  );
}

export async function GET(): Promise<Response> {
  const origin = siteOrigin();

  const populated = await Promise.all(
    SITEMAP_FAMILIES.map(async (family) => ({
      id: family.id,
      count: (await entriesForFamily(family.id)).length,
    })),
  );

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...populated
      .filter((family) => family.count > 0)
      .map((family) => `  <sitemap><loc>${escapeXml(`${origin}/sitemaps/${family.id}.xml`)}</loc></sitemap>`),
    "</sitemapindex>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
