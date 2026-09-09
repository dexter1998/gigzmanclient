import Link from "next/link";
import Image from "next/image";
import { GpContainer } from "./gp-primitives";
import { developerLogo, developerMonogram } from "@/lib/premium-v2/developer-logos";
import { joinPath } from "@/lib/tenant";
import { formatNumber } from "@/lib/format";

export interface IndexEntry {
  label: string;
  href: string;
  /** Show the promoter's mark beside the name (developer index only). */
  withLogo?: boolean;
  projects: number;
  developers?: number;
  acres: number;
  unsold: number;
  delayed: number;
}

/**
 * The directory that sits above the sector and developer pages — a plain,
 * scannable table rather than cards, because the reason to come here is to
 * compare counts and jump, not to browse imagery.
 */
export default function RegisterIndexV2({
  basePath,
  eyebrow,
  heading,
  summary,
  columnLabel,
  entries,
  secondaryLabel,
}: {
  basePath: string;
  eyebrow: string;
  heading: string;
  summary: string;
  columnLabel: string;
  secondaryLabel?: string;
  entries: IndexEntry[];
}) {
  const p = (path: string) => joinPath(basePath, path);

  return (
    <div className="gp-section bg-[color:var(--gp-cream-100)]">
      <GpContainer>
        <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-[color:var(--gp-muted)]">
          <Link href={p("/")} className="inline-block py-1 hover:text-[color:var(--gp-gold-600)]">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-[color:var(--gp-ink)]">{heading}</span>
        </nav>

        <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">{eyebrow}</p>
        <h1 className="gp-section-title mt-2 text-[color:var(--gp-ink)]">{heading}</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">{summary}</p>

        <div className="mt-8 overflow-x-auto rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
          <table className="w-full min-w-[640px] border-collapse text-[13.5px]">
            <thead>
              <tr>
                {[columnLabel, secondaryLabel, "Projects", "Land", "Unsold", "Past due"]
                  .filter(Boolean)
                  .map((h) => (
                    <th
                      key={h as string}
                      className={`border-b border-[color:var(--gp-border)] px-4 py-3.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[color:var(--gp-muted)] ${
                        h === columnLabel || h === secondaryLabel ? "text-left" : "text-right"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.href} className="relative hover:bg-[color:var(--gp-cream-100)]">
                  <td className="border-b border-[color:var(--gp-border)] px-4 py-3.5">
                    {/* The link stretches over the whole row via `after:inset-0`,
                        so the counts are clickable too without nesting an
                        anchor around a <tr> (invalid) or moving the table to
                        divs. The row is the positioning context. */}
                    <Link
                      href={e.href}
                      className="inline-flex items-center gap-3 py-1 font-semibold text-[color:var(--gp-ink)] after:absolute after:inset-0 after:content-[''] hover:text-[color:var(--gp-gold-600)] hover:underline"
                    >
                      {e.withLogo ? <EntryMark name={e.label} /> : null}
                      {e.label}
                    </Link>
                  </td>
                  {secondaryLabel ? (
                    <td className="border-b border-[color:var(--gp-border)] px-4 py-3.5 text-[color:var(--gp-body)]">
                      {e.developers != null ? formatNumber(e.developers) : "—"}
                    </td>
                  ) : null}
                  <td className="border-b border-[color:var(--gp-border)] px-4 py-3.5 text-right tabular-nums">
                    {formatNumber(e.projects)}
                  </td>
                  <td className="border-b border-[color:var(--gp-border)] px-4 py-3.5 text-right tabular-nums text-[color:var(--gp-body)]">
                    {e.acres ? `${formatNumber(e.acres)} ac` : "—"}
                  </td>
                  <td className="border-b border-[color:var(--gp-border)] px-4 py-3.5 text-right tabular-nums text-[color:var(--gp-body)]">
                    {e.unsold ? formatNumber(e.unsold) : "—"}
                  </td>
                  <td
                    className="border-b border-[color:var(--gp-border)] px-4 py-3.5 text-right tabular-nums"
                    style={{ color: e.delayed ? "var(--color-status-danger)" : "var(--gp-muted)" }}
                  >
                    {e.delayed || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-[color:var(--gp-muted)]">
          Counts are taken from promoters&rsquo; own filings with HRERA Gurugram and are not
          independently verified. &ldquo;Past due&rdquo; means the completion date on the filing has
          gone by without the project reporting completion.
        </p>
      </GpContainer>
    </div>
  );
}

/**
 * The promoter's logo where there is a file for it, initials otherwise —
 * the register lists far more names than there are logos, so a miss is the
 * normal case and must not leave a ragged gap in the column.
 */
function EntryMark({ name }: { name: string }) {
  const logo = developerLogo(name);

  if (!logo) {
    return (
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--gp-cream-200)] text-[11px] font-bold text-[color:var(--gp-muted)]"
      >
        {developerMonogram(name)}
      </span>
    );
  }

  return (
    <span className="flex h-8 w-14 shrink-0 items-center justify-center">
      <Image
        src={logo.src}
        alt=""
        width={112}
        height={64}
        aria-hidden="true"
        className={`h-6 w-auto max-w-full object-contain ${logo.invert ? "invert" : ""}`}
      />
    </span>
  );
}
