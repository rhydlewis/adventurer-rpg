import { describe, it, expect } from 'vitest';
import { calculateInitiativeBonus } from '../../utils/initiative';
import type { Character } from '../../types';

const createTestCharacter = (overrides?: Partial<Character>): Character => ({
  name: 'Test Hero',
  avatarPath: 'human_female_00009.png',
  class: 'Fighter',
  level: 1,
  attributes: {
    STR: 16,
    DEX: 14,
    CON: 14,
    INT: 10,
    WIS: 12,
    CHA: 10,
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
  ...overrides,
});

describe('Initiative System', () => {
  describe('calculateInitiativeBonus', () => {
    it('calculates base initiative from DEX modifier', () => {
      // DEX 14 = +2 modifier
      const character = createTestCharacter({ attributes: { STR: 10, DEX: 14, CON: 10, INT: 10, WIS: 10, CHA: 10 } });
      const result = calculateInitiativeBonus(character);

      expect(result.bonus).toBe(2);
      expect(result.breakdown.dexMod).toBe(2);
      expect(result.breakdown.featBonus).toBe(0);
      expect(result.breakdown.skillBonus).toBe(0);
    });

    it('adds +4 for Improved Initiative feat', () => {
      const character = createTestCharacter({
        attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        feats: [
          {
            name: 'Improved Initiative',
            description: '+4 initiative',
            effect: { type: 'passive', stat: 'initiative', bonus: 4 },
          },
        ],
      });
      const result = calculateInitiativeBonus(character);

      expect(result.bonus).toBe(4); // 0 DEX + 4 feat
      expect(result.breakdown.dexMod).toBe(0);
      expect(result.breakdown.featBonus).toBe(4);
    });

    it('adds +2 for Perception ≥3 ranks', () => {
      const character = createTestCharacter({
        attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        skills: {
          Athletics: 0,
          Stealth: 0,
          Perception: 3,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        },
      });
      const result = calculateInitiativeBonus(character);

      expect(result.bonus).toBe(2); // 0 DEX + 2 Perception
      expect(result.breakdown.skillBonus).toBe(2);
    });

    it('does not add Perception bonus if <3 ranks', () => {
      const character = createTestCharacter({
        attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        skills: {
          Athletics: 0,
          Stealth: 0,
          Perception: 2,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        },
      });
      const result = calculateInitiativeBonus(character);

      expect(result.bonus).toBe(0);
      expect(result.breakdown.skillBonus).toBe(0);
    });

    it('adds +2 for Stealth total bonus ≥5', () => {
      // Rogue with DEX 16 (+3), 4 ranks in Stealth, +3 class skill bonus = 10 total
      const character = createTestCharacter({
        class: 'Rogue',
        attributes: { STR: 10, DEX: 16, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        skills: {
          Athletics: 0,
          Stealth: 4,
          Perception: 0,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        },
      });
      const result = calculateInitiativeBonus(character);

      // DEX +3, Stealth +2 = +5 total
      expect(result.bonus).toBe(5);
      expect(result.breakdown.dexMod).toBe(3);
      expect(result.breakdown.skillBonus).toBe(2);
    });

    it('does not add Stealth bonus if total <5', () => {
      const character = createTestCharacter({
        attributes: { STR: 10, DEX: 12, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        skills: {
          Athletics: 0,
          Stealth: 2, // 2 ranks + 1 DEX + 3 class (Fighter doesn't have Stealth as class skill) = 3 total
          Perception: 0,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        },
      });
      const result = calculateInitiativeBonus(character);

      expect(result.bonus).toBe(1); // Just DEX +1
      expect(result.breakdown.skillBonus).toBe(0);
    });

    it('stacks all bonuses together', () => {
      const character = createTestCharacter({
        class: 'Rogue',
        attributes: { STR: 10, DEX: 16, CON: 10, INT: 10, WIS: 14, CHA: 10 },
        skills: {
          Athletics: 0,
          Stealth: 4, // Will give +2 bonus
          Perception: 3, // Will give +2 bonus
          Arcana: 0,
          Medicine: 0,
          Intimidate: 0,
        },
        feats: [
          {
            name: 'Improved Initiative',
            description: '+4 initiative',
            effect: { type: 'passive', stat: 'initiative', bonus: 4 },
          },
        ],
      });
      const result = calculateInitiativeBonus(character);

      // DEX +3, Improved Initiative +4, Perception +2, Stealth +2 = +11
      expect(result.bonus).toBe(11);
      expect(result.breakdown.dexMod).toBe(3);
      expect(result.breakdown.featBonus).toBe(4);
      expect(result.breakdown.skillBonus).toBe(4); // Perception +2 + Stealth +2
    });

    it('handles negative DEX modifier', () => {
      const character = createTestCharacter({
        attributes: { STR: 10, DEX: 8, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      });
      const result = calculateInitiativeBonus(character);

      expect(result.bonus).toBe(-1);
      expect(result.breakdown.dexMod).toBe(-1);
    });
  });
});
