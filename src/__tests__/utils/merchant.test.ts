import { describe, it, expect } from 'vitest';
import { buyItem, sellItem, canAfford, hasInventorySpace } from '../../utils/merchant';
import type { Character } from '../../types/character';
import type { InventoryItem } from '../../types/equipment';

describe('Merchant System', () => {
  const mockCharacter: Partial<Character> = {
    gold: 100,
    inventory: [],
    maxInventorySlots: 10,
  };

  const healingPotion: InventoryItem = {
    id: 'healing-potion',
    name: 'Healing Potion',
    description: 'Restores 2d8+2 HP',
    type: 'consumable',
    usableInCombat: true,
    effect: { type: 'heal', amount: '2d8+2' },
    value: 25, // sell price
  };

  it('should buy item if enough gold and inventory space', () => {
    const result = buyItem(mockCharacter as Character, healingPotion, 50);

    expect(result.gold).toBe(50); // 100 - 50
    expect(result.inventory).toHaveLength(1);
    expect(result.inventory[0].id).toBe('healing-potion');
  });

  it('should fail to buy if not enough gold', () => {
    const poorCharacter = { ...mockCharacter, gold: 10 };

    expect(() => buyItem(poorCharacter as Character, healingPotion, 50))
      .toThrow('Not enough gold');
  });

  it('should fail to buy if inventory full', () => {
    const fullCharacter = {
      ...mockCharacter,
      inventory: Array(10).fill(healingPotion),
    };

    expect(() => buyItem(fullCharacter as Character, healingPotion, 50))
      .toThrow('Inventory full');
  });

  it('should sell item and add gold', () => {
    const characterWithItem: Partial<Character> = {
      gold: 50,
      inventory: [healingPotion],
      maxInventorySlots: 10,
    };

    const result = sellItem(characterWithItem as Character, 'healing-potion');

    expect(result.gold).toBe(75); // 50 + 25 (value)
    expect(result.inventory).toHaveLength(0);
  });

  it('should fail to sell if item not in inventory', () => {
    expect(() => sellItem(mockCharacter as Character, 'non-existent-item'))
      .toThrow('Item not found in inventory');
  });

  it('should check if character can afford item', () => {
    expect(canAfford(mockCharacter as Character, 50)).toBe(true);
    expect(canAfford(mockCharacter as Character, 150)).toBe(false);
  });

  it('should check if character has inventory space', () => {
    expect(hasInventorySpace(mockCharacter as Character)).toBe(true);

    const fullCharacter = {
      ...mockCharacter,
      inventory: Array(10).fill(healingPotion),
    };
    expect(hasInventorySpace(fullCharacter as Character)).toBe(false);
  });
});
