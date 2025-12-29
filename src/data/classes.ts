import type { CharacterClass } from '../types';
import type { Attributes } from '../types';
import type { ArmorType } from '../types';
import type { FeatName } from '../types';

export interface ClassDefinition {
  name: CharacterClass;
  description: string;
  hitDie: number; // Base HP per level (before CON modifier)
  baseHP: number; // Level 1 HP (buffed for solo play)
  babProgression: 'full' | 'medium' | 'low'; // +1/level, +3/4, +1/2
  baseBab: number; // Level 1 BAB
  saves: {
    fortitude: 'good' | 'poor';
    reflex: 'good' | 'poor';
    will: 'good' | 'poor';
  };
  baseSaves: {
    // Level 1 base saves
    fortitude: number;
    reflex: number;
    will: number;
  };
  recommendedAttributes: Attributes;
  startingWeapon: string; // Weapon ID (lowercase, e.g., "longsword", "rapier")
  startingArmor: ArmorType;
  hasShield: boolean;
  startingFeats?: FeatName[]; // Legacy: Only Fighter gets a feat at level 1
  defaultFeatIds?: string[]; // NEW: Default feat IDs for this class (for quick-start presets)
  proficiencies: {
    weapons: ('simple' | 'martial' | 'martial-finesse')[];
    armor: ('light' | 'medium' | 'heavy')[];
  };
}

export const CLASSES: Record<CharacterClass, ClassDefinition> = {
  Fighter: {
    name: 'Fighter',
    description:
      'Master of martial combat. High HP, heavy armor, and devastating melee attacks.',
    hitDie: 10,
    baseHP: 15, // 10 base + 5 CON (buffed)
    babProgression: 'full',
    baseBab: 1,
    saves: {
      fortitude: 'good',
      reflex: 'poor',
      will: 'poor',
    },
    baseSaves: {
      fortitude: 2,
      reflex: 0,
      will: 0,
    },
    recommendedAttributes: {
      STR: 16,
      DEX: 12,
      CON: 14,
      INT: 10,
      WIS: 10,
      CHA: 8,
    },
    startingWeapon: 'longsword',
    startingArmor: 'chainmail',
    hasShield: true,
    defaultFeatIds: ['power_attack', 'bloody_assault', 'combat_expertise', 'weapon_focus'],
    proficiencies: {
      weapons: ['simple', 'martial'],
      armor: ['light', 'medium', 'heavy'],
    },
  },
  Rogue: {
    name: 'Rogue',
    description:
      'Cunning striker who excels at precision attacks. Uses DEX for combat, sneak attack damage.',
    hitDie: 8,
    baseHP: 13, // 8 base + 5 CON (buffed)
    babProgression: 'medium',
    baseBab: 0,
    saves: {
      fortitude: 'poor',
      reflex: 'good',
      will: 'poor',
    },
    baseSaves: {
      fortitude: 0,
      reflex: 2,
      will: 0,
    },
    recommendedAttributes: {
      STR: 10,
      DEX: 16,
      CON: 12,
      INT: 14,
      WIS: 12,
      CHA: 10,
    },
    startingWeapon: 'rapier',
    startingArmor: 'leather',
    hasShield: false,
    defaultFeatIds: ['weapon_finesse', 'precision_strike', 'critical_focus', 'combat_reflexes'],
    proficiencies: {
      weapons: ['simple', 'martial-finesse'],
      armor: ['light'],
    },
  },
  Wizard: {
    name: 'Wizard',
    description:
      'Arcane spellcaster with devastating spells. Low HP, light armor, but powerful magic.',
    hitDie: 6,
    baseHP: 10, // 6 base + 4 CON (buffed)
    babProgression: 'low',
    baseBab: 0,
    saves: {
      fortitude: 'poor',
      reflex: 'poor',
      will: 'good',
    },
    baseSaves: {
      fortitude: 0,
      reflex: 0,
      will: 2,
    },
    recommendedAttributes: {
      STR: 8,
      DEX: 14,
      CON: 12,
      INT: 16,
      WIS: 12,
      CHA: 10,
    },
    startingWeapon: 'dagger',
    startingArmor: 'none',
    hasShield: false,
    defaultFeatIds: ['arcane_strike', 'empower_spell', 'disruptive_spell', 'improved_initiative'],
    proficiencies: {
      weapons: ['simple'],
      armor: [],
    },
  },
  Cleric: {
    name: 'Cleric',
    description:
      'Divine spellcaster with healing magic and solid combat ability. Balanced stats and heavy armor.',
    hitDie: 8,
    baseHP: 13, // 8 base + 5 CON (buffed)
    babProgression: 'medium',
    baseBab: 0,
    saves: {
      fortitude: 'good',
      reflex: 'poor',
      will: 'good',
    },
    baseSaves: {
      fortitude: 1,
      reflex: 0,
      will: 1,
    },
    recommendedAttributes: {
      STR: 14,
      DEX: 10,
      CON: 14,
      INT: 10,
      WIS: 16,
      CHA: 8,
    },
    startingWeapon: 'mace',
    startingArmor: 'chainmail',
    hasShield: true,
    defaultFeatIds: ['guided_hand', 'channel_smite', 'power_attack', 'toughness'],
    proficiencies: {
      weapons: ['simple'],
      armor: ['light', 'medium'],
    },
  },
};

// Get class definition
export function getClassDefinition(className: CharacterClass): ClassDefinition {
  return CLASSES[className];
}

// Calculate base AC from class (before DEX modifier)
export function getBaseAC(className: CharacterClass): number {
  const classDef = CLASSES[className];
  const armor = classDef.startingArmor;

  let baseAC = 0;
  if (armor === 'none') baseAC = 10;
  else if (armor === 'leather') baseAC = 12;
  else if (armor === 'chainmail') baseAC = 16;

  if (classDef.hasShield) baseAC += 2;

  return baseAC;
}
