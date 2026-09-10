import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FileText, Phone, ShieldCheck, Clock } from "lucide-react";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import PremiumV2CallLink from "./PremiumV2CallLink";
import { DOCUMENTATION_GROUPS } from "@/lib/premium-v2/services";

const IMG = "/verticals/realestate/templates/premium-v2/images";

/**
 * The documentation service, in full.
 *
 * Reached from the "View details" on each landing card, which jumps to that
 * stage's anchor — so the section ids here are contract, not decoration.
 *
 * Written to answer "what do you actually do", not "what documents exist". A
 * list of document names is something a buyer can find anywhere; what they
 * cannot find is which of them are checked before money moves, which office
 * the mutation goes to, and who sits in the sub-registrar queue.
 */
export default function PremiumV2DocumentationPage({
  firmName,
  phone,
  p,
}: {
  firmName: string;
  phone?: string | null;
  p: (path: string) => string;
}) {
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  return (
    <>
      <GpSection tone="forest">
        <GpContainer>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]" aria-hidden="true" />
              <GpEyebrow className="text-[color:var(--gp-gold-300)]">Documentation</GpEyebrow>
              <h1 className="gp-hero-title font-display mt-3 text-white">
                We handle the paperwork. All of it.
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80">
                A Gurugram sale turns on documents, not on photographs — title, encumbrance,
                stamp duty, mutation, occupancy. {firmName} runs that file end to end: we verify
                before you pay, register with you present, and follow the mutation until the
                revenue record carries your name.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                {telHref && phone ? <PremiumV2CallLink telHref={telHref} phone={phone} /> : null}
                <Link
                  href={p("/contact")}
                  className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] border border-white/30 px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:border-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-gold-300)]"
                >
                  Request a document check
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--gp-radius-lg)]">
              <Image
                src={`${IMG}/due-diligence.webp`}
                alt="Documents being reviewed before a property transaction"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </GpContainer>
      </GpSection>

      {/* What the service is, before the document names. */}
      <GpSection tone="cream">
        <GpContainer>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Verified before you pay",
                body: "Title chain, encumbrance certificate and society dues are checked by us directly, not accepted as copies from the seller.",
              },
              {
                icon: FileText,
                title: "Filed, not just drafted",
                body: "Registration, mutation and khata transfer are separate applications at separate offices. We see each one through to the updated record.",
              },
              {
                icon: Clock,
                title: "One file, every lender",
                body: "The income, KYC and property set is assembled once, with valuation and legal opinion moving in parallel instead of in sequence.",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white p-6"
              >
                <card.icon className="h-6 w-6 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                <h2 className="font-display mt-4 text-[17px] text-[color:var(--gp-ink)]">{card.title}</h2>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]">{card.body}</p>
              </article>
            ))}
          </div>
        </GpContainer>
      </GpSection>

      {/* One section per stage. `id` matches the landing card's anchor. */}
      {DOCUMENTATION_GROUPS.map((group, index) => (
        <GpSection key={group.slug} tone={index % 2 === 0 ? "transparent" : "cream"} id={group.slug}>
          <GpContainer>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div className={index % 2 === 0 ? "" : "lg:order-2"}>
                <div className="flex items-center gap-3">
                  <span className="font-sans text-[12px] font-bold tracking-[0.08em] text-[color:var(--gp-gold-600)]">
                    {group.step}
                  </span>
                  <span className="h-px w-12 bg-[color:var(--gp-border)]" aria-hidden="true" />
                </div>
                <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
                  {group.title}
                </h2>
                <p className="mt-3 text-[14.5px] font-medium text-[color:var(--gp-forest-900)]">
                  {group.summary}
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--gp-body)]">
                  {group.detail}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  {telHref && phone ? <PremiumV2CallLink telHref={telHref} phone={phone} /> : null}
                  <Link
                    href={p("/contact")}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] px-5 text-[13px] font-semibold text-[color:var(--gp-ink)] transition-colors hover:border-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-gold-600)]"
                  >
                    Get a quote
                  </Link>
                </div>
              </div>

              <div className={index % 2 === 0 ? "" : "lg:order-1"}>
                <div className="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white p-6">
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
                    What this covers
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[color:var(--gp-body)]"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--gp-gold-600)]"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </GpContainer>
        </GpSection>
      ))}

      <GpSection tone="forest">
        <GpContainer>
          <div className="max-w-2xl">
            <h2 className="gp-section-title font-display text-white">
              Send us the papers you already have.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/80">
              Most people come to us mid-transaction with a folder and a doubt. Share what you
              have and we will tell you what is missing, what it will cost, and how long the
              remaining steps take — before you commit to anything.
            </p>
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              {telHref && phone ? <PremiumV2CallLink telHref={telHref} phone={phone} /> : null}
              <Link
                href={p("/contact")}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] border border-white/30 px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:border-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-gold-300)]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Request a callback
              </Link>
            </div>
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
