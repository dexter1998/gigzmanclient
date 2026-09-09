/**
 * Hostname -> tenant slug, for deployments running in host mode
 * (`TENANT_MODE=host`), where one client's own domain serves that client's
 * site at the root: highproperties.in/properties, not
 * highproperties.in/realestate/temp-premium-v2/high-properties/properties.
 *
 * This is a static map rather than a `clients.customDomain` lookup because
 * the resolution happens in `proxy.ts`, which runs as edge middleware and
 * cannot reach the database. `clients.customDomain` is still the source of
 * truth for the sitemap's absolute URLs — keep the two in step when adding a
 * client domain here.
 *
 * The preview `*.vercel.app` hostname of a host-mode deployment is included
 * so the site is testable before DNS is pointed. `PRIMARY_HOST_TENANT` is the
 * fallback for any other hostname that reaches a host-mode deployment.
 */
export const HOST_TENANT_MAP: Record<string, string> = {
  "highproperties.in": "high-properties",
  "www.highproperties.in": "high-properties",
};

/**
 * Which tenant an unmapped hostname resolves to on a host-mode deployment.
 * Set per deployment; a host-mode deployment serves exactly one client, so
 * falling back to that client is correct rather than a guess.
 */
export const PRIMARY_HOST_TENANT = process.env.PRIMARY_TENANT_SLUG || "";

export function tenantSlugForHost(host: string): string | null {
  const clean = host.split(":")[0].toLowerCase();
  return HOST_TENANT_MAP[clean] ?? (PRIMARY_HOST_TENANT || null);
}
