/**
 * Per-tenant switches for optional premium-v2 homepage sections.
 *
 * The template is shared by every premium-v2 client, so a section a single
 * client does not want cannot simply be deleted from the composition. This is
 * the opt-out list, kept next to the other per-tenant gates
 * (`lib/home-loan/enabled.ts`, `lib/vastu/enabled.ts`) rather than invented
 * as a new mechanism.
 */

/**
 * "Explore Properties on the Map" is a styled placeholder, not a working map:
 * decorative pins on a textured panel and map/satellite toggles that switch
 * nothing, pending the real Maps JS API. High Properties is a live client on
 * its own domain and asked for it off; the other tenants keep it until it is
 * either wired to a real map or dropped everywhere.
 */
const MAP_SECTION_DISABLED = new Set(["high-properties"]);

export function propertyMapSectionEnabled(clientSlug: string | undefined | null): boolean {
  if (!clientSlug) return true;
  return !MAP_SECTION_DISABLED.has(clientSlug);
}

/**
 * The property-management section's artwork is not tenant-neutral: the phone
 * mock, its screen and the logo on it are baked into the supplied background
 * images, so it reads as High Properties whoever renders it. Allowlisted
 * rather than opt-out for that reason — a second client gets the section when
 * there is art carrying their own brand.
 */
const PROPERTY_MANAGEMENT_TENANTS = new Set(["high-properties"]);

export function propertyManagementSectionEnabled(clientSlug: string | undefined | null): boolean {
  if (!clientSlug) return false;
  return PROPERTY_MANAGEMENT_TENANTS.has(clientSlug);
}

/**
 * The property-management landing page ships with High-Properties-branded
 * art throughout — the hero phone and its screen, the inspector's uniform,
 * the owner-portal reference — so it is allowlisted rather than opt-out, on
 * the same reasoning as the home page's management section.
 */
const PROPERTY_MANAGEMENT_PAGE_TENANTS = new Set(["high-properties"]);

export function propertyManagementPageEnabled(clientSlug: string | undefined | null): boolean {
  if (!clientSlug) return false;
  return PROPERTY_MANAGEMENT_PAGE_TENANTS.has(clientSlug);
}
