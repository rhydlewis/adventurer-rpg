import { describe, it, expect } from 'vitest';
import {
  getCantripsForClass,
  WIZARD_CANTRIPS,
  CLERIC_CANTRIPS,
  RAY_OF_FROST,
  DAZE,
  DIVINE_FAVOR,
} from '../../data/spells';
import type { Spell } from '../../types';

describe('data/spells', () => {
  it('spell constants should be well-formed', () => {
    const spellsToTest: Spell[] = [RAY_OF_FROST, DAZE, DIVINE_FAVOR];

    spellsToTest.forEach(spell => {
      expect(spell).toBeDefined();
      expect(typeof spell.id).toBe('string');
      expect(typeof spell.name).toBe('string');
      expect(typeof spell.level).toBe('number');
      expect(typeof spell.school).toBe('string');
      expect(typeof spell.target).toBe('string');
      expect(typeof spell.effect).toBe('object');
      expect(typeof spell.description).toBe('string');
    });
  });

  describe('getCantripsForClass', () => {
    it('should return correct cantrips for Wizard', () => {
      const cantrips = getCantripsForClass('Wizard');
      expect(cantrips).toEqual(WIZARD_CANTRIPS);
      expect(cantrips.length).toBe(3);
      expect(cantrips.map(c => c.name)).toContain('Ray of Frost');
    });

    it('should return correct cantrips for Cleric', () => {
      const cantrips = getCantripsForClass('Cleric');
      expect(cantrips).toEqual(CLERIC_CANTRIPS);
      expect(cantrips.length).toBe(3);
      expect(cantrips.map(c => c.name)).toContain('Sacred Flame');
    });

    it('should return an empty array for a non-casting class like Fighter', () => {
      const cantrips = getCantripsForClass('Fighter');
      expect(cantrips).toEqual([]);
    });

    it('should return an empty array for a non-casting class like Rogue', () => {
      const cantrips = getCantripsForClass('Rogue');
      expect(cantrips).toEqual([]);
    });

    it('should return an empty array for an unknown class name', () => {
      // Assuming 'Bard' is not a defined class in this system
      const cantrips = getCantripsForClass('Bard');
      expect(cantrips).toEqual([]);
    });
  });

  it('WIZARD_CANTRIPS array should contain valid spell objects', () => {
    expect(WIZARD_CANTRIPS.length).toBeGreaterThan(0);
    WIZARD_CANTRIPS.forEach(spell => {
      expect(spell.level).toBe(0);
      expect(spell.id).toBeDefined();
    });
  });

  it('CLERIC_CANTRIPS array should contain valid spell objects', () => {
    expect(CLERIC_CANTRIPS.length).toBeGreaterThan(0);
    CLERIC_CANTRIPS.forEach(spell => {
      expect(spell.level).toBe(0);
      expect(spell.id).toBeDefined();
    });
  });
});
