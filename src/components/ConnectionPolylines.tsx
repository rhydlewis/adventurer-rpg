import { Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import type { Location, WorldState } from '../types';
import { LOCATIONS } from '../data/locations';
import { canTravelToLocation } from '../utils/worldMap';

interface ConnectionPolylinesProps {
  locations: Location[];
  world: WorldState;
}

export function ConnectionPolylines({ locations, world }: ConnectionPolylinesProps) {
  const lines: React.JSX.Element[] = [];

  locations.forEach((location) => {
    if (!location.connections || !location.coordinates) return;

    const isFromUnlocked = canTravelToLocation(world, location.id);
    if (!isFromUnlocked) return; // Only draw from unlocked locations

    const fromCoords = location.coordinates; // Store for type narrowing

    location.connections.forEach((toId) => {
      const toLocation = LOCATIONS[toId];
      if (!toLocation?.coordinates) return;

      const isCurrent =
        location.id === world.currentLocationId ||
        toId === world.currentLocationId;
      const isToUnlocked = canTravelToLocation(world, toId);

      // In Simple CRS, positions are [y, x]
      const positions: LatLngExpression[] = [
        [fromCoords.y, fromCoords.x],
        [toLocation.coordinates.y, toLocation.coordinates.x],
      ];

      // Style based on unlock state and current location
      const color = isCurrent ? 'rgb(59, 130, 246)' : 'rgb(100, 116, 139)';
      const dashArray = isToUnlocked ? undefined : '5, 5';

      lines.push(
        <Polyline
          key={`${location.id}-${toId}`}
          positions={positions}
          color={color}
          weight={2}
          dashArray={dashArray}
        />
      );
    });
  });

  return <>{lines}</>;
}
