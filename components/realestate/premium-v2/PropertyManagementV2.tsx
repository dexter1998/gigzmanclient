import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GpEyebrow } from "./gp-primitives";

/**
 * "Own the property. We'll manage everything else." — the property-management
 * pitch, second-to-last section on the home page.
 *
 * The supplied art has the phone, its gold orbital line and the marble
 * platform baked into each background rather than shipped as a separate
 * layer, and the pack is explicit that they must not be re-composited. That
 * decides the layout: two full-bleed images swapped at the 768px breakpoint
 * (the desktop crop is not usable at phone widths — the phone in it would be
 * cut in half), with the copy laid over each one's clean area. Desktop keeps
 * its focal point centred and the copy on the left; mobile anchors the image
 * to the bottom so the phone sits under a stacked column of copy.
 */

const BASE = "/verticals/realestate/templates/premium-v2/property-management";

/**
 * Inlined rather than served as six SVG files. Each is ~250 bytes, so six
 * requests would cost more than the markup does, and inlining lets them take
 * their colour from the surrounding text instead of the `#D7AD5C` the source
 * files hard-code — the section's gold then stays tied to `--gp-gold-*` like
 * everything else in the template.
 */
const ICON_PATHS: Record<string, React.ReactNode> = {
  "tenant-sourcing": (
    <>
      <circle cx="17" cy="16" r="5" />
      <circle cx="32" cy="18" r="4" />
      <path d="M7 36c0-7 4-11 10-11s10 4 10 11M27 27c5-2 12 1 13 8" />
    </>
  ),
  "rent-collection": (
    <>
      <circle cx="24" cy="24" r="18" />
      <path d="M18 15h13M18 20h13M20 15c7 0 8 10 0 10h-2l11 10" />
    </>
  ),
  "property-inspection": (
    <>
      <path d="m5 23 19-16 14 12M10 21v18h16" />
      <circle cx="34" cy="32" r="7" />
      <path d="m39 37 5 5" />
    </>
  ),
  "maintenance-support": (
    <path d="M29 8a10 10 0 0 0-12 13L6 32a5 5 0 0 0 7 7l11-11A10 10 0 0 0 37 16l-7 7-5-5 7-7Z" />
  ),
  documentation: (
    <>
      <path d="M12 5h16l9 9v29H12Z" />
      <path d="M28 5v10h9M18 24h13M18 31h13M18 38h8" />
    </>
  ),
  "lease-resale": (
    <>
      <path d="M7 39V28M18 39V20M29 39V25M40 39V10" />
      <path d="m7 20 10-8 11 5L41 5M34 5h7v7" />
    </>
  ),
};

