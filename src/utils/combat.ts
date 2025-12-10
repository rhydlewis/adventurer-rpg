import { rollAttack, rollDamage, calculateModifier } from './dice';
import type { Character, Creature, CombatState } from '../types';
import { isCriticalHit, isCriticalFumble, calculateCriticalDamage, rollFumbleEffect } from './criticals';

export function performAttack(
  attacker: Character | Creature,
  defender: Character | Creature
): {
  hit: boolean;
  attackRoll: number;
  attackTotal: number;
  damage?: number;
  output: string;
  isCrit?: boolean;
  isFumble?: boolean;
  fumbleEffect?: ReturnType<typeof rollFumbleEffect>;
} {
  const abilityMod = calculateModifier(attacker.attributes.STR);
  const attack = rollAttack(attacker.bab, abilityMod);
  const naturalRoll = attack.d20Result;

  // Check for critical hit (natural 20)
  if (isCriticalHit(naturalRoll)) {
    // Crits always hit
    const baseDamage = '1d8'; // For walking skeleton, assume 1d8 weapon
    const baseDamageWithMod = abilityMod >= 0 ? `${baseDamage}+${abilityMod}` : `${baseDamage}${abilityMod}`;
    const critResult = calculateCriticalDamage(baseDamageWithMod);
    const dmg = rollDamage(critResult.formula, 0); // Modifier already in formula

    return {
      hit: true,
      attackRoll: naturalRoll,
      attackTotal: attack.total,
      damage: dmg.total,
      isCrit: true,
      output: `${attack.output} vs AC ${defender.ac} - ${critResult.description} ${dmg.output} damage`,
    };
  }

  // Check for critical fumble (natural 1)
  if (isCriticalFumble(naturalRoll)) {
    // Fumbles always miss
    const fumble = rollFumbleEffect();
    return {
      hit: false,
      attackRoll: naturalRoll,
      attackTotal: attack.total,
      isFumble: true,
      fumbleEffect: fumble,
      output: `${attack.output} vs AC ${defender.ac} - FUMBLE! ${fumble.description}`,
    };
  }

  // Normal hit/miss
  const hit = attack.total >= defender.ac;

  if (hit) {
    // For walking skeleton, assume 1d8 weapon
    const dmg = rollDamage('1d8', abilityMod);

    return {
      hit: true,
      attackRoll: naturalRoll,
      attackTotal: attack.total,
      damage: dmg.total,
      output: `${attack.output} vs AC ${defender.ac} - HIT! ${dmg.output} damage`,
    };
  }

  return {
    hit: false,
    attackRoll: naturalRoll,
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
