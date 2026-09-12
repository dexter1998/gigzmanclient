import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { paramsForEachTenant } from "@/lib/static-params";
import { buildBreadcrumbJsonLd, jsonLdProps } from "@/lib/schema-org";
import { BLOG_POSTS, blogEnabled, postBySlug, relatedPosts } from "@/lib/premium-v2/blog";
import { formatDate } from "@/lib/format";
import ListingStripV2 from "@/components/realestate/premium-v2/ListingStripV2";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

export async function generateStaticParams() {
  return paramsForEachTenant(async (tenant) =>
    blogEnabled(tenant.slug) ? BLOG_POSTS.map((post) => ({ slug: post.slug })) : [],
  );
}

interface Props {
  params: Promise<{ tenant: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !blogEnabled(tenant.slug)) return {};
  const post = postBySlug(slug);
  if (!post) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `${post.title} | ${settings?.firmName ?? ""}`,
    description: post.description,
    alternates: { canonical: joinPath(basePathFor(tenant), `/blog/${slug}`) },
    openGraph: { type: "article", title: post.title, description: post.description, images: [post.hero] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!blogEnabled(tenant.slug)) notFound();

  const post = postBySlug(slug);
  if (!post) notFound();

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const related = relatedPosts(slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.hero,
    datePublished: post.published,
    dateModified: post.published,
    author: { "@type": "Organization", name: settings.firmName },
    publisher: { "@type": "Organization", name: settings.firmName },
    mainEntityOfPage: p(`/blog/${slug}`),
  };

  // The article renders as one measured column, but a `listings` block has to
  // break out of that measure to a full-width section — so the blocks are
  // grouped into runs of prose and the listing rows between them, rather than
  // mapped one by one inside a single container.
  type Run = { kind: "prose"; blocks: typeof post.blocks } | { kind: "listings"; block: Extract<(typeof post.blocks)[number], { type: "listings" }> };
  const runs: Run[] = [];
  for (const block of post.blocks) {
    if (block.type === "listings") {
      runs.push({ kind: "listings", block });
      continue;
    }
    const last = runs[runs.length - 1];
    if (last?.kind === "prose") last.blocks.push(block);
    else runs.push({ kind: "prose", blocks: [block] });
  }

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Guides", url: p("/blog") },
            { name: post.title, url: p(`/blog/${slug}`) },
          ]),
        )}
      />
      <script {...jsonLdProps(articleJsonLd)} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[color:var(--gp-forest-950)]">
        <Image src={post.hero} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "var(--gp-gradient-hero)" }} />
        <div className="gp-container relative pb-14 pt-12 lg:pb-18 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-white/55">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-300)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <Link href={p("/blog")} className="hover:text-[color:var(--gp-gold-300)]">
              Guides
            </Link>
          </nav>
          <span className="mb-5 block h-[2px] w-11 bg-[color:var(--gp-gold-600)]" />
          <GpEyebrow className="text-[color:var(--gp-gold-300)]">
            {post.category} · {post.readMinutes} min read · {formatDate(post.published)}
          </GpEyebrow>
          <h1 className="gp-hero-title font-display mt-4 max-w-3xl text-white">{post.title}</h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            {post.standfirst}
          </p>
        </div>
      </section>
      <p className="bg-[color:var(--gp-cream-200)] px-5 py-2.5 text-center text-[12px] text-[color:var(--gp-muted)]">
        {post.heroCaption}
      </p>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      {runs.map((run, i) =>
        run.kind === "listings" ? (
          <ListingStripV2
            key={`listings-${i}`}
            clientId={tenant.id}
            basePath={basePath}
            eyebrow={run.block.eyebrow}
            heading={run.block.heading}
            blurb={run.block.blurb}
            locality={run.block.locality}
            limit={3}
            tone={i % 2 === 0 ? "cream" : "forest"}
          />
        ) : (
          <GpSection key={`prose-${i}`} tone="cream">
            <GpContainer>
              <div className="mx-auto max-w-[68ch]">
                {run.blocks.map((block, j) => {
                  const key = `${i}-${j}`;
                  switch (block.type) {
                    case "heading":
                      return (
                        <h2
                          key={key}
                          className="font-display mt-10 text-[24px] leading-tight text-[color:var(--gp-ink)] first:mt-0"
                        >
                          {block.text}
                        </h2>
                      );
                    case "para":
                      return (
                        <p
                          key={key}
                          className="mt-4 text-[15.5px] leading-[1.75] text-[color:var(--gp-body)] first:mt-0"
                        >
                          {block.text}
                        </p>
                      );
                    case "list":
                      return (
                        <ul key={key} className="mt-5 space-y-2.5">
                          {block.items.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span
                                className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gp-gold-600)]"
                                aria-hidden="true"
                              />
                              <span className="text-[15px] leading-[1.7] text-[color:var(--gp-body)]">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      );
                    case "quote":
                      return (
                        <blockquote
                          key={key}
                          className="mt-8 border-l-2 border-[color:var(--gp-gold-600)] pl-5 font-display text-[19px] leading-snug text-[color:var(--gp-ink)]"
                        >
                          {block.text}
                        </blockquote>
                      );
                    case "image":
                      return (
                        <figure key={key} className="mt-9">
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--gp-radius-md)]">
                            <Image
                              src={block.src}
                              alt={block.caption}
                              fill
                              sizes="(max-width: 1024px) 100vw, 68ch"
                              className="object-cover"
                            />
                          </div>
                          <figcaption className="mt-2.5 text-[12.5px] text-[color:var(--gp-muted)]">
                            {block.caption}
                          </figcaption>
                        </figure>
                      );
                    case "callout":
                      return (
                        <aside
                          key={key}
                          className="mt-9 rounded-[var(--gp-radius-md)] border-l-[3px] border-[color:var(--gp-gold-600)] bg-white p-5"
                        >
                          <p className="font-display text-[16px] text-[color:var(--gp-ink)]">
                            {block.heading}
                          </p>
                          <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--gp-body)]">
                            {block.text}
                          </p>
                          {block.href ? (
                            <Link
                              href={p(block.href)}
                              className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-forest-900)]"
                            >
                              {block.hrefLabel ?? "Read more"}
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          ) : null}
                        </aside>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </GpContainer>
          </GpSection>
        ),
      )}

      {/* ── Related ──────────────────────────────────────────────────── */}
      {related.length > 0 ? (
        <GpSection tone="cream">
          <GpContainer>
            <GpEyebrow>Keep reading</GpEyebrow>
            <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
              More from the belt
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {related.map((other) => (
                <Link
                  key={other.slug}
                  href={p(`/blog/${other.slug}`)}
                  className="group flex flex-col overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white transition-colors hover:border-[color:var(--gp-gold-600)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={other.hero}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">{other.category}</p>
                    <h3 className="font-display mt-2 text-[16px] leading-snug text-[color:var(--gp-ink)]">
                      {other.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </GpContainer>
        </GpSection>
      ) : null}
    </>
  );
}
