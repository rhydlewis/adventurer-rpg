import type { Character } from '../types/character';
import type { RestType, RestRecovery } from '../types/rest';
import { REST_RECOVERY } from '../types/rest';

export interface RecoveryResult {
  hpRestored: number;
  manaRestored: number;
  newHp: number;
  newMana: number;
  abilitiesRestored: boolean;
}

/**
 * Calculate resource recovery from a rest.
 * Pure function - returns new values without mutation.
 */
export function calculateRecovery(
  character: Character,
  restType: RestType
): RecoveryResult {
  const recovery: RestRecovery = REST_RECOVERY[restType];

  const maxHp = character.maxHp;
  const maxMana = character.maxMana || 0;
  const currentHp = character.hp;
  const currentMana = character.mana || 0;

  // Calculate HP recovery
  const hpToRestore = Math.floor(maxHp * (recovery.hpPercent / 100));
  const newHp = Math.min(currentHp + hpToRestore, maxHp);
  const hpRestored = newHp - currentHp;

  // Calculate Mana recovery
  const manaToRestore = Math.floor(maxMana * (recovery.manaPercent / 100));
  const newMana = Math.min(currentMana + manaToRestore, maxMana);
  const manaRestored = newMana - currentMana;

  return {
    hpRestored,
    manaRestored,
    newHp,
    newMana,
    abilitiesRestored: recovery.restoreLimitedAbilities,
  };
}

/**
 * Apply recovery result to character.
 * Returns new character object (immutable).
 */
export function applyRecovery(
  character: Character,
  recovery: RecoveryResult
): Character {
  return {
    ...character,
    hp: recovery.newHp,
    mana: recovery.newMana,
    // TODO: Restore limited-use abilities when ability system exists
  };
}
