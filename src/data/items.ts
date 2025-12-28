import itemsJson from './items.json';
import { ItemsSchema } from '../schemas/item.schema';
import type { InventoryItem } from '../types';

// Validate items at build time
const validatedItems = ItemsSchema.parse(itemsJson);

/**
 * All available items in the game
 * Loaded from items.json and validated with Zod schema
 */
export const ITEMS: Record<string, InventoryItem> = Object.fromEntries(
  Object.entries(validatedItems).map(([id, item]) => [
    id,
    item as InventoryItem,
  ])
);

/**
 * Get an item by ID
 * @param id - The item ID (e.g., "healing-potion")
 * @returns The item object
 * @throws Error if item not found
 */
export function getItem(id: string): InventoryItem {
  const item = ITEMS[id];
  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }
  return item;
}

/**
 * Get the buy price for an item (2x sell value)
 * @param itemId - The item ID
 * @returns The buy price
 */
export function getBuyPrice(itemId: string): number {
  const item = getItem(itemId);
  return item.value * 2;
}
