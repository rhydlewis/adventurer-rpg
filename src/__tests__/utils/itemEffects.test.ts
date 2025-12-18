import { describe, it, expect } from 'vitest';
import { applyItemEffect } from '../../utils/itemEffects';
import type { Character, ItemEffect } from '../../types';

// Test fixture
const createTestCharacter = (overrides?: Partial<Character>): Character => ({
  name: 'Test Hero',
  avatarPath: 'human_female_00009.png',
  class: 'Fighter',
  level: 1,
  attributes: {
    STR: 16,
    DEX: 12,
    CON: 14,
    INT: 10,
    WIS: 10,
    CHA: 8,
  },
  hp: 15,
  maxHp: 15,
  ac: 18,
  bab: 1,
  saves: {
    fortitude: 2,
    reflex: 0,
    will: 0,
  },
  skills: {
    Athletics: 0,
    Stealth: 0,
    Perception: 0,
    Arcana: 0,
    Medicine: 0,
    Intimidate: 0,
  },
  feats: [],
  equipment: {
    weapon: {
      name: 'Longsword',
      damage: '1d8',
      damageType: 'slashing',
      finesse: false,
      description: 'A standard longsword',
    },
    weapons: [{
      name: 'Longsword',
      damage: '1d8',
      damageType: 'slashing',
      finesse: false,
      description: 'A standard longsword',
    }],
    armor: {
      name: 'Chainmail',
      baseAC: 16,
      maxDexBonus: 2,
      description: 'Standard chainmail armor',
    },
    shield: {
      equipped: true,
      acBonus: 2,
    },
    items: [],
  },
  resources: {
    abilities: [],
  },
  ...overrides,
});

describe('itemEffects', () => {
  describe('applyItemEffect - healing', () => {
    it('should heal character with 2d8+2 for healing potion', () => {
      const character = createTestCharacter({ hp: 10, maxHp: 30 });
      const effect: ItemEffect = { type: 'heal', amount: '2d8+2' };

      const { character: updated, logMessage } = applyItemEffect(
        character,
        effect,
        true
      );

      expect(updated.hp).toBeGreaterThan(10);
      expect(updated.hp).toBeLessThanOrEqual(30);
      expect(logMessage).toContain('HP restored');
    });

    it('should not overheal above maxHp', () => {
      const character = createTestCharacter({ hp: 28, maxHp: 30 });
      const effect: ItemEffect = { type: 'heal', amount: '2d8+2' };

      const { character: updated } = applyItemEffect(character, effect, true);

      expect(updated.hp).toBe(30);
    });
  });
});
