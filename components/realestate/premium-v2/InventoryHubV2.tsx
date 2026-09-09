import { Suspense } from "react";
import Link from "next/link";
import { MapPin, Building2, AlertTriangle, BadgeCheck, Tag, Layers, CircleSlash } from "lucide-react";
import PropertyFiltersV2 from "./PropertyFiltersV2";
import MobileFilterDrawerV2 from "./MobileFilterDrawerV2";
import PropertyResultsV2 from "./PropertyResultsV2";
import { GpContainer } from "./gp-primitives";
import SearchBarV2 from "./SearchBarV2";
import { joinPath } from "@/lib/tenant";
import { statIcon } from "./amenity-icons";
import { facetsFor, developerSlug, sectorSlug, compareSectors, type ListingRow } from "@/lib/register";
import { formatNumber } from "@/lib/format";

/**
 * One template for every cut of the register — the whole inventory, a single
 * sector, or a single developer. Each cut gets its own route so it can be
 * indexed; what changes between them is the heading, the summary line and
 * which context panels are worth showing beside the results.
 */
export type HubScope =
  | { kind: "all" }
  | { kind: "sector"; sector: string }
  | { kind: "developer"; developer: string }
  | { kind: "locality"; locality: string };

interface Crumb {
  name: string;
  href?: string;
}

/* ----------------------------------------------------------------- pieces */

