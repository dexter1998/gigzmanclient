import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import {
  getFirmSettings,
  getTeam,
  getProperties,
  getPropertyImagesFor,
  getLocalities,
} from "@/lib/content";
import HeroV2 from "../premium-v2/HeroV2";
import ImageStripV2 from "../premium-v2/ImageStripV2";
import ServicesMosaicV2 from "../premium-v2/ServicesMosaicV2";
import NewLaunchesV2 from "../premium-v2/NewLaunchesV2";
import CorridorPanoramaV2 from "../premium-v2/CorridorPanoramaV2";
import HotPropertiesGridV2 from "../premium-v2/HotPropertiesGridV2";
import ShortlistCtaV2 from "../premium-v2/ShortlistCtaV2";
import DeveloperRibbonV2 from "../premium-v2/DeveloperRibbonV2";
import AdvisorsV2 from "../premium-v2/AdvisorsV2";
import MarketIntelligenceV2 from "../premium-v2/MarketIntelligenceV2";
import MapSelectedPropertyV2 from "../premium-v2/MapSelectedPropertyV2";
import CalculatorsV2 from "../premium-v2/CalculatorsV2";
import RecentDealsV2 from "../premium-v2/RecentDealsV2";
import VideoTestimonialsV2 from "../premium-v2/VideoTestimonialsV2";
import ConsultationCtaV2 from "../premium-v2/ConsultationCtaV2";
import FaqV2 from "../premium-v2/FaqV2";
import MapEmbedV2 from "../premium-v2/MapEmbedV2";

const HERO_IMAGE = "/verticals/realestate/templates/premium-v2/images/hero-curated-inventory-v2.png";

/**
 * Flagship/mid/tall picks for the HOT-properties asymmetric grid (section 6)
 * are matched by the `badge` values seeded in
 * clients/geeta-properties/content/properties.yaml — "Flagship" and "Yield
 * Asset" each identify exactly one listing there. The two mid slots are
 * fixed slugs rather than a generic filter, since the asymmetric grid needs
 * exactly two, not "however many happen to match a rule".
 */
export default async function PremiumV2Home({ tenant }: { tenant: Tenant }) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const [settings, team, allProperties, localities] = await Promise.all([
    getFirmSettings(tenant.id),
    getTeam(tenant.id),
    getProperties(tenant.id, {}),
    getLocalities(tenant.id),
  ]);

  if (!settings) return null;

  // One batched query instead of one per property — see getPropertyImagesFor.
  const imagesByProperty = await getPropertyImagesFor(allProperties.map((p) => p.id));
  const imageMap = Object.fromEntries(
    allProperties.map((property) => {
      const images = imagesByProperty[property.id] ?? [];
      const primary = images.find((img) => img.isPrimary) ?? images[0] ?? null;
      return [
        property.id,
        primary ? { path: primary.path, alt: primary.alt ?? undefined } : undefined,
      ] as const;
    }),
  );

  const newlyLaunched = allProperties.filter((prop) => prop.status === "new_launch").slice(0, 4);

  const flagship =
    allProperties.find((prop) => prop.badge === "Flagship") ??
    allProperties.find((prop) => prop.isFeatured) ??
    allProperties[0];
  const tallProperty =
    allProperties.find((prop) => prop.badge === "Yield Asset") ??
    allProperties.find((prop) => prop.propertyType === "commercial") ??
    allProperties[1];
  const midCandidates = allProperties.filter(
    (prop) => prop.id !== flagship?.id && prop.id !== tallProperty?.id,
  );
  const midProperties: [typeof allProperties[number], typeof allProperties[number]] = [
    midCandidates[0] ?? allProperties[2],
    midCandidates[1] ?? allProperties[3],
  ];

  const advisorName = team[0]?.name ?? settings.firmName;
  const fullAddress = [settings.addressLine, settings.locality, settings.region, settings.postalCode]
    .filter(Boolean)
    .join(", ");

  if (!flagship || !tallProperty || !midProperties[0] || !midProperties[1]) {
    // Not enough seeded inventory to build the asymmetric grid — skip it
    // rather than render with undefined props (shouldn't happen once
    // clients/geeta-properties/content/properties.yaml is seeded).
    return null;
  }

  return (
    <>
      <HeroV2 basePath={basePath} heroImageSrc={HERO_IMAGE} firmName={settings.firmName} />
      <ImageStripV2 basePath={basePath} />
      <ServicesMosaicV2 p={p} />
      <NewLaunchesV2 properties={newlyLaunched} imageMap={imageMap} p={p} />
      <CorridorPanoramaV2 localities={localities} basePath={basePath} />
      <HotPropertiesGridV2
        flagship={flagship}
        midProperties={midProperties}
        tallProperty={tallProperty}
        imageMap={imageMap}
        p={p}
      />
      <ShortlistCtaV2 whatsapp={settings.whatsapp} firmName={settings.firmName} />
      <DeveloperRibbonV2 p={p} />
      <AdvisorsV2 phone={settings.phone} whatsapp={settings.whatsapp} />
      <MarketIntelligenceV2 localities={localities} basePath={basePath} />
      <MapSelectedPropertyV2
        properties={allProperties.slice(0, 8)}
        imageMap={imageMap}
        basePath={basePath}
        googleMapsUrl={settings.googleMapsUrl}
      />
      <CalculatorsV2 contactHref={p("/contact")} advisorName={advisorName} />
      <RecentDealsV2 p={p} />
      <VideoTestimonialsV2 />
      <FaqV2
        asideContent={
          fullAddress ? <MapEmbedV2 address={fullAddress} className="aspect-[4/3] w-full" /> : undefined
        }
      />
      <ConsultationCtaV2 phone={settings.phone} />
    </>
  );
}
