import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isVerticalId } from "./lib/verticals";

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
 *
 * This only checks that the vertical segment is a *known* vertical — it has no
 * database access. Whether it's the correct vertical *for that client* is
 * asserted in `lib/tenant.ts`, which already queries `clients` by slug and can
 * compare against the stored `vertical` in the same round trip.
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

  // The bare root lists the sites hosted on this deployment.
  if (segments.length === 0) return NextResponse.next();

  // Files served from public/ live at the root and carry an extension. Without
  // this they would be treated as an unknown tenant and redirected away.
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();

  // The internal prefix is only ever reached through a rewrite below; a direct
  // request for it would render a tenant page with no tenant resolved.
  if (vertical === "site") return NextResponse.redirect(new URL("/", request.url));

  // The template-library sales page (app/library/page.tsx) is a top-level route
  // like the deployment index at "/", not a tenant path — "library" is not a
  // registered vertical id, so without this it would fall through to the
  // vertical-mismatch branch below and redirect to "/".
  if (vertical === "library" && !slug) return NextResponse.next();

  if (!vertical || !isVerticalId(vertical) || !slug || !SLUG_PATTERN.test(slug)) {
    // Un-prefixed paths would otherwise render a tenant page with no tenant.
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
