import { useNarrativeStore } from '../stores/narrativeStore';
import { OptionsMenu } from '../components';

interface WorldMapCanvasScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
  onViewCharacterSheet?: () => void;
  onExit: () => void;
}

export function WorldMapCanvasScreen({
  onViewCharacterSheet,
  onExit,
}: WorldMapCanvasScreenProps) {
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
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-4">
        <div>
          <h1 className="heading-primary text-h1 text-fg-primary mb-2">
            {campaign.title}
          </h1>
          <p className="body-secondary text-fg-muted">Canvas Map (POC)</p>
        </div>
        <OptionsMenu
          onViewCharacterSheet={onViewCharacterSheet}
          onExit={onExit}
          showMap={false}
        />
      </div>

      {/* Canvas container - to be implemented */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-fg-muted">Canvas map coming soon...</p>
      </div>
    </div>
  );
}
