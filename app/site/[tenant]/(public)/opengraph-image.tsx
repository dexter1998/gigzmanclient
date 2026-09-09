import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getTenantBySlug } from "@/lib/tenant";
import { getFirmSettings } from "@/lib/content";
import { OG_CARD_BACKGROUND } from "@/lib/og";

/**
 * Composed share card for the tenant homepage.
 *
 * Generated rather than reused, unlike every other page — see `lib/og.ts` for
 * why. There is exactly one homepage per tenant, so the extra generated route
 * costs almost nothing, and this is the link that actually gets pasted into
 * WhatsApp and LinkedIn, where a card carrying the firm's mark and phone
 * number does more work than a bare photograph.
 *
 * It rebuilds with the page (revalidate 300), so editing the logo, tagline or
 * phone number in the dashboard changes the card without a deploy.
 */
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Share preview";

/** Data URI for a file under public/, or null if it isn't there. */
async function readPublicFile(publicPath: string): Promise<{ data: string; bytes: Buffer } | null> {
  try {
    const clean = publicPath.split("?")[0];
    const bytes = await readFile(path.join(process.cwd(), "public", clean));
    const ext = path.extname(clean).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".svg" ? "image/svg+xml" : "image/jpeg";
    return { data: `data:${mime};base64,${bytes.toString("base64")}`, bytes };
  } catch {
    return null;
  }
}

/**
 * Intrinsic size straight out of the PNG IHDR chunk (bytes 16–24).
 *
 * Satori needs explicit width and height on an `<img>`, and the tenant logos
 * do not share an aspect ratio — 1331x666 for one, 1331x512 and 1551x570 for
 * others — so a fixed pair would squash somebody's mark. Reading the header
 * is a dozen bytes and avoids taking an image library into this route.
 */
function pngSize(bytes: Buffer): { width: number; height: number } | null {
  const isPng = bytes.length > 24 && bytes.readUInt32BE(0) === 0x89504e47;
  if (!isPng) return null;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  return width > 0 && height > 0 ? { width, height } : null;
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const settings = tenant ? await getFirmSettings(tenant.id) : null;

  const firmName = settings?.firmName ?? "Gurugram Real Estate";
  const tagline = settings?.tagline || "Property advisory in Gurugram";
  const phone = settings?.phone ?? "";

  // Read both images off disk rather than fetching them over HTTP.
  //
  // Fetching meant pointing Satori at the tenant's public origin, and the
  // first version did exactly that — which rendered a card with no photo,
  // because the client's domain still served their old site and the image
  // 404d. A card must not depend on DNS having been cut over, or on the
  // deployment being able to reach itself while it is still building.
  const heroFile = await readPublicFile(OG_CARD_BACKGROUND);
  const logoFile = settings?.logoUrl ? await readPublicFile(settings.logoUrl) : null;

  const hero = heroFile?.data ?? null;

  // Fit the mark to a fixed height and let width follow its own ratio, capped
  // so a very wide logo cannot run into the scrim's soft edge.
  const LOGO_HEIGHT = 128;
  const intrinsic = logoFile ? pngSize(logoFile.bytes) : null;
  const logo =
    logoFile && intrinsic
      ? {
          src: logoFile.data,
          height: LOGO_HEIGHT,
          width: Math.min(660, Math.round(LOGO_HEIGHT * (intrinsic.width / intrinsic.height))),
        }
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#052F28",
        }}
      >
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            // `width`/`height` are not redundant next to `inset: 0`. Satori
            // collapses an absolutely positioned element that has no children
            // and no measured size, so this scrim rendered at zero height and
            // painted nothing — every card shipped with its text sitting
            // directly on lit tower windows, unreadable on a phone. `inset`
            // alone does not stretch it the way it would in a browser.
            width: "100%",
            height: "100%",
            // Held near-opaque across the whole text column and only released
            // past it. An earlier pass faded to 0.35 by mid-card, which put
            // the description and phone number straight onto the brightest
            // part of the photo — legible in the editor, not on a phone.
            backgroundImage:
              "linear-gradient(90deg, rgba(4,36,31,0.97) 0%, rgba(4,36,31,0.94) 48%, rgba(4,36,31,0.72) 68%, rgba(4,36,31,0.08) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 80px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              color: "#E1C27C",
              textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.55)",
            }}
          >
            {tagline}
          </div>

          {/* The mark replaces the firm name outright — it carries the same
              information with the brand's own type, and it is what people
              recognise in a feed. The name is still the `alt` text on the
              card, and falls back to type if the logo file is missing. */}
          {logo ? (
            <div style={{ display: "flex", marginTop: 26, filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.55))" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo.src} alt={firmName} width={logo.width} height={logo.height} />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: 78,
                color: "white",
                marginTop: 18,
                lineHeight: 1.05,
                maxWidth: 820,
                textShadow: "0 4px 18px rgba(0,0,0,0.6)",
              }}
            >
              {firmName}
            </div>
          )}

          <div
            style={{
              display: "flex",
              fontSize: 27,
              color: "rgba(255,255,255,0.82)",
              marginTop: 28,
              maxWidth: 760,
              textShadow: "0 2px 10px rgba(0,0,0,0.55)",
            }}
          >
            Buy, sell and rent across Gurugram — with plot maps, corridor data and buyer calculators.
          </div>

          {/* The number used to sit as a bare line of gold text and read as a
              caption. As a filled pill it reads as the action it is — the
              same gold CTA the site itself uses. */}
          {phone ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                marginTop: 40,
                padding: "18px 34px",
                borderRadius: 10,
                backgroundColor: "#C89A3C",
                color: "#052F28",
                fontSize: 30,
                fontWeight: 600,
                boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
              }}
            >
              Call {phone}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
