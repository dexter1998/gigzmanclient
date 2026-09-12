/**
 * Geography the listings do not name.
 *
 * The scrape knows 54 localities. People search for more than that: the roads
 * the belt is strung along ("farm house on gurgaon faridabad road"), landmarks
 * near it ("farmhouse near damdama lake", "…near westin sohna", "farm house
 * for sale near sultanpur bird sanctuary"), villages that trade but had no row
 * on the day of the scrape (Farukh Nagar, Naurangpur, Pataudi), and pincodes
 * ("122103 pin code sohna"). MagicBricks publishes 138 Gurgaon farm and
 * agri-land geo pages against our 54, and most of the difference is roads.
 *
 * A page for one of these can still be written from real data, because none of
 * them is anywhere new — every one of them sits among pockets we do have
 * numbers for. So each geo resolves to a set of village slugs and the page
 * aggregates those, saying plainly which pockets the figures came from. A road
 * page reports the pockets it runs through; a landmark page reports the
 * pockets within a few kilometres of it, computed from the villages' own
 * centroids.
 *
 * Roads and adjacent villages carry a hand-authored pocket list rather than a
 * computed one: where a road runs is a fact about the road, not something a
 * centroid can be asked.
 */
import { VILLAGES, type MarketStats, type VillageRow } from "@/lib/premium-v2/farm-market.data";

export interface RoadGeo {
  slug: string;
  name: string;
  /** Village slugs this road runs through or along. */
  pockets: string[];
  /** One line on what the road is and why it matters to a buyer. */
  note: string;
}

/**
 * Roads and corridors, taken from the geo units MagicBricks publishes farm and
 * agri-land pages for in Gurgaon, filtered to the ones that actually touch the
 * farm belt. Each is mapped to the pockets it runs through.
 */
