"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

/**
 * Google's Locator Plus, wired to the tenant's own listing.
 *
 * This is the widget the Cloud console's Quick Builder exports. It renders the
 * business card — name, address, hours, rating, photo, directions — as a real
 * map rather than an iframe, which is more than `MapEmbedV2`'s place embed can
 * show.
 *
 * What it costs is weight: the extended component library is a few hundred
 * kilobytes of web components from ajax.googleapis.com, and it is built for a
 * multi-location store finder while these clients have one address each. So it
 * is opt-in per tenant and it lazy-loads — the script is only requested once
 * the section scrolls into view, so a visitor who never reaches the contact
 * block never pays for it.
 *
 * Nothing here is hardcoded: the location comes from the tenant's own
 * `firm_settings` row and its Place ID from `lib/premium-v2/places.ts`, which
 * is the same pair the rest of the site's maps already use.
 *
 * Needs a **Maps JavaScript API** key, which is not the same thing as the
 * Embed API key the iframe map uses — Locator Plus calls Maps JS and Places.
 * Without one it renders nothing and the caller falls back to the iframe.
 */

const JS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

/**
 * A vector Map ID from the Cloud console. `DEMO_MAP_ID` is Google's own
 * testing id — it works, but it is rate-limited and shows Google's styling
 * rather than the project's, so a real one belongs in the environment.
 */
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

const LIBRARY_SRC =
  "https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.15/index.min.js";

export interface LocatorLocation {
  title: string;
  address1: string;
  address2: string;
  coords: { lat: number; lng: number };
  placeId?: string;
}

/** Both values come from our own env, but an unescaped quote would still break the tag. */
function escapeAttr(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

export default function StoreLocatorV2({
  location,
  className = "h-[520px] w-full",
}: {
  location: LocatorLocation;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);

  // Only fetch the library once the block is close to the viewport.
  useEffect(() => {
    const node = hostRef.current;
    if (!node || inView) return;
    const observer = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setInView(true),
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);

  // `configureFromQuickBuilder` is the same call the console's export makes;
  // the shape below is that export's CONFIGURATION object.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    (async () => {
      await customElements.whenDefined("gmpx-store-locator");
      if (cancelled) return;
      const locator = hostRef.current?.querySelector("gmpx-store-locator") as
        | (HTMLElement & { configureFromQuickBuilder?: (config: unknown) => void })
        | null;
      locator?.configureFromQuickBuilder?.({
        locations: [location],
        mapOptions: {
          center: location.coords,
          fullscreenControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoom: 15,
          zoomControl: true,
          maxZoom: 18,
          mapId: MAP_ID,
        },
        mapsApiKey: JS_KEY,
        // All off, which resolves the component to its `basic` feature set.
        //
        // The richer sets exist for a chain: `intermediate` adds a "find a
        // location near you" search and `advanced` adds place details on top
        // of it. This client has one office, so the search asks a question
        // with one possible answer, and there is no way to take the details
        // without also taking the search. Basic shows the pin, the card and
        // the directions link, which is the whole of what a visitor to a
        // single address needs.
        capabilities: {
          input: false,
          autocomplete: false,
          directions: false,
          distanceMatrix: false,
          details: false,
          actions: false,
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, location]);

  if (!JS_KEY) return null;

  return (
    <div ref={hostRef} className={className}>
      {inView ? (
        <Script
          src={LIBRARY_SRC}
          type="module"
          strategy="lazyOnload"
          onReady={() => setReady(true)}
        />
      ) : null}

      {/* The component library styles itself through these custom properties;
          these are the Premium V2 tokens rather than the export's defaults, so
          the map matches the page it sits on. */}
      <style>{`
        gmpx-store-locator {
          width: 100%;
          height: 100%;
          --gmpx-color-surface: #fff;
          --gmpx-color-on-surface: var(--gp-ink, #18342c);
          --gmpx-color-on-surface-variant: var(--gp-muted, #718078);
          --gmpx-color-primary: var(--gp-forest-800, #17524c);
          --gmpx-color-outline: var(--gp-border, #d9d5ca);
          --gmpx-fixed-panel-width-row-layout: 26em;
          --gmpx-fixed-panel-height-column-layout: 60%;
          --gmpx-font-family-base: var(--font-sans, "Poppins", sans-serif);
          --gmpx-font-family-headings: var(--font-display, "Poppins", sans-serif);
          --gmpx-font-size-base: 0.875rem;
          --gmpx-hours-color-open: var(--gp-success, #78b69a);
          --gmpx-hours-color-closed: #b3261e;
          --gmpx-rating-color: var(--gp-gold-600, #d4af6c);
          --gmpx-rating-color-empty: var(--gp-border, #d9d5ca);
        }
      `}</style>

      {/* Injected as markup rather than JSX on purpose. `gmpx-api-loader` takes
          its API key in an attribute literally named `key`, and React treats
          `key` as its own reconciliation prop on every element — including a
          custom one — so written as JSX the attribute never reaches the DOM
          and the loader silently has no key. Both values here are our own
          environment, not user input. */}
      {inView ? (
        <div
          className="h-full w-full"
          dangerouslySetInnerHTML={{
            __html:
              `<gmpx-api-loader key="${escapeAttr(JS_KEY)}" solution-channel="GMP_QB_locatorplus_v11_c"></gmpx-api-loader>` +
              `<gmpx-store-locator map-id="${escapeAttr(MAP_ID)}" feature-set="basic"></gmpx-store-locator>`,
          }}
        />
      ) : null}
    </div>
  );
}
