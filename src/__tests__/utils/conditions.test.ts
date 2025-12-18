import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  applyCondition,
  applyConditionWithSave,
  removeCondition,
  decrementConditions,
  hasCondition,
  calculateConditionModifiers,
  applyConditionDamage,
  getConditionsByCategory,
} from '../../utils/conditions';
import type { Condition } from '../../types';
import type { Character } from '../../types';
import { makeSavingThrow } from '../../utils/savingThrows';
import { roll } from '../../utils/dice';

// Mock the dependencies
vi.mock('../../utils/savingThrows', () => ({
  makeSavingThrow: vi.fn(),
}));

vi.mock('../../utils/dice', () => ({
  roll: vi.fn(),
}));

// Test helper to create a mock character
function createMockCharacter(): Character {
  return {
    name: 'Test',
    avatarPath: 'human_female_00009.png',
    class: 'Fighter',
    level: 1,
    hp: 10,
    maxHp: 10,
    attributes: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 8 },
    ac: 16,
    bab: 1,
    saves: { fortitude: 2, reflex: 0, will: 0 },
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
      shield: { equipped: false, acBonus: 0 },
      items: [],
    },
    skills: {
      Perception: 0, Stealth: 0, Athletics: 0, Arcana: 0, Intimidate: 0, Medicine: 0,
    },
    feats: [],
    resources: {
      abilities: [],
    },
  };
}

