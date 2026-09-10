import Link from "next/link";
import { notFound } from "next/navigation";
import FaqV2, { FAQS } from "./FaqV2";
import MapEmbedV2 from "./MapEmbedV2";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";
import { basePathFor, joinPath, type Tenant } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, jsonLdProps } from "@/lib/schema-org";
import LineArtBackdropV2 from "./LineArtBackdropV2";

/**
 * FaqV2 was built as a homepage section and is entirely self-contained — its
 * own eyebrow, heading and six Q&As. Rather than bolt a second "Frequently
 * Asked Questions" heading above it (which would just repeat what FaqV2
 * already says), this page frames it with a dark hero band that gives the
 * standalone page its own breadcrumb/context and a differently-worded lead,
 * then closes with the same consultation CTA used on the homepage so the
 * page doesn't dead-end after the answers.
 */
export default async function PremiumV2FaqPage({ tenant }: { tenant: Tenant }) {
  const basePath = basePathFor(tenant);
  const p = (path: string) => joinPath(basePath, path);

  const settings = await getFirmSettings(tenant.id);
  if (!settings) notFound();

  const fullAddress = [settings.addressLine, settings.locality, settings.region, settings.postalCode]
    .filter(Boolean)
    .join(", ");
  // Exact pin from the client's listing; see MapEmbedV2 on why the address
  // string alone is not enough.
  const mapCoordinates =
    settings.latitude && settings.longitude ? `${settings.latitude},${settings.longitude}` : null;

  return (
    <>
      <script {...jsonLdProps(buildFaqJsonLd(FAQS))} />
      <script
        {...jsonLdProps(
          buildBreadcrumbJsonLd([
            { name: "Home", url: p("/") },
            { name: "FAQs", url: p("/faq") },
          ]),
        )}
      />

      <GpSection tone="forest" className="py-16 sm:py-20"
        background={<LineArtBackdropV2 variant="building-right" opacity={0.6} desktopOnly />}
      >
        <GpContainer>
          <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-white/50">
            <Link href={p("/")} className="inline-block py-1 hover:text-white">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/80">FAQs</span>
          </nav>

          <GpEyebrow className="text-[color:var(--gp-gold-300)]">Help Center</GpEyebrow>
          <h1 className="gp-hero-title font-display mt-3 max-w-2xl text-white">
            Answers before your first site visit.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/70">
            Verification, brokerage, financing and how a shortlist comes together — the questions
            we hear most, answered plainly before you reach out.
          </p>
        </GpContainer>
      </GpSection>

      <FaqV2
        asideContent={
          fullAddress ? <MapEmbedV2
              address={fullAddress}
              businessName={settings.firmName}
              coordinates={mapCoordinates}
              className="aspect-[4/3] w-full"
              eager
            /> : undefined
        }
      />

    </>
  );
}
