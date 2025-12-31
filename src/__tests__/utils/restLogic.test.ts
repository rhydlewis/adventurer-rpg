import { describe, it, expect } from 'vitest';
import { calculateRecovery, applyRecovery } from '../../utils/restLogic';
import type { Character } from '../../types/character';

describe('calculateRecovery', () => {
  const mockCharacter: Partial<Character> = {
    id: 'test',
    name: 'Test Character',
    class: 'Fighter',
    level: 3,
    hp: 10,
    maxHp: 30,
    mana: 4,
    maxMana: 12,
  };

  it('should restore 50% HP and mana on short rest', () => {
    const result = calculateRecovery(mockCharacter as Character, 'short');

    expect(result.hpRestored).toBe(15); // 50% of 30
    expect(result.newHp).toBe(25); // 10 + 15
    expect(result.manaRestored).toBe(6); // 50% of 12
    expect(result.newMana).toBe(10); // 4 + 6
    expect(result.abilitiesRestored).toBe(false);
  });

  it('should restore 100% HP and mana on long rest', () => {
    const result = calculateRecovery(mockCharacter as Character, 'long');

    expect(result.hpRestored).toBe(20); // 100% of 30, but only 20 missing
    expect(result.newHp).toBe(30); // Full HP
    expect(result.manaRestored).toBe(8); // 100% of 12, but only 8 missing
    expect(result.newMana).toBe(12); // Full mana
    expect(result.abilitiesRestored).toBe(true);
  });

  it('should not exceed max HP or mana', () => {
    const fullHealthChar: Partial<Character> = {
      ...mockCharacter,
      hp: 30,
      mana: 12,
    };
    const result = calculateRecovery(fullHealthChar as Character, 'long');

    expect(result.newHp).toBe(30);
    expect(result.newMana).toBe(12);
    expect(result.hpRestored).toBe(0);
    expect(result.manaRestored).toBe(0);
  });

  it('should handle characters with 0 max mana', () => {
    const noManaChar: Partial<Character> = {
      ...mockCharacter,
      mana: 0,
      maxMana: 0,
    };
    const result = calculateRecovery(noManaChar as Character, 'short');

    expect(result.manaRestored).toBe(0);
    expect(result.newMana).toBe(0);
  });

  it('should handle characters with undefined mana', () => {
    const noManaChar: Partial<Character> = {
      ...mockCharacter,
      mana: undefined,
      maxMana: undefined,
    };
    const result = calculateRecovery(noManaChar as Character, 'short');

    expect(result.manaRestored).toBe(0);
    expect(result.newMana).toBe(0);
  });
});

describe('applyRecovery', () => {
  it('should return new character object with updated HP and mana', () => {
    const original: Partial<Character> = {
      id: 'test',
      name: 'Test',
      hp: 10,
      mana: 4,
      maxHp: 30,
      maxMana: 12,
    };

    const recovery = {
      hpRestored: 15,
      manaRestored: 6,
      newHp: 25,
      newMana: 10,
      abilitiesRestored: false,
    };

    const updated = applyRecovery(original as Character, recovery);

    expect(updated.hp).toBe(25);
    expect(updated.mana).toBe(10);
    expect(updated).not.toBe(original); // New object
    expect(updated.name).toBe(original.name); // Other fields preserved
  });
});
