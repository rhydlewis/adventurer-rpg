import { Button, Icon } from '../components';
import type { SaveMetadata } from '../types/gameSave';

interface MainMenuScreenProps {
  onNewGame: () => void;
  onContinue?: () => void;
  continueMetadata?: SaveMetadata;
  onTesting?: () => void;
  onOptions?: () => void;
  onCredits?: () => void;
}

/**
 * Helper function for timestamp formatting
 */
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * MainMenuScreen - Primary navigation hub for the game
 *
 * Features:
 * - Single column, thumb-friendly layout
 * - Primary action emphasized (New Game)
 * - Disabled options for future features
 * - Version number at bottom
 * - Animated background (parchment texture effect)
 */
export function MainMenuScreen({
  onNewGame,
  onContinue,
  continueMetadata,
  onTesting,
  onOptions,
  onCredits,
}: MainMenuScreenProps) {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-transparent to-secondary/20 animate-pulse-slow pointer-events-none" />

      {/* Subtle campfire flicker effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-warning/5 via-transparent to-transparent animate-flicker pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-display heading-display text-fg-accent mb-2">
            ADVENTURER RPG
          </h1>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-text-accent to-transparent mx-auto w-full max-w-xs" />
        </div>

        {/* Menu Options */}
        <div className="w-full space-y-3">
          <Button
            variant="primary"
            fullWidth
            size="large"
            icon={<Icon name="Play" size={20} />}
            onClick={onNewGame}
          >
            New Game
          </Button>

          {/* Continue Button */}
          {continueMetadata ? (
            <button
              onClick={onContinue}
              className="w-full px-6 py-4 bg-secondary hover:bg-secondary-hover active:bg-secondary-active border border-border-default rounded-md transition-colors text-left"
            >
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center space-x-2">
                  <Icon name="RotateCcw" size={20} />
                  <span className="heading-tertiary">Continue</span>
                </div>
                <span className="body-secondary text-sm">
                  {continueMetadata.characterName} (Level {continueMetadata.characterLevel})
                </span>
                <span className="body-muted text-xs">
                  Last played {formatTimestamp(continueMetadata.lastPlayedTimestamp)}
                </span>
              </div>
            </button>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              size="default"
              icon={<Icon name="RotateCcw" size={20} />}
              disabled
            >
              Continue
            </Button>
          )}

          <Button
            variant="secondary"
            fullWidth
            size="default"
            icon={<Icon name="Settings" size={20} />}
            disabled={!onOptions}
            onClick={onOptions}
          >
            Options
          </Button>

          <Button
            variant="secondary"
            fullWidth
            size="default"
            icon={<Icon name="Info" size={20} />}
            disabled={!onCredits}
            onClick={onCredits}
          >
            Credits
          </Button>

          <Button
              variant="secondary"
              fullWidth
              size="default"
              icon={<Icon name="TestTube" size={20} />}
              onClick={onTesting}
          >
            Testing
          </Button>

        </div>

        {/* Decorative divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-border-default to-transparent w-full max-w-xs mt-12" />
      </div>

      {/* Version Number */}
      <div className="z-10 text-fg-muted text-caption label-secondary">
        v{__APP_VERSION__}
      </div>
    </div>
  );
}
