import { describe, it, expect } from 'vitest';
import {
  isCriticalHit,
  isCriticalFumble,
  calculateCriticalDamage,
  determineFumbleEffect,
  type FumbleEffect,
} from '../../utils/criticals';

describe('Critical Hits and Fumbles', () => {
  describe('isCriticalHit', () => {
    it('returns true for natural 20', () => {
      expect(isCriticalHit(20)).toBe(true);
    });

    it('returns false for non-20 rolls', () => {
      expect(isCriticalHit(19)).toBe(false);
      expect(isCriticalHit(15)).toBe(false);
      expect(isCriticalHit(1)).toBe(false);
    });
  });

  describe('isCriticalFumble', () => {
    it('returns true for natural 1', () => {
      expect(isCriticalFumble(1)).toBe(true);
    });

    it('returns false for non-1 rolls', () => {
      expect(isCriticalFumble(2)).toBe(false);
      expect(isCriticalFumble(10)).toBe(false);
      expect(isCriticalFumble(20)).toBe(false);
    });
  });

  describe('calculateCriticalDamage', () => {
    it('doubles damage dice but not modifiers for simple damage', () => {
      // 1d8+3 becomes 2d8+3
      const baseDamage = '1d8+3';
      const result = calculateCriticalDamage(baseDamage);

      expect(result.formula).toBe('2d8+3');
      expect(result.description).toContain('CRITICAL HIT!');
    });

    it('handles damage without modifier', () => {
      // 1d6 becomes 2d6
      const baseDamage = '1d6';
      const result = calculateCriticalDamage(baseDamage);

      expect(result.formula).toBe('2d6');
    });

    it('handles damage with negative modifier', () => {
      // 1d4-1 becomes 2d4-1
      const baseDamage = '1d4-1';
      const result = calculateCriticalDamage(baseDamage);

      expect(result.formula).toBe('2d4-1');
    });

    it('handles multiple damage dice', () => {
      // 2d6+5 becomes 4d6+5
      const baseDamage = '2d6+5';
      const result = calculateCriticalDamage(baseDamage);

      expect(result.formula).toBe('4d6+5');
    });

    it('handles damage with multiple dice types (Sneak Attack)', () => {
      // 1d8+1d6+3 becomes 2d8+2d6+3
      const baseDamage = '1d8+1d6+3';
      const result = calculateCriticalDamage(baseDamage);

      expect(result.formula).toBe('2d8+2d6+3');
    });

    it('handles spell damage (no modifier)', () => {
      // 1d3 becomes 2d3
      const baseDamage = '1d3';
      const result = calculateCriticalDamage(baseDamage);

      expect(result.formula).toBe('2d3');
    });
  });

  describe('determineFumbleEffect', () => {
    it('returns drop weapon effect for roll 1', () => {
      const effect = determineFumbleEffect(1);

      expect(effect.type).toBe('drop_weapon');
      expect(effect.description).toContain('drop');
      expect(effect.description).toContain('weapon');
    });

    it('returns hit self effect for roll 2', () => {
      const effect = determineFumbleEffect(2);

      expect(effect.type).toBe('hit_self');
      expect(effect.description).toContain('hit');
      expect(effect.description).toContain('self');
      expect(effect.damage).toBe('1d4');
    });

    it('returns off balance effect for roll 3', () => {
      const effect = determineFumbleEffect(3);

      expect(effect.type).toBe('off_balance');
      expect(effect.description).toContain('off-balance');
      expect(effect.acPenalty).toBe(-2);
    });

    it('returns opening effect for roll 4', () => {
      const effect = determineFumbleEffect(4);

      expect(effect.type).toBe('opening');
      expect(effect.description).toContain('opening');
      expect(effect.givesFreeAttack).toBe(true);
    });

    it('handles roll out of range (defaults to drop weapon)', () => {
      const effect = determineFumbleEffect(5);
      expect(effect.type).toBe('drop_weapon');
    });

    it('handles roll less than 1 (defaults to drop weapon)', () => {
      const effect = determineFumbleEffect(0);
      expect(effect.type).toBe('drop_weapon');
    });
  });
});
