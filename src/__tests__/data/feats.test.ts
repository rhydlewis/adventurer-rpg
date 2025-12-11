import { describe, it, expect } from 'vitest';
import { FEATS, FIGHTER_STARTING_FEATS } from '../../data/feats';
import type { FeatName } from '../../types';

describe('data/feats', () => {
  describe('FEATS constant', () => {
    it('should be defined and contain expected feats', () => {
      expect(FEATS).toBeDefined();
      expect(Object.keys(FEATS).length).toBeGreaterThan(0);
      expect(FEATS).toHaveProperty('Power Attack');
      expect(FEATS).toHaveProperty('Weapon Focus');
    });

    it('each feat definition should have required properties', () => {
      for (const featName in FEATS) {
        const feat = FEATS[featName as FeatName];
        expect(feat).toHaveProperty('name');
        expect(feat).toHaveProperty('description');
        expect(feat).toHaveProperty('effect');

        expect(typeof feat.name).toBe('string');
        expect(typeof feat.description).toBe('string');
        expect(typeof feat.effect).toBe('object');
        expect(feat.name).toBe(featName); // Ensure name property matches key
      }
    });

    it('feat effects should have correct structure based on type', () => {
      // Test a 'toggle' effect
      const powerAttack = FEATS['Power Attack'];
      expect(powerAttack.effect.type).toBe('toggle');
      expect(powerAttack.effect).toHaveProperty('name');

      // Test a 'passive' effect
      const weaponFocus = FEATS['Weapon Focus'];
      expect(weaponFocus.effect.type).toBe('passive');
      expect(weaponFocus.effect).toHaveProperty('stat');
      expect(weaponFocus.effect).toHaveProperty('bonus');

      // Test a 'conditional' effect
      const combatReflexes = FEATS['Combat Reflexes'];
      expect(combatReflexes.effect.type).toBe('conditional');
      expect(combatReflexes.effect).toHaveProperty('condition');
      expect(combatReflexes.effect).toHaveProperty('stat');
      expect(combatReflexes.effect).toHaveProperty('bonus');
    });
  });

  describe('FIGHTER_STARTING_FEATS array', () => {
    it('should be defined and contain feat names', () => {
      expect(FIGHTER_STARTING_FEATS).toBeDefined();
      expect(FIGHTER_STARTING_FEATS.length).toBeGreaterThan(0);
    });

    it('all feats in FIGHTER_STARTING_FEATS should exist in the FEATS constant', () => {
      FIGHTER_STARTING_FEATS.forEach(featName => {
        expect(FEATS).toHaveProperty(featName);
      });
    });
  });
});