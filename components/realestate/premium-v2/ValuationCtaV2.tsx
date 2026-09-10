import Image from "next/image";
import { GpContainer, GpSection, GpEyebrow } from "./gp-primitives";
import ValuationForm from "@/components/realestate/ValuationForm";

const IMG = "/verticals/realestate/templates/premium-v2/images";

/**
 * Sits immediately before the services grid.
 *
 * A seller reading the landing page has one question the services list does
 * not answer — what is mine worth — and until now the site had no surface for
 * it at all: the valuation form existed as a component nobody rendered. This
 * is also the page's only seller-side entry point; everything above it is
 * written for buyers.
 *
 * The form collects what identifies the property and hands off to the contact
 * form for the phone number, so consent handling and the CRM write path stay
 * in one place rather than being duplicated here.
 */
export default function ValuationCtaV2({
  p,
  localities,
}: {
  p: (path: string) => string;
  localities: string[];
}) {
  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]" aria-hidden="true" />
            <GpEyebrow>Sellers &amp; owners</GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
              Get a free{" "}
              <strong className="font-semibold text-[color:var(--gp-gold-600)]">
                property valuation
              </strong>{" "}
              report.
            </h2>
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
              What a portal shows you is the asking price of listings that have not sold. We price
              against what has actually transacted in your sector this year, then tell you what a
              buyer will question — floor, facing, age, pending dues — before they do.
            </p>

            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[var(--gp-radius-lg)] lg:mt-9">
              <Image
                src={`${IMG}/property-valuation.png`}
                alt="A Gurugram property being valued against recent transactions"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <ValuationForm
            contactHref={p("/contact")}
            localities={localities}
            showHeading={false}
            cardClassName="rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white p-6 lg:p-7"
            fieldClassName="w-full min-h-[48px] rounded-[var(--gp-radius-sm)] border border-[color:var(--gp-border)] bg-[color:var(--gp-cream-100)] px-3.5 text-[13.5px] text-[color:var(--gp-ink)] focus:border-[color:var(--gp-gold-600)] focus:outline-none"
            submitClassName="mt-5 inline-flex min-h-[50px] w-full items-center justify-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
          />
        </div>
      </GpContainer>
    </GpSection>
  );
}
