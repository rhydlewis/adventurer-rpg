import type { Character } from '../types';
import type { InventoryItem } from '../types';

/**
 * Check if character can afford a purchase
 */
export function canAfford(character: Character, price: number): boolean {
  return (character.gold ?? 0) >= price;
}

/**
 * Check if character has inventory space
 */
export function hasInventorySpace(character: Character): boolean {
  const inventory = character.inventory ?? [];
  const maxSlots = character.maxInventorySlots ?? 0;
  return inventory.length < maxSlots;
}

/**
 * Buy an item from a merchant
 * @throws Error if not enough gold or inventory full
 */
export function buyItem(
  character: Character,
  item: InventoryItem,
  price: number
): Character {
  if (!canAfford(character, price)) {
    throw new Error('Not enough gold');
  }

  if (!hasInventorySpace(character)) {
    throw new Error('Inventory full');
  }

  return {
    ...character,
    gold: (character.gold ?? 0) - price,
    inventory: [...(character.inventory ?? []), item],
  };
}

/**
 * Sell an item to a merchant
 * @throws Error if item not found in inventory
 */
export function sellItem(character: Character, itemId: string): Character {
  const inventory = character.inventory ?? [];
  const itemIndex = inventory.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    throw new Error('Item not found in inventory');
  }

  const item = inventory[itemIndex];
  const newInventory = inventory.filter((_, i) => i !== itemIndex);

  return {
    ...character,
    gold: (character.gold ?? 0) + item.value,
    inventory: newInventory,
  };
}
