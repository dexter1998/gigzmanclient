import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Tenant resolution for a deployment that serves many client sites.
 *
 * Next 16 renamed `middleware.ts` to `proxy.ts`; the `middleware` export and the
 * edge runtime are deprecated here, so this runs on Node.
 *
 * path mode — /{vertical}/{slug}/services  is rewritten to  /services
 * host mode — clientdomain.com/services    is served as     /services
 *
 * Either way the internal route tree stays clean and the tenant travels as a
 * request header that Server Components read through `headers()`.
 */

const TENANT_MODE = process.env.TENANT_MODE === "host" ? "host" : "path";

/** Verticals that may appear as the first path segment in path mode. */
const VERTICALS = new Set(["cafirm"]);

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,118}[a-z0-9]$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (TENANT_MODE === "host") {
    const host = (request.headers.get("host") ?? "").split(":")[0];
    const headers = new Headers(request.headers);
    headers.set("x-tenant-host", host);
    headers.set("x-tenant-base", "");
    return NextResponse.next({ request: { headers } });
  }

  const segments = pathname.split("/").filter(Boolean);
  const [vertical, slug, ...rest] = segments;

  // The bare root lists the sites hosted on this deployment.
  if (segments.length === 0) return NextResponse.next();

  // The internal prefix is only ever reached through a rewrite below; a direct
  // request for it would render a tenant page with no tenant resolved.
  if (vertical === "site") return NextResponse.redirect(new URL("/", request.url));

  if (!vertical || !VERTICALS.has(vertical) || !slug || !SLUG_PATTERN.test(slug)) {
    // Un-prefixed paths would otherwise render a tenant page with no tenant.
    return NextResponse.redirect(new URL("/", request.url));
  }

  const headers = new Headers(request.headers);
  headers.set("x-tenant", slug);
  headers.set("x-tenant-base", `/${vertical}/${slug}`);

  // Tenant pages live under an internal /site prefix so that `/` stays free for
  // the index of sites hosted on this deployment.
  const url = request.nextUrl.clone();
  url.pathname = `/site${rest.length > 0 ? `/${rest.join("/")}` : ""}`;

  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
