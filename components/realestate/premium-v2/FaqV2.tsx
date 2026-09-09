"use client";

import { useState, type JSX } from "react";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";

export interface Faq {
  question: string;
  answer: string;
}

/**
 * Answers are deliberately generic/process-based, matching the register of
 * clients/geeta-properties/content/legal.yaml's disclaimer copy — no invented
 * legal claims (e.g. no promised RERA outcome, no guaranteed loan approval).
 *
 * Exported so the standalone /faq page (PremiumV2FaqPage) can build FAQPage
 * JSON-LD from the same six questions rather than duplicating the copy.
 */
export const FAQS: Faq[] = [
  {
    question: "How do you verify a property before listing it?",
    answer:
      "Every listing is reviewed before it goes live, and its RERA registration status is shown plainly on the property page. Where a registration number is shown, it should still be independently verified on the relevant state RERA authority's website before relying on it; where none is shown, registration is pending.",
  },
  {
    question: "What does a site visit involve?",
    answer:
      "An advisor accompanies most site visits and can walk through layout, specifications and current construction or possession status in person. Visits are arranged after an initial enquiry, so the listing and locality can be confirmed as relevant to what you're looking for first.",
  },
  {
    question: "Can you help with home loan or EMI planning?",
    answer:
      "Our EMI calculator gives an indicative monthly instalment estimate, and advisors can point you toward lenders to approach. We don't sanction or guarantee any loan — approval, rate and tenure are decided solely by the lender based on your application.",
  },
  {
    question: "How is your brokerage or commission structured?",
    answer:
      "Brokerage terms depend on the transaction — buy, sell, lease or commercial — and are confirmed with you directly before any agreement is signed. Ask your advisor for the applicable structure at the start of the conversation.",
  },
  {
    question: "How does shortlisting work?",
    answer:
      "Tell us your budget, preferred corridors and configuration, and we match that against current inventory across Golf Course Road, Dwarka Expressway, Sohna Road, SPR and New Gurugram. You review a shortlist before any site visit is arranged.",
  },
  {
    question: "Should I rent or buy right now?",
    answer:
      "It depends on your time horizon, how the specific corridor is trending, and your financing position — there's no single right answer. Our rental yield and EMI calculators are a starting point; an advisor can talk through your specific situation in more detail.",
  },
];

export default function FaqV2({ asideContent }: { asideContent?: JSX.Element } = {}): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.3fr]">
          <div>
            <GpEyebrow>Buyer Questions</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[color:var(--gp-body)]">
              Verification, fees, shortlisting and financing — the questions we hear most before a
              first site visit.
            </p>
            {/* Optional — fills the vertical space this short column leaves
                next to the six-item accordion (only passed by the standalone
                /faq page, never the homepage section). */}
            {asideContent ? <div className="mt-8 max-w-sm">{asideContent}</div> : null}
          </div>

          <div>
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={faq.question} className="border-t border-line last:border-b">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="gp-eyebrow text-[color:var(--gp-gold-600)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[15px] text-[color:var(--gp-ink)] sm:text-[15px]">
                        {faq.question}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[20px] leading-none text-[color:var(--gp-gold-600)]"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="max-w-2xl pb-6 pl-9 text-[14px] leading-relaxed text-[color:var(--gp-body)]">
                      {faq.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}

            <p className="mt-6 text-[12px] leading-relaxed text-[color:var(--gp-muted)]">
              We verify available RERA and ownership information, project status and source.
              Any limitation is shared before a site visit or booking intent.
            </p>
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
