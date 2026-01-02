import type { ExplorationTable } from '../../types';

export const towerApproachEncounters: ExplorationTable = {
  id: 'tower-approach-encounters',
  locationId: 'tower-approach',
  encounters: [
    {
      weight: 50,
      outcome: {
        type: 'combat',
        enemyId: 'skeleton',
        goldReward: 15,
      },
    },
    {
      weight: 25,
      outcome: {
        type: 'combat',
        enemyId: 'zombie',
        goldReward: 20,
        itemReward: 'healing-potion',
      },
    },
    {
      weight: 15,
      outcome: {
        type: 'treasure',
        gold: 40,
        items: ['antidote'],
      },
    },
    {
      weight: 10,
      outcome: {
        type: 'vignette',
        description: 'Rusted weapons and armor litter the courtyard. Many have tried to breach this tower before you.',
        flavorOnly: true,
      },
    },
  ],
};
