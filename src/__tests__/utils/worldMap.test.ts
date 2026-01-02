import { describe, it, expect } from 'vitest';
import {
  canTravelToLocation,
  unlockLocation,
  unlockSanctuary,
  getLocationHubOptions,
} from '@/utils/worldMap';
import type { WorldState, Location, LocationType } from '@/types';

describe('worldMap utilities', () => {
  describe('canTravelToLocation', () => {
    it('should return true for unlocked location', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford', 'oakhaven'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      expect(canTravelToLocation(worldState, 'oakhaven')).toBe(true);
    });

    it('should return false for locked location', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      expect(canTravelToLocation(worldState, 'tower')).toBe(false);
    });
  });

  describe('unlockLocation', () => {
    it('should add location to unlockedLocations array', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      const result = unlockLocation(worldState, 'oakhaven');

      expect(result.unlockedLocations).toContain('oakhaven');
      expect(result.unlockedLocations).toHaveLength(2);
    });

    it('should not duplicate if location already unlocked', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford', 'oakhaven'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      const result = unlockLocation(worldState, 'oakhaven');

      expect(result.unlockedLocations).toHaveLength(2);
    });

    it('should not mutate original world state', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      const originalLength = worldState.unlockedLocations.length;
      unlockLocation(worldState, 'oakhaven');

      expect(worldState.unlockedLocations).toHaveLength(originalLength);
    });
  });

  describe('unlockSanctuary', () => {
    it('should add sanctuary to unlockedSanctuaries array', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'tower-interior',
        unlockedLocations: ['ashford', 'tower-interior'],
        visitedLocations: ['ashford', 'tower-interior'],
        unlockedSanctuaries: [],
      };

      const result = unlockSanctuary(worldState, 'tower-interior');

      expect(result.unlockedSanctuaries).toContain('tower-interior');
      expect(result.unlockedSanctuaries).toHaveLength(1);
    });

    it('should not duplicate if sanctuary already unlocked', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'tower-interior',
        unlockedLocations: ['ashford', 'tower-interior'],
        visitedLocations: ['ashford', 'tower-interior'],
        unlockedSanctuaries: ['tower-interior'],
      };

      const result = unlockSanctuary(worldState, 'tower-interior');

      expect(result.unlockedSanctuaries).toHaveLength(1);
    });
  });

  describe('getLocationHubOptions', () => {
    const createTestLocation = (locationType: LocationType, overrides = {}): Location => ({
      id: 'test-location',
      name: 'Test Location',
      image: 'test.png',
      locationType,
      ...overrides,
    });

    it('should return town options for town location with merchant', () => {
      const location = createTestLocation('town', { hasMerchant: true });
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'test-location',
        unlockedLocations: ['test-location'],
        visitedLocations: ['test-location'],
        unlockedSanctuaries: [],
      };

      const options = getLocationHubOptions(location, worldState);

      expect(options).toContain('continue-story');
      expect(options).toContain('visit-merchant');
      expect(options).toContain('rest-inn');
      expect(options).toContain('leave-location');
    });

    it('should return wilderness options for wilderness location', () => {
      const location = createTestLocation('wilderness', { explorationTableId: 'forest-encounters' });
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'test-location',
        unlockedLocations: ['test-location'],
        visitedLocations: ['test-location'],
        unlockedSanctuaries: [],
      };

      const options = getLocationHubOptions(location, worldState);

      expect(options).toContain('continue-story');
      expect(options).toContain('explore-area');
      expect(options).toContain('make-camp');
      expect(options).toContain('leave-location');
    });

    it('should return dungeon options without sanctuary initially', () => {
      const location = createTestLocation('dungeon', { explorationTableId: 'dungeon-encounters' });
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'test-location',
        unlockedLocations: ['test-location'],
        visitedLocations: ['test-location'],
        unlockedSanctuaries: [],
      };

      const options = getLocationHubOptions(location, worldState);

      expect(options).toContain('continue-story');
      expect(options).toContain('explore-area');
      expect(options).not.toContain('rest-sanctuary');
      expect(options).toContain('leave-location');
    });

    it('should include sanctuary rest option when dungeon sanctuary is unlocked', () => {
      const location = createTestLocation('dungeon', { explorationTableId: 'dungeon-encounters' });
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'test-location',
        unlockedLocations: ['test-location'],
        visitedLocations: ['test-location'],
        unlockedSanctuaries: ['test-location'],
      };

      const options = getLocationHubOptions(location, worldState);

      expect(options).toContain('rest-sanctuary');
    });
  });
});
