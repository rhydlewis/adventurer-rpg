import { useEffect, useRef } from 'react';
import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';
import { NarrativeLog, ChoiceButton, Card, Icon, OptionsMenu, Button } from '../components';
import { resolveLocation } from '../utils/locationResolver';
import { getNodeIconComponent } from '../utils/nodeIcons';
import { getToneStyles } from '../utils/nodeStyles';

interface StoryScreenProps {
  /**
   * Callback to exit story mode (return to home/world map)
   */
  onExit: () => void;

  /**
   * Optional callback to view character sheet
   */
  onViewCharacterSheet?: () => void;
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
export function StoryScreen({ onExit, onViewCharacterSheet }: StoryScreenProps) {
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
    saveNarrativeState,
  } = useNarrativeStore();

  const { character, saveCharacter } = useCharacterStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when log updates
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.log]);

  // Allow story to start without character - campaign may create it
  if (!conversation || !campaign) {
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

  // If no character exists yet (campaign start), show all choices
  // Character creation choices don't require a character
  const availableChoices = character
    ? getAvailableChoices(character)
    : currentNode.choices; // Show all choices when no character exists
  const hasCompanionHint = !!currentNode.companionHint;

  // Get node flavor for presentation
  const tone = currentNode.flavor?.tone;
  const NodeIconComponent = getNodeIconComponent(currentNode.flavor?.icon);
  const toneClasses = getToneStyles(tone);

  const handleChoice = (choiceId: string) => {
    // For character creation choices, character may be null
    // The narrative store will handle character creation specially
    selectChoice(choiceId, character || null);
  };

  const handleCompanionHint = () => {
    requestCompanionHint();
  };

  const handleExit = () => {
    exitConversation();
    onExit();
  };

  const handleSaveGame = () => {
    saveCharacter();
    saveNarrativeState();
    // You could show a toast notification here in the future
  };

  return (
    <div
      className="h-screen bg-primary flex flex-col p-4"
      style={backgroundStyle}
    >
      {/* Header */}
      <div className="mb-4">
        <Card variant="neutral" padding="compact" className={toneClasses}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {NodeIconComponent ? (
                <NodeIconComponent className="w-6 h-6 text-player" />
              ) : (
                <Icon name="Book" className="text-player" />
              )}
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
            <OptionsMenu
              onViewCharacterSheet={onViewCharacterSheet}
              onSaveGame={handleSaveGame}
              onExit={handleExit}
            />
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
