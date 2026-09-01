"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, AlertCircle, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { saveLocality, toggleLocality, type ActionResult } from "@/lib/actions/dashboard-actions";

interface LocalityRow {
  id: string;
  name: string;
  slug: string;
  corridor: string;
  avgPricePerSqft: string;
  yoyChangePercent: string;
  rentalYieldPercent: string;
  activeProjects: string;
  bestFor: string;
  description: string;
  heroImage: string;
  isPublished: boolean;
}

interface LocalitiesManagerProps {
  localities: LocalityRow[];
}

const FIELD =
  "w-full min-h-[40px] rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

const BLANK: LocalityRow = {
  id: "",
  name: "",
  slug: "",
  corridor: "",
  avgPricePerSqft: "",
  yoyChangePercent: "",
  rentalYieldPercent: "",
  activeProjects: "",
  bestFor: "",
  description: "",
  heroImage: "",
  isPublished: false,
};

export default function LocalitiesManager({ localities }: LocalitiesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [editing, setEditing] = useState<LocalityRow | null>(null);

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
            New locality
          </button>

          <ul className="mt-5 space-y-3">
            {localities.map((locality) => (
              <li key={locality.id} className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={locality.isPublished ? "accent" : "neutral"}>
                        {locality.isPublished ? "Published" : "Hidden"}
                      </Badge>
                      {locality.corridor ? (
                        <span className="text-[11px] text-ink-subtle">{locality.corridor}</span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[14px] font-medium leading-snug text-ink">{locality.name}</p>
                    <p className="mt-1 text-[11px] text-ink-subtle">
                      {locality.description ? `${locality.description.length} chars of description` : "No description yet"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setEditing(locality);
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
                        fd.set("id", locality.id);
                        run(toggleLocality, fd);
                      }}
                      className="min-h-[36px] rounded-[8px] border border-line-strong px-3 text-[12px] text-ink-muted hover:border-navy disabled:opacity-60"
                    >
                      {locality.isPublished ? "Hide" : "Publish"}
                    </button>
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
            run(saveLocality, new FormData(e.currentTarget), true);
          }}
          className="rounded-[10px] border border-line bg-surface p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-ink">
              {editing.id ? "Edit locality" : "New locality"}
            </p>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-ink-subtle hover:bg-tint"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <input type="hidden" name="id" value={editing.id} />

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[12px] text-ink-muted">
                  Name <span className="text-accent">*</span>
                </label>
                <input id="name" name="name" required defaultValue={editing.name} className={FIELD} />
              </div>
              <div>
                <label htmlFor="corridor" className="mb-1.5 block text-[12px] text-ink-muted">
                  Corridor
                </label>
                <input id="corridor" name="corridor" defaultValue={editing.corridor} className={FIELD} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="avgPricePerSqft" className="mb-1.5 block text-[12px] text-ink-muted">
                  Avg. price / sq.ft
                </label>
                <input
                  id="avgPricePerSqft"
                  name="avgPricePerSqft"
                  inputMode="numeric"
                  defaultValue={editing.avgPricePerSqft}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="yoyChangePercent" className="mb-1.5 block text-[12px] text-ink-muted">
                  YoY change (%)
                </label>
                <input
                  id="yoyChangePercent"
                  name="yoyChangePercent"
                  inputMode="decimal"
                  defaultValue={editing.yoyChangePercent}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="rentalYieldPercent" className="mb-1.5 block text-[12px] text-ink-muted">
                  Rental yield (%)
                </label>
                <input
                  id="rentalYieldPercent"
                  name="rentalYieldPercent"
                  inputMode="decimal"
                  defaultValue={editing.rentalYieldPercent}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="activeProjects" className="mb-1.5 block text-[12px] text-ink-muted">
                  Active projects
                </label>
                <input
                  id="activeProjects"
                  name="activeProjects"
                  inputMode="numeric"
                  defaultValue={editing.activeProjects}
                  className={FIELD}
                />
              </div>
            </div>

            <div>
              <label htmlFor="bestFor" className="mb-1.5 block text-[12px] text-ink-muted">
                Best for
              </label>
              <input
                id="bestFor"
                name="bestFor"
                placeholder="Premium high-rise apartments"
                defaultValue={editing.bestFor}
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="heroImage" className="mb-1.5 block text-[12px] text-ink-muted">
                Hero image path
              </label>
              <input
                id="heroImage"
                name="heroImage"
                placeholder="/verticals/realestate/photos/corridor-example.webp"
                defaultValue={editing.heroImage}
                className={FIELD}
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1.5 block text-[12px] text-ink-muted">
                Description <span className="text-accent">*</span> to publish (min. 120 characters)
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={editing.description}
                className={`${FIELD} py-2.5`}
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-subtle">
                Write something genuinely specific to this locality — market movement, connectivity,
                who it suits. A page that only swaps the name from another locality is a doorway page
                and hurts search ranking rather than helping it.
              </p>
            </div>

            <label htmlFor="isPublished" className="flex items-center gap-2.5 py-1">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                defaultChecked={editing.isPublished}
                className="h-4 w-4 shrink-0 accent-[#0f2c52]"
              />
              <span className="text-[13px] text-ink-muted">Published</span>
            </label>
          </div>

          <div className="mt-5 flex gap-2 border-t border-line pt-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
              Save locality
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
