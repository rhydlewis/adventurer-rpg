import type { ExplorationTable } from '../../types';

export const blackwoodEncounters: ExplorationTable = {
  id: 'blackwood-encounters',
  locationId: 'blackwood-forest',
  encounters: [
    {
      weight: 40,
      outcome: {
        type: 'combat',
        enemyId: 'wolf',
        goldReward: 10,
      },
    },
    {
      weight: 30,
      outcome: {
        type: 'combat',
        enemyId: 'bandit',
        goldReward: 30,
        itemReward: 'rusty-sword',
      },
    },
    {
      weight: 15,
      outcome: {
        type: 'treasure',
        gold: 50,
        items: ['healing-potion'],
      },
    },
    {
      weight: 10,
      outcome: {
        type: 'vignette',
        description: 'You find a moss-covered statue of a forgotten hero. The forest has long since reclaimed this place.',
        flavorOnly: true,
      },
    },
    {
      weight: 5,
      outcome: {
        type: 'nothing',
        message: 'You search the undergrowth carefully, but find nothing of interest.',
      },
    },
  ],
};
