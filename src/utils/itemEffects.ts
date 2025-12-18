import { DiceRoller } from '@dice-roller/rpg-dice-roller';
import type { Character, ItemEffect } from '../types';

const roller = new DiceRoller();

export function applyItemEffect(
  character: Character,
  effect: ItemEffect,
  inCombat: boolean
): { character: Character; logMessage: string } {
  try {
    let updatedCharacter = { ...character };
    let logMessage = '';

    switch (effect.type) {
      case 'heal':
        const healRoll = roller.roll(effect.amount);
        const healTotal = healRoll.total;
        const healAmount = Math.min(healTotal, character.maxHp - character.hp);
        updatedCharacter.hp = Math.min(character.hp + healTotal, character.maxHp);
        logMessage = `${effect.amount}: ${healRoll.output} = ${healAmount} HP restored`;
        break;

      case 'escape':
        logMessage = inCombat ? 'Escaped from combat!' : 'No effect outside combat';
        break;

      case 'remove-condition':
        // Phase 1.4 integration - for now just log it
        logMessage = `Removed ${effect.condition} condition`;
        break;

      case 'buff':
        // Phase 1.3+ buffs
        logMessage = `+${effect.bonus} ${effect.stat} for ${effect.duration} turns`;
        break;

      case 'damage':
        // Throwable items (future)
        logMessage = `Deals ${effect.amount} damage`;
        break;

      case 'spell':
        // Arcane scrolls (future)
        logMessage = `Casts ${effect.spellName}`;
        break;

      default:
        logMessage = 'Unknown effect';
    }

    return { character: updatedCharacter, logMessage };
  } catch (error) {
    console.error('Item effect failed:', error);
    return {
      character,
      logMessage: 'Item effect failed',
    };
  }
}
