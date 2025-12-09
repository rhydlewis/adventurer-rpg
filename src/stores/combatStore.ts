import { create } from 'zustand';
import type { CombatState, Character, Creature } from '../types';
import { resolveCombatRound } from '../utils/combat';

interface CombatStore {
  combat: CombatState | null;
  startCombat: (player: Character, enemy: Creature) => void;
  executeTurn: () => void;
  resetCombat: () => void;
}

export const useCombatStore = create<CombatStore>((set) => ({
  combat: null,

  startCombat: (player, enemy) => {
    set({
      combat: {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: [],
        winner: null,
      },
    });
  },

  executeTurn: () => {
    set((state) => {
      if (!state.combat) return state;
      return {
        combat: resolveCombatRound(state.combat),
      };
    });
  },

  resetCombat: () => set({ combat: null }),
}));
