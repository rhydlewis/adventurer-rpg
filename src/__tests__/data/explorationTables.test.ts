import { describe, it, expect } from 'vitest';
import { EXPLORATION_TABLES, getExplorationTable } from '../../data/explorationTables';
import { validateExplorationTable } from '../../utils/exploration';

describe('Exploration Tables Data', () => {
  it('should have forest exploration table', () => {
    expect(EXPLORATION_TABLES['forest-exploration']).toBeDefined();
  });

  it('should have weights that sum to 100', () => {
    const table = getExplorationTable('forest-exploration');
    const isValid = validateExplorationTable(table);

    expect(isValid).toBe(true);
  });

  it('should have 4 encounter types (60/20/10/10 split)', () => {
    const table = getExplorationTable('forest-exploration');

    expect(table.encounters).toHaveLength(4);
    expect(table.encounters[0].weight).toBe(60); // Combat
    expect(table.encounters[1].weight).toBe(20); // Treasure
    expect(table.encounters[2].weight).toBe(10); // Vignette
    expect(table.encounters[3].weight).toBe(10); // Nothing
  });

  it('should reference valid item IDs', () => {
    const table = getExplorationTable('forest-exploration');
    const treasureOutcome = table.encounters[1].outcome;

    if (treasureOutcome.type === 'treasure') {
      expect(treasureOutcome.items).toContain('healing-potion');
      expect(treasureOutcome.items).toContain('antidote');
    }
  });
});
