import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { TEMPLATES } from "@/lib/template-registry";
import { getVerticalConfig, isVerticalId } from "@/lib/verticals";
import IndustryTabs from "@/components/library/IndustryTabs";
import TemplateCard from "@/components/library/TemplateCard";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/[vertical]">) {
  const { vertical } = await props.params;
  if (!isVerticalId(vertical)) return {};
  const config = getVerticalConfig(vertical);
  return {
    title: `${config.label} Website Templates — Gigzman`,
    description: config.summary,
  };
}

/**
 * One industry's slice of the library — every template registered for this
 * vertical. Proxy.ts already rejects an unknown vertical segment before this
 * ever renders, but a direct/edge hit is defended against anyway rather than
 * trusted blindly.
 */
export default async function IndustryLibraryPage(props: PageProps<"/[vertical]">) {
  const { vertical } = await props.params;
  if (!isVerticalId(vertical)) notFound();

  const config = getVerticalConfig(vertical);
  const templates = TEMPLATES.filter((t) => t.vertical === vertical);

  const demoClients = await db
    .select()
    .from(clients)
    .where(and(eq(clients.isDemo, true), eq(clients.isActive, true), eq(clients.vertical, vertical)));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="eyebrow">Template library</p>
      <h1 className="display-lg mt-3">{config.label} website templates.</h1>
      <p className="prose-body mt-3 max-w-2xl text-[15px]">{config.summary}</p>

      <div className="mt-8">
        <IndustryTabs active={vertical} />
      </div>

      {templates.length === 0 ? (
        <p className="mt-10 rounded-[10px] border border-line bg-surface p-6 text-[14px] text-ink-muted">
          No templates published for this industry yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {templates.map((template) => (
            <TemplateCard
              key={template.vertical}
              template={template}
              demo={demoClients.find((c) => c.vertical === template.vertical)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
