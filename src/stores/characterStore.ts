import { create } from 'zustand';
import type { Character, CharacterClass } from '../types';
import type { Attributes } from '../types';
import type { SkillRanks } from '../types';
import type { FeatName } from '../types';
import type { NodeEffect } from '../types';
import { createCharacter } from '../utils/characterCreation';
import { CLASSES } from '../data/classes';
import { DEFAULT_AVATAR } from '../data/avatars';
import { getBackgroundByClass } from '../data/backgrounds';

export type CreationStep = 'class' | 'attributes' | 'skills' | 'feat' | 'name' | 'complete';

interface CharacterCreationData {
  name: string;
  avatarPath: string;
  class: CharacterClass | null;
  attributes: Attributes;
  skillRanks: SkillRanks;
  selectedFeat: FeatName | null;
}

interface CharacterStore {
  // Current character (after creation is complete)
  character: Character | null;

  // Creation flow state
  creationStep: CreationStep;
  creationData: CharacterCreationData;

  // Actions
  startCreation: () => void;
  setClass: (className: CharacterClass) => void;
  setAttributes: (attributes: Attributes) => void;
  setSkillRanks: (skills: SkillRanks) => void;
  setFeat: (feat: FeatName) => void;
  setName: (name: string) => void;
  setAvatarPath: (path: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  finalizeCharacter: () => void;
  resetCreation: () => void;
  setCharacter: (character: Character) => void; // For testing

  // NEW: Quick character creation (Phase 1)
  createQuickCharacter: (characterClass: CharacterClass) => void;

  // NEW: Process narrative effects that modify character
  processNarrativeEffects: (effects: NodeEffect[]) => void;

  // Save/Load
  saveCharacter: () => void;
  loadCharacter: () => void;
}

const defaultAttributes: Attributes = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10,
};

