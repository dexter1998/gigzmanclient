"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, AlertCircle, X } from "lucide-react";
import Badge, { statusTone } from "@/components/ui/Badge";
import {
  saveUpdate,
  deleteUpdate,
  type ActionResult,
} from "@/lib/actions/dashboard-actions";
import { UPDATE_STATUS_LABELS } from "@/lib/format";

interface UpdateRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  excerpt: string;
  body: string;
  applicableYear: string;
  authorName: string;
  reviewerName: string;
  sourceLabel: string;
  sourceUrl: string;
  publishedAt: string | null;
  updatedAt: string;
}

interface UpdatesManagerProps {
  updates: UpdateRow[];
  canDelete: boolean;
}

const FIELD =
  "w-full min-h-[40px] rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

const CATEGORIES = ["Income Tax", "GST", "TDS", "MCA", "Audit", "Business Compliance", "Due Dates"];

const BLANK: UpdateRow = {
  id: "",
  title: "",
  slug: "",
  category: "Income Tax",
  status: "draft",
  excerpt: "",
  body: "",
  applicableYear: "",
  authorName: "",
  reviewerName: "",
  sourceLabel: "",
  sourceUrl: "",
  publishedAt: null,
  updatedAt: "",
};

export default function UpdatesManager({ updates, canDelete }: UpdatesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [editing, setEditing] = useState<UpdateRow | null>(null);

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

      {!editing ? (
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
            New update
          </button>

          <ul className="mt-5 space-y-3">
            {updates.map((update) => (
              <li
                key={update.id}
                className="rounded-[10px] border border-line bg-surface p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone(update.status)}>
                        {UPDATE_STATUS_LABELS[update.status] ?? update.status}
                      </Badge>
                      <span className="text-[11px] text-ink-subtle">{update.category}</span>
                      {update.applicableYear ? (
                        <span className="text-[11px] text-ink-subtle">
                          · {update.applicableYear}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[14px] font-medium leading-snug text-ink">
                      {update.title}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-subtle">
                      {update.publishedAt
                        ? `Published ${update.publishedAt}`
                        : `Updated ${update.updatedAt}`}
                      {update.reviewerName ? ` · Reviewed by ${update.reviewerName}` : ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setEditing(update);
                      }}
                      className="min-h-[36px] rounded-[8px] border border-line-strong px-3 text-[12px] text-navy hover:border-navy"
                    >
                      Edit
                    </button>
                    {canDelete && update.status !== "archived" ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          const fd = new FormData();
                          fd.set("id", update.id);
                          run(deleteUpdate, fd);
                        }}
                        className="min-h-[36px] rounded-[8px] border border-line-strong px-3 text-[12px] text-ink-muted hover:border-status-danger hover:text-status-danger disabled:opacity-60"
                      >
                        Archive
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(saveUpdate, new FormData(e.currentTarget), true);
          }}
          className="rounded-[10px] border border-line bg-surface p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-ink">
              {editing.id ? "Edit update" : "New update"}
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
            <div>
              <label htmlFor="title" className="mb-1.5 block text-[12px] text-ink-muted">
                Title <span className="text-accent">*</span>
              </label>
              <input
                id="title"
                name="title"
                required
                defaultValue={editing.title}
                className={FIELD}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="category" className="mb-1.5 block text-[12px] text-ink-muted">
                  Category <span className="text-accent">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editing.category}
                  className={FIELD}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="applicableYear" className="mb-1.5 block text-[12px] text-ink-muted">
                  Applicable period
                </label>
                <input
                  id="applicableYear"
                  name="applicableYear"
                  placeholder="FY 2026-27"
                  defaultValue={editing.applicableYear}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="updateStatus" className="mb-1.5 block text-[12px] text-ink-muted">
                  Status
                </label>
                <select
                  id="updateStatus"
                  name="status"
                  defaultValue={editing.status}
                  className={FIELD}
                >
                  {Object.entries(UPDATE_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="excerpt" className="mb-1.5 block text-[12px] text-ink-muted">
                Summary
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                defaultValue={editing.excerpt}
                className={`${FIELD} py-2.5`}
              />
            </div>

            <div>
              <label htmlFor="body" className="mb-1.5 block text-[12px] text-ink-muted">
                Body (Markdown)
              </label>
              <textarea
                id="body"
                name="body"
                rows={12}
                defaultValue={editing.body}
                className={`${FIELD} py-2.5 font-mono text-[12px]`}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="authorName" className="mb-1.5 block text-[12px] text-ink-muted">
                  Author
                </label>
                <input
                  id="authorName"
                  name="authorName"
                  defaultValue={editing.authorName}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="reviewerName" className="mb-1.5 block text-[12px] text-ink-muted">
                  Reviewer <span className="text-accent">*</span> to publish
                </label>
                <input
                  id="reviewerName"
                  name="reviewerName"
                  defaultValue={editing.reviewerName}
                  className={FIELD}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
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
                  Source URL <span className="text-accent">*</span> to publish
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
          </div>

          <div className="mt-5 flex gap-2 border-t border-line pt-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
              Save update
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
      )}
    </div>
  );
}
