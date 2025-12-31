import type { Entity } from '../types/entity';
import type { Spell, SpellCastResult } from '../types';
import { roll, rollAttack } from './dice';
import { makeSavingThrow } from './savingThrows';

/**
 * Calculate ability modifier from ability score
 * Formula: (score - 10) / 2, rounded down
 */
function getAttributeModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Get the casting ability modifier for an entity
 * For Characters: uses class-specific casting stat (INT for Wizard, WIS for Cleric)
 * For Creatures: uses highest mental stat (INT, WIS, or CHA)
 */
export function getCastingAbilityModifier(entity: Entity): number {
  // Type guard: check if entity is a Character
  if ('class' in entity) {
    switch (entity.class) {
      case 'Wizard':
        return getAttributeModifier(entity.attributes.INT);
      case 'Cleric':
        return getAttributeModifier(entity.attributes.WIS);
      default:
        return 0;
    }
  }

  // For Creatures: use highest mental stat
  const intMod = getAttributeModifier(entity.attributes.INT);
  const wisMod = getAttributeModifier(entity.attributes.WIS);
  const chaMod = getAttributeModifier(entity.attributes.CHA);
  return Math.max(intMod, wisMod, chaMod);
}

/**
 * Calculate spell attack bonus
 * Formula: BAB + casting ability modifier
 */
export function getSpellAttackBonus(entity: Entity): number {
  return entity.bab + getCastingAbilityModifier(entity);
}

/**
 * Calculate spell save DC
 * Formula: 10 + spell level + casting ability modifier
 */
export function getSpellSaveDC(caster: Entity, spellLevel: number): number {
  return 10 + spellLevel + getCastingAbilityModifier(caster);
}

/**
 * Cast a damage spell (ranged spell attack)
 * Rolls attack: 1d20 + spell attack bonus vs target AC
 */
export function castDamageSpell(
  caster: Entity,
  target: Entity,
  spell: Spell
): SpellCastResult {
  if (!spell.effect.damageDice) {
    return {
      success: false,
      output: `${spell.name}: No damage dice defined`,
    };
  }

  // Use rollAttack to respect forced d20 rolls in tests
  const attack = rollAttack(caster.bab, getCastingAbilityModifier(caster));
  const d20 = attack.d20Result;
  const attackTotal = attack.total;

  // Check for critical hit (natural 20)
  const isCrit = d20 === 20;

  // Check if hit
  const hit = isCrit || attackTotal >= target.ac;

  if (!hit) {
    return {
      success: false,
      output: `${spell.name}: ${attack.output} vs AC ${target.ac} - MISS!`,
    };
  }

  // Roll damage (double dice on crit)
  const damageDice = isCrit ? `2${spell.effect.damageDice.substring(1)}` : spell.effect.damageDice;
  const damage = roll(damageDice);

  const critMessage = isCrit ? ' - CRITICAL HIT!' : '';
  const output = `${spell.name}: ${attack.output} vs AC ${target.ac} - HIT!${critMessage}
${damageDice}: ${damage} ${spell.effect.damageType} damage`;

  return {
    success: true,
    output,
    damage,
  };
}

/**
 * Cast a spell with saving throw
 * Target rolls save vs caster's spell DC
 */
export function castSpellWithSave(
  caster: Entity,
  target: Entity,
  spell: Spell
): SpellCastResult {
  if (!spell.savingThrow) {
    return {
      success: false,
      output: `${spell.name}: No saving throw defined`,
    };
  }

  // Check target restrictions (e.g., Daze only works on enemies ≤5 HP)
  if (spell.effect.targetRestriction && !spell.effect.targetRestriction(target)) {
    return {
      success: false,
      output: `${spell.name}: Target does not meet requirements (e.g., HP too high)`,
    };
  }

  const dc = getSpellSaveDC(caster, spell.level);
  const saveResult = makeSavingThrow(target, spell.savingThrow.type, dc);

  const saveMsg = saveResult.success ? 'SAVED' : 'FAILED';
  const saveOutput = `${saveResult.saveType.toUpperCase()} save: 1d20+${saveResult.bonus} = ${saveResult.total} vs DC ${saveResult.dc} - ${saveMsg}`;

  // If save succeeds and spell is "negates", spell fails
  if (saveResult.success && spell.savingThrow.onSuccess === 'negates') {
    return {
      success: false,
      output: `${spell.name}: ${saveOutput} - Spell negated!`,
      saveMade: true,
    };
  }

  // If save succeeds and spell is "half" (damage spells with saves)
  if (saveResult.success && spell.savingThrow.onSuccess === 'half' && spell.effect.damageDice) {
    const fullDamage = roll(spell.effect.damageDice);
    const damage = Math.floor(fullDamage / 2);
    return {
      success: true,
      output: `${spell.name}: ${saveOutput} - Half damage!
${spell.effect.damageDice}: ${fullDamage} → ${damage} ${spell.effect.damageType} damage (halved)`,
      damage,
      saveMade: true,
    };
  }

  // If save succeeds and spell is "partial" (damage applies, condition negated)
  if (saveResult.success && spell.savingThrow.onSuccess === 'partial' && spell.effect.type === 'damage' && spell.effect.damageDice) {
    const damage = roll(spell.effect.damageDice);
    return {
      success: true,
      output: `${spell.name}: ${saveOutput} - Condition negated!
${spell.effect.damageDice}: ${damage} ${spell.effect.damageType} damage`,
      damage,
      saveMade: true,
    };
  }

  // Save failed - apply full effect
  if (spell.effect.type === 'condition') {
    return {
      success: true,
      output: `${spell.name}: ${saveOutput} - ${spell.effect.conditionType} applied!`,
      conditionApplied: spell.effect.conditionType,
      saveMade: false,
    };
  }

  if (spell.effect.type === 'damage' && spell.effect.damageDice) {
    const damage = roll(spell.effect.damageDice);
    const hasCondition = spell.effect.conditionType && spell.effect.conditionDuration;
    const conditionDuration = spell.effect.conditionDuration ?? 1;
    return {
      success: true,
      output: `${spell.name}: ${saveOutput}
${spell.effect.damageDice}: ${damage} ${spell.effect.damageType} damage${hasCondition ? ` + ${spell.effect.conditionType} (${conditionDuration} turn${conditionDuration > 1 ? 's' : ''})` : ''}`,
      damage,
      conditionApplied: hasCondition ? spell.effect.conditionType : undefined,
      saveMade: false,
    };
  }

  return {
    success: false,
    output: `${spell.name}: Unknown effect type`,
  };
}

