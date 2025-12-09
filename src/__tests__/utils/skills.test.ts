import { describe, it, expect } from 'vitest';
import { calculateSkillBonus, isClassSkill, getTotalSkillBonus } from '../../utils/skills';
import type { Character } from '../../types';

describe('utils/skills', () => {
  const createTestCharacter = (
    className: Character['class'],
    attributes: Character['attributes'],
    skillRanks: Character['skills']
  ): Character => ({
    name: 'Test',
    class: className,
    level: 1,
    attributes,
    hp: 10,
    maxHp: 10,
    ac: 10,
    bab: 0,
    saves: { fortitude: 0, reflex: 0, will: 0 },
    skills: skillRanks,
    feats: [],
    equipment: {
      weapon: {
        name: 'Dagger',
        damage: '1d4',
        damageType: 'piercing',
        finesse: true,
        description: '',
      },
      armor: { name: 'None', baseAC: 10, maxDexBonus: null, description: '' },
      shield: { equipped: false, acBonus: 0 },
      items: [],
    },
    resources: { abilities: [] },
  });

  describe('isClassSkill', () => {
    it('returns true for Fighter class skills', () => {
      expect(isClassSkill('Fighter', 'Athletics')).toBe(true);
      expect(isClassSkill('Fighter', 'Intimidate')).toBe(true);
    });

    it('returns false for non-class skills', () => {
      expect(isClassSkill('Fighter', 'Arcana')).toBe(false);
      expect(isClassSkill('Fighter', 'Stealth')).toBe(false);
    });

    it('returns true for Rogue class skills', () => {
      expect(isClassSkill('Rogue', 'Stealth')).toBe(true);
      expect(isClassSkill('Rogue', 'Perception')).toBe(true);
    });

    it('returns true for Wizard class skills', () => {
      expect(isClassSkill('Wizard', 'Arcana')).toBe(true);
    });

    it('returns true for Cleric class skills', () => {
      expect(isClassSkill('Cleric', 'Medicine')).toBe(true);
    });
  });

  describe('calculateSkillBonus', () => {
    it('calculates bonus with ranks + ability mod + class skill bonus', () => {
      const character = createTestCharacter(
        'Fighter',
        { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
        {
          Athletics: 4, // Class skill for Fighter
          Stealth: 0,
          Perception: 0,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        }
      );

      const bonus = calculateSkillBonus(character, 'Athletics');
      // Ranks: 4, STR mod: +3, Class skill bonus: +3 (trained + class skill)
      // Total: 4 + 3 + 3 = 10
      expect(bonus.totalBonus).toBe(10);
      expect(bonus.breakdown.ranks).toBe(4);
      expect(bonus.breakdown.abilityMod).toBe(3);
      expect(bonus.breakdown.classSkillBonus).toBe(3);
    });

    it('does not give class skill bonus if untrained (0 ranks)', () => {
      const character = createTestCharacter(
        'Fighter',
        { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
        {
          Athletics: 0, // Untrained
          Stealth: 0,
          Perception: 0,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        }
      );

      const bonus = calculateSkillBonus(character, 'Athletics');
      // Ranks: 0, STR mod: +3, Class skill bonus: 0 (untrained)
      // Total: 0 + 3 + 0 = 3
      expect(bonus.totalBonus).toBe(3);
      expect(bonus.breakdown.classSkillBonus).toBe(0);
    });

    it('does not give class skill bonus if not a class skill', () => {
      const character = createTestCharacter(
        'Fighter',
        { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 8 },
        {
          Athletics: 0,
          Stealth: 3, // Not a class skill for Fighter
          Perception: 0,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        }
      );

      const bonus = calculateSkillBonus(character, 'Stealth');
      // Ranks: 3, DEX mod: +2, Class skill bonus: 0 (not class skill)
      // Total: 3 + 2 + 0 = 5
      expect(bonus.totalBonus).toBe(5);
      expect(bonus.breakdown.classSkillBonus).toBe(0);
    });

    it('uses correct ability modifier for each skill', () => {
      const character = createTestCharacter(
        'Wizard',
        { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 12, CHA: 10 },
        {
          Athletics: 0, // STR
          Stealth: 0, // DEX
          Perception: 0, // WIS
          Arcana: 4, // INT (class skill)
          Medicine: 0, // WIS
          Intimidate: 0, // CHA
        }
      );

      // Arcana uses INT (+3 mod)
      const arcana = calculateSkillBonus(character, 'Arcana');
      expect(arcana.breakdown.abilityMod).toBe(3); // INT 16 = +3
      expect(arcana.totalBonus).toBe(10); // 4 ranks + 3 INT + 3 class skill

      // Stealth uses DEX (+2 mod)
      const stealth = calculateSkillBonus(character, 'Stealth');
      expect(stealth.breakdown.abilityMod).toBe(2); // DEX 14 = +2
    });

    it('applies Rogue expertise correctly (+4 to two skills)', () => {
      // Note: Rogue expertise should be applied via otherBonuses
      const character = createTestCharacter(
        'Rogue',
        { STR: 10, DEX: 16, CON: 12, INT: 14, WIS: 12, CHA: 10 },
        {
          Athletics: 0,
          Stealth: 4, // Class skill + expertise
          Perception: 4, // Class skill + expertise
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        }
      );

      // Stealth: 4 ranks + 3 DEX + 3 class + 4 expertise = 14
      const stealth = calculateSkillBonus(character, 'Stealth', 4); // Pass expertise bonus
      expect(stealth.totalBonus).toBe(14);
      expect(stealth.breakdown.otherBonuses).toBe(4);

      // Perception: 4 ranks + 1 WIS + 3 class + 4 expertise = 12
      const perception = calculateSkillBonus(character, 'Perception', 4);
      expect(perception.totalBonus).toBe(12);
    });
  });

  describe('getTotalSkillBonus', () => {
    it('returns just the total number for simple cases', () => {
      const character = createTestCharacter(
        'Fighter',
        { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
        {
          Athletics: 4,
          Stealth: 0,
          Perception: 0,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        }
      );

      expect(getTotalSkillBonus(character, 'Athletics')).toBe(10);
    });
  });
});
