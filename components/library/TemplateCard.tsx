import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { TemplateEntry } from "@/lib/template-registry";
import { getTenantPath } from "@/lib/templates";
import type { clients } from "@/lib/db/schema";

interface TemplateCardProps {
  template: TemplateEntry;
  demo: typeof clients.$inferSelect | undefined;
}

export default function TemplateCard({ template, demo }: TemplateCardProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
      <div className="relative flex h-[180px] items-center justify-center overflow-hidden bg-tint">
        <Image
          src={template.image.src}
          alt={template.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover"
        />
      </div>

      <div className="p-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-accent">
          {template.label}
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{template.summary}</p>

        <ul className="mt-5 space-y-2">
          {template.includes.map((item) => (
            <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-ink-muted">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
          {demo ? (
            <>
              <Link
                href={getTenantPath(demo.vertical, demo.slug)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[8px] bg-navy px-4 text-[13px] font-medium text-white hover:bg-navy-soft"
              >
                View Live Demo
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href={`${getTenantPath(demo.vertical, demo.slug)}/dashboard`}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[8px] border border-line-strong px-4 text-[13px] font-medium text-navy hover:border-navy"
              >
                View Dashboard
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <p className="text-[12px] text-ink-subtle">No demo tenant seeded yet for this template.</p>
          )}
        </div>
      </div>
    </div>
  );
}
