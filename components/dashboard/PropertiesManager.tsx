"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Loader2, Check, AlertCircle, X, ShieldCheck, ShieldAlert, Star, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import {
  saveProperty,
  toggleProperty,
  uploadPropertyImage,
  deletePropertyImage,
  setPrimaryPropertyImage,
  type ActionResult,
} from "@/lib/actions/dashboard-actions";
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_PURPOSE_LABELS } from "@/lib/format";

interface PropertyImageRow {
  id: string;
  path: string;
  alt: string | null;
  isPrimary: boolean;
}

interface PropertyRow {
  id: string;
  title: string;
  slug: string;
  propertyType: string;
  purpose: string;
  status: string;
  price: string;
  priceLabel: string;
  pricePerSqft: string;
  sector: string;
  locality: string;
  corridor: string;
  beds: string;
  baths: string;
  area: string;
  areaUnit: string;
  badge: string;
  developer: string;
  reraNumber: string;
  description: string;
  amenities: string[];
  isFeatured: boolean;
  isActive: boolean;
  images: PropertyImageRow[];
}

interface PropertiesManagerProps {
  properties: PropertyRow[];
}

const FIELD =
  "w-full min-h-[40px] rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

const BLANK: PropertyRow = {
  id: "",
  title: "",
  slug: "",
  propertyType: "apartment",
  purpose: "buy",
  status: "ready_to_move",
  price: "",
  priceLabel: "",
  pricePerSqft: "",
  sector: "",
  locality: "",
  corridor: "",
  beds: "",
  baths: "",
  area: "",
  areaUnit: "sqft",
  badge: "",
  developer: "",
  reraNumber: "",
  description: "",
  amenities: [],
  isFeatured: false,
  isActive: true,
  images: [],
};

