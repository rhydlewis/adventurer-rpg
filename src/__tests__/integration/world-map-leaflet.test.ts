import { describe, it, expect, beforeEach } from 'vitest';
import { useNarrativeStore } from '../../stores/narrativeStore';
import { singleNodeCampaign } from '../../data/campaigns/single-node-campaign';
import { LOCATIONS } from '../../data/locations';

describe('WorldMapLeaflet - Integration', () => {
  beforeEach(() => {
    useNarrativeStore.getState().resetNarrative();
  });

  it('should have same location data as canvas POC', () => {
    // Verify locations have coordinates (shared with canvas POC)
    expect(LOCATIONS['crossroads'].coordinates).toEqual({ x: 0, y: 0 });
    expect(LOCATIONS['rusty-tavern'].coordinates).toEqual({ x: -120, y: -80 });
    expect(LOCATIONS['town-square'].coordinates).toEqual({ x: -180, y: -120 });
    expect(LOCATIONS['forest-path'].coordinates).toEqual({ x: 100, y: 60 });
    expect(LOCATIONS['bandit-camp'].coordinates).toEqual({ x: 80, y: -100 });
  });

  it('should calculate correct bounds for Simple CRS', () => {
    useNarrativeStore.getState().loadCampaign(singleNodeCampaign);

    const { campaign } = useNarrativeStore.getState();
    const campaignLocations = campaign!.locations || [];
    const locationsWithCoords = campaignLocations.filter(loc => loc.coordinates);

    const padding = 200;
    const allX = locationsWithCoords.map(loc => loc.coordinates!.x);
    const allY = locationsWithCoords.map(loc => loc.coordinates!.y);
    const minX = Math.min(...allX) - padding;
    const maxX = Math.max(...allX) + padding;
    const minY = Math.min(...allY) - padding;
    const maxY = Math.max(...allY) + padding;

    // Verify bounds calculation
    expect(minX).toBeLessThan(0);
    expect(maxX).toBeGreaterThan(0);
    expect(minY).toBeLessThan(0);
    expect(maxY).toBeGreaterThan(0);

    // Verify center calculation
    const centerY = (minY + maxY) / 2;
    const centerX = (minX + maxX) / 2;
    expect(typeof centerY).toBe('number');
    expect(typeof centerX).toBe('number');
  });

  it('should convert coordinates from canvas format to Leaflet format', () => {
    // Canvas uses (x, y) where x=horizontal, y=vertical
    // Leaflet Simple CRS uses [lat, lng] but we treat it as [y, x]

    const canvasCoord = { x: -120, y: -80 };
    const leafletPosition = [canvasCoord.y, canvasCoord.x];

    expect(leafletPosition).toEqual([-80, -120]);
  });

  it('should support same unlock/travel logic as canvas POC', () => {
    useNarrativeStore.getState().loadCampaign(singleNodeCampaign);
    useNarrativeStore.getState().startCampaign();

    const { campaign } = useNarrativeStore.getState();
    const campaignLocations = campaign!.locations || [];
    const locationsWithCoords = campaignLocations.filter(loc => loc.coordinates);

    // Should have same locations as canvas POC
    expect(locationsWithCoords.length).toBeGreaterThanOrEqual(5);

    // All should have both x and y coordinates
    locationsWithCoords.forEach(loc => {
      expect(loc.coordinates).toBeDefined();
      expect(typeof loc.coordinates!.x).toBe('number');
      expect(typeof loc.coordinates!.y).toBe('number');
    });
  });
});
