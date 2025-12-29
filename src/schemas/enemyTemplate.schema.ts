import { z } from 'zod';

/**
 * Zod schema for enemy template validation
 * Provides build-time validation of enemies.json data
 */

// Attribute range validation: 1-30 with min <= max
const AttributeRangeSchema = z.object({
  min: z.number().int().min(1).max(30),
  max: z.number().int().min(1).max(30),
}).refine(data => data.min <= data.max, {
  message: "min must be <= max"
});

// Weapon schema (for inline weapon objects - backward compatibility)
const WeaponSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1), // Changed from enum to string to match Equipment type
  damage: z.string().regex(/^\d+d\d+$/, {
    message: "Damage must be in dice notation format (e.g., '1d6', '2d8')"
  }),
  damageType: z.enum(['slashing', 'piercing', 'bludgeoning']),
  finesse: z.boolean(),
  description: z.string(),
  proficiencyRequired: z.enum(['simple', 'martial', 'martial-finesse']).optional(),
});

// Armor schema (for inline armor objects - backward compatibility)
const ArmorSchema = z.object({
  name: z.string().min(1), // Changed from enum to string to match Equipment type
  baseAC: z.number().int().min(8).max(20),
  maxDexBonus: z.number().int().nullable(),
  description: z.string(),
  proficiencyRequired: z.enum(['light', 'medium', 'heavy']).optional(),
});

// Shield schema
const ShieldSchema = z.object({
  equipped: z.boolean(),
  acBonus: z.number().int().min(0).max(5),
});

// Item effect schemas
const ItemEffectSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heal'), amount: z.string() }),
  z.object({
    type: z.literal('buff'),
    stat: z.string(),
    bonus: z.number(),
    duration: z.number()
  }),
  z.object({ type: z.literal('damage'), amount: z.string() }),
  z.object({ type: z.literal('escape') }),
  z.object({ type: z.literal('spell'), spellName: z.string() }),
  z.object({ type: z.literal('remove-condition'), condition: z.string() }),
]);

// Inventory item schema
const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['consumable', 'equipment', 'quest']),
  usableInCombat: z.boolean(),
  effect: ItemEffectSchema.optional(),
  value: z.number().min(0),
  quantity: z.number().int().positive().optional(),
});

// Equipment schema - supports both reference-based and inline patterns
const EquipmentSchema = z.object({
  // New reference-based approach (weaponId/armorId)
  weaponId: z.string().min(1).nullable().optional(),
  armorId: z.string().min(1).nullable().optional(),

  // Legacy inline approach (for backward compatibility)
  weapon: WeaponSchema.nullable().optional(),
  weapons: z.array(WeaponSchema).optional(),
  armor: ArmorSchema.nullable().optional(),

  // Common fields
  shield: ShieldSchema.nullable(),
  items: z.array(InventoryItemSchema),
}).refine(
  (data) => {
    // Must have EITHER weaponId OR weapon/weapons (or neither if no weapon)
    const hasWeaponId = data.weaponId !== undefined;
    const hasInlineWeapon = data.weapon !== undefined || (data.weapons && data.weapons.length > 0);

    // Valid combinations:
    // 1. weaponId only
    // 2. weapon/weapons only
    // 3. neither (no weapon)
    // Invalid: both weaponId AND weapon/weapons
    return !(hasWeaponId && hasInlineWeapon);
  },
  {
    message: 'Equipment cannot specify both weaponId and inline weapon/weapons',
  }
).refine(
  (data) => {
    // Must have EITHER armorId OR armor (or neither for no armor)
    const hasArmorId = data.armorId !== undefined;
    const hasInlineArmor = data.armor !== undefined;

    // Valid combinations:
    // 1. armorId only
    // 2. armor only
    // 3. neither (no armor)
    // Invalid: both armorId AND armor
    return !(hasArmorId && hasInlineArmor);
  },
  {
    message: 'Equipment cannot specify both armorId and inline armor',
  }
);

// Skills schema
const SkillRanksSchema = z.object({
  Athletics: z.number().int().min(0),
  Stealth: z.number().int().min(0),
  Perception: z.number().int().min(0),
  Arcana: z.number().int().min(0),
  Medicine: z.number().int().min(0),
  Intimidate: z.number().int().min(0),
});

