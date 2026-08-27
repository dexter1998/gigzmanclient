import { FileText, ShieldCheck, Calculator, BarChart3, Wallet, Briefcase } from "lucide-react";

interface HeroVisualProps {
  nextDeadline?: { title: string; date: string } | null;
  className?: string;
}

const ORBIT_LEFT = [
  { icon: FileText, label: "Tax Planning" },
  { icon: ShieldCheck, label: "Compliance" },
  { icon: Wallet, label: "Accounting" },
];

const ORBIT_RIGHT = [
  { icon: Calculator, label: "Audit" },
  { icon: Briefcase, label: "Payroll" },
  { icon: BarChart3, label: "Advisory" },
];

/**
 * Placeholder for the 3D asset that will replace the centre panel.
 *
 * Swap point: replace the contents of the bordered panel below, keeping the
 * orbiting icon columns and the outer dimensions so the layout is unaffected.
 */
export default function HeroVisual({ nextDeadline, className = "" }: HeroVisualProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden shrink-0 flex-col gap-3 sm:flex">
          {ORBIT_LEFT.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex w-[74px] flex-col items-center gap-1.5 rounded-[12px] border border-line bg-surface px-2 py-3 shadow-[0_1px_2px_rgba(15,44,82,0.04),0_10px_30px_-18px_rgba(15,44,82,0.18)]"
              >
                <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                <span className="text-center text-[9px] font-medium leading-tight text-ink-muted">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── 3D asset swap point ─────────────────────────────────────── */}
        <div className="min-w-0 flex-1 rounded-[14px] border border-line bg-surface p-4 shadow-[0_2px_6px_rgba(15,44,82,0.06),0_20px_44px_-20px_rgba(15,44,82,0.24)] sm:p-5">
          <p className="text-[11px] font-medium text-ink-subtle">Business Overview</p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-[10px] bg-tint p-3">
              <p className="text-[10px] text-ink-subtle">Assessment year</p>
              <p className="mt-1 font-display text-[18px] font-medium text-navy">AY 2027-28</p>
              <p className="mt-1 text-[10px] font-medium text-status-success">Current cycle</p>
            </div>
            <div className="rounded-[10px] bg-tint p-3">
              <p className="text-[10px] text-ink-subtle">Engagements</p>
              <p className="mt-1 font-display text-[18px] font-medium text-navy">By review</p>
              <p className="mt-1 text-[10px] font-medium text-status-success">Scope agreed first</p>
            </div>
          </div>

          <div className="mt-3 rounded-[10px] border border-line p-3">
            <p className="text-[10px] text-ink-subtle">Next statutory date</p>
            {nextDeadline ? (
              <>
                <p className="mt-1.5 text-[13px] font-medium leading-snug text-ink">
                  {nextDeadline.title}
                </p>
                <p className="mt-1 text-[11px] font-medium text-accent">{nextDeadline.date}</p>
              </>
            ) : (
              <p className="mt-1.5 text-[12px] text-ink-muted">No upcoming date recorded</p>
            )}
          </div>

          <div className="mt-3 flex items-end gap-1.5" aria-hidden="true">
            {[38, 52, 44, 66, 58, 78, 70].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-[3px] ${i === 5 ? "bg-accent" : "bg-tint-deep"}`}
                style={{ height: `${h * 0.6}px` }}
              />
            ))}
          </div>
        </div>
        {/* ────────────────────────────────────────────────────────────── */}

        <div className="hidden shrink-0 flex-col gap-3 sm:flex">
          {ORBIT_RIGHT.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex w-[74px] flex-col items-center gap-1.5 rounded-[12px] border border-line bg-surface px-2 py-3 shadow-[0_1px_2px_rgba(15,44,82,0.04),0_10px_30px_-18px_rgba(15,44,82,0.18)]"
              >
                <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                <span className="text-center text-[9px] font-medium leading-tight text-ink-muted">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
