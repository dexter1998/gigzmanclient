"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { cn } from "./gp-primitives";
import { openLeadPopup } from "./leadPopup";
import { joinPath } from "@/lib/paths";

const NAV_LINK =
  "rounded-[var(--gp-radius-sm)] px-2.5 py-2 text-[15px] font-semibold uppercase tracking-[0.04em] transition-colors";
const NAV_ACTIVE = "text-[color:var(--gp-gold-300)]";
const NAV_IDLE = "text-white/80 hover:text-white";

/** Calculator and financing hubs, grouped so the main bar stays at seven items. */
const TOOL_LINKS = [
  { label: "Home Loan EMI", path: "/home-loan" },
  { label: "Rental Yield & Payback", path: "/rental-yield" },
  { label: "Area Converter", path: "/area-converter" },
  { label: "Vastu Calculator", path: "/vastu" },
  { label: "All Calculators", path: "/calculators" },
  { label: "EMI Calculator", path: "/calculators/emi" },
  { label: "Stamp Duty", path: "/calculators/stamp-duty" },
  { label: "Rental Yield", path: "/calculators/rental-yield" },
];

interface NavItem {
  label: string;
  href: string;
}

interface HeaderV2Props {
  firmName: string;
  /** Per-tenant, from firm_settings.logo_url — this template now serves more
   *  than one real-estate client, so the mark can't be a module constant. */
  logoUrl: string;
  phone?: string | null;
  basePath: string;
  navItems: NavItem[];
}

/**
 * Used on every page of this template — not just the hero — so it can't
 * assume a dark hero sits directly beneath it. Transparent-over-hero at the
 * top of the page, solid forest once scrolled, on every route.
 */
export default function HeaderV2({
  firmName,
  logoUrl,
  phone,
  basePath,
  navItems,
}: HeaderV2Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Same open/close + Escape pattern as SiteHeader.tsx's mobile menu, moved
  // into a slide-down panel and with focus returned to the trigger on close.
  useEffect(() => {
    if (!mobileOpen) return;
    mobileNavRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
  }, [pathname]);

  // Several nav items (Buy/Rent/Commercial/New Launches) all point at
  // `/properties` with a different query param — matching on path alone
  // highlighted every one of them at once. A query is only considered a
  // match when its params are actually present in the current URL.
  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    const pathMatches =
      path === basePath || path === `${basePath}/` ? pathname === path : pathname?.startsWith(path);
    if (!pathMatches) return false;
    if (!query) return true;
    const hrefParams = new URLSearchParams(query);
    for (const [key, value] of hrefParams) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  };

  // Transparent-over-hero only applies on the homepage, which has a dark
  // full-bleed image directly beneath the header. Every other page starts
  // with a light (or non-hero) background, so the header must be solid from
  // the first frame there or its white/gold text is unreadable and it
  // visually collides with the page's own breadcrumb/heading underneath it.
  const toolsActive = TOOL_LINKS.some((t) => pathname?.startsWith(joinPath(basePath, t.path)));

  const isHome = pathname === basePath || pathname === `${basePath}/`;
  const solid = scrolled || mobileOpen || !isHome;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        solid
          ? "bg-[color:var(--gp-forest-950)]/95 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="gp-container flex items-center justify-between gap-3 py-4 lg:py-5">
        <Link href={basePath || "/"} className="flex min-w-0 shrink-0 items-center">
          <Image
            src={logoUrl}
            alt={firmName}
            width={220}
            height={73}
            priority
            className="h-14 w-auto object-contain sm:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(NAV_LINK, isActive(item.href) ? NAV_ACTIVE : NAV_IDLE)}
            >
              {item.label}
            </Link>
          ))}

          {/* Tools sit behind a dropdown rather than as top-level items —
              the bar is already at seven links and adding the calculator
              and home-loan hubs inline overflowed it at 1440px. Opens on
              hover for pointer users and on focus for keyboard users. */}
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              type="button"
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              onClick={() => setToolsOpen((v) => !v)}
              className={cn(
                NAV_LINK,
                "inline-flex items-center gap-1",
                toolsActive ? NAV_ACTIVE : NAV_IDLE,
              )}
            >
              Tools
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", toolsOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>

            {toolsOpen ? (
              <div className="absolute left-0 top-full z-50 w-60 pt-2">
                <div className="overflow-hidden rounded-[var(--gp-radius-md)] border border-white/12 bg-[color:var(--gp-forest-950)] py-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]">
                  {TOOL_LINKS.map((tool) => (
                    <Link
                      key={tool.path}
                      href={joinPath(basePath, tool.path)}
                      className="block px-4 py-2.5 text-[14px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-[color:var(--gp-gold-300)]"
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-1.5 text-[15px] font-semibold text-white/85 hover:text-white 2xl:inline-flex"
            >
              <Phone className="h-3.5 w-3.5 text-[color:var(--gp-gold-300)]" aria-hidden="true" />
              {phone}
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => openLeadPopup()}
            className="hidden min-h-[42px] items-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[12.5px] font-semibold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)] transition-colors hover:bg-[color:var(--gp-gold-300)] sm:inline-flex"
          >
            Book Consultation
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-11 w-11 items-center justify-center rounded-[var(--gp-radius-sm)] text-white lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          ref={mobileNavRef}
          className="border-t border-white/10 bg-[color:var(--gp-forest-950)] lg:hidden"
        >
          <nav className="gp-container flex flex-col py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "min-h-[48px] rounded-[var(--gp-radius-sm)] px-2 py-3 text-[15px]",
                  isActive(item.href) ? "font-semibold text-[color:var(--gp-gold-300)]" : "text-white/85",
                )}
              >
                {item.label}
              </Link>
            ))}
            <p className="mt-3 border-t border-white/10 px-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
              Tools
            </p>
            {TOOL_LINKS.map((tool) => (
              <Link
                key={tool.path}
                href={joinPath(basePath, tool.path)}
                className="min-h-[44px] rounded-[var(--gp-radius-sm)] px-2 py-2.5 text-[14px] text-white/75"
              >
                {tool.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => openLeadPopup()}
              className="my-3 inline-flex min-h-[48px] items-center justify-center rounded-[var(--gp-radius-sm)] bg-[color:var(--gp-gold-600)] px-5 text-[13px] font-semibold uppercase tracking-[0.05em] text-[color:var(--gp-forest-950)]"
            >
              Book Consultation
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
