import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isVerticalId } from "./lib/verticals";
import { isTemplateUrlSlug } from "./lib/templates";

/**
 * Tenant resolution for a deployment that serves many client sites.
 *
 * Next 16 renamed `middleware.ts` to `proxy.ts`; the `middleware` export and the
 * edge runtime are deprecated here, so this runs on Node.
 *
 * path mode, most verticals — /{vertical}/{slug}/services       -> /services
 * path mode, realestate      — /{vertical}/{template}/{slug}/x  -> /x
 * host mode                  — clientdomain.com/services        -> /services
 *
 * Realestate carries an extra `{template}` segment (e.g. `temp-luxury-showcase`)
 * identifying which of the several real-estate landing-page templates a tenant
 * uses, since that vertical hosts more than one design direction — every other
 * vertical still has exactly one template, so it stays two-segment.
 *
 * Either way the internal route tree stays clean and the tenant travels as a
 * request header that Server Components read through `headers()`.
 *
 * This only checks that the vertical/template segments are *known* — it has no
 * database access. Whether they're correct *for that client* is asserted in
 * `lib/tenant.ts`, which already queries `clients` by slug and can compare
 * against the stored `vertical` (and, for realestate, its assigned template)
 * in the same round trip.
 */

const TENANT_MODE = process.env.TENANT_MODE === "host" ? "host" : "path";

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

  // The bare root is the public template-library homepage (app/page.tsx).
  if (segments.length === 0) return NextResponse.next();

  // Files served from public/ live at the root and carry an extension. Without
  // this they would be treated as an unknown tenant and redirected away.
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();

  // The internal prefix is only ever reached through a rewrite below; a direct
  // request for it would render a tenant page with no tenant resolved.
  if (vertical === "site") return NextResponse.redirect(new URL("/", request.url));

  // The internal ops deployment index (app/admin/page.tsx) — not a tenant
  // path, "admin" is not a registered vertical id.
  if (vertical === "admin" && !slug) return NextResponse.next();

  if (!vertical || !isVerticalId(vertical)) {
    // An unknown vertical segment would otherwise render a tenant page with
    // no tenant resolved.
    return NextResponse.redirect(new URL("/", request.url));
  }

  // A bare `/{vertical}` (no slug) is the per-industry library page
  // (app/[vertical]/page.tsx) — every template registered for that
  // industry — not a tenant path, so it renders directly with no rewrite.
  if (!slug) return NextResponse.next();

  if (vertical === "realestate") {
    const templateUrlSlug = slug;
    const clientSlug = segments[2];

    if (!isTemplateUrlSlug(templateUrlSlug) || !clientSlug || !SLUG_PATTERN.test(clientSlug)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const tenantRest = segments.slice(3);
    const headers = new Headers(request.headers);
    headers.set("x-tenant", clientSlug);
    headers.set("x-tenant-vertical", vertical);
    headers.set("x-tenant-template-slug", templateUrlSlug);
    headers.set("x-tenant-base", `/${vertical}/${templateUrlSlug}/${clientSlug}`);

    const url = request.nextUrl.clone();
    url.pathname = `/site${tenantRest.length > 0 ? `/${tenantRest.join("/")}` : ""}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const headers = new Headers(request.headers);
  headers.set("x-tenant", slug);
  headers.set("x-tenant-vertical", vertical);
  headers.set("x-tenant-base", `/${vertical}/${slug}`);

  // Tenant pages live under an internal /site prefix so that `/` stays free for
  // the index of sites hosted on this deployment.
  const url = request.nextUrl.clone();
  url.pathname = `/site${rest.length > 0 ? `/${rest.join("/")}` : ""}`;

  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Anything with a file extension is a static asset and is skipped outright.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)"],
};
