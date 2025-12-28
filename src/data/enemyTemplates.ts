import type { EnemyTemplate } from '../types/enemyTemplate';
import { EnemyTemplatesSchema } from '../schemas/enemyTemplate.schema';
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from './creatureAvatars';
import { getWeapon, getArmor } from './equipment';
import enemiesJson from './enemies.json';

/**
 * Enemy Templates Loader
 *
 * Validates enemies.json at build-time using Zod schema and resolves:
 * - Avatar keys to full paths
 * - Equipment references (weaponId/armorId) to full objects
 *
 * Any validation errors will cause the build to fail.
 */

// Validate JSON at module load (build-time validation)
const validatedData = EnemyTemplatesSchema.parse(enemiesJson);

// Transform: resolve avatar keys and equipment references
export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = Object.fromEntries(
  Object.entries(validatedData).map(([id, template]) => {
    // Resolve avatars
    const avatarPaths = template.avatarPaths.map(
      (key) => CREATURE_AVATARS[key as keyof typeof CREATURE_AVATARS] || DEFAULT_CREATURE_AVATAR
    );

    // Resolve equipment references
    const equipment = { ...template.equipment };

    // Resolve weaponId to weapon object
    if ('weaponId' in equipment && equipment.weaponId) {
      const weapon = getWeapon(equipment.weaponId);
      if (!weapon) {
        throw new Error(`Enemy ${id}: weapon not found: ${equipment.weaponId}`);
      }
      equipment.weapon = weapon;
      equipment.weapons = [weapon]; // Populate weapons array
      delete equipment.weaponId; // Remove reference field
    } else if (!equipment.weapon) {
      equipment.weapon = null;
      equipment.weapons = [];
    }

    // Resolve armorId to armor object
    if ('armorId' in equipment && equipment.armorId) {
      const armor = getArmor(equipment.armorId);
      if (!armor) {
        throw new Error(`Enemy ${id}: armor not found: ${equipment.armorId}`);
      }
      equipment.armor = armor;
      delete equipment.armorId; // Remove reference field
    } else if (!equipment.armor) {
      equipment.armor = null;
    }

    return [
      id,
      {
        ...template,
        avatarPaths,
        equipment,
      },
    ];
  })
);

/**
 * Get enemy template by ID
 * @param id - The enemy template ID (e.g., 'bandit', 'skeleton')
 * @returns The enemy template, or null if not found
 */
export function getEnemyTemplate(id: string): EnemyTemplate | null {
    return ENEMY_TEMPLATES[id] ?? null;
}
