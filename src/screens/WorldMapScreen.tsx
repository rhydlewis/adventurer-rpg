import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';
import { canTravelToLocation, isFirstVisit, markLocationVisited } from '../utils/worldMap';
import { LOCATIONS } from '../data/locations';
import { OptionsMenu } from '../components';
import type { Location } from '../types';

interface WorldMapScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
  onViewCharacterSheet?: () => void;
  onExit: () => void;
}

export function WorldMapScreen({ onNavigate, onViewCharacterSheet, onExit }: WorldMapScreenProps) {
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
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Options Menu */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="heading-primary text-h1 text-fg-primary mb-2">{campaign.title}</h1>
            <p className="body-secondary text-fg-muted">World Map</p>
          </div>
          <OptionsMenu
            onViewCharacterSheet={onViewCharacterSheet}
            onExit={onExit}
          />
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  relative text-left p-4 rounded-lg border-2 transition-all
                  ${isCurrent ? 'border-accent bg-accent/10' : 'border-border-default'}
                  ${isUnlocked ? 'hover:border-accent bg-secondary hover:bg-secondary/80 cursor-pointer' : 'opacity-50 cursor-not-allowed bg-secondary/50'}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Location Details */}
                  <div className="flex-1 min-w-0">
                    {/* Current Location Indicator */}
                    {isCurrent && (
                      <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                        <span className="text-xs text-blue-400 label-secondary uppercase tracking-wider">Current Location</span>
                      </div>
                    )}

                    {/* Location Name */}
                    <h3 className={`heading-secondary mb-2 break-words ${isUnlocked ? 'text-fg-primary' : 'text-fg-muted'}`}>
                      {isUnlocked ? location.name : '???'}
                    </h3>

                    {/* Location Type Badge */}
                    <div className="mb-2">
                      {isUnlocked ? (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          location.locationType === 'town' ? 'bg-success/20 text-success' :
                          location.locationType === 'wilderness' ? 'bg-warning/20 text-warning' :
                          'bg-danger/20 text-danger'
                        }`}>
                          {location.locationType}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-border-default/20 text-fg-muted">
                          unknown
                        </span>
                      )}
                      {hasVisited && isUnlocked && (
                        <span className="ml-2 text-xs text-fg-muted">• Visited</span>
                      )}
                    </div>

                    {/* Location Description */}
                    {isUnlocked && location.description && (
                      <p className="body-secondary text-sm text-fg-muted">{location.description}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Location Info */}
        {world.currentLocationId && (
          <div className="mt-8 p-6 bg-secondary rounded-lg border-2 border-accent">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
              <h2 className="label-secondary text-xs text-blue-400 uppercase tracking-wider">Current Location</h2>
            </div>
            <p className="heading-primary text-fg-primary">
              {LOCATIONS[world.currentLocationId]?.name || 'Unknown'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