/**
 * Cast a buff spell (self-target)
 * Applies temporary bonus to next attack, save, etc.
 */
export function castBuffSpell(caster: Entity, spell: Spell): SpellCastResult {
  if (spell.effect.type !== 'buff') {
    return {
      success: false,
      output: `${spell.name}: Not a buff spell`,
    };
  }

  const buffType = spell.effect.buffType || 'attack';
  const amount = spell.effect.buffAmount || 1;
  const duration = spell.effect.buffDuration || 1;

  return {
    success: true,
    output: `${caster.name} casts ${spell.name}: +${amount} ${buffType} for ${duration} turn${duration > 1 ? 's' : ''}`,
  };
}

/**
 * Cast a heal spell (self-target)
 * Restores hit points
 */
export function castHealSpell(caster: Entity, spell: Spell): SpellCastResult {
  if (spell.effect.type !== 'heal' || !spell.effect.healDice) {
    return {
      success: false,
      output: `${spell.name}: Not a heal spell`,
    };
  }

  const healing = roll(spell.effect.healDice);

  return {
    success: true,
    output: `${caster.name} casts ${spell.name}:
${spell.effect.healDice}: ${healing} HP restored`,
    healing,
  };
}

/**
 * Main spell casting function
 * Routes to appropriate handler based on spell type
 */
export function castSpell(
  caster: Entity,
  target: Entity,
  spell: Spell
): SpellCastResult {
  // Self-target spells
  if (spell.target === 'self') {
    if (spell.effect.type === 'heal') {
      return castHealSpell(caster, spell);
    }
    if (spell.effect.type === 'buff') {
      return castBuffSpell(caster, spell);
    }
  }

  // Damage spells with saving throws (Sacred Flame, Daze, Magic Missile)
  if (spell.savingThrow && spell.effect.type === 'damage') {
    return castSpellWithSave(caster, target, spell);
  }

  // Condition spells with saving throws (Daze)
  if (spell.savingThrow && spell.effect.type === 'condition') {
    return castSpellWithSave(caster, target, spell);
  }

  // Damage spells with attack rolls (Ray of Frost, Acid Splash)
  // Note: Magic Missile has no save or attack roll, it auto-hits
  if (spell.effect.type === 'damage') {
    // Auto-hit spells (Magic Missile)
    if (!spell.savingThrow && spell.effect.damageDice) {
      const damage = roll(spell.effect.damageDice);
      return {
        success: true,
        output: `${spell.name}: Auto-hit!
${spell.effect.damageDice}: ${damage} ${spell.effect.damageType} damage`,
        damage,
      };
    }
    return castDamageSpell(caster, target, spell);
  }

  return {
    success: false,
    output: `${spell.name}: Unknown spell type`,
  };
}

/**
 * Consume a spell slot for a leveled spell
 * Returns updated entity with spell slot consumed
 *
 * Note: Cantrips (level 0) don't consume slots
 */
export function consumeSpellSlot<T extends Entity>(
  entity: T,
  spellLevel: number
): T {
  // Cantrips don't consume slots
  if (spellLevel === 0) {
    return entity;
  }

  // No spell slots to consume
  if (!entity.resources?.spellSlots) {
    return entity;
  }

  const slotKey = `level${spellLevel}` as keyof typeof entity.resources.spellSlots;
  const slot = entity.resources.spellSlots[slotKey];

  // No slot at this level or already at 0
  if (!slot || slot.current <= 0) {
    return entity;
  }

  // Consume slot (immutable update)
  return {
    ...entity,
    resources: {
      ...entity.resources,
      spellSlots: {
        ...entity.resources.spellSlots,
        [slotKey]: {
          ...slot,
          current: slot.current - 1,
        },
      },
    },
  };
}
