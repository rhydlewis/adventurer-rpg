import { rollAttack, rollDamage, calculateModifier } from './dice';
import type { Character, Creature, CombatState } from '../types';
import type { Action } from '../types/action';
import { isCriticalHit, isCriticalFumble, calculateCriticalDamage, rollFumbleEffect } from './criticals';
import {
  useSecondWind,
  canUseAbility,
  consumeAbilityUse,
  useDodge,
  canSneakAttack,
  calculateSneakAttackDamage,
} from './classAbilities';

export function performAttack(
  attacker: Character | Creature,
  defender: Character | Creature,
  modifiers?: { attackBonus?: number; damageBonus?: number; label?: string }
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
  const attackBonus = (modifiers?.attackBonus ?? 0);
  const damageBonus = (modifiers?.damageBonus ?? 0);
  const attack = rollAttack(attacker.bab, abilityMod + attackBonus);
  const naturalRoll = attack.d20Result;

  // Check for critical hit (natural 20)
  if (isCriticalHit(naturalRoll)) {
    // Crits always hit
    const baseDamage = '1d8'; // For walking skeleton, assume 1d8 weapon
    const totalMod = abilityMod + damageBonus;
    const baseDamageWithMod = totalMod >= 0 ? `${baseDamage}+${totalMod}` : `${baseDamage}${totalMod}`;
    const critResult = calculateCriticalDamage(baseDamageWithMod);
    const dmg = rollDamage(critResult.formula, 0); // Modifier already in formula

    const label = modifiers?.label ? ` (${modifiers.label})` : '';
    return {
      hit: true,
      attackRoll: naturalRoll,
      attackTotal: attack.total,
      damage: dmg.total,
      isCrit: true,
      output: `${attack.output} vs AC ${defender.ac}${label} - ${critResult.description} ${dmg.output} damage`,
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

  const label = modifiers?.label ? ` (${modifiers.label})` : '';

  if (hit) {
    // For walking skeleton, assume 1d8 weapon
    const dmg = rollDamage('1d8', abilityMod + damageBonus);

    return {
      hit: true,
      attackRoll: naturalRoll,
      attackTotal: attack.total,
      damage: dmg.total,
      output: `${attack.output} vs AC ${defender.ac}${label} - HIT! ${dmg.output} damage`,
    };
  }

  return {
    hit: false,
    attackRoll: naturalRoll,
    attackTotal: attack.total,
    output: `${attack.output} vs AC ${defender.ac}${label} - MISS!`,
  };
}

export function resolveCombatRound(state: CombatState, playerAction: Action): CombatState {
  const log = [...state.log];
  const fumbleEffects = { ...state.fumbleEffects };
  const dodgeActive = state.dodgeActive ? { ...state.dodgeActive } : {};
  let playerCharacter = state.playerCharacter;
  let enemy = state.enemy;

  // Clear player's Dodge at start of their turn (it lasted until their next turn)
  if (dodgeActive.player) {
    dodgeActive.player = false;
  }

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
    // Player action - Phase 1.3: Handle different action types
    if (playerAction.type === 'use_ability') {
      // Handle class abilities
      const abilityId = playerAction.abilityId;

      if (abilityId === 'Second Wind') {
        const check = canUseAbility(playerCharacter, 'Second Wind');
        if (!check.canUse) {
          log.push({
            turn: state.turn,
            actor: 'system',
            message: `Cannot use Second Wind: ${check.reason}`,
          });
        } else {
          const result = useSecondWind(playerCharacter);
          playerCharacter = {
            ...playerCharacter,
            hp: result.newHp,
          };
          playerCharacter = consumeAbilityUse(playerCharacter, 'Second Wind');
          log.push({
            turn: state.turn,
            actor: 'player',
            message: result.output,
          });
        }
      } else if (abilityId === 'Dodge') {
        // Rogue Dodge ability
        const check = canUseAbility(playerCharacter, 'Dodge');
        if (!check.canUse) {
          log.push({
            turn: state.turn,
            actor: 'system',
            message: `Cannot use Dodge: ${check.reason}`,
          });
        } else {
          const result = useDodge();
          playerCharacter = consumeAbilityUse(playerCharacter, 'Dodge');
          // Activate dodge (will be cleared at start of next turn)
          dodgeActive.player = true;
          log.push({
            turn: state.turn,
            actor: 'player',
            message: result.output,
          });
        }
      }
      // TODO: Add Wizard, Cleric abilities in next task
    } else {
      // Attack action (normal or Power Attack)
      let attackModifiers: { attackBonus?: number; damageBonus?: number; label?: string } | undefined;

      if (playerAction.type === 'attack' && playerAction.variant === 'power_attack') {
        attackModifiers = {
          attackBonus: playerAction.attackModifier ?? -2,
          damageBonus: playerAction.damageModifier ?? 4,
          label: 'Power Attack',
        };
      }

      const playerAttack = performAttack(playerCharacter, enemy, attackModifiers);

      // Check for Rogue Sneak Attack
      let sneakAttackDamage = 0;
      if (
        playerCharacter.class === 'Rogue' &&
        playerAttack.hit &&
        state.initiative &&
        canSneakAttack(
          state.initiative.player.total,
          state.initiative.enemy.total,
          false // TODO: Check enemy conditions in Phase 1.4
        )
      ) {
        const sneak = calculateSneakAttackDamage();
        sneakAttackDamage = sneak.bonus;
        log.push({
          turn: state.turn,
          actor: 'player',
          message: `${playerAttack.output} + ${sneak.description}`,
        });
      } else {
        log.push({
          turn: state.turn,
          actor: 'player',
          message: playerAttack.output,
        });
      }

      if (playerAttack.hit && playerAttack.damage) {
        const totalDamage = playerAttack.damage + sneakAttackDamage;
        enemy = { ...enemy, hp: enemy.hp - totalDamage };
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
    } // End attack action

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
    return { ...state, playerCharacter, enemy, log, winner: 'player', fumbleEffects, dodgeActive };
  }

  // Check if player defeated (could happen from self-damage or free attack)
  if (playerCharacter.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${playerCharacter.name} has been defeated!`,
    });
    return { ...state, playerCharacter, enemy, log, winner: 'enemy', fumbleEffects, dodgeActive };
  }

  // Clear enemy's Dodge at start of their turn
  if (dodgeActive.enemy) {
    dodgeActive.enemy = false;
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
    return { ...state, playerCharacter, enemy, log, winner: 'enemy', fumbleEffects, dodgeActive };
  }

  // Check if enemy defeated (could happen from self-damage or free attack)
  if (enemy.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${enemy.name} has been defeated!`,
    });
    return { ...state, playerCharacter, enemy, log, winner: 'player', fumbleEffects, dodgeActive };
  }

  return {
    ...state,
    playerCharacter,
    enemy,
    log,
    turn: state.turn + 1,
    fumbleEffects,
    dodgeActive,
  };
}
