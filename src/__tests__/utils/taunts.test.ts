import { describe, it, expect, vi } from 'vitest';
import { selectTaunt, isLowHealth } from '../../utils/taunts';
import type { Creature } from '../../types/creature';

describe('Taunt System', () => {
  const mockEnemy: Partial<Creature> = {
    name: 'Goblin',
    hp: 10,
    maxHp: 20,
    taunts: {
      onCombatStart: ["Let's fight!", "You'll pay!"],
      onPlayerMiss: ['Too slow!', 'Hah!'],
      onEnemyHit: ['Take that!'],
      onLowHealth: ["I'm done..."],
    },
  };

  it('should randomly select a taunt from available pool', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // First taunt (0 * 2 = 0)

    const taunt = selectTaunt(mockEnemy as Creature, 'onCombatStart');

    expect(taunt).toBe("Let's fight!");
  });

  it('should select second taunt when random returns 0.5', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // Second taunt (0.5 * 2 = 1)

    const taunt = selectTaunt(mockEnemy as Creature, 'onCombatStart');

    expect(taunt).toBe("You'll pay!");
  });

  it('should return undefined if no taunts defined', () => {
    const noTaunts = { ...mockEnemy, taunts: undefined };

    const taunt = selectTaunt(noTaunts as Creature, 'onCombatStart');

    expect(taunt).toBeUndefined();
  });

  it('should return undefined if trigger has no taunts', () => {
    const emptyTrigger: Partial<Creature> = {
      ...mockEnemy,
      taunts: {
        onCombatStart: [],
      },
    };

    const taunt = selectTaunt(emptyTrigger as Creature, 'onCombatStart');

    expect(taunt).toBeUndefined();
  });

  it('should select onPlayerMiss taunt', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // First taunt

    const taunt = selectTaunt(mockEnemy as Creature, 'onPlayerMiss');

    expect(taunt).toBe('Too slow!');
  });

  it('should select onEnemyHit taunt', () => {
    const taunt = selectTaunt(mockEnemy as Creature, 'onEnemyHit');

    expect(taunt).toBe('Take that!');
  });

  it('should select onLowHealth taunt', () => {
    const taunt = selectTaunt(mockEnemy as Creature, 'onLowHealth');

    expect(taunt).toBe("I'm done...");
  });

  describe('isLowHealth', () => {
    it('should return false when above 25% health', () => {
      const healthyEnemy = { ...mockEnemy, hp: 10, maxHp: 20 };
      expect(isLowHealth(healthyEnemy as Creature)).toBe(false); // 10/20 = 50%
    });

    it('should return true when at exactly 25% health', () => {
      const lowHpEnemy = { ...mockEnemy, hp: 5, maxHp: 20 };
      expect(isLowHealth(lowHpEnemy as Creature)).toBe(true); // 5/20 = 25%
    });

    it('should return true when below 25% health', () => {
      const veryLowHpEnemy = { ...mockEnemy, hp: 2, maxHp: 20 };
      expect(isLowHealth(veryLowHpEnemy as Creature)).toBe(true); // 2/20 = 10%
    });

    it('should return true when at 1 hp', () => {
      const nearDeathEnemy = { ...mockEnemy, hp: 1, maxHp: 20 };
      expect(isLowHealth(nearDeathEnemy as Creature)).toBe(true);
    });

    it('should return false when dead (0 hp)', () => {
      const deadEnemy = { ...mockEnemy, hp: 0, maxHp: 20 };
      expect(isLowHealth(deadEnemy as Creature)).toBe(false); // Must be > 0
    });

    it('should handle different max HP values correctly', () => {
      const enemy100hp = { ...mockEnemy, hp: 25, maxHp: 100 };
      expect(isLowHealth(enemy100hp as Creature)).toBe(true); // 25/100 = 25%

      const enemy100hpSafe = { ...mockEnemy, hp: 26, maxHp: 100 };
      expect(isLowHealth(enemy100hpSafe as Creature)).toBe(false); // 26/100 = 26%
    });
  });
});
