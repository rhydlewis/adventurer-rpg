import { useNarrativeStore } from '../stores/narrativeStore';
import { OptionsMenu } from '../components';

interface WorldMapLeafletScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
  onViewCharacterSheet?: () => void;
  onExit: () => void;
}

export function WorldMapLeafletScreen({
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
        <p className="text-fg-primary p-4">Map will go here</p>
      </div>
    </div>
  );
}