export default function PropertiesManager({ properties }: PropertiesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [editing, setEditing] = useState<PropertyRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            New property
          </button>

          <ul className="mt-5 space-y-3">
            {properties.map((property) => (
              <li key={property.id} className="rounded-[10px] border border-line bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={property.isActive ? "accent" : "neutral"}>
                        {property.isActive ? "Visible" : "Hidden"}
                      </Badge>
                      <span className="text-[11px] text-ink-subtle">
                        {PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType} ·{" "}
                        {PROPERTY_PURPOSE_LABELS[property.purpose] ?? property.purpose} ·{" "}
                        {PROPERTY_STATUS_LABELS[property.status] ?? property.status}
                      </span>
                      {property.isFeatured ? (
                        <span className="flex items-center gap-1 text-[11px] text-accent">
                          <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[14px] font-medium leading-snug text-ink">
                      {property.title}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-subtle">
                      {[property.locality, property.sector ? `Sector ${property.sector}` : null]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[11px]">
                      {property.reraNumber ? (
                        <span className="flex items-center gap-1 text-status-success">
                          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                          RERA {property.reraNumber}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-status-warn">
                          <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                          Registration pending
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setEditing(property);
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
                        fd.set("id", property.id);
                        run(toggleProperty, fd);
                      }}
                      className="min-h-[36px] rounded-[8px] border border-line-strong px-3 text-[12px] text-ink-muted hover:border-navy disabled:opacity-60"
                    >
                      {property.isActive ? "Hide" : "Publish"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="space-y-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(saveProperty, new FormData(e.currentTarget), !editing.id);
            }}
            className="rounded-[10px] border border-line bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-ink">
                {editing.id ? "Edit property" : "New property"}
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
              <div>
                <label htmlFor="title" className="mb-1.5 block text-[12px] text-ink-muted">
                  Title <span className="text-accent">*</span>
                </label>
                <input id="title" name="title" required defaultValue={editing.title} className={FIELD} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="propertyType" className="mb-1.5 block text-[12px] text-ink-muted">
                    Type <span className="text-accent">*</span>
                  </label>
                  <select id="propertyType" name="propertyType" defaultValue={editing.propertyType} className={FIELD}>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="purpose" className="mb-1.5 block text-[12px] text-ink-muted">
                    Purpose
                  </label>
                  <select id="purpose" name="purpose" defaultValue={editing.purpose} className={FIELD}>
                    {Object.entries(PROPERTY_PURPOSE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="mb-1.5 block text-[12px] text-ink-muted">
                    Status
                  </label>
                  <select id="status" name="status" defaultValue={editing.status} className={FIELD}>
                    {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="price" className="mb-1.5 block text-[12px] text-ink-muted">
                    Price (₹)
                  </label>
                  <input id="price" name="price" inputMode="numeric" defaultValue={editing.price} className={FIELD} />
                </div>
                <div>
                  <label htmlFor="priceLabel" className="mb-1.5 block text-[12px] text-ink-muted">
                    Price label override
                  </label>
                  <input
                    id="priceLabel"
                    name="priceLabel"
                    placeholder="Price on request"
                    defaultValue={editing.priceLabel}
                    className={FIELD}
                  />
                </div>
                <div>
                  <label htmlFor="pricePerSqft" className="mb-1.5 block text-[12px] text-ink-muted">
                    Price / sq.ft
                  </label>
                  <input
                    id="pricePerSqft"
                    name="pricePerSqft"
                    inputMode="numeric"
                    defaultValue={editing.pricePerSqft}
                    className={FIELD}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="locality" className="mb-1.5 block text-[12px] text-ink-muted">
                    Locality
                  </label>
                  <input id="locality" name="locality" defaultValue={editing.locality} className={FIELD} />
                </div>
                <div>
                  <label htmlFor="corridor" className="mb-1.5 block text-[12px] text-ink-muted">
                    Corridor
                  </label>
                  <input id="corridor" name="corridor" defaultValue={editing.corridor} className={FIELD} />
                </div>
                <div>
                  <label htmlFor="sector" className="mb-1.5 block text-[12px] text-ink-muted">
                    Sector
                  </label>
                  <input id="sector" name="sector" defaultValue={editing.sector} className={FIELD} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div>
                  <label htmlFor="beds" className="mb-1.5 block text-[12px] text-ink-muted">
                    Beds
                  </label>
                  <input id="beds" name="beds" inputMode="numeric" defaultValue={editing.beds} className={FIELD} />
                </div>
                <div>
                  <label htmlFor="baths" className="mb-1.5 block text-[12px] text-ink-muted">
                    Baths
                  </label>
                  <input id="baths" name="baths" inputMode="numeric" defaultValue={editing.baths} className={FIELD} />
                </div>
                <div>
                  <label htmlFor="area" className="mb-1.5 block text-[12px] text-ink-muted">
                    Area
                  </label>
                  <input id="area" name="area" inputMode="numeric" defaultValue={editing.area} className={FIELD} />
                </div>
                <div>
                  <label htmlFor="areaUnit" className="mb-1.5 block text-[12px] text-ink-muted">
                    Area unit
                  </label>
                  <input id="areaUnit" name="areaUnit" defaultValue={editing.areaUnit} className={FIELD} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="badge" className="mb-1.5 block text-[12px] text-ink-muted">
                    Badge
                  </label>
                  <input id="badge" name="badge" placeholder="New Launch" defaultValue={editing.badge} className={FIELD} />
                </div>
                <div>
                  <label htmlFor="developer" className="mb-1.5 block text-[12px] text-ink-muted">
                    Developer
                  </label>
                  <input id="developer" name="developer" defaultValue={editing.developer} className={FIELD} />
                </div>
              </div>

              <div>
                <label htmlFor="reraNumber" className="mb-1.5 block text-[12px] text-ink-muted">
                  RERA registration number
                </label>
                <input
                  id="reraNumber"
                  name="reraNumber"
                  defaultValue={editing.reraNumber}
                  className={FIELD}
                />
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-subtle">
                  Leave blank if registration is genuinely pending — the public listing shows that
                  state plainly rather than hiding it. Never enter a number that hasn&rsquo;t been
                  confirmed against the project&rsquo;s actual RERA filing.
                </p>
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-[12px] text-ink-muted">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={editing.description}
                  className={`${FIELD} py-2.5`}
                />
              </div>

              <div>
                <label htmlFor="amenities" className="mb-1.5 block text-[12px] text-ink-muted">
                  Amenities (comma-separated)
                </label>
                <input
                  id="amenities"
                  name="amenities"
                  defaultValue={editing.amenities.join(", ")}
                  className={FIELD}
                />
              </div>

              <label htmlFor="isFeatured" className="flex items-center gap-2.5 py-1">
                <input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  defaultChecked={editing.isFeatured}
                  className="h-4 w-4 shrink-0 accent-[#0f2c52]"
                />
                <span className="text-[13px] text-ink-muted">Feature on the home page</span>
              </label>
            </div>

            <div className="mt-5 flex gap-2 border-t border-line pt-4">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
                Save property
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

          {editing.id ? (
            <div className="rounded-[10px] border border-line bg-surface p-5">
              <p className="text-[14px] font-semibold text-ink">Photos</p>

              {editing.images.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {editing.images.map((img) => (
                    <div key={img.id} className="group relative overflow-hidden rounded-[8px] border border-line">
                      <div className="relative aspect-square w-full bg-tint">
                        <Image src={img.path} alt={img.alt ?? ""} fill sizes="140px" className="object-cover" />
                      </div>
                      {img.isPrimary ? (
                        <span className="absolute left-1.5 top-1.5 rounded-full bg-navy px-2 py-0.5 text-[10px] text-white">
                          Cover
                        </span>
                      ) : null}
                      <div className="flex divide-x divide-line border-t border-line bg-surface">
                        {!img.isPrimary ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => {
                              const fd = new FormData();
                              fd.set("id", img.id);
                              run(setPrimaryPropertyImage, fd);
                            }}
                            className="flex-1 py-1.5 text-[11px] text-ink-muted hover:text-navy disabled:opacity-60"
                          >
                            Set cover
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => {
                            const fd = new FormData();
                            fd.set("id", img.id);
                            run(deletePropertyImage, fd);
                          }}
                          className="flex flex-1 items-center justify-center gap-1 py-1.5 text-[11px] text-status-danger hover:bg-status-danger-soft disabled:opacity-60"
                        >
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[12px] text-ink-subtle">No photos uploaded yet.</p>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  run(uploadPropertyImage, fd);
                  e.currentTarget.reset();
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4"
              >
                <input type="hidden" name="propertyId" value={editing.id} />
                <div className="flex-1">
                  <label htmlFor="file" className="mb-1.5 block text-[12px] text-ink-muted">
                    Upload photo (JPEG, PNG or WebP, up to 5MB)
                  </label>
                  <input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    className="w-full text-[12px] text-ink-muted"
                  />
                </div>
                <input
                  name="alt"
                  placeholder="Alt text (optional)"
                  className={`${FIELD} sm:max-w-[220px]`}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="min-h-[40px] rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
                >
                  Upload
                </button>
              </form>
            </div>
          ) : (
            <p className="text-[12px] text-ink-subtle">Save the property once to start uploading photos.</p>
          )}
        </div>
      )}
    </div>
  );
}
