import { ArrowUpRight, LineChart, Home, PhoneCall, Search } from "lucide-react";
import { GpContainer, GpEyebrow, GpSection } from "./gp-primitives";

interface Channel {
  label: string;
  title: string;
  icon: typeof PhoneCall;
  href: string;
  external?: boolean;
}

/**
 * A plain Server Component — every link here is a static href, no client
 * interactivity needed, so this stays outside the "use client" boundary
 * (unlike ContactAdvisorsCompactV2 and ContactFaqV2 next to it, which need
 * state/analytics on click).
 */
export default function ContactChannelsV2({
  telHref,
  calculatorsHref,
  rentalsHref,
  updatesHref,
}: {
  telHref: string | null;
  calculatorsHref: string;
  rentalsHref: string;
  updatesHref: string;
}) {
  const channels: Channel[] = [
    {
      label: "Buy / Invest",
      title: "Talk to a property advisor",
      icon: PhoneCall,
      href: telHref ?? calculatorsHref,
    },
    {
      label: "Sell / Valuation",
      title: "Request a property review",
      icon: LineChart,
      href: calculatorsHref,
    },
    {
      label: "Lease / Rent",
      title: "Tenant and property matching",
      icon: Home,
      href: rentalsHref,
    },
    {
      label: "Market Data",
      title: "Reports and research queries",
      icon: Search,
      href: updatesHref,
    },
  ];

  return (
    <GpSection tone="cream">
      <GpContainer>
        <GpEyebrow>Choose Your Channel</GpEyebrow>
        <h2 className="gp-section-title font-display mt-2 text-[color:var(--gp-ink)]">
          Reach the Right Team Directly
        </h2>
        <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[color:var(--gp-muted)]">
          Skip the general enquiry if you already know what you need — each of these goes straight
          to the relevant conversation.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.label}
                href={channel.href}
                className="group block border-t border-line pt-5 transition-colors"
              >
                <Icon className="h-5 w-5 text-[color:var(--gp-gold-600)]" aria-hidden="true" />
                <p className="gp-eyebrow mt-4 text-[color:var(--gp-gold-600)]">{channel.label}</p>
                <p className="mt-1.5 flex items-center gap-1.5 font-display text-[15px] leading-snug text-[color:var(--gp-ink)] transition-colors group-hover:text-[color:var(--gp-gold-600)]">
                  {channel.title}
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </p>
              </a>
            );
          })}
        </div>
      </GpContainer>
    </GpSection>
  );
}
