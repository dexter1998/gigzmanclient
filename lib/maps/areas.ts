/**
 * The plot-map library: one entry per map asset in
 * `public/verticals/realestate/templates/premium-v2/maps`.
 *
 * `corridorSlug` points at the seeded locality rows, so a map page can carry
 * that corridor's tracked price and yield instead of being a bare image with a
 * heading. Where a map covers something the corridor set does not describe —
 * Manesar, Dharuhera, Pataudi, the Sohna master plan — it is left `null` and
 * the page simply omits the market block rather than borrowing figures from a
 * corridor the area is not on.
 *
 * `kind` drives the copy: a licensed colony, a numbered HUDA sector and a
 * city-wide master plan are asked about differently.
 */

export type AreaKind = "sector" | "colony" | "masterplan" | "industrial";

export interface MapArea {
  slug: string;
  name: string;
  kind: AreaKind;
  corridorSlug: string | null;
  /** One factual line about what the map covers. */
  blurb: string;
}

const GCR = "golf-course-road";
const SOHNA = "sohna-road";
const SPR = "southern-peripheral-road";
const NEWG = "new-gurugram";
const DWK = "dwarka-expressway";

export const MAP_AREAS: MapArea[] = [
  { slug: "masterplan", name: "Gurugram Master Plan", kind: "masterplan", corridorSlug: null, blurb: "The city-wide development plan showing sector boundaries, land use and the arterial road network." },
  { slug: "sohna-masterplan", name: "Sohna Master Plan", kind: "masterplan", corridorSlug: null, blurb: "Sector layout and land use for Sohna, south of Gurugram along the Sohna Road corridor." },

  { slug: "dlf-phase-1", name: "DLF Phase 1", kind: "colony", corridorSlug: GCR, blurb: "One of Gurugram's oldest licensed colonies — plot sizes, block letters and the school, green and commercial reservations." },
  { slug: "dlf-phase-2", name: "DLF Phase 2", kind: "colony", corridorSlug: GCR, blurb: "Plotted colony adjoining the Cyber City side, with the plot schedule and block layout." },
  { slug: "dlf-phase-3", name: "DLF Phase 3", kind: "colony", corridorSlug: GCR, blurb: "Mixed residential and office pocket next to Cyber City, showing plot numbering by block." },
  { slug: "dlf-phase-4", name: "DLF Phase 4", kind: "colony", corridorSlug: GCR, blurb: "Central, walkable colony of builder floors and older houses, with block-wise plot numbers." },
  { slug: "dlf-phase-5", name: "DLF Phase 5", kind: "colony", corridorSlug: GCR, blurb: "Premium Golf Course Road pocket covering both condominium sites and plotted blocks." },
  { slug: "dlf-alameda", name: "DLF Alameda", kind: "colony", corridorSlug: SOHNA, blurb: "Plotted township off the Sohna side, with plot sizes and internal road layout." },
  { slug: "dlf-garden-city", name: "DLF Garden City", kind: "colony", corridorSlug: NEWG, blurb: "New Gurugram plotted development, showing the phase and block structure." },
  { slug: "emerald-floors", name: "Emerald Floors", kind: "colony", corridorSlug: GCR, blurb: "Independent-floor pocket within the DLF belt, with unit and block numbering." },

  { slug: "sushant-lok-1", name: "Sushant Lok 1", kind: "colony", corridorSlug: GCR, blurb: "Large established colony with strong rental demand — block letters and plot schedule." },
  { slug: "sushant-lok-2", name: "Sushant Lok 2", kind: "colony", corridorSlug: SOHNA, blurb: "Residential pocket off the Sohna Road side, with block-wise plot layout." },
  { slug: "sushant-lok-3", name: "Sushant Lok 3", kind: "colony", corridorSlug: SOHNA, blurb: "Plotted and builder-floor stock near Sector 57, with plot numbering." },
  { slug: "sushant-lok-4", name: "Sushant Lok 4", kind: "colony", corridorSlug: SPR, blurb: "The newest Sushant Lok phase, on the Golf Course Extension side." },

  { slug: "south-city-1", name: "South City 1", kind: "colony", corridorSlug: GCR, blurb: "Older planned colony of independent houses, with plot sizes by block." },
  { slug: "south-city-2", name: "South City 2", kind: "colony", corridorSlug: SOHNA, blurb: "Large plotted colony on the Sohna Road side, with the full block layout." },
  { slug: "malibu-town", name: "Malibu Towne", kind: "colony", corridorSlug: SOHNA, blurb: "Gated community of independent villas, showing plot sizes and internal roads." },
  { slug: "nirvana-country", name: "Nirvana Country", kind: "colony", corridorSlug: SOHNA, blurb: "Gated township of villas and floors off Sohna Road, block by block." },
  { slug: "rosewood-city", name: "Rosewood City", kind: "colony", corridorSlug: SOHNA, blurb: "Plotted and floor stock near Sector 49, with the sector-wise block layout." },
  { slug: "mayfield-garden", name: "Mayfield Garden", kind: "colony", corridorSlug: SOHNA, blurb: "Residential colony in the Sector 50–51 belt, with plot numbering." },
  { slug: "greenwood-city", name: "Greenwood City", kind: "colony", corridorSlug: SOHNA, blurb: "Established plotted colony with block letters and plot sizes." },
  { slug: "suncity", name: "Suncity", kind: "colony", corridorSlug: GCR, blurb: "Plotted colony in the Sector 54 belt, with block-wise plot schedule." },
  { slug: "uppal-southend", name: "Uppal Southend", kind: "colony", corridorSlug: SOHNA, blurb: "Villa and floor township in Sector 49, with the internal plot layout." },
  { slug: "vipul-world", name: "Vipul World", kind: "colony", corridorSlug: SOHNA, blurb: "Township on the Sohna Road side covering plotted and apartment sites." },
  { slug: "saraswati-vihar", name: "Saraswati Vihar", kind: "colony", corridorSlug: GCR, blurb: "Older residential colony in the city core, with plot numbering." },
  { slug: "anant-raj-estate", name: "Anant Raj Estate", kind: "colony", corridorSlug: SPR, blurb: "Plotted township on the Southern Peripheral Road side, with the phase layout." },
  { slug: "bptp-amstoria", name: "BPTP Amstoria", kind: "colony", corridorSlug: DWK, blurb: "Plotted township on the Dwarka Expressway corridor, with block and plot sizes." },
  { slug: "raheja", name: "Raheja", kind: "colony", corridorSlug: NEWG, blurb: "Raheja's plotted development in the New Gurugram belt." },

  { slug: "vatika-1", name: "Vatika India Next 1", kind: "colony", corridorSlug: NEWG, blurb: "First phase of the Vatika township in New Gurugram, with block layout." },
  { slug: "vatika-2", name: "Vatika India Next 2", kind: "colony", corridorSlug: NEWG, blurb: "Second phase of the Vatika township, showing plot sizes by block." },
  { slug: "vatika-3", name: "Vatika India Next 3", kind: "colony", corridorSlug: NEWG, blurb: "Third phase of the Vatika township in the New Gurugram sectors." },
  { slug: "vatika-4", name: "Vatika India Next 4", kind: "colony", corridorSlug: NEWG, blurb: "Fourth phase of the Vatika township, with the internal road and plot plan." },
  { slug: "vatika-5", name: "Vatika India Next 5", kind: "colony", corridorSlug: NEWG, blurb: "Fifth phase of the Vatika township, with block-wise plot numbering." },

  { slug: "sector-4", name: "Sector 4", kind: "sector", corridorSlug: SOHNA, blurb: "Old Gurugram HUDA sector — plot numbers, block letters and reserved sites." },
  { slug: "sector-5", name: "Sector 5", kind: "sector", corridorSlug: SOHNA, blurb: "Established HUDA sector near the older city core, with the plot schedule." },
  { slug: "sector-7", name: "Sector 7", kind: "sector", corridorSlug: SOHNA, blurb: "HUDA sector in old Gurugram, with block-wise plot layout." },
  { slug: "sector-7-ext", name: "Sector 7 Extension", kind: "sector", corridorSlug: SOHNA, blurb: "The extension block of Sector 7, with its own plot numbering." },
  { slug: "sector-9", name: "Sector 9", kind: "sector", corridorSlug: SOHNA, blurb: "HUDA sector with residential plots and reserved school and green sites." },
  { slug: "sector-9a", name: "Sector 9A", kind: "sector", corridorSlug: SOHNA, blurb: "The 9A block, with plot sizes and internal road layout." },
  { slug: "sector-10", name: "Sector 10", kind: "sector", corridorSlug: SOHNA, blurb: "HUDA sector on the older Gurugram side, block by block." },
  { slug: "sector-10a", name: "Sector 10A", kind: "sector", corridorSlug: SOHNA, blurb: "The 10A block, with its plot schedule and reservations." },
  { slug: "sector-12a", name: "Sector 12A", kind: "sector", corridorSlug: SOHNA, blurb: "HUDA sector layout with plot numbering and land use." },
  { slug: "sector-14", name: "Sector 14", kind: "sector", corridorSlug: SOHNA, blurb: "Central HUDA sector close to the old city market, with the plot plan." },
  { slug: "sector-15-i", name: "Sector 15 Part 1", kind: "sector", corridorSlug: SOHNA, blurb: "First part of Sector 15, with block letters and plot sizes." },
  { slug: "sector-15-ii", name: "Sector 15 Part 2", kind: "sector", corridorSlug: SOHNA, blurb: "Second part of Sector 15, with its own plot numbering." },
  { slug: "sector-17", name: "Sector 17", kind: "sector", corridorSlug: SOHNA, blurb: "Mixed residential and commercial HUDA sector, with the plot layout." },
  { slug: "sector-21", name: "Sector 21", kind: "sector", corridorSlug: SOHNA, blurb: "HUDA sector with residential plots and reserved sites." },
  { slug: "sector-22", name: "Sector 22", kind: "sector", corridorSlug: SOHNA, blurb: "Established HUDA sector, block by block with plot sizes." },
  { slug: "sector-23", name: "Sector 23", kind: "sector", corridorSlug: SOHNA, blurb: "HUDA sector layout with plot numbering and land-use reservations." },
  { slug: "sector-23a", name: "Sector 23A", kind: "sector", corridorSlug: SOHNA, blurb: "The 23A block, with its plot schedule." },
  { slug: "sector-27-28", name: "Sector 27 & 28", kind: "sector", corridorSlug: GCR, blurb: "Two adjoining central sectors near MG Road, with plot layout." },
  { slug: "sector-29", name: "Sector 29", kind: "sector", corridorSlug: GCR, blurb: "Gurugram's central commercial and leisure sector, with the site plan." },
  { slug: "sector-31", name: "Sector 31", kind: "sector", corridorSlug: GCR, blurb: "Central HUDA sector with residential plots and reserved sites." },
  { slug: "sector-31-32a", name: "Sector 31 & 32A", kind: "sector", corridorSlug: GCR, blurb: "The 31 and 32A blocks together, with plot numbering." },
  { slug: "sector-32-33-34", name: "Sector 32, 33 & 34", kind: "sector", corridorSlug: GCR, blurb: "Three adjoining sectors shown on one sheet, with block layout." },
  { slug: "sector-34", name: "Sector 34", kind: "sector", corridorSlug: GCR, blurb: "HUDA sector with residential and institutional reservations." },
  { slug: "sector-38", name: "Sector 38", kind: "sector", corridorSlug: SOHNA, blurb: "Sector on the Sohna Road belt, with the plot schedule." },
  { slug: "sector-39", name: "Sector 39", kind: "sector", corridorSlug: SOHNA, blurb: "HUDA sector layout with plot numbering." },
  { slug: "sector-40", name: "Sector 40", kind: "sector", corridorSlug: SOHNA, blurb: "Residential HUDA sector, block by block." },
  { slug: "sector-42", name: "Sector 42", kind: "sector", corridorSlug: GCR, blurb: "Golf Course Road sector with plotted and institutional sites." },
  { slug: "sector-43", name: "Sector 43", kind: "sector", corridorSlug: GCR, blurb: "Premium Golf Course Road sector, with the plot layout." },
  { slug: "sector-44", name: "Sector 44", kind: "sector", corridorSlug: GCR, blurb: "Mixed office and residential sector off Golf Course Road." },
  { slug: "sector-45", name: "Sector 45", kind: "sector", corridorSlug: GCR, blurb: "Residential HUDA sector, with block letters and plot sizes." },
  { slug: "sector-46", name: "Sector 46", kind: "sector", corridorSlug: GCR, blurb: "Established residential sector, with the plot schedule and reservations." },
  { slug: "sector-47", name: "Sector 47", kind: "sector", corridorSlug: SOHNA, blurb: "Sector on the Sohna Road side, with block-wise plot numbering." },
  { slug: "sector-51", name: "Sector 51", kind: "sector", corridorSlug: SOHNA, blurb: "Residential sector in the Sohna Road belt, with plot layout." },
  { slug: "sector-52", name: "Sector 52", kind: "sector", corridorSlug: GCR, blurb: "Sector adjoining the Golf Course Road stretch, with the plot plan." },
  { slug: "sector-55-56", name: "Sector 55 & 56", kind: "sector", corridorSlug: GCR, blurb: "Two adjoining Golf Course Road sectors on one sheet." },
  { slug: "sector-57", name: "Sector 57", kind: "sector", corridorSlug: GCR, blurb: "Large residential sector at the end of the Golf Course Road stretch." },

  { slug: "pace-city-1", name: "Pace City 1", kind: "industrial", corridorSlug: null, blurb: "Industrial estate layout with plot sizes and internal roads." },
  { slug: "pace-city-2", name: "Pace City 2", kind: "industrial", corridorSlug: null, blurb: "Second Pace City industrial estate, with the plot schedule." },
  { slug: "udyog-vihar", name: "Udyog Vihar", kind: "industrial", corridorSlug: null, blurb: "Gurugram's oldest industrial estate, phase by phase with plot numbering." },
  { slug: "manesar", name: "Manesar", kind: "sector", corridorSlug: null, blurb: "IMT Manesar sector layout covering industrial and residential land use." },
  { slug: "dharuhera", name: "Dharuhera", kind: "sector", corridorSlug: null, blurb: "Dharuhera sector plan on the Rewari side of the NH-48 corridor." },
  { slug: "pataudi-sector-1", name: "Pataudi Sector 1", kind: "sector", corridorSlug: null, blurb: "Sector 1 layout for Pataudi, west of Gurugram." },
];

export function findMapArea(slug: string): MapArea | undefined {
  return MAP_AREAS.find((a) => a.slug === slug);
}

export function mapImageSrc(slug: string): string {
  return `/verticals/realestate/templates/premium-v2/maps/${slug}.webp`;
}

export const AREA_KIND_LABELS: Record<AreaKind, string> = {
  sector: "HUDA sector",
  colony: "Licensed colony",
  masterplan: "Master plan",
  industrial: "Industrial estate",
};
