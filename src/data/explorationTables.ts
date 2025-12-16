import type { ExplorationTable } from '../types/narrative';

/**
 * Exploration Tables for Validation Campaign
 * Weighted encounter tables (weights must sum to 100)
 */

export const EXPLORATION_TABLES: Record<string, ExplorationTable> = {
  'forest-exploration': {
    id: 'forest-exploration',
    locationId: 'validation-forest',
    encounters: [
      // 60% Combat encounter
      {
        weight: 60,
        outcome: {
          type: 'combat',
          enemyId: 'bandit', // Using bandit since wolf doesn't exist yet
          goldReward: 30,
          itemReward: 'healing-potion',
        },
      },

      // 20% Treasure find
      {
        weight: 20,
        outcome: {
          type: 'treasure',
          gold: 50,
          items: ['healing-potion', 'antidote'],
        },
      },

      // 10% Atmospheric vignette
      {
        weight: 10,
        outcome: {
          type: 'vignette',
          description: 'You discover ancient carvings on a gnarled tree. The symbols glow faintly in the dim forest light, telling a story of a great battle fought here centuries ago. The air feels heavy with old magic.',
          flavorOnly: true,
        },
      },

      // 10% Nothing found
      {
        weight: 10,
        outcome: {
          type: 'nothing',
          message: 'You search the area thoroughly but find nothing of interest. An empty clearing greets you, silent and still.',
        },
      },
    ],
  },
};

// Helper to get exploration table by ID
export function getExplorationTable(id: string): ExplorationTable {
  const table = EXPLORATION_TABLES[id];
  if (!table) {
    throw new Error(`Exploration table not found: ${id}`);
  }
  return table;
}
