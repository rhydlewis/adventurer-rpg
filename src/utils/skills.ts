import type { Character } from '../types/character';
import type { SkillName, SkillBonus } from '../types/skill';
import { SKILLS, CLASS_SKILLS } from '../data/skills';
import { calculateModifier } from './dice';

/**
 * Check if a skill is a class skill for a given class
 * @param className Character class
 * @param skillName Skill to check
 * @returns true if skill is a class skill
 */
export function isClassSkill(
  className: Character['class'],
  skillName: SkillName
): boolean {
  const classSkills = CLASS_SKILLS[className] || [];
  return classSkills.includes(skillName);
}

/**
 * Calculate skill bonus for a character
 * @param character Character to calculate for
 * @param skillName Skill to calculate
 * @param expertiseBonus Optional expertise bonus (e.g., Rogue +4)
 * @returns Skill bonus with breakdown
 */
export function calculateSkillBonus(
  character: Character,
  skillName: SkillName,
  expertiseBonus: number = 0
): SkillBonus {
  const skillDef = SKILLS[skillName];
  const ranks = character.skills[skillName];

  // Get ability modifier for this skill
  const abilityScore = character.attributes[skillDef.ability];
  const abilityMod = calculateModifier(abilityScore);

  // Class skill bonus: +3 if trained (ranks > 0) AND it's a class skill
  const isTrained = ranks > 0;
  const isClassSkillForChar = isClassSkill(character.class, skillName);
  const classSkillBonus = isTrained && isClassSkillForChar ? 3 : 0;

  // Total bonus
  const totalBonus = ranks + abilityMod + classSkillBonus + expertiseBonus;

  return {
    skill: skillName,
    totalBonus,
    breakdown: {
      ranks,
      abilityMod,
      classSkillBonus,
      otherBonuses: expertiseBonus,
    },
  };
}

/**
 * Get total skill bonus as a simple number (convenience wrapper)
 * @param character Character to calculate for
 * @param skillName Skill to calculate
 * @param expertiseBonus Optional expertise bonus
 * @returns Total skill bonus
 */
export function getTotalSkillBonus(
  character: Character,
  skillName: SkillName,
  expertiseBonus: number = 0
): number {
  return calculateSkillBonus(character, skillName, expertiseBonus).totalBonus;
}
