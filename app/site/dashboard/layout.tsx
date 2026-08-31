import { notFound } from "next/navigation";
import { getTenant, getBasePath, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getSessionUser } from "@/lib/auth";
import DashboardChrome from "@/components/dashboard/DashboardChrome";
import { getVerticalConfig } from "@/lib/verticals";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const basePath = await getBasePath();
  const user = await getSessionUser();

  // The login page renders inside this layout, so an unauthenticated visitor is
  // shown the bare page rather than the dashboard shell.
  if (!user) return <>{children}</>;

  const settings = await getFirmSettings(tenant.id);
  const vertical = getVerticalConfig(tenant.vertical);

  return (
    <DashboardChrome
      firmName={settings?.firmName ?? tenant.displayName}
      basePath={basePath}
      siteHref={joinPath(basePath, "/")}
      navItems={vertical.dashboardNav}
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </DashboardChrome>
  );
}
