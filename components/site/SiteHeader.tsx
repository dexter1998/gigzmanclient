"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  firmName: string;
  basePath: string;
  phone: string | null;
  navItems: NavItem[];
  contactHref: string;
}

export default function SiteHeader({
  firmName,
  basePath,
  phone,
  navItems,
  contactHref,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === basePath || href === `${basePath}/`
      ? pathname === href
      : pathname?.startsWith(href);

  const monogram = firmName
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
        <Link href={basePath || "/"} className="flex items-center gap-2.5">
          {/* Placeholder mark — replace with the firm's logo at delivery. */}
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-navy text-[13px] font-semibold text-white">
            {monogram || "CA"}
          </span>
          <span className="text-[15px] font-semibold leading-tight text-ink">{firmName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[6px] px-3 py-2 text-[14px] transition-colors ${
                isActive(item.href)
                  ? "text-navy font-medium bg-cream-deep"
                  : "text-ink-muted hover:text-navy hover:bg-cream"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="hidden min-h-[40px] items-center gap-1.5 rounded-[8px] border border-line-strong px-3 text-[13px] text-navy hover:border-navy sm:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {phone}
            </a>
          ) : null}

          <Link
            href={contactHref}
            className="hidden min-h-[40px] items-center rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft sm:inline-flex"
          >
            Discuss Requirement
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded-[8px] text-navy hover:bg-cream lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-surface lg:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col px-5 py-2 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`min-h-[46px] rounded-[6px] px-3 py-3 text-[15px] ${
                  isActive(item.href) ? "font-medium text-navy bg-cream-deep" : "text-ink-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={contactHref}
              onClick={() => setOpen(false)}
              className="my-3 flex min-h-[46px] items-center justify-center rounded-[8px] bg-navy px-4 text-[14px] font-medium text-white"
            >
              Discuss Requirement
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
