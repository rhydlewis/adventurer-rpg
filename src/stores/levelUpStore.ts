import { create } from 'zustand';
import type { LevelUpResult } from '../types/levelProgression';
import { calculateLevelUp, applyLevelUp } from '../utils/levelUpLogic';
import { useCharacterStore } from './characterStore';

interface LevelUpStore {
  pendingLevelUp: LevelUpResult | null;
  levelUpInProgress: boolean;

  // Actions
  triggerLevelUp: (newLevel: number) => LevelUpResult | null;
  completeLevelUp: () => void;
  cancelLevelUp: () => void;
}

export const useLevelUpStore = create<LevelUpStore>((set, get) => ({
  pendingLevelUp: null,
  levelUpInProgress: false,

  // Initiate level-up - calculate bonuses but don't apply yet
  triggerLevelUp: (newLevel: number) => {
    const character = useCharacterStore.getState().character;
    if (!character) return null;

    const result = calculateLevelUp(character, newLevel);
    if (!result) return null;

    set({
      pendingLevelUp: result,
      levelUpInProgress: true,
    });

    return result;
  },

  // Complete level-up - apply all changes to character
  completeLevelUp: () => {
    const { pendingLevelUp } = get();
    if (!pendingLevelUp) return;

    const characterStore = useCharacterStore.getState();
    const character = characterStore.character;
    if (!character) return;

    // Apply level-up bonuses
    const updated = applyLevelUp(character, pendingLevelUp);
    characterStore.setCharacter(updated);

    // Clear pending level-up
    set({
      pendingLevelUp: null,
      levelUpInProgress: false,
    });
  },

  // Cancel level-up (shouldn't happen in story-driven system, but useful for testing)
  cancelLevelUp: () => {
    set({
      pendingLevelUp: null,
      levelUpInProgress: false,
    });
  },
}));
