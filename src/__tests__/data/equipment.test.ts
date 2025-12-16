import { describe, it, expect } from 'vitest';
import { WEAPONS, ARMORS, STARTING_ITEMS } from '../../data/equipment';
import type { WeaponType, ArmorType } from '../../types';

describe('data/equipment', () => {
  describe('WEAPONS constant', () => {
    it('should be defined and contain expected weapons', () => {
      expect(WEAPONS).toBeDefined();
      expect(Object.keys(WEAPONS).length).toBeGreaterThan(0);
      expect(WEAPONS).toHaveProperty('Longsword');
      expect(WEAPONS).toHaveProperty('Rapier');
    });

    it('each weapon definition should have required properties', () => {
      for (const weaponType in WEAPONS) {
        const weapon = WEAPONS[weaponType as WeaponType];
        expect(weapon).toHaveProperty('name');
        expect(weapon).toHaveProperty('damage');
        expect(weapon).toHaveProperty('damageType');
        expect(weapon).toHaveProperty('finesse');
        expect(weapon).toHaveProperty('description');

        expect(typeof weapon.name).toBe('string');
        expect(typeof weapon.damage).toBe('string');
        expect(['slashing', 'piercing', 'bludgeoning']).toContain(weapon.damageType);
        expect(typeof weapon.finesse).toBe('boolean');
        expect(typeof weapon.description).toBe('string');
      }
    });
  });

  describe('ARMORS constant', () => {
    it('should be defined and contain expected armors', () => {
      expect(ARMORS).toBeDefined();
      expect(Object.keys(ARMORS).length).toBeGreaterThan(0);
      expect(ARMORS).toHaveProperty('None');
      expect(ARMORS).toHaveProperty('Leather');
      expect(ARMORS).toHaveProperty('Chainmail');
    });

    it('each armor definition should have required properties', () => {
      for (const armorType in ARMORS) {
        const armor = ARMORS[armorType as ArmorType];
        expect(armor).toHaveProperty('name');
        expect(armor).toHaveProperty('baseAC');
        expect(armor).toHaveProperty('maxDexBonus');
        expect(armor).toHaveProperty('description');

        expect(typeof armor.name).toBe('string');
        expect(typeof armor.baseAC).toBe('number');
        expect(armor.maxDexBonus === null || typeof armor.maxDexBonus === 'number').toBe(true);
        expect(typeof armor.description).toBe('string');
      }
    });
  });

  describe('STARTING_ITEMS constant', () => {
    it('should be defined and contain expected item categories', () => {
      expect(STARTING_ITEMS).toBeDefined();
      expect(Object.keys(STARTING_ITEMS).length).toBeGreaterThan(0);
      expect(STARTING_ITEMS).toHaveProperty('all');
      expect(STARTING_ITEMS).toHaveProperty('Rogue');
      expect(STARTING_ITEMS).toHaveProperty('Wizard');
    });

    it('each item in STARTING_ITEMS should have required properties', () => {
      const allStartingItems = [
        ...STARTING_ITEMS.all,
        ...(STARTING_ITEMS.Rogue || []),
        ...(STARTING_ITEMS.Wizard || []),
      ];

      allStartingItems.forEach(item => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('effect');
        expect(item).toHaveProperty('quantity');

        expect(typeof item.name).toBe('string');
        expect(typeof item.description).toBe('string');
        expect(typeof item.effect).toBe('object');
        expect(typeof item.quantity).toBe('number');
        expect(item.quantity).toBeGreaterThanOrEqual(0);

        // Check effect properties
        expect(item.effect).toHaveProperty('type');
        expect(typeof item.effect?.type).toBe('string');
      });
    });

    it('specific item effects should be correct', () => {
      const healingPotion = STARTING_ITEMS.all.find(item => item.name === 'Healing Potion');
      expect(healingPotion?.effect).toEqual({ type: 'heal', amount: '2d8+2' });

      const smokeBomb = STARTING_ITEMS.Rogue?.find(item => item.name === 'Smoke Bomb');
      expect(smokeBomb?.effect).toEqual({ type: 'escape' });

      const arcaneScroll = STARTING_ITEMS.Wizard?.find(item => item.name === 'Arcane Scroll');
      expect(arcaneScroll?.effect).toEqual({ type: 'spell', spellName: 'any' });
    });
  });
});
