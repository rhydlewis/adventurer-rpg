import { describe, it, expect } from 'vitest';
import type { Choice, ExplorationOutcome, StoryNode, NodeType, NodeTone } from '../../types';

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

describe('StoryNode with type and flavor', () => {
  it('accepts optional type field', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      type: 'combat',
      choices: [],
    };
    expect(node.type).toBe('combat');
  });

  it('accepts optional flavor with tone', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      flavor: { tone: 'danger' },
      choices: [],
    };
    expect(node.flavor?.tone).toBe('danger');
  });

  it('accepts optional flavor with icon', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      flavor: { icon: 'sword' },
      choices: [],
    };
    expect(node.flavor?.icon).toBe('sword');
  });

  it('accepts optional flavor with both tone and icon', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      flavor: { tone: 'danger', icon: 'sword' },
      choices: [],
    };
    expect(node.flavor?.tone).toBe('danger');
    expect(node.flavor?.icon).toBe('sword');
  });

  it('works without type or flavor (backwards compatible)', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'Legacy node',
      choices: [],
    };
    expect(node.type).toBeUndefined();
    expect(node.flavor).toBeUndefined();
  });

  it('accepts all valid NodeType values', () => {
    const types: NodeType[] = ['explore', 'dialogue', 'event', 'combat'];
    types.forEach((type) => {
      const node: StoryNode = {
        id: 'test',
        description: 'Test',
        type,
        choices: [],
      };
      expect(node.type).toBe(type);
    });
  });

  it('accepts all valid NodeTone values', () => {
    const tones: NodeTone[] = ['calm', 'tense', 'mysterious', 'danger', 'triumphant', 'urgent'];
    tones.forEach((tone) => {
      const node: StoryNode = {
        id: 'test',
        description: 'Test',
        flavor: { tone },
        choices: [],
      };
      expect(node.flavor?.tone).toBe(tone);
    });
  });
});
