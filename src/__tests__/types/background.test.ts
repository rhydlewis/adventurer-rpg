import { describe, it, expect } from 'vitest';
import type { Character } from '../../types';
import { BACKGROUNDS } from '../../types';

describe('Character Type with Background & Traits', () => {
  it('should allow Character with background and traits', () => {
    const character: Character = {
      name: 'Rogue Hero',
      avatarPath: '/avatars/rogue.jpg',
      class: 'Rogue',
      level: 1,
      background: BACKGROUNDS['Street Urchin'],
      traits: [
        { name: 'Brave', description: 'You face danger without flinching.' },
        { name: 'Curious', description: 'You love exploring the unknown.' },
      ],
      attributes: { STR: 10, DEX: 16, CON: 12, INT: 14, WIS: 10, CHA: 12 },
      hp: 10,
      maxHp: 10,
      ac: 15,
      bab: 0,
      saves: { fortitude: 0, reflex: 2, will: 0 },
      skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
      feats: [],
      equipment: {
        weapon: { name: 'Dagger', damage: '1d4', damageType: 'piercing', finesse: true, description: 'A small blade' },
        armor: { name: 'Leather', baseAC: 12, maxDexBonus: null, description: 'Light armor' },
        shield: { equipped: false, acBonus: 0 },
        items: [],
      },
      resources: { abilities: [], spellSlots: { level0: { max: 0, current: 0 }, level1: { max: 0, current: 0 } } },
      gold: 50,
      inventory: [],
      maxInventorySlots: 10,
    };

    expect(character.background?.name).toBe('Street Urchin');
    expect(character.background?.startingGold).toBe(50);
    expect(character.traits).toHaveLength(2);
    expect(character.traits?.[0].name).toBe('Brave');
  });
});
