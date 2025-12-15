import { useCombatStore } from '../stores/combatStore';
import type { Creature, CharacterClass } from '../types';
import { createCharacter } from '../utils/characterCreation';
import { CLASSES } from '../data/classes';
import { Button, Card, Icon } from '../components';
import { DEFAULT_AVATAR } from '../data/avatars';
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from '../data/creatureAvatars';

interface HomeScreenProps {
  onStartCombat: () => void;
  onCreateCharacter: () => void;
  onViewCharacter?: () => void;
  onStartStory?: () => void;
  hasCharacter: boolean;
}

export function HomeScreen({ onStartCombat, onCreateCharacter, onViewCharacter, onStartStory, hasCharacter }: HomeScreenProps) {
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

    // Create a sample enemy
    const skeleton: Creature = {
      name: 'Skeleton',
      avatarPath: CREATURE_AVATARS['Skeleton'] ?? DEFAULT_CREATURE_AVATAR,
      class: 'Fighter',
      level: 1,
      attributes: {
        STR: 13,
        DEX: 15,
        CON: 10,
        INT: 6,
        WIS: 8,
        CHA: 5,
      },
      hp: 12,
      maxHp: 12,
      ac: 10,
      bab: 1,
      saves: {
        fortitude: 1,
        reflex: 1,
        will: -1,
      },
      skills: {
        Athletics: 0,
        Stealth: 0,
        Perception: 0,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 0,
      },
      feats: [],
      equipment: {
        weapon: {
          name: 'Dagger',
          damage: '1d6',
          damageType: 'slashing',
          finesse: false,
          description: 'A corroded blade wielded by the undead',
        },
        armor: {
          name: 'Leather',
          baseAC: 10,
          maxDexBonus: null,
          description: 'Tattered leather armor',
        },
        shield: {
          equipped: false,
          acBonus: 0,
        },
        items: [],
      },
      resources: {
        abilities: [],
      },
    };

    startCombat(player, skeleton);
    onStartCombat();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-md w-full text-center">
        {/* Title Section */}
        <h1 className="heading-display text-[32px] leading-[1.2] mb-2 text-text-accent">
          Adventurer RPG
        </h1>
        <p className="body-narrative text-[16px] text-text-primary/80 mb-8">
          A single-player narrative RPG with streamlined d20 mechanics
        </p>

        {/* Phase Info Card */}
        {/*<Card variant="neutral" className="mb-6">*/}
        {/*  <h2 className="heading-secondary text-h1 mb-2">Phase 2 Testing</h2>*/}
        {/*  <p className="body-primary text-body text-text-primary/70">*/}
        {/*    Test combat with different classes - Choose your adventurer:*/}
        {/*  </p>*/}
        {/*</Card>*/}

        {/* Main Actions */}
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

          {hasCharacter && onViewCharacter && (
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

          {onStartStory && (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={onStartStory}
              icon={<Icon name="Book" />}
            >
              Start Story {!hasCharacter && '(Test)'}
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
      </div>
    </div>
  );
}