const defaultSkillRanks: SkillRanks = {
  Athletics: 0,
  Stealth: 0,
  Perception: 0,
  Arcana: 0,
  Medicine: 0,
  Intimidate: 0,
};

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: null,
  creationStep: 'class',
  creationData: {
    name: '',
    avatarPath: DEFAULT_AVATAR,
    class: null,
    attributes: defaultAttributes,
    skillRanks: defaultSkillRanks,
    selectedFeat: null,
  },

  startCreation: () => {
    set({
      creationStep: 'class',
      creationData: {
        name: '',
        avatarPath: DEFAULT_AVATAR,
        class: null,
        attributes: defaultAttributes,
        skillRanks: defaultSkillRanks,
        selectedFeat: null,
      },
    });
  },

  setClass: (className) => {
    const classDef = CLASSES[className];
    set((state) => ({
      creationData: {
        ...state.creationData,
        class: className,
        // Optionally pre-fill with recommended attributes
        attributes: classDef.recommendedAttributes,
      },
    }));
  },

  setAttributes: (attributes) => {
    set((state) => ({
      creationData: {
        ...state.creationData,
        attributes,
      },
    }));
  },

  setSkillRanks: (skills) => {
    set((state) => ({
      creationData: {
        ...state.creationData,
        skillRanks: skills,
      },
    }));
  },

  setFeat: (feat) => {
    set((state) => ({
      creationData: {
        ...state.creationData,
        selectedFeat: feat,
      },
    }));
  },

  setName: (name) => {
    set((state) => ({
      creationData: {
        ...state.creationData,
        name,
      },
    }));
  },

  setAvatarPath: (path) => {
    set((state) => ({
      creationData: {
        ...state.creationData,
        avatarPath: path,
      },
    }));
  },

  nextStep: () => {
    const { creationStep, creationData } = get();

    // Determine next step based on current step and class
    if (creationStep === 'class' && creationData.class) {
      set({ creationStep: 'attributes' });
    } else if (creationStep === 'attributes') {
      set({ creationStep: 'skills' });
    } else if (creationStep === 'skills') {
      // Fighter gets feat selection, others skip to name
      if (creationData.class === 'Fighter') {
        set({ creationStep: 'feat' });
      } else {
        set({ creationStep: 'name' });
      }
    } else if (creationStep === 'feat') {
      set({ creationStep: 'name' });
    } else if (creationStep === 'name') {
      // Move to complete (will be finalized by finalizeCharacter)
      set({ creationStep: 'complete' });
    }
  },

  previousStep: () => {
    const { creationStep, creationData } = get();

    if (creationStep === 'attributes') {
      set({ creationStep: 'class' });
    } else if (creationStep === 'skills') {
      set({ creationStep: 'attributes' });
    } else if (creationStep === 'feat') {
      set({ creationStep: 'skills' });
    } else if (creationStep === 'name') {
      // Go back to feat if Fighter, otherwise skills
      if (creationData.class === 'Fighter') {
        set({ creationStep: 'feat' });
      } else {
        set({ creationStep: 'skills' });
      }
    }
  },

  finalizeCharacter: () => {
    const { creationData } = get();

    if (!creationData.class) {
      throw new Error('Cannot finalize character without a class');
    }

    // Create the character using the utility
    const character = createCharacter({
      name: creationData.name || 'Adventurer',
      avatarPath: creationData.avatarPath,
      class: creationData.class,
      attributes: creationData.attributes,
      skillRanks: creationData.skillRanks,
      selectedFeat: creationData.selectedFeat || undefined,
    });

    set({
      character,
      creationStep: 'complete',
    });
  },

  resetCreation: () => {
    set({
      character: null,
      creationStep: 'class',
      creationData: {
        name: '',
        avatarPath: DEFAULT_AVATAR,
        class: null,
        attributes: defaultAttributes,
        skillRanks: defaultSkillRanks,
        selectedFeat: null,
      },
    });
  },

  setCharacter: (character) => {
    set({ character, creationStep: 'complete' });
  },

  createQuickCharacter: (characterClass) => {
    const background = getBackgroundByClass(characterClass);

    // Use background attribute bias as starting attributes, with defaults
    const attributes: Attributes = {
      STR: background.attributeBias?.STR || 10,
      DEX: background.attributeBias?.DEX || 10,
      CON: background.attributeBias?.CON || 10,
      INT: background.attributeBias?.INT || 10,
      WIS: background.attributeBias?.WIS || 10,
      CHA: background.attributeBias?.CHA || 10,
    };

    // Initialize skill ranks - tagged skills get 1 rank
    const skillRanks: SkillRanks = {
      Athletics: 0,
      Stealth: 0,
      Perception: 0,
      Arcana: 0,
      Medicine: 0,
      Intimidate: 0,
    };

    // Apply tagged skills if they exist
    if (background.taggedSkills) {
      background.taggedSkills.forEach((skill) => {
        if (skill in skillRanks) {
          skillRanks[skill as keyof SkillRanks] = 1;
        }
      });
    }

    // Create character using existing utility with default values
    const character = createCharacter({
      name: `${characterClass} Adventurer`,
      avatarPath: DEFAULT_AVATAR,
      class: characterClass,
      attributes,
      skillRanks,
      selectedFeat: undefined,
    });

    // Add background and quirk information
    const characterWithBackground: Character = {
      ...character,
      background,
      startingQuirk: background.startingQuirk,
    };

    set({
      character: characterWithBackground,
      creationStep: 'complete',
      creationData: {
        name: characterWithBackground.name,
        avatarPath: characterWithBackground.avatarPath,
        class: characterClass,
        attributes,
        skillRanks,
        selectedFeat: null,
      },
    });
  },

  processNarrativeEffects: (effects) => {
    const { character } = get();
    if (!character) return;

    const updatedCharacter = { ...character };

    for (const effect of effects) {
      switch (effect.type) {
        case 'giveGold':
          updatedCharacter.gold = (updatedCharacter.gold || 0) + effect.amount;
          break;

        case 'heal':
          if (effect.amount === 'full') {
            updatedCharacter.hp = updatedCharacter.maxHp;
          } else {
            const healAmount = effect.amount;
            updatedCharacter.hp = Math.min(
                updatedCharacter.hp + healAmount,
                updatedCharacter.maxHp
            );
          }
          break;

        case 'damage':
          updatedCharacter.hp = Math.max(0, updatedCharacter.hp - effect.amount);
          break;

          // Other effects handled by their respective systems
        default:
          break;
      }
    }

    set({ character: updatedCharacter });
  },

  saveCharacter: () => {
    const { character } = get();
    if (!character) {
      console.warn('No character to save');
      return;
    }

    try {
      localStorage.setItem('adventurer-rpg:character', JSON.stringify(character));
      console.log('Character saved successfully');
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  },

  loadCharacter: () => {
    try {
      const saved = localStorage.getItem('adventurer-rpg:character');
      if (saved) {
        const character = JSON.parse(saved) as Character;
        set({ character, creationStep: 'complete' });
        console.log('Character loaded successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load character:', error);
      return false;
    }
  }
}));
