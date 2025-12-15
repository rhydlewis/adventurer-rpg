import { useEffect, useRef } from 'react';
import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';
import { NarrativeLog, ChoiceButton, Card, Button, Icon } from '../components';
import { resolveLocation } from '../utils/locationResolver';
import type { Screen } from '../types/navigation';

interface StoryScreenProps {
  /**
   * Callback to exit story mode (return to home/world map)
   */
  onExit: () => void;

  /**
   * Optional callback for navigation to other screens (e.g., minigames)
   */
  onNavigate?: (screen: Screen) => void;
}

/**
 * Main narrative screen displaying story text, choices, and conversation log.
 *
 * Features:
 * - Current node description display
 * - Choice buttons (filtered by requirements)
 * - Scrollable log of conversation history
 * - Companion hint button (when available)
 * - Auto-scroll to bottom on new entries
 *
 * @example
 * <StoryScreen onExit={() => setScreen('home')} />
 */
export function StoryScreen({ onExit, onNavigate }: StoryScreenProps) {
  const {
    conversation,
    campaign,
    getCurrentNode,
    getCurrentAct,
    getAvailableChoices,
    getChoiceDisplayText,
    selectChoice,
    requestCompanionHint,
    exitConversation,
  } = useNarrativeStore();

  const { character } = useCharacterStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when log updates
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.log]);

  if (!conversation || !character || !campaign) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card variant="neutral" padding="spacious">
          <p className="text-fg-primary body-primary text-center">
            No active story. Please start a campaign.
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={onExit}
            className="mt-4"
          >
            Return to Menu
          </Button>
        </Card>
      </div>
    );
  }

  const currentNode = getCurrentNode();
  const currentAct = getCurrentAct();

  if (!currentNode) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card variant="neutral" padding="spacious">
          <p className="text-fg-primary body-primary text-center">
            Story node not found. This is a bug.
          </p>
          <Button
            variant="danger"
            fullWidth
            onClick={onExit}
            className="mt-4"
          >
            Exit Story
          </Button>
        </Card>
      </div>
    );
  }

  // Resolve location for background image
  const location = currentNode && currentAct
    ? resolveLocation(currentNode, currentAct)
    : null;

  const backgroundStyle = location ? {
    backgroundImage: `
      linear-gradient(to bottom,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.7) 100%
      ),
      url(/assets/locations/${location.image})
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  const availableChoices = getAvailableChoices(character);
  const hasCompanionHint = !!currentNode.companionHint;

  const handleChoice = (choiceId: string) => {
    selectChoice(choiceId, character);
  };

  const handleCompanionHint = () => {
    requestCompanionHint();
  };

  const handleExit = () => {
    exitConversation();
    onExit();
  };

  const handleTestLockPicking = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!onNavigate) return;
    onNavigate({
      type: 'lockPicking',
      difficulty,
      onSuccess: () => {
        console.log('Lock picked successfully!');
        onNavigate({ type: 'story' });
      },
      onFailure: () => {
        console.log('Lock picking failed!');
        onNavigate({ type: 'story' });
      },
    });
  };

  return (
    <div
      className="h-screen bg-primary flex flex-col p-4"
      style={backgroundStyle}
    >
      {/* Header */}
      <div className="mb-4">
        <Card variant="neutral" padding="compact">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Book" className="text-player" />
              <div>
                <h1 className="heading-primary text-h1 text-fg-primary">
                  {currentNode.title || campaign.title}
                </h1>
                {currentNode.locationHint && (
                  <p className="text-xs text-fg-muted label-secondary">
                    {currentNode.locationHint}
                  </p>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={handleExit} className="text-sm">
              Exit
            </Button>
          </div>
        </Card>
      </div>

      {/* Scrollable Log Area */}
      <div className="max-h-80 overflow-y-auto mb-4">
        <Card variant="neutral">
          <NarrativeLog entries={conversation.log} />
          {/* Scroll anchor */}
          <div ref={logEndRef} />
        </Card>
      </div>

      {/* Spacer - pushes choices to bottom, shows background */}
      <div className="flex-1" />

      {/* Choices Section */}
      <div className="space-y-2">
        {/* Companion Hint Button */}
        {hasCompanionHint && (
          <Button
            variant="secondary"
            fullWidth
            onClick={handleCompanionHint}
            icon={<Icon name="Lightbulb" />}
            className="mb-2"
          >
            Ask {campaign.companionName}
          </Button>
        )}

        {/* Choice Buttons */}
        {availableChoices.length > 0 ? (
          availableChoices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              wasSelected={conversation.visitedChoiceIds.includes(choice.id)}
              onSelect={handleChoice}
              displayText={getChoiceDisplayText(choice)}
            />
          ))
        ) : (
          <Card variant="neutral" padding="spacious">
            <p className="text-fg-muted text-center body-secondary text-sm italic">
              No available choices. The story continues...
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
