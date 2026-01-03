import {Button, Card, Icon} from '../components';
import type {CharacterClass, Screen} from "../types";
import {useCombatStore} from "../stores/combatStore.ts";
import {CLASSES} from "../data/classes.ts";
import {createCharacter} from "../utils/characterCreation.ts";
import {DEFAULT_AVATAR} from "../data/avatars.ts";
import {generateEnemy} from "../utils/enemyGeneration.ts";
import {triggerLevelUp} from "../utils/levelUpTrigger.ts";
import {useCharacterStore} from "../stores/characterStore.ts";

interface TestingScreenProps {
  onStartCombat: () => void;
  onCreateCharacter: () => void;
  onViewCharacter?: () => void;
  onNavigate?: (screen: Screen) => void;
}


/**
 * SplashScreen - Initial startup screen with game title and branding
 *
 * Features:
 * - Two-line title: "Adventurer" + "RPG" (larger)
 * - Placeholder icon/image
 * - Auto-advance to main menu after 2.5 seconds
 * - Tap anywhere to skip
 * - Fade-in animation
 */
export function TestingScreen({ onStartCombat, onCreateCharacter, onViewCharacter, onNavigate }: TestingScreenProps) {
  const { startCombat } = useCombatStore();

  const handleStartCombat = (className: CharacterClass) => {
    // Create a proper character using the characterCreation utility
    const classDef = CLASSES[className];
    const player = createCharacter({
      name: `Test ${className}`,
      avatarPath: DEFAULT_AVATAR,
      class: className,
      attributes: classDef.recommendedAttributes,
      skillRanks: {
        Athletics: 0,
        Stealth: 0,
        Perception: 0,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 0,
      },
      selectedFeat: className === 'Fighter' ? 'Weapon Focus' : undefined,
    });

    // Generate a random skeleton enemy
    const skeleton = generateEnemy('skeleton');
    if (!skeleton) {
      console.error('Failed to generate skeleton enemy');
      return;
    }

    startCombat(player, skeleton);
    onStartCombat();
  };

  const handleTestLockPicking = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!onNavigate) return;
    onNavigate({
      type: 'lockPicking',
      difficulty,
      onSuccess: () => {
        console.log('Lock picked successfully!');
        onNavigate({ type: 'home' });
      },
      onFailure: () => {
        console.log('Lock picking failed!');
        onNavigate({ type: 'home' });
      },
    });
  };

  const handleTestLevelUp = (className: CharacterClass, level: number) => {
    if (!onNavigate) return;

    // Create a test character at level 1
    const classDef = CLASSES[className];
    const testChar = createCharacter({
      name: `Test ${className}`,
      avatarPath: DEFAULT_AVATAR,
      class: className,
      attributes: classDef.recommendedAttributes,
      skillRanks: {
        Athletics: 1,
        Stealth: 0,
        Perception: 1,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 0,
      },
      selectedFeat: className === 'Fighter' ? 'Weapon Focus' : undefined,
    });

    // Set as current character
    useCharacterStore.getState().setCharacter(testChar);

    // Trigger level-up
    const success = triggerLevelUp(level);
    if (success) {
      console.log(`Level-up to ${level} triggered for ${className}`);
      onNavigate({ type: 'levelUp' });
    } else {
      console.error('Failed to trigger level-up');
    }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-fg-primary p-4">
        <div className="max-w-md w-full text-center">
          {/* Title Section */}
          <h1 className="heading-display text-[32px] leading-[1.2] mb-2 text-fg-accent">
            Adventurer RPG - TESTING
          </h1>

          <div className="space-y-3 mb-6">
            <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={onCreateCharacter}
                icon={<Icon name="UserPlus" />}
            >
              Create New Character
            </Button>

            {onViewCharacter && (
                <Button
                    variant="secondary"
                    size="large"
                    fullWidth
                    onClick={onViewCharacter}
                    icon={<Icon name="User" />}
                >
                  View Character Sheet
                </Button>
            )}
          </div>

          {/* Quick Combat Test Section */}
          <Card variant="neutral" padding="compact">
            <h3 className="heading-tertiary text-body mb-3">Quick Combat Test</h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Fighter Button */}
              <button
                  onClick={() => handleStartCombat('Fighter')}
                  className="
                px-3 py-3
                bg-enemy text-white
                button-text text-body
                rounded-lg
                hover:bg-red-700 active:bg-red-800
                transition-all duration-200
                active:scale-[0.98]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player
                focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                min-h-[44px]
              "
              >
                <Icon name="Swords" className="inline-block mr-1" size={18} aria-hidden="true" />
                <span>Fighter</span>
                <div className="text-caption opacity-75 mt-1">Second Wind, Power Attack</div>
              </button>

              {/* Rogue Button */}
              <button
                  onClick={() => handleStartCombat('Rogue')}
                  className="
                px-3 py-3
                bg-magic text-white
                button-text text-body
                rounded-lg
                hover:bg-purple-700 active:bg-purple-800
                transition-all duration-200
                active:scale-[0.98]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player
                focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                min-h-[44px]
              "
              >
                <Icon name="Lock" className="inline-block mr-1" size={18} aria-hidden="true" />
                <span>Rogue</span>
                <div className="text-caption opacity-75 mt-1">Sneak Attack, Dodge</div>
              </button>

              {/* Wizard Button */}
              <button
                  onClick={() => handleStartCombat('Wizard')}
                  className="
                px-3 py-3
                bg-player text-white
                button-text text-body
                rounded-lg
                hover:bg-blue-600 active:bg-blue-700
                transition-all duration-200
                active:scale-[0.98]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player
                focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                min-h-[44px]
              "
              >
                <Icon name="WandSparkles" className="inline-block mr-1" size={18} aria-hidden="true" />
                <span>Wizard</span>
                <div className="text-caption opacity-75 mt-1">Cantrips, Spells</div>
              </button>

              {/* Cleric Button */}
              <button
                  onClick={() => handleStartCombat('Cleric')}
                  className="
                px-3 py-3
                bg-warning text-white
                button-text text-body
                rounded-lg
                hover:bg-yellow-600 active:bg-yellow-700
                transition-all duration-200
                active:scale-[0.98]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-player
                focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                min-h-[44px]
              "
              >
                <Icon name="Cross" className="inline-block mr-1" size={18} aria-hidden="true" />
                <span>Cleric</span>
                <div className="text-caption opacity-75 mt-1">Healing, Turn Undead</div>
              </button>
            </div>
          </Card>

          {/* Test Lock Picking Minigame (Prototype) */}
          {onNavigate && (
              <Card variant="neutral" padding="compact" className="mt-3 border-warning">
                <p className="text-caption text-fg-primary label-primary mb-2 text-center">
                  🔒 Prototype: Lock Picking Minigame
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                      onClick={() => handleTestLockPicking('easy')}
                      className="px-2 py-2 bg-success text-white button-text text-caption rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 active:scale-[0.98]"
                  >
                    Easy
                  </button>
                  <button
                      onClick={() => handleTestLockPicking('medium')}
                      className="px-2 py-2 bg-warning text-white button-text text-caption rounded-lg hover:bg-yellow-600 active:bg-yellow-700 transition-all duration-200 active:scale-[0.98]"
                  >
                    Medium
                  </button>
                  <button
                      onClick={() => handleTestLockPicking('hard')}
                      className="px-2 py-2 bg-enemy text-white button-text text-caption rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 active:scale-[0.98]"
                  >
                    Hard
                  </button>
                </div>
              </Card>
          )}

          {/* Test Timing Minigame (Prototype) */}
          {onNavigate && (
              <Card variant="neutral" padding="compact" className="mt-3 border-magic">
                <p className="text-caption text-fg-primary label-primary mb-2 text-center">
                  🎯 Prototype: Symbol Match Minigame
                </p>
                <button
                    onClick={() => onNavigate({
                      type: 'timingGame',
                      onSuccess: () => {
                        console.log('Timing game completed successfully!');
                        onNavigate({ type: 'home' });
                      },
                      onFailure: () => {
                        console.log('Timing game exited without completion.');
                        onNavigate({ type: 'home' });
                      },
                    })}
                    className="w-full px-3 py-2 bg-magic text-white button-text text-caption rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-all duration-200 active:scale-[0.98]"
                >
                  Play Timing Game
                </button>
              </Card>
          )}

          {/* Test Level-Up System */}
          {onNavigate && (
              <Card variant="neutral" padding="compact" className="mt-3 border-success">
                <p className="text-caption text-fg-primary label-primary mb-2 text-center">
                  ⬆️ Test: Level-Up System (Phase 4)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                      onClick={() => handleTestLevelUp('Fighter', 2)}
                      className="px-2 py-2 bg-enemy text-white button-text text-caption rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 active:scale-[0.98]"
                  >
                    Fighter → L2
                    <div className="text-[10px] opacity-75 mt-1">Feat + Skills</div>
                  </button>
                  <button
                      onClick={() => handleTestLevelUp('Rogue', 2)}
                      className="px-2 py-2 bg-magic text-white button-text text-caption rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-all duration-200 active:scale-[0.98]"
                  >
                    Rogue → L2
                    <div className="text-[10px] opacity-75 mt-1">Skills</div>
                  </button>
                  <button
                      onClick={() => handleTestLevelUp('Wizard', 2)}
                      className="px-2 py-2 bg-player text-white button-text text-caption rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 active:scale-[0.98]"
                  >
                    Wizard → L2
                    <div className="text-[10px] opacity-75 mt-1">Spells + Skills</div>
                  </button>
                  <button
                      onClick={() => handleTestLevelUp('Cleric', 2)}
                      className="px-2 py-2 bg-success text-white button-text text-caption rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 active:scale-[0.98]"
                  >
                    Cleric → L2
                    <div className="text-[10px] opacity-75 mt-1">Spells + Skills</div>
                  </button>
                </div>
              </Card>
          )}

          {/* Test Canvas World Map (Phase 5 POC) */}
          {onNavigate && (
              <Card variant="neutral" padding="compact" className="mt-3 border-player">
                <p className="text-caption text-fg-primary label-primary mb-2 text-center">
                  🗺️ POC: Canvas World Map (Phase 5)
                </p>
                <button
                    onClick={() => onNavigate({ type: 'worldMapCanvas' })}
                    className="w-full px-3 py-2 bg-player text-white button-text text-caption rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 active:scale-[0.98]"
                >
                  View Canvas Map
                  <div className="text-[10px] opacity-75 mt-1">Pan, Zoom, Navigate</div>
                </button>
              </Card>
          )}

          {/* Test Leaflet World Map (Phase 5 POC) */}
          {onNavigate && (
              <Card variant="neutral" padding="compact" className="mt-3 border-success">
                <p className="text-caption text-fg-primary label-primary mb-2 text-center">
                  🗺️ POC: Leaflet.js World Map (Phase 5)
                </p>
                <button
                    onClick={() => onNavigate({ type: 'worldMapLeaflet' })}
                    className="w-full px-3 py-2 bg-success text-white button-text text-caption rounded-lg hover:bg-green-600 active:bg-green-700 transition-all duration-200 active:scale-[0.98]"
                >
                  View Leaflet Map
                  <div className="text-[10px] opacity-75 mt-1">Native Pan/Zoom, Markers</div>
                </button>
              </Card>
          )}
        </div>
      </div>
  );
}