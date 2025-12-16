import type { Background } from '../types';

/**
 * Background Database
 * One background per class for validation campaign
 */

export const BACKGROUNDS: Record<string, Background> = {
  'border-guard': {
    id: 'border-guard',
    name: 'Border Guard',
    class: 'Fighter',
    description: "You enforced the law on the kingdom's frontier.",
    dialogueTags: ['authority', 'law', 'military'],
    attributeBias: {
      STR: 14,
      DEX: 10,
      CON: 13,
      INT: 8,
      WIS: 12,
      CHA: 9,
    },
    taggedSkills: ['Intimidate', 'Perception'],
    startingQuirk: 'auto-block-first-attack',
    puzzleAbility: 'physical-shortcut',
  },

  'street-urchin': {
    id: 'street-urchin',
    name: 'Street Urchin',
    class: 'Rogue',
    description: "You survived by wit and stealth in the city's shadows.",
    dialogueTags: ['deception', 'streetwise', 'poverty'],
    attributeBias: {
      STR: 8,
      DEX: 14,
      CON: 10,
      INT: 12,
      WIS: 11,
      CHA: 11,
    },
    taggedSkills: ['Stealth', 'Perception'],
    startingQuirk: 'start-hidden',
    puzzleAbility: 'lock-hints',
  },

  'academy-dropout': {
    id: 'academy-dropout',
    name: 'Academy Dropout',
    class: 'Wizard',
    description: 'You left formal training but kept the knowledge.',
    dialogueTags: ['arcane', 'academia', 'arrogance'],
    attributeBias: {
      STR: 8,
      DEX: 12,
      CON: 10,
      INT: 14,
      WIS: 12,
      CHA: 10,
    },
    taggedSkills: ['Arcana', 'Perception'],
    startingQuirk: 'bonus-cantrip-turn-1',
    puzzleAbility: 'arcane-sight',
  },

  'temple-acolyte': {
    id: 'temple-acolyte',
    name: 'Temple Acolyte',
    class: 'Cleric',
    description: 'You served the faith and carry its blessing.',
    dialogueTags: ['faith', 'morality', 'healing'],
    attributeBias: {
      STR: 10,
      DEX: 10,
      CON: 12,
      INT: 8,
      WIS: 14,
      CHA: 12,
    },
    taggedSkills: ['Medicine', 'Perception'],
    startingQuirk: 'healing-aura',
    puzzleAbility: 'sense-corruption',
  },
};

// Helper to get background by class
export function getBackgroundByClass(className: 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric'): Background {
  const background = Object.values(BACKGROUNDS).find(bg => bg.class === className);
  if (!background) {
    throw new Error(`No background found for class: ${className}`);
  }
  return background;
}
