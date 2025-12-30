import { z } from 'zod';

/**
 * Spell level enum (0 = cantrip, 1-9 = leveled spells)
 */
const SpellLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
]);

/**
 * Spell school enum
 */
const SpellSchoolSchema = z.enum([
  'evocation',
  'conjuration',
  'enchantment',
  'abjuration',
  'transmutation',
  'necromancy',
  'divination',
  'illusion',
]);

/**
 * Damage type enum
 */
const DamageTypeSchema = z.enum([
  'cold',
  'fire',
  'acid',
  'radiant',
  'force',
  'necrotic',
  'thunder',
  'lightning',
  'poison',
  'slashing',
  'piercing',
  'bludgeoning',
]);

/**
 * Spell target enum
 */
const SpellTargetSchema = z.enum(['self', 'single', 'area']);

/**
 * Save type enum
 */
const SaveTypeSchema = z.enum(['fortitude', 'reflex', 'will']);

/**
 * Spell effect schemas (discriminated union based on type)
 */
const DamageEffectSchema = z.object({
  type: z.literal('damage'),
  damageDice: z.string().regex(/^\d+d\d+(\+\d+)?$/, 'Damage must be dice notation'),
  damageType: DamageTypeSchema,
  // Optional condition application (e.g., Paralyzing Touch does damage + stun)
  conditionType: z.string().min(1).optional(),
  conditionDuration: z.number().int().positive().optional(),
});

const HealEffectSchema = z.object({
  type: z.literal('heal'),
  healDice: z.string().regex(/^\d+d\d+(\+\d+)?$/, 'Heal must be dice notation'),
});

const BuffEffectSchema = z.object({
  type: z.literal('buff'),
  buffType: z.enum(['attack', 'save', 'ac', 'damage']),
  buffAmount: z.number().int(),
  buffDuration: z.number().int().positive(),
});

const ConditionEffectSchema = z.object({
  type: z.literal('condition'),
  conditionType: z.string().min(1),
  conditionDuration: z.number().int().positive(),
});

const SpellEffectSchema = z.discriminatedUnion('type', [
  DamageEffectSchema,
  HealEffectSchema,
  BuffEffectSchema,
  ConditionEffectSchema,
]);

/**
 * Saving throw schema
 */
const SavingThrowSchema = z.object({
  type: SaveTypeSchema,
  onSuccess: z.enum(['negates', 'half', 'partial']),
});

/**
 * Schema for a single spell definition
 *
 * Validates:
 * - All required fields present
 * - Spell level is valid (0-9)
 * - School and target are valid enums
 * - Effect structure matches type
 * - Saving throw (if present) is valid
 */
export const SpellSchema = z.object({
  id: z.string().min(1, 'Spell ID cannot be empty'),
  name: z.string().min(1, 'Spell name cannot be empty'),
  level: SpellLevelSchema,
  school: SpellSchoolSchema,
  target: SpellTargetSchema,
  effect: SpellEffectSchema,
  savingThrow: SavingThrowSchema.optional(),
  description: z.string().min(1, 'Description cannot be empty'),
});

/**
 * Schema for the spells.json file structure
 *
 * Format: Record<spellId, Spell>
 */
export const SpellsSchema = z.record(
  z.string().min(1, 'Spell key cannot be empty'),
  SpellSchema
);

/**
 * TypeScript types inferred from schema
 */
export type SpellSchemaType = z.infer<typeof SpellSchema>;
export type SpellEffectSchemaType = z.infer<typeof SpellEffectSchema>;
