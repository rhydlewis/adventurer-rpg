import { useCombatStore } from '../stores/combatStore';
import type { Character, Creature } from '../types';

interface HomeScreenProps {
  onStartCombat: () => void;
}

export function HomeScreen({ onStartCombat }: HomeScreenProps) {
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
      hp: 6,
      maxHp: 6,
      ac: 15,
      bab: 1,
      saves: {
        fortitude: 1,
        reflex: 1,
        will: -1,
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

        <button
          onClick={handleStartCombat}
          className="w-full px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Start Combat
        </button>
      </div>
    </div>
  );
}
