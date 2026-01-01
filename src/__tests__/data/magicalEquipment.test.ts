import { describe, it, expect } from 'vitest';
import {
  MAGICAL_WEAPONS,
  MAGICAL_ARMOR,
  getMagicalWeapon,
  getMagicalArmor,
  getMagicalWeaponsByLevel,
  getMagicalArmorByLevel,
} from '../../data/magicalEquipment';

describe('Magical Equipment Catalog', () => {
  describe('Magical Weapons', () => {
    it('should have +1 weapons for all core classes', () => {
      expect(MAGICAL_WEAPONS['longsword-1']).toBeDefined();
      expect(MAGICAL_WEAPONS['longsword-1'].enchantmentBonus).toBe(1);
      expect(MAGICAL_WEAPONS['rapier-1']).toBeDefined();
      expect(MAGICAL_WEAPONS['rapier-1'].enchantmentBonus).toBe(1);
      expect(MAGICAL_WEAPONS['dagger-1']).toBeDefined();
      expect(MAGICAL_WEAPONS['dagger-1'].enchantmentBonus).toBe(1);
      expect(MAGICAL_WEAPONS['mace-1']).toBeDefined();
      expect(MAGICAL_WEAPONS['mace-1'].enchantmentBonus).toBe(1);
    });

    it('should have +2 weapons for all core classes', () => {
      expect(MAGICAL_WEAPONS['longsword-2']).toBeDefined();
      expect(MAGICAL_WEAPONS['longsword-2'].enchantmentBonus).toBe(2);
      expect(MAGICAL_WEAPONS['rapier-2']).toBeDefined();
      expect(MAGICAL_WEAPONS['rapier-2'].enchantmentBonus).toBe(2);
      expect(MAGICAL_WEAPONS['dagger-2']).toBeDefined();
      expect(MAGICAL_WEAPONS['dagger-2'].enchantmentBonus).toBe(2);
      expect(MAGICAL_WEAPONS['mace-2']).toBeDefined();
      expect(MAGICAL_WEAPONS['mace-2'].enchantmentBonus).toBe(2);
    });

    it('should have +3 weapons for all core classes', () => {
      expect(MAGICAL_WEAPONS['longsword-3']).toBeDefined();
      expect(MAGICAL_WEAPONS['longsword-3'].enchantmentBonus).toBe(3);
      expect(MAGICAL_WEAPONS['rapier-3']).toBeDefined();
      expect(MAGICAL_WEAPONS['rapier-3'].enchantmentBonus).toBe(3);
      expect(MAGICAL_WEAPONS['dagger-3']).toBeDefined();
      expect(MAGICAL_WEAPONS['dagger-3'].enchantmentBonus).toBe(3);
      expect(MAGICAL_WEAPONS['mace-3']).toBeDefined();
      expect(MAGICAL_WEAPONS['mace-3'].enchantmentBonus).toBe(3);
    });

    it('should preserve weapon properties from base weapons', () => {
      const longsword1 = MAGICAL_WEAPONS['longsword-1'];
      expect(longsword1.damage).toBe('1d8');
      expect(longsword1.damageType).toBe('slashing');
      expect(longsword1.finesse).toBe(false);
      expect(longsword1.proficiencyRequired).toBe('martial');

      const rapier2 = MAGICAL_WEAPONS['rapier-2'];
      expect(rapier2.damage).toBe('1d6');
      expect(rapier2.damageType).toBe('piercing');
      expect(rapier2.finesse).toBe(true);
      expect(rapier2.proficiencyRequired).toBe('martial-finesse');
    });
  });

  describe('Magical Armor', () => {
    it('should have +1 armor for light and medium armor types', () => {
      expect(MAGICAL_ARMOR['leather-1']).toBeDefined();
      expect(MAGICAL_ARMOR['leather-1'].enchantmentBonus).toBe(1);
      expect(MAGICAL_ARMOR['chainmail-1']).toBeDefined();
      expect(MAGICAL_ARMOR['chainmail-1'].enchantmentBonus).toBe(1);
    });

    it('should have +2 armor for light and medium armor types', () => {
      expect(MAGICAL_ARMOR['leather-2']).toBeDefined();
      expect(MAGICAL_ARMOR['leather-2'].enchantmentBonus).toBe(2);
      expect(MAGICAL_ARMOR['chainmail-2']).toBeDefined();
      expect(MAGICAL_ARMOR['chainmail-2'].enchantmentBonus).toBe(2);
    });

    it('should have +3 armor for light and medium armor types', () => {
      expect(MAGICAL_ARMOR['leather-3']).toBeDefined();
      expect(MAGICAL_ARMOR['leather-3'].enchantmentBonus).toBe(3);
      expect(MAGICAL_ARMOR['chainmail-3']).toBeDefined();
      expect(MAGICAL_ARMOR['chainmail-3'].enchantmentBonus).toBe(3);
    });

    it('should preserve armor properties from base armor', () => {
      const leather1 = MAGICAL_ARMOR['leather-1'];
      expect(leather1.baseAC).toBe(12);
      expect(leather1.maxDexBonus).toBeNull();
      expect(leather1.proficiencyRequired).toBe('light');

      const chainmail2 = MAGICAL_ARMOR['chainmail-2'];
      expect(chainmail2.baseAC).toBe(16);
      expect(chainmail2.maxDexBonus).toBe(2);
      expect(chainmail2.proficiencyRequired).toBe('medium');
    });
  });

  describe('getMagicalWeapon', () => {
    it('should return weapon by ID', () => {
      const weapon = getMagicalWeapon('longsword-2');
      expect(weapon?.name).toBe('Longsword +2');
      expect(weapon?.enchantmentBonus).toBe(2);
    });

    it('should return null for unknown weapon', () => {
      expect(getMagicalWeapon('invalid')).toBeNull();
    });
  });

  describe('getMagicalArmor', () => {
    it('should return armor by ID', () => {
      const armor = getMagicalArmor('leather-3');
      expect(armor?.name).toBe('Leather +3');
      expect(armor?.enchantmentBonus).toBe(3);
    });

    it('should return null for unknown armor', () => {
      expect(getMagicalArmor('invalid')).toBeNull();
    });
  });

  describe('getMagicalWeaponsByLevel', () => {
    it('should return all +1 weapons', () => {
      const weapons = getMagicalWeaponsByLevel(1);
      expect(weapons.length).toBe(4); // longsword, rapier, dagger, mace
      expect(weapons.every(w => w.enchantmentBonus === 1)).toBe(true);
    });

    it('should return all +2 weapons', () => {
      const weapons = getMagicalWeaponsByLevel(2);
      expect(weapons.length).toBe(4);
      expect(weapons.every(w => w.enchantmentBonus === 2)).toBe(true);
    });

    it('should return all +3 weapons', () => {
      const weapons = getMagicalWeaponsByLevel(3);
      expect(weapons.length).toBe(4);
      expect(weapons.every(w => w.enchantmentBonus === 3)).toBe(true);
    });
  });

  describe('getMagicalArmorByLevel', () => {
    it('should return all +1 armor', () => {
      const armors = getMagicalArmorByLevel(1);
      expect(armors.length).toBe(2); // leather, chainmail
      expect(armors.every(a => a.enchantmentBonus === 1)).toBe(true);
    });

    it('should return all +2 armor', () => {
      const armors = getMagicalArmorByLevel(2);
      expect(armors.length).toBe(2);
      expect(armors.every(a => a.enchantmentBonus === 2)).toBe(true);
    });

    it('should return all +3 armor', () => {
      const armors = getMagicalArmorByLevel(3);
      expect(armors.length).toBe(2);
      expect(armors.every(a => a.enchantmentBonus === 3)).toBe(true);
    });
  });
});
