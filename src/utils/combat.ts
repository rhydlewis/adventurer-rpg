import { rollAttack, rollDamage, calculateModifier } from './dice';
import type { CombatState } from '../types';
import type { Character } from '../types';
import type { Creature } from "../types/creature";
import type { Action, CastSpellAction, AttackAction, UseAbilityAction } from '../types/action';
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
import { castSpell, consumeSpellSlot } from './spellcasting';
import { getSpellById } from '../data/spells';
import { selectEnemyAction, selectSpell, getEnemySpells } from './enemyAI';
import { calculateConditionModifiers, decrementConditions, applyConditionDamage, applyCondition } from './conditions';
import { rollLoot, formatLootMessage } from './loot';
import { selectTaunt, isLowHealth } from './taunts';
import { applyItemEffect } from './itemEffects';
import { applyStartingQuirk } from './quirks';
import { applyAttackFeat, applyAbilityFeat } from './combatFeats';

export function performAttack(
  attacker: Character | Creature,
  defender: Character | Creature,
  attackerConditions: Condition[] = [],
  defenderConditions: Condition[] = [],
  modifiers?: { attackBonus?: number; damageBonus?: number; label?: string },
  context?: 'player' | 'enemy'
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

  // Determine which ability modifier to use (Finesse weapons can use DEX)
  const strMod = calculateModifier(attacker.attributes.STR);
  const dexMod = calculateModifier(attacker.attributes.DEX);
  const abilityMod = (attacker.equipment.weapon?.finesse && dexMod > strMod) ? dexMod : strMod;

  // Apply weapon enchantment bonus to attack and damage
  const weaponEnchantment = attacker.equipment.weapon?.enchantmentBonus ?? 0;

  // Apply attack bonuses from explicit modifiers, conditions, AND weapon enchantment
  const totalAttackBonus = (modifiers?.attackBonus ?? 0) + (attackerMods.attackBonus ?? 0) + weaponEnchantment;
  const totalDamageBonus = (modifiers?.damageBonus ?? 0) + (attackerMods.damageBonus ?? 0) + weaponEnchantment;
  const attack = rollAttack(attacker.bab, abilityMod + totalAttackBonus, context);
  const naturalRoll = attack.d20Result;

  // CRITICAL FIX: Calculate effective AC with condition bonuses (Dodge, Shielded, etc.)
  const effectiveDefenderAC = defender.ac + (defenderMods.acBonus ?? 0);

  // Check for critical hit (natural 20)
  if (isCriticalHit(naturalRoll)) {
    // Crits always hit
    const baseDamage = attacker.equipment.weapon?.damage ?? '1d3'; // Use equipped weapon damage, fallback to unarmed (1d3)
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
    // Use equipped weapon damage, fallback to unarmed (1d3)
    const weaponDamage = attacker.equipment.weapon?.damage ?? '1d3';
    const dmg = rollDamage(weaponDamage, abilityMod + totalDamageBonus);

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

  // Quirk tracking
  let playerAcBonus: number | undefined = state.playerAcBonus;
  let quirkTriggered = state.quirkTriggered;
  let autoBlockActive = state.autoBlockActive || false;
  let autoHealActive = state.autoHealActive || false;

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

    // Apply turn-1 quirks at the start of turn 1, before any combat actions
    if (!quirkTriggered) {
      const quirkResult = applyStartingQuirk(playerCharacter, state, 'turn-1');
      if (quirkResult.log.length > 0) {
        log.push(...quirkResult.log);
      }
      if (quirkResult.playerHp) {
        playerCharacter = { ...playerCharacter, hp: quirkResult.playerHp };
      }
      if (quirkResult.acBonus) {
        playerAcBonus = quirkResult.acBonus;
        // Apply AC bonus as a condition that lasts for this turn
        // Use duration 2 so it survives the condition decrement that happens later
        const conditionType = quirkResult.acBonus >= 4 ? 'Shielded' : 'Guarded';
        playerConditions = applyCondition(playerConditions, conditionType, state.turn, 2);
      }
      if (quirkResult.quirkTriggered) {
        quirkTriggered = true;
      }
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
      // Handle class abilities and feat abilities
      const abilityAction = playerAction as UseAbilityAction;
      const abilityId = abilityAction.abilityId;
      const featId = abilityAction.featId;

      // NEW: Handle feat-based abilities (e.g., Empower Spell, Defensive Channel)
      if (featId) {
        const featResult = applyAbilityFeat(playerCharacter, featId, playerConditions, state.turn);

        if (featResult.success) {
          playerCharacter = featResult.character;
          playerConditions = featResult.conditions || playerConditions;

          // Log feat usage
          featResult.log.forEach((msg) => {
            log.push({
              turn: state.turn,
              actor: 'player',
              message: `${playerCharacter.name} uses ${msg}`,
            });
          });

          // TODO: For feats like Empower Spell, we need to track state for "nextSpell" duration
          // This would require adding feat state tracking to CombatState
        } else {
          // Feat failed (insufficient resources, etc.)
          log.push({
            turn: state.turn,
            actor: 'system',
            message: featResult.error || 'Failed to use feat ability',
          });
        }
      } else if (abilityId === 'Second Wind') {
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
    } else if (playerAction.type === 'use_item') {
      // Handle item usage
      const itemId = playerAction.itemId;
      const item = playerCharacter.equipment.items.find(i => i.id === itemId);

      if (item && item.effect) {
        // Apply item effect
        const { character: updatedCharacter, logMessage } = applyItemEffect(
          playerCharacter,
          item.effect,
          true // inCombat = true
        );

        playerCharacter = updatedCharacter;

        // Decrement item quantity
        const updatedItems = playerCharacter.equipment.items
          .map(i =>
            i.id === item.id
              ? { ...i, quantity: (i.quantity ?? 1) - 1 }
              : i
          )
          .filter(i => (i.quantity ?? 0) > 0); // Remove if quantity = 0

        playerCharacter = {
          ...playerCharacter,
          equipment: {
            ...playerCharacter.equipment,
            items: updatedItems,
          },
        };

        // Add log entry
        log.push({
          turn: state.turn,
          actor: 'player',
          message: `${playerCharacter.name} uses ${item.name}: ${logMessage}`,
        });

        // Handle escape items (special case: end combat immediately)
        if (item.effect.type === 'escape') {
          return {
            ...state,
            turn: state.turn + 1,
            playerCharacter,
            log,
            winner: 'player', // Escaped successfully
          };
        }
      }
    } else if (playerAction.type === 'cast_spell') {
      // Cast spell action
      const spellAction = playerAction as CastSpellAction;

      // Find the spell
      const spell = getSpellById(spellAction.spellId);

      if (!spell) {
        log.push({
          turn: state.turn,
          actor: 'system',
          message: `Spell not found: ${spellAction.spellId}`,
        });
      } else {
        // Check spell slot availability for non-cantrips (level > 0)
        if (spell.level > 0) {
          if (!playerCharacter.resources.spellSlots) {
            log.push({
              turn: state.turn,
              actor: 'system',
              message: `Cannot cast ${spell.name} - no spell slots available`,
            });
            return state; // Early return - spell cannot be cast
          }

          const slotKey = `level${spell.level}` as keyof typeof playerCharacter.resources.spellSlots;
          const slot = playerCharacter.resources.spellSlots[slotKey];

          if (!slot || slot.current <= 0) {
            log.push({
              turn: state.turn,
              actor: 'system',
              message: `Cannot cast ${spell.name} - no level ${spell.level} slots remaining`,
            });
            return state; // Early return - no slots available
          }
          // Note: Spell slot will be consumed after successful cast (see below)
        }

        // Cast the spell
        const result = castSpell(playerCharacter, enemy, spell);

        // Apply damage if successful
        if (result.success && result.damage) {
          enemy = {
            ...enemy,
            hp: enemy.hp - result.damage,
          };
        }

        // Apply healing if successful
        if (result.success && result.healing) {
          playerCharacter = {
            ...playerCharacter,
            hp: Math.min(playerCharacter.hp + result.healing, playerCharacter.maxHp),
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
            'Shield': 'Shield',
            'Shield of Faith': 'Shield of Faith',
            'Bless Weapon': 'Bless Weapon',
          };

          const conditionType = conditionTypeMap[spell.name];
          const duration = spell.effect.buffDuration || 1;
          if (conditionType) {
            playerConditions = applyCondition(playerConditions, conditionType, state.turn, duration);
          }
        }

        // TODO: Apply conditions (Daze -> Stunned) in Phase 1.4

        // Consume spell slot if leveled spell (cantrips are level 0)
        if (result.success && spell.level > 0) {
          playerCharacter = consumeSpellSlot(playerCharacter, spell.level);
        }
      }
    } else {
      // Attack action (normal or feat-enhanced attack)
      let attackModifiers: { attackBonus?: number; damageBonus?: number; label?: string } | undefined;
      let bonusDamageFormula: string | undefined;
      let conditionsToApplyOnHit: { type: string; duration: number }[] = [];

      // Check for feat-based attack
      const attackAction = playerAction as AttackAction;
      if (attackAction.featId) {
        // NEW: Dynamic feat handling
        const featResult = applyAttackFeat(playerCharacter, attackAction.featId, playerConditions, state.turn);

        if (featResult.success && featResult.attackModifiers) {
          playerCharacter = featResult.character;
          attackModifiers = {
            attackBonus: featResult.attackModifiers.attackBonus,
            damageBonus: featResult.attackModifiers.damageBonus,
            label: featResult.attackModifiers.label,
          };
          bonusDamageFormula = featResult.attackModifiers.bonusDamage;
          conditionsToApplyOnHit = featResult.conditionsToApply || [];

          // Log feat usage
          featResult.log.forEach((msg) => {
            log.push({
              turn: state.turn,
              actor: 'system',
              message: msg,
            });
          });
        } else {
          // Feat failed (insufficient resources, etc.)
          log.push({
            turn: state.turn,
            actor: 'system',
            message: featResult.error || 'Failed to use feat',
          });
          // Continue with normal attack (feat failed but can still attack)
        }
      } else if (attackAction.variant === 'power_attack') {
        // LEGACY: Hardcoded Power Attack support for backward compatibility
        attackModifiers = {
          attackBonus: attackAction.attackModifier ?? -2,
          damageBonus: attackAction.damageModifier ?? 4,
          label: 'Power Attack',
        };
      }

      const playerAttack = performAttack(playerCharacter, enemy, playerConditions, enemyConditions, attackModifiers, 'player');

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
        // Calculate total damage: base + sneak attack + feat bonus damage
        let totalDamage = playerAttack.damage + sneakAttackDamage;

        // Apply bonus damage from feats (e.g., Channel Smite +2d6)
        if (bonusDamageFormula) {
          const bonusDamageRoll = rollDamage(bonusDamageFormula, 0);
          totalDamage += bonusDamageRoll.total;
          log.push({
            turn: state.turn,
            actor: 'system',
            message: `Bonus damage: ${bonusDamageRoll.output}`,
          });
        }

        enemy = { ...enemy, hp: enemy.hp - totalDamage };

        // Apply conditions from feats (e.g., Bloody Assault applies Bleeding)
        if (conditionsToApplyOnHit.length > 0) {
          conditionsToApplyOnHit.forEach(({ type, duration }) => {
            enemyConditions = applyCondition(enemyConditions, type as import('../types/condition').ConditionType, state.turn, duration);
            log.push({
              turn: state.turn,
              actor: 'system',
              message: `${enemy.name} is now ${type}!`,
            });
          });
        }

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
        const freeAttack = performAttack(enemy, playerCharacter, enemyConditions, playerConditions, undefined, 'enemy');
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

    return { ...state, playerCharacter, enemy, log, winner: 'player', fumbleEffects, dodgeActive, activeBuffs, activeConditions: { player: playerConditions, enemy: enemyConditions }, autoHealActive };
  }

  // Check if player defeated (could happen from self-damage or free attack)
  if (playerCharacter.hp <= 0) {
    log.push({
      turn: state.turn,
      actor: 'system',
      message: `${playerCharacter.name} has been defeated!`,
    });
    return { ...state, playerCharacter, enemy, log, winner: 'enemy', fumbleEffects, dodgeActive, activeBuffs, activeConditions: { player: playerConditions, enemy: enemyConditions }, autoHealActive, forceEnemySpellCast: false };
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
    // Apply first-attack quirk if this is turn 1 and quirk hasn't triggered
    if (state.turn === 1 && !quirkTriggered) {
      const quirkResult = applyStartingQuirk(playerCharacter, state, 'first-attack');
      if (quirkResult.log.length > 0) {
        log.push(...quirkResult.log);
      }
      if (quirkResult.acBonus) {
        playerAcBonus = quirkResult.acBonus;
        // Apply AC bonus as a temporary condition for this attack
        // Use duration 2 so it survives the condition decrement
        const conditionType = quirkResult.acBonus >= 4 ? 'Shielded' : 'Guarded';
        playerConditions = applyCondition(playerConditions, conditionType, state.turn, 2);
      }
      if (quirkResult.autoBlockActive) {
        autoBlockActive = true;
      }
      if (quirkResult.quirkTriggered) {
        quirkTriggered = true;
      }
    }

    // Enemy turn - decide between attack or cast spell
    const enemySpells = getEnemySpells(enemy.spellIds);
    const enemyAction = autoBlockActive ? 'attack' : selectEnemyAction(enemy, playerCharacter, enemySpells, state.forceEnemySpellCast);

    let enemyAttack;
    if (autoBlockActive) {
      // Auto-block: Attack automatically misses
      enemyAttack = {
        hit: false,
        attackRoll: 0,
        attackTotal: 0,
        output: "Attack automatically blocked!",
      };
      autoBlockActive = false; // Clear after use

      log.push({
        turn: state.turn,
        actor: 'enemy',
        message: enemyAttack.output,
      });
    } else if (enemyAction === 'cast_spell' && enemySpells.length > 0) {
      // Enemy casts spell
      const spell = selectSpell(enemy, playerCharacter, enemySpells);
      const spellResult = castSpell(enemy, playerCharacter, spell);

      // Log spell casting
      log.push({
        turn: state.turn,
        actor: 'enemy',
        message: spellResult.output,
      });

      // Apply damage if successful
      if (spellResult.success && spellResult.damage) {
        playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - spellResult.damage };
      }

      // Apply conditions if successful
      if (spellResult.success && spellResult.conditionApplied) {
        // Parse condition type and duration from spell effect
        const conditionType = spell.effect.conditionType as import('../types/condition').ConditionType;
        const duration = spell.effect.conditionDuration ?? 1;

        if (conditionType) {
          playerConditions = applyCondition(playerConditions, conditionType, state.turn, duration);
          log.push({
            turn: state.turn,
            actor: 'system',
            message: `You are ${conditionType}!`,
          });
        }
      }

      // Consume spell slot if leveled spell
      if (spell.level > 0) {
        enemy = consumeSpellSlot(enemy, spell.level);
      }
    } else {
      // Normal attack
      enemyAttack = performAttack(enemy, playerCharacter, enemyConditions, playerConditions, undefined, 'enemy');

      log.push({
        turn: state.turn,
        actor: 'enemy',
        message: enemyAttack.output,
        taunt: enemyAttack.taunt,
      });

      if (enemyAttack.hit && enemyAttack.damage) {
        playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - enemyAttack.damage };

        // Auto-heal quirk: heal to full HP after first hit
        if (autoHealActive) {
          const healedAmount = playerCharacter.maxHp - playerCharacter.hp;
          playerCharacter = { ...playerCharacter, hp: playerCharacter.maxHp };
          autoHealActive = false; // Deactivate after use
          log.push({
            turn: state.turn,
            actor: 'system',
            message: `Divine power restores you (+${healedAmount} HP)!`,
          });
        }
      }
    }

    // Handle fumble effects (only applies to attacks, not spells)
    if (enemyAttack && enemyAttack.isFumble && enemyAttack.fumbleEffect) {
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
        const freeAttack = performAttack(playerCharacter, enemy, playerConditions, enemyConditions, undefined, 'player');
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
    return { ...state, playerCharacter, enemy, log, winner: 'enemy', fumbleEffects, dodgeActive, activeBuffs, activeConditions: { player: playerConditions, enemy: enemyConditions }, autoHealActive, forceEnemySpellCast: false };
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

    return { ...state, playerCharacter, enemy, log, winner: 'player', fumbleEffects, dodgeActive, activeBuffs, activeConditions: { player: playerConditions, enemy: enemyConditions }, quirkTriggered, playerAcBonus, autoBlockActive, autoHealActive, forceEnemySpellCast: false };
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
    quirkTriggered,
    playerAcBonus,
    autoBlockActive,
    autoHealActive,
    forceEnemySpellCast: false, // Reset debug flag after turn
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
