"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, AlertCircle } from "lucide-react";
import {
  updateQueryStatus,
  updateQueryDetails,
  addQueryNote,
  archiveQuery,
  type ActionResult,
} from "@/lib/actions/dashboard-actions";
import { QUERY_STATUS_LABELS, NOT_CONVERTED_REASON_LABELS } from "@/lib/format";

interface Note {
  id: string;
  body: string;
  authorName: string | null;
  createdAt: string;
}

interface QueryWorkspaceProps {
  queryId: string;
  currentStatus: string;
  followUpDate: string | null;
  assignedTo: string | null;
  priority: string | null;
  isArchived: boolean;
  notes: Note[];
}

const FIELD =
  "w-full min-h-[40px] rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

export default function QueryWorkspace({
  queryId,
  currentStatus,
  followUpDate,
  assignedTo,
  priority,
  isArchived,
  notes,
}: QueryWorkspaceProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [status, setStatus] = useState(currentStatus);
  const [noteBody, setNoteBody] = useState("");

  const run = (fn: (fd: FormData) => Promise<ActionResult>, formData: FormData) => {
    startTransition(async () => {
      const result = await fn(formData);
      setFeedback(result);
      if (result.ok) router.refresh();
    });
  };

  const submit = (
    event: React.FormEvent<HTMLFormElement>,
    fn: (fd: FormData) => Promise<ActionResult>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (fn === addQueryNote) setNoteBody("");
    run(fn, formData);
  };

  return (
    <div className="space-y-5">
      {feedback ? (
        <p
          role="status"
          className={`flex items-start gap-2 rounded-[8px] px-3.5 py-2.5 text-[13px] ${
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

      <section className="rounded-[10px] border border-line bg-surface p-5">
        <p className="text-[14px] font-semibold text-ink">Change status</p>
        <form onSubmit={(e) => submit(e, updateQueryStatus)} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={queryId} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="mb-1.5 block text-[12px] text-ink-muted">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={FIELD}
              >
                {Object.entries(QUERY_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* A reason is mandatory when closing a query as not converted. */}
            {status === "not_converted" ? (
              <div>
                <label
                  htmlFor="notConvertedReason"
                  className="mb-1.5 block text-[12px] text-ink-muted"
                >
                  Reason <span className="text-accent">*</span>
                </label>
                <select id="notConvertedReason" name="notConvertedReason" required className={FIELD}>
                  <option value="">Select a reason</option>
                  {Object.entries(NOT_CONVERTED_REASON_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="reason" className="mb-1.5 block text-[12px] text-ink-muted">
              Note on this change
            </label>
            <input id="reason" name="reason" type="text" className={FIELD} />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
            Update status
          </button>
        </form>
      </section>

      <section className="rounded-[10px] border border-line bg-surface p-5">
        <p className="text-[14px] font-semibold text-ink">Assignment and follow-up</p>
        <form onSubmit={(e) => submit(e, updateQueryDetails)} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={queryId} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="assignedTo" className="mb-1.5 block text-[12px] text-ink-muted">
                Assigned to
              </label>
              <input
                id="assignedTo"
                name="assignedTo"
                type="text"
                defaultValue={assignedTo ?? ""}
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="followUpDate" className="mb-1.5 block text-[12px] text-ink-muted">
                Follow-up date
              </label>
              <input
                id="followUpDate"
                name="followUpDate"
                type="date"
                defaultValue={followUpDate ?? ""}
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="priority" className="mb-1.5 block text-[12px] text-ink-muted">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue={priority ?? "normal"}
                className={FIELD}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const fd = new FormData();
                fd.set("id", queryId);
                run(archiveQuery, fd);
              }}
              className="inline-flex min-h-[40px] items-center rounded-[8px] border border-line-strong px-4 text-[13px] text-ink-muted hover:border-navy hover:text-navy disabled:opacity-60"
            >
              {isArchived ? "Restore" : "Archive"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[10px] border border-line bg-surface p-5">
        <p className="text-[14px] font-semibold text-ink">Internal notes</p>
        <form onSubmit={(e) => submit(e, addQueryNote)} className="mt-4">
          <input type="hidden" name="id" value={queryId} />
          <textarea
            name="body"
            rows={3}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Record what was discussed or agreed."
            className={`${FIELD} py-2.5`}
          />
          <button
            type="submit"
            disabled={pending || !noteBody.trim()}
            className="mt-3 inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
          >
            Add note
          </button>
        </form>

        {notes.length > 0 ? (
          <ul className="mt-5 space-y-3 border-t border-line pt-4">
            {notes.map((note) => (
              <li key={note.id} className="rounded-[8px] bg-cream p-3.5">
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink">
                  {note.body}
                </p>
                <p className="mt-2 text-[11px] text-ink-subtle">
                  {note.authorName ?? "Unknown"} · {note.createdAt}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
