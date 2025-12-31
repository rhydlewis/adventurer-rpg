import { describe, it, expect } from 'vitest';
import { classFeatures, getClassFeature, getClassFeaturesForLevel } from '../../data/classFeatures/classFeatureCatalog';

describe('Class Feature Catalog', () => {
  it('should have fighter features', () => {
    expect(classFeatures['weapon-specialization']).toBeDefined();
    expect(classFeatures['improved-critical']).toBeDefined();
    expect(classFeatures['fighter-bonus-feat']).toBeDefined();
  });

  it('should have rogue features', () => {
    expect(classFeatures['sneak-attack-1d6']).toBeDefined();
    expect(classFeatures['sneak-attack-2d6']).toBeDefined();
    expect(classFeatures['sneak-attack-3d6']).toBeDefined();
    expect(classFeatures['evasion']).toBeDefined();
    expect(classFeatures['trapfinding']).toBeDefined();
    expect(classFeatures['uncanny-dodge']).toBeDefined();
  });

  it('should have wizard features', () => {
    expect(classFeatures['arcane-spellcasting']).toBeDefined();
    expect(classFeatures['scribe-scroll']).toBeDefined();
    expect(classFeatures['bonus-feat-wizard']).toBeDefined();
  });

  it('should have cleric features', () => {
    expect(classFeatures['turn-undead']).toBeDefined();
    expect(classFeatures['divine-spellcasting']).toBeDefined();
  });

  describe('getClassFeature', () => {
    it('should return feature by ID', () => {
      const feature = getClassFeature('sneak-attack-1d6');
      expect(feature?.name).toBe('Sneak Attack +1d6');
      expect(feature?.class).toBe('Rogue');
    });

    it('should return null for unknown feature', () => {
      expect(getClassFeature('invalid')).toBeNull();
    });
  });

  describe('getClassFeaturesForLevel', () => {
    it('should return features for specific class and level', () => {
      const rogueLevel1 = getClassFeaturesForLevel('Rogue', 1);
      expect(rogueLevel1.length).toBe(2); // sneak-attack-1d6 and trapfinding
      expect(rogueLevel1.some(f => f.id === 'sneak-attack-1d6')).toBe(true);
      expect(rogueLevel1.some(f => f.id === 'trapfinding')).toBe(true);
    });

    it('should return fighter bonus feats', () => {
      const fighterLevel1 = getClassFeaturesForLevel('Fighter', 1);
      expect(fighterLevel1.length).toBe(1);
      expect(fighterLevel1[0].id).toBe('fighter-bonus-feat');
    });

    it('should return empty array if no features', () => {
      const result = getClassFeaturesForLevel('Fighter', 99);
      expect(result).toEqual([]);
    });

    it('should return wizard level 1 spellcasting features', () => {
      const wizardLevel1 = getClassFeaturesForLevel('Wizard', 1);
      expect(wizardLevel1.length).toBe(2); // arcane-spellcasting and scribe-scroll
      expect(wizardLevel1.some(f => f.id === 'arcane-spellcasting')).toBe(true);
      expect(wizardLevel1.some(f => f.id === 'scribe-scroll')).toBe(true);
    });

    it('should return cleric turn undead at level 1', () => {
      const clericLevel1 = getClassFeaturesForLevel('Cleric', 1);
      expect(clericLevel1.length).toBe(2); // turn-undead and divine-spellcasting
      expect(clericLevel1.some(f => f.id === 'turn-undead')).toBe(true);
      expect(clericLevel1.some(f => f.id === 'divine-spellcasting')).toBe(true);
    });
  });
});