function ServiceIcon({ name }: { name: keyof typeof ICON_PATHS }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 shrink-0 text-[color:var(--gp-gold-600)]"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/**
 * Two explicit columns rather than one grid flowing into two. The divider in
 * the design runs the full height between them; bordering every second grid
 * item instead draws three separate stubs with gaps at the row gutters.
 */
const SERVICE_COLUMNS = [
  [
    { icon: "tenant-sourcing", label: "Tenant sourcing" },
    { icon: "rent-collection", label: "Rent collection" },
    { icon: "property-inspection", label: "Property inspections" },
  ],
  [
    { icon: "maintenance-support", label: "Maintenance support" },
    { icon: "documentation", label: "Agreement & documentation" },
    { icon: "lease-resale", label: "Lease & resale assistance" },
  ],
] as const;

export default function PropertyManagementV2({
  firmName,
  contactHref,
  servicesHref,
}: {
  firmName: string;
  contactHref: string;
  servicesHref: string;
}) {
  return (
    // The section is a card now, inset from the page edges, sitting on the
    // page's own cream ground rather than bleeding to the viewport like the
    // bands around it. `isolate` keeps the absolutely-positioned art clipped
    // to the rounded corners.
    <div className="bg-[color:var(--gp-cream-100)] px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
      <section className="relative isolate mx-auto max-w-[var(--gp-content-width)] overflow-hidden rounded-[var(--gp-radius-lg)] bg-[color:var(--gp-forest-950)] shadow-[var(--shadow-card)]">
        {/* Desktop only: the wide art is full-bleed behind the copy. Its crop
          puts the phone on the right, which is where the copy column is not. */}
        <Image
          src={`${BASE}/management-desktop.webp`}
          alt=""
          fill
          sizes="100vw"
          className="hidden object-cover object-center md:block"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full md:block md:bg-[linear-gradient(90deg,rgba(3,61,56,0.94)_0%,rgba(3,61,56,0.86)_38%,rgba(3,61,56,0.45)_58%,rgba(3,61,56,0)_78%)]"
        />

        {/* Below md the copy sits on the DESKTOP art, anchored left. That crop
          is skyline and terrace with no phone in it, so it gives the copy the
          photographic ground the design has without a second phone showing
          through — which is what anchoring the tall mobile art here did, its
          full height fitting inside this block rather than cropping. The
          mobile art is used once, for the phone block below. */}
        <div className="relative">
          <Image
            src={`${BASE}/management-desktop.webp`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-left md:hidden"
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 h-full w-full bg-[linear-gradient(180deg,rgba(3,61,56,0.92)_0%,rgba(3,61,56,0.88)_60%,rgba(3,61,56,0.82)_100%)] md:hidden"
          />

          <div className="gp-container relative">
            <div className="py-16 sm:py-20 md:min-h-[min(64vw,860px)] md:flex md:items-center md:py-24">
              <div className="max-w-xl md:max-w-[600px] lg:max-w-[680px]">
                <span
                  className="mb-5 block h-px w-12 bg-[color:var(--gp-gold-600)]"
                  aria-hidden="true"
                />
                <GpEyebrow className="text-[color:var(--gp-gold-300)]">
                  End-to-end property management
                </GpEyebrow>

                <h2 className="gp-section-title font-display mt-4 text-white">
                  Own the property.
                  <br />
                  We&rsquo;ll manage everything else.
                </h2>

                <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base">
                  From tenant sourcing and rent collection to inspections,
                  maintenance and documentation&mdash;
                  <span className="font-semibold text-white">
                    {firmName}
                  </span>{" "}
                  keeps your property performing without the daily follow-up.
                </p>

                <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:gap-0">
                  {SERVICE_COLUMNS.map((column, index) => (
                    <ul
                      key={index}
                      className={
                        index === 0
                          ? "flex flex-col gap-5 sm:flex-1 sm:pr-8"
                          : "flex flex-col gap-5 sm:flex-1 sm:border-l sm:border-white/15 sm:pl-8"
                      }
                    >
                      {column.map((service) => (
                        <li
                          key={service.label}
                          className="flex items-center gap-3.5"
                        >
                          <ServiceIcon name={service.icon} />
                          <span className="text-[15px] text-white/85">
                            {service.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>

                <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                  <Link
                    href={`${contactHref}?intent=property-management`}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-7 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)]"
                  >
                    Talk to a property manager
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href={servicesHref}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-[var(--gp-radius-sm)] border border-white/35 px-7 text-[13.5px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:border-white"
                  >
                    Explore management services
                  </Link>
                </div>

                <p className="mt-8 flex items-center gap-3 text-[13.5px] text-white/65">
                  <span
                    className="h-px w-8 shrink-0 bg-[color:var(--gp-gold-600)]"
                    aria-hidden="true"
                  />
                  Built for local owners, investors and NRIs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Below md the copy and the phone are stacked instead of layered. The
          tall mobile art is 1024x1536: covering a phone-width section with it
          scales to the height and crops ~45% off each side, and anchoring it
          to the bottom instead runs the phone straight through the feature
          list. Given its own full-width block it stays intact and the copy
          above it stays readable. */}
        <div className="relative aspect-[1024/880] w-full md:hidden">
          <Image
            src={`${BASE}/management-mobile.webp`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-bottom"
            aria-hidden="true"
          />
          {/* Feathers the seam where the block meets the copy above it. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,var(--gp-forest-950)_0%,rgba(10,46,44,0)_100%)]"
          />
        </div>
      </section>
    </div>
  );
}
