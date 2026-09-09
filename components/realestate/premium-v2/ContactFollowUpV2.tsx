import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";

const STEPS = [
  {
    title: "Requirement Review",
    detail: "The enquiry is read against current inventory and locality data before anyone calls.",
  },
  {
    title: "Advisor Assignment",
    detail: "It's routed to whichever advisor already covers that corridor or transaction type.",
  },
  {
    title: "Shortlist / Next Action",
    detail: "You receive a shortlist, a valuation estimate, or a direct answer — whichever fits.",
  },
  {
    title: "Site Visit or Valuation",
    detail: "Where relevant, a site visit or in-person valuation is arranged around your schedule.",
  },
];

/**
 * No time estimate is attached to any step — nothing in this codebase's
 * existing copy (QueryFormV2, legal.yaml) commits to a response SLA, so none
 * is invented here either.
 */
export default function ContactFollowUpV2() {
  return (
    <GpSection tone="forest">
      <GpContainer>
        <GpEyebrow className="text-[color:var(--gp-gold-300)]">What Happens Next</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 max-w-xl text-white">
          A Simple, Human Follow-Up
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/70">
          Every enquiry passes through the same four steps — no automated dispatch, no call
          centre queue.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative pt-6">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-px w-full bg-white/20"
              />
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-px w-10 bg-[color:var(--gp-gold-600)]"
              />
              <span className="font-sans text-[26px] font-semibold leading-none text-[color:var(--gp-gold-300)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-3 text-[15px] text-white">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/65">{step.detail}</p>
            </div>
          ))}
        </div>
      </GpContainer>
    </GpSection>
  );
}
