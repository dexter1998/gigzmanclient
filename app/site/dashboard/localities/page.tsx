import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { localities } from "@/lib/db/schema";
import { getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import LocalitiesManager from "@/components/dashboard/LocalitiesManager";

export default async function DashboardLocalitiesPage() {
  const basePath = await getBasePath();
  const user = await getSessionUser();
  if (!user) redirect(joinPath(basePath, "/dashboard/login"));

  const rows = await db
    .select()
    .from(localities)
    .where(eq(localities.clientId, user.clientId))
    .orderBy(asc(localities.sortOrder));

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="display-md">Localities</h1>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          Each locality needs genuinely distinct content before it&rsquo;s published — a page that
          only swaps the name from another locality is a doorway page and an SEO liability rather
          than an asset.
        </p>
      </div>

      <LocalitiesManager
        localities={rows.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          corridor: row.corridor ?? "",
          avgPricePerSqft: row.avgPricePerSqft?.toString() ?? "",
          yoyChangePercent: row.yoyChangePercent?.toString() ?? "",
          rentalYieldPercent: row.rentalYieldPercent?.toString() ?? "",
          activeProjects: row.activeProjects?.toString() ?? "",
          bestFor: row.bestFor ?? "",
          description: row.description ?? "",
          heroImage: row.heroImage ?? "",
          isPublished: row.isPublished,
        }))}
      />
    </div>
  );
}
