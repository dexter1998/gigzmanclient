import { LogOut } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/platform-auth";
import { logoutPlatformAdmin } from "./login/actions";
import ClientLookupForm from "./ClientLookupForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gigzman",
  robots: { index: false, follow: false },
};

/**
 * The single gated entry point to this deployment. Deliberately shows no
 * client listing — a signed-in team member opens a specific site by its ID,
 * so nobody browsing this dashboard can discover a client they don't already
 * know the slug for. Once on a client's own site, there is no link back
 * here.
 */
export default async function Dashboard() {
  const session = await requirePlatformAdmin("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-tint px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Gigzman</p>
            <h1 className="display-md mt-2">Open a client site</h1>
          </div>
          <form action={logoutPlatformAdmin}>
            <button
              type="submit"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[8px] border border-line-strong px-3 text-[12.5px] font-medium text-ink-muted hover:border-navy hover:text-navy"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
        <p className="mt-2 text-[13px] text-ink-muted">{session.email}</p>

        <div className="mt-7 rounded-[12px] border border-line bg-surface p-6">
          <ClientLookupForm />
        </div>
      </div>
    </div>
  );
}