// Legacy feat effect schema (for backward compatibility)
const LegacyFeatEffectSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('toggle'), name: z.enum(['powerAttack']) }),
  z.object({ type: z.literal('passive'), stat: z.enum(['attack', 'hp', 'initiative']), bonus: z.number() }),
  z.object({ type: z.literal('conditional'), condition: z.enum(['dodge']), stat: z.enum(['ac']), bonus: z.number() }),
]);

// New feat effects schema
const FeatEffectsSchema = z.object({
  attackModifier: z.number().optional(),
  damageModifier: z.number().optional(),
  acModifier: z.number().optional(),
  bonusDamage: z.string().optional(),
  damageType: z.string().optional(),
  bleedDamage: z.string().optional(),
  useWisdomForAttack: z.boolean().optional(),
  useDexForAttack: z.boolean().optional(),
  addDexToDamage: z.boolean().optional(),
  damageMultiplier: z.number().optional(),
  spellDamageMultiplier: z.number().optional(),
  criticalThreatRangeBonus: z.number().optional(),
  appliesCondition: z.string().optional(),
  conditionDuration: z.number().optional(),
  conditionEffect: z.object({
    attackPenalty: z.number().optional(),
    damagePerTurn: z.string().optional(),
  }).optional(),
  consumesResource: z.object({
    type: z.enum(['channel_energy', 'spell_slot']),
    amount: z.number(),
    level: z.number().optional(),
  }).optional(),
  setsState: z.enum(['empowered', 'disruptiveSpell']).optional(),
  duration: z.enum(['turn', 'nextTurn', 'nextSpell', 'nextAttack', 'permanent']),
});

// Feat schema - supports both old and new structures
const FeatSchema = z.union([
  // Old structure (for backward compatibility)
  z.object({
    name: z.enum(['Power Attack', 'Weapon Focus', 'Toughness', 'Improved Initiative', 'Combat Reflexes']),
    description: z.string(),
    effect: LegacyFeatEffectSchema,
  }),
  // New structure
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.enum(['offensive', 'defensive', 'utility']),
    type: z.enum(['attack_variant', 'passive', 'ability']),
    prerequisites: z.object({
      bab: z.number().optional(),
      attributes: z.record(z.string(), z.number()).optional(),
      feats: z.array(z.string()).optional(),
      classRestrictions: z.array(z.enum(['Fighter', 'Rogue', 'Wizard', 'Cleric'])).optional(),
    }),
    effects: FeatEffectsSchema,
  }),
]);

// Taunts schema (all fields optional)
const TauntsSchema = z.object({
  onCombatStart: z.array(z.string()).optional(),
  onPlayerMiss: z.array(z.string()).optional(),
  onEnemyHit: z.array(z.string()).optional(),
  onLowHealth: z.array(z.string()).optional(),
}).optional();

// Main enemy template schema
const EnemyTemplateSchema = z.object({
  id: z.string().min(1),
  baseName: z.string().min(1),
  creatureClass: z.enum(['Beast', 'Humanoid', 'Undead']),
  avatarPaths: z.array(z.string()).min(1, {
    message: "avatarPaths must contain at least one avatar key"
  }),
  levelRange: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }).refine(data => data.min <= data.max, {
    message: "levelRange.min must be <= levelRange.max"
  }),
  attributeRanges: z.object({
    STR: AttributeRangeSchema,
    DEX: AttributeRangeSchema,
    CON: AttributeRangeSchema,
    INT: AttributeRangeSchema,
    WIS: AttributeRangeSchema,
    CHA: AttributeRangeSchema,
  }),
  baseClass: z.enum(['Fighter', 'Rogue', 'Wizard', 'Cleric']),
  equipment: EquipmentSchema,
  skills: SkillRanksSchema,
  feats: z.array(FeatSchema),
  taunts: TauntsSchema,
  lootTableId: z.string().min(1),
});

// Export the schema for a record of enemy templates
export const EnemyTemplatesSchema = z.record(z.string(), EnemyTemplateSchema);

// Type inference for TypeScript
export type ValidatedEnemyTemplate = z.infer<typeof EnemyTemplateSchema>;
export type ValidatedEnemyTemplates = z.infer<typeof EnemyTemplatesSchema>;
