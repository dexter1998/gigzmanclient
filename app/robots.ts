import type { MetadataRoute } from "next";

/**
 * Two shapes, because one codebase serves both deployment modes.
 *
 * On the shared multi-tenant deployment the dashboard sits at
 * `/{vertical}/{slug}/dashboard`, so the rules need the wildcard segment. On a
 * client's own domain (`TENANT_MODE=host`) it sits at `/dashboard`, which the
 * wildcard form does not match — that would have left enquiry records
 * crawlable on exactly the deployment with a real domain pointed at it.
 *
 * The sitemap is declared here too. Nothing else tells a crawler it exists,
 * and these sites are not always submitted through Search Console on day one.
 */
const HOST_MODE = process.env.TENANT_MODE === "host";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  const disallow = HOST_MODE
    ? ["/dashboard", "/dashboard/", "/site/", "/api/", "/thank-you"]
    : ["/*/dashboard", "/*/dashboard/", "/site/", "/api/", "/*/thank-you"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The dashboard holds enquiry records with personal contact details,
        // and the deployment index is internal.
        disallow,
      },
    ],
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
