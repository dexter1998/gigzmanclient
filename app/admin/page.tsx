import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTenantPath } from "@/lib/templates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client sites",
  robots: { index: false, follow: false },
};

/**
 * Index of every site hosted on this deployment, demo or real, including
 * ones not shown on the public library. Not a client-facing page — moved
 * here (was the root "/") once "/" became the public template-library
 * homepage, so the team still has a raw list to reach any site directly.
 */
export default async function DeploymentIndex() {
  const rows = await db.select().from(clients).where(eq(clients.isActive, true));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="eyebrow">Deployment index</p>
      <h1 className="display-lg mt-3">Client sites</h1>
      <p className="prose-body mt-3 text-[15px]">
        Each site below is served from this deployment. A site moves to its own domain by
        pointing the domain at this project and switching the tenant mode to host.
      </p>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-[10px] border border-line bg-surface p-6 text-[14px] text-ink-muted">
          No client sites yet. Add a folder under <code>clients/</code> and run{" "}
          <code>pnpm seed:client &lt;slug&gt;</code>.
        </p>
      ) : (
        <ul className="mt-10 space-y-3">
          {rows.map((client) => (
            <li key={client.id}>
              <div className="rounded-[10px] border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-ink">
                      {client.displayName}
                      {client.isDemo ? (
                        <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                          demo
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[13px] text-ink-muted">
                      {getTenantPath(client.vertical, client.slug)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={getTenantPath(client.vertical, client.slug)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[8px] bg-navy px-3.5 text-[13px] font-medium text-white hover:bg-navy-soft"
                    >
                      Website
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    <Link
                      href={`${getTenantPath(client.vertical, client.slug)}/dashboard`}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[8px] border border-line-strong px-3.5 text-[13px] font-medium text-navy hover:border-navy"
                    >
                      Dashboard
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
