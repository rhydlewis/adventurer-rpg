import { describe, it, expect } from 'vitest';
import {
  getSpellProgressionForLevel,
  calculateSpellsToLearn,
  addSpellsToCharacter,
} from '../../utils/spellProgression';
import type { Character } from '../../types/character';
import { SPELLS } from '../../data/spells';

describe('Spell Progression', () => {
  const mockWizard: Character = {
    name: 'Test Wizard',
    avatarPath: 'avatar.png',
    class: 'Wizard',
    level: 1,
    maxHp: 8,
    hp: 8,
    ac: 12,
    bab: 0,
    saves: { fortitude: 0, reflex: 0, will: 2 },
    attributes: { STR: 10, DEX: 14, CON: 12, INT: 16, WIS: 10, CHA: 10 },
    skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
    feats: [],
    equipment: { weapon: null, weapons: [], armor: null, shield: null, items: [] },
    resources: { abilities: [], spellSlots: { level0: { max: 99, current: 99 }, level1: { max: 2, current: 2 } } },
    knownSpells: [],
  } as Character;

  describe('getSpellProgressionForLevel', () => {
    it('should return cantrip progression for Wizard level 1', () => {
      const progression = getSpellProgressionForLevel('Wizard', 1);
      expect(progression).toEqual({ spellsToLearn: 3, spellLevel: 0 });
    });

    it('should return level-1 spell progression for Wizard level 2', () => {
      const progression = getSpellProgressionForLevel('Wizard', 2);
      expect(progression).toEqual({ spellsToLearn: 1, spellLevel: 1 });
    });

    it('should return cantrip progression for Cleric level 1', () => {
      const progression = getSpellProgressionForLevel('Cleric', 1);
      expect(progression).toEqual({ spellsToLearn: 3, spellLevel: 0 });
    });

    it('should return null for non-caster classes', () => {
      const progression = getSpellProgressionForLevel('Fighter', 1);
      expect(progression).toBeNull();
    });

    it('should return null for levels without spell progression', () => {
      const progression = getSpellProgressionForLevel('Wizard', 99);
      expect(progression).toBeNull();
    });
  });

  describe('calculateSpellsToLearn', () => {
    it('should return cantrips for Wizard level 1', () => {
      const result = calculateSpellsToLearn(mockWizard, 1);
      expect(result).toBeDefined();
      expect(result?.spellLevel).toBe(0);
      expect(result?.spellsToSelect).toBe(3);
      expect(result?.availableSpells.length).toBe(3); // All 3 wizard cantrips
    });

    it('should filter out already known spells', () => {
      const wizardWithSpells = {
        ...mockWizard,
        knownSpells: [SPELLS.ray_of_frost],
      };
      const result = calculateSpellsToLearn(wizardWithSpells, 1);
      expect(result?.availableSpells.length).toBe(2); // Only 2 cantrips left
      expect(result?.availableSpells.some(s => s.id === 'ray_of_frost')).toBe(false);
    });

    it('should return level-1 spells for Wizard level 2', () => {
      const wizardLevel2 = { ...mockWizard, level: 2 };
      const result = calculateSpellsToLearn(wizardLevel2, 2);
      expect(result?.spellLevel).toBe(1);
      expect(result?.spellsToSelect).toBe(1);
      expect(result?.availableSpells.length).toBe(2); // 2 wizard level-1 spells
    });

    it('should return null for non-caster classes', () => {
      const fighter = { ...mockWizard, class: 'Fighter' as const };
      const result = calculateSpellsToLearn(fighter, 1);
      expect(result).toBeNull();
    });

    it('should limit spells to select if fewer available', () => {
      const wizardWithSpells = {
        ...mockWizard,
        knownSpells: [SPELLS.ray_of_frost, SPELLS.acid_splash],
      };
      const result = calculateSpellsToLearn(wizardWithSpells, 1);
      expect(result?.spellsToSelect).toBe(1); // Only 1 cantrip left
      expect(result?.availableSpells.length).toBe(1);
    });
  });

  describe('addSpellsToCharacter', () => {
    it('should add spells to character with no known spells', () => {
      const updated = addSpellsToCharacter(mockWizard, [SPELLS.ray_of_frost]);
      expect(updated.knownSpells?.length).toBe(1);
      expect(updated.knownSpells?.[0].id).toBe('ray_of_frost');
    });

    it('should add spells to character with existing spells', () => {
      const wizardWithSpells = {
        ...mockWizard,
        knownSpells: [SPELLS.ray_of_frost],
      };
      const updated = addSpellsToCharacter(wizardWithSpells, [SPELLS.acid_splash]);
      expect(updated.knownSpells?.length).toBe(2);
      expect(updated.knownSpells?.some(s => s.id === 'ray_of_frost')).toBe(true);
      expect(updated.knownSpells?.some(s => s.id === 'acid_splash')).toBe(true);
    });

    it('should add multiple spells at once', () => {
      const updated = addSpellsToCharacter(mockWizard, [
        SPELLS.ray_of_frost,
        SPELLS.acid_splash,
        SPELLS.daze,
      ]);
      expect(updated.knownSpells?.length).toBe(3);
    });
  });
});
