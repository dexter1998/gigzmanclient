import Link from "next/link";
import Image from "next/image";
import { ArrowRight, IndianRupee, TrendingDown, TrendingUp, Percent, Building2 } from "lucide-react";
import type { localities } from "@/lib/db/schema";
import PropertyCardV2 from "./PropertyCardV2";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import { getProperties, getPropertyImagesFor } from "@/lib/content";
import { formatIndianPrice, formatDate } from "@/lib/format";
import { buildBreadcrumbJsonLd, jsonLdProps } from "@/lib/schema-org";

type Locality = typeof localities.$inferSelect;

type Stat = {
  label: string;
  value: string;
  icon: typeof IndianRupee;
};

export default async function PremiumV2LocalityDetailPage({
  clientId,
  locality,
  otherLocalities,
  p,
}: {
  clientId: string;
  locality: Locality;
  otherLocalities: Locality[];
  p: (path: string) => string;
}) {
  const [listings] = await Promise.all([getProperties(clientId, { locality: locality.name })]);

  const imagesByProperty = await getPropertyImagesFor(listings.map((item) => item.id));
  const primaryImages = await Promise.all(
    listings.map(async (property) => {
      const images = imagesByProperty[property.id] ?? [];
      const primary = images.find((img) => img.isPrimary) ?? images[0] ?? null;
      return primary ? { path: primary.path, alt: primary.alt } : null;
    }),
  );

  const yoy = locality.yoyChangePercent;
  const stats: Stat[] = [
    ...(locality.avgPricePerSqft
      ? [{ label: "Avg. price / sq.ft", value: `${formatIndianPrice(locality.avgPricePerSqft)}`, icon: IndianRupee }]
      : []),
    ...(yoy !== null
      ? [
          {
            label: "Year-on-year change",
            value: `${yoy >= 0 ? "+" : ""}${yoy}%`,
            icon: yoy >= 0 ? TrendingUp : TrendingDown,
          },
        ]
      : []),
    ...(locality.rentalYieldPercent !== null
      ? [{ label: "Rental yield", value: `${locality.rentalYieldPercent}%`, icon: Percent }]
      : []),
    ...(locality.activeProjects !== null
      ? [{ label: "Active projects", value: `${locality.activeProjects}`, icon: Building2 }]
      : []),
  ];

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Localities", url: p("/localities") },
            { name: locality.name, url: p(`/localities/${locality.slug}`) },
          ]),
        )}
      />

      <div className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          {locality.heroImage ? (
            <Image
              src={locality.heroImage}
              alt={locality.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />

          <GpContainer className="absolute inset-0 flex flex-col justify-end pb-10 sm:pb-14">
            <nav aria-label="Breadcrumb" className="mb-5 text-[12px] text-white/60">
              <Link href={p("/")} className="inline-block py-1 hover:text-[color:var(--gp-gold-300)]">
                Home
              </Link>
              <span className="mx-1.5">/</span>
              <Link href={p("/localities")} className="inline-block py-1 hover:text-[color:var(--gp-gold-300)]">
                Localities
              </Link>
              <span className="mx-1.5">/</span>
              <span className="text-white/85">{locality.name}</span>
            </nav>

            {locality.corridor && locality.corridor !== locality.name ? (
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">{locality.corridor}</GpEyebrow>
            ) : null}
            <h1 className="gp-hero-title font-display mt-2 max-w-2xl text-white">{locality.name}</h1>
            {locality.bestFor ? (
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base">
                Best for {locality.bestFor.charAt(0).toLowerCase() + locality.bestFor.slice(1)}
              </p>
            ) : null}
          </GpContainer>
        </div>
      </div>

      <GpSection tone="cream" className="!pb-0">
        <GpContainer>
          {stats.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white px-5 py-5"
                  >
                    <Icon className="h-4 w-4 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                    <p className="font-sans mt-3 text-[24px] font-semibold leading-none text-[color:var(--gp-ink)]">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-[11.5px] text-[color:var(--gp-muted)]">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          ) : null}

          {locality.lastVerifiedAt ? (
            // "Last verified" overstated what this date is: it is when the row
            // was last updated, and the underlying corridor figures are working
            // averages that have not been independently checked. Saying so is
            // the difference between a caveat and a false claim.
            <p className="mt-4 text-[11.5px] text-[color:var(--gp-muted)]">
              Market figures last updated {formatDate(locality.lastVerifiedAt)}. These are indicative
              corridor-wide working averages, not independently verified and not a certified
              valuation — ask us for the recent transacted range in a specific project.
            </p>
          ) : null}

          {locality.description ? (
            <p className="mt-8 max-w-3xl text-[15px] leading-relaxed text-[color:var(--gp-body)] sm:text-base">
              {locality.description}
            </p>
          ) : null}
        </GpContainer>
      </GpSection>

      <GpSection tone="cream">
        <GpContainer>
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[color:var(--gp-border)] pb-4">
            <h2 className="gp-section-title font-display text-[color:var(--gp-ink)]">
              Properties in this Corridor
            </h2>
            <span className="shrink-0 text-[12px] text-[color:var(--gp-muted)]">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="mt-8 rounded-[var(--gp-radius-md)] border border-dashed border-[color:var(--gp-border)] p-12 text-center">
              <p className="font-display text-[15px] text-[color:var(--gp-ink)]">
                No active listings in {locality.name} right now.
              </p>
              <Link
                href={p(`/contact?locality=${encodeURIComponent(locality.name)}`)}
                className="mt-5 inline-flex min-h-[46px] items-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[13.5px] font-medium text-white hover:bg-[color:var(--gp-gold-300)]"
              >
                Get Notified
              </Link>
            </div>
          ) : (
            <div className="gp-mobile-carousel mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((property, i) => (
                <PropertyCardV2
                  key={property.id}
                  property={property}
                  href={p(`/properties/${property.slug}`)}
                  imagePath={primaryImages[i]?.path}
                  imageAlt={primaryImages[i]?.alt ?? undefined}
                />
              ))}
            </div>
          )}
        </GpContainer>
      </GpSection>

      {otherLocalities.length > 0 ? (
        <GpSection tone="forest">
          <GpContainer>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <GpEyebrow>Other Corridors</GpEyebrow>
                <h2 className="gp-section-title font-display mt-2 text-white">Keep exploring Gurugram</h2>
              </div>
              <Link
                href={p("/localities")}
                className="inline-flex min-h-[38px] items-center gap-1.5 text-[13px] font-semibold text-white/80 hover:text-[color:var(--gp-gold-300)]"
              >
                All corridors
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {otherLocalities.map((other) => (
                <Link
                  key={other.id}
                  href={p(`/localities/${other.slug}`)}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-[var(--gp-radius-md)]"
                >
                  {other.heroImage ? (
                    <Image
                      src={other.heroImage}
                      alt={other.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[color:var(--gp-forest-800)]" />
                  )}
                  <div className="absolute inset-0" style={{ background: "var(--gp-gradient-card)" }} />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="gp-eyebrow text-[color:var(--gp-gold-300)]">{other.name}</p>
                    {other.avgPricePerSqft ? (
                      <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-white/85">
                        {formatIndianPrice(other.avgPricePerSqft)}/sq.ft
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </GpContainer>
        </GpSection>
      ) : null}
    </>
  );
}
