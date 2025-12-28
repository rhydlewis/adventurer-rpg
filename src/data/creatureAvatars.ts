/**
 * Creature avatar mappings
 * Images are located in /public/assets/creatures/
 */

type CreatureName = 'Skeleton' | 'Bandit' | 'Goblin' | 'Cultist' | 'Spider' | 'Wraith' | 'Hobgoblin' | 'Werewolf' | 'Lich' | 'Zombie' | 'Rat' | 'Boar';

export const CREATURE_AVATARS: Partial<Record<CreatureName, string>> = {
  Skeleton: 'monster_skeleton_00009.png',
  Bandit: 'human_bandit.png',
  Goblin: 'goblin.png',
  Cultist: 'cultist.png',
  Spider: 'spider.png',
  Wraith: 'monster_spirit_00014.png',
  Hobgoblin: 'hobgoblin.png',
  Werewolf: 'werewolf.png',
  Lich: 'lich.png',
  Zombie: 'zombie.png',
  Rat: 'rat.png',
  Boar: 'boar.png'
} as const;

export const DEFAULT_CREATURE_AVATAR = 'monster_generic.png';
