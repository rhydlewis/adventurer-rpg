import { describe, it, expect, vi } from 'vitest';
import { rollExplorationTable } from '../../utils/exploration';
import type { ExplorationTable } from '../../types';

describe('Exploration System', () => {
  const mockTable: ExplorationTable = {
    id: 'test-forest',
    locationId: 'forest',
    encounters: [
      { weight: 60, outcome: { type: 'combat', enemyId: 'wolf', goldReward: 30 } },
      { weight: 20, outcome: { type: 'treasure', gold: 50, items: ['healing-potion'] } },
      { weight: 10, outcome: { type: 'vignette', description: 'Ancient carvings...', flavorOnly: true } },
      { weight: 10, outcome: { type: 'nothing', message: 'Empty clearing' } },
    ],
  };

  it('should roll combat on d100 <= 60', () => {
    // Mock d100 roll to 30 (within combat range 1-60)
    vi.spyOn(Math, 'random').mockReturnValue(0.29); // 0.29 * 100 = 29

    const outcome = rollExplorationTable(mockTable);

    expect(outcome.type).toBe('combat');
    if (outcome.type === 'combat') {
      expect(outcome.enemyId).toBe('wolf');
      expect(outcome.goldReward).toBe(30);
    }
  });

  it('should roll treasure on d100 61-80', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.70); // 70 (within treasure range 61-80)

    const outcome = rollExplorationTable(mockTable);

    expect(outcome.type).toBe('treasure');
    if (outcome.type === 'treasure') {
      expect(outcome.gold).toBe(50);
      expect(outcome.items).toContain('healing-potion');
    }
  });

  it('should roll vignette on d100 81-90', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.85); // 85

    const outcome = rollExplorationTable(mockTable);

    expect(outcome.type).toBe('vignette');
  });

  it('should roll nothing on d100 91-100', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.95); // 95

    const outcome = rollExplorationTable(mockTable);

    expect(outcome.type).toBe('nothing');
  });

  it('should validate total weights equal 100', () => {
    const totalWeight = mockTable.encounters.reduce((sum, e) => sum + e.weight, 0);
    expect(totalWeight).toBe(100);
  });
});