export const ROADS: RoadGeo[] = [
  {
    slug: "sohna-mandkola-road",
    name: "Sohna Mandkola Road",
    pockets: ["sohna", "nimot", "jakhopur"],
    note: "Runs south-east out of Sohna towards Palwal. Cheaper per square foot than the Gurugram side, and further from everything.",
  },
  {
    slug: "sohna-ballabgarh-road",
    name: "Sohna Ballabgarh Road",
    pockets: ["sohna", "bhadashpur-tethar", "abhepur"],
    note: "East from Sohna towards Ballabgarh and the Faridabad side. Useful when guests are coming from the east rather than from Gurugram.",
  },
  {
    slug: "palwal-sohna-road",
    name: "Palwal Sohna Road",
    pockets: ["sohna", "imt-sohna", "jakhopur"],
    note: "The Palwal approach. Industrial in stretches, agricultural in others, and priced accordingly.",
  },
  {
    slug: "badshahpur-sohna-road",
    name: "Badshahpur Sohna Road",
    pockets: ["badshahpur", "sohna-road", "bhondsi"],
    note: "Where the city stops being city. The last stretch before the belt proper, and the most built-up part of it.",
  },
  {
    slug: "golf-course-extension-road",
    name: "Golf Course Extension Road",
    pockets: ["golf-course-ext-road", "sector-58-gurgaon", "sector-63a-gurgaon", "badshahpur"],
    note: "The city corridor closest to the belt. Twenty minutes to Bhondsi, which is why weekday bookings come from here.",
  },
  {
    slug: "golf-course-road",
    name: "Golf Course Road",
    pockets: ["sector-42-gurgaon", "sector-67-gurgaon", "golf-course-ext-road"],
    note: "Not a farm corridor itself — it is where a large share of the belt's buyers live, and the drive they measure everything against.",
  },
  {
    slug: "southern-peripheral-road",
    name: "Southern Peripheral Road",
    pockets: ["sector-77-gurgaon", "sector-58-gurgaon", "badshahpur"],
    note: "Links the Sohna and Dwarka sides without going through the city, which matters on a Friday evening.",
  },
  {
    slug: "delhi-mumbai-expressway",
    name: "Delhi–Mumbai Expressway",
    pockets: ["near-delhi-mumbai-expressway-exit", "sohna", "imt-sohna", "jakhopur"],
    note: "The single reason land in this belt has moved in the last five years. The Sohna interchange is what a land buyer here is really betting on.",
  },
  {
    slug: "kmp-expressway",
    name: "KMP / Western Peripheral Expressway",
    pockets: ["manesar", "garhi-harsaru", "bilaspur", "pachgaon"],
    note: "Runs west of the belt. The Manesar and Garhi Harsaru pockets sit closest to it, which is where industrial demand competes with farm demand.",
  },
  {
    slug: "nh-48",
    name: "NH-48",
    pockets: ["manesar", "sector-8-imt-manesar", "hayatpur", "khalilpur"],
    note: "The Delhi–Jaipur highway. Fast, loud, and the reason the Manesar pockets price differently from the Sohna ones.",
  },
  {
    slug: "dwarka-expressway",
    name: "Dwarka Expressway",
    pockets: ["sector-88b-gurgaon", "sector-95-gurgaon", "dhankot", "budhera"],
    note: "The northern approach. Better for anyone coming from Delhi's west or the airport than the Sohna side is.",
  },
  {
    slug: "mehrauli-gurgaon-road",
    name: "Mehrauli Gurgaon Road",
    pockets: ["gwal-pahari", "baliawas", "mg-road"],
    note: "The old road in from South Delhi, and still the most direct one to the Aravali edge of the belt.",
  },
  {
    slug: "jhajjar-road",
    name: "Jhajjar Road",
    pockets: ["dhankot", "budhera", "chandu", "iqbalpur"],
    note: "North-west out of Gurugram. Agricultural land rather than built farmhouses, and priced for holding rather than using.",
  },
  {
    slug: "sultanpur-road",
    name: "Sultanpur Road",
    pockets: ["sultanpur", "chandu", "iqbalpur", "budhera"],
    note: "Runs past the bird sanctuary. Protected land nearby keeps the surroundings open, which is rare this close to the city.",
  },
  {
    slug: "manesar-road",
    name: "Manesar Road",
    pockets: ["manesar", "naurangpur", "sector-8-imt-manesar", "panchgaon"],
    note: "Industrial at one end and agricultural at the other, so what you are buying changes sharply over a few kilometres.",
  },
  {
    slug: "garhi-harsaru-road",
    name: "Garhi Harsaru Road",
    pockets: ["garhi-harsaru", "hayatpur", "dhankot"],
    note: "Between the Dwarka and Pataudi corridors. Well connected, and the pocket where farm land competes with warehousing.",
  },
  {
    slug: "gurgaon-alwar-road",
    name: "Gurgaon Alwar Road",
    pockets: ["sohna", "hassanpur-tauru", "khalilpur", "bilaspur"],
    note: "South-west out of Sohna towards Alwar. The cheapest agricultural land within reach of Gurugram, and the longest horizon on it.",
  },
  {
    slug: "tauru-road",
    name: "Tauru Road",
    pockets: ["hassanpur-tauru", "bilaspur", "pachgaon", "manesar"],
    note: "Connects the Manesar side to the Nuh district line. Bare land, low entry, and paperwork that needs reading twice.",
  },
  {
    slug: "sohna-badshahpur-highway",
    name: "Sohna Badshahpur Highway",
    pockets: ["badshahpur", "bhondsi", "sohna-road", "aklimpur"],
    note: "The stretch that carries the belt's weekday traffic. Convenient rather than remote, and priced for the drive.",
  },
  {
    slug: "damdama-road",
    name: "Damdama Road",
    pockets: ["sohna", "raiseena", "tikli", "aklimpur"],
    note: "Past Sohna towards the lake. Real tree cover, a few degrees cooler, and the best of the belt for an overnight stay.",
  },
];

export interface LandmarkGeo {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  note: string;
}

/**
 * Landmarks people navigate the belt by. Coordinates are the landmark's own;
 * the pockets a page reports are computed from them, so a landmark page never
 * claims to have listings *at* the landmark — it reports what is near it.
 */
