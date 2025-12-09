import { describe, it, expect } from 'vitest';
import { getWeaponDamage, getWeaponAttackBonus, canUseItem, getItemEffect } from '../../utils/equipment';
import type { Character } from '../../types';

describe('utils/equipment', () => {
  const createCharacterWithWeapon = (
    weaponName: Character['equipment']['weapon']['name'],
    attributes: Character['attributes']
  ): Character => ({
    name: 'Test',
    class: 'Fighter',
    level: 1,
    attributes,
    hp: 15,
    maxHp: 15,
    ac: 18,
    bab: 1,
    saves: { fortitude: 2, reflex: 0, will: 0 },
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
      weapon: {
        name: weaponName,
        damage: weaponName === 'Longsword' ? '1d8' : weaponName === 'Rapier' ? '1d6' : '1d4',
        damageType: 'slashing',
        finesse: weaponName === 'Rapier' || weaponName === 'Dagger',
        description: '',
      },
      armor: { name: 'Chainmail', baseAC: 16, maxDexBonus: 2, description: '' },
      shield: { equipped: true, acBonus: 2 },
      items: [],
    },
    resources: { abilities: [] },
  });

  describe('getWeaponDamage', () => {
    it('returns weapon damage with STR modifier for non-finesse weapons', () => {
      const character = createCharacterWithWeapon('Longsword', {
        STR: 16, // +3 modifier
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      });

      const damage = getWeaponDamage(character);
      expect(damage.damageDice).toBe('1d8');
      expect(damage.modifier).toBe(3); // STR modifier
      expect(damage.totalNotation).toBe('1d8+3');
    });

    it('returns weapon damage with DEX modifier for finesse weapons', () => {
      const character = createCharacterWithWeapon('Rapier', {
        STR: 10, // +0 modifier
        DEX: 16, // +3 modifier
        CON: 12,
        INT: 14,
        WIS: 12,
        CHA: 10,
      });

      const damage = getWeaponDamage(character);
      expect(damage.damageDice).toBe('1d6');
      expect(damage.modifier).toBe(3); // DEX modifier
      expect(damage.totalNotation).toBe('1d6+3');
    });

    it('uses higher of STR or DEX for finesse weapons', () => {
      const character = createCharacterWithWeapon('Rapier', {
        STR: 16, // +3 (higher)
        DEX: 14, // +2
        CON: 12,
        INT: 10,
        WIS: 10,
        CHA: 8,
      });

      const damage = getWeaponDamage(character);
      // Finesse allows choosing, should pick higher (STR +3)
      expect(damage.modifier).toBe(3);
    });

    it('handles negative modifiers correctly', () => {
      const character = createCharacterWithWeapon('Longsword', {
        STR: 8, // -1 modifier
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      });

      const damage = getWeaponDamage(character);
      expect(damage.modifier).toBe(-1);
      expect(damage.totalNotation).toBe('1d8-1');
    });
  });

  describe('getWeaponAttackBonus', () => {
    it('calculates attack bonus with BAB + STR for non-finesse', () => {
      const character = createCharacterWithWeapon('Longsword', {
        STR: 16, // +3
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      });

      const attackBonus = getWeaponAttackBonus(character);
      expect(attackBonus).toBe(4); // BAB 1 + STR +3
    });

    it('calculates attack bonus with BAB + DEX for finesse', () => {
      const character = createCharacterWithWeapon('Rapier', {
        STR: 10,
        DEX: 16, // +3
        CON: 12,
        INT: 14,
        WIS: 12,
        CHA: 10,
      });
      // Rogue has BAB 0
      character.bab = 0;

      const attackBonus = getWeaponAttackBonus(character);
      expect(attackBonus).toBe(3); // BAB 0 + DEX +3
    });

    it('uses higher of STR or DEX for finesse weapons', () => {
      const character = createCharacterWithWeapon('Rapier', {
        STR: 16, // +3 (higher)
        DEX: 14, // +2
        CON: 12,
        INT: 10,
        WIS: 10,
        CHA: 8,
      });

      const attackBonus = getWeaponAttackBonus(character);
      expect(attackBonus).toBe(4); // BAB 1 + STR +3 (higher)
    });
  });

  describe('canUseItem', () => {
    it('returns true if character has the item with quantity > 0', () => {
      const character = createCharacterWithWeapon('Longsword', {
        STR: 16,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      });
      character.equipment.items = [
        {
          name: 'Healing Potion',
          description: '',
          effect: { type: 'heal', amount: '2d8+2' },
          quantity: 2,
        },
      ];

      expect(canUseItem(character, 'Healing Potion')).toBe(true);
    });

    it('returns false if character does not have the item', () => {
      const character = createCharacterWithWeapon('Longsword', {
        STR: 16,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      });

      expect(canUseItem(character, 'Healing Potion')).toBe(false);
    });

    it('returns false if item quantity is 0', () => {
      const character = createCharacterWithWeapon('Longsword', {
        STR: 16,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      });
      character.equipment.items = [
        {
          name: 'Healing Potion',
          description: '',
          effect: { type: 'heal', amount: '2d8+2' },
          quantity: 0,
        },
      ];

      expect(canUseItem(character, 'Healing Potion')).toBe(false);
    });
  });

  describe('getItemEffect', () => {
    it('returns item effect for healing potion', () => {
      const effect = getItemEffect('Healing Potion');
      expect(effect).toEqual({ type: 'heal', amount: '2d8+2' });
    });

    it('returns item effect for smoke bomb', () => {
      const effect = getItemEffect('Smoke Bomb');
      expect(effect).toEqual({ type: 'escape' });
    });

    it('returns item effect for arcane scroll', () => {
      const effect = getItemEffect('Arcane Scroll');
      expect(effect).toEqual({ type: 'spell', spellName: 'any' });
    });

    it('throws error for unknown item', () => {
      expect(() => getItemEffect('Unknown Item' as any)).toThrow();
    });
  });
});
