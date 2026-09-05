import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { complianceEvents } from "@/lib/db/schema";
import { getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import ComplianceManager from "@/components/dashboard/ComplianceManager";

export default async function DashboardCompliancePage() {
  const basePath = await getBasePath();
  const user = await getSessionUser();
  if (!user) redirect(joinPath(basePath, "/dashboard/login"));

  const rows = await db
    .select()
    .from(complianceEvents)
    .where(eq(complianceEvents.clientId, user.clientId))
    .orderBy(desc(complianceEvents.dueDate));

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="display-md">Compliance calendar</h1>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          The nearest upcoming date drives the site-wide announcement bar and the mobile alert.
          Recording an extension keeps the original statutory date intact.
        </p>
      </div>

      <ComplianceManager
        events={rows.map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          description: row.description ?? "",
          applicableTo: row.applicableTo ?? "",
          dueDate: row.dueDate,
          extendedDueDate: row.extendedDueDate ?? "",
          extensionNote: row.extensionNote ?? "",
          sourceLabel: row.sourceLabel ?? "",
          sourceUrl: row.sourceUrl ?? "",
          lastVerifiedAt: row.lastVerifiedAt ?? "",
          isPublished: row.isPublished,
        }))}
      />
    </div>
  );
}
