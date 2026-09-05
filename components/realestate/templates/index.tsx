import PremiumV2Home from "./PremiumV2Home";
import type { Tenant } from "@/lib/tenant";

/**
 * Premium V2 is the only real-estate template now — the earlier
 * premium-inventory/luxury-advisory/market-intelligence/locality-pseo
 * template-library demos were removed. Every real-estate tenant renders it.
 */
export default function RealEstateTemplateHome({ tenant }: { tenant: Tenant }) {
  return <PremiumV2Home tenant={tenant} />;
}
