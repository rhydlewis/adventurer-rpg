import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCharacterStore } from '../../stores/characterStore';
import { createCharacter } from '../../utils/characterCreation';
import { CLASSES } from '../../data/classes';
import type { Attributes, Character } from '../../types';

// Mock the createCharacter utility to isolate store logic
vi.mock('../../utils/characterCreation', () => ({
  createCharacter: vi.fn(),
}));

const defaultAttributes: Attributes = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10,
};

const defaultSkillRanks = {
  Athletics: 0,
  Stealth: 0,
  Perception: 0,
  Arcana: 0,
  Medicine: 0,
  Intimidate: 0,
};

describe('stores/characterStore', () => {
  // Reset store to its initial state before each test
  beforeEach(() => {
    useCharacterStore.getState().resetCreation();
    vi.clearAllMocks();
  });

  it('should have the correct initial state', () => {
    const { character, creationStep, creationData } = useCharacterStore.getState();

    expect(character).toBeNull();
    expect(creationStep).toBe('class');
    expect(creationData.name).toBe('');
    expect(creationData.class).toBeNull();
    expect(creationData.attributes).toEqual(defaultAttributes);
    expect(creationData.skillRanks).toEqual(defaultSkillRanks);
    expect(creationData.selectedFeat).toBeNull();
  });

  it('startCreation should reset the state to the beginning of creation', () => {
    // Modify state first
    useCharacterStore.getState().setClass('Fighter');
    useCharacterStore.getState().setName('Grog');
    useCharacterStore.getState().nextStep();

    // Reset
    useCharacterStore.getState().startCreation();

    const { creationStep, creationData, character } = useCharacterStore.getState();
    expect(creationStep).toBe('class');
    expect(creationData.class).toBeNull();
    expect(creationData.name).toBe('');
    expect(creationData.attributes).toEqual(defaultAttributes);
    expect(character).toBeNull();
  });

  it('setClass should update the class and pre-fill recommended attributes', () => {
    useCharacterStore.getState().setClass('Wizard');
    const { creationData } = useCharacterStore.getState();

    expect(creationData.class).toBe('Wizard');
    expect(creationData.attributes).toEqual(CLASSES.Wizard.recommendedAttributes);
  });

  it('setAttributes should update attributes', () => {
    const newAttributes: Attributes = { STR: 18, DEX: 14, CON: 16, INT: 8, WIS: 10, CHA: 8 };
    useCharacterStore.getState().setAttributes(newAttributes);
    expect(useCharacterStore.getState().creationData.attributes).toEqual(newAttributes);
  });
  
  it('setSkillRanks should update skills', () => {
    const newSkills = { Athletics: 4, Stealth: 2, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 };
    useCharacterStore.getState().setSkillRanks(newSkills);
    expect(useCharacterStore.getState().creationData.skillRanks).toEqual(newSkills);
  });

  it('setFeat should update the selected feat', () => {
    useCharacterStore.getState().setFeat('Power Attack');
    expect(useCharacterStore.getState().creationData.selectedFeat).toBe('Power Attack');
  });

  it('setName should update the character name', () => {
    useCharacterStore.getState().setName('Test Name');
    expect(useCharacterStore.getState().creationData.name).toBe('Test Name');
  });

  describe('nextStep', () => {
    it('should move from class to attributes', () => {
      useCharacterStore.getState().setClass('Fighter');
      useCharacterStore.getState().nextStep();
      expect(useCharacterStore.getState().creationStep).toBe('attributes');
    });

    it('should move from attributes to skills', () => {
      useCharacterStore.setState({ creationStep: 'attributes' });
      useCharacterStore.getState().nextStep();
      expect(useCharacterStore.getState().creationStep).toBe('skills');
    });

    it('should move from skills to feat for Fighter', () => {
      useCharacterStore.getState().setClass('Fighter');
      useCharacterStore.setState({ creationStep: 'skills' });
      useCharacterStore.getState().nextStep();
      expect(useCharacterStore.getState().creationStep).toBe('feat');
    });

    it('should move from skills to name for non-Fighter', () => {
      useCharacterStore.getState().setClass('Rogue');
      useCharacterStore.setState({ creationStep: 'skills' });
      useCharacterStore.getState().nextStep();
      expect(useCharacterStore.getState().creationStep).toBe('name');
    });

    it('should move from feat to name', () => {
      useCharacterStore.setState({ creationStep: 'feat' });
      useCharacterStore.getState().nextStep();
      expect(useCharacterStore.getState().creationStep).toBe('name');
    });
  });

  describe('previousStep', () => {
    it('should move from name back to feat for Fighter', () => {
      useCharacterStore.getState().setClass('Fighter');
      useCharacterStore.setState({ creationStep: 'name' });
      useCharacterStore.getState().previousStep();
      expect(useCharacterStore.getState().creationStep).toBe('feat');
    });

    it('should move from name back to skills for non-Fighter', () => {
      useCharacterStore.getState().setClass('Wizard');
      useCharacterStore.setState({ creationStep: 'name' });
      useCharacterStore.getState().previousStep();
      expect(useCharacterStore.getState().creationStep).toBe('skills');
    });

    it('should move from skills back to attributes', () => {
      useCharacterStore.setState({ creationStep: 'skills' });
      useCharacterStore.getState().previousStep();
      expect(useCharacterStore.getState().creationStep).toBe('attributes');
    });

    it('should move from attributes back to class', () => {
      useCharacterStore.setState({ creationStep: 'attributes' });
      useCharacterStore.getState().previousStep();
      expect(useCharacterStore.getState().creationStep).toBe('class');
    });
  });

  describe('finalizeCharacter', () => {
    it('should call createCharacter with the correct data and update the store', () => {
      const mockCharacter = { name: 'Finalized Hero', class: 'Fighter' } as Partial<Character> as Character;
      vi.mocked(createCharacter).mockReturnValue(mockCharacter);

      // Set up the store with all the data needed for creation
      useCharacterStore.getState().setClass('Fighter');
      useCharacterStore.getState().setName('Finalized Hero');
      useCharacterStore.getState().setFeat('Toughness');
      const creationData = useCharacterStore.getState().creationData;
      
      // Finalize
      useCharacterStore.getState().finalizeCharacter();

      // Check that the utility was called correctly
      expect(createCharacter).toHaveBeenCalledWith({
        name: creationData.name,
        avatarPath: creationData.avatarPath,
        class: creationData.class,
        attributes: creationData.attributes,
        skillRanks: creationData.skillRanks,
        selectedFeat: creationData.selectedFeat,
      });

      const state = useCharacterStore.getState();
      expect(state.character).toEqual(mockCharacter);
      expect(state.creationStep).toBe('complete');
    });

    it('should throw an error if class is not set', () => {
      expect(() => useCharacterStore.getState().finalizeCharacter()).toThrow(
        'Cannot finalize character without a class'
      );
    });
  });
});
