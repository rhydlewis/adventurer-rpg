import { describe, it, expect } from 'vitest';
import { ArmorSchema, ArmorsSchema } from '../../schemas/armor.schema';

describe('ArmorSchema', () => {
  it('should validate armor with no dex bonus limit', () => {
    const validArmor = {
      name: 'leather',
      baseAC: 12,
      maxDexBonus: null,
      description: 'Light and flexible armor',
    };

    expect(() => ArmorSchema.parse(validArmor)).not.toThrow();
  });

  it('should validate armor with dex bonus limit', () => {
    const chainmail = {
      name: 'Chain Mail',
      baseAC: 16,
      maxDexBonus: 2,
      description: 'Heavy metal armor',
    };

    expect(() => ArmorSchema.parse(chainmail)).not.toThrow();
  });

  it('should reject AC below minimum', () => {
    const invalidArmor = {
      name: 'Broken Armor',
      baseAC: 5,
      maxDexBonus: null,
      description: 'Too weak',
    };

    expect(() => ArmorSchema.parse(invalidArmor)).toThrow();
  });

  it('should reject AC above maximum', () => {
    const invalidArmor = {
      name: 'Super Armor',
      baseAC: 25,
      maxDexBonus: null,
      description: 'Too strong',
    };

    expect(() => ArmorSchema.parse(invalidArmor)).toThrow();
  });

  it('should reject negative dex bonus', () => {
    const invalidArmor = {
      name: 'Bad Armor',
      baseAC: 12,
      maxDexBonus: -1,
      description: 'Invalid dex bonus',
    };

    expect(() => ArmorSchema.parse(invalidArmor)).toThrow();
  });
});

describe('ArmorsSchema', () => {
  it('should validate a record of armors', () => {
    const validArmors = {
      leather: {
        name: 'leather',
        baseAC: 12,
        maxDexBonus: null,
        description: 'Light armor',
      },
      chainmail: {
        name: 'Chain Mail',
        baseAC: 16,
        maxDexBonus: 2,
        description: 'Heavy armor',
      },
    };

    expect(() => ArmorsSchema.parse(validArmors)).not.toThrow();
  });
});
