import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getTenantBySlug, basePathFor, joinPath } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { getTemplateKeyForSlug } from "@/lib/templates";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdProps } from "@/lib/schema-org";
import { blogEnabled, sortedPosts } from "@/lib/premium-v2/blog";
import { formatDate } from "@/lib/format";
import {
  GpContainer,
  GpEyebrow,
  GpSection,
} from "@/components/realestate/premium-v2/gp-primitives";

interface Props {
  params: Promise<{ tenant: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || !blogEnabled(tenant.slug)) return {};
  const settings = await getFirmSettings(tenant.id);
  return {
    title: `Farmhouse Guides & Notes from the Sohna Belt | ${settings?.firmName ?? ""}`,
    description:
      "Long-form guides to renting and buying farmhouses near Delhi NCR — party and wedding costs, the seven title checks, and what the Sohna belt is actually like.",
    alternates: { canonical: joinPath(basePathFor(tenant), "/blog") },
  };
}

export default async function BlogIndexPage(props: Props) {
  const { tenant: tenantSlug } = await props.params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || getTemplateKeyForSlug(tenant.slug) !== "premium-v2") notFound();
  if (!blogEnabled(tenant.slug)) notFound();

  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);
  const posts = sortedPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "Guides", url: p("/blog") },
          ]),
        )}
      />
      <script
        {...jsonLdProps(
          buildItemListJsonLd(
            posts.map((post) => ({
              name: post.title,
              url: p(`/blog/${post.slug}`),
              image: post.hero,
            })),
          ),
        )}
      />

      <GpSection tone="cream">
        <GpContainer>
          <nav aria-label="Breadcrumb" className="mb-6 text-[12.5px] text-[color:var(--gp-muted)]">
            <Link href={p("/")} className="hover:text-[color:var(--gp-gold-600)]">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[color:var(--gp-ink)]">Guides</span>
          </nav>

          <GpEyebrow>From the belt</GpEyebrow>
          <h1 className="gp-hero-title font-display mt-3 max-w-3xl text-[color:var(--gp-ink)]">
            Guides to renting and buying in the Sohna farm belt.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">
            What a party or a wedding actually costs out here, what a day rate leaves out, and the
            seven checks that decide whether a plot is safe to buy. Written from Karnki, not from a
            keyword list.
          </p>

          {/* ── Lead article ───────────────────────────────────────── */}
          {lead ? (
            <Link
              href={p(`/blog/${lead.slug}`)}
              className="group mt-12 grid grid-cols-1 gap-7 overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white lg:grid-cols-[1.15fr_1fr]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden lg:aspect-auto lg:min-h-[320px]">
                <Image
                  src={lead.hero}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col justify-center p-6 pb-8 lg:py-10 lg:pl-0 lg:pr-10">
                <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">
                  {lead.category} · {lead.readMinutes} min read
                </p>
                <h2 className="font-display mt-3 text-[26px] leading-[1.15] text-[color:var(--gp-ink)]">
                  {lead.title}
                </h2>
                <p className="mt-4 max-w-[52ch] text-[14.5px] leading-relaxed text-[color:var(--gp-body)]">
                  {lead.standfirst}
                </p>
                <span className="mt-6 flex items-center gap-1.5 text-[13.5px] font-semibold text-[color:var(--gp-gold-600)]">
                  Read the guide
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ) : null}

          {/* ── The rest ───────────────────────────────────────────── */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={p(`/blog/${post.slug}`)}
                className="group flex flex-col overflow-hidden rounded-[var(--gp-radius-lg)] border border-[color:var(--gp-border)] bg-white transition-colors hover:border-[color:var(--gp-gold-600)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={post.hero}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">
                    {post.category} · {post.readMinutes} min
                  </p>
                  <h2 className="font-display mt-2 text-[17px] leading-snug text-[color:var(--gp-ink)]">
                    {post.title}
                  </h2>
                  <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-[color:var(--gp-muted)]">
                    {post.standfirst}
                  </p>
                  <span className="mt-auto pt-4 text-[12px] text-[color:var(--gp-muted)]">
                    {formatDate(post.published)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </GpContainer>
      </GpSection>
    </>
  );
}
