"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, AlertCircle, AlertTriangle } from "lucide-react";
import Badge, { statusTone } from "@/components/ui/Badge";
import { updateCalculator, type ActionResult } from "@/lib/actions/dashboard-actions";
import { CALCULATOR_STATUS_LABELS } from "@/lib/format";

interface CalculatorRow {
  id: string;
  key: string;
  title: string;
  description: string;
  version: string;
  taxYear: string | null;
  status: string;
  reviewerName: string;
  disclaimer: string;
  lastReviewedAt: string | null;
}

const FIELD =
  "w-full min-h-[40px] rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

export default function CalculatorManager({ calculators }: { calculators: CalculatorRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(calculators.map((c) => [c.id, c.status])),
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateCalculator(formData);
      setFeedback(result);
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="mt-6">
      {feedback ? (
        <p
          role="status"
          className={`mb-4 flex items-start gap-2 rounded-[8px] px-3.5 py-2.5 text-[13px] ${
            feedback.ok
              ? "bg-status-success-soft text-status-success"
              : "bg-status-danger-soft text-status-danger"
          }`}
        >
          {feedback.ok ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          {feedback.message}
        </p>
      ) : null}

      <div className="space-y-4">
        {calculators.map((calc) => {
          const selected = statuses[calc.id];
          return (
            <form
              key={calc.id}
              onSubmit={submit}
              className="rounded-[10px] border border-line bg-surface p-5"
            >
              <input type="hidden" name="id" value={calc.id} />

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-ink">{calc.title}</p>
                  <p className="mt-1 text-[12px] text-ink-subtle">
                    {calc.taxYear} · formula v{calc.version}
                    {calc.lastReviewedAt ? ` · reviewed ${calc.lastReviewedAt}` : ""}
                  </p>
                </div>
                <Badge tone={statusTone(calc.status)}>
                  {CALCULATOR_STATUS_LABELS[calc.status] ?? calc.status}
                </Badge>
              </div>

              {selected === "active" && calc.status !== "active" ? (
                <div className="mt-4 flex items-start gap-2.5 rounded-[8px] bg-accent-soft px-3.5 py-3">
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <p className="text-[12px] leading-relaxed text-ink-muted">
                    Marking this active removes the public warning banner and presents the results
                    as verified. Confirm the rate table against the provisions in force for{" "}
                    {calc.taxYear} first.
                  </p>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`status-${calc.id}`}
                    className="mb-1.5 block text-[12px] text-ink-muted"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${calc.id}`}
                    name="status"
                    value={selected}
                    onChange={(e) =>
                      setStatuses((prev) => ({ ...prev, [calc.id]: e.target.value }))
                    }
                    className={FIELD}
                  >
                    {Object.entries(CALCULATOR_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`reviewer-${calc.id}`}
                    className="mb-1.5 block text-[12px] text-ink-muted"
                  >
                    Verified by {selected === "active" ? <span className="text-accent">*</span> : null}
                  </label>
                  <input
                    id={`reviewer-${calc.id}`}
                    name="reviewerName"
                    defaultValue={calc.reviewerName}
                    placeholder="Name of the reviewing chartered accountant"
                    className={FIELD}
                  />
                </div>
              </div>

              <div className="mt-3">
                <label
                  htmlFor={`disclaimer-${calc.id}`}
                  className="mb-1.5 block text-[12px] text-ink-muted"
                >
                  Public disclaimer
                </label>
                <textarea
                  id={`disclaimer-${calc.id}`}
                  name="disclaimer"
                  rows={3}
                  defaultValue={calc.disclaimer}
                  className={`${FIELD} py-2.5`}
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
                Save
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
