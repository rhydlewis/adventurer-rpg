import { describe, it, expect, beforeEach } from 'vitest';
import { useNarrativeStore } from '../../stores/narrativeStore';
import { singleNodeCampaign } from '../../data/campaigns/single-node-campaign';
import { LOCATIONS } from '../../data/locations';
import { canTravelToLocation } from '../../utils/worldMap';

describe('WorldMapCanvas - Integration', () => {
  beforeEach(() => {
    // Reset narrative store
    useNarrativeStore.getState().resetNarrative();
  });

  it('should have locations with coordinates for canvas rendering', () => {
    // Verify POC locations have coordinates
    expect(LOCATIONS['crossroads'].coordinates).toEqual({ x: 0, y: 0 });
    expect(LOCATIONS['rusty-tavern'].coordinates).toEqual({ x: -120, y: -80 });
    expect(LOCATIONS['town-square'].coordinates).toEqual({ x: -180, y: -120 });
    expect(LOCATIONS['forest-path'].coordinates).toEqual({ x: 100, y: 60 });
    expect(LOCATIONS['bandit-camp'].coordinates).toEqual({ x: 80, y: -100 });
  });

  it('should have locations with connection data', () => {
    // Verify POC locations have connections
    expect(LOCATIONS['crossroads'].connections).toContain('rusty-tavern');
    expect(LOCATIONS['crossroads'].connections).toContain('forest-path');
    expect(LOCATIONS['crossroads'].connections).toContain('bandit-camp');
    expect(LOCATIONS['rusty-tavern'].connections).toContain('crossroads');
    expect(LOCATIONS['rusty-tavern'].connections).toContain('town-square');
  });

  it('should allow travel to unlocked locations only', () => {
    // Load campaign and start
    useNarrativeStore.getState().loadCampaign(singleNodeCampaign);
    useNarrativeStore.getState().startCampaign();

    const { world } = useNarrativeStore.getState();
    expect(world).toBeDefined();

    // Crossroads should be unlocked (starting location)
    expect(canTravelToLocation(world!, 'crossroads')).toBe(true);

    // Other locations should be locked initially
    expect(canTravelToLocation(world!, 'rusty-tavern')).toBe(false);
    expect(canTravelToLocation(world!, 'forest-path')).toBe(false);
  });

  it('should support unlocking connected locations', () => {
    // Load campaign and start
    useNarrativeStore.getState().loadCampaign(singleNodeCampaign);
    useNarrativeStore.getState().startCampaign();

    let { world } = useNarrativeStore.getState();
    expect(world).toBeDefined();

    // Unlock rusty-tavern
    const updated = {
      ...world!,
      unlockedLocations: [...world!.unlockedLocations, 'rusty-tavern'],
    };
    useNarrativeStore.setState({ world: updated });

    ({ world } = useNarrativeStore.getState());

    // Both locations should now be unlocked
    expect(canTravelToLocation(world!, 'crossroads')).toBe(true);
    expect(canTravelToLocation(world!, 'rusty-tavern')).toBe(true);
  });

  it('should filter campaign locations to those with coordinates', () => {
    // Load campaign
    useNarrativeStore.getState().loadCampaign(singleNodeCampaign);

    const { campaign } = useNarrativeStore.getState();
    expect(campaign).toBeDefined();

    const campaignLocations = campaign!.locations || [];
    const locationsWithCoords = campaignLocations.filter(loc => loc.coordinates);

    // Should have at least the 5 POC locations
    expect(locationsWithCoords.length).toBeGreaterThanOrEqual(5);

    // All filtered locations should have coordinates
    locationsWithCoords.forEach(loc => {
      expect(loc.coordinates).toBeDefined();
      expect(typeof loc.coordinates!.x).toBe('number');
      expect(typeof loc.coordinates!.y).toBe('number');
    });
  });

  it('should support worldToScreen coordinate transformation', () => {
    // Simulate viewport state
    const viewport = { x: 0, y: 0, zoom: 1.0 };
    const containerWidth = 800;
    const containerHeight = 600;

    // Transform world coordinates to screen coordinates
    const worldToScreen = (worldX: number, worldY: number) => {
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      return {
        x: centerX + (worldX * viewport.zoom) + viewport.x,
        y: centerY + (worldY * viewport.zoom) + viewport.y
      };
    };

    // Crossroads at (0, 0) should be at screen center
    const crossroadsScreen = worldToScreen(0, 0);
    expect(crossroadsScreen).toEqual({ x: 400, y: 300 });

    // Rusty tavern at (-120, -80) should be northwest of center
    const tavernScreen = worldToScreen(-120, -80);
    expect(tavernScreen.x).toBeLessThan(400);
    expect(tavernScreen.y).toBeLessThan(300);
  });
});
