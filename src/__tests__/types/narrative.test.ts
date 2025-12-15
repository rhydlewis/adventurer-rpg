import { describe, it, expect } from 'vitest';
import type { Choice, ExplorationOutcome } from '../../types/narrative';

describe('Narrative Type with Exploration', () => {
  it('should allow Choice with exploration outcomes', () => {
    const combatOutcome: ExplorationOutcome = {
      type: 'combat',
      enemyId: 'goblin-1',
    };

    const treasureOutcome: ExplorationOutcome = {
      type: 'treasure',
      loot: { gold: 50, items: ['healing-potion'] },
    };

    const vignetteOutcome: ExplorationOutcome = {
      type: 'vignette',
      text: 'You find ancient runes carved into the wall.',
    };

    const nothingOutcome: ExplorationOutcome = {
      type: 'nothing',
      text: 'You search thoroughly but find nothing of interest.',
    };

    const choice: Choice = {
      id: 'explore-room',
      text: 'Explore the dark chamber',
      outcome: { type: 'exit' },
      explorationOutcome: combatOutcome,
    };

    expect(choice.explorationOutcome?.type).toBe('combat');
    expect(combatOutcome.enemyId).toBe('goblin-1');
    expect(treasureOutcome.loot.gold).toBe(50);
    expect(vignetteOutcome.text).toContain('ancient runes');
    expect(nothingOutcome.type).toBe('nothing');
  });
});