export const LANDMARKS: LandmarkGeo[] = [
  { slug: "the-westin-sohna", name: "The Westin Sohna Resort & Spa", lat: 28.2400, lng: 77.1400, note: "The centre of the belt, and where our own office sits." },
  { slug: "damdama-lake", name: "Damdama Lake", lat: 28.2760, lng: 77.1030, note: "The Aravali edge. Cooler, greener, and fifteen minutes further than the main cluster." },
  { slug: "sultanpur-bird-sanctuary", name: "Sultanpur Bird Sanctuary", lat: 28.4600, lng: 76.8930, note: "Protected land keeps the surroundings open, which is unusual this close to Gurugram." },
  { slug: "sohna-sulphur-springs", name: "Sohna Sulphur Springs", lat: 28.2470, lng: 77.0650, note: "Sohna town itself. Everything within a few kilometres of here is the belt's deepest supply." },
  { slug: "bhondsi-nature-camp", name: "Bhondsi Nature Camp", lat: 28.3510, lng: 77.0610, note: "The shortest run from the city side, and the easiest address to give guests." },
  { slug: "aravalli-biodiversity-park", name: "Aravalli Biodiversity Park", lat: 28.4560, lng: 77.1020, note: "The city end of the ridge. Useful as a reference point rather than a place to buy." },
  { slug: "rajiv-chowk-gurugram", name: "Rajiv Chowk, Gurugram", lat: 28.4390, lng: 77.0290, note: "Where the drive to the belt is measured from — about 25 km to the Westin cluster." },
  { slug: "imt-manesar", name: "IMT Manesar", lat: 28.3670, lng: 76.9380, note: "Industrial demand sits next to farm demand here, which shows in the price." },
  { slug: "pataudi-palace", name: "Pataudi Palace", lat: 28.3230, lng: 76.7790, note: "The far western end. Cheapest land within reach of Gurugram, and the longest drive." },
  { slug: "sohna-interchange", name: "Sohna Interchange, Delhi–Mumbai Expressway", lat: 28.2100, lng: 77.0700, note: "The infrastructure the whole belt's appreciation story rests on." },
  { slug: "vatika-city", name: "Vatika City, Sohna Road", lat: 28.4090, lng: 77.0330, note: "Where the city corridor ends and the run to the belt begins." },
  { slug: "gwal-pahari", name: "Gwal Pahari", lat: 28.4350, lng: 77.1450, note: "On the Faridabad road through the Aravalis — tight supply, high prices." },
  { slug: "badshahpur-chowk", name: "Badshahpur Chowk", lat: 28.3910, lng: 77.0480, note: "The last real junction before the belt, and the traffic everyone plans around." },
  { slug: "kherki-daula-toll", name: "Kherki Daula Toll", lat: 28.4130, lng: 76.9880, note: "The NH-48 marker. Manesar-side pockets are measured from here." },
  { slug: "medanta-medicity", name: "Medanta – The Medicity", lat: 28.4390, lng: 77.0410, note: "The hospital buyers ask about when the farmhouse is a second home rather than a weekend one." },
  { slug: "gd-goenka-university", name: "GD Goenka University, Sohna", lat: 28.2650, lng: 77.0180, note: "On the Sohna road. The one institution that puts weekday traffic on this stretch." },
  { slug: "raisina-hills", name: "Raisina Hills, Sohna", lat: 28.3240, lng: 77.0280, note: "The Aravali ridge pocket — big plots, thin supply, and the belt's best views." },
  { slug: "tikli-village", name: "Tikli", lat: 28.3580, lng: 77.0280, note: "Small, quiet, and close enough to Bhondsi to be an easy drive." },
  { slug: "manesar-toll-plaza", name: "Manesar Toll Plaza", lat: 28.3540, lng: 76.9330, note: "The western gateway, and the reference point for anyone coming from the airport." },
  { slug: "sohna-bus-stand", name: "Sohna Bus Stand", lat: 28.2480, lng: 77.0640, note: "Sohna town centre — the practical middle of the belt for anything you need on a weekend." },
  { slug: "hero-honda-chowk", name: "Hero Honda Chowk", lat: 28.4340, lng: 76.9900, note: "Where the NH-48 and city traffic meet. Worth avoiding on the way out." },
  { slug: "sector-56-gurugram", name: "Sector 56, Gurugram", lat: 28.4210, lng: 77.1000, note: "A common starting point for the Golf Course Extension run into the belt." },
  { slug: "faridabad", name: "Faridabad", lat: 28.3800, lng: 77.2100, note: "Forty minutes to the belt from anywhere in Faridabad on the Gurgaon road." },
  { slug: "nuh-road-junction", name: "Nuh Road Junction", lat: 28.2100, lng: 77.0200, note: "South-west of Sohna. Cheapest agricultural land in the district, and the longest horizon." },
  { slug: "sohna-elevated-road", name: "Sohna Elevated Road", lat: 28.3400, lng: 77.0400, note: "The piece of road that repriced the whole belt when it opened." },
  { slug: "vatika-westin-farms", name: "Vatika Westin Farms", lat: 28.2380, lng: 77.1430, note: "The estate itself — 259 of the belt's 442 listings sit inside it." },
  { slug: "gurugram-railway-station", name: "Gurugram Railway Station", lat: 28.4770, lng: 77.0140, note: "Old Gurgaon side. Relevant to the Pataudi and Jhajjar road pockets rather than to Sohna." },
  { slug: "igi-airport", name: "IGI Airport", lat: 28.5560, lng: 77.1000, note: "About fifty minutes to Manesar, an hour and a quarter to the Sohna cluster." },
  { slug: "cyber-city", name: "Cyber City, Gurugram", lat: 28.4950, lng: 77.0890, note: "Forty minutes on the elevated corridor, which is why weekday offsites work here." },
  { slug: "south-delhi", name: "South Delhi", lat: 28.5245, lng: 77.2066, note: "About an hour via Mehrauli–Gurgaon Road, longer on a Friday evening." },
  { slug: "delhi-ncr", name: "Delhi NCR", lat: 28.6139, lng: 77.2090, note: "An hour from South Delhi, ninety minutes from the centre, and about the same from Noida via the Faridabad road." },
  { slug: "gurgaon", name: "Gurgaon", lat: 28.4595, lng: 77.0266, note: "Twenty-five kilometres from Rajiv Chowk on the Sohna elevated road — under an hour outside peak hours." },
  { slug: "golf-course-road", name: "Golf Course Road", lat: 28.4460, lng: 77.0990, note: "Twenty minutes to Bhondsi, closer to forty to the Westin cluster." },
  { slug: "dwarka-expressway", name: "Dwarka Expressway", lat: 28.4900, lng: 76.9800, note: "Better served by the Manesar side than by Sohna — roughly the same distance, an easier road." },
  { slug: "noida", name: "Noida", lat: 28.5355, lng: 77.3910, note: "Ninety minutes via the Faridabad road, which is the sensible route rather than crossing Delhi." },
  { slug: "manesar", name: "Manesar", lat: 28.3540, lng: 76.9430, note: "Twenty minutes to the Manesar farm pockets, an hour across to Sohna." },
  { slug: "delhi-mumbai-expressway", name: "Delhi–Mumbai Expressway", lat: 28.2100, lng: 77.0700, note: "The Sohna interchange is the reason land here has moved at all in the last five years." },
  { slug: "kmp-expressway", name: "KMP Expressway", lat: 28.3300, lng: 76.8700, note: "Runs west of the belt; the Manesar and Garhi Harsaru pockets sit closest to it." },
];

