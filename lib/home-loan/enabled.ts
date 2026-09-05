/**
 * Which tenants publish the home-loan pages.
 *
 * These pages display lender trademarks and describe the firm as an
 * authorised channel partner. That is only true for tenants who actually
 * hold a DSA relationship — publishing it for a tenant who does not would be
 * a misrepresentation, so this is an explicit allowlist rather than being
 * inferred from the template key. Add a slug here only once the DSA
 * relationship is confirmed for that client.
 */
const HOME_LOAN_TENANTS = new Set(["high-properties"]);

export function homeLoanEnabled(clientSlug: string | undefined | null): boolean {
  if (!clientSlug) return false;
  return HOME_LOAN_TENANTS.has(clientSlug);
}
