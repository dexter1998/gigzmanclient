import Illustration from "./Illustration";

interface HeroVisualProps {
  nextDeadline?: { title: string; date: string } | null;
  className?: string;
}

/**
 * Hero artwork with the next statutory date pinned to it, so the illustration
 * carries live information rather than being purely decorative.
 */
export default function HeroVisual({ nextDeadline, className = "" }: HeroVisualProps) {
  return (
    <div className={`relative ${className}`}>
      <Illustration
        name="dashboard"
        priority
        sizes="(max-width: 1024px) 92vw, 640px"
        className="h-auto w-full"
      />

      {nextDeadline ? (
        <div className="pointer-events-none absolute bottom-2 left-0 max-w-[70%] rounded-[10px] border border-line bg-surface/95 px-3.5 py-2.5 shadow-[0_2px_6px_rgba(15,44,82,0.06),0_20px_44px_-20px_rgba(15,44,82,0.24)] backdrop-blur sm:bottom-4 sm:max-w-[58%]">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-ink-subtle">
            Next statutory date
          </p>
          <p className="mt-1 line-clamp-1 text-[13px] font-medium leading-snug text-ink">
            {nextDeadline.title}
          </p>
          <p className="mt-0.5 text-[12px] font-semibold text-accent">{nextDeadline.date}</p>
        </div>
      ) : null}
    </div>
  );
}
