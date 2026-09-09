import {
  Check,
  Layers,
  Ruler,
  CalendarDays,
  Hammer,
  IndianRupee,
  AlertTriangle,
  BadgeCheck,
  FileCheck2,
  Map,
  KeyRound,
  Tag,
  Waves,
  Dumbbell,
  ShieldCheck,
  Zap,
  Car,
  Trees,
  Building2,
  Droplets,
  Lightbulb,
  Flame,
  Recycle,
  Route,
  Wifi,
  School,
  Stethoscope,
  ShoppingBag,
  Sun,
  CctvIcon,
  DoorOpen,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Amenity labels reach us from two places with different vocabularies: the
 * hand-written listings use marketing names ("Clubhouse", "Swimming Pool")
 * while HRERA-sourced ones use the promoter's service-plan wording ("SEWAGE
 * TREATMENT & GARBAGE DISPOSAL", "BOUNDARY WALL AND ENTRANCE AND EXIT GATES").
 * Matching on substrings covers both without a lookup table per source.
 */
const RULES: [RegExp, LucideIcon][] = [
  [/pool|swim/i, Waves],
  [/gym|fitness/i, Dumbbell],
  [/club\s?house|community centre|community center/i, Users],
  [/security|fire\s?fight/i, ShieldCheck],
  [/cctv|surveillance/i, CctvIcon],
  [/boundary wall|entrance|gate/i, DoorOpen],
  [/power|electric|substation|sub-station|electrification/i, Zap],
  [/street\s?light|lighting/i, Lightbulb],
  [/parking|garage/i, Car],
  [/park|playground|garden|green|landscap/i, Trees],
  [/road|pavement|circulation/i, Route],
  [/water\s?supply|underground water|water tank|pump/i, Droplets],
  [/rain\s?water|harvest/i, Droplets],
  [/sewage|stp|sewer|garbage|waste|drainage|storm/i, Recycle],
  [/renewable|solar/i, Sun],
  [/school|educat/i, School],
  [/hospital|dispensary|medical/i, Stethoscope],
  [/shop|retail|market|convenience/i, ShoppingBag],
  [/wifi|internet|broadband/i, Wifi],
  [/lift|elevator|tower|block|building/i, Building2],
  [/gas|piped/i, Flame],
];

export function amenityIcon(label: string): LucideIcon {
  for (const [pattern, icon] of RULES) if (pattern.test(label)) return icon;
  return Check;
}


/**
 * The same label-driven approach for the figures a listing or a hub reports.
 * Keyed off what the label says rather than its position, so the sector page,
 * the developer page and the listing can all reuse one mapping.
 */
const STAT_RULES: [RegExp, LucideIcon][] = [
  [/^projects?$/i, Layers],
  [/developer|builder/i, Building2],
  [/land|acre|area/i, Ruler],
  [/plot size/i, Ruler],
  [/unit|filed/i, DoorOpen],
  [/unsold|available/i, Tag],
  [/built|infrastructure|complete/i, Hammer],
  [/past due|overdue|delay/i, AlertTriangle],
  [/completion|possession/i, CalendarDays],
  [/cost|price|₹/i, IndianRupee],
  [/layout|building plan|approval/i, FileCheck2],
  [/status/i, BadgeCheck],
  [/sector|location|map/i, Map],
  [/ready|handover/i, KeyRound],
];

export function statIcon(label: string): LucideIcon {
  for (const [pattern, icon] of STAT_RULES) if (pattern.test(label)) return icon;
  return Layers;
}
