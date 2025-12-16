import type { LootDrop } from '../types/loot';
import { getLootTable } from '../data/lootTables';

/**
 * Roll for random number between min and max (inclusive)
 */
function rollBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Roll loot from a loot table
 */
export function rollLoot(lootTableId: string): LootDrop[] {
    const table = getLootTable(lootTableId);
    if (!table) {
        console.warn(`Loot table not found: ${lootTableId}`);
        return [];
    }

    const drops: LootDrop[] = [];

    for (const entry of table.entries) {
        const roll = Math.random();
        if (roll <= entry.chance) {
            if (entry.type === 'gold' && entry.goldRange) {
                const amount = rollBetween(entry.goldRange.min, entry.goldRange.max);
                drops.push({ type: 'gold', amount });
            } else if (entry.itemId) {
                drops.push({
                    type: entry.type,
                    itemId: entry.itemId,
                    quantity: entry.quantity ?? 1,
                });
            }
        }
    }

    return drops;
}

/**
 * Format loot drops for display in combat log
 */
export function formatLootMessage(drops: LootDrop[]): string {
    if (drops.length === 0) {
        return 'No loot dropped.';
    }

    const parts: string[] = [];

    for (const drop of drops) {
        if (drop.type === 'gold') {
            parts.push(`${drop.amount} gold`);
        } else if (drop.itemId) {
            const qty = drop.quantity && drop.quantity > 1 ? `${drop.quantity}x ` : '';
            parts.push(`${qty}${drop.itemId}`);
        }
    }

    return `Obtained: ${parts.join(', ')}`;
}