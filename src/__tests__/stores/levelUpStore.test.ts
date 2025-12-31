import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLevelUpStore } from '../../stores/levelUpStore';
import { useCharacterStore } from '../../stores/characterStore';
import type { Character } from '../../types/character';

vi.mock('../../stores/characterStore', () => ({
  useCharacterStore: {
    getState: vi.fn(),
  },
}));

describe('LevelUpStore', () => {
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

  beforeEach(() => {
    useLevelUpStore.getState().cancelLevelUp();

    vi.mocked(useCharacterStore.getState).mockReturnValue({
      character: mockFighter,
      setCharacter: vi.fn(),
    } as Partial<ReturnType<typeof useCharacterStore.getState>> as ReturnType<typeof useCharacterStore.getState>);
  });

  it('should calculate level-up on triggerLevelUp', () => {
    const result = useLevelUpStore.getState().triggerLevelUp(2);

    expect(result).toBeDefined();
    expect(result?.newLevel).toBe(2);
    expect(result?.hpGained).toBe(8);
  });

  it('should set levelUpInProgress flag', () => {
    useLevelUpStore.getState().triggerLevelUp(2);

    expect(useLevelUpStore.getState().levelUpInProgress).toBe(true);
    expect(useLevelUpStore.getState().pendingLevelUp).toBeDefined();
  });

  it('should apply level-up on completeLevelUp', () => {
    useLevelUpStore.getState().triggerLevelUp(2);
    useLevelUpStore.getState().completeLevelUp();

    expect(useCharacterStore.getState().setCharacter).toHaveBeenCalled();
    expect(useLevelUpStore.getState().levelUpInProgress).toBe(false);
  });

  it('should clear pending level-up on cancelLevelUp', () => {
    useLevelUpStore.getState().triggerLevelUp(2);
    useLevelUpStore.getState().cancelLevelUp();

    expect(useLevelUpStore.getState().pendingLevelUp).toBeNull();
    expect(useLevelUpStore.getState().levelUpInProgress).toBe(false);
  });
});
