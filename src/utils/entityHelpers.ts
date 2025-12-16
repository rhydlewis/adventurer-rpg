import type { Entity } from '../types/entity';
import type { Character } from '../types/character';
import type { Creature } from '../types/creature';

/**
 * Type guard: Check if entity is a Character
 */
export function isCharacter(entity: Entity): entity is Character {
  return 'class' in entity;
}

/**
 * Type guard: Check if entity is a Creature
 */
export function isCreature(entity: Entity): entity is Creature {
  return 'creatureClass' in entity;
}

/**
 * Get display name for entity's class/type
 * Returns the class for Characters, creatureClass for Creatures
 */
export function getEntityDisplayClass(entity: Entity): string {
  if (isCharacter(entity)) {
    return entity.class;
  }
  if (isCreature(entity)) {
    return entity.creatureClass;
  }
  return 'Unknown';
}
