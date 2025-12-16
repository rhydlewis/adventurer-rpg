import type { EnemyTemplate } from '../types/enemyTemplate';
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from './creatureAvatars';

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
    bandit: {
        id: 'bandit',
        baseName: 'Bandit',
        creatureClass: 'Humanoid',
        avatarPaths: [CREATURE_AVATARS['Bandit'] || DEFAULT_CREATURE_AVATAR],

        levelRange: { min: 1, max: 2 },
        attributeRanges: {
            STR: { min: 12, max: 14 },
            DEX: { min: 13, max: 15 },
            CON: { min: 11, max: 13 },
            INT: { min: 9, max: 11 },
            WIS: { min: 10, max: 12 },
            CHA: { min: 7, max: 9 },
        },

        baseClass: 'Fighter',
        equipment: {
            weapon: {
                name: 'Dagger',
                damage: '1d6',
                damageType: 'piercing',
                finesse: true,
                description: 'A short blade favored by bandits',
            },
            armor: {
                name: 'Leather',
                baseAC: 11,
                maxDexBonus: null,
                description: 'Supple leather armor',
            },
            shield: { equipped: false, acBonus: 0 },
            items: [],
        },
        skills: {
            Athletics: 0,
            Stealth: 4,
            Perception: 0,
            Arcana: 0,
            Medicine: 0,
            Intimidate: 2,
        },
        feats: [],
        taunts: {
            onCombatStart: ["You'll regret crossing me!", "Fresh meat!", "Your gold or your life!"],
            onPlayerMiss: ["Too slow!", "Hah! Missed!", "You fight like a farmer!"],
            onEnemyHit: ["How'd you like that?", "You're finished!", "Take that!"],
            onLowHealth: ["I'll... get you...", "This isn't over!", "You got lucky!"],
        },
        lootTableId: 'bandit_loot',
    },

    skeleton: {
        id: 'skeleton',
        baseName: 'Skeleton',
        creatureClass: 'Undead',
        avatarPaths: [CREATURE_AVATARS['Skeleton'] || DEFAULT_CREATURE_AVATAR],

        levelRange: { min: 1, max: 2 },
        attributeRanges: {
            STR: { min: 12, max: 14 },
            DEX: { min: 14, max: 16 },
            CON: { min: 10, max: 10 }, // Undead - fixed CON
            INT: { min: 5, max: 7 },
            WIS: { min: 9, max: 11 },
            CHA: { min: 2, max: 4 },
        },

        baseClass: 'Fighter',
        equipment: {
            weapon: {
                name: 'Mace',
                damage: '1d6',
                damageType: 'bludgeoning',
                finesse: false,
                description: 'Rusty mace and claw attacks',
            },
            armor: null, // Natural bone armor
            shield: { equipped: true, acBonus: 2 },
            items: [],
        },
        skills: {
            Athletics: 0,
            Stealth: 0,
            Perception: 0,
            Arcana: 0,
            Medicine: 0,
            Intimidate: 0,
        },
        feats: [],
        taunts: {
            onCombatStart: ["*rattles bones menacingly*", "*hollow laughter*"],
            onPlayerMiss: ["*dodges with unnatural speed*"],
            onEnemyHit: ["*bones crack against you*", "*relentless assault*"],
            onLowHealth: ["*bones begin to crumble*"],
        },
        lootTableId: 'skeleton_loot',
    },

    wraith: {
        id: 'wraith',
        baseName: 'Wraith',
        creatureClass: 'Undead',
        avatarPaths: [CREATURE_AVATARS['Wraith'] || DEFAULT_CREATURE_AVATAR],

        levelRange: { min: 1, max: 2 },
        attributeRanges: {
            STR: { min: 5, max: 7 },
            DEX: { min: 15, max: 17 },
            CON: { min: 10, max: 10 },
            INT: { min: 15, max: 17 },
            WIS: { min: 13, max: 15 },
            CHA: { min: 7, max: 9 },
        },

        baseClass: 'Wizard',
        equipment: {
            weapon: null, // Life-draining touch (natural attack)
            armor: null,
            shield: null,
            items: [],
        },
        skills: {
            Athletics: 0,
            Stealth: 5,
            Perception: 4,
            Arcana: 6,
            Medicine: 0,
            Intimidate: 2,
        },
        feats: [],
        taunts: {
            onCombatStart: ["*ethereal wailing*", "Your soul will be mine...", "*appears from shadows*"],
            onPlayerMiss: ["*phases through attack*", "You cannot touch the dead..."],
            onEnemyHit: ["*life-draining touch*", "Feel the cold of the grave!"],
            onLowHealth: ["*fading into mist*", "I shall return...", "*dissipating*"],
        },
        lootTableId: 'wraith_loot',
    },

    giantSpider: {
        id: 'giantSpider',
        baseName: 'Giant Spider',
        creatureClass: 'Beast',
        avatarPaths: [CREATURE_AVATARS['Spider'] || DEFAULT_CREATURE_AVATAR],

        levelRange: { min: 1, max: 1 },
        attributeRanges: {
            STR: { min: 10, max: 12 },
            DEX: { min: 13, max: 15 },
            CON: { min: 11, max: 13 },
            INT: { min: 2, max: 2 },
            WIS: { min: 9, max: 11 },
            CHA: { min: 2, max: 2 },
        },

        baseClass: 'Fighter',
        equipment: {
            weapon: null, // Natural bite
            armor: null,  // Natural exoskeleton
            shield: null,
            items: [],
        },
        skills: {
            Athletics: 0,
            Stealth: 6,
            Perception: 4,
            Arcana: 0,
            Medicine: 0,
            Intimidate: 0,
        },
        feats: [],
        taunts: {
            onCombatStart: [
                "*clicks mandibles ominously*",
                "*drops from above on a silken thread*",
                "*hisses and rears up, fangs dripping*"
            ],
            onPlayerMiss: [
                "*skitters aside with unnatural speed*",
                "*the blade passes through its web*"
            ],
            onEnemyHit: [
                "*sinks venomous fangs into your flesh*",
                "*a sticky web strand clings to you*"
            ],
            onLowHealth: [
                "*retreats into the shadows, wounded*",
                "*eight legs tremble as it prepares a final strike*"
            ],
        },
        lootTableId: 'spider_loot',
    },
};

/**
 * Get enemy template by ID
 */
export function getEnemyTemplate(id: string): EnemyTemplate | null {
    return ENEMY_TEMPLATES[id] ?? null;
}
