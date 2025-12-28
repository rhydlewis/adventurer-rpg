import { describe, it, expect } from 'vitest';
import { WeaponSchema, WeaponsSchema } from '../../schemas/weapon.schema';

describe('WeaponSchema', () => {
  it('should validate a valid weapon', () => {
    const validWeapon = {
      name: 'Longsword',
      damage: '1d8',
      damageType: 'slashing',
      finesse: false,
      description: 'A versatile blade',
      proficiencyRequired: 'martial',
    };

    expect(() => WeaponSchema.parse(validWeapon)).not.toThrow();
  });

  it('should reject invalid damage dice format', () => {
    const invalidWeapon = {
      name: 'Broken Sword',
      damage: 'invalid',
      damageType: 'slashing',
      finesse: false,
      description: 'Broken',
    };

    expect(() => WeaponSchema.parse(invalidWeapon)).toThrow();
  });

  it('should allow damage with modifiers', () => {
    const weaponWithModifier = {
      name: 'Magic Sword',
      damage: '1d8+2',
      damageType: 'slashing',
      finesse: false,
      description: 'Enchanted blade',
    };

    expect(() => WeaponSchema.parse(weaponWithModifier)).not.toThrow();
  });

  it('should reject invalid damage type', () => {
    const invalidDamageType = {
      name: 'Fire Sword',
      damage: '1d8',
      damageType: 'fire',
      finesse: false,
      description: 'Flaming blade',
    };

    expect(() => WeaponSchema.parse(invalidDamageType)).toThrow();
  });
});

describe('WeaponsSchema', () => {
  it('should validate a record of weapons', () => {
    const validWeapons = {
      longsword: {
        name: 'Longsword',
        damage: '1d8',
        damageType: 'slashing',
        finesse: false,
        description: 'A versatile blade',
        proficiencyRequired: 'martial',
      },
      dagger: {
        name: 'Dagger',
        damage: '1d6',
        damageType: 'piercing',
        finesse: true,
        description: 'A short blade',
        proficiencyRequired: 'simple',
      },
    };

    expect(() => WeaponsSchema.parse(validWeapons)).not.toThrow();
  });

  it('should reject if any weapon is invalid', () => {
    const invalidWeapons = {
      longsword: {
        name: 'Longsword',
        damage: '1d8',
        damageType: 'slashing',
        finesse: false,
        description: 'A versatile blade',
      },
      broken: {
        name: 'Broken',
        damage: 'invalid',
        damageType: 'slashing',
        finesse: false,
        description: 'Broken',
      },
    };

    expect(() => WeaponsSchema.parse(invalidWeapons)).toThrow();
  });
});
