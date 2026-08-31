import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import CompliancePopup from "@/components/site/CompliancePopup";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import { getTenant, getBasePath, joinPath } from "@/lib/tenant";
import { getFirmSettings, getNextDeadline, getServices } from "@/lib/content";
import { buildOrganizationJsonLd, jsonLdProps } from "@/lib/schema-org";
import { deadlineInstant, daysUntil, formatDate } from "@/lib/format";
import { getVerticalConfig } from "@/lib/verticals";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const basePath = await getBasePath();
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

  return (
    <>
      <script {...jsonLdProps(buildOrganizationJsonLd(settings, basePath || "/"))} />

      {deadline && effectiveDate ? (
        <AnnouncementBar
          title={deadline.title}
          dueDate={deadline.dueDate}
          extendedDueDate={deadline.extendedDueDate}
          href={p("/compliance-calendar")}
        />
      ) : null}

      <SiteHeader
        firmName={settings.firmName}
        descriptor={settings.businessCategory}
        logoUrl={settings.logoUrl}
        basePath={basePath || "/"}
        phone={settings.phone}
        navItems={navItems}
        contactHref={p("/contact")}
      />

      <main className="flex-1">{children}</main>

      <SiteFooter
        settings={settings}
        basePath={basePath}
        categories={categories}
        vertical={vertical}
      />

      {settings.whatsapp ? (
        <WhatsAppFloat number={settings.whatsapp} firmName={settings.firmName} />
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
    </>
  );
}
