import { describe, it, expect } from 'vitest';
import {
  fighterProgression,
  rogueProgression,
  wizardProgression,
  clericProgression,
  getClassProgression,
} from '../../data/progression/classProgressionTables';

describe('Class Progression Tables', () => {
  describe('Fighter Progression', () => {
    it('should have progression for levels 1-5', () => {
      expect(fighterProgression[1]).toBeDefined();
      expect(fighterProgression[5]).toBeDefined();
    });

    it('should have high BAB progression', () => {
      expect(fighterProgression[1].baseAttackBonus).toBe(1);
      expect(fighterProgression[5].baseAttackBonus).toBe(5);
    });

    it('should grant bonus feats', () => {
      expect(fighterProgression[1].featGained).toBe(true);
      expect(fighterProgression[2].featGained).toBe(true);
    });

    it('should have good Fortitude save', () => {
      expect(fighterProgression[1].fortitudeSave).toBe(2);
      expect(fighterProgression[5].fortitudeSave).toBe(4);
    });
  });

  describe('Rogue Progression', () => {
    it('should have more skill points than other classes', () => {
      expect(rogueProgression[1].skillPoints).toBe(8);
      expect(wizardProgression[1].skillPoints).toBe(2);
    });

    it('should have good Reflex save', () => {
      expect(rogueProgression[1].reflexSave).toBe(2);
      expect(rogueProgression[5].reflexSave).toBe(4);
    });

    it('should gain sneak attack at odd levels', () => {
      expect(rogueProgression[1].classFeatures).toContain('sneak-attack-1d6');
      expect(rogueProgression[3].classFeatures).toContain('sneak-attack-2d6');
      expect(rogueProgression[5].classFeatures).toContain('sneak-attack-3d6');
    });
  });

  describe('Wizard Progression', () => {
    it('should have spell slots', () => {
      expect(wizardProgression[1].spellsPerDay).toBeDefined();
      expect(wizardProgression[1].spellsPerDay?.level1).toBe(1);
    });

    it('should gain higher level spells as they level', () => {
      expect(wizardProgression[1].spellsPerDay?.level2).toBe(0);
      expect(wizardProgression[3].spellsPerDay?.level2).toBe(1);
      expect(wizardProgression[5].spellsPerDay?.level3).toBe(1);
    });

    it('should have good Will save', () => {
      expect(wizardProgression[1].willSave).toBe(2);
      expect(wizardProgression[5].willSave).toBe(4);
    });
  });

  describe('Cleric Progression', () => {
    it('should have spell slots', () => {
      expect(clericProgression[1].spellsPerDay).toBeDefined();
    });

    it('should have good Fort and Will saves', () => {
      expect(clericProgression[1].fortitudeSave).toBe(2);
      expect(clericProgression[1].willSave).toBe(2);
    });

    it('should have turn undead feature', () => {
      expect(clericProgression[1].classFeatures).toContain('turn-undead');
    });
  });

  describe('getClassProgression', () => {
    it('should return correct progression for class and level', () => {
      const fighter2 = getClassProgression('Fighter', 2);
      expect(fighter2).toBeDefined();
      expect(fighter2?.baseAttackBonus).toBe(2);
    });

    it('should return null for invalid class', () => {
      const result = getClassProgression('invalid', 1);
      expect(result).toBeNull();
    });

    it('should return null for invalid level', () => {
      const result = getClassProgression('Fighter', 10);
      expect(result).toBeNull();
    });
  });
});
