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
      Intimidate: 2,
      Stealth: 4,
    },
    feats: [],
    equipment: {
      weapon: {
        name: 'Short Sword',
        damage: '1d6',
        attackStat: 'str',
        damageStat: 'str',
      },
      armor: {
        name: 'Leather Armor',
        acBonus: 1,
      },
      shield: null,
    },
    resources: {
      classAbilities: {},
      spells: null,
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
    skills: {},
    feats: [],
    equipment: {
      weapon: {
        name: 'Claw',
        damage: '1d6',
        attackStat: 'str',
        damageStat: 'str',
      },
      armor: {
        name: 'Natural Armor',
        acBonus: 2,
      },
      shield: {
        name: 'Rusty Shield',
        acBonus: 1,
      },
    },
    resources: {
      classAbilities: {},
      spells: null,
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
      weapon: enemy.equipment.weapon ? { ...enemy.equipment.weapon } : null,
      armor: enemy.equipment.armor ? { ...enemy.equipment.armor } : null,
      shield: enemy.equipment.shield ? { ...enemy.equipment.shield } : null,
    },
    resources: {
      classAbilities: { ...enemy.resources.classAbilities },
      spells: enemy.resources.spells
        ? {
            slotsRemaining: { ...enemy.resources.spells.slotsRemaining },
          }
        : null,
    },
  };
}
