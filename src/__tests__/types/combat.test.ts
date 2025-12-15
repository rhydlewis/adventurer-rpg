import { describe, it, expect } from 'vitest';
import type { CombatAction, Creature } from '../../types/combat';

describe('Combat Type Extensions', () => {
  it('should support all combat action types', () => {
    const attackAction: CombatAction = 'attack';
    const retreatAction: CombatAction = 'retreat';
    const useItemAction: CombatAction = 'use-item';

    expect(attackAction).toBe('attack');
    expect(retreatAction).toBe('retreat');
    expect(useItemAction).toBe('use-item');
  });

  it('should allow Creature with taunt field', () => {
    const goblin: Creature = {
      name: 'Goblin Raider',
      avatarPath: '/enemies/goblin.jpg',
      class: 'Fighter',
      level: 1,
      traits: [],
      attributes: { STR: 10, DEX: 14, CON: 12, INT: 8, WIS: 8, CHA: 6 },
      hp: 8,
      maxHp: 8,
      ac: 14,
      bab: 1,
      saves: { fortitude: 1, reflex: 2, will: -1 },
      skills: {},
      feats: [],
      equipment: {
        weapon: { name: 'Dagger', damage: '1d4', damageType: 'piercing', finesse: true, description: 'A crude blade' },
        armor: { name: 'Leather', baseAC: 12, maxDexBonus: null, description: 'Worn leather' },
        shield: { equipped: false, acBonus: 0 },
        items: [],
      },
      resources: { actionPoints: 0, spellSlots: [] },
      gold: 10,
      inventory: [],
      maxInventorySlots: 5,
      taunt: 'Me smash you good!',
    };

    expect(goblin.taunt).toBe('Me smash you good!');
  });
});
