import { describe, it, expect } from 'vitest';
import type { CombatAction } from '../../types';
import type { Creature} from "../../types/creature";

describe('Combat Type Extensions', () => {
  it('should support all combat action types', () => {
    const attackAction: CombatAction = 'attack';
    const retreatAction: CombatAction = 'retreat';
    const useItemAction: CombatAction = 'use-item';

    expect(attackAction).toBe('attack');
    expect(retreatAction).toBe('retreat');
    expect(useItemAction).toBe('use-item');
  });

  it('should allow Creature with taunts field', () => {
    const goblin: Creature = {
      name: 'Goblin Raider',
      avatarPath: '/enemies/goblin.jpg',
      creatureClass: 'Beast',
      level: 1,
      attributes: { STR: 10, DEX: 14, CON: 12, INT: 8, WIS: 8, CHA: 6 },
      hp: 8,
      maxHp: 8,
      ac: 14,
      bab: 1,
      saves: { fortitude: 1, reflex: 2, will: -1 },
      skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
      feats: [],
      equipment: {
        weapon: { name: 'Dagger', damage: '1d4', damageType: 'piercing', finesse: true, description: 'A crude blade' },
        armor: { name: 'Leather', baseAC: 12, maxDexBonus: null, description: 'Worn leather' },
        shield: { equipped: false, acBonus: 0 },
        items: [],
      },
      resources: { abilities: [], spellSlots: { level0: { max: 0, current: 0 }, level1: { max: 0, current: 0 } } },
      taunts: {
        onCombatStart: ['Me smash you good!'],
      },
      lootTableId: "test_loot"
    };

    expect(goblin.taunts?.onCombatStart).toContain('Me smash you good!');
  });
});
