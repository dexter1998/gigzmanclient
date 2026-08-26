"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, AlertCircle, ShieldAlert } from "lucide-react";
import { updateFirmSettings, type ActionResult } from "@/lib/actions/dashboard-actions";

interface Settings {
  firmName: string;
  tagline: string;
  overview: string;
  establishedYear: string;
  firmRegistrationNumber: string;
  businessCategory: string;
  phone: string;
  whatsapp: string;
  email: string;
  addressLine: string;
  locality: string;
  region: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  googleMapsUrl: string;
  seoTitle: string;
  seoDescription: string;
  ga4MeasurementId: string;
  notificationEmail: string;
  reviewsEnabled: boolean;
  pricingEnabled: boolean;
  awardsEnabled: boolean;
  clientLogosEnabled: boolean;
  teamEnabled: boolean;
}

const FIELD =
  "w-full min-h-[40px] rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink focus:border-navy focus:outline-none";

/**
 * The first four sections carry ICAI advertising restrictions. Each is labelled
 * so enabling one is a deliberate decision rather than an accident.
 */
const SECTIONS = [
  {
    name: "reviewsEnabled",
    label: "Reviews and ratings",
    risk: "ICAI prohibits testimonials, star ratings and endorsements on a firm's own website.",
  },
  {
    name: "pricingEnabled",
    label: "Pricing indications",
    risk: "ICAI prohibits publishing professional fees or offers of free service.",
  },
  {
    name: "clientLogosEnabled",
    label: "Client names and logos",
    risk: "ICAI prohibits naming clients or displaying client logos.",
  },
  {
    name: "awardsEnabled",
    label: "Awards and recognition",
    risk: "May read as a comparative or self-laudatory claim; review before enabling.",
  },
  { name: "teamEnabled", label: "Team profiles", risk: null },
] as const;

export default function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({
    reviewsEnabled: settings.reviewsEnabled,
    pricingEnabled: settings.pricingEnabled,
    clientLogosEnabled: settings.clientLogosEnabled,
    awardsEnabled: settings.awardsEnabled,
    teamEnabled: settings.teamEnabled,
  });

  const riskyEnabled = SECTIONS.filter((s) => s.risk && flags[s.name]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateFirmSettings(formData);
      setFeedback(result);
      if (result.ok) router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-5">
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

      <Panel title="Firm identity">
        <Row>
          <Input name="firmName" label="Firm name" defaultValue={settings.firmName} required />
          <Input
            name="businessCategory"
            label="Nature of practice"
            defaultValue={settings.businessCategory}
          />
        </Row>
        <Row>
          <Input
            name="establishedYear"
            label="Year of establishment"
            defaultValue={settings.establishedYear}
          />
          <Input
            name="firmRegistrationNumber"
            label="ICAI firm registration number"
            defaultValue={settings.firmRegistrationNumber}
          />
        </Row>
        <Input name="tagline" label="Tagline" defaultValue={settings.tagline} />
        <TextArea name="overview" label="Firm overview" defaultValue={settings.overview} rows={4} />
      </Panel>

      <Panel
        title="Contact details"
        note="These must match the Google Business Profile exactly — they drive the footer, the contact page, the map and the structured data."
      >
        <Row>
          <Input name="phone" label="Phone" defaultValue={settings.phone} />
          <Input name="whatsapp" label="WhatsApp" defaultValue={settings.whatsapp} />
        </Row>
        <Row>
          <Input name="email" label="Email" type="email" defaultValue={settings.email} />
          <Input
            name="notificationEmail"
            label="Enquiry notification email"
            type="email"
            defaultValue={settings.notificationEmail}
          />
        </Row>
        <Input name="addressLine" label="Address" defaultValue={settings.addressLine} />
        <Row three>
          <Input name="locality" label="Locality" defaultValue={settings.locality} />
          <Input name="region" label="State" defaultValue={settings.region} />
          <Input name="postalCode" label="PIN code" defaultValue={settings.postalCode} />
        </Row>
        <Row three>
          <Input name="latitude" label="Latitude" defaultValue={settings.latitude} />
          <Input name="longitude" label="Longitude" defaultValue={settings.longitude} />
          <Input name="googleMapsUrl" label="Google Maps link" defaultValue={settings.googleMapsUrl} />
        </Row>
      </Panel>

      <Panel title="Search and analytics">
        <Input name="seoTitle" label="Default page title" defaultValue={settings.seoTitle} />
        <TextArea
          name="seoDescription"
          label="Default meta description"
          defaultValue={settings.seoDescription}
          rows={2}
        />
        <Input
          name="ga4MeasurementId"
          label="GA4 measurement ID"
          placeholder="G-XXXXXXXXXX"
          defaultValue={settings.ga4MeasurementId}
        />
      </Panel>

      <Panel title="Section visibility">
        {riskyEnabled.length > 0 ? (
          <div className="flex items-start gap-2.5 rounded-[8px] border border-accent/30 bg-accent-soft px-3.5 py-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-medium text-ink">
                {riskyEnabled.length}{" "}
                {riskyEnabled.length === 1 ? "section carries" : "sections carry"} an ICAI
                advertising restriction
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                These are enabled for demonstration. Confirm with the firm&rsquo;s chartered
                accountant before the site goes live — the restrictions apply to the practice, not
                to the website builder.
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-2.5">
          {SECTIONS.map((section) => (
            <label
              key={section.name}
              htmlFor={section.name}
              className="flex items-start gap-3 rounded-[8px] border border-line p-3.5"
            >
              <input
                id={section.name}
                name={section.name}
                type="checkbox"
                checked={flags[section.name]}
                onChange={(e) =>
                  setFlags((prev) => ({ ...prev, [section.name]: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#0f2744]"
              />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-ink">{section.label}</span>
                {section.risk ? (
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-status-warn">
                    {section.risk}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </Panel>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-[8px] bg-navy px-5 text-[14px] font-medium text-white hover:bg-navy-soft disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        Save settings
      </button>
    </form>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-line bg-surface p-5">
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {note ? <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{note}</p> : null}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ children, three }: { children: React.ReactNode; three?: boolean }) {
  return <div className={`grid gap-3 ${three ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>{children}</div>;
}

function Input({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[12px] text-ink-muted">
        {label} {required ? <span className="text-accent">*</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={FIELD}
      />
    </div>
  );
}

function TextArea({
  name,
  label,
  defaultValue,
  rows,
}: {
  name: string;
  label: string;
  defaultValue: string;
  rows: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[12px] text-ink-muted">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={`${FIELD} py-2.5`}
      />
    </div>
  );
}