export interface AdjacentGeo {
  slug: string;
  name: string;
  /** Village slugs whose figures stand in for this one, nearest first. */
  pockets: string[];
  note: string;
}

/**
 * Villages that trade in this market but had no row on the day of the scrape.
 * Taken from the localities MagicBricks publishes farm or agri-land pages for
 * in Gurgaon. A page here says plainly that we hold no listing in it today and
 * reports the pockets next to it instead — which is a more useful answer than
 * a portal's empty result page.
 */
export const ADJACENT: AdjacentGeo[] = [
  { slug: "farukh-nagar", name: "Farukh Nagar", pockets: ["garhi-harsaru", "hayatpur", "dhankot"], note: "West of Gurugram on the Jhajjar side, historic and largely agricultural." },
  { slug: "pataudi", name: "Pataudi", pockets: ["hayatpur", "sector-95-gurgaon", "khalilpur"], note: "The far west of the district. Cheapest land within an hour of Gurugram." },
  { slug: "haileymandi", name: "Haileymandi", pockets: ["hayatpur", "khalilpur", "pataudi-road"], note: "Beside Pataudi on the same road, and priced similarly." },
  { slug: "sadhrana", name: "Sadhrana", pockets: ["manesar", "naurangpur", "panchgaon"], note: "Manesar side, where industrial and farm demand overlap." },
  { slug: "silani", name: "Silani", pockets: ["manesar", "naurangpur", "sector-8-imt-manesar"], note: "Small pocket off the Manesar road." },
  { slug: "khaintawas", name: "Khaintawas", pockets: ["manesar", "pachgaon", "khalilpur"], note: "South-west of Manesar towards the district edge." },
  { slug: "kherla", name: "Kherla", pockets: ["manesar", "pachgaon", "naurangpur"], note: "Agricultural, off the Manesar–Tauru stretch." },
  { slug: "daboda", name: "Daboda", pockets: ["dhankot", "budhera", "chandu"], note: "North-west, on the Jhajjar road." },
  { slug: "tikri", name: "Tikri", pockets: ["dhankot", "budhera", "iqbalpur"], note: "Jhajjar road pocket, bare land rather than built farmhouses." },
  { slug: "bhalkhi-majra", name: "Bhalkhi Majra", pockets: ["manesar", "naurangpur", "hayatpur"], note: "Between Manesar and the Pataudi road." },
  { slug: "sidhrawali", name: "Sidhrawali", pockets: ["manesar", "khalilpur", "pachgaon"], note: "On NH-48 towards Bilaspur, industrial-adjacent." },
  { slug: "bissar-akbarpur", name: "Bissar Akbarpur", pockets: ["manesar", "sector-8-imt-manesar", "naurangpur"], note: "IMT Manesar's agricultural fringe." },
  { slug: "kherki-daula", name: "Kherki Daula", pockets: ["sector-88b-gurgaon", "sector-95-gurgaon", "hayatpur"], note: "The NH-48 toll pocket, more commercial than farm." },
  { slug: "bandhwari-village", name: "Bandhwari Village", pockets: ["bandhwari", "gwal-pahari", "baliawas"], note: "On the Gurgaon–Faridabad road, inside the Aravali stretch." },
  { slug: "tauru", name: "Tauru", pockets: ["hassanpur-tauru", "bilaspur", "pachgaon"], note: "South-west towards Nuh, the cheapest end of the belt." },
  { slug: "nuh", name: "Nuh", pockets: ["hassanpur-tauru", "khalilpur", "bilaspur"], note: "Beyond the district line. Long horizon, low entry, and the most paperwork." },
  { slug: "alipur-sohna", name: "Alipur", pockets: ["sohna", "raiseena", "tikli"], note: "Aravali edge above Sohna, one of the greener pockets." },
  { slug: "karnki", name: "Karnki", pockets: ["sohna", "sohna-road", "raiseena"], note: "The village the Westin estate stands on — and the one our family is from." },
  { slug: "ghamroj", name: "Ghamroj", pockets: ["bhondsi", "sohna-road", "aklimpur"], note: "Between Bhondsi and Sohna on the main road." },
  { slug: "damdama-village", name: "Damdama Village", pockets: ["sohna", "raiseena", "tikli"], note: "Beside the lake. The belt's best tree cover." },
  { slug: "berka", name: "Berka", pockets: ["sohna", "aklimpur", "garat-pur-bas"], note: "Off the Sohna–Damdama stretch." },
  { slug: "lakhuwas", name: "Lakhuwas", pockets: ["sohna", "nimot", "jakhopur"], note: "South of Sohna on the Mandkola side." },
  { slug: "mohammadpur-gujjar", name: "Mohammadpur Gujjar", pockets: ["sohna", "abhepur", "bhadashpur-tethar"], note: "East of Sohna towards Ballabgarh." },
  { slug: "raipur-sohna", name: "Raipur", pockets: ["sohna", "raiseena", "garat-pur-bas"], note: "Small Sohna-belt village with mostly bare land." },
  { slug: "sancholi", name: "Sancholi", pockets: ["sohna", "jakhopur", "imt-sohna"], note: "Towards the IMT Sohna side." },
  { slug: "hariyahera", name: "Hariyahera", pockets: ["sohna", "imt-sohna", "nimot"], note: "Industrial-adjacent Sohna pocket." },
  { slug: "chhapera", name: "Chhapera", pockets: ["sohna", "aklimpur", "tikli"], note: "Between Sohna and the ridge." },
  { slug: "sohna-sector-2", name: "Sohna Sector 2", pockets: ["sohna", "sector-36-sohna", "sector-5-sohna"], note: "Sohna's own sector grid — plotted development rather than farm land." },
  { slug: "sohna-sector-11", name: "Sohna Sector 11", pockets: ["sohna", "sector-5-sohna", "sector-36-sohna"], note: "Part of the Sohna master plan area." },
  { slug: "sohna-sector-14", name: "Sohna Sector 14", pockets: ["sohna", "sector-36-sohna", "imt-sohna"], note: "Sohna sector land, adjacent to the farm belt rather than in it." },
];

