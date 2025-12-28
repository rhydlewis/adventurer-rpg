import { z } from 'zod';

/**
 * Weapon damage type enum
 */
const DamageTypeSchema = z.enum(['slashing', 'piercing', 'bludgeoning']);

/**
 * Weapon proficiency requirement enum
 */
const ProficiencyRequiredSchema = z.enum(['simple', 'martial', 'martial-finesse']);

/**
 * Schema for a single weapon definition
 *
 * Validates:
 * - Damage format: XdY or XdY+Z (e.g., "1d8" or "2d6+3")
 * - Damage type: slashing, piercing, or bludgeoning
 * - All required fields are non-empty strings where applicable
 */
export const WeaponSchema = z.object({
  name: z.string().min(1, 'Weapon name cannot be empty'),
  damage: z.string().regex(
    /^\d+d\d+(\+\d+)?$/,
    'Damage must be in format XdY or XdY+Z (e.g., "1d8" or "2d6+3")'
  ),
  damageType: DamageTypeSchema,
  finesse: z.boolean(),
  description: z.string().min(1, 'Description cannot be empty'),
  proficiencyRequired: ProficiencyRequiredSchema.optional(),
});

/**
 * Schema for the weapons.json file structure
 *
 * Format: Record<weaponId, Weapon>
 * Example: { "longsword": { name: "Longsword", ... }, "dagger": { ... } }
 */
export const WeaponsSchema = z.record(
  z.string().min(1, 'Weapon ID cannot be empty'),
  WeaponSchema
);

/**
 * TypeScript type inferred from schema
 */
export type WeaponSchemaType = z.infer<typeof WeaponSchema>;
