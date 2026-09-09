import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";
import BookConsultationButton from "./BookConsultationButton";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings, getUpdate, getPublishedUpdates } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { buildArticleJsonLd, buildBreadcrumbJsonLd, jsonLdProps } from "@/lib/schema-org";
import LineArtBackdropV2 from "./LineArtBackdropV2";

export default async function PremiumV2UpdateDetailPage({
  tenant,
  slug,
}: {
  tenant: Tenant;
  slug: string;
}) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const [settings, update, all] = await Promise.all([
    getFirmSettings(tenant.id),
    getUpdate(tenant.id, slug),
    getPublishedUpdates(tenant.id),
  ]);
  if (!settings) notFound();

  // Drafts and archived notes must not be reachable by guessing the URL.
  if (!update || !["published", "outdated"].includes(update.status)) notFound();

  const html = update.body ? await marked.parse(update.body) : "";
  const related = all.filter((u) => u.id !== update.id && u.category === update.category).slice(0, 3);
  const more = (related.length > 0 ? related : all.filter((u) => u.id !== update.id)).slice(0, 3);

  return (
    <>
      <script
        {...jsonLdProps(
          buildArticleJsonLd({
            title: update.title,
            description: update.excerpt,
            url: p(`/updates/${update.slug}`),
            publishedAt: update.publishedAt,
            updatedAt: update.updatedAt,
            authorName: update.authorName,
            publisherName: settings.firmName,
          }),
        )}
      />
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Market Insights", url: p("/updates") },
            { name: update.title, url: p(`/updates/${update.slug}`) },
          ]),
        )}
      />

      <GpSection tone="forest" className="py-14 sm:py-20"
        background={<LineArtBackdropV2 variant="building-right" opacity={0.6} desktopOnly />}
      >
        <GpContainer>
          <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-white/50">
            <Link href={p("/")} className="inline-block py-1 hover:text-white">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href={p("/updates")} className="inline-block py-1 hover:text-white">
              Market Insights
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/80">{update.category}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <GpEyebrow className="text-[color:var(--gp-gold-300)]">{update.category}</GpEyebrow>
            {update.applicableYear ? (
              <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                {update.applicableYear}
              </span>
            ) : null}
          </div>

          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">{update.title}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-white/60">
            <span>Published {formatDate(update.publishedAt)}</span>
            {update.lastReviewedAt ? <span>· Last reviewed {formatDate(update.lastReviewedAt)}</span> : null}
            {update.authorName ? <span>· By {update.authorName}</span> : null}
            {update.reviewerName ? <span>· Reviewed by {update.reviewerName}</span> : null}
          </div>
        </GpContainer>
      </GpSection>

      <GpSection tone="cream" className="py-16 sm:py-20">
        <GpContainer>
          <div className="mx-auto max-w-3xl">
            {update.status === "outdated" ? (
              <div className="mb-8 flex items-start gap-3 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-gold-600)]/30 bg-[color:var(--gp-gold-300)]/15 px-4 py-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                <div>
                  <p className="text-[13px] font-medium text-[color:var(--gp-ink)]">
                    This note has been superseded
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[color:var(--gp-body)]">
                    The position described here may have changed since publication. Confirm the current
                    position before acting on it.
                  </p>
                </div>
              </div>
            ) : null}

            <article className="gp-prose" dangerouslySetInnerHTML={{ __html: html }} />

            {update.sources && update.sources.length > 0 ? (
              <div className="mt-10 border-t border-[color:var(--gp-border)] pt-6">
                <p className="text-[13px] font-semibold text-[color:var(--gp-ink)]">Sources</p>
                <ul className="mt-2.5 space-y-1.5">
                  {update.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[26px] items-center gap-1 py-1 text-[13px] text-[color:var(--gp-gold-600)] hover:underline"
                      >
                        {source.label}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-10 rounded-[var(--gp-radius-md)] bg-[color:var(--gp-gold-300)]/15 p-5 text-[12px] leading-relaxed text-[color:var(--gp-body)]">
              This note is general information published for reference. It does not constitute
              professional or investment advice and does not address any particular buyer's
              circumstances. Figures referenced may have changed after publication.
            </p>

            <div className="mt-12 rounded-[var(--gp-radius-lg)] bg-[image:var(--gp-gradient-dark-section)] p-7 text-center sm:p-9">
              <p className="text-[13px] font-semibold text-white">Discuss how this applies to you</p>
              <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-white/70">
                Whether this trend or change affects your decision depends on your specific
                requirement and timeline.
              </p>
              <BookConsultationButton className="mt-5 inline-flex min-h-[46px] items-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-6 text-[13px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]">
                Speak With an Advisor
              </BookConsultationButton>
            </div>
          </div>

          {more.length > 0 ? (
            <div className="mx-auto mt-16 max-w-3xl border-t border-[color:var(--gp-border)] pt-10">
              <div className="flex items-center justify-between gap-4">
                <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">More Market Insights</p>
                <Link
                  href={p("/updates")}
                  className="inline-flex min-h-[32px] items-center gap-1.5 text-[12.5px] font-semibold text-[color:var(--gp-ink)] hover:text-[color:var(--gp-gold-600)]"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {more.map((item) => (
                  <Link key={item.id} href={p(`/updates/${item.slug}`)} className="group">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[color:var(--gp-gold-600)]">
                      {item.category}
                    </p>
                    <p className="mt-1.5 font-display text-[15px] leading-snug text-[color:var(--gp-ink)] transition-colors group-hover:text-[color:var(--gp-gold-600)]">
                      {item.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </GpContainer>
      </GpSection>
    </>
  );
}
