import Link from "next/link";
import { BedDouble, Bath, Ruler, Building2, MapPin, ShieldCheck, ShieldAlert, Check } from "lucide-react";
import PremiumV2PropertyGallery from "./PremiumV2PropertyGallery";
import PremiumV2EnquiryForm from "./PremiumV2EnquiryForm";
import PremiumV2CallLink from "./PremiumV2CallLink";
import PremiumV2WhatsappLink from "./PremiumV2WhatsappLink";
import PropertyCardV2 from "./PropertyCardV2";
import { GpContainer } from "./gp-primitives";
import { joinPath, type Tenant } from "@/lib/tenant";
import type { properties, propertyImages, firmSettings } from "@/lib/db/schema";
import {
  formatIndianPrice,
  formatNumber,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_PURPOSE_LABELS,
} from "@/lib/format";

type Property = typeof properties.$inferSelect;
type PropertyImage = typeof propertyImages.$inferSelect;
type FirmSettings = typeof firmSettings.$inferSelect;

interface SimilarEntry {
  property: Property;
  imagePath?: string | null;
  imageAlt?: string;
}

export default function PremiumV2PropertyDetailPage({
  tenant: _tenant,
  property,
  images,
  settings,
  similarProperties,
  basePath,
}: {
  tenant: Tenant;
  property: Property;
  images: PropertyImage[];
  settings: FirmSettings;
  similarProperties: SimilarEntry[];
  basePath: string;
}) {
  const p = (path: string) => joinPath(basePath, path);

  const priceDisplay =
    property.priceLabel || (property.price ? formatIndianPrice(property.price) : "Price on request");
  const locationLine = [property.locality, property.sector ? `Sector ${property.sector}` : null]
    .filter(Boolean)
    .join(", ");

  const telHref = settings.phone ? `tel:${settings.phone.replace(/\s/g, "")}` : null;
  const whatsappHref = settings.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
        `Hi, I'm interested in ${property.title} (${p(`/properties/${property.slug}`)})`,
      )}`
    : null;

  const configItems = [
    property.beds ? { icon: BedDouble, value: `${property.beds} BHK`, label: "Bedrooms" } : null,
    property.baths ? { icon: Bath, value: String(property.baths), label: "Bathrooms" } : null,
    property.area
      ? {
          icon: Ruler,
          value: `${formatNumber(property.area)} ${property.areaUnit ?? "sqft"}`,
          label: "Area",
        }
      : null,
    {
      icon: Building2,
      value: PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType,
      label: "Type",
    },
  ].filter(Boolean) as { icon: typeof BedDouble; value: string; label: string }[];

  const specs = property.specs && typeof property.specs === "object" ? property.specs : {};
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];

  return (
    <div className="bg-[color:var(--gp-cream-100)]">
      <GpContainer className="pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-5 text-[12px] text-[color:var(--gp-muted)]">
          <Link href={p("/")} className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={p("/properties")} className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]">
            Properties
          </Link>
          {property.locality ? (
            <>
              <span className="mx-1.5">/</span>
              <Link
                href={p(`/properties?locality=${encodeURIComponent(property.locality)}`)}
                className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]"
              >
                {property.locality}
              </Link>
            </>
          ) : null}
          <span className="mx-1.5">/</span>
          <span className="text-[color:var(--gp-ink)]">{property.title}</span>
        </nav>

        <PremiumV2PropertyGallery
          images={images.map((img) => ({ path: img.path, alt: img.alt }))}
          propertyType={property.propertyType}
          title={property.title}
          propertyId={property.id}
        />
      </GpContainer>

      <GpContainer className="gp-section !pt-8 sm:!pt-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div className="min-w-0 space-y-12">
            {/* Title, price, status */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[color:var(--gp-gold-600)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[color:var(--gp-forest-950)]">
                  {PROPERTY_STATUS_LABELS[property.status] ?? property.status}
                </span>
                <span className="rounded-full border border-[color:var(--gp-border)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[color:var(--gp-body)]">
                  {PROPERTY_PURPOSE_LABELS[property.purpose] ?? property.purpose}
                </span>
                {property.badge ? (
                  <span className="rounded-full border border-[color:var(--gp-border)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[color:var(--gp-body)]">
                    {property.badge}
                  </span>
                ) : null}
              </div>

              <h1 className="gp-section-title font-display mt-4 text-[color:var(--gp-ink)]">
                {property.title}
              </h1>

              {locationLine ? (
                <p className="mt-3 flex items-center gap-1.5 text-[14.5px] text-[color:var(--gp-body)]">
                  <MapPin className="h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                  {locationLine}
                </p>
              ) : null}

              <p className="mt-5 font-sans text-[32px] font-semibold text-[color:var(--gp-gold-600)]">
                {priceDisplay}
                {property.purpose === "rent" ? (
                  <span className="ml-1.5 text-[14px] font-normal text-[color:var(--gp-muted)]">/ month</span>
                ) : null}
              </p>
              {property.pricePerSqft ? (
                <p className="mt-1 text-[12.5px] text-[color:var(--gp-muted)]">
                  {formatIndianPrice(property.pricePerSqft)} per sqft
                </p>
              ) : null}

              {/* RERA verification line — same honesty rule as PropertyCard: a
                  listing without a registration number visibly says so rather
                  than omitting the line. */}
              <div className="mt-5 flex items-start gap-2 border-t border-[color:var(--gp-border)] pt-5">
                {property.reraNumber ? (
                  <>
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gp-success)]" aria-hidden="true" />
                    <p className="text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                      <span className="font-semibold text-[color:var(--gp-ink)]">RERA registered</span> — {property.reraNumber}
                      {property.developer ? ` · Developer: ${property.developer}` : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    <p className="text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                      <span className="font-semibold text-[color:var(--gp-ink)]">Registration pending</span> — this
                      project&rsquo;s RERA number has not been published yet. Treat this listing as provisional.
                      {property.developer ? ` Developer: ${property.developer}` : ""}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Config summary strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {configItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white p-4 text-center"
                >
                  <item.icon className="mx-auto h-[18px] w-[18px] text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                  <p className="mt-2 text-[14.5px] font-semibold text-[color:var(--gp-ink)]">{item.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-[color:var(--gp-muted)]">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description ? (
              <div>
                <h2 className="gp-eyebrow text-[color:var(--gp-gold-600)]">About This Property</h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">
                  {property.description}
                </p>
              </div>
            ) : null}

            {/* Amenities */}
            {amenities.length > 0 ? (
              <div>
                <h2 className="gp-eyebrow text-[color:var(--gp-gold-600)]">Amenities</h2>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {amenities.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gp-border)] bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[color:var(--gp-body)]"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Specs table — editorial style, thin dividers, no boxed table */}
            {Object.keys(specs).length > 0 ? (
              <div>
                <h2 className="gp-eyebrow text-[color:var(--gp-gold-600)]">Specifications</h2>
                <dl className="mt-4 max-w-2xl divide-y divide-[color:var(--gp-border)]">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-6 py-3 text-[13.5px]">
                      <dt className="text-[color:var(--gp-muted)]">{key}</dt>
                      <dd className="text-right font-medium text-[color:var(--gp-ink)]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <p className="border-t border-[color:var(--gp-border)] pt-5 text-[11.5px] leading-relaxed text-[color:var(--gp-muted)]">
              Carpet area, price and possession timeline are indicative and subject to confirmation
              and change by the developer and the relevant authority.
            </p>
          </div>

          {/* Enquiry panel — glass, gold CTA */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div
              className="rounded-[var(--gp-radius-lg)] p-6 sm:p-7"
              style={{ background: "var(--gp-gradient-glass)" }}
            >
              <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">Interested?</p>
              <h3 className="gp-overlay-title font-display mt-2 text-[color:var(--gp-ink)]">
                Enquire about this property
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                Share your details and {settings.firmName ?? "the team"} will get back with
                availability and site-visit slots.
              </p>

              {telHref || whatsappHref ? (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {telHref ? (
                    <PremiumV2CallLink telHref={telHref} phone={settings.phone!} />
                  ) : null}
                  {whatsappHref ? (
                    <PremiumV2WhatsappLink whatsappHref={whatsappHref} propertyId={property.id} />
                  ) : null}
                </div>
              ) : null}

              <div className="mt-6 border-t border-[color:var(--gp-border)] pt-6">
                <PremiumV2EnquiryForm
                  basePath={basePath}
                  propertySlug={property.slug}
                  propertyId={property.id}
                />
              </div>
            </div>
          </aside>
        </div>
      </GpContainer>

      {/* Similar properties */}
      {similarProperties.length > 0 ? (
        <div className="gp-section !pt-0">
          <GpContainer>
            <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">You May Also Like</p>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Similar Properties
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {similarProperties.map(({ property: item, imagePath, imageAlt }) => (
                <PropertyCardV2
                  key={item.id}
                  property={item}
                  href={p(`/properties/${item.slug}`)}
                  imagePath={imagePath}
                  imageAlt={imageAlt}
                />
              ))}
            </div>
          </GpContainer>
        </div>
      ) : null}
    </div>
  );
}
