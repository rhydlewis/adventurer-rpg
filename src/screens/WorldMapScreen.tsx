import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';
import { canTravelToLocation, isFirstVisit, markLocationVisited } from '../utils/worldMap';
import { LOCATIONS } from '../data/locations';
import type { Location } from '../types';

interface WorldMapScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
}

export function WorldMapScreen({ onNavigate }: WorldMapScreenProps) {
  const { world, campaign, enterNode } = useNarrativeStore();
  const { character } = useCharacterStore();

  if (!world || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">No campaign loaded</p>
      </div>
    );
  }

  const handleLocationClick = (location: Location) => {
    if (!canTravelToLocation(world, location.id)) {
      return; // Location locked
    }

    // Check if first visit
    if (isFirstVisit(world, location.id) && location.firstVisitNodeId) {
      // Mark as visited
      const updatedWorld = markLocationVisited(world, location.id);
      useNarrativeStore.setState({ world: updatedWorld });

      // Enter first visit story node
      if (character) {
        enterNode(location.firstVisitNodeId, character);
      }
      onNavigate({ type: 'story' });
    } else {
      // Return visit - go to location hub
      const updatedWorld = {
        ...world,
        currentLocationId: location.id,
      };
      useNarrativeStore.setState({ world: updatedWorld });
      onNavigate({ type: 'locationHub', locationId: location.id });
    }
  };

  const campaignLocations = campaign.locations || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">{campaign.title}</h1>
        <p className="text-gray-400 mb-8">World Map</p>

        {/* Location Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {campaignLocations.map((location) => {
            const isUnlocked = canTravelToLocation(world, location.id);
            const isCurrent = world.currentLocationId === location.id;
            const hasVisited = world.visitedLocations.includes(location.id);

            return (
              <button
                key={location.id}
                onClick={() => handleLocationClick(location)}
                disabled={!isUnlocked}
                className={`
                  relative p-6 rounded-lg border-2 transition-all
                  ${isCurrent ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}
                  ${isUnlocked ? 'hover:border-blue-400 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  ${hasVisited ? 'bg-gray-800' : 'bg-gray-900'}
                `}
              >
                {/* Lock Icon for Locked Locations */}
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                )}

                {/* Current Location Indicator */}
                {isCurrent && (
                  <div className="absolute top-2 left-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                )}

                {/* Location Name */}
                <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                  {location.name}
                </h3>

                {/* Location Type Badge */}
                <div className={`inline-block px-3 py-1 rounded text-xs font-medium mb-2 ${
                  location.locationType === 'town' ? 'bg-green-500/20 text-green-400' :
                  location.locationType === 'wilderness' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {location.locationType}
                </div>

                {/* Location Description */}
                {isUnlocked && location.description && (
                  <p className="text-sm text-gray-400 mt-2">{location.description}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Location Info */}
        {world.currentLocationId && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-2">Current Location</h2>
            <p className="text-gray-300">
              {LOCATIONS[world.currentLocationId]?.name || 'Unknown'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
