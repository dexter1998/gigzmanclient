/**
 * Vastu direction reference and scoring.
 *
 * FRAMING — this matters as much as the data. Vastu Shastra is a traditional
 * belief system, not a scientific one, and a brokerage that profits from the
 * property decision carries more exposure than a lifestyle publisher saying
 * the same thing. Every string here is written in belief-attributed terms
 * ("traditionally placed", "is considered") and never asserts a causal claim
 * about wealth or health. The ranking site that writes "it is a science" is
 * the example NOT to follow.
 *
 * The scoring is a weighted lookup, exactly as the free tools in this space
 * work — no external service, no model. It is a screening aid, and the pages
 * say so.
 */

export type DirectionSlug =
  | "north" | "north-east" | "east" | "south-east"
  | "south" | "south-west" | "west" | "north-west";

export interface Direction {
  slug: DirectionSlug;
  name: string;
  /** Traditional Sanskrit name, where one is commonly used. */
  traditional?: string;
  /** The element the tradition associates with this direction. */
  element: string;
  summary: string;
}

export const DIRECTIONS: Direction[] = [
  { slug: "north", name: "North", traditional: "Kubera", element: "Water",
    summary: "Traditionally associated with opportunity and flow, and generally considered a favourable facing for a home." },
  { slug: "north-east", name: "North-East", traditional: "Ishan", element: "Water",
    summary: "Regarded in the tradition as the most auspicious corner, usually kept open, light and uncluttered." },
  { slug: "east", name: "East", traditional: "Indra", element: "Air",
    summary: "Valued for the morning light it brings in, and widely considered an auspicious facing." },
  { slug: "south-east", name: "South-East", traditional: "Agni", element: "Fire",
    summary: "The fire corner in the tradition, which is why kitchens are most often placed here." },
  { slug: "south", name: "South", traditional: "Yama", element: "Earth",
    summary: "Often treated cautiously in the tradition, though a south-facing home is considered workable with the right internal layout." },
  { slug: "south-west", name: "South-West", traditional: "Nairitya", element: "Earth",
    summary: "Associated with stability and weight, which is why the master bedroom is traditionally placed here." },
  { slug: "west", name: "West", traditional: "Varun", element: "Water",
    summary: "Considered a balanced facing, and often recommended for those whose work runs into the evening." },
  { slug: "north-west", name: "North-West", traditional: "Vayu", element: "Air",
    summary: "The air corner, traditionally linked with movement — commonly used for guest rooms and storage." },
];

export interface RoomDef {
  slug: string;
  name: string;
  /** Directions the tradition treats as well suited, best first. */
  preferred: DirectionSlug[];
  /** Directions the tradition generally advises against for this room. */
  avoid: DirectionSlug[];
  /** How much this room moves the overall score. */
  weight: number;
  guidance: string;
}

export const ROOMS: RoomDef[] = [
  { slug: "main-door", name: "Main door / entrance", weight: 3,
    preferred: ["north", "north-east", "east"], avoid: ["south-west"],
    guidance: "The entrance carries the most weight in the tradition. North, north-east and east are the commonly preferred placements." },
  { slug: "kitchen", name: "Kitchen", weight: 2.5,
    preferred: ["south-east", "north-west"], avoid: ["north-east", "south-west"],
    guidance: "Placed in the fire corner where possible, with the cook traditionally facing east while cooking." },
  { slug: "master-bedroom", name: "Master bedroom", weight: 2.5,
    preferred: ["south-west", "south", "west"], avoid: ["north-east", "south-east"],
    guidance: "The south-west is the traditional placement, associated with stability." },
  { slug: "pooja-room", name: "Pooja room", weight: 2,
    preferred: ["north-east", "east", "north"], avoid: ["south", "south-west"],
    guidance: "Traditionally the north-east, with the person praying facing north or east." },
  { slug: "living-room", name: "Living room", weight: 1.5,
    preferred: ["north", "east", "north-east"], avoid: ["south-west"],
    guidance: "Usually placed towards the north or east so the room gets the better part of the day's light." },
  { slug: "childrens-bedroom", name: "Children's bedroom", weight: 1.5,
    preferred: ["west", "north-west", "north"], avoid: ["south-west"],
    guidance: "The west and north-west are the usual placements, keeping the south-west for the master bedroom." },
  { slug: "bathroom", name: "Bathroom / toilet", weight: 1.5,
    preferred: ["north-west", "west", "south"], avoid: ["north-east", "south-east"],
    guidance: "Kept away from the north-east corner, which the tradition prefers to leave clear." },
  { slug: "staircase", name: "Staircase", weight: 1,
    preferred: ["south", "south-west", "west"], avoid: ["north-east"],
    guidance: "Traditionally placed in the southern or western half, and turning clockwise as you go up." },
  { slug: "study-room", name: "Study room", weight: 1,
    preferred: ["north-east", "north", "east", "west"], avoid: ["south-west"],
    guidance: "Placed so the person studying faces north or east." },
  { slug: "water-tank", name: "Underground water tank", weight: 1,
    preferred: ["north-east", "north", "east"], avoid: ["south-west", "south-east"],
    guidance: "Underground water storage is traditionally kept to the north-east." },
  { slug: "overhead-tank", name: "Overhead water tank", weight: 0.75,
    preferred: ["south-west", "west", "south"], avoid: ["north-east"],
    guidance: "The reverse of the underground tank — weight is traditionally kept to the south-west." },
  { slug: "car-parking", name: "Car parking", weight: 0.75,
    preferred: ["north-west", "north", "east"], avoid: ["south-west"],
    guidance: "Usually placed in the north-west, the direction associated with movement." },
];

