import type { Creature } from '../types/creature';
import type { Attributes } from '../types/attributes';
import type { Resources } from '../types/resource';
import { getEnemyTemplate } from '../data/enemyTemplates';
import { applyCreatureClassEffects } from '../data/creatureClasses';
import { calculateModifier } from './dice';

/**
 * Roll random number between min and max (inclusive)
 */
function rollBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random element from array
 */
function randomPick<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Calculate BAB based on class and level
 */
function calculateBAB(baseClass: string, level: number): number {
    // Fighter/Rogue: Full BAB progression
    if (baseClass === 'Fighter' || baseClass === 'Rogue') {
        return level;
    }
    // Wizard/Cleric: Half BAB progression
    return Math.floor(level / 2);
}

/**
 * Calculate base saves based on class and attributes
 */
function calculateBaseSaves(
    baseClass: string,
    attributes: Attributes
): { fortitude: number; reflex: number; will: number } {
    const conMod = calculateModifier(attributes.CON);
    const dexMod = calculateModifier(attributes.DEX);
    const wisMod = calculateModifier(attributes.WIS);

    // Fighter: Good Fort/Ref, Poor Will
    if (baseClass === 'Fighter') {
        return {
            fortitude: 2 + conMod,
            reflex: 2 + dexMod,
            will: 0 + wisMod,
        };
    }

    // Rogue: Good Ref, Poor Fort/Will
    if (baseClass === 'Rogue') {
        return {
            fortitude: 0 + conMod,
            reflex: 2 + dexMod,
            will: 0 + wisMod,
        };
    }

    // Wizard: Good Will, Poor Fort/Ref
    if (baseClass === 'Wizard') {
        return {
            fortitude: 0 + conMod,
            reflex: 0 + dexMod,
            will: 2 + wisMod,
        };
    }

    // Cleric: Good Fort/Will, Poor Ref
    if (baseClass === 'Cleric') {
        return {
            fortitude: 2 + conMod,
            reflex: 0 + dexMod,
            will: 2 + wisMod,
        };
    }

    // Default
    return {
        fortitude: conMod,
        reflex: dexMod,
        will: wisMod,
    };
}

/**
 * Calculate AC based on equipment and DEX
 */
function calculateAC(
    dexMod: number,
    armorBaseAC: number | null,
    shieldBonus: number
): number {
    const baseAC = armorBaseAC ?? 10;
    return baseAC + dexMod + shieldBonus;
}

/**
 * Calculate max HP based on class and level
 */
function calculateMaxHP(baseClass: string, level: number, conMod: number): number {
    let hitDie = 8; // Default d8

    if (baseClass === 'Fighter') hitDie = 10;
    else if (baseClass === 'Rogue') hitDie = 8;
    else if (baseClass === 'Wizard') hitDie = 4;
    else if (baseClass === 'Cleric') hitDie = 8;

    // First level: max hit die + CON
    // Additional levels: average hit die + CON
    const firstLevelHP = hitDie + conMod;
    const additionalHP = (level - 1) * (Math.floor(hitDie / 2) + 1 + conMod);

    return Math.max(1, firstLevelHP + additionalHP);
}

/**
 * Generate a creature from a template
 */
export function generateEnemy(
    templateId: string,
    options?: { level?: number }
): Creature | null {
    const template = getEnemyTemplate(templateId);
    if (!template) {
        console.error(`Enemy template not found: ${templateId}`);
        return null;
    }

    // Roll level
    const level = options?.level ?? rollBetween(template.levelRange.min, template.levelRange.max);

    // Roll attributes
    const attributes: Attributes = {
        STR: rollBetween(template.attributeRanges.STR.min, template.attributeRanges.STR.max),
        DEX: rollBetween(template.attributeRanges.DEX.min, template.attributeRanges.DEX.max),
        CON: rollBetween(template.attributeRanges.CON.min, template.attributeRanges.CON.max),
        INT: rollBetween(template.attributeRanges.INT.min, template.attributeRanges.INT.max),
        WIS: rollBetween(template.attributeRanges.WIS.min, template.attributeRanges.WIS.max),
        CHA: rollBetween(template.attributeRanges.CHA.min, template.attributeRanges.CHA.max),
    };

    // Pick random avatar
    const avatarPath = randomPick(template.avatarPaths);

    // Calculate derived stats
    const dexMod = calculateModifier(attributes.DEX);
    const conMod = calculateModifier(attributes.CON);
    const bab = calculateBAB(template.baseClass, level);
    const baseSaves = calculateBaseSaves(template.baseClass, attributes);

    const armorBaseAC = template.equipment.armor?.baseAC ?? null;
    const shieldBonus = template.equipment.shield?.equipped ? template.equipment.shield.acBonus : 0;
    const baseAC = calculateAC(dexMod, armorBaseAC, shieldBonus);

    const maxHp = calculateMaxHP(template.baseClass, level, conMod);

    // Apply creature class effects
    const { ac, saves } = applyCreatureClassEffects(
        { ac: baseAC, saves: baseSaves },
        template.creatureClass
    );

    // Build resources (spell slots for casters)
    const resources: Resources = {
        abilities: [],
        spellSlots: (template.baseClass === 'Wizard' || template.baseClass === 'Cleric')
            ? {
                level0: { max: 3, current: 3 },
                level1: { max: 2, current: 2 },
              }
            : undefined,
    };

    const creature = {
        name: template.baseName,
        avatarPath,
        level,
        creatureClass: template.creatureClass,
        attributes,
        hp: maxHp,
        maxHp,
        ac,
        bab,
        saves,
        skills: { ...template.skills },
        feats: [...template.feats],
        equipment: {
            weapon: template.equipment.weapon ? { ...template.equipment.weapon } : null,
            armor: template.equipment.armor ? { ...template.equipment.armor } : null,
            shield: template.equipment.shield ? { ...template.equipment.shield } : null,
            items: [...template.equipment.items],
        },
        resources,
        taunts: template.taunts,
        lootTableId: template.lootTableId,
    };

    // Debug logging to verify randomization
    console.log(`Generated ${creature.name} (Level ${creature.level}):`, {
        STR: creature.attributes.STR,
        DEX: creature.attributes.DEX,
        CON: creature.attributes.CON,
        HP: creature.maxHp,
        AC: creature.ac,
    });

    return creature;
}
