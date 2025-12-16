import { describe, it, expect } from 'vitest';
import { resolveLocation, getLocationAmbience } from '../../utils/locationResolver';
import type { StoryNode, Act } from '../../types';

describe('locationResolver', () => {
  describe('resolveLocation', () => {
    const mockAct: Act = {
      id: 'act-1',
      title: 'Test Act',
      locationId: 'rusty-tavern',
      startingNodeId: 'node-1',
      nodes: [],
    };

    const mockNode: StoryNode = {
      id: 'node-1',
      description: 'Test node',
      choices: [],
    };

    it('should return location when node has locationId', () => {
      const node = { ...mockNode, locationId: 'town-square' };
      const location = resolveLocation(node, mockAct);

      expect(location).not.toBeNull();
      expect(location?.id).toBe('town-square');
      expect(location?.name).toBe('Town Square');
    });

    it('should override act locationId with node locationId', () => {
      const node = { ...mockNode, locationId: 'forest-path' };
      const location = resolveLocation(node, mockAct);

      expect(location?.id).toBe('forest-path');
      expect(location?.id).not.toBe(mockAct.locationId);
    });

    it('should fall back to act locationId when node has no locationId', () => {
      const location = resolveLocation(mockNode, mockAct);

      expect(location).not.toBeNull();
      expect(location?.id).toBe('rusty-tavern');
      expect(location?.name).toBe('The Rusty Tavern');
    });

    it('should return null when neither node nor act has locationId', () => {
      const actWithoutLocation = { ...mockAct, locationId: undefined };
      const location = resolveLocation(mockNode, actWithoutLocation);

      expect(location).toBeNull();
    });

    it('should return null for invalid locationId', () => {
      const node = { ...mockNode, locationId: 'non-existent-location' };
      const location = resolveLocation(node, mockAct);

      expect(location).toBeNull();
    });

    it('should return null for invalid act locationId', () => {
      const actWithInvalidLocation = { ...mockAct, locationId: 'invalid-id' };
      const location = resolveLocation(mockNode, actWithInvalidLocation);

      expect(location).toBeNull();
    });
  });

  describe('getLocationAmbience', () => {
    const mockAct: Act = {
      id: 'act-1',
      title: 'Test Act',
      locationId: 'rusty-tavern',
      startingNodeId: 'node-1',
      nodes: [],
    };

    const mockNode: StoryNode = {
      id: 'node-1',
      description: 'Test node',
      choices: [],
    };

    it('should return ambience text for valid location', () => {
      const ambience = getLocationAmbience(mockNode, mockAct);

      expect(ambience).toBe('The air is thick with pipe smoke and the smell of ale');
    });

    it('should return ambience from node location override', () => {
      const node = { ...mockNode, locationId: 'town-square' };
      const ambience = getLocationAmbience(node, mockAct);

      expect(ambience).toBe(
        'Merchants call out their wares as townsfolk hurry about their business'
      );
    });

    it('should return undefined when location has no ambience', () => {
      // Create a location without ambience by using invalid ID
      const actWithoutLocation = { ...mockAct, locationId: undefined };
      const ambience = getLocationAmbience(mockNode, actWithoutLocation);

      expect(ambience).toBeUndefined();
    });

    it('should return undefined for invalid location', () => {
      const node = { ...mockNode, locationId: 'invalid-location' };
      const ambience = getLocationAmbience(node, mockAct);

      expect(ambience).toBeUndefined();
    });
  });
});
