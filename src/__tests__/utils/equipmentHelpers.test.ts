import { describe, it, expect } from 'vitest';
import { hasWeaponProficiency, hasArmorProficiency } from '../../utils/equipmentHelpers';
import { WEAPONS, ARMORS } from '../../data/equipment';
import type { Character } from '../../types';

// Test fixture
const createTestCharacter = (className: 'Fighter' | 'Wizard' | 'Rogue' | 'Cleric'): Character => ({
  name: 'Test Hero',
  avatarPath: 'human_female_00009.png',
  class: className,
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
});

describe('equipmentHelpers', () => {
  describe('hasWeaponProficiency', () => {
    it('Fighter should be proficient with all weapons', () => {
      const fighter = createTestCharacter('Fighter');

      expect(hasWeaponProficiency(fighter, WEAPONS['longsword'])).toBe(true);
      expect(hasWeaponProficiency(fighter, WEAPONS['rapier'])).toBe(true);
      expect(hasWeaponProficiency(fighter, WEAPONS['dagger'])).toBe(true);
      expect(hasWeaponProficiency(fighter, WEAPONS['mace'])).toBe(true);
    });

    it('Wizard should only be proficient with simple weapons', () => {
      const wizard = createTestCharacter('Wizard');

      expect(hasWeaponProficiency(wizard, WEAPONS['dagger'])).toBe(true);
      expect(hasWeaponProficiency(wizard, WEAPONS['mace'])).toBe(true);
      expect(hasWeaponProficiency(wizard, WEAPONS['longsword'])).toBe(false);
      expect(hasWeaponProficiency(wizard, WEAPONS['rapier'])).toBe(false);
    });

    it('Rogue should be proficient with finesse weapons', () => {
      const rogue = createTestCharacter('Rogue');

      expect(hasWeaponProficiency(rogue, WEAPONS['rapier'])).toBe(true);
      expect(hasWeaponProficiency(rogue, WEAPONS['dagger'])).toBe(true);
      expect(hasWeaponProficiency(rogue, WEAPONS['longsword'])).toBe(false);
    });

    it('Cleric should be proficient with simple weapons only', () => {
      const cleric = createTestCharacter('Cleric');

      expect(hasWeaponProficiency(cleric, WEAPONS['mace'])).toBe(true);
      expect(hasWeaponProficiency(cleric, WEAPONS['dagger'])).toBe(true);
      expect(hasWeaponProficiency(cleric, WEAPONS['longsword'])).toBe(false);
      expect(hasWeaponProficiency(cleric, WEAPONS['rapier'])).toBe(false);
    });
  });

  describe('hasArmorProficiency', () => {
    it('Fighter should be proficient with all armor', () => {
      const fighter = createTestCharacter('Fighter');

      expect(hasArmorProficiency(fighter, ARMORS.Leather)).toBe(true);
      expect(hasArmorProficiency(fighter, ARMORS.Chainmail)).toBe(true);
    });

    it('Wizard should not be proficient with any armor', () => {
      const wizard = createTestCharacter('Wizard');

      expect(hasArmorProficiency(wizard, ARMORS.Leather)).toBe(false);
      expect(hasArmorProficiency(wizard, ARMORS.Chainmail)).toBe(false);
    });

    it('Rogue should be proficient with light armor', () => {
      const rogue = createTestCharacter('Rogue');

      expect(hasArmorProficiency(rogue, ARMORS.Leather)).toBe(true);
      expect(hasArmorProficiency(rogue, ARMORS.Chainmail)).toBe(false);
    });

    it('Cleric should be proficient with light and medium armor', () => {
      const cleric = createTestCharacter('Cleric');

      expect(hasArmorProficiency(cleric, ARMORS.Leather)).toBe(true);
      expect(hasArmorProficiency(cleric, ARMORS.Chainmail)).toBe(true);
    });

    it('All classes should be proficient with no armor', () => {
      expect(hasArmorProficiency(createTestCharacter('Fighter'), ARMORS.None)).toBe(true);
      expect(hasArmorProficiency(createTestCharacter('Wizard'), ARMORS.None)).toBe(true);
      expect(hasArmorProficiency(createTestCharacter('Rogue'), ARMORS.None)).toBe(true);
      expect(hasArmorProficiency(createTestCharacter('Cleric'), ARMORS.None)).toBe(true);
    });
  });
});
