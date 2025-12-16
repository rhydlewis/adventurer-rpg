import type { DefiningTrait } from '../types';
import type { Character } from '../types';

/**
 * Defining Traits - Universal character traits
 * All classes can choose any trait
 */

export const TRAITS: Record<string, DefiningTrait> = {
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'You act first, think later.',
    upside: {
      description: '+2 initiative (act first in combat)',
      apply: (character: Character) => ({
        ...character,
        // Initiative bonus applied in combat resolution
      }),
    },
    downside: {
      description: '-2 AC if you act last in turn order',
      apply: (character: Character) => ({
        ...character,
        // Penalty applied conditionally in combat
      }),
    },
  },

  cautious: {
    id: 'cautious',
    name: 'Cautious',
    description: 'You observe before committing.',
    upside: {
      description: '+2 AC (harder to hit)',
      apply: (character: Character) => ({
        ...character,
        ac: character.ac + 2,
      }),
    },
    downside: {
      description: '-2 initiative (act later in combat)',
      apply: (character: Character) => ({
        ...character,
        // Initiative penalty applied in combat resolution
      }),
    },
  },

  'silver-tongued': {
    id: 'silver-tongued',
    name: 'Silver-Tongued',
    description: 'You talk your way through trouble.',
    upside: {
      description: '+2 to all Charisma-based checks (Persuade, Bluff, Intimidate)',
      apply: (character: Character) => ({
        ...character,
        // Applied during skill checks
      }),
    },
    downside: {
      description: 'NPC hostility escalates faster on failed social checks',
      apply: (character: Character) => ({
        ...character,
        // Narrative consequence, not mechanical
      }),
    },
  },
};

// Helper to get trait by ID
export function getTrait(id: string): DefiningTrait {
  const trait = TRAITS[id];
  if (!trait) {
    throw new Error(`Trait not found: ${id}`);
  }
  return trait;
}
