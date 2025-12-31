import { useCampEventStore } from '../../stores/campEventStore';
import { useCharacterStore } from '../../stores/characterStore';
import { useNarrativeStore } from '../../stores/narrativeStore';
import { getAvailableCampChoices } from '../../utils/campEventLogic';
import { Button, Card, Icon } from '../index';
import type { Screen } from '../../types';

interface CampEventModalProps {
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}

export function CampEventModal({ onClose, onNavigate }: CampEventModalProps) {
  const currentEvent = useCampEventStore(state => state.currentEvent);
  const character = useCharacterStore(state => state.character);
  const world = useNarrativeStore(state => state.world);

  if (!currentEvent || !character || !world) return null;

  const availableChoices = getAvailableCampChoices(currentEvent, world, character);

  const handleChoice = (choiceId: string) => {
    const choice = currentEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;

    console.log('[CampEventModal] Choice selected:', choice.text, 'outcome:', choice.outcome.type);

    // Handle different outcome types
    if (choice.outcome.type === 'combat') {
      console.log('[CampEventModal] Triggering combat with enemy:', choice.outcome.enemyId);
      // Clear the event and close modal
      useCampEventStore.getState().clearEvent();
      onClose();

      // Navigate to combat - use current node as victory node since we return to rest after
      const currentNodeId = world.currentNodeId;
      onNavigate({
        type: 'combat',
        enemyId: choice.outcome.enemyId,
        onVictoryNodeId: currentNodeId,
      });
    } else {
      // For other outcomes (continue, interrupt), just close
      useCampEventStore.getState().selectChoice(choiceId);
      onClose();
    }
  };

  // Map event types to colors and icons
  const eventTypeConfig = {
    encounter: { color: 'text-warning', icon: 'Swords' as const, bgColor: 'bg-warning/10' },
    story: { color: 'text-fg-accent', icon: 'BookOpen' as const, bgColor: 'bg-fg-accent/10' },
    ambush: { color: 'text-enemy', icon: 'TriangleAlert' as const, bgColor: 'bg-enemy/10' },
    discovery: { color: 'text-success', icon: 'Sparkles' as const, bgColor: 'bg-success/10' },
  };

  const config = eventTypeConfig[currentEvent.type];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full">
        <Card variant="neutral" padding="spacious">
          {/* Event Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`${config.bgColor} p-3 rounded-lg`}>
              <Icon name={config.icon} size={32} className={config.color} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wide text-fg-muted">
                  Camp Event
                </span>
              </div>
              <h2 className="heading-display text-fg-accent">{currentEvent.title}</h2>
            </div>
          </div>

          {/* Event Description */}
          <div className="mb-6">
            <p className="body-primary text-fg-primary whitespace-pre-wrap leading-relaxed">
              {currentEvent.description}
            </p>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            {availableChoices.map(choice => (
              <Button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                variant="primary"
                fullWidth
                className="py-4"
              >
                {choice.text}
              </Button>
            ))}

            {availableChoices.length === 0 && (
              <div className="text-center py-8 text-fg-muted">
                <Icon name="Info" size={48} className="mx-auto mb-3 opacity-50" />
                <p className="body-secondary">No available options</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
