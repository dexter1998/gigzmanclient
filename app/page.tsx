import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { TEMPLATES } from "@/lib/template-registry";
import IndustryTabs from "@/components/library/IndustryTabs";
import TemplateCard from "@/components/library/TemplateCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gigzman — Website Templates by Industry",
  description: "Live, browsable website templates by business category.",
};

/**
 * The public homepage: every template across every industry, with tabs to
 * each industry's own page (`/{vertical}`). Each card is a live, working
 * site — not a mockup — the same "browse it the way a prospect would"
 * approach this page has always taken, just promoted from a secondary
 * sales page (formerly `/library`) to the actual root.
 */
export default async function LibraryHomePage() {
  const demoClients = await db
    .select()
    .from(clients)
    .where(and(eq(clients.isDemo, true), eq(clients.isActive, true)));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="eyebrow">Template library</p>
      <h1 className="display-lg mt-3">Ready-made websites, by category.</h1>
      <p className="prose-body mt-3 max-w-2xl text-[15px]">
        Each template below is a live, working site — not a mockup. Browse it the way a prospect
        would, then use it as the starting point for their build.
      </p>

      <div className="mt-8">
        <IndustryTabs active={null} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {TEMPLATES.map((template) => (
          <TemplateCard
            key={template.vertical}
            template={template}
            demo={demoClients.find((c) => c.vertical === template.vertical)}
          />
        ))}
      </div>
    </div>
  );
}
