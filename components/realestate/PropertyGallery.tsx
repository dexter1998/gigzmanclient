"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyTypeIcon from "./PropertyTypeIcon";

interface GalleryImage {
  path: string;
  alt: string | null;
}

interface PropertyGalleryProps {
  images: GalleryImage[];
  propertyType: string;
  title: string;
}

export default function PropertyGallery({ images, propertyType, title }: PropertyGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-[12px] bg-tint">
        <PropertyTypeIcon propertyType={propertyType} className="h-10 w-10" />
      </div>
    );
  }

  const current = images[active];
  const go = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[12px] bg-tint">
        <Image
          src={current.path}
          alt={current.alt ?? title}
          fill
          sizes="(max-width: 1024px) 100vw, 720px"
          priority
          className="object-cover"
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-navy shadow-[0_1px_2px_rgba(15,44,82,0.04),0_10px_30px_-18px_rgba(15,44,82,0.18)] hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-navy shadow-[0_1px_2px_rgba(15,44,82,0.04),0_10px_30px_-18px_rgba(15,44,82,0.18)] hover:bg-surface"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-navy/70 px-2.5 py-1 text-[11px] text-white">
              {active + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.path}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-[8px] border ${
                i === active ? "border-accent" : "border-line"
              }`}
            >
              <Image src={img.path} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
