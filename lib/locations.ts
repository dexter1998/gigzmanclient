/**
 * Location landing pages.
 *
 * Peer practices in the NCR run these as their main local-SEO surface, including
 * both "Gurgaon" and "Gurugram" spellings, which are searched separately.
 *
 * Each entry must carry genuinely local detail — jurisdiction, nearby business
 * districts, and what the firm actually does there. A set of near-identical pages
 * with only the city name swapped reads as doorway content and is a liability.
 */

export interface LocationPage {
  slug: string;
  city: string;
  /** Alternate spelling that shares this page, for copy and metadata. */
  alias?: string;
  headline: string;
  intro: string;
  areas: string[];
  jurisdictionNotes: string[];
  isPrimaryOffice: boolean;
}

export const LOCATION_PAGES: LocationPage[] = [
  {
    slug: "chartered-accountant-in-gurugram",
    city: "Gurugram",
    alias: "Gurgaon",
    headline: "Chartered accountancy services in Gurugram",
    intro:
      "The firm's office is in Sector 43, Gurugram, supporting individuals and businesses across the city with taxation, GST, audit and corporate compliance requirements.",
    areas: [
      "Sushant Lok and Sector 43",
      "DLF Phases I to V",
      "Golf Course Road and Golf Course Extension Road",
      "Udyog Vihar and Sector 18",
      "Cyber City and MG Road",
      "Sohna Road and Sectors 47 to 57",
    ],
    jurisdictionNotes: [
      "Companies and LLPs registered in Haryana file with the Registrar of Companies having jurisdiction over the state.",
      "Haryana levies professional tax considerations that differ from neighbouring states for employers operating here.",
      "GST registration is state-specific, so a business supplying from both Gurugram and Delhi generally requires registration in each.",
    ],
    isPrimaryOffice: true,
  },
  {
    slug: "chartered-accountant-in-delhi",
    city: "Delhi",
    headline: "Chartered accountancy services in Delhi",
    intro:
      "Support for individuals and businesses across Delhi with income tax, GST, audit and regulatory compliance, coordinated from the firm's Gurugram office.",
    areas: [
      "Connaught Place and central Delhi",
      "Nehru Place and south Delhi",
      "Okhla and Jasola",
      "Dwarka and west Delhi",
      "Karol Bagh and Rajouri Garden",
    ],
    jurisdictionNotes: [
      "Delhi is a separate state for GST purposes, requiring its own registration where taxable supplies are made from a place of business here.",
      "Entities registered in Delhi file with the Registrar of Companies having jurisdiction over the National Capital Territory.",
    ],
    isPrimaryOffice: false,
  },
  {
    slug: "chartered-accountant-in-noida",
    city: "Noida",
    headline: "Chartered accountancy services in Noida",
    intro:
      "Assistance for businesses and professionals in Noida and Greater Noida with recurring compliance, audit and advisory requirements.",
    areas: [
      "Sector 62 and Sector 63",
      "Sector 16 and Film City",
      "Noida Expressway sectors",
      "Greater Noida and Knowledge Park",
    ],
    jurisdictionNotes: [
      "Noida falls within Uttar Pradesh, which is a separate state for GST registration and for state-specific labour registrations.",
      "Businesses operating from both Noida and Gurugram typically hold separate GST registrations for each state.",
    ],
    isPrimaryOffice: false,
  },
];

export function findLocation(slug: string): LocationPage | undefined {
  return LOCATION_PAGES.find((l) => l.slug === slug);
}
