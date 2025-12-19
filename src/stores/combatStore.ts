import { create } from 'zustand';
import type { CombatState } from '../types';
import type { Character } from '../types';
import type { Creature } from "../types/creature";
import type { Action } from '../types/action';
import { resolveCombatRound, handleRetreat } from '../utils/combat';
import { rollInitiative } from '../utils/initiative';

interface CombatStore {
  combat: CombatState | null;
  startCombat: (player: Character, enemy: Creature) => void;
  executeTurn: (playerAction: Action) => void;
  swapWeapon: (weaponId: string) => void;
  resetCombat: () => void;
  retreat: () => {
    player: Character;
    retreatFlag?: string;
    safeNodeId: string;
  } | null;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
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
        canRetreat: true, // Allow retreat by default (narrative can disable for boss fights)
        retreatPenalty: {
          goldLost: 20,
          damageOnFlee: 5,
          safeNodeId: 'home', // Default to home screen for test combats
        },
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

  swapWeapon: (weaponId: string) => {
    set((state) => {
      if (!state.combat) {
        console.warn('Cannot swap weapon: no active combat');
        return state;
      }

      const newWeapon = state.combat.playerCharacter.equipment.weapons.find(
        w => w.id === weaponId
      );

      if (!newWeapon) {
        console.error(`Weapon not found: ${weaponId}`);
        return state; // No-op if weapon doesn't exist
      }

      const updatedPlayer = {
        ...state.combat.playerCharacter,
        equipment: {
          ...state.combat.playerCharacter.equipment,
          weapon: newWeapon,
        },
      };

      // Note: AC recalculation not typically needed for weapon swaps
      // unless weapon properties affect AC (which they don't in our system)

      return {
        combat: {
          ...state.combat,
          playerCharacter: updatedPlayer,
          log: [
            ...state.combat.log,
            {
              turn: state.combat.turn,
              actor: 'system',
              message: `Switched to ${newWeapon.name}`,
            },
          ],
        },
      };
    });
  },

  resetCombat: () => set({ combat: null }),

  retreat: () => {
    const { combat } = get();
    if (!combat) return null;

    if (!combat.canRetreat) {
      console.warn('Retreat not allowed in this combat');
      return null;
    }

    const result = handleRetreat(combat);

    // Reset combat state
    set({ combat: null });

    if (!result) {
      return null;
    }

    // Remap result to match the interface
    return {
      player: result.playerCharacter,
      retreatFlag: result.retreatFlag,
      safeNodeId: result.safeNodeId,
    };
  },
}));
