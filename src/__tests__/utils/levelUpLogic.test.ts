import { describe, it, expect } from 'vitest';
import { calculateHpGain, calculateLevelUp, applyLevelUp } from '../../utils/levelUpLogic';
import type { Character } from '../../types/character';

describe('calculateHpGain', () => {
  it('should calculate HP gain for fighter (d10)', () => {
    const fighter: Character = {
      class: 'Fighter',
      level: 1,
      attributes: { STR: 10, DEX: 10, CON: 14, INT: 10, WIS: 10, CHA: 10 },  // +2 CON modifier
    } as Character;

    const hpGain = calculateHpGain(fighter);
    expect(hpGain).toBe(8);  // Average d10 (6) + CON (+2) = 8
  });

  it('should calculate HP gain for wizard (d4)', () => {
    const wizard: Character = {
      class: 'Wizard',
      level: 1,
      attributes: { STR: 10, DEX: 10, CON: 12, INT: 10, WIS: 10, CHA: 10 },  // +1 CON modifier
    } as Character;

    const hpGain = calculateHpGain(wizard);
    expect(hpGain).toBe(4);  // Average d4 (3) + CON (+1) = 4
  });

  it('should have minimum 1 HP gain', () => {
    const weakWizard: Character = {
      class: 'Wizard',
      level: 1,
      attributes: { STR: 10, DEX: 10, CON: 6, INT: 10, WIS: 10, CHA: 10 },  // -2 CON modifier
    } as Character;

    const hpGain = calculateHpGain(weakWizard);
    expect(hpGain).toBeGreaterThanOrEqual(1);
  });
});

describe('calculateLevelUp', () => {
  const mockFighter: Character = {
    name: 'Test Fighter',
    avatarPath: 'avatar.png',
    class: 'Fighter',
    level: 1,
    maxHp: 14,
    hp: 14,
    ac: 15,
    bab: 1,
    saves: { fortitude: 2, reflex: 0, will: 0 },
    attributes: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: 10, CHA: 10 },
    skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
    feats: [],
    equipment: { weapon: null, weapons: [], armor: null, shield: null, items: [] },
    resources: { abilities: [] },
  } as Character;

  it('should calculate level 1 -> 2 progression', () => {
    const result = calculateLevelUp(mockFighter, 2);

    expect(result).toBeDefined();
    expect(result?.newLevel).toBe(2);
    expect(result?.hpGained).toBe(8);  // d10 average + CON
    expect(result?.babGained).toBe(1);  // 1 -> 2
    expect(result?.savesGained.fort).toBe(1);  // 2 -> 3
    expect(result?.featGained).toBe(true);  // Fighter bonus feat
  });

  it('should return null for invalid level', () => {
    const result = calculateLevelUp(mockFighter, 10);
    expect(result).toBeNull();
  });

  it('should track spell slots for casters', () => {
    const wizard: Character = {
      ...mockFighter,
      class: 'Wizard',
    } as Character;

    const result = calculateLevelUp(wizard, 2);
    expect(result?.spellsLearned).toBe(2);  // Wizards learn 2 spells per level
  });
});

describe('applyLevelUp', () => {
  it('should return new character with updated stats', () => {
    const original: Character = {
      name: 'Test',
      avatarPath: 'avatar.png',
      class: 'Fighter',
      level: 1,
      maxHp: 14,
      hp: 14,
      ac: 15,
      bab: 1,
      saves: { fortitude: 2, reflex: 0, will: 0 },
      attributes: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: 10, CHA: 10 },
      skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
      feats: [],
      equipment: { weapon: null, weapons: [], armor: null, shield: null, items: [] },
      resources: { abilities: [] },
    } as Character;

    const levelUpResult = {
      oldLevel: 1,
      newLevel: 2,
      hpGained: 8,
      babGained: 1,
      savesGained: { fort: 1, reflex: 0, will: 0 },
      featGained: true,
      skillPoints: 2,
      classFeatures: ['fighter-bonus-feat-2'],
    };

    const updated = applyLevelUp(original, levelUpResult);

    expect(updated.level).toBe(2);
    expect(updated.maxHp).toBe(22);  // 14 + 8
    expect(updated.hp).toBe(22);  // Full HP on level up
    expect(updated.bab).toBe(2);
    expect(updated.saves.fortitude).toBe(3);
    expect(updated).not.toBe(original);  // New object
  });
});
