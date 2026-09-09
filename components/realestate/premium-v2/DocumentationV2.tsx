import Link from "next/link";
import { Check, Phone } from "lucide-react";
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

        <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENTATION_GROUPS.map((group) => (
            <article
              key={group.step}
              className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white p-6"
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

              <ul className="mt-4 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-[color:var(--gp-body)]">
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--gp-gold-600)]"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
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
