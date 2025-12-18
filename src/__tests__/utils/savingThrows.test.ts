import { describe, it, expect } from 'vitest';
import {
  calculateSaveDC,
  makeSavingThrow,
  applySaveResult,
  type SaveResult,
} from '../../utils/savingThrows';
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

describe('Saving Throws System', () => {
  describe('calculateSaveDC', () => {
    it('calculates spell DC: 10 + spell level + ability mod', () => {
      // Wizard with INT 16 (+3) casting Sleep (level 1)
      // DC = 10 + 1 + 3 = 14
      const dc = calculateSaveDC(1, 3);
      expect(dc).toBe(14);
    });

    it('handles level 0 spells (cantrips)', () => {
      // Wizard with INT 16 (+3) casting cantrip
      // DC = 10 + 0 + 3 = 13
      const dc = calculateSaveDC(0, 3);
      expect(dc).toBe(13);
    });

    it('handles higher ability modifiers', () => {
      // Cleric with WIS 18 (+4) casting level 1 spell
      // DC = 10 + 1 + 4 = 15
      const dc = calculateSaveDC(1, 4);
      expect(dc).toBe(15);
    });

    it('handles negative ability modifiers', () => {
      // Caster with INT 8 (-1) casting level 1 spell
      // DC = 10 + 1 + (-1) = 10
      const dc = calculateSaveDC(1, -1);
      expect(dc).toBe(10);
    });
  });

  describe('makeSavingThrow', () => {
    it('succeeds when roll + bonus meets or exceeds DC', () => {
      const character = createTestCharacter({
        saves: { fortitude: 5, reflex: 2, will: 1 },
      });

      // Roll 15 + fortitude 5 = 20 vs DC 18
      const result = makeSavingThrow(character, 'fortitude', 18, 15);

      expect(result.success).toBe(true);
      expect(result.roll).toBe(15);
      expect(result.total).toBe(20);
      expect(result.dc).toBe(18);
    });

    it('fails when roll + bonus is less than DC', () => {
      const character = createTestCharacter({
        saves: { fortitude: 2, reflex: 0, will: 0 },
      });

      // Roll 8 + fortitude 2 = 10 vs DC 15
      const result = makeSavingThrow(character, 'fortitude', 15, 8);

      expect(result.success).toBe(false);
      expect(result.total).toBe(10);
    });

    it('exactly meeting DC is a success', () => {
      const character = createTestCharacter({
        saves: { fortitude: 3, reflex: 0, will: 0 },
      });

      // Roll 12 + fortitude 3 = 15 vs DC 15
      const result = makeSavingThrow(character, 'fortitude', 15, 12);

      expect(result.success).toBe(true);
    });

    it('handles reflex saves', () => {
      const character = createTestCharacter({
        saves: { fortitude: 2, reflex: 4, will: 0 },
      });

      // Roll 10 + reflex 4 = 14 vs DC 16
      const result = makeSavingThrow(character, 'reflex', 16, 10);

      expect(result.success).toBe(false);
      expect(result.saveType).toBe('reflex');
    });

    it('handles will saves', () => {
      const character = createTestCharacter({
        saves: { fortitude: 2, reflex: 0, will: 3 },
      });

      // Roll 14 + will 3 = 17 vs DC 15
      const result = makeSavingThrow(character, 'will', 15, 14);

      expect(result.success).toBe(true);
      expect(result.saveType).toBe('will');
    });

    it('handles negative save bonuses', () => {
      const character = createTestCharacter({
        saves: { fortitude: 0, reflex: -1, will: 0 },
      });

      // Roll 15 + reflex -1 = 14 vs DC 14
      const result = makeSavingThrow(character, 'reflex', 14, 15);

      expect(result.success).toBe(true);
      expect(result.total).toBe(14);
    });
  });

  describe('applySaveResult', () => {
    it('negates: success = no effect', () => {
      const successResult: SaveResult = {
        success: true,
        roll: 15,
        bonus: 3,
        total: 18,
        dc: 15,
        saveType: 'will',
      };

      const result = applySaveResult(successResult, 'negates');

      expect(result.applied).toBe(false);
      expect(result.description).toContain('resist');
    });

    it('negates: failure = full effect', () => {
      const failResult: SaveResult = {
        success: false,
        roll: 8,
        bonus: 2,
        total: 10,
        dc: 15,
        saveType: 'will',
      };

      const result = applySaveResult(failResult, 'negates');

      expect(result.applied).toBe(true);
      expect(result.damageMultiplier).toBe(1);
    });

    it('half: success = half damage', () => {
      const successResult: SaveResult = {
        success: true,
        roll: 16,
        bonus: 2,
        total: 18,
        dc: 15,
        saveType: 'reflex',
      };

      const result = applySaveResult(successResult, 'half');

      expect(result.applied).toBe(true);
      expect(result.damageMultiplier).toBe(0.5);
      expect(result.description).toContain('half');
    });

    it('half: failure = full damage', () => {
      const failResult: SaveResult = {
        success: false,
        roll: 8,
        bonus: 2,
        total: 10,
        dc: 15,
        saveType: 'reflex',
      };

      const result = applySaveResult(failResult, 'half');

      expect(result.applied).toBe(true);
      expect(result.damageMultiplier).toBe(1);
    });

    it('partial: success = reduced duration', () => {
      const successResult: SaveResult = {
        success: true,
        roll: 14,
        bonus: 1,
        total: 15,
        dc: 14,
        saveType: 'fortitude',
      };

      const result = applySaveResult(successResult, 'partial', 3);

      expect(result.applied).toBe(true);
      expect(result.duration).toBe(1); // Reduced from 3 to 1
      expect(result.description).toContain('reduced');
    });

    it('partial: failure = full duration', () => {
      const failResult: SaveResult = {
        success: false,
        roll: 8,
        bonus: 1,
        total: 9,
        dc: 14,
        saveType: 'fortitude',
      };

      const result = applySaveResult(failResult, 'partial', 3);

      expect(result.applied).toBe(true);
      expect(result.duration).toBe(3); // Full duration
    });

    it('partial: defaults duration to 1 if not provided', () => {
      const successResult: SaveResult = {
        success: true,
        roll: 14,
        bonus: 1,
        total: 15,
        dc: 14,
        saveType: 'fortitude',
      };

      const result = applySaveResult(successResult, 'partial');

      expect(result.duration).toBe(1);
    });
  });
});
