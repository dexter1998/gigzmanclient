import Image from "next/image";
import { GpContainer, GpSection, GpEyebrow } from "../gp-primitives";
import PmServiceCta from "./PmServiceCta";
import {
  OWNER_STATS,
  OWNER_STORIES,
} from "@/lib/premium-v2/property-management";

/**
 * Owner stories.
 *
 * Rendered as quote cards, not video players: the asset pack supplies posters
 * only — there is no .mp4/.webm in it — and a play button that plays nothing
 * is worse than no play button. Add a `videoUrl` per story in
 * lib/premium-v2/property-management.ts and the control belongs back here.
 *
 * The people, names and quotes come from the design pack, not from real
 * customers. Before this page is promoted, they need to be replaced with
 * consented testimonials from actual owners — attributed stock portraits read
 * as endorsements, and presenting them as such is a misrepresentation the
 * client carries, not the design pack.
 */
export default function PmOwnerStories({ firmName }: { firmName: string }) {
  const [lead, ...rest] = OWNER_STORIES;

  return (
    <GpSection tone="cream">
      <GpContainer>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <span
              className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
              aria-hidden="true"
            />
            <GpEyebrow>Owner stories</GpEyebrow>
            <h2 className="gp-section-title font-display mt-3 text-[color:var(--gp-ink)]">
              What peace of mind looks like.
            </h2>
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
              Real owners. Real experiences. See how{" "}
              <span className="font-semibold text-[color:var(--gp-ink)]">
                {firmName}
              </span>{" "}
              manages their homes so they can focus on what matters, wherever
              they are in the world.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <PmServiceCta variant="outlineDark">
              Talk to an owner advisor
            </PmServiceCta>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <figure className="relative overflow-hidden rounded-[var(--gp-radius-lg)]">
            <Image
              src={lead.poster}
              alt={lead.alt}
              width={1672}
              height={941}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="h-full min-h-[280px] w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,46,44,0)_40%,rgba(10,46,44,0.9)_100%)]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <blockquote className="font-display text-[20px] leading-snug text-white sm:text-[24px]">
                &ldquo;{lead.quote}&rdquo;
              </blockquote>
              <p className="mt-3 text-[13px] text-white/70">
                {lead.name} &middot; {lead.role}
              </p>
            </figcaption>
          </figure>

          <div className="grid grid-cols-1 gap-5">
            {rest.map((story) => (
              <figure
                key={story.id}
                className="relative overflow-hidden rounded-[var(--gp-radius-lg)]"
              >
                <Image
                  src={story.poster}
                  alt={story.alt}
                  width={1672}
                  height={941}
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="h-full min-h-[190px] w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,46,44,0)_35%,rgba(10,46,44,0.9)_100%)]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-5">
                  <blockquote className="font-display text-[15px] leading-snug text-white">
                    &ldquo;{story.quote}&rdquo;
                  </blockquote>
                  <p className="mt-2 text-[12px] text-white/65">
                    {story.name} &middot; {story.role}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-6 rounded-[var(--gp-radius-lg)] bg-[image:var(--gp-gradient-dark-section)] px-6 py-8 sm:px-9 lg:grid-cols-4">
          {OWNER_STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="font-sans text-[28px] font-semibold leading-none text-[color:var(--gp-gold-300)]">
                {stat.value}
              </dt>
              <dd className="mt-2 text-[12.5px] text-white/65">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </GpContainer>
    </GpSection>
  );
}
