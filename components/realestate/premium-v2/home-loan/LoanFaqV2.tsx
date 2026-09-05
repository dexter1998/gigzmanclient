"use client";

import { useState } from "react";
import { GpContainer, GpEyebrow, GpSection } from "../gp-primitives";

export interface LoanFaq {
  question: string;
  answer: string;
}

export default function LoanFaqV2({ faqs, heading }: { faqs: LoanFaq[]; heading: string }) {
  const [open, setOpen] = useState<number | null>(0);
  if (faqs.length === 0) return null;

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.35fr]">
          <div>
            <GpEyebrow>Common questions</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">{heading}</h2>
          </div>

          <div>
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.question} className="border-t border-line last:border-b">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span className="font-display text-[17px] text-[color:var(--gp-ink)] sm:text-[19px]">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[20px] leading-none text-[color:var(--gp-gold-600)]"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="max-w-2xl pb-6 text-[14px] leading-relaxed text-[color:var(--gp-body)]">
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
