import type { Character, CombatState, CombatLogEntry } from '../types';

export interface QuirkResult {
  log: CombatLogEntry[];
  acBonus?: number;
  playerHidden?: boolean;
  playerExtraAction?: boolean;
  playerHp?: number;
  quirkTriggered?: boolean;
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
            message: "Your guard training kicks in—you deflect the blow!",
          }],
          acBonus: 2,
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
            message: "You blend into the shadows...",
          }],
          playerHidden: true,
          quirkTriggered: true,
        };
      }
      break;

    case 'bonus-cantrip-turn-1':
      if (trigger === 'turn-1') {
        return {
          log: [{
            turn: combat.turn,
            actor: 'system',
            message: "Arcane energy surges through you!",
          }],
          playerExtraAction: true,
          quirkTriggered: true,
        };
      }
      break;

    case 'healing-aura':
      if (trigger === 'turn-1') {
        const healAmount = Math.min(1, character.maxHp - character.hp);
        return {
          log: [{
            turn: combat.turn,
            actor: 'system',
            message: `Your faith sustains you (+${healAmount} HP)`,
          }],
          playerHp: Math.min(character.hp + 1, character.maxHp),
          quirkTriggered: true,
        };
      }
      break;
  }

  return { log: [] };
}
