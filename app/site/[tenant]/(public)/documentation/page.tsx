import { notFound } from "next/navigation";
import PremiumV2DocumentationPage from "@/components/realestate/premium-v2/PremiumV2DocumentationPage";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { paramsForEachTenant } from "@/lib/static-params";
import { getFirmSettings } from "@/lib/content";

/**
 * `getFirmSettings` is cached, but this segment still declares its own
 * revalidate so it is prerendered and served from the CDN rather than
 * rendered per request — the same reason `builders/[slug]` sets one.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) =>
    getTemplateKeyForSlug(tenant.slug) === "premium-v2" ? [{}] : [],
  );
}

export async function generateMetadata(props: PageProps<"/site/[tenant]/documentation">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    alternates: { canonical: joinPath(basePathFor(tenant), "/documentation") },
    title: `Property Documentation in Gurugram — ${settings?.firmName ?? ""}`,
    description:
      "Title verification, registry and mutation, home-loan files, deeds, construction approvals and NRI paperwork — handled end to end, from verification before payment to your name in the revenue record.",
  };
}

export default async function DocumentationPage(props: PageProps<"/site/[tenant]/documentation">) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  return (
    <PremiumV2DocumentationPage
      firmName={settings.firmName}
      phone={settings.phone}
      p={(path: string) => joinPath(basePath, path)}
    />
  );
}
