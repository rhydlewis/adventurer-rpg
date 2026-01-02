import { useNarrativeStore } from '../stores/narrativeStore';
import { getLocationHubOptions, type HubOption } from '../utils/worldMap';
import { LOCATIONS } from '../data/locations';

interface LocationHubScreenProps {
  locationId: string;
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
}

export function LocationHubScreen({ locationId, onNavigate }: LocationHubScreenProps) {
  const { world, campaign } = useNarrativeStore();

  if (!world || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">No campaign loaded</p>
      </div>
    );
  }

  const location = LOCATIONS[locationId];
  if (!location) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Location not found: {locationId}</p>
      </div>
    );
  }

  const hubOptions = getLocationHubOptions(location, world);

  const handleOptionClick = (option: HubOption) => {
    switch (option) {
      case 'continue-story':
        // Navigate to story node (hubNodeId or resume where left off)
        if (location.hubNodeId) {
          onNavigate({ type: 'story' });
        } else {
          // TODO: Resume story at current node
          onNavigate({ type: 'story' });
        }
        break;

      case 'visit-merchant':
        // TODO: Navigate to merchant screen
        onNavigate({ type: 'merchant', shopInventory: [], buyPrices: {} });
        break;

      case 'rest-inn':
      case 'rest-sanctuary':
        // Navigate to rest screen (safe rest)
        onNavigate({ type: 'rest' });
        break;

      case 'make-camp':
        // Navigate to rest screen (camp with events)
        onNavigate({ type: 'rest' });
        break;

      case 'explore-area':
        // Navigate to exploration screen
        if (location.explorationTableId) {
          onNavigate({
            type: 'exploration',
            tableId: location.explorationTableId,
            onceOnly: false,
            onComplete: () => {
              onNavigate({ type: 'locationHub', locationId });
            },
          });
        }
        break;

      case 'leave-location':
        // Return to world map
        const updatedWorld = {
          ...world,
          currentLocationId: null,
        };
        useNarrativeStore.setState({ world: updatedWorld });
        onNavigate({ type: 'worldMap' });
        break;
    }
  };

  const getOptionLabel = (option: HubOption): string => {
    switch (option) {
      case 'continue-story': return 'Continue Your Journey';
      case 'visit-merchant': return 'Visit the Market';
      case 'rest-inn': return 'Rest at the Inn';
      case 'rest-sanctuary': return 'Rest at Sanctuary';
      case 'explore-area': return 'Search the Area';
      case 'make-camp': return 'Make Camp';
      case 'leave-location': return `Leave ${location.name}`;
      default: return option;
    }
  };

  const getOptionIcon = (option: HubOption): string => {
    switch (option) {
      case 'continue-story': return '📖';
      case 'visit-merchant': return '🏪';
      case 'rest-inn': return '🛏️';
      case 'rest-sanctuary': return '⛪';
      case 'explore-area': return '🔍';
      case 'make-camp': return '🏕️';
      case 'leave-location': return '🗺️';
      default: return '•';
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-8"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/assets/${location.image})`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Location Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{location.name}</h1>
          {location.description && (
            <p className="text-lg text-gray-300 mb-4">{location.description}</p>
          )}
          {location.ambience && (
            <p className="text-sm text-gray-400 italic">{location.ambience}</p>
          )}
        </div>

        {/* Hub Options */}
        <div className="space-y-4">
          {hubOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className="w-full p-6 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-600 hover:border-blue-500 rounded-lg transition-all text-left group"
            >
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{getOptionIcon(option)}</span>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {getOptionLabel(option)}
                  </h3>
                  {option === 'explore-area' && location.explorationTableId && (
                    <p className="text-sm text-gray-400 mt-1">
                      Search for treasure and encounters
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
