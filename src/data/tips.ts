/**
 * Loading Screen Tips and Lore
 * Mix of gameplay tips and in-game world flavor text
 */

export interface Tip {
  text: string;
  category: 'gameplay' | 'lore';
}

export const TIPS: Tip[] = [
  // Gameplay Tips
  {
    text: 'Fighters heal with Second Wind, Rogues strike from shadows. Know your class strengths.',
    category: 'gameplay',
  },
  {
    text: 'A successful Reflex save means you take half damage from area effects.',
    category: 'gameplay',
  },
  {
    text: 'Natural 20s are automatic hits. Natural 1s are automatic misses.',
    category: 'gameplay',
  },
  {
    text: 'Touch AC ignores armor. Dexterity is your only defense against touch attacks.',
    category: 'gameplay',
  },
  {
    text: 'Some enemies resist physical damage but are vulnerable to magic.',
    category: 'gameplay',
  },
  {
    text: 'Initiative determines turn order. Dexterity helps you act first.',
    category: 'gameplay',
  },

  // World Lore
  {
    text: '"Magic is the gods\' fire. Use it carefully, lest you burn yourself." —Archmage Velrian',
    category: 'lore',
  },
  {
    text: 'The Whispering Woods are silent at midnight. That\'s when the dead walk.',
    category: 'lore',
  },
  {
    text: 'The Guild of Shadows denies its existence. That makes them excellent at their work.',
    category: 'lore',
  },
  {
    text: '"Every dungeon is someone\'s tomb. Respect the dead, or join them." —Adventurer\'s Code',
    category: 'lore',
  },
];

/**
 * Get a random tip for display on loading screens
 */
export function getRandomTip(): Tip {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}