function StatStrip({ items }: { items: { label: string; value: string; tone?: string }[] }) {
  if (!items.length) return null;
  return (
    <dl className="mt-6 flex flex-wrap overflow-hidden rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
      {items.map((f) => (
        <div
          key={f.label}
          className="min-w-0 flex-1 basis-[140px] border-b border-r border-[color:var(--gp-border)] px-4 py-3.5 last:border-r-0"
        >
          <dt className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
            {(() => {
              const Icon = statIcon(f.label);
              return <Icon className="h-3.5 w-3.5 shrink-0 text-[color:var(--gp-gold-600)]" aria-hidden="true" />;
            })()}
            <span className="truncate">{f.label}</span>
          </dt>
          <dd
            className="mt-1.5 break-words text-[19px] font-semibold leading-snug"
            style={{ color: f.tone ?? "var(--gp-ink)" }}
          >
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-[var(--gp-radius-md)] border border-[color:var(--gp-border)] bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[color:var(--gp-border)] px-5 py-4 sm:px-6">
        <h2 className="font-display text-[17px] font-semibold text-[color:var(--gp-ink)]">{title}</h2>
        {note ? (
          <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[color:var(--gp-muted)]">
            {note}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function Bars({ rows }: { rows: { label: string; href?: string; count: number }[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="grid gap-2.5">
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid grid-cols-[minmax(0,150px)_1fr_44px] items-center gap-3 text-[13px] sm:grid-cols-[minmax(0,190px)_1fr_44px]"
        >
          <span className="truncate text-[color:var(--gp-body)]">
            {r.href ? (
              <Link href={r.href} className="hover:text-[color:var(--gp-gold-600)] hover:underline">
                {r.label}
              </Link>
            ) : (
              r.label
            )}
          </span>
          <span className="hidden h-2 overflow-hidden rounded-full bg-[color:var(--gp-cream-200)] sm:block">
            <span
              className="block h-full bg-[color:var(--gp-gold-600)]"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </span>
          <span className="text-right tabular-nums text-[color:var(--gp-muted)]">{r.count}</span>
        </div>
      ))}
    </div>
  );
}

function Pills({ items }: { items: { label: string; href: string; count: number }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[color:var(--gp-border)] bg-white px-4 py-2 text-[12.5px] text-[color:var(--gp-body)] hover:border-[color:var(--gp-gold-600)] hover:text-[color:var(--gp-gold-600)]"
        >
          {i.label}
          <b className="tabular-nums text-[color:var(--gp-ink)]">{i.count}</b>
        </Link>
      ))}
    </div>
  );
}

function YearChart({ rows }: { rows: { year: number; count: number }[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="flex h-28 items-end gap-1.5 overflow-x-auto pt-2">
      {rows.map((r) => (
        <div key={r.year} className="flex min-w-[26px] flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] tabular-nums text-[color:var(--gp-muted)]">{r.count}</span>
          <span
            className="w-full rounded-t-[2px] bg-[color:var(--gp-gold-600)]"
            style={{ height: `${Math.max(3, (r.count / max) * 72)}px` }}
          />
          <span className="text-[10px] text-[color:var(--gp-muted)]">&rsquo;{String(r.year).slice(2)}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export default function InventoryHubV2({
  scope,
  rows,
  everything,
  imageMap,
  localityFacets,
  basePath,
  crumbs,
  eyebrow,
  heading,
  summary,
}: {
  scope: HubScope;
  /** The cut this page is about. */
  rows: ListingRow[];
  /** The full register, for cross-links out to other sectors and developers. */
  everything: ListingRow[];
  imageMap: Record<string, { path: string; alt: string | null } | undefined>;
  localityFacets: string[];
  basePath: string;
  crumbs: Crumb[];
  eyebrow: string;
  heading: string;
  summary: string;
}) {
  const p = (path: string) => joinPath(basePath, path);
  const f = facetsFor(rows);
  const all = facetsFor(everything);

  const stats = [
    { label: "Projects", value: formatNumber(f.projects) },
    { label: "Developers", value: formatNumber(f.developers) },
    ...(f.acres ? [{ label: "Land", value: `${formatNumber(f.acres)} ac` }] : []),
    ...(f.units ? [{ label: "Units filed", value: formatNumber(f.units) }] : []),
    ...(f.unsold ? [{ label: "Unsold", value: formatNumber(f.unsold) }] : []),
    ...(f.avgComplete != null ? [{ label: "Avg built", value: `${f.avgComplete}%` }] : []),
    ...(f.delayed
      ? [{ label: "Past due date", value: formatNumber(f.delayed), tone: "var(--color-status-danger)" }]
      : []),
  ];

  const chips = [
    { icon: BadgeCheck, label: `${formatNumber(f.projects - f.lapsed)} active`, tone: "var(--gp-success)" },
    ...(f.lapsed ? [{ icon: CircleSlash, label: `${f.lapsed} lapsed`, tone: undefined }] : []),
    ...(f.delayed
      ? [{ icon: AlertTriangle, label: `${f.delayed} overdue`, tone: "var(--color-status-danger)" }]
      : []),
    ...(f.unsold ? [{ icon: Tag, label: `${formatNumber(f.unsold)} units unsold`, tone: undefined }] : []),
  ];

  const sectorHref = (s: string) => p(`/sectors/${sectorSlug(s)}`);
  const devHref = (d: string) => p(`/builders/${developerSlug(d)}`);

  /** Sectors either side of this one, by number — the natural next click. */
  const nearbySectors =
    scope.kind === "sector"
      ? all.bySector
          .filter((s) => s.key !== scope.sector)
          .sort(
            (a, b) =>
              Math.abs(parseInt(a.key, 10) - parseInt(scope.sector, 10)) -
              Math.abs(parseInt(b.key, 10) - parseInt(scope.sector, 10)),
          )
          .slice(0, 8)
      : [];

  return (
    <div className="gp-section bg-[color:var(--gp-cream-100)]">
      <GpContainer>
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap gap-x-1.5 text-[12px] text-[color:var(--gp-muted)]">
          {crumbs.map((c, i) => (
            <span key={c.name} className="inline-flex gap-1.5">
              {c.href ? (
                <Link href={c.href} className="py-1 hover:text-[color:var(--gp-gold-600)]">
                  {c.name}
                </Link>
              ) : (
                <span className="py-1 text-[color:var(--gp-ink)]">{c.name}</span>
              )}
              {i < crumbs.length - 1 ? <span>/</span> : null}
            </span>
          ))}
        </nav>

        <p className="gp-eyebrow text-[color:var(--gp-gold-600)]">{eyebrow}</p>
        <h1 className="gp-section-title mt-2 text-[color:var(--gp-ink)]">{heading}</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[color:var(--gp-body)]">{summary}</p>

        {/* Entry point above the results. It writes the same URL params the
            filter panel below reads, so the two never disagree and a searched
            result stays shareable. */}
        <div className="mt-8 max-w-4xl">
          <SearchBarV2 basePath={basePath} localities={localityFacets} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c.label}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: c.tone ?? "var(--gp-body)", borderColor: c.tone ?? "var(--gp-border)" }}
            >
              <c.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {c.label}
            </span>
          ))}
        </div>

        <StatStrip items={stats} />

        <div className="mt-6">
          <MobileFilterDrawerV2>
            <Suspense fallback={null}>
              <PropertyFiltersV2 localities={localityFacets} />
            </Suspense>
          </MobileFilterDrawerV2>
        </div>

        {/* minmax(0,1fr), not 1fr: a bare fr track floors at its content's
            min-content width, so one long title pushes the grid past the viewport. */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <Suspense fallback={null}>
              <PropertyFiltersV2 localities={localityFacets} />
            </Suspense>
          </aside>

          <div className="min-w-0 space-y-6">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] animate-pulse rounded-[var(--gp-radius-md)] bg-[color:var(--gp-cream-200)]"
                    />
                  ))}
                </div>
              }
            >
              <PropertyResultsV2
                allProperties={rows}
                imageMap={imageMap}
                propertiesPath={p(
                  scope.kind === "sector"
                    ? `/sectors/${sectorSlug(scope.sector)}`
                    : scope.kind === "developer"
                      ? `/builders/${developerSlug(scope.developer)}`
                      : "/properties",
                )}
                detailPath={p("/properties")}
              />
            </Suspense>

            {/* ---------------------------------------------- context panels */}
            {f.byType.length > 1 ? (
              <Panel title="What is being built here" note={`${f.projects} projects`}>
                <Bars rows={f.byType.map((t) => ({ label: t.label, count: t.count }))} />
              </Panel>
            ) : null}

            {scope.kind !== "developer" && f.byDeveloper.length > 1 ? (
              <Panel title="Developers active here" note={`${f.developers} developers`}>
                <Bars
                  rows={f.byDeveloper
                    .slice(0, 10)
                    .map((d) => ({ label: d.key!, href: devHref(d.key!), count: d.count }))}
                />
              </Panel>
            ) : null}

            {scope.kind !== "sector" && f.bySector.length > 1 ? (
              <Panel
                title={scope.kind === "developer" ? "Where they build" : "Sectors by inventory"}
                note={`${f.bySector.length} sectors`}
              >
                <Bars
                  rows={f.bySector
                    .slice(0, 10)
                    .map((s) => ({ label: `Sector ${s.key}`, href: sectorHref(s.key!), count: s.count }))}
                />
              </Panel>
            ) : null}

            {f.byYear.length > 2 ? (
              <Panel title="Registrations by year" note="HRERA register">
                <YearChart rows={f.byYear} />
              </Panel>
            ) : null}

            {nearbySectors.length ? (
              <Panel title="Nearby sectors">
                <Pills
                  items={nearbySectors.map((s) => ({
                    label: `Sector ${s.key}`,
                    href: sectorHref(s.key!),
                    count: s.count,
                  }))}
                />
              </Panel>
            ) : null}

            {scope.kind === "all" ? (
              <Panel title="Browse the register">
                <p className="mb-3 text-[13px] text-[color:var(--gp-muted)]">By sector</p>
                <Pills
                  items={all.bySector
                    .slice(0, 14)
                    .map((s) => ({ label: `Sector ${s.key}`, href: sectorHref(s.key!), count: s.count }))}
                />
                <p className="mb-3 mt-6 text-[13px] text-[color:var(--gp-muted)]">By developer</p>
                <Pills
                  items={all.byDeveloper
                    .slice(0, 14)
                    .map((d) => ({ label: d.key!, href: devHref(d.key!), count: d.count }))}
                />
              </Panel>
            ) : null}
          </div>
        </div>
      </GpContainer>
    </div>
  );
}

export { compareSectors };
