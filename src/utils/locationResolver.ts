import type { Location, StoryNode, Act } from '../types';
import { LOCATIONS } from '../data/locations';

/**
 * Resolves the location for a story node
 * Priority: node.locationId > act.locationId > null
 */
export function resolveLocation(
  node: StoryNode,
  act: Act
): Location | null {
  const locationId = node.locationId ?? act.locationId;

  if (!locationId) return null;

  return LOCATIONS[locationId] ?? null;
}

/**
 * Gets default ambience text for a node's location
 * Can be overridden by node.locationHint
 */
export function getLocationAmbience(
  node: StoryNode,
  act: Act
): string | undefined {
  const location = resolveLocation(node, act);
  return location?.ambience;
}
