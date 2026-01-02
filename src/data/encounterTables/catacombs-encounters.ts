import type { ExplorationTable } from '../../types';

export const catacombsEncounters: ExplorationTable = {
  id: 'catacombs-encounters',
  locationId: 'catacombs',
  encounters: [
    {
      weight: 45,
      outcome: {
        type: 'combat',
        enemyId: 'ghoul',
        goldReward: 30,
      },
    },
    {
      weight: 30,
      outcome: {
        type: 'combat',
        enemyId: 'wraith',
        goldReward: 60,
        itemReward: 'magic-ring',
      },
    },
    {
      weight: 15,
      outcome: {
        type: 'treasure',
        gold: 100,
        items: ['greater-healing-potion', 'enchanted-amulet'],
      },
    },
    {
      weight: 10,
      outcome: {
        type: 'vignette',
        description: 'Rows of stone sarcophagi stretch into the darkness. The names carved upon them have long since faded.',
        flavorOnly: true,
      },
    },
  ],
};
