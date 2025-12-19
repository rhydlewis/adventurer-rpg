import type { Character, CharacterClass } from '../types';
import type { Attributes } from '../types';
import type { SkillRanks } from '../types';
import type { FeatName } from '../types';
import { calculateModifier } from './dice';
import { CLASSES } from '../data/classes';
import { WEAPONS, ARMORS, STARTING_ITEMS } from '../data/equipment';
import { FEATS } from '../data/feats';

export interface CreateCharacterParams {
  name: string;
  avatarPath: string;
  class: CharacterClass;
  attributes: Attributes;
  skillRanks: SkillRanks;
  selectedFeat?: FeatName; // Only for Fighter at level 1
}

/**
 * Calculate max HP for a character at a given level
 * @param className Character class
 * @param _level Character level (unused at level 1, for future expansion)
 * @param _attributes Character attributes (unused at level 1, HP is fixed per plan)
 * @returns Maximum hit points
 */
export function calculateHP(
  className: CharacterClass,
  _level: number,
  _attributes: Attributes
): number {
  const classDef = CLASSES[className];
  // At level 1, use buffed baseHP from class definition (already includes CON bonus)
  return classDef.baseHP;
}

/**
 * Calculate AC for a character based on class and attributes
 * @param className Character class
 * @param attributes Character attributes
 * @returns Armor Class
 */
export function calculateAC(className: CharacterClass, attributes: Attributes): number {
  const classDef = CLASSES[className];
  const armor = ARMORS[classDef.startingArmor];
  const dexMod = calculateModifier(attributes.DEX);

  // Apply DEX modifier with armor cap
  let effectiveDexMod = dexMod;
  if (armor.maxDexBonus !== null) {
    effectiveDexMod = Math.min(dexMod, armor.maxDexBonus);
  }

  let ac = armor.baseAC + effectiveDexMod;

  // Add shield bonus if class has shield
  if (classDef.hasShield) {
    ac += 2; // Standard shield bonus
  }

  return ac;
}

/**
 * Calculate saving throws for a character
 * @param className Character class
 * @param attributes Character attributes
 * @returns Saving throw bonuses { fortitude, reflex, will }
 */
export function calculateSaves(
  className: CharacterClass,
  attributes: Attributes
): { fortitude: number; reflex: number; will: number } {
  const classDef = CLASSES[className];

  return {
    fortitude: classDef.baseSaves.fortitude + calculateModifier(attributes.CON),
    reflex: classDef.baseSaves.reflex + calculateModifier(attributes.DEX),
    will: classDef.baseSaves.will + calculateModifier(attributes.WIS),
  };
}

/**
 * Create a complete character from creation parameters
 * @param params Character creation parameters
 * @returns Fully initialized Character
 */
export function createCharacter(params: CreateCharacterParams): Character {
  const { name, avatarPath, class: className, attributes, skillRanks, selectedFeat } = params;
  const classDef = CLASSES[className];

  // Calculate derived stats
  const maxHp = calculateHP(className, 1, attributes);
  const ac = calculateAC(className, attributes);
  const saves = calculateSaves(className, attributes);

  // Build equipment
  const weapon = {
    ...WEAPONS[classDef.startingWeapon],
    id: `${classDef.startingWeapon.toLowerCase()}-${Date.now()}`,
  };
  const armor = ARMORS[classDef.startingArmor];
  const shield = {
    equipped: classDef.hasShield,
    acBonus: classDef.hasShield ? 2 : 0,
  };

  // Build starting items (all classes get 2 potions, some get extra)
  const items = [...STARTING_ITEMS.all];
  if (className === 'Rogue' && STARTING_ITEMS.Rogue) {
    items.push(...STARTING_ITEMS.Rogue);
  }
  if (className === 'Wizard' && STARTING_ITEMS.Wizard) {
    items.push(...STARTING_ITEMS.Wizard);
  }

  // Build feats array
  const feats = [];
  if (selectedFeat) {
    feats.push(FEATS[selectedFeat]);
  }

  // Build resources
  const resources: Character['resources'] = {
    abilities: [],
  };

  // Add spell slots for casters
  if (className === 'Wizard' || className === 'Cleric') {
    resources.spellSlots = {
      level0: { max: 99, current: 99 }, // Cantrips are unlimited
      level1: { max: 2, current: 2 }, // 2 level-1 spell slots per day
    };
  }

  // Add class-specific abilities
  if (className === 'Fighter') {
    resources.abilities.push({
      name: 'Second Wind',
      type: 'encounter',
      maxUses: 1,
      currentUses: 1,
      description: 'Heal 1d10+1 HP as a standard action',
    });
    // Power Attack is now a modified attack action, not a resource
  } else if (className === 'Rogue') {
    resources.abilities.push({
      name: 'Dodge',
      type: 'encounter',
      maxUses: 1,
      currentUses: 1,
      description: 'Gain +4 AC until your next turn',
    });
  } else if (className === 'Wizard') {
    resources.abilities.push({
      name: 'Arcane Recovery',
      type: 'encounter',
      maxUses: 1,
      currentUses: 1,
      description: 'Regain 1 spell slot when an enemy dies',
    });
  } else if (className === 'Cleric') {
    resources.abilities.push(
      {
        name: 'Channel Energy',
        type: 'daily',
        maxUses: 2,
        currentUses: 2,
        description: 'Heal self 1d6 HP',
      },
      {
        name: 'Turn Undead',
        type: 'daily',
        maxUses: 3,
        currentUses: 3,
        description: 'Undead makes Will save (DC 11) or flees 1d4 turns',
      }
    );
  }

  return {
    name,
    avatarPath,
    class: className,
    level: 1,
    attributes,
    hp: maxHp,
    maxHp,
    ac,
    bab: classDef.baseBab,
    saves,
    skills: skillRanks,
    feats,
    equipment: {
      weapon,
      weapons: [weapon], // All owned weapons (includes equipped)
      armor,
      shield,
      items,
    },
    resources,
    // Validation campaign fields
    gold: 100,
    inventory: [],
    maxInventorySlots: 10,
  };
}
