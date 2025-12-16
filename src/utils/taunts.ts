import type { Creature } from '../types/creature';

export type TauntTrigger = 'onCombatStart' | 'onPlayerMiss' | 'onEnemyHit' | 'onLowHealth';

/**
 * Select a random taunt from enemy's taunt pool for given trigger
 * Returns undefined if no taunts available for this trigger
 */
export function selectTaunt(
  enemy: Creature,
  trigger: TauntTrigger
): string | undefined {
  if (!enemy.taunts) return undefined;

  const tauntsForTrigger = enemy.taunts[trigger];
  if (!tauntsForTrigger || tauntsForTrigger.length === 0) {
    return undefined;
  }

  // Randomly select one taunt from the array
  const randomIndex = Math.floor(Math.random() * tauntsForTrigger.length);
  return tauntsForTrigger[randomIndex];
}

/**
 * Check if enemy is at low health (25% or below)
 */
export function isLowHealth(enemy: Creature): boolean {
  const threshold = Math.floor(enemy.maxHp * 0.25);
  return enemy.hp <= threshold && enemy.hp > 0;
}
