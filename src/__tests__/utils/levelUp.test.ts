import { describe, it, expect } from 'vitest';
import { applyLevelUp, calculateHPIncrease, calculateBABIncrease } from '../../utils/levelUp';
import type { Character } from '../../types/character';
import type { Feat } from '../../types/feat';

describe('Level-Up System', () => {
  const mockCharacter: Partial<Character> = {
    name: 'Test Fighter',
    class: 'Fighter',
    level: 1,
    maxHp: 12,
    hp: 10,
    bab: 1,
    feats: [],
    attributes: {
      STR: 16,
      DEX: 12,
      CON: 14,
      INT: 10,
      WIS: 10,
      CHA: 8,
    },
  };

  const mockFeat: Feat = {
    id: 'power-attack',
    name: 'Power Attack',
    description: 'Trade attack for damage',
    prerequisites: [],
    benefit: 'You can take a penalty on attack rolls to gain bonus damage',
  };

  it('should increase level from 1 to 2', () => {
    const result = applyLevelUp(mockCharacter as Character, 2, mockFeat);

    expect(result.level).toBe(2);
  });

  it('should increase HP by class hit die + CON modifier', () => {
    // Fighter HD = d10, CON 14 = +2 modifier
    // Level 1: 10 + 2 = 12 HP
    // Level 2: 12 + (d10/2 + 1) + 2 = 12 + 6 + 2 = 20 HP (average)
    const hpIncrease = calculateHPIncrease('Fighter', 14); // CON 14

    expect(hpIncrease).toBe(8); // Average d10 (5.5 → 6) + 2 CON
  });

  it('should increase BAB by class progression', () => {
    // Fighter BAB progression: +1 per level
    const babIncrease = calculateBABIncrease('Fighter', 1, 2);

    expect(babIncrease).toBe(1); // From +1 to +2
  });

  it('should add feat to character', () => {
    const result = applyLevelUp(mockCharacter as Character, 2, mockFeat);

    expect(result.feats).toContainEqual(mockFeat);
  });

  it('should increase maxHp and restore full HP on level-up', () => {
    const damagedCharacter = { ...mockCharacter, hp: 5, maxHp: 12 };
    const result = applyLevelUp(damagedCharacter as Character, 2, mockFeat);

    expect(result.maxHp).toBe(20); // 12 + 8
    expect(result.hp).toBe(20); // Fully healed
  });
});
