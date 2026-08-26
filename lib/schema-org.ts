import type { firmSettings } from "@/lib/db/schema";

type Settings = typeof firmSettings.$inferSelect;

const DAY_MAP: Record<string, string> = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday",
};

/**
 * Built from the same firm_settings row the footer and contact page read, so the
 * markup cannot drift from what is displayed or from the Google Business Profile.
 *
 * `aggregateRating` is deliberately absent: self-serving review markup breaches
 * Google's structured data guidelines, and ICAI's Code of Ethics prohibits a
 * chartered accountant advertising ratings or testimonials.
 */
export function buildOrganizationJsonLd(settings: Settings, siteUrl: string) {
  const hours = (settings.openingHours ?? [])
    .filter((h) => !h.closed && h.opens && h.closes)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_MAP[h.day] ?? h.day,
      opens: h.opens,
      closes: h.closes,
    }));

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: settings.firmName,
    url: siteUrl,
  };

  if (settings.overview) jsonLd.description = settings.overview;
  if (settings.phone) jsonLd.telephone = settings.phone;
  if (settings.email) jsonLd.email = settings.email;

  if (settings.addressLine || settings.locality) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: settings.addressLine ?? undefined,
      addressLocality: settings.locality ?? undefined,
      addressRegion: settings.region ?? undefined,
      postalCode: settings.postalCode ?? undefined,
      addressCountry: settings.country ?? "India",
    };
  }

  if (settings.latitude && settings.longitude) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: settings.latitude,
      longitude: settings.longitude,
    };
  }

  if (hours.length > 0) jsonLd.openingHoursSpecification = hours;
  if (settings.googleMapsUrl) jsonLd.hasMap = settings.googleMapsUrl;

  const social = Object.values(settings.socialLinks ?? {}).filter(Boolean);
  if (social.length > 0) jsonLd.sameAs = social;

  return jsonLd;
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function buildArticleJsonLd(input: {
  title: string;
  description: string | null;
  url: string;
  publishedAt: Date | null;
  updatedAt: Date | null;
  authorName: string | null;
  publisherName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description ?? undefined,
    url: input.url,
    datePublished: input.publishedAt?.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt)?.toISOString(),
    author: input.authorName
      ? { "@type": "Organization", name: input.authorName }
      : undefined,
    publisher: { "@type": "Organization", name: input.publisherName },
  };
}

/** Docs recommend a plain script tag with `<` escaped, not next/script. */
export function jsonLdProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  };
}
