"use client";

import { useState } from "react";
import { Quote, ArrowLeft, ArrowRight } from "lucide-react";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

/**
 * Rendered only when `reviewsEnabled` is set on the firm settings.
 *
 * ICAI's Code of Ethics prohibits a practice publishing testimonials,
 * endorsements or ratings on its own website. The section exists because the
 * approved design calls for it, but the flag ships off and the dashboard warns
 * before it is turned on.
 */
export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [start, setStart] = useState(0);
  const perPage = 3;
  const canPage = testimonials.length > perPage;

  const visible = canPage
    ? Array.from({ length: perPage }, (_, i) => testimonials[(start + i) % testimonials.length])
    : testimonials;

  return (
    <div>
      {canPage ? (
        <div className="mb-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setStart((s) => (s - 1 + testimonials.length) % testimonials.length)}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-navy hover:border-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setStart((s) => (s + 1) % testimonials.length)}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-navy hover:border-navy"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {visible.map((item) => (
          <figure
            key={item.name}
            className="flex flex-col rounded-[12px] border border-line bg-surface p-5"
          >
            <Quote className="h-5 w-5 shrink-0 text-line-strong" aria-hidden="true" />
            <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-ink-muted">
              {item.quote}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tint text-[12px] font-medium text-navy">
                {item.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join("")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">{item.name}</span>
                <span className="block truncate text-[11px] text-ink-subtle">{item.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
