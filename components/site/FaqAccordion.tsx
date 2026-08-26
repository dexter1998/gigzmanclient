"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqAccordionProps {
  faqs: { question: string; answer: string }[];
  className?: string;
}

export default function FaqAccordion({ faqs, className = "" }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={`divide-y divide-line rounded-[10px] border border-line ${className}`}>
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left sm:px-5"
            >
              <span className="text-[14px] font-medium leading-snug text-ink">{faq.question}</span>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 shrink-0 text-ink-subtle transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <p className="px-4 pb-4 text-[13px] leading-relaxed text-ink-muted sm:px-5">
                {faq.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