export interface PincodeGeo {
  code: string;
  name: string;
  pockets: string[];
}

/** Belt pincodes. "122103 pin code sohna" and its variants are real queries. */
export const PINCODES: PincodeGeo[] = [
  { code: "122103", name: "Sohna", pockets: ["sohna", "sohna-road", "raiseena", "tikli"] },
  { code: "122102", name: "Manesar", pockets: ["manesar", "sector-8-imt-manesar", "naurangpur"] },
  { code: "122101", name: "Bhondsi", pockets: ["bhondsi", "badshahpur", "aklimpur"] },
  { code: "122001", name: "Gurugram (Old City)", pockets: ["mg-road", "block-c-sheetla-colony", "sector-42-gurgaon"] },
  { code: "122002", name: "Gurugram (DLF)", pockets: ["golf-course-ext-road", "sector-42-gurgaon", "block-a-south-city-2"] },
  { code: "122004", name: "Gurugram (Sushant Lok)", pockets: ["sector-42-gurgaon", "sector-62-gurgaon", "sector-67-gurgaon"] },
  { code: "122011", name: "Gurugram (Sector 56)", pockets: ["sector-58-gurgaon", "sector-63a-gurgaon", "sector-62-gurgaon"] },
  { code: "122018", name: "Gurugram (Sector 77–95)", pockets: ["sector-77-gurgaon", "sector-95-gurgaon", "sector-95b-gurgaon"] },
  { code: "122006", name: "Gurugram (Sector 104–115)", pockets: ["sector-88b-gurgaon", "sector-95-gurgaon", "dhankot"] },
  { code: "122505", name: "Farukh Nagar", pockets: ["garhi-harsaru", "dhankot", "budhera"] },
  { code: "122503", name: "Pataudi", pockets: ["hayatpur", "khalilpur", "pataudi-road"] },
  { code: "122413", name: "Bilaspur", pockets: ["bilaspur", "pachgaon", "khalilpur"] },
  { code: "122105", name: "Tauru", pockets: ["hassanpur-tauru", "bilaspur", "khalilpur"] },
  { code: "122107", name: "Nuh", pockets: ["hassanpur-tauru", "khalilpur", "bilaspur"] },
  { code: "121004", name: "Gurgaon–Faridabad Road", pockets: ["gurgaon-faridabad-road", "bandhwari", "gwal-pahari"] },
];

