import { describe, it, expect } from 'vitest';
import { LOOT_TABLES, getLootTable } from '../../data/lootTables';

describe('Loot Tables', () => {
    it('should have loot tables defined', () => {
        expect(Object.keys(LOOT_TABLES).length).toBeGreaterThan(0);
    });

    it('should have bandit_loot table', () => {
        const table = getLootTable('bandit_loot');
        expect(table).toBeDefined();
        expect(table?.id).toBe('bandit_loot');
        expect(table?.entries.length).toBeGreaterThan(0);
    });

    it('should have no_loot table for enemies with no drops', () => {
        const table = getLootTable('no_loot');
        expect(table?.entries).toEqual([]);
    });

    it('should return null for unknown loot table', () => {
        const table = getLootTable('unknown_table');
        expect(table).toBeNull();
    });

    it('should have valid chance values (0-1)', () => {
        Object.values(LOOT_TABLES).forEach(table => {
            table.entries.forEach(entry => {
                expect(entry.chance).toBeGreaterThanOrEqual(0);
                expect(entry.chance).toBeLessThanOrEqual(1);
            });
        });
    });

    it('should have gold ranges with min <= max', () => {
        Object.values(LOOT_TABLES).forEach(table => {
            table.entries.forEach(entry => {
                if (entry.goldRange) {
                    expect(entry.goldRange.min).toBeLessThanOrEqual(entry.goldRange.max);
                }
            });
        });
    });
});