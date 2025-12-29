import { describe, it, expect } from 'vitest';
import { FEATS, FIGHTER_STARTING_FEATS, getFeatsByClass, getAttackVariants, getAbilityFeats, getPassiveFeats } from '../../data/feats';

describe('data/feats', () => {
  describe('FEATS constant', () => {
    it('should be defined and contain expected feats', () => {
      expect(FEATS).toBeDefined();
      expect(Object.keys(FEATS).length).toBeGreaterThan(0);

      // Check for new feat IDs
      expect(FEATS).toHaveProperty('power_attack');
      expect(FEATS).toHaveProperty('weapon_finesse');
      expect(FEATS).toHaveProperty('arcane_strike');
      expect(FEATS).toHaveProperty('guided_hand');
    });

    it('each feat definition should have required properties', () => {
      for (const featId in FEATS) {
        const feat = FEATS[featId];

        // New structure properties
        expect(feat).toHaveProperty('id');
        expect(feat).toHaveProperty('name');
        expect(feat).toHaveProperty('description');
        expect(feat).toHaveProperty('category');
        expect(feat).toHaveProperty('type');
        expect(feat).toHaveProperty('prerequisites');
        expect(feat).toHaveProperty('effects');

        expect(typeof feat.id).toBe('string');
        expect(typeof feat.name).toBe('string');
        expect(typeof feat.description).toBe('string');
        expect(typeof feat.effects).toBe('object');
        expect(feat.id).toBe(featId); // Ensure id property matches key
      }
    });

    it('feat effects should have correct structure', () => {
      // Test Power Attack (attack_variant)
      const powerAttack = FEATS['power_attack'];
      expect(powerAttack.type).toBe('attack_variant');
      expect(powerAttack.effects.attackModifier).toBe(-2);
      expect(powerAttack.effects.damageModifier).toBe(4);
      expect(powerAttack.effects.duration).toBe('turn');

      // Test Weapon Finesse (passive)
      const weaponFinesse = FEATS['weapon_finesse'];
      expect(weaponFinesse.type).toBe('passive');
      expect(weaponFinesse.effects.useDexForAttack).toBe(true);
      expect(weaponFinesse.effects.duration).toBe('permanent');

      // Test Empower Spell (ability)
      const empowerSpell = FEATS['empower_spell'];
      expect(empowerSpell.type).toBe('ability');
      expect(empowerSpell.effects.spellDamageMultiplier).toBe(1.5);
      expect(empowerSpell.effects.consumesResource).toBeDefined();
    });
  });

  describe('FIGHTER_STARTING_FEATS array (legacy)', () => {
    it('should be defined and contain feat names', () => {
      expect(FIGHTER_STARTING_FEATS).toBeDefined();
      expect(FIGHTER_STARTING_FEATS.length).toBeGreaterThan(0);
    });

    it('should contain legacy feat names', () => {
      expect(FIGHTER_STARTING_FEATS).toContain('Power Attack');
      expect(FIGHTER_STARTING_FEATS).toContain('Weapon Focus');
    });
  });

  describe('Helper functions', () => {
    it('getFeatsByClass should return class-specific feats', () => {
      const fighterFeats = getFeatsByClass('Fighter');
      expect(fighterFeats.length).toBeGreaterThan(0);
      expect(fighterFeats.some(f => f.id === 'power_attack')).toBe(true);

      const rogueFeats = getFeatsByClass('Rogue');
      expect(rogueFeats.some(f => f.id === 'weapon_finesse')).toBe(true);
    });

    it('getAttackVariants should filter attack variant feats', () => {
      const variants = getAttackVariants(['power_attack', 'weapon_finesse', 'combat_expertise']);
      expect(variants.length).toBe(2); // power_attack and combat_expertise
      expect(variants.every(f => f.type === 'attack_variant')).toBe(true);
    });

    it('getAbilityFeats should filter ability feats', () => {
      const abilities = getAbilityFeats(['empower_spell', 'weapon_finesse', 'defensive_channel']);
      expect(abilities.length).toBe(2); // empower_spell and defensive_channel
      expect(abilities.every(f => f.type === 'ability')).toBe(true);
    });

    it('getPassiveFeats should filter passive feats', () => {
      const passives = getPassiveFeats(['weapon_finesse', 'power_attack', 'arcane_strike']);
      expect(passives.length).toBe(2); // weapon_finesse and arcane_strike
      expect(passives.every(f => f.type === 'passive')).toBe(true);
    });
  });
});
