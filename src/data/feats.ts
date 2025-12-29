import type { Feat } from '../types/feat';
import type { CharacterClass } from '../types/character';

/**
 * Complete database of all combat feats (16 total: 4 per class)
 * Organized by class: Fighter, Rogue, Wizard, Cleric
 */
export const FEATS: Record<string, Feat> = {
  // ========================================
  // FIGHTER FEATS
  // ========================================

  power_attack: {
    id: 'power_attack',
    name: 'Power Attack',
    description: 'Trade accuracy for devastating damage. -2 attack, +4 damage.',
    category: 'offensive',
    type: 'attack_variant',
    prerequisites: {
      attributes: { STR: 13 },
      classRestrictions: ['Fighter', 'Cleric'],
    },
    effects: {
      attackModifier: -2,
      damageModifier: 4,
      duration: 'turn',
    },
  },

  vital_strike: {
    id: 'vital_strike',
    name: 'Vital Strike',
    description: 'Make one devastating strike, rolling weapon damage dice twice.',
    category: 'offensive',
    type: 'attack_variant',
    prerequisites: {
      bab: 6,
      classRestrictions: ['Fighter'],
    },
    effects: {
      damageMultiplier: 2, // Roll weapon dice twice, add modifiers once
      duration: 'turn',
    },
  },

  bloody_assault: {
    id: 'bloody_assault',
    name: 'Bloody Assault',
    description: 'Savage strike that causes ongoing bleeding. -2 attack, applies 1d4 bleed.',
    category: 'offensive',
    type: 'attack_variant',
    prerequisites: {
      feats: ['power_attack'],
      bab: 6,
      classRestrictions: ['Fighter'],
    },
    effects: {
      attackModifier: -2,
      bleedDamage: '1d4',
      appliesCondition: 'Bleeding',
      conditionDuration: 3,
      conditionEffect: {
        damagePerTurn: '1d4',
      },
      duration: 'turn',
    },
  },

  combat_expertise: {
    id: 'combat_expertise',
    name: 'Combat Expertise',
    description: 'Trade attack accuracy for improved defense. -2 attack, +2 AC.',
    category: 'defensive',
    type: 'attack_variant',
    prerequisites: {
      attributes: { INT: 13 },
    },
    effects: {
      attackModifier: -2,
      acModifier: 2,
      duration: 'turn',
    },
  },

  // ========================================
  // ROGUE FEATS
  // ========================================

  weapon_finesse: {
    id: 'weapon_finesse',
    name: 'Weapon Finesse',
    description: 'Use DEX instead of STR for attack rolls with light weapons.',
    category: 'utility',
    type: 'passive',
    prerequisites: {
      classRestrictions: ['Rogue'],
    },
    effects: {
      useDexForAttack: true,
      duration: 'permanent',
    },
  },

  precision_strike: {
    id: 'precision_strike',
    name: 'Precision Strike',
    description: 'Strike with deadly accuracy. Add DEX modifier to damage (in addition to STR).',
    category: 'offensive',
    type: 'passive',
    prerequisites: {
      bab: 3,
      classRestrictions: ['Rogue'],
    },
    effects: {
      addDexToDamage: true,
      duration: 'permanent',
    },
  },

  critical_focus: {
    id: 'critical_focus',
    name: 'Critical Focus',
    description: 'You know where to strike. Critical threat range increased by 1 (20 → 19-20).',
    category: 'offensive',
    type: 'passive',
    prerequisites: {
      bab: 5,
      classRestrictions: ['Rogue'],
    },
    effects: {
      criticalThreatRangeBonus: 1,
      duration: 'permanent',
    },
  },

  // ========================================
  // WIZARD FEATS
  // ========================================

  arcane_strike: {
    id: 'arcane_strike',
    name: 'Arcane Strike',
    description: 'Channel arcane power into your weapon. +1 damage, weapons count as magic.',
    category: 'utility',
    type: 'passive',
    prerequisites: {
      classRestrictions: ['Wizard'],
    },
    effects: {
      damageModifier: 1,
      duration: 'permanent',
    },
  },

  empower_spell: {
    id: 'empower_spell',
    name: 'Empower Spell',
    description: 'Supercharge your magic. Next spell deals +50% damage. Consumes 1st-level spell slot.',
    category: 'offensive',
    type: 'ability',
    prerequisites: {
      classRestrictions: ['Wizard'],
    },
    effects: {
      setsState: 'empowered',
      spellDamageMultiplier: 1.5,
      consumesResource: {
        type: 'spell_slot',
        amount: 1,
        level: 1,
      },
      duration: 'nextSpell',
    },
  },

  disruptive_spell: {
    id: 'disruptive_spell',
    name: 'Disruptive Spell',
    description: 'Weave disruption into magic. Next spell applies -4 attack penalty. Consumes 1st-level slot.',
    category: 'offensive',
    type: 'ability',
    prerequisites: {
      bab: 3,
      classRestrictions: ['Wizard'],
    },
    effects: {
      setsState: 'disruptiveSpell',
      appliesCondition: 'Disrupted',
      conditionDuration: 1,
      conditionEffect: {
        attackPenalty: -4,
      },
      consumesResource: {
        type: 'spell_slot',
        amount: 1,
        level: 1,
      },
      duration: 'nextSpell',
    },
  },

  // ========================================
  // CLERIC FEATS
  // ========================================

  guided_hand: {
    id: 'guided_hand',
    name: 'Guided Hand',
    description: 'Channel divine power through your weapon. Use WIS instead of STR for attack rolls.',
    category: 'offensive',
    type: 'attack_variant',
    prerequisites: {
      classRestrictions: ['Cleric'],
    },
    effects: {
      useWisdomForAttack: true,
      duration: 'turn',
    },
  },

  channel_smite: {
    id: 'channel_smite',
    name: 'Channel Smite',
    description: 'Infuse weapon with holy energy. Add +2d6 damage. Consumes 1 Channel Energy.',
    category: 'offensive',
    type: 'attack_variant',
    prerequisites: {
      bab: 3,
      classRestrictions: ['Cleric'],
    },
    effects: {
      bonusDamage: '2d6',
      damageType: 'holy',
      consumesResource: {
        type: 'channel_energy',
        amount: 1,
      },
      duration: 'turn',
    },
  },

  defensive_channel: {
    id: 'defensive_channel',
    name: 'Defensive Channel',
    description: 'Channel divine protection. Gain +4 AC until next turn. Consumes 1 Channel Energy.',
    category: 'defensive',
    type: 'ability',
    prerequisites: {
      bab: 3,
      classRestrictions: ['Cleric'],
    },
    effects: {
      acModifier: 4,
      appliesCondition: 'Defensive Channel',
      conditionDuration: 1,
      consumesResource: {
        type: 'channel_energy',
        amount: 1,
      },
      duration: 'nextTurn',
    },
  },
};

