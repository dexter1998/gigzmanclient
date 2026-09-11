import { getTemplateKeyForSlug } from "@/lib/templates";

/**
 * The home-loan pages are two things at once, and they need separating.
 *
 * The calculators, lender rate table and budget comparisons are just tools —
 * every premium-v2 tenant should have them, and withholding them from a
 * client because of the sentence below made no sense.
 *
 * That sentence is the part that is not universal: the page states the firm
 * is an authorised channel partner for the listed lenders. That is only true
 * of tenants who actually hold a DSA relationship, and publishing it for one
 * who does not is a misrepresentation. So the claim keeps the allowlist the
 * whole page used to have; the pages themselves no longer do.
 */
const CHANNEL_PARTNER_TENANTS = new Set([
  "high-properties",
  "nayra-realtors",
  "urban-flat-real-estate",
]);

/** Whether this tenant publishes the home-loan section at all. */
export function homeLoanEnabled(clientSlug: string | undefined | null): boolean {
  if (!clientSlug) return false;
  return getTemplateKeyForSlug(clientSlug) === "premium-v2";
}

/**
 * Whether this tenant may describe itself as an authorised channel partner.
 * Add a slug only once that DSA relationship is confirmed for the client.
 */
export function channelPartnerClaimAllowed(clientSlug: string | undefined | null): boolean {
  if (!clientSlug) return false;
  return CHANNEL_PARTNER_TENANTS.has(clientSlug);
}
