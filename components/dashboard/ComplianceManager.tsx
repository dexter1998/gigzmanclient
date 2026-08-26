"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, AlertCircle, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  saveComplianceEvent,
  deleteComplianceEvent,
  type ActionResult,
} from "@/lib/actions/dashboard-actions";
import { formatDate } from "@/lib/format";

interface EventRow {
  id: string;
  title: string;
  category: string;
  description: string;
  applicableTo: string;
  dueDate: string;
  extendedDueDate: string;
  extensionNote: string;
  sourceLabel: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  isPublished: boolean;
}

const FIELD =
  "w-full min-h-[40px] rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

const CATEGORIES = ["Income Tax", "GST", "TDS", "MCA", "Payroll", "Audit", "Other"];

const BLANK: EventRow = {
  id: "",
  title: "",
  category: "Income Tax",
  description: "",
  applicableTo: "",
  dueDate: "",
  extendedDueDate: "",
  extensionNote: "",
  sourceLabel: "",
  sourceUrl: "",
  lastVerifiedAt: "",
  isPublished: true,
};

export default function ComplianceManager({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [editing, setEditing] = useState<EventRow | null>(null);

  const run = (fn: (fd: FormData) => Promise<ActionResult>, formData: FormData, close = false) => {
    startTransition(async () => {
      const result = await fn(formData);
      setFeedback(result);
      if (result.ok) {
        if (close) setEditing(null);
        router.refresh();
      }
    });
  };

  const today = new Date().toISOString().slice(0, 10);

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

      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(saveComplianceEvent, new FormData(e.currentTarget), true);
          }}
          className="rounded-[10px] border border-line bg-surface p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-ink">
              {editing.id ? "Edit date" : "New compliance date"}
            </p>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-ink-subtle hover:bg-cream"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <input type="hidden" name="id" value={editing.id} />

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-[12px] text-ink-muted">
                  Title <span className="text-accent">*</span>
                </label>
                <input id="title" name="title" required defaultValue={editing.title} className={FIELD} />
              </div>
              <div>
                <label htmlFor="category" className="mb-1.5 block text-[12px] text-ink-muted">
                  Category <span className="text-accent">*</span>
                </label>
                <select id="category" name="category" defaultValue={editing.category} className={FIELD}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="dueDate" className="mb-1.5 block text-[12px] text-ink-muted">
                  Original due date <span className="text-accent">*</span>
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={editing.dueDate}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="extendedDueDate" className="mb-1.5 block text-[12px] text-ink-muted">
                  Extended to
                </label>
                <input
                  id="extendedDueDate"
                  name="extendedDueDate"
                  type="date"
                  defaultValue={editing.extendedDueDate}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="lastVerifiedAt" className="mb-1.5 block text-[12px] text-ink-muted">
                  Last verified
                </label>
                <input
                  id="lastVerifiedAt"
                  name="lastVerifiedAt"
                  type="date"
                  max={today}
                  defaultValue={editing.lastVerifiedAt}
                  className={FIELD}
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-[12px] text-ink-muted">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={editing.description}
                className={`${FIELD} py-2.5`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="applicableTo" className="mb-1.5 block text-[12px] text-ink-muted">
                  Applies to
                </label>
                <input
                  id="applicableTo"
                  name="applicableTo"
                  defaultValue={editing.applicableTo}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="extensionNote" className="mb-1.5 block text-[12px] text-ink-muted">
                  Extension note
                </label>
                <input
                  id="extensionNote"
                  name="extensionNote"
                  defaultValue={editing.extensionNote}
                  className={FIELD}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
              <div>
                <label htmlFor="sourceLabel" className="mb-1.5 block text-[12px] text-ink-muted">
                  Source name
                </label>
                <input
                  id="sourceLabel"
                  name="sourceLabel"
                  defaultValue={editing.sourceLabel}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="sourceUrl" className="mb-1.5 block text-[12px] text-ink-muted">
                  Source URL
                </label>
                <input
                  id="sourceUrl"
                  name="sourceUrl"
                  type="url"
                  defaultValue={editing.sourceUrl}
                  className={FIELD}
                />
              </div>
            </div>

            <label htmlFor="isPublished" className="flex items-center gap-2.5">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                defaultChecked={editing.isPublished}
                className="h-4 w-4 accent-[#0f2744]"
              />
              <span className="text-[13px] text-ink-muted">Show on the public calendar</span>
            </label>
          </div>

          <div className="mt-5 flex gap-2 border-t border-line pt-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
              Save date
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="min-h-[40px] rounded-[8px] border border-line-strong px-4 text-[13px] text-ink-muted hover:border-navy"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setEditing(BLANK);
            }}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New date
          </button>

          <ul className="mt-5 space-y-3">
            {events.map((event) => (
              <li key={event.id} className="rounded-[10px] border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">{event.category}</Badge>
                      {event.extendedDueDate ? <Badge tone="warn">Extended</Badge> : null}
                      {!event.isPublished ? <Badge tone="neutral">Hidden</Badge> : null}
                      {!event.lastVerifiedAt ? <Badge tone="danger">Not verified</Badge> : null}
                    </div>
                    <p className="mt-2 text-[14px] font-medium text-ink">{event.title}</p>
                    <p className="mt-1 text-[12px] text-ink-muted">
                      Due {formatDate(event.dueDate)}
                      {event.extendedDueDate
                        ? ` · extended to ${formatDate(event.extendedDueDate)}`
                        : ""}
                      {event.lastVerifiedAt
                        ? ` · verified ${formatDate(event.lastVerifiedAt)}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setEditing(event);
                      }}
                      className="min-h-[36px] rounded-[8px] border border-line-strong px-3 text-[12px] text-navy hover:border-navy"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        const fd = new FormData();
                        fd.set("id", event.id);
                        run(deleteComplianceEvent, fd);
                      }}
                      className="min-h-[36px] rounded-[8px] border border-line-strong px-3 text-[12px] text-ink-muted hover:border-status-danger hover:text-status-danger disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
