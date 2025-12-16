import type { CreatureClass } from '../types/creature';

interface CreatureClassTraits {
    name: CreatureClass;
    displayName: string;
    description: string;
    mechanicalEffects: {
        saveBonus?: { fortitude?: number; reflex?: number; will?: number };
        naturalArmorBonus?: number;
        immunities?: string[];
    };
}

export const CREATURE_CLASS_TRAITS: Record<CreatureClass, CreatureClassTraits> = {
    Beast: {
        name: 'Beast',
        displayName: 'Beast',
        description: 'Animals and monstrous creatures',
        mechanicalEffects: {
            naturalArmorBonus: 2,
        },
    },
    Humanoid: {
        name: 'Humanoid',
        displayName: 'Humanoid',
        description: 'Human-like creatures',
        mechanicalEffects: {},
    },
    Undead: {
        name: 'Undead',
        displayName: 'Undead',
        description: 'Reanimated dead with unnatural resilience',
        mechanicalEffects: {
            saveBonus: { fortitude: 2, reflex: 2, will: 2 },
            immunities: ['poison', 'disease'],
        },
    },
};

/**
 * Get creature class traits by type
 */
export function getCreatureClassTraits(creatureClass: CreatureClass): CreatureClassTraits {
    return CREATURE_CLASS_TRAITS[creatureClass];
}

/**
 * Apply creature class mechanical effects to base stats
 */
export function applyCreatureClassEffects(
    baseStats: { ac: number; saves: { fortitude: number; reflex: number; will: number } },
    creatureClass: CreatureClass
): { ac: number; saves: { fortitude: number; reflex: number; will: number } } {
    const traits = CREATURE_CLASS_TRAITS[creatureClass];
    const { naturalArmorBonus = 0, saveBonus } = traits.mechanicalEffects;

    return {
        ac: baseStats.ac + naturalArmorBonus,
        saves: {
            fortitude: baseStats.saves.fortitude + (saveBonus?.fortitude ?? 0),
            reflex: baseStats.saves.reflex + (saveBonus?.reflex ?? 0),
            will: baseStats.saves.will + (saveBonus?.will ?? 0),
        },
    };
}