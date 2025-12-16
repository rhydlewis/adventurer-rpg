import type { Character } from '../types/character';
import type { Entity } from '../types/entity';
import type { SkillName, SkillBonus } from '../types/skill';
import { SKILLS, CLASS_SKILLS } from '../data/skills';
import { calculateModifier } from './dice';
import { isCharacter } from './entityHelpers';

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
 * Calculate skill bonus for an entity
 * @param entity Entity to calculate for (Character or Creature)
 * @param skillName Skill to calculate
 * @param expertiseBonus Optional expertise bonus (e.g., Rogue +4)
 * @returns Skill bonus with breakdown
 */
export function calculateSkillBonus(
  entity: Entity,
  skillName: SkillName,
  expertiseBonus: number = 0
): SkillBonus {
  const skillDef = SKILLS[skillName];
  const ranks = entity.skills[skillName];

  // Get ability modifier for this skill
  const abilityScore = entity.attributes[skillDef.ability];
  const abilityMod = calculateModifier(abilityScore);

  // Class skill bonus: +3 if trained (ranks > 0) AND it's a class skill
  // Only applies to Characters (Creatures don't have class skills)
  const isTrained = ranks > 0;
  const isClassSkillForEntity = isCharacter(entity) ? isClassSkill(entity.class, skillName) : false;
  const classSkillBonus = isTrained && isClassSkillForEntity ? 3 : 0;

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
 * @param entity Entity to calculate for (Character or Creature)
 * @param skillName Skill to calculate
 * @param expertiseBonus Optional expertise bonus
 * @returns Total skill bonus
 */
export function getTotalSkillBonus(
  entity: Entity,
  skillName: SkillName,
  expertiseBonus: number = 0
): number {
  return calculateSkillBonus(entity, skillName, expertiseBonus).totalBonus;
}
