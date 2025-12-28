import type { Character, CombatState, CombatLogEntry } from '../types';
import { QUIRK_INFO } from '../data/quirkInfo';

export interface QuirkResult {
  log: CombatLogEntry[];
  acBonus?: number;
  playerHidden?: boolean;
  playerExtraAction?: boolean;
  playerHp?: number;
  quirkTriggered?: boolean;
  autoBlockActive?: boolean; // First attack auto-misses
  autoHealActive?: boolean; // First hit taken heals to full HP
}

/**
 * Apply starting quirk effect to combat
 * Triggers on specific combat events (combat start, turn 1, first attack)
 */
export function applyStartingQuirk(
  character: Character,
  combat: CombatState,
  trigger: 'combat-start' | 'turn-1' | 'first-attack'
): QuirkResult {
  // Only trigger once per combat
  if ((combat as CombatState & { quirkTriggered?: boolean }).quirkTriggered) {
    return { log: [] };
  }

  const quirk = character.startingQuirk;
  if (!quirk) {
    return { log: [] };
  }

  switch (quirk) {
    case 'auto-block-first-attack':
      if (trigger === 'first-attack' && combat.turn === 1) {
        return {
          log: [{
            turn: combat.turn,
            actor: 'system',
            message: QUIRK_INFO[quirk].combatMessage,
          }],
          autoBlockActive: true,
          quirkTriggered: true,
        };
      }
      break;

    case 'start-hidden':
      if (trigger === 'combat-start') {
        return {
          log: [{
            turn: 1,
            actor: 'system',
            message: QUIRK_INFO[quirk].combatMessage,
          }],
          playerHidden: true,
          quirkTriggered: true,
        };
      }
      break;

    case 'arcane-shield-turn-1':
      if (trigger === 'turn-1') {
        return {
          log: [{
            turn: combat.turn,
            actor: 'system',
            message: QUIRK_INFO[quirk].combatMessage,
          }],
          acBonus: 4,
          quirkTriggered: true,
        };
      }
      break;

    case 'auto-heal-first-hit':
      if (trigger === 'combat-start') {
        return {
          log: [{
            turn: 1,
            actor: 'system',
            message: QUIRK_INFO[quirk].combatMessage,
          }],
          autoHealActive: true,
          quirkTriggered: true,
        };
      }
      break;
  }

  return { log: [] };
}
