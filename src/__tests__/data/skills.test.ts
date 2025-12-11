import { describe, it, expect } from 'vitest';
import { SKILLS, CLASS_SKILLS } from '../../data/skills';
import type { SkillName, AbilityScore } from '../../types';

describe('data/skills', () => {
  const allAbilityScores: AbilityScore[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  describe('SKILLS constant', () => {
    it('should be defined and contain expected skills', () => {
      expect(SKILLS).toBeDefined();
      expect(Object.keys(SKILLS).length).toBeGreaterThan(0);
      expect(SKILLS).toHaveProperty('Athletics');
      expect(SKILLS).toHaveProperty('Stealth');
    });

    it('each skill definition should have required properties', () => {
      for (const skillName in SKILLS) {
        const skill = SKILLS[skillName as SkillName];
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('ability');
        expect(skill).toHaveProperty('description');

        expect(typeof skill.name).toBe('string');
        expect(typeof skill.ability).toBe('string');
        expect(typeof skill.description).toBe('string');
        expect(skill.name).toBe(skillName); // Ensure name property matches key
      }
    });

    it('each skill\'s ability score should be a valid AbilityScore', () => {
      for (const skillName in SKILLS) {
        const skill = SKILLS[skillName as SkillName];
        expect(allAbilityScores).toContain(skill.ability);
      }
    });
  });

  describe('CLASS_SKILLS constant', () => {
    it('should be defined and contain class skill lists', () => {
      expect(CLASS_SKILLS).toBeDefined();
      expect(Object.keys(CLASS_SKILLS).length).toBeGreaterThan(0);
      expect(CLASS_SKILLS).toHaveProperty('Fighter');
      expect(CLASS_SKILLS).toHaveProperty('Rogue');
    });

    it('all skills listed for each class in CLASS_SKILLS should exist in the SKILLS constant', () => {
      for (const className in CLASS_SKILLS) {
        const skillsForClass = CLASS_SKILLS[className as keyof typeof CLASS_SKILLS];
        skillsForClass.forEach(skillName => {
          expect(SKILLS).toHaveProperty(skillName);
        });
      }
    });
  });
});
