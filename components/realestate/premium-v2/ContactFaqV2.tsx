"use client";

import { useState } from "react";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";
import type { Faq } from "./FaqV2";

/**
 * Same single-open-accordion useState pattern as FaqV2, but with four
 * questions specific to the enquiry process rather than the homepage's six
 * general buyer questions (verification, EMI, shortlisting, rent-vs-buy —
 * already covered there, not repeated here). Answers keep the same honest,
 * no-guarantee register as clients/geeta-properties/content/legal.yaml and
 * FaqV2's disclaimer copy — no promised response time, no invented SLA.
 */
const CONTACT_FAQS: Faq[] = [
  {
    question: "Is the initial consultation paid?",
    answer:
      "No. Submitting an enquiry and the first conversation with an advisor are free. Any paid service — a formal valuation report, for instance — would be discussed and agreed with you separately before it's carried out.",
  },
  {
    question: "How soon will an advisor call?",
    answer:
      "Enquiries are reviewed and routed to the relevant advisor for your requirement or corridor. We don't quote a fixed response time here — if it's urgent, calling or WhatsApping the office directly is faster than the form.",
  },
  {
    question: "Can I request only a valuation, with no buying or selling commitment?",
    answer:
      "Yes. Use the \"Sell / Valuation\" channel above or mention it in the form's description field. A valuation review does not obligate you to list, sell or engage the firm any further.",
  },
  {
    question: "Do you support NRI buyers and sellers?",
    answer:
      "Yes, advisors regularly work with NRI clients, including scheduling site visits and calls around a different time zone. Cross-border payment, taxation and repatriation matters should still be confirmed with your own bank or tax advisor — we don't offer that advice directly.",
  },
];

export default function ContactFaqV2() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.3fr]">
          <div>
            <GpEyebrow>Contact FAQ</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              Before You Submit
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[color:var(--gp-body)]">
              A few things worth knowing before you reach out, specific to how enquiries here are
              handled.
            </p>
          </div>

          <div>
            {CONTACT_FAQS.map((faq, i) => {
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
          </div>
        </div>
      </GpContainer>
    </GpSection>
  );
}
