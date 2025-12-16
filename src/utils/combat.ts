import { rollAttack, rollDamage, calculateModifier } from './dice';
import type { CombatState } from '../types';
import type { Character } from '../types';
import type { Creature } from "../types/creature";
import type { Action, CastSpellAction } from '../types/action';
import type { Condition } from '../types';
import { isCriticalHit, isCriticalFumble, calculateCriticalDamage, rollFumbleEffect } from './criticals';
import {
  activateSecondWind,
  activateChannelEnergy,
  canUseAbility,
  consumeAbilityUse,
  activateDodge,
  canSneakAttack,
  calculateSneakAttackDamage,
} from './classAbilities';
import { castSpell } from './spellcasting';
import { WIZARD_CANTRIPS, CLERIC_CANTRIPS } from '../data/spells';
import { calculateConditionModifiers, decrementConditions, applyConditionDamage, applyCondition } from './conditions';
import { rollLoot, formatLootMessage } from './loot';
import { selectTaunt, isLowHealth } from './taunts';

export function performAttack(
  attacker: Character | Creature,
  defender: Character | Creature,
  attackerConditions: Condition[] = [],
  defenderConditions: Condition[] = [],
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
  taunt?: string;
} {
  // Calculate condition modifiers for both combatants
  const attackerMods = calculateConditionModifiers(attackerConditions);
  const defenderMods = calculateConditionModifiers(defenderConditions);

  // Check if attacker is prevented from acting (e.g., Stunned)
  if (attackerMods.preventActions) {
    return {
      hit: false,
      attackRoll: 0,
      attackTotal: 0,
      output: `${attacker.name} is Stunned - cannot attack!`,
    };
  }

  const abilityMod = calculateModifier(attacker.attributes.STR);
  // Apply attack bonuses from both explicit modifiers AND conditions
  const totalAttackBonus = (modifiers?.attackBonus ?? 0) + (attackerMods.attackBonus ?? 0);
  const totalDamageBonus = (modifiers?.damageBonus ?? 0) + (attackerMods.damageBonus ?? 0);
  const attack = rollAttack(attacker.bab, abilityMod + totalAttackBonus);
  const naturalRoll = attack.d20Result;

  // CRITICAL FIX: Calculate effective AC with condition bonuses (Dodge, Shielded, etc.)
  const effectiveDefenderAC = defender.ac + (defenderMods.acBonus ?? 0);

  // Check for critical hit (natural 20)
  if (isCriticalHit(naturalRoll)) {
    // Crits always hit
    const baseDamage = '1d8'; // For walking skeleton, assume 1d8 weapon
    const totalMod = abilityMod + totalDamageBonus;
    const baseDamageWithMod = totalMod >= 0 ? `${baseDamage}+${totalMod}` : `${baseDamage}${totalMod}`;
    const critResult = calculateCriticalDamage(baseDamageWithMod);
    const dmg = rollDamage(critResult.formula, 0); // Modifier already in formula

    const label = modifiers?.label ? ` (${modifiers.label})` : '';

    // Determine taunt: if attacker is a Creature and hit, use onEnemyHit taunt
    const taunt = 'taunts' in attacker ? selectTaunt(attacker, 'onEnemyHit') : undefined;

    return {
      hit: true,
      attackRoll: naturalRoll,
      attackTotal: attack.total,
      damage: dmg.total,
      isCrit: true,
      output: `${attack.output} vs AC ${effectiveDefenderAC}${label} - ${critResult.description} ${dmg.output} damage`,
      taunt,
    };
  }

  // Check for critical fumble (natural 1)
  if (isCriticalFumble(naturalRoll)) {
    // Fumbles always miss
    const fumble = rollFumbleEffect();

    // Determine taunt: if defender is a Creature and attacker missed, use onPlayerMiss taunt
    const taunt = 'taunts' in defender ? selectTaunt(defender, 'onPlayerMiss') : undefined;

    return {
      hit: false,
      attackRoll: naturalRoll,
      attackTotal: attack.total,
      isFumble: true,
      fumbleEffect: fumble,
      output: `${attack.output} vs AC ${effectiveDefenderAC} - FUMBLE! ${fumble.description}`,
      taunt,
    };
  }

  // Normal hit/miss - CRITICAL FIX: Use effectiveDefenderAC (includes Dodge, Shielded, etc.)
  const hit = attack.total >= effectiveDefenderAC;

  const label = modifiers?.label ? ` (${modifiers.label})` : '';

  if (hit) {
    // For walking skeleton, assume 1d8 weapon
    const dmg = rollDamage('1d8', abilityMod + totalDamageBonus);

    // Determine taunt: if attacker is a Creature and hit, use onEnemyHit taunt
    const taunt = 'taunts' in attacker ? selectTaunt(attacker, 'onEnemyHit') : undefined;

    return {
      hit: true,
      attackRoll: naturalRoll,
      attackTotal: attack.total,
      damage: dmg.total,
      output: `${attack.output} vs AC ${effectiveDefenderAC}${label} - HIT! ${dmg.output} damage`,
      taunt,
    };
  }

  // Determine taunt: if defender is a Creature and attacker missed, use onPlayerMiss taunt
  const taunt = 'taunts' in defender ? selectTaunt(defender, 'onPlayerMiss') : undefined;

  return {
    hit: false,
    attackRoll: naturalRoll,
    attackTotal: attack.total,
    output: `${attack.output} vs AC ${effectiveDefenderAC}${label} - MISS!`,
    taunt,
  };
}

