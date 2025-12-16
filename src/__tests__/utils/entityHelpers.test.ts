import { describe, it, expect } from 'vitest';
import { getEntityDisplayClass, isCharacter, isCreature } from '../../utils/entityHelpers';
import type { Character } from '../../types';
import type { Creature } from '../../types/creature';
import type { Entity } from '../../types/entity';

describe('Entity Helpers', () => {
  // Mock Character
  const mockCharacter: Character = {
    name: 'Test Fighter',
    avatarPath: '/avatars/fighter.png',
    level: 1,
    class: 'Fighter',
    attributes: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 8 },
    hp: 12,
    maxHp: 12,
    ac: 16,
    bab: 1,
    saves: { fortitude: 4, reflex: 2, will: 1 },
    skills: {
      Athletics: 0,
      Stealth: 0,
      Perception: 0,
      Arcana: 0,
      Medicine: 0,
      Intimidate: 0,
    },
    feats: [],
    equipment: {
      weapon: null,
      armor: null,
      shield: null,
      items: [],
    },
    resources: {
      abilities: [],
    },
  };

  // Mock Creature
  const mockCreature: Creature = {
    name: 'Test Skeleton',
    avatarPath: '/avatars/skeleton.png',
    level: 1,
    creatureClass: 'Undead',
    attributes: { STR: 13, DEX: 15, CON: 10, INT: 6, WIS: 10, CHA: 3 },
    hp: 8,
    maxHp: 8,
    ac: 15,
    bab: 1,
    saves: { fortitude: 2, reflex: 4, will: 2 },
    skills: {
      Athletics: 0,
      Stealth: 0,
      Perception: 0,
      Arcana: 0,
      Medicine: 0,
      Intimidate: 0,
    },
    feats: [],
    equipment: {
      weapon: null,
      armor: null,
      shield: null,
      items: [],
    },
    resources: {
      abilities: [],
    },
    lootTableId: 'skeleton_loot',
  };

  describe('getEntityDisplayClass', () => {
    it('should return class for Character', () => {
      const result = getEntityDisplayClass(mockCharacter);
      expect(result).toBe('Fighter');
    });

    it('should return creatureClass for Creature', () => {
      const result = getEntityDisplayClass(mockCreature);
      expect(result).toBe('Undead');
    });

    it('should return Unknown for malformed entity', () => {
      const malformed = { ...mockCharacter } as Entity;
      delete (malformed as any).class;
      const result = getEntityDisplayClass(malformed);
      expect(result).toBe('Unknown');
    });
  });

  describe('isCharacter', () => {
    it('should return true for Character', () => {
      expect(isCharacter(mockCharacter)).toBe(true);
    });

    it('should return false for Creature', () => {
      expect(isCharacter(mockCreature)).toBe(false);
    });

    it('should enable type narrowing', () => {
      const entity: Entity = mockCharacter;
      if (isCharacter(entity)) {
        // TypeScript should know entity.class exists
        expect(entity.class).toBe('Fighter');
      }
    });
  });

  describe('isCreature', () => {
    it('should return true for Creature', () => {
      expect(isCreature(mockCreature)).toBe(true);
    });

    it('should return false for Character', () => {
      expect(isCreature(mockCharacter)).toBe(false);
    });

    it('should enable type narrowing', () => {
      const entity: Entity = mockCreature;
      if (isCreature(entity)) {
        // TypeScript should know entity.creatureClass exists
        expect(entity.creatureClass).toBe('Undead');
      }
    });
  });
});
