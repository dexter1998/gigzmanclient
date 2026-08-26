"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleService, type ActionResult } from "@/lib/actions/dashboard-actions";
import { SERVICE_CATEGORY_LABELS } from "@/lib/format";

interface ServiceRow {
  id: string;
  title: string;
  category: string;
  isActive: boolean;
}

export default function ServiceToggles({ services }: { services: ServiceRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const categories = [...new Set(services.map((s) => s.category))];

  const toggle = (id: string) => {
    setBusyId(id);
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result: ActionResult = await toggleService(formData);
      setBusyId(null);
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="mt-4 space-y-4">
      {categories.map((category) => (
        <div key={category} className="rounded-[10px] border border-line bg-surface">
          <p className="border-b border-line px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
            {SERVICE_CATEGORY_LABELS[category] ?? category}
          </p>
          <ul className="divide-y divide-line">
            {services
              .filter((s) => s.category === category)
              .map((service) => (
                <li key={service.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span
                    className={`text-[13px] ${service.isActive ? "text-ink" : "text-ink-subtle line-through"}`}
                  >
                    {service.title}
                  </span>
                  <button
                    type="button"
                    disabled={pending && busyId === service.id}
                    onClick={() => toggle(service.id)}
                    aria-pressed={service.isActive}
                    className={`min-h-[32px] shrink-0 rounded-full px-3 text-[12px] font-medium transition-colors disabled:opacity-50 ${
                      service.isActive
                        ? "bg-status-success-soft text-status-success"
                        : "bg-status-neutral-soft text-status-neutral"
                    }`}
                  >
                    {service.isActive ? "Visible" : "Hidden"}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
