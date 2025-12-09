import { rollAttack, rollDamage, calculateModifier } from './dice';
import type { Character, Creature, CombatState } from '../types';

export function performAttack(
  attacker: Character | Creature,
  defender: Character | Creature
): {
  hit: boolean;
  attackRoll: number;
  attackTotal: number;
  damage?: number;
  output: string;
} {
  const abilityMod = calculateModifier(attacker.attributes.STR);
  const attack = rollAttack(attacker.bab, abilityMod);

  const hit = attack.total >= defender.ac;

  if (hit) {
    // For walking skeleton, assume 1d8 weapon
    const dmg = rollDamage('1d8', abilityMod);

    return {
      hit: true,
      attackRoll: attack.d20Result,
      attackTotal: attack.total,
      damage: dmg.total,
      output: `${attack.output} vs AC ${defender.ac} - HIT! ${dmg.output} damage`,
    };
  }

  return {
    hit: false,
    attackRoll: attack.d20Result,
    attackTotal: attack.total,
    output: `${attack.output} vs AC ${defender.ac} - MISS!`,
  };
}

export function resolveCombatRound(state: CombatState): CombatState {
  const log = [...state.log];

  // Player attacks
  const playerAttack = performAttack(state.playerCharacter, state.enemy);
  log.push({
    turn: state.turn,
    actor: 'player',
    message: playerAttack.output,
  });

  if (playerAttack.hit && playerAttack.damage) {
    state.enemy.hp -= playerAttack.damage;
  }

  // Check if enemy defeated
  if (state.enemy.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${state.enemy.name} has been defeated!`,
    });
    return { ...state, log, winner: 'player' };
  }

  // Enemy attacks back
  const enemyAttack = performAttack(state.enemy, state.playerCharacter);
  log.push({
    turn: state.turn,
    actor: 'enemy',
    message: enemyAttack.output,
  });

  if (enemyAttack.hit && enemyAttack.damage) {
    state.playerCharacter.hp -= enemyAttack.damage;
  }

  // Check if player defeated
  if (state.playerCharacter.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${state.playerCharacter.name} has been defeated!`,
    });
    return { ...state, log, winner: 'enemy' };
  }

  return {
    ...state,
    log,
    turn: state.turn + 1,
  };
}
