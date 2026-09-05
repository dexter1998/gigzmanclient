import { Suspense } from "react";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import RealEstateSiteHeader from "@/components/realestate/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import HeaderV2 from "@/components/realestate/premium-v2/HeaderV2";
import FooterV2 from "@/components/realestate/premium-v2/FooterV2";
import ScrollLeadPopupV2 from "@/components/realestate/premium-v2/ScrollLeadPopupV2";
import WhatsAppFloatV2 from "@/components/realestate/premium-v2/WhatsAppFloatV2";
import MobileActionBarV2 from "@/components/realestate/premium-v2/MobileActionBarV2";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import CompliancePopup from "@/components/site/CompliancePopup";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { getFirmSettings, getNextDeadline, getServices } from "@/lib/content";
import { buildOrganizationJsonLd, jsonLdProps } from "@/lib/schema-org";
import { deadlineInstant, daysUntil, formatDate } from "@/lib/format";
import { getVerticalConfig } from "@/lib/verticals";

/**
 * Revalidated rather than re-rendered per request. Combined with taking the
 * tenant from `params` instead of `headers()`, this is what lets the public
 * site be served from cache — reading a dynamic API anywhere in this subtree
 * would opt the whole thing back into per-request rendering.
 */
export const revalidate = 300;


export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const basePath = basePathFor(tenant);
  const [settings, deadline, services] = await Promise.all([
    getFirmSettings(tenant.id),
    getNextDeadline(tenant.id),
    getServices(tenant.id),
  ]);

  if (!settings) notFound();

  const p = (path: string) => joinPath(basePath, path);
  const vertical = getVerticalConfig(tenant.vertical);

  const navItems = vertical.nav.map((item) => ({ label: item.label, href: p(item.path) }));

  const categories = [...new Set(services.map((s) => s.category))];
  const effectiveDate = deadline ? (deadline.extendedDueDate ?? deadline.dueDate) : null;
  const isPremiumV2 = getTemplateKeyForSlug(tenant.slug) === "premium-v2";

  return (
    // Theme scope. These attributes used to sit on <html> in the root layout,
    // which forced every route in the app to be dynamically rendered. Custom
    // properties inherit, so scoping them here themes the whole tenant tree
    // identically while leaving the root layout static.
    <div
      data-vertical={tenant.vertical}
      data-template={getTemplateKeyForSlug(tenant.slug)}
      className="flex min-h-full flex-1 flex-col"
    >
      <script
        {...jsonLdProps(buildOrganizationJsonLd(settings, basePath || "/", vertical.schemaType))}
      />

      {deadline && effectiveDate ? (
        <AnnouncementBar
          title={deadline.title}
          dueDate={deadline.dueDate}
          extendedDueDate={deadline.extendedDueDate}
          href={p("/compliance-calendar")}
        />
      ) : null}

      {isPremiumV2 ? (
        // HeaderV2 reads useSearchParams() to highlight the active nav item
        // (Buy/Rent/Commercial all point at /properties with different
        // params). That hook opts the whole route out of static rendering
        // unless it sits behind a Suspense boundary — with one, the shell
        // prerenders and the header resolves its active state on the client.
        <Suspense fallback={<div className="h-[88px] lg:h-[104px]" />}>
          <HeaderV2
            firmName={settings.firmName}
            logoUrl={settings.logoUrl ?? ""}
            phone={settings.phone}
            basePath={basePath || "/"}
            navItems={navItems}
          />
        </Suspense>
      ) : vertical.id === "realestate" ? (
        <RealEstateSiteHeader
          firmName={settings.firmName}
          logoUrl={settings.logoUrl}
          basePath={basePath || "/"}
          phone={settings.phone}
          whatsapp={settings.whatsapp}
          navItems={navItems}
          contactHref={p("/contact")}
        />
      ) : (
        <SiteHeader
          firmName={settings.firmName}
          descriptor={settings.businessCategory}
          logoUrl={settings.logoUrl}
          basePath={basePath || "/"}
          phone={settings.phone}
          navItems={navItems}
          contactHref={p("/contact")}
          vertical={vertical.id}
        />
      )}

      {/* HeaderV2 is `fixed`, so every premium-v2 page (home included, now
          that HeroV2 no longer carries its own top padding) needs this
          clearance or its first section renders underneath the header.
          Pinned to HeaderV2's exact measured height (88px mobile / 104px
          lg+, from its py-4/py-5 + h-14/h-16 logo) rather than a rounder
          Tailwind step — pt-28/pt-32 (112px/128px) left a 24px gap where a
          dark first section (e.g. Updates/Localities) showed the page's own
          background as a visible strip under the header. */}
      <main className={isPremiumV2 ? "flex-1 pt-[88px] lg:pt-[104px]" : "flex-1"}>{children}</main>

      {isPremiumV2 ? (
        <FooterV2 settings={settings} basePath={basePath || "/"} clientSlug={tenant.slug} />
      ) : (
        <SiteFooter
          settings={settings}
          basePath={basePath}
          categories={categories}
          vertical={vertical}
        />
      )}

      {settings.whatsapp && !isPremiumV2 ? (
        <WhatsAppFloat number={settings.whatsapp} firmName={settings.firmName} />
      ) : null}

      {isPremiumV2 ? (
        <>
          {settings.whatsapp ? (
            <WhatsAppFloatV2 number={settings.whatsapp} firmName={settings.firmName} />
          ) : null}
          <MobileActionBarV2
            phone={settings.phone}
            whatsapp={settings.whatsapp}
            firmName={settings.firmName}
            googleMapsUrl={settings.googleMapsUrl}
          />
          <ScrollLeadPopupV2 basePath={basePath || "/"} />
        </>
      ) : null}

      {deadline && effectiveDate ? (
        <CompliancePopup
          deadlineId={deadline.id}
          title={deadline.title}
          effectiveDate={formatDate(effectiveDate)}
          targetIso={deadlineInstant(effectiveDate).toISOString()}
          daysRemaining={daysUntil(effectiveDate)}
          href={p("/compliance-calendar")}
        />
      ) : null}
    </div>
  );
}
