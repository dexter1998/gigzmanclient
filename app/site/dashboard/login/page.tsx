import { notFound, redirect } from "next/navigation";
import { getTenant, getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import { getFirmSettings } from "@/lib/content";
import LoginForm from "@/components/dashboard/LoginForm";
import BrandMark from "@/components/site/BrandMark";
import { getVerticalConfig } from "@/lib/verticals";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const basePath = await getBasePath();
  const dashboardHref = joinPath(basePath, "/dashboard");

  const user = await getSessionUser();
  if (user) redirect(dashboardHref);

  const settings = await getFirmSettings(tenant.id);

  return (
    <div className="flex min-h-screen items-center justify-center bg-tint px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <BrandMark
            className="mx-auto h-12 w-[62px]"
            src={settings?.logoUrl}
            alt={settings?.firmName ?? ""}
            vertical={getVerticalConfig(tenant.vertical).id}
          />
          <h1 className="display-md mt-5">Sign in</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            {settings?.firmName} · Website management
          </p>
        </div>

        <div className="mt-7 rounded-[12px] border border-line bg-surface p-6">
          <LoginForm redirectTo={dashboardHref} />
        </div>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-ink-subtle">
          This area contains enquiry records with personal contact details. Do not share sign-in
          credentials.
        </p>
      </div>
    </div>
  );
}
