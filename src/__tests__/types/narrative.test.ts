import { describe, it, expect } from 'vitest';
import type { Choice, ExplorationOutcome } from '../../types';

describe('Narrative Type with Exploration', () => {
  it('should allow Choice with exploration outcomes', () => {
    const combatOutcome: ExplorationOutcome = {
      type: 'combat',
      enemyId: 'goblin-1',
      goldReward: 30,
    };

    const treasureOutcome: ExplorationOutcome = {
      type: 'treasure',
      gold: 50,
      items: ['healing-potion'],
    };

    const vignetteOutcome: ExplorationOutcome = {
      type: 'vignette',
      description: 'You find ancient runes carved into the wall.',
      flavorOnly: true,
    };

    const nothingOutcome: ExplorationOutcome = {
      type: 'nothing',
      message: 'You search thoroughly but find nothing of interest.',
    };

    const choice: Choice = {
      id: 'explore-room',
      text: 'Explore the dark chamber',
      outcome: { type: 'exit' },
      explorationOutcome: combatOutcome,
    };

    expect(choice.explorationOutcome?.type).toBe('combat');
    expect(combatOutcome.enemyId).toBe('goblin-1');
    expect(combatOutcome.goldReward).toBe(30);
    expect(treasureOutcome.gold).toBe(50);
    expect(vignetteOutcome.description).toContain('ancient runes');
    expect(nothingOutcome.type).toBe('nothing');
  });
});