/**
 * Get all feats available to a character class
 */
export function getFeatsByClass(characterClass: CharacterClass): Feat[] {
  return Object.values(FEATS).filter((feat) => {
    if (!feat.prerequisites.classRestrictions) return true;
    return feat.prerequisites.classRestrictions.includes(characterClass);
  });
}

/**
 * Get attack variant feats (shown in attack selector)
 */
export function getAttackVariants(featIds: string[]): Feat[] {
  return featIds.map((id) => FEATS[id]).filter((feat) => feat && feat.type === 'attack_variant');
}

/**
 * Get ability feats (shown in Use Ability section)
 */
export function getAbilityFeats(featIds: string[]): Feat[] {
  return featIds.map((id) => FEATS[id]).filter((feat) => feat && feat.type === 'ability');
}

/**
 * Get passive feats (always active)
 */
export function getPassiveFeats(featIds: string[]): Feat[] {
  return featIds.map((id) => FEATS[id]).filter((feat) => feat && feat.type === 'passive');
}

// ========================================
// LEGACY EXPORTS (Backward Compatibility)
// ========================================

import type { FeatName } from '../types/feat';

/**
 * Legacy feat names for backward compatibility
 * @deprecated Use feat IDs instead
 */
export const FIGHTER_STARTING_FEATS: FeatName[] = [
  'Power Attack',
  'Weapon Focus',
  'Toughness',
  'Improved Initiative',
  'Combat Reflexes',
];
