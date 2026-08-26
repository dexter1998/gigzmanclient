"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  /** Absolute instant the deadline expires, already resolved to end-of-day IST. */
  targetIso: string;
  compact?: boolean;
}

function remainingFrom(target: number, now: number) {
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    expired: diff <= 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function CountdownTimer({ targetIso, compact = false }: CountdownTimerProps) {
  const target = new Date(targetIso).getTime();

  // Server and first client paint render the same value; the interval starts
  // only after mount, so hydration cannot mismatch.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = remainingFrom(target, now ?? target);

  if (now !== null && time.expired) return null;

  const units = [
    { value: time.days, label: "d" },
    { value: time.hours, label: "h" },
    { value: time.minutes, label: "m" },
    { value: time.seconds, label: "s" },
  ];

  return (
    <span
      className={`inline-flex items-center gap-1 tabular-nums ${compact ? "text-[12px]" : "text-[13px]"}`}
      aria-label={`${time.days} days, ${time.hours} hours and ${time.minutes} minutes remaining`}
      suppressHydrationWarning
    >
      {units.map((unit, i) => (
        <span key={unit.label} className="inline-flex items-baseline">
          <span className="font-semibold">{i === 0 ? unit.value : pad(unit.value)}</span>
          <span className="ml-0.5 opacity-70">{unit.label}</span>
          {i < units.length - 1 ? <span className="mx-0.5 opacity-40">:</span> : null}
        </span>
      ))}
    </span>
  );
}