export interface VastuAnswer {
  room: string;
  direction: DirectionSlug;
}

export interface VastuScore {
  /** 0-100. */
  score: number;
  band: "Excellent" | "Good" | "Average" | "Needs attention";
  answered: number;
  /** Rooms placed in a direction the tradition prefers. */
  favourable: { room: RoomDef; direction: Direction }[];
  /** Rooms placed where the tradition advises against, with what it suggests. */
  concerns: { room: RoomDef; direction: Direction; suggestion: string }[];
}

const dirByslug = (slug: DirectionSlug) => DIRECTIONS.find((d) => d.slug === slug)!;

export function scoreVastu(answers: VastuAnswer[]): VastuScore {
  const given = answers.filter((a) => a.direction && a.room);
  if (given.length === 0) {
    return { score: 0, band: "Needs attention", answered: 0, favourable: [], concerns: [] };
  }

  let earned = 0;
  let possible = 0;
  const favourable: VastuScore["favourable"] = [];
  const concerns: VastuScore["concerns"] = [];

  for (const answer of given) {
    const room = ROOMS.find((r) => r.slug === answer.room);
    if (!room) continue;
    possible += room.weight;

    if (room.preferred.includes(answer.direction)) {
      // Best-listed direction scores full, other preferred ones slightly less.
      earned += answer.direction === room.preferred[0] ? room.weight : room.weight * 0.85;
      favourable.push({ room, direction: dirByslug(answer.direction) });
    } else if (room.avoid.includes(answer.direction)) {
      concerns.push({
        room,
        direction: dirByslug(answer.direction),
        suggestion: `The tradition would place the ${room.name.toLowerCase()} towards the ${dirByslug(room.preferred[0]).name.toLowerCase()}. Where the layout is fixed, the usual remedies are about light, colour and how the room is used rather than structural change.`,
      });
    } else {
      // Neither preferred nor discouraged — treated as neutral.
      earned += room.weight * 0.5;
    }
  }

  const score = possible > 0 ? Math.round((earned / possible) * 100) : 0;
  const band: VastuScore["band"] =
    score >= 85 ? "Excellent" : score >= 65 ? "Good" : score >= 45 ? "Average" : "Needs attention";

  return { score, band, answered: given.length, favourable, concerns };
}

export const VASTU_DISCLAIMER =
  "Vastu Shastra is a traditional belief system. This tool reflects commonly followed directional guidance from that tradition and is intended as a quick screening aid, not a property recommendation, a structural assessment or a substitute for an on-site consultation. Nothing here should be read as a claim about outcomes.";

/** Contexts a facing direction is written about — each is its own page. */
export const VASTU_CONTEXTS = [
  { slug: "house", label: "House", intro: "for an independent house or builder floor" },
  { slug: "flat", label: "Flat", intro: "for an apartment in a gated development" },
  { slug: "plot", label: "Plot", intro: "for a plot before you build on it" },
] as const;

export type VastuContext = (typeof VASTU_CONTEXTS)[number]["slug"];

export function findDirection(slug: string): Direction | undefined {
  return DIRECTIONS.find((d) => d.slug === slug);
}
export function findRoom(slug: string): RoomDef | undefined {
  return ROOMS.find((r) => r.slug === slug);
}
