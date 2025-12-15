import { create } from 'zustand';
import type { Character, CharacterClass } from '../types/character';
import type { Attributes } from '../types/attributes';
import type { SkillRanks } from '../types/skill';
import type { FeatName } from '../types/feat';
import { createCharacter } from '../utils/characterCreation';
import { CLASSES } from '../data/classes';
import { DEFAULT_AVATAR } from '../data/avatars';

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
}));
