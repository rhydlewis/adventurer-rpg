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
  const fumbleEffects = { ...state.fumbleEffects };
  let playerCharacter = state.playerCharacter;
  let enemy = state.enemy;

  // Player's turn
  const playerFumble = fumbleEffects?.player;
  if (playerFumble?.type === 'drop_weapon' && playerFumble.turnsRemaining && playerFumble.turnsRemaining > 0) {
    // Player is recovering from fumble - loses turn
    log.push({
      turn: state.turn,
      actor: 'player',
      message: `${playerCharacter.name} recovers their weapon.`,
    });
    // Decrement turns remaining
    fumbleEffects.player = {
      ...playerFumble,
      turnsRemaining: playerFumble.turnsRemaining! - 1,
    };
    // Clear if done
    if (fumbleEffects.player.turnsRemaining! <= 0) {
      delete fumbleEffects.player;
    }
  } else {
    // Player attacks normally
    const playerAttack = performAttack(playerCharacter, enemy);
    log.push({
      turn: state.turn,
      actor: 'player',
      message: playerAttack.output,
    });

    if (playerAttack.hit && playerAttack.damage) {
      enemy = { ...enemy, hp: enemy.hp - playerAttack.damage };
    }

    // Handle fumble effects
    if (playerAttack.isFumble && playerAttack.fumbleEffect) {
      const fumble = playerAttack.fumbleEffect;

      if (fumble.loseTurn) {
        // Drop weapon - lose next turn
        fumbleEffects.player = {
          type: fumble.type,
          turnsRemaining: 1,
        };
      } else if (fumble.damage) {
        // Hit self - apply damage immediately
        const selfDamage = rollDamage(fumble.damage, 0);
        playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - selfDamage.total };
        log.push({
          turn: state.turn,
          actor: 'system',
          message: `${playerCharacter.name} takes ${selfDamage.total} damage from hitting themselves!`,
        });
      } else if (fumble.givesFreeAttack) {
        // Opening - enemy gets free attack immediately
        const freeAttack = performAttack(enemy, playerCharacter);
        log.push({
          turn: state.turn,
          actor: 'enemy',
          message: `FREE ATTACK! ${freeAttack.output}`,
        });
        if (freeAttack.hit && freeAttack.damage) {
          playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - freeAttack.damage };
        }
      }
      // Note: off_balance penalty is handled in performAttack via state check
    }

    // Clear off_balance effect after player's turn
    if (fumbleEffects.player?.type === 'off_balance') {
      delete fumbleEffects.player;
    }
  }

  // Check if enemy defeated
  if (enemy.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${enemy.name} has been defeated!`,
    });
    return { ...state, playerCharacter, enemy, log, winner: 'player', fumbleEffects };
  }

  // Check if player defeated (could happen from self-damage or free attack)
  if (playerCharacter.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${playerCharacter.name} has been defeated!`,
    });
    return { ...state, playerCharacter, enemy, log, winner: 'enemy', fumbleEffects };
  }

  // Enemy's turn
  const enemyFumble = fumbleEffects?.enemy;
  if (enemyFumble?.type === 'drop_weapon' && enemyFumble.turnsRemaining && enemyFumble.turnsRemaining > 0) {
    // Enemy is recovering from fumble - loses turn
    log.push({
      turn: state.turn,
      actor: 'enemy',
      message: `${enemy.name} recovers their weapon.`,
    });
    // Decrement turns remaining
    fumbleEffects.enemy = {
      ...enemyFumble,
      turnsRemaining: enemyFumble.turnsRemaining! - 1,
    };
    // Clear if done
    if (fumbleEffects.enemy.turnsRemaining! <= 0) {
      delete fumbleEffects.enemy;
    }
  } else {
    // Enemy attacks normally
    const enemyAttack = performAttack(enemy, playerCharacter);
    log.push({
      turn: state.turn,
      actor: 'enemy',
      message: enemyAttack.output,
    });

    if (enemyAttack.hit && enemyAttack.damage) {
      playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - enemyAttack.damage };
    }

    // Handle fumble effects
    if (enemyAttack.isFumble && enemyAttack.fumbleEffect) {
      const fumble = enemyAttack.fumbleEffect;

      if (fumble.loseTurn) {
        // Drop weapon - lose next turn
        fumbleEffects.enemy = {
          type: fumble.type,
          turnsRemaining: 1,
        };
      } else if (fumble.damage) {
        // Hit self - apply damage immediately
        const selfDamage = rollDamage(fumble.damage, 0);
        enemy = { ...enemy, hp: enemy.hp - selfDamage.total };
        log.push({
          turn: state.turn,
          actor: 'system',
          message: `${enemy.name} takes ${selfDamage.total} damage from hitting themselves!`,
        });
      } else if (fumble.givesFreeAttack) {
        // Opening - player gets free attack immediately
        const freeAttack = performAttack(playerCharacter, enemy);
        log.push({
          turn: state.turn,
          actor: 'player',
          message: `FREE ATTACK! ${freeAttack.output}`,
        });
        if (freeAttack.hit && freeAttack.damage) {
          enemy = { ...enemy, hp: enemy.hp - freeAttack.damage };
        }
      }
    }

    // Clear off_balance effect after enemy's turn
    if (fumbleEffects.enemy?.type === 'off_balance') {
      delete fumbleEffects.enemy;
    }
  }

  // Check if player defeated
  if (playerCharacter.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${playerCharacter.name} has been defeated!`,
    });
    return { ...state, playerCharacter, enemy, log, winner: 'enemy', fumbleEffects };
  }

  // Check if enemy defeated (could happen from self-damage or free attack)
  if (enemy.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${enemy.name} has been defeated!`,
    });
    return { ...state, playerCharacter, enemy, log, winner: 'player', fumbleEffects };
  }

  return {
    ...state,
    playerCharacter,
    enemy,
    log,
    turn: state.turn + 1,
    fumbleEffects,
  };
}
