import { describe, it, expect } from 'vitest';
import { ItemSchema, ItemsSchema } from '../../schemas/item.schema';

describe('ItemSchema', () => {
  it('should validate a healing item', () => {
    const healingPotion = {
      id: 'healing-potion',
      name: 'Healing Potion',
      description: 'Restores health',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'heal', amount: '2d8+2' },
      value: 25,
    };

    expect(() => ItemSchema.parse(healingPotion)).not.toThrow();
  });

  it('should validate an escape item', () => {
    const escapeItem = {
      id: 'smoke-bomb',
      name: 'Smoke Bomb',
      description: 'Allows escape from combat',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'escape' },
      value: 50,
    };

    expect(() => ItemSchema.parse(escapeItem)).not.toThrow();
  });

  it('should validate a buff item', () => {
    const buffPotion = {
      id: 'strength-potion',
      name: 'Potion of Strength',
      description: 'Increases STR',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'buff', stat: 'STR', bonus: 2, duration: 3 },
      value: 100,
    };

    expect(() => ItemSchema.parse(buffPotion)).not.toThrow();
  });

  it('should validate a quest item', () => {
    const questItem = {
      id: 'mysterious-amulet',
      name: 'Mysterious Amulet',
      description: 'An ancient artifact',
      type: 'quest',
      usableInCombat: false,
      value: 0,
    };

    expect(() => ItemSchema.parse(questItem)).not.toThrow();
  });

  it('should reject invalid item type', () => {
    const invalidItem = {
      id: 'bad-item',
      name: 'Bad Item',
      description: 'Invalid',
      type: 'invalid-type',
      usableInCombat: false,
      value: 0,
    };

    expect(() => ItemSchema.parse(invalidItem)).toThrow();
  });

  it('should reject negative value', () => {
    const invalidItem = {
      id: 'free-item',
      name: 'Free Item',
      description: 'Negative value',
      type: 'consumable',
      usableInCombat: false,
      value: -10,
    };

    expect(() => ItemSchema.parse(invalidItem)).toThrow();
  });
});

describe('ItemsSchema', () => {
  it('should validate a record of items', () => {
    const validItems = {
      'healing-potion': {
        id: 'healing-potion',
        name: 'Healing Potion',
        description: 'Restores health',
        type: 'consumable',
        usableInCombat: true,
        effect: { type: 'heal', amount: '2d8+2' },
        value: 25,
      },
    };

    expect(() => ItemsSchema.parse(validItems)).not.toThrow();
  });
});
