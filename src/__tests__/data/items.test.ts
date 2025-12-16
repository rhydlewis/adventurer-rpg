import { describe, it, expect } from 'vitest';
import { ITEMS, getItem, getBuyPrice } from '../../data/items';

describe('Items Data', () => {
  it('should have all required items for validation campaign', () => {
    expect(ITEMS['healing-potion']).toBeDefined();
    expect(ITEMS['sword-plus-1']).toBeDefined();
    expect(ITEMS['antidote']).toBeDefined();
    expect(ITEMS['wolf-pelt']).toBeDefined();
    expect(ITEMS['mysterious-amulet']).toBeDefined();
  });

  it('should mark healing potion as combat-usable', () => {
    const potion = getItem('healing-potion');
    expect(potion.usableInCombat).toBe(true);
    expect(potion.type).toBe('consumable');
  });

  it('should calculate buy price as 2x sell value', () => {
    expect(getBuyPrice('healing-potion')).toBe(50); // 25 * 2
    expect(getBuyPrice('sword-plus-1')).toBe(100); // 50 * 2
    expect(getBuyPrice('antidote')).toBe(30); // 15 * 2
  });

  it('should throw error for non-existent item', () => {
    expect(() => getItem('fake-item')).toThrow('Item not found');
  });
});
