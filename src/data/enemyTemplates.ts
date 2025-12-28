import type { EnemyTemplate } from '../types/enemyTemplate';
import { EnemyTemplatesSchema } from '../schemas/enemyTemplate.schema';
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from './creatureAvatars';
import enemiesJson from './enemies.json';

/**
 * Enemy Templates Loader
 *
 * Validates enemies.json at build-time using Zod schema and resolves
 * avatar keys to full paths. Any validation errors will cause the build to fail.
 */

// Validate JSON at module load (build-time validation)
const validatedData = EnemyTemplatesSchema.parse(enemiesJson);

// Transform: resolve avatar keys to full paths
export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = Object.fromEntries(
  Object.entries(validatedData).map(([id, template]) => [
    id,
    {
      ...template,
      avatarPaths: template.avatarPaths.map(
        (key) => CREATURE_AVATARS[key as keyof typeof CREATURE_AVATARS] || DEFAULT_CREATURE_AVATAR
      ),
    },
  ])
);

/**
 * Get enemy template by ID
 * @param id - The enemy template ID (e.g., 'bandit', 'skeleton')
 * @returns The enemy template, or null if not found
 */
export function getEnemyTemplate(id: string): EnemyTemplate | null {
    return ENEMY_TEMPLATES[id] ?? null;
}
