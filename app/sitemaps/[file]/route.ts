import { entriesForFamily, isSitemapFamily } from "@/lib/sitemap";

/**
 * One sitemap per content family, served at /sitemaps/{family}.xml and listed
 * in the index at /sitemap.xml.
 *
 * Hand-rolled rather than using Next's `sitemap.ts` metadata convention with
 * `generateSitemaps()`. That convention publishes the per-family files but
 * generates no index: it reserves /sitemap.xml, answers 404 there, and
 * refuses a route of our own at that path ("Conflicting route and metadata
 * at /sitemap.xml"). Since the index has to be written by hand either way,
 * both halves are plain route handlers.
 *
 * Served from `/sitemaps/`, not `/sitemap/`: the singular prefix is reserved
 * by the metadata convention for its own dynamic segment, and a route there
 * fails with "You cannot use different slug names for the same dynamic path
 * ('__metadata_id__' !== 'file')". The dynamic segment carries the `.xml`
 * suffix because a route folder cannot be named `[family].xml`.
 */
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === "'" ? "&apos;" : "&quot;",
  );
}

/** W3C datetime, which is what <lastmod> takes. */
function lastmod(value: Date | string | number | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<Response> {
  const { file } = await params;
  const family = file.endsWith(".xml") ? file.slice(0, -4) : file;

  if (!isSitemapFamily(family)) {
    return new Response("Not found", { status: 404 });
  }

  const entries = await entriesForFamily(family);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => {
      const modified = lastmod(entry.lastModified);
      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        modified ? `    <lastmod>${modified}</lastmod>` : null,
        entry.priority != null ? `    <priority>${entry.priority}</priority>` : null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    }),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
