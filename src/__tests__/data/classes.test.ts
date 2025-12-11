import { describe, it, expect } from 'vitest';
import { CLASSES, getClassDefinition, getBaseAC } from '../../data/classes';
import { WEAPONS, ARMORS } from '../../data/equipment';
import type { CharacterClass } from '../../types';

describe('data/classes', () => {
  it('CLASSES constant should be defined and contain expected classes', () => {
    expect(CLASSES).toBeDefined();
    expect(Object.keys(CLASSES)).toEqual(['Fighter', 'Rogue', 'Wizard', 'Cleric']);
  });

  it('each class definition should have required properties', () => {
    for (const className in CLASSES) {
      const classDef = CLASSES[className as CharacterClass];
      expect(classDef).toHaveProperty('name');
      expect(classDef).toHaveProperty('description');
      expect(classDef).toHaveProperty('hitDie');
      expect(classDef).toHaveProperty('baseHP');
      expect(classDef).toHaveProperty('babProgression');
      expect(classDef).toHaveProperty('baseBab');
      expect(classDef).toHaveProperty('saves');
      expect(classDef).toHaveProperty('baseSaves');
      expect(classDef).toHaveProperty('recommendedAttributes');
      expect(classDef).toHaveProperty('startingWeapon');
      expect(classDef).toHaveProperty('startingArmor');
      expect(classDef).toHaveProperty('hasShield');

      // Check nested properties
      expect(classDef.saves).toHaveProperty('fortitude');
      expect(classDef.saves).toHaveProperty('reflex');
      expect(classDef.saves).toHaveProperty('will');
      expect(classDef.baseSaves).toHaveProperty('fortitude');
      expect(classDef.baseSaves).toHaveProperty('reflex');
      expect(classDef.baseSaves).toHaveProperty('will');
    }
  });

  it('class startingWeapon should be a valid weapon type', () => {
    for (const className in CLASSES) {
      const classDef = CLASSES[className as CharacterClass];
      expect(WEAPONS).toHaveProperty(classDef.startingWeapon);
    }
  });

  it('class startingArmor should be a valid armor type', () => {
    for (const className in CLASSES) {
      const classDef = CLASSES[className as CharacterClass];
      expect(ARMORS).toHaveProperty(classDef.startingArmor);
    }
  });

  describe('getClassDefinition', () => {
    it('should return the correct definition for Fighter', () => {
      const fighterDef = getClassDefinition('Fighter');
      expect(fighterDef.name).toBe('Fighter');
      expect(fighterDef.hitDie).toBe(10);
      expect(fighterDef.baseHP).toBe(15);
    });

    it('should return the correct definition for Rogue', () => {
      const rogueDef = getClassDefinition('Rogue');
      expect(rogueDef.name).toBe('Rogue');
      expect(rogueDef.hitDie).toBe(8);
      expect(rogueDef.baseHP).toBe(13);
    });

    it('should return the correct definition for Wizard', () => {
      const wizardDef = getClassDefinition('Wizard');
      expect(wizardDef.name).toBe('Wizard');
      expect(wizardDef.hitDie).toBe(6);
      expect(wizardDef.baseHP).toBe(10);
    });

    it('should return the correct definition for Cleric', () => {
      const clericDef = getClassDefinition('Cleric');
      expect(clericDef.name).toBe('Cleric');
      expect(clericDef.hitDie).toBe(8);
      expect(clericDef.baseHP).toBe(13);
    });
  });

  describe('getBaseAC', () => {
    it('should calculate base AC for Fighter (Chainmail + Shield)', () => {
      // Chainmail (16) + Shield (2) = 18
      expect(getBaseAC('Fighter')).toBe(18);
    });

    it('should calculate base AC for Rogue (Leather)', () => {
      // Leather (12) = 12
      expect(getBaseAC('Rogue')).toBe(12);
    });

    it('should calculate base AC for Wizard (None)', () => {
      // None (10) = 10
      expect(getBaseAC('Wizard')).toBe(10);
    });

    it('should calculate base AC for Cleric (Chainmail + Shield)', () => {
      // Chainmail (16) + Shield (2) = 18
      expect(getBaseAC('Cleric')).toBe(18);
    });
  });
});
