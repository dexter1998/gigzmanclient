import Script from "next/script";

/**
 * Loads gtag.js for a tenant.
 *
 * Until this existed, `firm_settings.ga4_measurement_id` was collected in the
 * dashboard and stored, but no page ever rendered the tag — so `window.gtag`
 * was always undefined and every call in `lib/analytics.ts` returned silently.
 * The events were being written and never sent.
 *
 * `afterInteractive` rather than `beforeInteractive`: analytics must not sit on
 * the critical path of a site whose whole point is that it loads fast.
 *
 * Rendered per tenant, from that tenant's own measurement id, so one client's
 * traffic never lands in another's property on the shared deployment.
 */
export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
