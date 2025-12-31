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
    id: `${classDef.startingWeapon}-${Date.now()}`,
  };
  // Add Dagger as second weapon for Fighter (for testing weapon swap)
  const dagger = className === 'Fighter'
      ? {
        ...WEAPONS['dagger'],
        id: `dagger-${Date.now()}-2`, // Different timestamp to ensure unique ID
      }
      : null;
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
    // Map legacy feat names to new feat IDs
    const featNameToId: Record<string, string> = {
      'Power Attack': 'power_attack',
      'Weapon Focus': 'weapon_focus',
      'Toughness': 'toughness',
      'Improved Initiative': 'improved_initiative',
      'Combat Reflexes': 'combat_reflexes',
    };
    const featId = featNameToId[selectedFeat];
    if (featId && FEATS[featId]) {
      feats.push(FEATS[featId]);
    }
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
      weapons: dagger ? [weapon, dagger] : [weapon], // Fighter gets Dagger too
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

/**
 * Create a default test character for quick testing
 * Creates a Level 3 Fighter with balanced stats
 */
export function createDefaultTestCharacter(): Character {
  // Balanced attributes for testing
  const attributes: Attributes = {
    STR: 14,
    DEX: 13,
    CON: 14,
    INT: 12,
    WIS: 13,
    CHA: 10,
  };

  // Balanced skill ranks
  const skillRanks: SkillRanks = {
    Athletics: 3,
    Stealth: 2,
    Perception: 3,
    Arcana: 1,
    Medicine: 1,
    Intimidate: 2,
  };

  // Create base character
  const baseCharacter = createCharacter({
    name: 'Test Character',
    avatarPath: '/portraits/fighter-test.png',
    class: 'Fighter',
    attributes,
    skillRanks,
    selectedFeat: 'Power Attack',
  });

  // Boost to level 3 for more HP and versatility
  return {
    ...baseCharacter,
    level: 3,
    maxHp: 30, // Enough to survive some traps but can still test death
    hp: 30,
    gold: 150, // Enough to test merchant
    bab: 3, // Level 3 BAB for Fighter
  };
}

/**
 * Create Eldric Starweave - Level 3 Wizard for spell testing
 */
export function createWizardTestCharacter(): Character {
  // High INT and DEX for wizard
  const attributes: Attributes = {
    STR: 8,
    DEX: 14,
    CON: 12,
    INT: 16,
    WIS: 10,
    CHA: 10,
  };

  // Wizard skill ranks
  const skillRanks: SkillRanks = {
    Athletics: 0,
    Stealth: 2,
    Perception: 2,
    Arcana: 4,
    Medicine: 1,
    Intimidate: 0,
  };

  // Create base wizard character
  const baseCharacter = createCharacter({
    name: 'Eldric Starweave',
    avatarPath: '/portraits/wizard-test.png',
    class: 'Wizard',
    attributes,
    skillRanks,
    selectedFeat: 'Improved Initiative',
  });

  // Boost to level 3 and add wizard feats for testing
  return {
    ...baseCharacter,
    level: 3,
    maxHp: 18, // Wizard d6 HD: 6 + (2 × 4) + (3 × CON mod +1) = 6 + 8 + 3 = 17, round up to 18
    hp: 18,
    bab: 1, // Wizard has slow BAB progression (0.5 per level)
    feats: [
      FEATS['improved_initiative'], // Starting feat
      FEATS['arcane_strike'], // Passive: +1 damage, weapons count as magic
      FEATS['empower_spell'], // Ability: +50% spell damage, consumes spell slot
      FEATS['disruptive_spell'], // Ability: applies -4 attack penalty, consumes spell slot (requires BAB 3, but we're allowing it for testing)
    ],
  };
}

/**
 * Create Brother Bosnod - Level 4 Cleric for spell and feat testing
 * Level 4 gives BAB 3, which unlocks Channel Smite and Defensive Channel
 */
export function createClericTestCharacter(): Character {
  // High WIS and CON for cleric, boosted STR for Power Attack
  const attributes: Attributes = {
    STR: 14, // Boosted to 14 to meet Power Attack prerequisite (STR 13)
    DEX: 10,
    CON: 14,
    INT: 10,
    WIS: 16,
    CHA: 12,
  };

  // Cleric skill ranks
  const skillRanks: SkillRanks = {
    Athletics: 1,
    Stealth: 0,
    Perception: 3,
    Arcana: 1,
    Medicine: 4,
    Intimidate: 1,
  };

  // Create base cleric character
  const baseCharacter = createCharacter({
    name: 'Brother Bosnod',
    avatarPath: '/portraits/cleric-test.png',
    class: 'Cleric',
    attributes,
    skillRanks,
    selectedFeat: 'Toughness',
  });

  // Boost to level 4 to get BAB 3 (required for Channel Smite and Defensive Channel)
  return {
    ...baseCharacter,
    level: 4,
    maxHp: 32, // Cleric d8 HD: 8 + (3 × 5) + (4 × CON mod +2) = 8 + 15 + 8 = 31, round up to 32
    hp: 32,
    bab: 3, // Cleric has medium BAB progression (0.75 per level), level 4 = BAB 3
    feats: [
      FEATS['toughness'], // Starting feat: +3 HP per level
      FEATS['power_attack'], // Attack variant: -2 ATK, +4 DMG (requires STR 13)
      FEATS['guided_hand'], // Attack variant: Use WIS for attack rolls
      FEATS['channel_smite'], // Attack variant: +2d6 holy damage, consumes Channel Energy (requires BAB 3)
      FEATS['defensive_channel'], // Ability: +4 AC, consumes Channel Energy (requires BAB 3)
    ],
  };
}
