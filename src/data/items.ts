import type { InventoryItem } from '../types';

/**
 * Item Database for Validation Campaign
 */

export const ITEMS: Record<string, InventoryItem> = {
  'healing-potion': {
    id: 'healing-potion',
    name: 'Healing Potion',
    description: 'A red vial that restores 2d8+2 hit points when consumed.',
    type: 'consumable',
    usableInCombat: true,
    effect: { type: 'heal', amount: '2d8+2' },
    value: 25, // Sell for 25g, buy for 50g
  },

  'sword-plus-1': {
    id: 'sword-plus-1',
    name: '+1 Longsword',
    description: 'A finely crafted longsword with a +1 enchantment to attack and damage rolls.',
    type: 'equipment',
    usableInCombat: false, // Equipped before combat, not during
    effect: { type: 'buff', stat: 'attack', bonus: 1, duration: -1 }, // Permanent while equipped
    value: 50, // Sell for 50g, buy for 100g
  },

  'antidote': {
    id: 'antidote',
    name: 'Antidote',
    description: 'Cures poison and removes the poisoned condition.',
    type: 'consumable',
    usableInCombat: true,
    effect: { type: 'remove-condition', condition: 'poisoned' },
    value: 15, // Sell for 15g, buy for 30g
  },

  'wolf-pelt': {
    id: 'wolf-pelt',
    name: 'Wolf Pelt',
    description: 'A rough wolf hide. Can be sold to merchants.',
    type: 'quest',
    usableInCombat: false,
    value: 15,
  },

  'mysterious-amulet': {
    id: 'mysterious-amulet',
    name: 'Mysterious Amulet',
    description: 'A glowing amulet recovered from the wraith. Its purpose is unknown.',
    type: 'quest',
    usableInCombat: false,
    value: 100,
  },
};

// Helper to get item by ID
export function getItem(id: string): InventoryItem {
  const item = ITEMS[id];
  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }
  return item;
}

// Helper for shop prices (buy = 2x sell value)
export function getBuyPrice(itemId: string): number {
  const item = getItem(itemId);
  return item.value * 2;
}
