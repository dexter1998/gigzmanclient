import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { GpContainer, GpSection } from "./gp-primitives";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getLegalPage } from "@/lib/content";
import { formatDate } from "@/lib/format";

/**
 * Intentionally the least "designed" page in the template — legal text
 * should read cleanly, not compete visually — so no gradients, no
 * photography, just clean typography on the plain cream background.
 */
export default async function PremiumV2LegalPage({ tenant, slug }: { tenant: Tenant; slug: string }) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const page = await getLegalPage(tenant.id, slug);
  if (!page) notFound();

  const html = page.body ? await marked.parse(page.body) : "";

  return (
    <GpSection tone="cream" className="py-14 sm:py-20">
      <GpContainer>
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-[color:var(--gp-muted)]">
            <Link href={p("/")} className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span>{page.title}</span>
          </nav>

          <h1 className="font-display text-[32px] text-[color:var(--gp-ink)] sm:text-[38px]">
            {page.title}
          </h1>
          <p className="mt-3 text-[12px] text-[color:var(--gp-muted)]">
            Last updated {formatDate(page.lastReviewedAt ?? page.updatedAt)}
          </p>

          <div className="gp-prose mt-9 border-t border-[color:var(--gp-border)] pt-9" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </GpContainer>
    </GpSection>
  );
}
