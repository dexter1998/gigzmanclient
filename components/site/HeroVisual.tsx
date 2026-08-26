import { ShieldCheck, FileText, CalendarClock } from "lucide-react";

interface HeroVisualProps {
  nextDeadline?: { title: string; date: string } | null;
  className?: string;
}

/**
 * Placeholder for the 3D asset that will replace this panel.
 *
 * Swap point: replace the contents of the panel below, keeping the outer
 * dimensions and the navy surface so surrounding layout is unaffected.
 */
export default function HeroVisual({ nextDeadline, className = "" }: HeroVisualProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[16px] bg-navy p-6 text-white sm:p-7 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(224,123,57,0.34), transparent 68%)" }}
      />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
          Compliance overview
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[10px] bg-white/[0.06] p-3.5">
            <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="mt-2.5 text-[11px] text-white/50">Assessment year</p>
            <p className="mt-0.5 text-[15px] font-semibold">AY 2027-28</p>
          </div>
          <div className="rounded-[10px] bg-white/[0.06] p-3.5">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="mt-2.5 text-[11px] text-white/50">Engagements</p>
            <p className="mt-0.5 text-[15px] font-semibold">By review</p>
          </div>
        </div>

        <div className="mt-3 rounded-[10px] bg-white/[0.06] p-3.5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="text-[11px] text-white/50">Next statutory date</p>
          </div>
          {nextDeadline ? (
            <>
              <p className="mt-2 text-[14px] font-medium leading-snug">{nextDeadline.title}</p>
              <p className="mt-1 text-[12px] text-white/55">{nextDeadline.date}</p>
            </>
          ) : (
            <p className="mt-2 text-[13px] text-white/55">No upcoming date recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}
