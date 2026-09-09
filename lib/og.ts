import type { Metadata } from "next";

/**
 * Open Graph / Twitter card helpers.
 *
 * Deliberately points at an image the page already has rather than generating
 * one with `next/og`'s ImageResponse.
 *
 * Generating would mean an extra rendered route per page. This deployment
 * prerenders several thousand pages per tenant, and a build at four tenants
 * already exceeded Vercel's deployment output limit and failed — roughly
 * doubling the route count to produce a card image is not a trade worth
 * making. Reusing the page's own image also gets the "updates automatically"
 * property for free: the card reads the same database row or asset the page
 * renders, so changing the property photo changes the share preview with no
 * separate regeneration step.
 *
 * The one place a composed, branded image is worth generating is the
 * homepage, because there is exactly one of it — see
 * `app/site/[tenant]/(public)/opengraph-image.tsx`.
 *
 * Paths passed here may be relative; `metadataBase` on the tenant layout
 * resolves them to absolute URLs, which Open Graph requires.
 */

/** Fallback when a page has no image of its own. */
export const DEFAULT_OG_IMAGE =
  "/verticals/realestate/templates/premium-v2/images/hero-curated-inventory-v2.png";

/**
 * The same hero, pre-cut to card dimensions, for the generated homepage card.
 * The full-size source is a 2.3MB PNG; base64-inlining that on every
 * regeneration is wasted work when the output is only ever 1200x630.
 */
export const OG_CARD_BACKGROUND = "/brand/og-hero.jpg";

export function ogFor({
  title,
  description,
  image,
  path,
  type = "website",
}: {
  title: string;
  description?: string;
  /** Relative or absolute; falls back to the site hero. */
  image?: string | null;
  /** Canonical path for this page, relative to the tenant root. */
  path?: string;
  type?: "website" | "article";
}): Metadata {
  const images = [{ url: image || DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }];

  return {
    openGraph: {
      title,
      description,
      type,
      ...(path ? { url: path } : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

/**
 * Absolute origin for a tenant, used as `metadataBase`.
 *
 * A client on its own domain must advertise that domain in its cards, not the
 * shared deployment's hostname — a WhatsApp preview showing a `.vercel.app`
 * URL under a client's brand looks broken.
 */
export function originFor(customDomain: string | null | undefined): URL {
  // Host mode: the deployment's own origin is the canonical one, and it wins
  // over `clients.custom_domain` for the same reason it does in
  // lib/sitemap.ts — the column says which host resolves to this tenant, not
  // which host is canonical. With apex redirecting to www, reading the column
  // pointed `metadataBase` (and so every canonical and og:url derived from
  // it) at the host that redirects away.
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.TENANT_MODE === "host" && configured) return new URL(configured);
  if (customDomain) return new URL(`https://${customDomain}`);
  return new URL(configured || "http://localhost:3000");
}
