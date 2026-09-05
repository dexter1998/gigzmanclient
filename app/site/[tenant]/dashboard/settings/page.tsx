import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { firmSettings, services } from "@/lib/db/schema";
import { getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import SettingsForm from "@/components/dashboard/SettingsForm";
import ServiceToggles from "@/components/dashboard/ServiceToggles";

export default async function DashboardSettingsPage() {
  const basePath = await getBasePath();
  const user = await getSessionUser();
  if (!user) redirect(joinPath(basePath, "/dashboard/login"));

  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="display-md">Settings</h1>
        <p className="mt-4 rounded-[10px] border border-line bg-surface p-6 text-[14px] text-ink-muted">
          Firm details and website settings are managed by an administrator.
        </p>
      </div>
    );
  }

  const [[settings], serviceRows] = await Promise.all([
    db.select().from(firmSettings).where(eq(firmSettings.clientId, user.clientId)).limit(1),
    db
      .select()
      .from(services)
      .where(eq(services.clientId, user.clientId))
      .orderBy(asc(services.sortOrder)),
  ]);

  if (!settings) redirect(joinPath(basePath, "/dashboard"));

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <h1 className="display-md">Settings</h1>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          Firm details published here feed the website, the structured data and the map. Keep them
          identical to the Google Business Profile.
        </p>
      </div>

      <SettingsForm
        settings={{
          firmName: settings.firmName,
          tagline: settings.tagline ?? "",
          overview: settings.overview ?? "",
          establishedYear: settings.establishedYear ?? "",
          firmRegistrationNumber: settings.firmRegistrationNumber ?? "",
          businessCategory: settings.businessCategory ?? "",
          logoUrl: settings.logoUrl ?? "",
          phone: settings.phone ?? "",
          whatsapp: settings.whatsapp ?? "",
          email: settings.email ?? "",
          addressLine: settings.addressLine ?? "",
          locality: settings.locality ?? "",
          region: settings.region ?? "",
          postalCode: settings.postalCode ?? "",
          latitude: settings.latitude ?? "",
          longitude: settings.longitude ?? "",
          googleMapsUrl: settings.googleMapsUrl ?? "",
          seoTitle: settings.seoTitle ?? "",
          seoDescription: settings.seoDescription ?? "",
          ga4MeasurementId: settings.ga4MeasurementId ?? "",
          notificationEmail: settings.notificationEmail ?? "",
          reviewsEnabled: settings.reviewsEnabled,
          pricingEnabled: settings.pricingEnabled,
          awardsEnabled: settings.awardsEnabled,
          clientLogosEnabled: settings.clientLogosEnabled,
          teamEnabled: settings.teamEnabled,
        }}
      />

      <div className="mt-8">
        <h2 className="text-[15px] font-semibold text-ink">Service availability</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Hide anything the firm does not offer. Hidden services disappear from the website but are
          retained so they can be restored.
        </p>
        <ServiceToggles
          services={serviceRows.map((s) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            isActive: s.isActive,
          }))}
        />
      </div>
    </div>
  );
}
