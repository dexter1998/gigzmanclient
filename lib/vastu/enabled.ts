/**
 * Which tenants publish the Gurugram sector vastu matrix.
 *
 * Two reasons this is an allowlist rather than something every premium-v2
 * tenant gets:
 *
 * 1. Build output. The matrix is ~3,700 prerendered routes per tenant. At
 *    three tenants the production build took 32 minutes and shipped; adding a
 *    fourth pushed it past the deployment output limit and the deploy failed
 *    after a 41-minute build. Duplicating the same 137 sectors for every
 *    client buys nothing and costs the whole deploy.
 *
 * 2. Content quality. The pages differ only by sector name and the four
 *    corridor figures that sector's locality row supplies. That is thin
 *    enough to be worth opting into per client rather than switching on by
 *    default for anyone onboarded.
 *
 * The base vastu pages (facing, room, room x direction, plot size, property
 * type) stay available to every real-estate tenant — that set is small.
 */
const VASTU_SECTOR_TENANTS = new Set(["high-properties"]);

export function vastuSectorsEnabled(clientSlug: string | undefined | null): boolean {
  if (!clientSlug) return false;
  return VASTU_SECTOR_TENANTS.has(clientSlug);
}
