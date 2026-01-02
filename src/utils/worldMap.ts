import type { WorldState, Location } from '../types';

/**
 * Check if player can travel to a location
 */
export function canTravelToLocation(worldState: WorldState, locationId: string): boolean {
  return worldState.unlockedLocations.includes(locationId);
}

/**
 * Unlock a new location (immutable)
 */
export function unlockLocation(worldState: WorldState, locationId: string): WorldState {
  // Don't duplicate if already unlocked
  if (worldState.unlockedLocations.includes(locationId)) {
    return worldState;
  }

  return {
    ...worldState,
    unlockedLocations: [...worldState.unlockedLocations, locationId],
  };
}

/**
 * Unlock a sanctuary in a dungeon location (immutable)
 */
export function unlockSanctuary(worldState: WorldState, locationId: string): WorldState {
  // Don't duplicate if already unlocked
  if (worldState.unlockedSanctuaries.includes(locationId)) {
    return worldState;
  }

  return {
    ...worldState,
    unlockedSanctuaries: [...worldState.unlockedSanctuaries, locationId],
  };
}

/**
 * Hub option IDs for LocationHubScreen
 */
export type HubOption =
  | 'continue-story'
  | 'visit-merchant'
  | 'rest-inn'
  | 'explore-area'
  | 'make-camp'
  | 'rest-sanctuary'
  | 'leave-location';

/**
 * Get available hub options based on location type and state
 */
export function getLocationHubOptions(location: Location, worldState: WorldState): HubOption[] {
  const options: HubOption[] = [];

  // All locations have story option
  options.push('continue-story');

  // Type-specific options
  switch (location.locationType) {
    case 'town':
      if (location.hasMerchant) {
        options.push('visit-merchant');
      }
      options.push('rest-inn');
      break;

    case 'wilderness':
      if (location.explorationTableId) {
        options.push('explore-area');
      }
      options.push('make-camp');
      break;

    case 'dungeon':
      if (location.explorationTableId) {
        options.push('explore-area');
      }
      // Sanctuary only if unlocked
      if (worldState.unlockedSanctuaries.includes(location.id)) {
        options.push('rest-sanctuary');
      }
      break;
  }

  // All locations can be exited
  options.push('leave-location');

  return options;
}

/**
 * Check if this is the first visit to a location
 */
export function isFirstVisit(worldState: WorldState, locationId: string): boolean {
  return !worldState.visitedLocations.includes(locationId);
}

/**
 * Mark location as visited (immutable)
 */
export function markLocationVisited(worldState: WorldState, locationId: string): WorldState {
  // Don't duplicate if already visited
  if (worldState.visitedLocations.includes(locationId)) {
    return worldState;
  }

  return {
    ...worldState,
    visitedLocations: [...worldState.visitedLocations, locationId],
  };
}
