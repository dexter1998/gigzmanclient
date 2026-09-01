import PremiumInventoryHome from "./PremiumInventoryHome";
import LuxuryAdvisoryHome from "./LuxuryAdvisoryHome";
import MarketIntelligenceHome from "./MarketIntelligenceHome";
import LocalityPseoHome from "./LocalityPseoHome";
import { getTemplateKeyForSlug } from "@/lib/templates";
import type { Tenant } from "@/lib/tenant";

/**
 * Renders the home page matching the tenant's assigned template. An
 * unregistered slug (a future real client before they choose a direction)
 * falls back to Premium Inventory, the fullest general-purpose layout.
 */
export default function RealEstateTemplateHome({ tenant }: { tenant: Tenant }) {
  switch (getTemplateKeyForSlug(tenant.slug)) {
    case "luxury-advisory":
      return <LuxuryAdvisoryHome tenant={tenant} />;
    case "market-intelligence":
      return <MarketIntelligenceHome tenant={tenant} />;
    case "locality-pseo":
      return <LocalityPseoHome tenant={tenant} />;
    case "premium-inventory":
    default:
      return <PremiumInventoryHome tenant={tenant} />;
  }
}