export function resolveCombatRound(state: CombatState, playerAction: Action): CombatState {
  const log = [...state.log];
  const fumbleEffects = { ...state.fumbleEffects };
  const dodgeActive = state.dodgeActive ? { ...state.dodgeActive } : {};
  const activeBuffs = state.activeBuffs ? { ...state.activeBuffs, player: [...(state.activeBuffs.player || [])], enemy: [...(state.activeBuffs.enemy || [])] } : { player: [], enemy: [] };

  // Phase 1.4: Initialize conditions from state
  let playerConditions = state.activeConditions?.player || [];
  let enemyConditions = state.activeConditions?.enemy || [];

  let playerCharacter = state.playerCharacter;
  let enemy = state.enemy;

  // Combat start taunt (only on turn 1)
  if (state.turn === 1) {
    const startTaunt = selectTaunt(enemy, 'onCombatStart');
    if (startTaunt) {
      log.push({
        turn: state.turn,
        actor: 'enemy',
        message: '', // Empty message, taunt carries the content
        taunt: startTaunt,
      });
    }
  }

  // Clear player's Dodge at start of their turn (it lasted until their next turn)
  if (dodgeActive.player) {
    dodgeActive.player = false;
  }

  // Clear player's buffs at start of their turn (they lasted until next turn)
  if (activeBuffs.player && activeBuffs.player.length > 0) {
    activeBuffs.player = [];
  }

  // Phase 1.4: Decrement player conditions at START of their turn (before DoT)
  const playerConditionResult = decrementConditions(playerConditions);
  playerConditions = playerConditionResult.remaining;
  playerConditionResult.expired.forEach((condition) => {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${condition.type} expired on ${playerCharacter.name}`,
    });
  });

  // Phase 1.4: Apply damage-over-time from conditions at start of player's turn
  const playerDoT = applyConditionDamage(playerConditions);
  if (playerDoT.totalDamage > 0) {
    playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - playerDoT.totalDamage };
    playerDoT.damageBreakdown.forEach((dmg) => {
      log.push({
        turn: state.turn,
        actor: 'system',
        message: `${dmg.condition}: ${dmg.formula} = ${dmg.amount} ${dmg.type} damage`,
      });
    });
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
          const result = activateSecondWind(playerCharacter);
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
          const result = activateDodge();
          playerCharacter = consumeAbilityUse(playerCharacter, 'Dodge');
          // Phase 1.4: Apply Dodge as a condition (unified system)
          playerConditions = applyCondition(playerConditions, result.conditionType, state.turn, 1);
          log.push({
            turn: state.turn,
            actor: 'player',
            message: result.output,
          });
        }
      } else if (abilityId === 'Channel Energy') {
        // Cleric Channel Energy ability
        const check = canUseAbility(playerCharacter, 'Channel Energy');
        if (!check.canUse) {
          log.push({
            turn: state.turn,
            actor: 'system',
            message: `Cannot use Channel Energy: ${check.reason}`,
          });
        } else {
          const result = activateChannelEnergy(playerCharacter);
          playerCharacter = {
            ...playerCharacter,
            hp: result.newHp,
          };
          playerCharacter = consumeAbilityUse(playerCharacter, 'Channel Energy');
          log.push({
            turn: state.turn,
            actor: 'player',
            message: result.output,
          });
        }
      }
    } else if (playerAction.type === 'cast_spell') {
      // Cast spell action (Wizard/Cleric cantrips)
      const spellAction = playerAction as CastSpellAction;

      // Find the spell
      const allCantrips = [...WIZARD_CANTRIPS, ...CLERIC_CANTRIPS];
      const spell = allCantrips.find((s) => s.id === spellAction.spellId);

      if (!spell) {
        log.push({
          turn: state.turn,
          actor: 'system',
          message: `Spell not found: ${spellAction.spellId}`,
        });
      } else {
        // Cast the spell
        const result = castSpell(playerCharacter, enemy, spell);

        // Apply damage if successful
        if (result.success && result.damage) {
          enemy = {
            ...enemy,
            hp: enemy.hp - result.damage,
          };
        }

        // Log the spell casting
        log.push({
          turn: state.turn,
          actor: 'player',
          message: result.output,
        });

        // Phase 1.4: Apply buff spells as conditions
        if (result.success && spell.effect.type === 'buff') {
          // Map spell names to condition types
          const conditionTypeMap: Record<string, import('../types/condition').ConditionType> = {
            'Divine Favor': 'Divine Favor',
            'Resistance': 'Resistance',
          };

          const conditionType = conditionTypeMap[spell.name];
          if (conditionType) {
            playerConditions = applyCondition(playerConditions, conditionType, state.turn, 1);
          }
        }

        // TODO: Apply conditions (Daze -> Stunned) in Phase 1.4
      }
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

      const playerAttack = performAttack(playerCharacter, enemy, playerConditions, enemyConditions, attackModifiers);

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
          taunt: playerAttack.taunt,
        });
      } else {
        log.push({
          turn: state.turn,
          actor: 'player',
          message: playerAttack.output,
          taunt: playerAttack.taunt,
        });
      }

      if (playerAttack.hit && playerAttack.damage) {
        const totalDamage = playerAttack.damage + sneakAttackDamage;
        enemy = { ...enemy, hp: enemy.hp - totalDamage };

        // Check for low health taunt after damage
        if (isLowHealth(enemy)) {
          const lowHealthTaunt = selectTaunt(enemy, 'onLowHealth');
          if (lowHealthTaunt) {
            log.push({
              turn: state.turn,
              actor: 'enemy',
              message: '',
              taunt: lowHealthTaunt,
            });
          }
        }
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
        const freeAttack = performAttack(enemy, playerCharacter, enemyConditions, playerConditions);
        log.push({
          turn: state.turn,
          actor: 'enemy',
          message: `FREE ATTACK! ${freeAttack.output}`,
          taunt: freeAttack.taunt,
        });
        if (freeAttack.hit && freeAttack.damage) {
          playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - freeAttack.damage };
        }
      }

      // Phase 1.4: Migrate off_balance to conditions system
      if (fumble.type === 'off_balance') {
        playerConditions = applyCondition(playerConditions, 'Off-Balance', state.turn, 1);
      }
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

    // Roll loot from defeated enemy
    const loot = rollLoot(enemy.lootTableId);
    const lootMessage = formatLootMessage(loot);
    log.push({
      turn: state.turn,
      actor: 'system',
      message: lootMessage,
    });

    return { ...state, playerCharacter, enemy, log, winner: 'player', fumbleEffects, dodgeActive, activeBuffs, activeConditions: { player: playerConditions, enemy: enemyConditions } };
  }

  // Check if player defeated (could happen from self-damage or free attack)
  if (playerCharacter.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${playerCharacter.name} has been defeated!`,
    });
    return { ...state, playerCharacter, enemy, log, winner: 'enemy', fumbleEffects, dodgeActive, activeBuffs, activeConditions: { player: playerConditions, enemy: enemyConditions } };
  }

  // Clear enemy's Dodge at start of their turn
  if (dodgeActive.enemy) {
    dodgeActive.enemy = false;
  }

  // Clear enemy's buffs at start of their turn
  if (activeBuffs.enemy && activeBuffs.enemy.length > 0) {
    activeBuffs.enemy = [];
  }

  // Phase 1.4: Decrement enemy conditions at START of their turn (before DoT)
  const enemyConditionResult = decrementConditions(enemyConditions);
  enemyConditions = enemyConditionResult.remaining;
  enemyConditionResult.expired.forEach((condition) => {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${condition.type} expired on ${enemy.name}`,
    });
  });

  // Phase 1.4: Apply damage-over-time from conditions at start of enemy's turn
  const enemyDoT = applyConditionDamage(enemyConditions);
  if (enemyDoT.totalDamage > 0) {
    enemy = { ...enemy, hp: enemy.hp - enemyDoT.totalDamage };
    enemyDoT.damageBreakdown.forEach((dmg) => {
      log.push({
        turn: state.turn,
        actor: 'system',
        message: `${dmg.condition}: ${dmg.formula} = ${dmg.amount} ${dmg.type} damage`,
      });
    });
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
    const enemyAttack = performAttack(enemy, playerCharacter, enemyConditions, playerConditions);
    log.push({
      turn: state.turn,
      actor: 'enemy',
      message: enemyAttack.output,
      taunt: enemyAttack.taunt,
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
        const freeAttack = performAttack(playerCharacter, enemy, playerConditions, enemyConditions);
        log.push({
          turn: state.turn,
          actor: 'player',
          message: `FREE ATTACK! ${freeAttack.output}`,
          taunt: freeAttack.taunt,
        });
        if (freeAttack.hit && freeAttack.damage) {
          enemy = { ...enemy, hp: enemy.hp - freeAttack.damage };
        }
      }

      // Phase 1.4: Migrate off_balance to conditions system
      if (fumble.type === 'off_balance') {
        enemyConditions = applyCondition(enemyConditions, 'Off-Balance', state.turn, 1);
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
    return { ...state, playerCharacter, enemy, log, winner: 'enemy', fumbleEffects, dodgeActive, activeBuffs, activeConditions: { player: playerConditions, enemy: enemyConditions } };
  }

  // Check if enemy defeated (could happen from self-damage or free attack)
  if (enemy.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${enemy.name} has been defeated!`,
    });

    // Roll loot from defeated enemy
    const loot = rollLoot(enemy.lootTableId);
    const lootMessage = formatLootMessage(loot);
    log.push({
      turn: state.turn,
      actor: 'system',
      message: lootMessage,
    });

    return { ...state, playerCharacter, enemy, log, winner: 'player', fumbleEffects, dodgeActive, activeBuffs, activeConditions: { player: playerConditions, enemy: enemyConditions } };
  }

  return {
    ...state,
    playerCharacter,
    enemy,
    log,
    turn: state.turn + 1,
    fumbleEffects,
    dodgeActive,
    activeBuffs,
    activeConditions: { player: playerConditions, enemy: enemyConditions },
  };
}

/**
 * Handle player retreat from combat
 * Applies penalties: gold lost, damage taken, narrative flag
 */
export function handleRetreat(combat: CombatState): {
  playerCharacter: Character;
  retreatFlag?: string;
  safeNodeId: string;
} {
  if (!combat.canRetreat) {
    throw new Error('Retreat not allowed');
  }

  if (!combat.retreatPenalty) {
    throw new Error('Retreat penalty not defined');
  }

  const { goldLost, damageOnFlee, narrativeFlag, safeNodeId } = combat.retreatPenalty;

  const updatedPlayer: Character = {
    ...combat.playerCharacter,
    gold: Math.max(0, (combat.playerCharacter.gold ?? 0) - goldLost),
    hp: Math.max(1, combat.playerCharacter.hp - damageOnFlee), // Never go below 1
  };

  return {
    playerCharacter: updatedPlayer,
    retreatFlag: narrativeFlag,
    safeNodeId,
  };
}
