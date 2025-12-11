import { useCombatStore } from '../stores/combatStore';
import type { Creature, CharacterClass } from '../types';
import { createCharacter } from '../utils/characterCreation';
import { CLASSES } from '../data/classes';
import Icon from '../components/Icon';

interface HomeScreenProps {
  onStartCombat: () => void;
  onCreateCharacter: () => void;
  onViewCharacter?: () => void;
  hasCharacter: boolean;
}

export function HomeScreen({ onStartCombat, onCreateCharacter, onViewCharacter, hasCharacter }: HomeScreenProps) {
  const { startCombat } = useCombatStore();

  const handleStartCombat = (className: CharacterClass) => {
    // Create a proper character using the characterCreation utility
    const classDef = CLASSES[className];
    const player = createCharacter({
      name: `Test ${className}`,
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
    const goblin: Creature = {
      name: 'Goblin',
      class: 'Fighter',
      level: 1,
      attributes: {
        STR: 11,
        DEX: 13,
        CON: 12,
        INT: 10,
        WIS: 9,
        CHA: 6,
      },
      hp: 10,
      maxHp: 10,
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
          damage: '1d4',
          damageType: 'piercing',
          finesse: true,
          description: 'A small dagger',
        },
        armor: {
          name: 'Leather',
          baseAC: 8,
          maxDexBonus: null,
          description: 'Light leather armor',
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

    startCombat(player, goblin);
    onStartCombat();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold mb-4">Adventurer RPG</h1>
        <p className="text-gray-300 mb-8">
          A single-player narrative RPG with streamlined d20 mechanics
        </p>

        <div className="bg-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">Phase 1.3 Testing</h2>
          <p className="text-sm text-gray-300">
            Test combat with different classes - Choose your adventurer:
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onCreateCharacter}
            className="w-full px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            Create New Character
          </button>

          {hasCharacter && onViewCharacter && (
            <button
              onClick={onViewCharacter}
              className="w-full px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
            >
              View Character Sheet
            </button>
          )}

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Combat Test</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStartCombat('Fighter')}
                className="px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                <Icon name="Swords" className="inline-block mr-2" aria-hidden="true" /> Fighter
                <div className="text-xs opacity-75 mt-1">Second Wind, Power Attack</div>
              </button>
              <button
                onClick={() => handleStartCombat('Rogue')}
                className="px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Icon name="Lock" className="inline-block mr-2" aria-hidden="true" /> Rogue
                <div className="text-xs opacity-75 mt-1">Sneak Attack, Dodge</div>
              </button>
              <button
                onClick={() => handleStartCombat('Wizard')}
                className="px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icon name="WandSparkles" className="inline-block mr-2" aria-hidden="true" /> Wizard
                <div className="text-xs opacity-75 mt-1">Cantrips, Spells</div>
              </button>
              <button
                onClick={() => handleStartCombat('Cleric')}
                className="px-4 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Icon name="Cross" className="inline-block mr-2" aria-hidden="true" /> Cleric
                <div className="text-xs opacity-75 mt-1">Healing, Turn Undead</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
