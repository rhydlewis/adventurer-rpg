import { create } from 'zustand';
import type { LevelUpResult } from '../types/levelProgression';
import type { Feat } from '../types/feat';
import type { SkillRanks, SkillName } from '../types/skill';
import type { Spell } from '../types/spell';
import { calculateLevelUp, applyLevelUp } from '../utils/levelUpLogic';
import { useCharacterStore } from './characterStore';
import { getFeatsByClass } from '../data/feats';
import { meetsPrerequisites } from '../utils/feats';
import { calculateSpellsToLearn, addSpellsToCharacter } from '../utils/spellProgression';

interface LevelUpStore {
  pendingLevelUp: LevelUpResult | null;
  levelUpInProgress: boolean;
  selectedFeat: string | null;
  availableFeats: Feat[];
  skillPointsToAllocate: number;
  allocatedSkillPoints: Partial<SkillRanks>;
  availableSpells: Spell[];
  selectedSpells: string[];
  spellsToSelect: number;

  // Actions
  triggerLevelUp: (newLevel: number) => LevelUpResult | null;
  completeLevelUp: () => void;
  cancelLevelUp: () => void;
  loadAvailableFeats: () => void;
  selectFeat: (featId: string) => void;
  allocateSkillPoint: (skill: SkillName) => void;
  deallocateSkillPoint: (skill: SkillName) => void;
  loadAvailableSpells: () => void;
  selectSpell: (spellId: string) => void;
  deselectSpell: (spellId: string) => void;
}

export const useLevelUpStore = create<LevelUpStore>((set, get) => ({
  pendingLevelUp: null,
  levelUpInProgress: false,
  selectedFeat: null,
  availableFeats: [],
  skillPointsToAllocate: 0,
  allocatedSkillPoints: {},
  availableSpells: [],
  selectedSpells: [],
  spellsToSelect: 0,

  // Initiate level-up - calculate bonuses but don't apply yet
  triggerLevelUp: (newLevel: number) => {
    const character = useCharacterStore.getState().character;
    if (!character) return null;

    const result = calculateLevelUp(character, newLevel);
    if (!result) return null;

    set({
      pendingLevelUp: result,
      levelUpInProgress: true,
      skillPointsToAllocate: result.skillPoints,
      allocatedSkillPoints: {},
    });

    return result;
  },

  // Complete level-up - apply all changes to character
  completeLevelUp: () => {
    const { pendingLevelUp, selectedFeat, allocatedSkillPoints, selectedSpells, availableSpells } = get();
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

    // Apply allocated skill points
    if (Object.keys(allocatedSkillPoints).length > 0) {
      const newSkills = { ...updated.skills };
      for (const [skill, points] of Object.entries(allocatedSkillPoints)) {
        const skillName = skill as SkillName;
        newSkills[skillName] = (newSkills[skillName] || 0) + (points || 0);
      }
      updated = {
        ...updated,
        skills: newSkills,
      };
    }

    // Apply selected spells
    if (selectedSpells.length > 0) {
      const spellsToAdd = availableSpells.filter(s => selectedSpells.includes(s.id));
      updated = addSpellsToCharacter(updated, spellsToAdd);
    }

    characterStore.setCharacter(updated);

    // Clear pending level-up
    set({
      pendingLevelUp: null,
      levelUpInProgress: false,
      selectedFeat: null,
      availableFeats: [],
      skillPointsToAllocate: 0,
      allocatedSkillPoints: {},
      availableSpells: [],
      selectedSpells: [],
      spellsToSelect: 0,
    });
  },

  // Cancel level-up (shouldn't happen in story-driven system, but useful for testing)
  cancelLevelUp: () => {
    set({
      pendingLevelUp: null,
      levelUpInProgress: false,
      selectedFeat: null,
      availableFeats: [],
      skillPointsToAllocate: 0,
      allocatedSkillPoints: {},
      availableSpells: [],
      selectedSpells: [],
      spellsToSelect: 0,
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

  // Allocate a skill point during level-up
  allocateSkillPoint: (skill: SkillName) => {
    const { skillPointsToAllocate, allocatedSkillPoints } = get();

    // Calculate total points already allocated
    const totalAllocated = Object.values(allocatedSkillPoints).reduce((sum, points) => sum + (points || 0), 0);

    // Can't allocate more points than available
    if (totalAllocated >= skillPointsToAllocate) return;

    set({
      allocatedSkillPoints: {
        ...allocatedSkillPoints,
        [skill]: (allocatedSkillPoints[skill] || 0) + 1,
      },
    });
  },

  // Deallocate a skill point during level-up
  deallocateSkillPoint: (skill: SkillName) => {
    const { allocatedSkillPoints } = get();

    const currentPoints = allocatedSkillPoints[skill] || 0;
    if (currentPoints <= 0) return;

    const newAllocatedPoints = { ...allocatedSkillPoints };
    if (currentPoints === 1) {
      delete newAllocatedPoints[skill];
    } else {
      newAllocatedPoints[skill] = currentPoints - 1;
    }

    set({ allocatedSkillPoints: newAllocatedPoints });
  },

  // Load available spells for the character's class and level
  loadAvailableSpells: () => {
    const { pendingLevelUp } = get();
    if (!pendingLevelUp) return;

    const character = useCharacterStore.getState().character;
    if (!character) return;

    const spellLearning = calculateSpellsToLearn(character, pendingLevelUp.newLevel);
    if (!spellLearning) return;

    set({
      availableSpells: spellLearning.availableSpells,
      spellsToSelect: spellLearning.spellsToSelect,
    });
  },

  // Select a spell during level-up
  selectSpell: (spellId: string) => {
    const { selectedSpells, spellsToSelect } = get();

    // Can't select more spells than allowed
    if (selectedSpells.length >= spellsToSelect) return;

    // Don't select the same spell twice
    if (selectedSpells.includes(spellId)) return;

    set({
      selectedSpells: [...selectedSpells, spellId],
    });
  },

  // Deselect a spell during level-up
  deselectSpell: (spellId: string) => {
    const { selectedSpells } = get();

    set({
      selectedSpells: selectedSpells.filter(id => id !== spellId),
    });
  },
}));
