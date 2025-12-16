import type { LootTable } from '../types/loot';

export const LOOT_TABLES: Record<string, LootTable> = {
    bandit_loot: {
        id: 'bandit_loot',
        entries: [
            { type: 'gold', chance: 0.8, goldRange: { min: 3, max: 8 } },
            { type: 'item', chance: 0.2, itemId: 'healing_potion' },
        ],
    },

    skeleton_loot: {
        id: 'skeleton_loot',
        entries: [
            { type: 'gold', chance: 0.3, goldRange: { min: 1, max: 3 } },
        ],
    },

    wraith_loot: {
        id: 'wraith_loot',
        entries: [
            { type: 'gold', chance: 0.5, goldRange: { min: 5, max: 12 } },
            { type: 'item', chance: 0.1, itemId: 'arcane_scroll' },
        ],
    },

    spider_loot: {
        id: 'spider_loot',
        entries: [
            { type: 'gold', chance: 0.2, goldRange: { min: 1, max: 3 } },
        ],
    },

    // Empty loot table for enemies that don't drop anything
    no_loot: {
        id: 'no_loot',
        entries: [],
    },
};

/**
 * Get loot table by ID
 */
export function getLootTable(id: string): LootTable | null {
    return LOOT_TABLES[id] ?? null;
}