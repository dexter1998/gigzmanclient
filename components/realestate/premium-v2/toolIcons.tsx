import { Compass, Home, Percent, Ruler } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Icon per published tool. Kept beside the components rather than in
 *  lib/premium-v2/tools.ts so that module stays free of React imports. */
export const TOOL_ICONS: Record<string, LucideIcon> = {
  emi: Home,
  "rental-yield": Percent,
  "area-converter": Ruler,
  vastu: Compass,
};
