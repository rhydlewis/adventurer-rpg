import { describe, it, expect } from 'vitest';
import { ITEMS, getItem, getBuyPrice } from '../../data/items';

describe('ITEMS from JSON', () => {
  it('should load all items from JSON', () => {
    expect(Object.keys(ITEMS).length).toBeGreaterThan(0);
  });

  it('should have healing potion', () => {
    const potion = ITEMS['healing-potion'];
    expect(potion).toBeDefined();
    expect(potion.name).toBe('Healing Potion');
    expect(potion.type).toBe('consumable');
    expect(potion.usableInCombat).toBe(true);
    expect(potion.effect?.type).toBe('heal');
  });

  it('getItem should return item by id', () => {
    const item = getItem('healing-potion');
    expect(item.name).toBe('Healing Potion');
  });

  it('getItem should throw for invalid id', () => {
    expect(() => getItem('nonexistent')).toThrow('Item not found');
  });

  it('all items should have non-negative value', () => {
    Object.values(ITEMS).forEach((item) => {
      expect(item.value).toBeGreaterThanOrEqual(0);
    });
  });

  it('getBuyPrice should calculate buy price as 2x sell value', () => {
    expect(getBuyPrice('healing-potion')).toBe(50); // 25 * 2
    expect(getBuyPrice('sword-plus-1')).toBe(100); // 50 * 2
    expect(getBuyPrice('antidote')).toBe(30); // 15 * 2
  });
});
