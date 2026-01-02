import type { ExplorationTable } from '../../types';

export const voidSanctumEncounters: ExplorationTable = {
  id: 'void-sanctum-encounters',
  locationId: 'void-sanctum',
  encounters: [
    {
      weight: 50,
      outcome: {
        type: 'combat',
        enemyId: 'void-wraith',
        goldReward: 75,
      },
    },
    {
      weight: 30,
      outcome: {
        type: 'combat',
        enemyId: 'death-knight',
        goldReward: 100,
        itemReward: 'legendary-weapon',
      },
    },
    {
      weight: 20,
      outcome: {
        type: 'treasure',
        gold: 150,
        items: ['supreme-healing-potion', 'enchanted-armor'],
      },
    },
  ],
};
