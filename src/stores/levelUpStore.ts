import { create } from 'zustand';
import type { LevelUpResult } from '../types/levelProgression';
import type { Feat } from '../types/feat';
import { calculateLevelUp, applyLevelUp } from '../utils/levelUpLogic';
import { useCharacterStore } from './characterStore';
import { getFeatsByClass } from '../data/feats';
import { meetsPrerequisites } from '../utils/feats';

interface LevelUpStore {
  pendingLevelUp: LevelUpResult | null;
  levelUpInProgress: boolean;
  selectedFeat: string | null;
  availableFeats: Feat[];

  // Actions
  triggerLevelUp: (newLevel: number) => LevelUpResult | null;
  completeLevelUp: () => void;
  cancelLevelUp: () => void;
  loadAvailableFeats: () => void;
  selectFeat: (featId: string) => void;
}

export const useLevelUpStore = create<LevelUpStore>((set, get) => ({
  pendingLevelUp: null,
  levelUpInProgress: false,
  selectedFeat: null,
  availableFeats: [],

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
    const { pendingLevelUp, selectedFeat } = get();
    if (!pendingLevelUp) return;

    const characterStore = useCharacterStore.getState();
    const character = characterStore.character;
    if (!character) return;

    // Apply level-up bonuses
    let updated = applyLevelUp(character, pendingLevelUp);

    // Apply selected feat if one was chosen
    if (selectedFeat && pendingLevelUp.featGained) {
      const feat = get().availableFeats.find(f => f.id === selectedFeat);
      if (feat) {
        updated = {
          ...updated,
          feats: [...updated.feats, feat],
        };
      }
    }

    characterStore.setCharacter(updated);

    // Clear pending level-up
    set({
      pendingLevelUp: null,
      levelUpInProgress: false,
      selectedFeat: null,
      availableFeats: [],
    });
  },

  // Cancel level-up (shouldn't happen in story-driven system, but useful for testing)
  cancelLevelUp: () => {
    set({
      pendingLevelUp: null,
      levelUpInProgress: false,
      selectedFeat: null,
      availableFeats: [],
    });
  },

  // Load available feats for the character's class
  loadAvailableFeats: () => {
    const character = useCharacterStore.getState().character;
    if (!character) return;

    const classFeats = getFeatsByClass(character.class);
    const knownFeatIds = character.feats.map(f => f.id);

    const available = classFeats.filter(feat =>
      meetsPrerequisites(feat, character) &&
      !knownFeatIds.includes(feat.id)
    );

    set({ availableFeats: available });
  },

  // Select a feat during level-up
  selectFeat: (featId: string) => {
    set({ selectedFeat: featId });
  },
}));
