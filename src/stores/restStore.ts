import { create } from 'zustand';
import type { RestType, RestState } from '../types/rest';
import type { RecoveryResult } from '../utils/restLogic';
import { calculateRecovery } from '../utils/restLogic';
import { useCharacterStore } from './characterStore';
import { useNarrativeStore } from './narrativeStore';

interface RestStore extends RestState {
  // Actions
  initiateRest: (restType: RestType) => RecoveryResult | null;
  completeRest: (recovery: RecoveryResult) => void;
  canRestAtLocation: (nodeId: string) => boolean;
  resetRestTracking: () => void;
}

export const useRestStore = create<RestStore>((set, get) => ({
  // Initial state
  canRest: true,
  lastRestLocation: '',
  restsThisLocation: 0,
  maxRestsPerLocation: 0, // 0 = unlimited for now

  // Initiate rest - calculate recovery but don't apply yet
  initiateRest: (restType: RestType) => {
    const character = useCharacterStore.getState().character;
    if (!character) return null;

    const currentNode = useNarrativeStore.getState().world?.currentNodeId || '';

    // Update rest tracking
    const state = get();
    const isNewLocation = state.lastRestLocation !== currentNode;

    set({
      lastRestLocation: currentNode,
      restsThisLocation: isNewLocation ? 1 : state.restsThisLocation + 1,
    });

    return calculateRecovery(character, restType);
  },

  // Complete rest - apply recovery to character
  completeRest: (recovery: RecoveryResult) => {
    const characterStore = useCharacterStore.getState();
    const character = characterStore.character;
    if (!character) return;

    // Apply recovery
    characterStore.setCharacter({
      ...character,
      hp: recovery.newHp,
    });
  },

  // Check if rest is allowed at this location
  canRestAtLocation: (nodeId: string) => {
    const state = get();
    if (state.maxRestsPerLocation === 0) return true; // Unlimited

    const isNewLocation = state.lastRestLocation !== nodeId;
    if (isNewLocation) return true;

    return state.restsThisLocation < state.maxRestsPerLocation;
  },

  // Reset tracking (e.g., when starting new campaign)
  resetRestTracking: () => {
    set({
      canRest: true,
      lastRestLocation: '',
      restsThisLocation: 0,
    });
  },
}));
