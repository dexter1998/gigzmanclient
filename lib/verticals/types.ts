/**
 * Per-vertical configuration.
 *
 * Everything that used to be hard-coded to a chartered-accountancy practice —
 * navigation, footer links, dashboard sidebar, sitemap paths, schema type —
 * lives here instead, keyed by `clients.vertical`. Adding a third vertical is a
 * new config file plus content, not a hunt through components.
 */

export type VerticalId = "cafirm" | "realestate";

export interface NavLink {
  label: string;
  /** Route relative to the tenant base, e.g. "/services". */
  path: string;
}

export interface ExternalLink {
  label: string;
  url: string;
}

export interface DashboardNavItem {
  label: string;
  path: string;
  /** Lucide icon name, resolved in DashboardChrome. */
  icon: string;
  adminOnly: boolean;
}

export interface SitemapPath {
  path: string;
  priority: number;
}

export interface VerticalConfig {
  id: VerticalId;
  label: string;
  /** Short description used on the template library card. */
  summary: string;

  /** schema.org type for the organisation JSON-LD. */
  schemaType: string;

  /** Primary site navigation. */
  nav: NavLink[];

  footer: {
    quickLinks: NavLink[];
    resourceLinks: NavLink[];
    /** Regulatory or reference portals relevant to the vertical. */
    externalLinks: ExternalLink[];
    legalSlugs: { label: string; slug: string }[];
    /** Regulatory notice rendered above the general disclaimer. */
    regulatoryNotice: string;
    /** Label for the registration number shown beside the business name. */
    registrationLabel: string;
  };

  dashboardNav: DashboardNavItem[];

  /** Static routes emitted into the sitemap. */
  sitemapPaths: SitemapPath[];

  /** Categories permitted in `services.category` for this vertical. */
  serviceCategories: { value: string; label: string }[];

  /** Calculator keys seeded for this vertical. */
  calculatorKeys: string[];

  /** Defaults applied when a client of this vertical is first seeded. */
  defaults: {
    reviewsEnabled: boolean;
  };
}
