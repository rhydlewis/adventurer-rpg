import { describe, it, expect } from 'vitest';
import { calculateRecovery, applyRecovery } from '../../utils/restLogic';
import type { Character } from '../../types/character';

describe('calculateRecovery', () => {
  const mockCharacter = {
    name: 'Test Character',
    class: 'Fighter',
    level: 3,
    hp: 10,
    maxHp: 30,
  } as Character;

  it('should restore 50% HP on short rest', () => {
    const result = calculateRecovery(mockCharacter, 'short');

    expect(result.hpRestored).toBe(15); // 50% of 30
    expect(result.newHp).toBe(25); // 10 + 15
    expect(result.abilitiesRestored).toBe(false);
  });

  it('should restore 100% HP on long rest', () => {
    const result = calculateRecovery(mockCharacter, 'long');

    expect(result.hpRestored).toBe(20); // 100% of 30, but only 20 missing
    expect(result.newHp).toBe(30); // Full HP
    expect(result.abilitiesRestored).toBe(true);
  });

  it('should not exceed max HP', () => {
    const fullHealthChar = {
      ...mockCharacter,
      hp: 30,
    } as Character;
    const result = calculateRecovery(fullHealthChar, 'long');

    expect(result.newHp).toBe(30);
    expect(result.hpRestored).toBe(0);
  });

  it('should handle safe haven rest', () => {
    const result = calculateRecovery(mockCharacter, 'safe_haven');

    expect(result.hpRestored).toBe(20);
    expect(result.newHp).toBe(30);
    expect(result.abilitiesRestored).toBe(true);
  });
});

describe('applyRecovery', () => {
  it('should return new character object with updated HP', () => {
    const original = {
      name: 'Test',
      hp: 10,
      maxHp: 30,
    } as Character;

    const recovery = {
      hpRestored: 15,
      newHp: 25,
      abilitiesRestored: false,
    };

    const updated = applyRecovery(original, recovery);

    expect(updated.hp).toBe(25);
    expect(updated).not.toBe(original); // New object
    expect(updated.name).toBe(original.name); // Other fields preserved
  });
});
