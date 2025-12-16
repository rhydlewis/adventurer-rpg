/**
 * Creature avatar mappings
 * Images are located in /public/assets/creatures/
 */

type CreatureName = 'Skeleton' | 'Bandit' | 'Goblin' | 'Wolf' | 'Cultist' | 'Spider' | 'Wraith';

export const CREATURE_AVATARS: Partial<Record<CreatureName, string>> = {
  Skeleton: 'monster_skeleton_00009.png',
  Bandit: 'human_bandit.png',
  // Add more as images become available:
  // Goblin: 'monster_goblin_00001.png',
  // Wolf: 'monster_wolf_00001.png',
  // Cultist: 'monster_cultist_00001.png',
  // Spider: 'monster_spider_00001.png',
  Wraith: 'monster_spirit_00014.png',
  Spider: 'spider.png'
} as const;

export const DEFAULT_CREATURE_AVATAR = 'monster_generic.png';
