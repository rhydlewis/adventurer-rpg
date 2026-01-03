import { useNarrativeStore } from '../stores/narrativeStore';
import { OptionsMenu, LocationMarker } from '../components';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { canTravelToLocation } from '../utils/worldMap';

interface WorldMapLeafletScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
  onViewCharacterSheet?: () => void;
  onExit: () => void;
}

export function WorldMapLeafletScreen({
  onNavigate,
  onViewCharacterSheet,
  onExit,
}: WorldMapLeafletScreenProps) {
  const { world, campaign } = useNarrativeStore();

  if (!world || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <p className="text-fg-primary">No campaign loaded</p>
      </div>
    );
  }

  // Get campaign locations with coordinates
  const campaignLocations = campaign.locations || [];
  const locationsWithCoords = campaignLocations.filter(loc => loc.coordinates);

  // Calculate bounds for Simple CRS
  // Use padding to ensure all locations are visible
  const padding = 200;
  const allX = locationsWithCoords.map(loc => loc.coordinates!.x);
  const allY = locationsWithCoords.map(loc => loc.coordinates!.y);
  const minX = Math.min(...allX) - padding;
  const maxX = Math.max(...allX) + padding;
  const minY = Math.min(...allY) - padding;
  const maxY = Math.max(...allY) + padding;

  // In Simple CRS, bounds are [southWest, northEast] in [y, x] format
  // Note: Leaflet uses [lat, lng] but in Simple CRS this is [y, x]
  const bounds: L.LatLngBoundsExpression = [
    [minY, minX], // Southwest corner
    [maxY, maxX], // Northeast corner
  ];

  // Center of map
  const center: L.LatLngExpression = [
    (minY + maxY) / 2,
    (minX + maxX) / 2,
  ];

  return (
    <div className="relative min-h-screen bg-primary overflow-hidden">
      {/* Header with Options Menu */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-start justify-between p-4">
        <div>
          <h1 className="heading-primary text-h1 text-fg-primary mb-2">
            {campaign.title}
          </h1>
          <p className="body-secondary text-fg-muted">Leaflet Map (POC)</p>
        </div>
        <OptionsMenu
          onViewCharacterSheet={onViewCharacterSheet}
          onExit={onExit}
          showMap={false}
        />
      </div>

      {/* Map container - will add MapContainer here */}
      <div className="absolute inset-0" style={{ top: '80px' }}>
        <MapContainer
          center={center}
          zoom={1}
          minZoom={0.5}
          maxZoom={2}
          crs={L.CRS.Simple}
          bounds={bounds}
          style={{ height: '100%', width: '100%' }}
          className="bg-primary"
        >
          {/* Blank tile layer - no actual tiles */}
          <TileLayer url="" />

          {/* Location Markers */}
          {locationsWithCoords.map((location) => {
            const isUnlocked = canTravelToLocation(world, location.id);
            const isCurrent = world.currentLocationId === location.id;

            // In Simple CRS, position is [y, x]
            const position: L.LatLngExpression = [
              location.coordinates!.y,
              location.coordinates!.x,
            ];

            return (
              <LocationMarker
                key={location.id}
                position={position}
                name={location.name}
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                onClick={() => {
                  if (isUnlocked) {
                    onNavigate({ type: 'locationHub', locationId: location.id });
                  }
                }}
              />
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
