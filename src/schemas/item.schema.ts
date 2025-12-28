import { z } from 'zod';

/**
 * Item type enum
 */
const ItemTypeSchema = z.enum(['consumable', 'quest', 'equipment', 'treasure']);

/**
 * Item effect schemas (discriminated union based on type)
 */
const HealEffectSchema = z.object({
  type: z.literal('heal'),
  amount: z.string().regex(/^\d+d\d+(\+\d+)?$/, 'Heal amount must be dice notation'),
});

const EscapeEffectSchema = z.object({
  type: z.literal('escape'),
});

const RemoveConditionEffectSchema = z.object({
  type: z.literal('remove-condition'),
  condition: z.string().min(1),
});

const BuffEffectSchema = z.object({
  type: z.literal('buff'),
  stat: z.string().min(1), // Allows 'STR', 'attack', etc.
  bonus: z.number().int(),
  duration: z.number().int(),
});

const DamageEffectSchema = z.object({
  type: z.literal('damage'),
  amount: z.string().regex(/^\d+d\d+(\+\d+)?$/, 'Damage amount must be dice notation'),
  damageType: z.enum(['slashing', 'piercing', 'bludgeoning', 'fire', 'cold', 'lightning', 'poison']),
});

const SpellEffectSchema = z.object({
  type: z.literal('spell'),
  spellId: z.string().min(1),
});

const ItemEffectSchema = z.discriminatedUnion('type', [
  HealEffectSchema,
  EscapeEffectSchema,
  RemoveConditionEffectSchema,
  BuffEffectSchema,
  DamageEffectSchema,
  SpellEffectSchema,
]);

/**
 * Schema for a single item definition
 *
 * Validates:
 * - All required fields present
 * - Item type is valid
 * - Effect structure matches type
 * - Value is non-negative
 */
export const ItemSchema = z.object({
  id: z.string().min(1, 'Item ID cannot be empty'),
  name: z.string().min(1, 'Item name cannot be empty'),
  description: z.string().min(1, 'Description cannot be empty'),
  type: ItemTypeSchema,
  usableInCombat: z.boolean(),
  effect: ItemEffectSchema.optional(),
  value: z.number().int().nonnegative('Value cannot be negative'),
});

/**
 * Schema for the items.json file structure
 *
 * Format: Record<itemId, Item>
 */
export const ItemsSchema = z.record(
  z.string().min(1, 'Item key cannot be empty'),
  ItemSchema
);

/**
 * TypeScript type inferred from schema
 */
export type ItemSchemaType = z.infer<typeof ItemSchema>;
export type ItemEffectSchemaType = z.infer<typeof ItemEffectSchema>;
