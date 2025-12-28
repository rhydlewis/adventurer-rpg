import { describe, it, expect } from 'vitest';
import type { Character } from '../../types';
import type { InventoryItem } from '../../types';

describe('Character Type with Inventory & Gold', () => {
  it('should allow Character with gold and inventory fields', () => {
    const healingPotion: InventoryItem = {
      id: 'potion-1',
      name: 'Healing Potion',
      description: 'Restores 2d8+2 HP',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'heal', amount: '2d8+2' },
      value: 25,
    };

    const character: Character = {
      name: 'Test Hero',
      avatarPath: '/avatars/fighter.jpg',
      class: 'Fighter',
      level: 1,
      attributes: { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 8 },
      hp: 12,
      maxHp: 12,
      ac: 16,
      bab: 1,
      saves: { fortitude: 2, reflex: 0, will: 0 },
      skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
      feats: [],
      equipment: {
        weapon: {
          name: 'Longsword',
          damage: '1d8',
          damageType: 'slashing',
          finesse: false,
          description: 'A versatile blade',
        },
        weapons: [{
          name: 'Longsword',
          damage: '1d8',
          damageType: 'slashing',
          finesse: false,
          description: 'A versatile blade',
        }],
        armor: { name: 'chainmail', baseAC: 16, maxDexBonus: 2, description: 'Medium armor' },
        shield: { equipped: false, acBonus: 0 },
        items: [],
      },
      resources: { abilities: [], spellSlots: { level0: { max: 0, current: 0 }, level1: { max: 0, current: 0 } } },
      gold: 100,
      inventory: [healingPotion],
      maxInventorySlots: 10,
    };

    expect(character.gold).toBe(100);
    expect(character.inventory).toHaveLength(1);
    expect(character.inventory?.[0].name).toBe('Healing Potion');
    expect(character.maxInventorySlots).toBe(10);
  });
});
