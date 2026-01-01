import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  triggerLevelUp,
  isLevelUpInProgress,
  getPendingLevelUp,
  completeLevelUp,
  cancelLevelUp,
  autoLevelUp,
} from '../../utils/levelUpTrigger';
import { useLevelUpStore } from '../../stores/levelUpStore';
import { useCharacterStore } from '../../stores/characterStore';
import type { Character } from '../../types/character';

vi.mock('../../stores/characterStore', () => ({
  useCharacterStore: {
    getState: vi.fn(),
  },
}));

describe('Level-Up Trigger Utilities', () => {
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
    } as Partial<ReturnType<typeof useCharacterStore.getState>> as ReturnType<
      typeof useCharacterStore.getState
    >);
  });

  describe('triggerLevelUp', () => {
    it('should successfully trigger level-up from 1 to 2', () => {
      const success = triggerLevelUp(2);
      expect(success).toBe(true);
      expect(isLevelUpInProgress()).toBe(true);

      const pending = getPendingLevelUp();
      expect(pending).toBeDefined();
      expect(pending?.newLevel).toBe(2);
    });

    it('should not allow leveling to same level', () => {
      const success = triggerLevelUp(1);
      expect(success).toBe(false);
      expect(isLevelUpInProgress()).toBe(false);
    });

    it('should not allow leveling backwards', () => {
      const level2Fighter = { ...mockFighter, level: 2 };
      vi.mocked(useCharacterStore.getState).mockReturnValue({
        character: level2Fighter,
        setCharacter: vi.fn(),
      } as Partial<ReturnType<typeof useCharacterStore.getState>> as ReturnType<
        typeof useCharacterStore.getState
      >);

      const success = triggerLevelUp(1);
      expect(success).toBe(false);
    });

    it('should not allow leveling above 5', () => {
      const success = triggerLevelUp(6);
      expect(success).toBe(false);
    });

    it('should fail if no character is loaded', () => {
      vi.mocked(useCharacterStore.getState).mockReturnValue({
        character: null,
        setCharacter: vi.fn(),
      } as Partial<ReturnType<typeof useCharacterStore.getState>> as ReturnType<
        typeof useCharacterStore.getState
      >);

      const success = triggerLevelUp(2);
      expect(success).toBe(false);
    });
  });

  describe('isLevelUpInProgress', () => {
    it('should return false initially', () => {
      expect(isLevelUpInProgress()).toBe(false);
    });

    it('should return true after triggering level-up', () => {
      triggerLevelUp(2);
      expect(isLevelUpInProgress()).toBe(true);
    });

    it('should return false after completing level-up', () => {
      triggerLevelUp(2);
      completeLevelUp();
      expect(isLevelUpInProgress()).toBe(false);
    });

    it('should return false after canceling level-up', () => {
      triggerLevelUp(2);
      cancelLevelUp();
      expect(isLevelUpInProgress()).toBe(false);
    });
  });

  describe('getPendingLevelUp', () => {
    it('should return null initially', () => {
      expect(getPendingLevelUp()).toBeNull();
    });

    it('should return level-up result after triggering', () => {
      triggerLevelUp(2);
      const pending = getPendingLevelUp();

      expect(pending).toBeDefined();
      expect(pending?.oldLevel).toBe(1);
      expect(pending?.newLevel).toBe(2);
      expect(pending?.hpGained).toBe(8); // Fighter HD
    });

    it('should return null after completing level-up', () => {
      triggerLevelUp(2);
      completeLevelUp();
      expect(getPendingLevelUp()).toBeNull();
    });
  });

  describe('completeLevelUp', () => {
    it('should apply level-up changes to character', () => {
      triggerLevelUp(2);
      completeLevelUp();

      const setCharacterCall = vi.mocked(useCharacterStore.getState().setCharacter);
      expect(setCharacterCall).toHaveBeenCalled();

      const updatedCharacter = setCharacterCall.mock.calls[0][0];
      expect(updatedCharacter.level).toBe(2);
      expect(updatedCharacter.maxHp).toBe(22); // 14 + 8
    });

    it('should not fail if no feat is selected when feat is gained', () => {
      triggerLevelUp(2); // Fighter gains feat at level 2
      // Don't select a feat
      expect(() => completeLevelUp()).not.toThrow();
    });

    it('should not fail if not all skill points are allocated', () => {
      triggerLevelUp(2); // Gains 2 skill points
      // Only allocate 1 point
      useLevelUpStore.getState().allocateSkillPoint('Athletics');
      expect(() => completeLevelUp()).not.toThrow();
    });
  });

  describe('cancelLevelUp', () => {
    it('should clear level-up state', () => {
      triggerLevelUp(2);
      expect(isLevelUpInProgress()).toBe(true);

      cancelLevelUp();
      expect(isLevelUpInProgress()).toBe(false);
      expect(getPendingLevelUp()).toBeNull();
    });

    it('should not affect character if canceled', () => {
      const setCharacterSpy = vi.mocked(useCharacterStore.getState().setCharacter);
      setCharacterSpy.mockClear();

      triggerLevelUp(2);
      cancelLevelUp();

      expect(setCharacterSpy).not.toHaveBeenCalled();
    });
  });

  describe('autoLevelUp', () => {
    it('should automatically complete a level-up with default choices', () => {
      const success = autoLevelUp(2);
      expect(success).toBe(true);

      const setCharacterCall = vi.mocked(useCharacterStore.getState().setCharacter);
      expect(setCharacterCall).toHaveBeenCalled();

      const updatedCharacter = setCharacterCall.mock.calls[0][0];
      expect(updatedCharacter.level).toBe(2);
    });

    it('should auto-select first available feat if feat is gained', () => {
      autoLevelUp(2); // Fighter gains feat at level 2

      const setCharacterCall = vi.mocked(useCharacterStore.getState().setCharacter);
      const updatedCharacter = setCharacterCall.mock.calls[0][0];

      // Should have selected a feat
      expect(updatedCharacter.feats.length).toBeGreaterThan(0);
    });

    it('should auto-allocate skill points evenly', () => {
      autoLevelUp(2); // Gains 2 skill points

      const setCharacterCall = vi.mocked(useCharacterStore.getState().setCharacter);
      const updatedCharacter = setCharacterCall.mock.calls[0][0];

      // Should have allocated skill points
      const totalSkillPoints = Object.values(updatedCharacter.skills).reduce(
        (sum, val) => sum + val,
        0
      );
      expect(totalSkillPoints).toBeGreaterThanOrEqual(2);
    });

    it('should fail if trigger fails', () => {
      vi.mocked(useCharacterStore.getState).mockReturnValue({
        character: null,
        setCharacter: vi.fn(),
      } as Partial<ReturnType<typeof useCharacterStore.getState>> as ReturnType<
        typeof useCharacterStore.getState
      >);

      const success = autoLevelUp(2);
      expect(success).toBe(false);
    });
  });

  describe('Integration with level-up store', () => {
    it('should work with feat selection', () => {
      triggerLevelUp(2);
      useLevelUpStore.getState().loadAvailableFeats();

      const { availableFeats } = useLevelUpStore.getState();
      expect(availableFeats.length).toBeGreaterThan(0);

      useLevelUpStore.getState().selectFeat(availableFeats[0].id);
      completeLevelUp();

      const setCharacterCall = vi.mocked(useCharacterStore.getState().setCharacter);
      const updatedCharacter = setCharacterCall.mock.calls[0][0];
      expect(updatedCharacter.feats.length).toBe(1);
    });

    it('should work with skill allocation', () => {
      triggerLevelUp(2);
      useLevelUpStore.getState().allocateSkillPoint('Athletics');
      useLevelUpStore.getState().allocateSkillPoint('Intimidate');
      completeLevelUp();

      const setCharacterCall = vi.mocked(useCharacterStore.getState().setCharacter);
      const updatedCharacter = setCharacterCall.mock.calls[0][0];
      expect(updatedCharacter.skills.Athletics).toBe(1);
      expect(updatedCharacter.skills.Intimidate).toBe(1);
    });
  });
});
