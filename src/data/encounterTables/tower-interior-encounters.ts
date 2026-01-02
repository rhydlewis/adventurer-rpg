import type { ExplorationTable } from '../../types';

export const towerInteriorEncounters: ExplorationTable = {
  id: 'tower-interior-encounters',
  locationId: 'tower-interior',
  encounters: [
    {
      weight: 40,
      outcome: {
        type: 'combat',
        enemyId: 'skeleton',
        goldReward: 25,
      },
    },
    {
      weight: 30,
      outcome: {
        type: 'combat',
        enemyId: 'wraith',
        goldReward: 50,
        itemReward: 'magic-scroll',
      },
    },
    {
      weight: 20,
      outcome: {
        type: 'treasure',
        gold: 75,
        items: ['healing-potion', 'antidote'],
      },
    },
    {
      weight: 10,
      outcome: {
        type: 'vignette',
        description: 'Ancient tapestries depicting dark rituals line the walls. You feel a chill run down your spine.',
        flavorOnly: true,
      },
    },
  ],
};
