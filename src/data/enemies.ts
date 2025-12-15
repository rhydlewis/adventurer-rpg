import type { Creature } from '../types/combat';
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from './creatureAvatars';

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
  },
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
    attributes: { ...enemy.attributes },
    saves: { ...enemy.saves },
    skills: { ...enemy.skills },
    feats: [...enemy.feats],
    equipment: {
      weapon: { ...enemy.equipment.weapon },
      armor: { ...enemy.equipment.armor },
      shield: { ...enemy.equipment.shield },
      items: [...enemy.equipment.items],
    },
    resources: {
      abilities: [...enemy.resources.abilities],
      spellSlots: enemy.resources.spellSlots
        ? {
            level0: { ...enemy.resources.spellSlots.level0 },
            level1: { ...enemy.resources.spellSlots.level1 },
          }
        : undefined,
    },
  };
}
