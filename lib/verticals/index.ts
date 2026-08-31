import type { VerticalConfig, VerticalId } from "./types";
import { cafirm } from "./cafirm";
import { realestate } from "./realestate";

export * from "./types";

const REGISTRY: Record<VerticalId, VerticalConfig> = {
  cafirm,
  realestate,
};

export const VERTICAL_IDS = Object.keys(REGISTRY) as VerticalId[];

/** Falls back to `cafirm` for an unrecognised or legacy vertical value. */
export function getVerticalConfig(vertical: string | null | undefined): VerticalConfig {
  return REGISTRY[vertical as VerticalId] ?? REGISTRY.cafirm;
}

export function isVerticalId(value: string): value is VerticalId {
  return value in REGISTRY;
}
