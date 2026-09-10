import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import { DOCUMENTATION_GROUPS } from "@/lib/premium-v2/services";

/**
 * The paperwork the firm handles, listed in full.
 *
 * Sits between the service lines and the inventory sections because it is the
 * question that follows "what do you do" — in a market where a sale turns on
 * registry, mutation and NOC paperwork, naming every document is itself the
 * pitch. The list is the client's own; nothing has been added to it.
 */
export default function DocumentationV2({
  p,
  phone,
}: {
  p: (path: string) => string;
  phone?: string | null;
}) {
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  return (
    <GpSection tone="cream" id="documentation">
      <GpContainer>
        <div className="max-w-2xl">
          <span className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]" aria-hidden="true" />
          <GpEyebrow>Complete support</GpEyebrow>
          <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
            A to Z documentation.
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
            We manage every single document in your property journey — from search to possession to
            registry. You relax, we handle the paperwork.
          </p>
        </div>

        {/* Each card names the stage and what it is, then hands off. It used
            to print all six document names, which read as a list to skim past
            rather than a service to enquire about — the names are on the
            detail page, where there is room to say what we do with them. */}
        <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENTATION_GROUPS.map((group) => (
            <article
              key={group.step}
              className="flex flex-col rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white p-6 transition-shadow hover:shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-3">
                <span className="font-sans text-[12px] font-bold tracking-[0.08em] text-[color:var(--gp-gold-600)]">
                  {group.step}
                </span>
                <span className="h-px flex-1 bg-[color:var(--gp-border)]" aria-hidden="true" />
              </div>

              <h3 className="font-display mt-4 text-[17px] text-[color:var(--gp-ink)]">
                {group.title}
              </h3>

              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">
                {group.summary}
              </p>

              <p className="mt-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
                {group.items.length} documents
              </p>

              <Link
                href={`${p("/documentation")}#${group.slug}`}
                className="mt-4 inline-flex min-h-[42px] items-center gap-1.5 self-start text-[13px] font-semibold text-[color:var(--gp-forest-900)] transition-colors hover:text-[color:var(--gp-gold-600)]"
              >
                View details
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:items-center">
          {telHref ? (
            <a
              href={telHref}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Get documentation help
            </a>
          ) : null}
          <Link
            href={p("/contact?intent=documentation")}
            className="inline-flex min-h-[50px] items-center justify-center rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-forest-900)]/30 px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-forest-900)]"
          >
            Ask about a document
          </Link>
        </div>
      </GpContainer>
    </GpSection>
  );
}