// ── Aggregation ──────────────────────────────────────────────────────

const BY_SLUG = new Map(VILLAGES.map((v) => [v.slug, v]));

/** Merges several pockets' figures into one set, weighted by listing count. */
export function aggregate(pocketSlugs: string[]): MarketStats & { sources: VillageRow[] } {
  const sources = pocketSlugs
    .map((slug) => BY_SLUG.get(slug))
    .filter((v): v is VillageRow => Boolean(v));

  const listings = sources.reduce((sum, v) => sum + v.listings, 0);

  /** Listing-weighted mean, which is the honest way to merge medians. */
  const weighted = (pick: (v: VillageRow) => number | null) => {
    let total = 0;
    let weight = 0;
    for (const v of sources) {
      const value = pick(v);
      if (value == null) continue;
      total += value * v.listings;
      weight += v.listings;
    }
    return weight > 0 ? Math.round(total / weight) : null;
  };

  const mergeTally = (pick: (v: VillageRow) => [string, number][]) => {
    const counts = new Map<string, number>();
    for (const v of sources) {
      for (const [key, n] of pick(v)) counts.set(key, (counts.get(key) ?? 0) + n);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]) as [string, number][];
  };

  const prices = sources.map((v) => v.minPrice).filter((n): n is number => n != null);
  const maxes = sources.map((v) => v.maxPrice).filter((n): n is number => n != null);

  return {
    sources,
    listings,
    medianPrice: weighted((v) => v.medianPrice),
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: maxes.length ? Math.max(...maxes) : null,
    medianArea: weighted((v) => v.medianArea),
    medianPerSqft: weighted((v) => v.medianPerSqft),
    bedrooms: mergeTally((v) => v.bedrooms),
    facings: mergeTally((v) => v.facings),
    ownership: mergeTally((v) => v.ownership),
    gated: sources.reduce((s, v) => s + v.gated, 0),
    corner: sources.reduce((s, v) => s + v.corner, 0),
    pool: sources.reduce((s, v) => s + v.pool, 0),
    park: sources.reduce((s, v) => s + v.park, 0),
    vaastu: sources.reduce((s, v) => s + v.vaastu, 0),
    readyToMove: sources.reduce((s, v) => s + v.readyToMove, 0),
  };
}

