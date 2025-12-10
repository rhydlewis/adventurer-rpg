import { useCombatStore } from '../stores/combatStore';
import type { Character, Creature } from '../types';

interface HomeScreenProps {
  onStartCombat: () => void;
  onCreateCharacter: () => void;
  onViewCharacter?: () => void;
  hasCharacter: boolean;
}

export function HomeScreen({ onStartCombat, onCreateCharacter, onViewCharacter, hasCharacter }: HomeScreenProps) {
  const { startCombat } = useCombatStore();

  const handleStartCombat = () => {
    // Create a sample player character
    const player: Character = {
      name: 'Adventurer',
      class: 'Fighter',
      level: 1,
      attributes: {
        STR: 16,
        DEX: 14,
        CON: 14,
        INT: 10,
        WIS: 12,
        CHA: 10,
      },
      hp: 12,
      maxHp: 12,
      ac: 16,
      bab: 1,
      saves: {
        fortitude: 2,
        reflex: 0,
        will: 0,
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
          name: 'Longsword',
          damage: '1d8',
          damageType: 'slashing',
          finesse: false,
          description: 'A standard longsword',
        },
        armor: {
          name: 'Chainmail',
          baseAC: 16,
          maxDexBonus: 2,
          description: 'Standard chainmail armor',
        },
        shield: {
          equipped: true,
          acBonus: 2,
        },
        items: [],
      },
      resources: {
        abilities: [],
      },
    };

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
      hp: 12,
      maxHp: 12,
      ac: 15,
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
          baseAC: 12,
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
          <h2 className="text-xl font-semibold mb-2">Walking Skeleton Demo</h2>
          <p className="text-sm text-gray-300">
            Test combat encounter: Level 1 Fighter vs Goblin
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

          <button
            onClick={handleStartCombat}
            className="w-full px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Combat (Walking Skeleton)
          </button>
        </div>
      </div>
    </div>
  );
}
