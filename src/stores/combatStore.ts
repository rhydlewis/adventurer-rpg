import { create } from 'zustand';
import type { CombatState, Character, Creature } from '../types';
import type { Action } from '../types/action';
import { resolveCombatRound } from '../utils/combat';
import { rollInitiative } from '../utils/initiative';

interface CombatStore {
  combat: CombatState | null;
  startCombat: (player: Character, enemy: Creature) => void;
  executeTurn: (playerAction: Action) => void;
  resetCombat: () => void;
}

export const useCombatStore = create<CombatStore>((set) => ({
  combat: null,

  startCombat: (player, enemy) => {
    // Roll initiative for both combatants
    const playerInitiativeTotal = rollInitiative(player);
    const enemyInitiativeTotal = rollInitiative(enemy);

    // Determine turn order (highest goes first, re-roll if tied)
    let order: ('player' | 'enemy')[];
    if (playerInitiativeTotal > enemyInitiativeTotal) {
      order = ['player', 'enemy'];
    } else if (enemyInitiativeTotal > playerInitiativeTotal) {
      order = ['enemy', 'player'];
    } else {
      // Tie - re-roll until we get a winner (simplified: just favor player for now)
      order = ['player', 'enemy'];
    }

    const initiative = {
      player: {
        actor: 'player' as const,
        roll: playerInitiativeTotal, // Note: this is total, not natural roll
        bonus: 0, // Would need to track separately if we want to show breakdown
        total: playerInitiativeTotal,
      },
      enemy: {
        actor: 'enemy' as const,
        roll: enemyInitiativeTotal,
        bonus: 0,
        total: enemyInitiativeTotal,
      },
      order,
    };

    const initiativeLog = [
      {
        turn: 0,
        actor: 'system' as const,
        message: `Initiative: ${player.name} (${playerInitiativeTotal}) vs ${enemy.name} (${enemyInitiativeTotal})`,
      },
      {
        turn: 0,
        actor: 'system' as const,
        message: `${order[0] === 'player' ? player.name : enemy.name} goes first!`,
      },
    ];

    set({
      combat: {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: initiativeLog,
        winner: null,
        initiative,
        currentActor: order[0],
      },
    });
  },

  executeTurn: (playerAction) => {
    set((state) => {
      if (!state.combat) return state;
      // Phase 1.3: Pass player action to combat resolution
      return {
        combat: resolveCombatRound(state.combat, playerAction),
      };
    });
  },

  resetCombat: () => set({ combat: null }),
}));
