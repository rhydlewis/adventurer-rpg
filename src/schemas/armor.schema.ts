import { z } from 'zod';

/**
 * Schema for a single armor definition
 *
 * Validates:
 * - Base AC: 8-20 (reasonable range for D&D-style armor)
 * - Max DEX bonus: null (unlimited) or non-negative number
 * - All required fields are non-empty strings
 */
export const ArmorSchema = z.object({
  name: z.string().min(1, 'Armor name cannot be empty'),
  baseAC: z
    .number()
    .int()
    .min(8, 'Base AC must be at least 8')
    .max(20, 'Base AC cannot exceed 20'),
  maxDexBonus: z
    .number()
    .int()
    .nonnegative('Max DEX bonus cannot be negative')
    .nullable(),
  description: z.string().min(1, 'Description cannot be empty'),
  proficiencyRequired: z.enum(['light', 'medium', 'heavy']).optional(),
});

/**
 * Schema for the armors.json file structure
 *
 * Format: Record<armorId, Armor>
 * Example: { "leather": { name: "Leather", ... }, "chainmail": { ... } }
 */
export const ArmorsSchema = z.record(
  z.string().min(1, 'Armor ID cannot be empty'),
  ArmorSchema
);

/**
 * TypeScript type inferred from schema
 */
export type ArmorSchemaType = z.infer<typeof ArmorSchema>;