/** Great-circle distance in kilometres. */
function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** The pockets nearest a landmark, with their distance, nearest first. */
export function pocketsNear(
  lat: number,
  lng: number,
  limit = 5,
): { village: VillageRow; km: number }[] {
  return VILLAGES.filter((v) => v.lat != null && v.lng != null)
    .map((v) => ({ village: v, km: haversine(lat, lng, v.lat!, v.lng!) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
    .map(({ village, km }) => ({ village, km: Math.round(km * 10) / 10 }));
}

export const roadBySlug = (slug: string) => ROADS.find((r) => r.slug === slug);
export const landmarkBySlug = (slug: string) => LANDMARKS.find((l) => l.slug === slug);
export const adjacentBySlug = (slug: string) => ADJACENT.find((a) => a.slug === slug);
export const pincodeByCode = (code: string) => PINCODES.find((p) => p.code === code);

/**
 * Every geo a facet page can be built on: the villages we hold listings in,
 * plus the roads that string them together. Landmarks and adjacent villages
 * get overview pages but not the full facet matrix — a landmark is a place you
 * navigate by, not a place with a plot-size distribution.
 */
export function facetableGeos(): { slug: string; name: string; kind: "village" | "road" }[] {
  return [
    ...VILLAGES.map((v) => ({ slug: v.slug, name: v.name, kind: "village" as const })),
    ...ROADS.map((r) => ({ slug: r.slug, name: r.name, kind: "road" as const })),
  ];
}
