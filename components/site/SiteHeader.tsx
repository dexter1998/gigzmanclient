"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ArrowRight } from "lucide-react";
import BrandMark from "./BrandMark";

interface NavItem {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  firmName: string;
  descriptor: string | null;
  logoUrl: string | null;
  basePath: string;
  phone: string | null;
  navItems: NavItem[];
  contactHref: string;
}

export default function SiteHeader({
  firmName,
  descriptor,
  logoUrl,
  basePath,
  phone,
  navItems,
  contactHref,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === basePath || href === `${basePath}/` ? pathname === href : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-3 sm:px-6 lg:px-8">
        {/* Wordmark — placeholder mark, replaced with the firm's logo at delivery. */}
        <Link href={basePath || "/"} className="flex shrink-0 items-center gap-2.5">
          <BrandMark className="h-10 w-[52px] shrink-0" src={logoUrl} alt={firmName} />
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-medium text-navy">{firmName}</span>
            {descriptor ? (
              <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-accent">
                {descriptor}
              </span>
            ) : null}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-[6px] px-3 py-2 text-[14px] transition-colors ${
                isActive(item.href)
                  ? "font-medium text-navy"
                  : "text-ink-muted hover:text-navy"
              }`}
            >
              {item.label}
              {isActive(item.href) ? (
                <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="hidden min-h-[42px] items-center gap-2 rounded-[8px] border border-line-strong px-3.5 text-[13px] font-medium text-navy hover:border-navy lg:inline-flex"
            >
              <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {phone}
            </a>
          ) : null}

          <Link
            href={contactHref}
            className="hidden min-h-[42px] items-center gap-1.5 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft sm:inline-flex"
          >
            Book a Consultation
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-[8px] text-navy hover:bg-tint xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-surface xl:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col px-5 py-2 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`min-h-[46px] rounded-[6px] px-3 py-3 text-[15px] ${
                  isActive(item.href) ? "bg-tint font-medium text-navy" : "text-ink-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={contactHref}
              onClick={() => setOpen(false)}
              className="my-3 flex min-h-[46px] items-center justify-center gap-1.5 rounded-[8px] bg-navy px-4 text-[14px] font-medium text-white"
            >
              Book a Consultation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
