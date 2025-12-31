import type { Character } from '../types/character';
import type { RestType, RestRecovery } from '../types/rest';
import { REST_RECOVERY } from '../types/rest';

export interface RecoveryResult {
  hpRestored: number;
  newHp: number;
  abilitiesRestored: boolean;
  // TODO: Add spell slot recovery when needed
  // spellSlotsRestored?: { level1: number, ... }
}

/**
 * Calculate resource recovery from a rest.
 * Pure function - returns new values without mutation.
 *
 * NOTE: Currently only handles HP recovery.
 * TODO: Add spell slot recovery for Wizard/Cleric classes
 */
export function calculateRecovery(
  character: Character,
  restType: RestType
): RecoveryResult {
  const recovery: RestRecovery = REST_RECOVERY[restType];

  const maxHp = character.maxHp;
  const currentHp = character.hp;

  // Calculate HP recovery
  const hpToRestore = Math.floor(maxHp * (recovery.hpPercent / 100));
  const newHp = Math.min(currentHp + hpToRestore, maxHp);
  const hpRestored = newHp - currentHp;

  return {
    hpRestored,
    newHp,
    abilitiesRestored: recovery.restoreLimitedAbilities,
  };
}

/**
 * Apply recovery result to character.
 * Returns new character object (immutable).
 *
 * NOTE: Currently only applies HP recovery.
 * TODO: Restore spell slots and limited-use abilities
 */
export function applyRecovery(
  character: Character,
  recovery: RecoveryResult
): Character {
  return {
    ...character,
    hp: recovery.newHp,
  };
}
