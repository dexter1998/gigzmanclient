/**
 * Which tenants publish the Gurugram sector vastu matrix.
 *
 * This was an allowlist because the matrix is ~3,700 routes per tenant and
 * prerendering them broke the deploy at four tenants: a 41-minute build that
 * then exceeded the deployment output limit. That reason is gone — the sector
 * and aspect routes now render on demand and cache, so a tenant costs nothing
 * at build time.
 *
 * What has not changed is that the pages differ only by sector name and the
 * corridor figures that sector's locality row supplies. They are thin, and
 * that is worth remembering before treating the count as a win.
 */
import { getTemplateKeyForSlug } from "@/lib/templates";

export function vastuSectorsEnabled(clientSlug: string | undefined | null): boolean {
  if (!clientSlug) return false;
  return getTemplateKeyForSlug(clientSlug) === "premium-v2";
}
