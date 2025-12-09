import { describe, it, expect } from 'vitest';
import { getAttributeCost, getRemainingPoints, isValidAllocation } from '../../utils/pointBuy';
import type { Attributes } from '../../types';

describe('utils/pointBuy', () => {
  describe('getAttributeCost', () => {
    it('returns correct cost for each attribute value', () => {
      expect(getAttributeCost(7)).toBe(-4);
      expect(getAttributeCost(8)).toBe(-2);
      expect(getAttributeCost(9)).toBe(-1);
      expect(getAttributeCost(10)).toBe(0);
      expect(getAttributeCost(11)).toBe(1);
      expect(getAttributeCost(12)).toBe(2);
      expect(getAttributeCost(13)).toBe(3);
      expect(getAttributeCost(14)).toBe(5);
      expect(getAttributeCost(15)).toBe(7);
      expect(getAttributeCost(16)).toBe(10);
      expect(getAttributeCost(17)).toBe(13);
      expect(getAttributeCost(18)).toBe(17);
    });

    it('throws error for values outside 7-18 range', () => {
      expect(() => getAttributeCost(6)).toThrow();
      expect(() => getAttributeCost(19)).toThrow();
      expect(() => getAttributeCost(0)).toThrow();
      expect(() => getAttributeCost(25)).toThrow();
    });
  });

  describe('getRemainingPoints', () => {
    it('returns 27 points for base attributes (all 10s)', () => {
      const attributes: Attributes = {
        STR: 10,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
      };
      expect(getRemainingPoints(attributes)).toBe(27);
    });

    it('calculates correct remaining points for Fighter recommended array', () => {
      const attributes: Attributes = {
        STR: 16, // 10
        DEX: 12, // 2
        CON: 14, // 5
        INT: 10, // 0
        WIS: 10, // 0
        CHA: 8, // -2
      };
      // Total spent: 10 + 2 + 5 + 0 + 0 - 2 = 15
      // Remaining: 27 - 15 = 12
      expect(getRemainingPoints(attributes)).toBe(12);
    });

    it('calculates correct remaining points for Wizard recommended array', () => {
      const attributes: Attributes = {
        STR: 8, // -2
        DEX: 14, // 5
        CON: 12, // 2
        INT: 16, // 10
        WIS: 12, // 2
        CHA: 10, // 0
      };
      // Total spent: -2 + 5 + 2 + 10 + 2 + 0 = 17
      // Remaining: 27 - 17 = 10
      expect(getRemainingPoints(attributes)).toBe(10);
    });

    it('returns 0 when exactly 27 points are spent', () => {
      // Allocation costs exactly 27 points: 7+5+5+3+2+5 = 27
      const attributes: Attributes = {
        STR: 15, // cost: 7
        DEX: 14, // cost: 5
        CON: 14, // cost: 5
        INT: 13, // cost: 3
        WIS: 12, // cost: 2
        CHA: 14, // cost: 5
      };
      expect(getRemainingPoints(attributes)).toBe(0);
    });

    it('returns negative when over budget', () => {
      const attributes: Attributes = {
        STR: 18, // 17
        DEX: 16, // 10
        CON: 14, // 5
        INT: 10, // 0
        WIS: 10, // 0
        CHA: 10, // 0
      };
      // Total: 17 + 10 + 5 = 32
      // Remaining: 27 - 32 = -5
      expect(getRemainingPoints(attributes)).toBe(-5);
    });

    it('handles attributes below 10 (negative costs)', () => {
      const attributes: Attributes = {
        STR: 7, // -4
        DEX: 8, // -2
        CON: 9, // -1
        INT: 18, // 17
        WIS: 16, // 10
        CHA: 10, // 0
      };
      // Total: -4 + -2 + -1 + 17 + 10 + 0 = 20
      // Remaining: 27 - 20 = 7
      expect(getRemainingPoints(attributes)).toBe(7);
    });
  });

  describe('isValidAllocation', () => {
    it('returns true for valid allocation within budget', () => {
      const attributes: Attributes = {
        STR: 16,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      };
      expect(isValidAllocation(attributes)).toBe(true);
    });

    it('returns true when exactly at budget (27 points)', () => {
      const attributes: Attributes = {
        STR: 15,
        DEX: 14,
        CON: 14,
        INT: 13,
        WIS: 12,
        CHA: 14,
      };
      expect(isValidAllocation(attributes)).toBe(true);
    });

    it('returns false when over budget', () => {
      const attributes: Attributes = {
        STR: 18,
        DEX: 18,
        CON: 18,
        INT: 18,
        WIS: 18,
        CHA: 18,
      };
      expect(isValidAllocation(attributes)).toBe(false);
    });

    it('returns false when any attribute is below 7', () => {
      const attributes: Attributes = {
        STR: 6,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
      };
      expect(isValidAllocation(attributes)).toBe(false);
    });

    it('returns false when any attribute is above 18', () => {
      const attributes: Attributes = {
        STR: 19,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
      };
      expect(isValidAllocation(attributes)).toBe(false);
    });

    it('returns false when attribute is not an integer', () => {
      const attributes: Attributes = {
        STR: 15.5,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
      };
      expect(isValidAllocation(attributes)).toBe(false);
    });
  });
});