describe('Conditions System', () => {
  describe('applyCondition', () => {
    it('should add a new condition with default duration', () => {
      const conditions: Condition[] = [];
      const result = applyCondition(conditions, 'Poisoned', 1);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Poisoned');
      expect(result[0].category).toBe('debuff');
      expect(result[0].turnsRemaining).toBe(3); // DEFAULT_DURATIONS.Poisoned = 3
      expect(result[0].appliedOnTurn).toBe(1);
      expect(result[0].description).toBe('1d4 poison/turn, -2 attack');
    });

    it('should add a new condition with custom duration', () => {
      const conditions: Condition[] = [];
      const result = applyCondition(conditions, 'Stunned', 5, 2);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Stunned');
      expect(result[0].turnsRemaining).toBe(2); // Custom duration
    });

    it('should refresh existing condition to max duration', () => {
      const existing: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 1,
          modifiers: { attackBonus: -2, damagePerTurn: { formula: '1d4', type: 'poison' } },
          appliedOnTurn: 1,
        },
      ];

      const result = applyCondition(existing, 'Poisoned', 3);

      expect(result).toHaveLength(1);
      expect(result[0].turnsRemaining).toBe(3); // Refreshed to default
      expect(result[0].appliedOnTurn).toBe(3);
    });

    it('should stack different conditions', () => {
      const existing: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
      ];

      const result = applyCondition(existing, 'Weakened', 2);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('Poisoned');
      expect(result[1].type).toBe('Weakened');
    });

    it('should apply buff conditions correctly', () => {
      const conditions: Condition[] = [];
      const result = applyCondition(conditions, 'Shielded', 1);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Shielded');
      expect(result[0].category).toBe('buff');
      expect(result[0].modifiers.acBonus).toBe(4);
    });
  });

  describe('applyConditionWithSave', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should not apply condition if save succeeds', () => {
      const target = createMockCharacter();
      vi.mocked(makeSavingThrow).mockReturnValue({
        success: true,
        roll: 15,
        bonus: 2,
        total: 17,
        dc: 14,
        saveType: 'fortitude',
      });

      const result = applyConditionWithSave(target, 'Poisoned', 14, 'fortitude', 1);

      expect(result.applied).toBe(false);
      expect(result.saveResult.success).toBe(true);
    });

    it('should apply condition if save fails', () => {
      const target = createMockCharacter();
      vi.mocked(makeSavingThrow).mockReturnValue({
        success: false,
        roll: 8,
        bonus: 2,
        total: 10,
        dc: 14,
        saveType: 'fortitude',
      });

      const result = applyConditionWithSave(target, 'Stunned', 14, 'fortitude', 1);

      expect(result.applied).toBe(true);
      expect(result.saveResult.success).toBe(false);
    });
  });

  describe('removeCondition', () => {
    it('should remove specified condition', () => {
      const conditions: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
        {
          type: 'Weakened',
          category: 'debuff',
          description: '-2 attack/damage',
          turnsRemaining: 1,
          modifiers: { attackBonus: -2, damageBonus: -2 },
          appliedOnTurn: 2,
        },
      ];

      const result = removeCondition(conditions, 'Poisoned');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Weakened');
    });

    it('should return same array if condition not found', () => {
      const conditions: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
      ];

      const result = removeCondition(conditions, 'Stunned');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Poisoned');
    });
  });

  describe('decrementConditions', () => {
    it('should decrement all condition durations', () => {
      const conditions: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 3,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
        {
          type: 'Weakened',
          category: 'debuff',
          description: '-2 attack/damage',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2, damageBonus: -2 },
          appliedOnTurn: 1,
        },
      ];

      const result = decrementConditions(conditions);

      expect(result.remaining).toHaveLength(2);
      expect(result.remaining[0].turnsRemaining).toBe(2);
      expect(result.remaining[1].turnsRemaining).toBe(1);
      expect(result.expired).toHaveLength(0);
    });

    it('should remove expired conditions', () => {
      const conditions: Condition[] = [
        {
          type: 'Stunned',
          category: 'debuff',
          description: 'Cannot act',
          turnsRemaining: 1,
          modifiers: { preventActions: true },
          appliedOnTurn: 1,
        },
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
      ];

      const result = decrementConditions(conditions);

      expect(result.remaining).toHaveLength(1);
      expect(result.remaining[0].type).toBe('Poisoned');
      expect(result.remaining[0].turnsRemaining).toBe(1);
      expect(result.expired).toHaveLength(1);
      expect(result.expired[0].type).toBe('Stunned');
    });

    it('should return empty remaining when all expire', () => {
      const conditions: Condition[] = [
        {
          type: 'Stunned',
          category: 'debuff',
          description: 'Cannot act',
          turnsRemaining: 1,
          modifiers: { preventActions: true },
          appliedOnTurn: 1,
        },
      ];

      const result = decrementConditions(conditions);

      expect(result.remaining).toHaveLength(0);
      expect(result.expired).toHaveLength(1);
    });
  });

  describe('hasCondition', () => {
    it('should return true if condition exists', () => {
      const conditions: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
      ];

      expect(hasCondition(conditions, 'Poisoned')).toBe(true);
    });

    it('should return false if condition does not exist', () => {
      const conditions: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
      ];

      expect(hasCondition(conditions, 'Stunned')).toBe(false);
    });

    it('should return false for empty conditions array', () => {
      expect(hasCondition([], 'Poisoned')).toBe(false);
    });
  });

  describe('calculateConditionModifiers', () => {
    it('should sum attack bonuses from multiple conditions', () => {
      const conditions: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
        {
          type: 'Weakened',
          category: 'debuff',
          description: '-2 attack/damage',
          turnsRemaining: 1,
          modifiers: { attackBonus: -2, damageBonus: -2 },
          appliedOnTurn: 2,
        },
      ];

      const result = calculateConditionModifiers(conditions);

      expect(result.attackBonus).toBe(-4);
      expect(result.damageBonus).toBe(-2);
    });

    it('should sum positive and negative bonuses correctly', () => {
      const conditions: Condition[] = [
        {
          type: 'Weakened',
          category: 'debuff',
          description: '-2 attack/damage',
          turnsRemaining: 1,
          modifiers: { attackBonus: -2, damageBonus: -2 },
          appliedOnTurn: 1,
        },
        {
          type: 'Strengthened',
          category: 'buff',
          description: '+2 attack/damage',
          turnsRemaining: 2,
          modifiers: { attackBonus: 2, damageBonus: 2 },
          appliedOnTurn: 1,
        },
      ];

      const result = calculateConditionModifiers(conditions);

      expect(result.attackBonus).toBe(0); // -2 + 2 = 0
      expect(result.damageBonus).toBe(0); // -2 + 2 = 0
    });

    it('should calculate AC bonuses correctly', () => {
      const conditions: Condition[] = [
        {
          type: 'Dodge',
          category: 'buff',
          description: '+4 AC',
          turnsRemaining: 1,
          modifiers: { acBonus: 4 },
          appliedOnTurn: 1,
        },
        {
          type: 'Shielded',
          category: 'buff',
          description: '+4 AC',
          turnsRemaining: 2,
          modifiers: { acBonus: 4 },
          appliedOnTurn: 1,
        },
      ];

      const result = calculateConditionModifiers(conditions);

      expect(result.acBonus).toBe(8); // Stacking AC bonuses
    });

    it('should set preventActions flag if any condition prevents actions', () => {
      const conditions: Condition[] = [
        {
          type: 'Stunned',
          category: 'debuff',
          description: 'Cannot act',
          turnsRemaining: 1,
          modifiers: { preventActions: true },
          appliedOnTurn: 1,
        },
      ];

      const result = calculateConditionModifiers(conditions);

      expect(result.preventActions).toBe(true);
    });

    it('should handle spell-related modifiers', () => {
      const conditions: Condition[] = [
        {
          type: 'Enchanted',
          category: 'buff',
          description: '+2 spell attack, +1 spell DC',
          turnsRemaining: 2,
          modifiers: { spellAttackBonus: 2, spellDcBonus: 1 },
          appliedOnTurn: 1,
        },
      ];

      const result = calculateConditionModifiers(conditions);

      expect(result.spellAttackBonus).toBe(2);
      expect(result.spellDcBonus).toBe(1);
    });

    it('should handle save bonuses', () => {
      const conditions: Condition[] = [
        {
          type: 'Divine Favor',
          category: 'buff',
          description: '+1 attack/saves',
          turnsRemaining: 1,
          modifiers: { attackBonus: 1, saveBonus: 1 },
          appliedOnTurn: 1,
        },
        {
          type: 'Resistance',
          category: 'buff',
          description: '+1 saves',
          turnsRemaining: 1,
          modifiers: { saveBonus: 1 },
          appliedOnTurn: 1,
        },
      ];

      const result = calculateConditionModifiers(conditions);

      expect(result.saveBonus).toBe(2);
      expect(result.attackBonus).toBe(1);
    });

    it('should return empty object for no conditions', () => {
      const result = calculateConditionModifiers([]);

      expect(result).toEqual({});
    });
  });

  describe('applyConditionDamage', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should roll damage for Poisoned condition', () => {
      vi.mocked(roll).mockReturnValue(3);

      const conditions: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: {
            attackBonus: -2,
            damagePerTurn: { formula: '1d4', type: 'poison' },
          },
          appliedOnTurn: 1,
        },
      ];

      const result = applyConditionDamage(conditions);

      expect(result.totalDamage).toBe(3);
      expect(result.damageBreakdown).toHaveLength(1);
      expect(result.damageBreakdown[0].condition).toBe('Poisoned');
      expect(result.damageBreakdown[0].amount).toBe(3);
      expect(result.damageBreakdown[0].type).toBe('poison');
      expect(result.damageBreakdown[0].formula).toBe('1d4');
    });

    it('should handle multiple damage-over-time conditions', () => {
      vi.mocked(roll).mockReturnValueOnce(3).mockReturnValueOnce(2);

      const conditions: Condition[] = [
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: {
            attackBonus: -2,
            damagePerTurn: { formula: '1d4', type: 'poison' },
          },
          appliedOnTurn: 1,
        },
        {
          type: 'Poisoned', // Hypothetical second poison source
          category: 'debuff',
          description: 'Burning',
          turnsRemaining: 1,
          modifiers: {
            damagePerTurn: { formula: '1d4', type: 'fire' },
          },
          appliedOnTurn: 2,
        },
      ];

      const result = applyConditionDamage(conditions);

      expect(result.totalDamage).toBe(5);
      expect(result.damageBreakdown).toHaveLength(2);
    });

    it('should return zero damage for conditions without damagePerTurn', () => {
      const conditions: Condition[] = [
        {
          type: 'Weakened',
          category: 'debuff',
          description: '-2 attack/damage',
          turnsRemaining: 1,
          modifiers: { attackBonus: -2, damageBonus: -2 },
          appliedOnTurn: 1,
        },
      ];

      const result = applyConditionDamage(conditions);

      expect(result.totalDamage).toBe(0);
      expect(result.damageBreakdown).toHaveLength(0);
    });
  });

  describe('getConditionsByCategory', () => {
    it('should filter buffs only', () => {
      const conditions: Condition[] = [
        {
          type: 'Dodge',
          category: 'buff',
          description: '+4 AC',
          turnsRemaining: 1,
          modifiers: { acBonus: 4 },
          appliedOnTurn: 1,
        },
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
        {
          type: 'Shielded',
          category: 'buff',
          description: '+4 AC',
          turnsRemaining: 2,
          modifiers: { acBonus: 4 },
          appliedOnTurn: 1,
        },
      ];

      const result = getConditionsByCategory(conditions, 'buff');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('Dodge');
      expect(result[1].type).toBe('Shielded');
    });

    it('should filter debuffs only', () => {
      const conditions: Condition[] = [
        {
          type: 'Dodge',
          category: 'buff',
          description: '+4 AC',
          turnsRemaining: 1,
          modifiers: { acBonus: 4 },
          appliedOnTurn: 1,
        },
        {
          type: 'Poisoned',
          category: 'debuff',
          description: '1d4 poison/turn, -2 attack',
          turnsRemaining: 2,
          modifiers: { attackBonus: -2 },
          appliedOnTurn: 1,
        },
      ];

      const result = getConditionsByCategory(conditions, 'debuff');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('Poisoned');
    });
  });
});
