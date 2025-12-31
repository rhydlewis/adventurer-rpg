import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLevelUpStore } from '../../stores/levelUpStore';
import { useCharacterStore } from '../../stores/characterStore';
import type { Character } from '../../types/character';
import type { Feat } from '../../types/feat';

vi.mock('../../stores/characterStore', () => ({
  useCharacterStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../data/feats', () => ({
  getFeatsByClass: vi.fn(() => [
    {
      id: 'power_attack',
      name: 'Power Attack',
      category: 'offensive',
      type: 'attack_variant',
      prerequisites: { attributes: { STR: 13 }, classRestrictions: ['Fighter'] },
      effects: { attackModifier: -2, damageModifier: 4, duration: 'turn' },
    } as Feat,
    {
      id: 'weapon_focus',
      name: 'Weapon Focus',
      category: 'offensive',
      type: 'passive',
      prerequisites: {},
      effects: { attackModifier: 1, duration: 'permanent' },
    } as Feat,
  ]),
}));

vi.mock('../../utils/feats', () => ({
  meetsPrerequisites: vi.fn(() => true),
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

  describe('Feat Selection', () => {
    it('should load available feats for character class', () => {
      useLevelUpStore.getState().loadAvailableFeats();

      const available = useLevelUpStore.getState().availableFeats;
      expect(available.length).toBe(2);
      expect(available.some(f => f.id === 'power_attack')).toBe(true);
      expect(available.some(f => f.id === 'weapon_focus')).toBe(true);
    });

    it('should select a feat', () => {
      useLevelUpStore.getState().loadAvailableFeats();
      useLevelUpStore.getState().selectFeat('power_attack');

      expect(useLevelUpStore.getState().selectedFeat).toBe('power_attack');
    });

    it('should apply selected feat on completeLevelUp', () => {
      useLevelUpStore.getState().triggerLevelUp(2);
      useLevelUpStore.getState().loadAvailableFeats();
      useLevelUpStore.getState().selectFeat('power_attack');
      useLevelUpStore.getState().completeLevelUp();

      const setCharacterCall = vi.mocked(useCharacterStore.getState().setCharacter);
      expect(setCharacterCall).toHaveBeenCalled();

      const updatedCharacter = setCharacterCall.mock.calls[0][0];
      expect(updatedCharacter.feats.length).toBe(1);
      expect(updatedCharacter.feats[0].id).toBe('power_attack');
    });

    it('should not apply feat if none selected', () => {
      useLevelUpStore.getState().triggerLevelUp(2);
      useLevelUpStore.getState().completeLevelUp();

      const setCharacterCall = vi.mocked(useCharacterStore.getState().setCharacter);
      const updatedCharacter = setCharacterCall.mock.calls[0][0];
      expect(updatedCharacter.feats.length).toBe(0); // No feat added
    });

    it('should clear feat selection after completing level-up', () => {
      useLevelUpStore.getState().triggerLevelUp(2);
      useLevelUpStore.getState().loadAvailableFeats();
      useLevelUpStore.getState().selectFeat('power_attack');
      useLevelUpStore.getState().completeLevelUp();

      expect(useLevelUpStore.getState().selectedFeat).toBeNull();
      expect(useLevelUpStore.getState().availableFeats).toEqual([]);
    });
  });
});
