import { describe, it, expect, vi } from 'vitest';
import { rollLoot, formatLootMessage } from '../../utils/loot';

describe('Loot Rolling', () => {
    it('should return empty array for unknown loot table', () => {
        const drops = rollLoot('unknown_table');
        expect(drops).toEqual([]);
    });

    it('should return empty array for no_loot table', () => {
        const drops = rollLoot('no_loot');
        expect(drops).toEqual([]);
    });

    it('should return loot drops (probabilistic test)', () => {
        // Run multiple times to account for randomness
        let gotGold = false;
        let gotItem = false;

        for (let i = 0; i < 100; i++) {
            const drops = rollLoot('bandit_loot');
            drops.forEach(drop => {
                if (drop.type === 'gold') gotGold = true;
                if (drop.type === 'item') gotItem = true;
            });
        }

            // With 100 runs, we should see at least one gold drop (80% chance per roll)
            expect(gotGold).toBe(true);
            // With 100 runs, we should also see an item drop (20% chance per roll)
            expect(gotItem).toBe(true);    });

    it('should return gold in valid range', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // Force drop

        const drops = rollLoot('bandit_loot');
        const goldDrop = drops.find(d => d.type === 'gold');

        if (goldDrop?.amount) {
            expect(goldDrop.amount).toBeGreaterThanOrEqual(3);
            expect(goldDrop.amount).toBeLessThanOrEqual(8);
        }

        vi.restoreAllMocks();
    });

    it('should format gold drop message', () => {
        const drops = [{ type: 'gold' as const, amount: 5 }];
        const message = formatLootMessage(drops);
        expect(message).toBe('Obtained: 5 gold');
    });

    it('should format item drop message', () => {
        const drops = [{ type: 'item' as const, itemId: 'healing_potion', quantity: 1 }];
        const message = formatLootMessage(drops);
        expect(message).toBe('Obtained: healing_potion');
    });

    it('should format multiple drops', () => {
        const drops = [
            { type: 'gold' as const, amount: 10 },
            { type: 'item' as const, itemId: 'dagger', quantity: 1 },
        ];
        const message = formatLootMessage(drops);
        expect(message).toBe('Obtained: 10 gold, dagger');
    });

    it('should format quantity for stacked items', () => {
        const drops = [{ type: 'item' as const, itemId: 'arrow', quantity: 20 }];
        const message = formatLootMessage(drops);
        expect(message).toBe('Obtained: 20x arrow');
    });

    it('should handle empty drops', () => {
        const message = formatLootMessage([]);
        expect(message).toBe('No loot dropped.');
    });
});