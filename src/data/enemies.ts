import type {Creature} from '../types/combat';
import {CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR} from './creatureAvatars';

/**
 * Enemy Database
 *
 * Defines all enemies that can be encountered in combat.
 * Each enemy is a Creature with full d20 stats.
 */

export const enemies: Record<string, Creature> = {
    bandit: {
        name: 'Bandit',
        avatarPath: CREATURE_AVATARS['Bandit'] || DEFAULT_CREATURE_AVATAR,
        class: 'Fighter',
        level: 1,
        attributes: {
            STR: 13, // +1
            DEX: 14, // +2
            CON: 12, // +1
            INT: 10, // +0
            WIS: 11, // +0
            CHA: 8, // -1
        },
        hp: 10,
        maxHp: 10,
        ac: 13, // 10 + 2 DEX + 1 leather armor
        bab: 1,
        saves: {
            fortitude: 3, // 2 (Fighter) + 1 CON
            reflex: 2, // 0 (Fighter) + 2 DEX
            will: 0, // 0 (Fighter) + 0 WIS
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
            shield: {
                equipped: false,
                acBonus: 0,
            },
            items: [],
        },
        resources: {
            abilities: [],
            spellSlots: undefined,
        },
        taunts: {
            onCombatStart: ["You'll regret crossing me!", "Fresh meat!", "Your gold or your life!"],
            onPlayerMiss: ["Too slow!", "Hah! Missed!", "You fight like a farmer!"],
            onEnemyHit: ["How'd you like that?", "You're finished!", "Take that!"],
            onLowHealth: ["I'll... get you...", "This isn't over!", "You got lucky!"],
        },
    },

    skeleton: {
        name: 'Skeleton',
        avatarPath: CREATURE_AVATARS['Skeleton'] || DEFAULT_CREATURE_AVATAR,
        class: 'Fighter',
        level: 1,
        attributes: {
            STR: 13, // +1
            DEX: 15, // +2
            CON: 10, // +0 (undead don't benefit from CON but keep for mechanics)
            INT: 6, // -2
            WIS: 10, // +0
            CHA: 3, // -4
        },
        hp: 12,
        maxHp: 12,
        ac: 15, // 10 + 2 DEX + 2 natural armor + 1 shield
        bab: 1,
        saves: {
            fortitude: 2, // 2 (Fighter) + 0 CON
            reflex: 4, // 0 (Fighter) + 2 DEX + 2 (undead bonus)
            will: 2, // 0 (Fighter) + 0 WIS + 2 (undead bonus)
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
        equipment: {
            weapon: {
                name: 'Mace',
                damage: '1d6',
                damageType: 'bludgeoning',
                finesse: false,
                description: 'Rusty mace and claw attacks',
            },
            armor: {
                name: 'None',
                baseAC: 10,
                maxDexBonus: null,
                description: 'Natural bone armor',
            },
            shield: {
                equipped: true,
                acBonus: 2,
            },
            items: [],
        },
        resources: {
            abilities: [],
            spellSlots: undefined,
        },
        taunts: {
            onCombatStart: ["*rattles bones menacingly*", "*hollow laughter*"],
            onPlayerMiss: ["*dodges with unnatural speed*"],
            onEnemyHit: ["*bones crack against you*", "*relentless assault*"],
            onLowHealth: ["*bones begin to crumble*"],
        },
    },

    wraith: {
        name: 'Wraith',
        avatarPath: CREATURE_AVATARS['Wraith'] || DEFAULT_CREATURE_AVATAR,
        class: 'Wizard',
        level: 1,

        attributes: {
            STR: 6,   // -2 (incorporeal/undead - very weak physically)
            DEX: 16,  // +3 (ghostly, hard to hit)
            CON: 10,  // +0 (undead don't need CON but keep for mechanics)
            INT: 16,  // +3 (intelligent undead, spellcaster)
            WIS: 14,  // +2 (perceptive, experienced in death)
            CHA: 8,   // -1 (terrifying but not charismatic)
        },

        hp: 6,      // Low HP (d4 hit die for Wizard + 0 CON)
        maxHp: 6,
        ac: 13,     // 10 + 3 DEX (incorporeal nature makes it hard to hit)
        bab: 0,     // Wizard at level 1

        saves: {
            fortitude: 0,  // 0 (Wizard base) + 0 CON
            reflex: 3,     // 0 (Wizard base) + 3 DEX
            will: 4,       // 2 (Wizard base) + 2 WIS (strong vs mental effects)
        },

        skills: {
            Athletics: 0,      // Terrible at physical tasks
            Stealth: 5,        // 2 ranks + 3 DEX (ghostly, sneaky)
            Perception: 4,     // 2 ranks + 2 WIS (sees through deception)
            Arcana: 6,         // 3 ranks + 3 INT (magical knowledge!)
            Medicine: 0,       // Undead don't heal
            Intimidate: 2,     // 3 ranks + (-1) CHA (terrifying presence)
        },

        feats: [],

        equipment: {
            weapon: {
                name: 'Dagger',
                damage: '1d4',
                damageType: 'piercing',
                finesse: true,
                description: 'Life-draining touch', // Flavor it as magical
            },
            armor: {
                name: 'None',
                baseAC: 10,
                maxDexBonus: null,
                description: 'Incorporeal form',
            },
            shield: {equipped: false, acBonus: 0},
            items: [],
        },

        resources: {
            abilities: [],
            spellSlots: {
                level0: {max: 3, current: 3},  // 3 cantrips at will
                level1: {max: 2, current: 2},  // 2 first-level spells per day
            },
        },
        taunts: {
            onCombatStart: ["*ethereal wailing*", "Your soul will be mine...", "*appears from shadows*"],
            onPlayerMiss: ["*phases through attack*", "You cannot touch the dead..."],
            onEnemyHit: ["*life-draining touch*", "Feel the cold of the grave!"],
            onLowHealth: ["*fading into mist*", "I shall return...", "*dissipating*"],
        },
    },

    giantSpider: {
        name: "Giant Spider",
        avatarPath: CREATURE_AVATARS['Spider'] || DEFAULT_CREATURE_AVATAR,
        class: "Fighter",
        level: 1,
        attributes: {
            STR: 11,   // +0  (moderate strength)
            DEX: 14,   // +2  (quick and agile)
            CON: 12,   // +1  (tough exoskeleton)
            INT: 2,    // -4  (animal intelligence)
            WIS: 10,   //  0  (sharp hunters' senses)
            CHA: 2     // -4  (monstrous presence)
        },
        hp: 8,       // d8 hit die (beast) + 1 CON
        maxHp: 8,
        ac: 14,      // 10 + 2 DEX + 2 natural armor
        bab: 1,
        saves: {
            fortitude: 3, // 2 (good) + 1 CON
            reflex: 4,    // 2 (good) + 2 DEX
            will: 0,      // 0 (poor) + 0 WIS
        },
        skills: {
            Athletics: 0,
            Stealth: 6,      // 2 ranks + 2 DEX + 2 (web lurking)
            Perception: 4,   // 2 ranks + 0 WIS + 2 (tremorsense)
            Arcana: 0,
            Medicine: 0,
            Intimidate: 0,
        },
        feats: [],
        equipment: {
            weapon: null,  // Natural bite attack
            armor: null,   // Natural armor from exoskeleton
            shield: null,
            items: [],
        },
        resources: {
            abilities: [],
            spellSlots: undefined
        },
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
            ]
        }
    }
};

/**
 * Get enemy by ID, return a fresh copy to prevent mutation
 */
export function getEnemy(enemyId: string): Creature | null {
    const enemy = enemies[enemyId];
    if (!enemy) return null;

    // Return a deep copy to prevent mutations affecting the template
    return {
        ...enemy,
        attributes: {...enemy.attributes},
        saves: {...enemy.saves},
        skills: {...enemy.skills},
        feats: [...enemy.feats],
        equipment: {
            weapon: enemy.equipment.weapon ? {...enemy.equipment.weapon} : null,
            armor: enemy.equipment.armor ? {...enemy.equipment.armor} : null,
            shield: enemy.equipment.shield ? {...enemy.equipment.shield} : null,
            items: [...enemy.equipment.items],
        },
        resources: {
            abilities: [...enemy.resources.abilities],
            spellSlots: enemy.resources.spellSlots
                ? {
                    level0: {...enemy.resources.spellSlots.level0},
                    level1: {...enemy.resources.spellSlots.level1},
                }
                : undefined,
        },
    };
}
