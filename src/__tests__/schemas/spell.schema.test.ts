import { describe, it, expect } from 'vitest';
import { SpellSchema, SpellsSchema } from '../../schemas/spell.schema';

describe('SpellSchema', () => {
  it('should validate a valid damage spell', () => {
    const validSpell = {
      id: 'fireball',
      name: 'Fireball',
      level: 3,
      school: 'evocation',
      target: 'area',
      effect: {
        type: 'damage',
        damageDice: '8d6',
        damageType: 'fire',
      },
      description: 'A bright streak flashes from your pointing finger.',
    };

    expect(() => SpellSchema.parse(validSpell)).not.toThrow();
  });

  it('should validate a spell with saving throw', () => {
    const spellWithSave = {
      id: 'thunderwave',
      name: 'Thunderwave',
      level: 1,
      school: 'evocation',
      target: 'single',
      effect: {
        type: 'damage',
        damageDice: '2d6',
        damageType: 'thunder',
      },
      savingThrow: {
        type: 'fortitude',
        onSuccess: 'half',
      },
      description: 'A wave of thunderous force.',
    };

    expect(() => SpellSchema.parse(spellWithSave)).not.toThrow();
  });

  it('should reject invalid damage dice format', () => {
    const invalidSpell = {
      id: 'broken',
      name: 'Broken Spell',
      level: 0,
      school: 'evocation',
      target: 'single',
      effect: {
        type: 'damage',
        damageDice: 'invalid',
        damageType: 'fire',
      },
      description: 'Broken',
    };

    expect(() => SpellSchema.parse(invalidSpell)).toThrow();
  });

  it('should reject invalid spell level', () => {
    const invalidLevel = {
      id: 'overpowered',
      name: 'Overpowered Spell',
      level: 99,
      school: 'evocation',
      target: 'single',
      effect: {
        type: 'damage',
        damageDice: '1d6',
        damageType: 'fire',
      },
      description: 'Too powerful',
    };

    expect(() => SpellSchema.parse(invalidLevel)).toThrow();
  });

  it('should validate buff spells', () => {
    const buffSpell = {
      id: 'divine_favor',
      name: 'Divine Favor',
      level: 0,
      school: 'divination',
      target: 'self',
      effect: {
        type: 'buff',
        buffType: 'attack',
        buffAmount: 1,
        buffDuration: 1,
      },
      description: 'Divine power guides your attack.',
    };

    expect(() => SpellSchema.parse(buffSpell)).not.toThrow();
  });

  it('should validate condition spells', () => {
    const conditionSpell = {
      id: 'hold_person',
      name: 'Hold Person',
      level: 2,
      school: 'enchantment',
      target: 'single',
      effect: {
        type: 'condition',
        conditionType: 'Paralyzed',
        conditionDuration: 3,
      },
      savingThrow: {
        type: 'will',
        onSuccess: 'negates',
      },
      description: 'You attempt to paralyze a humanoid.',
    };

    expect(() => SpellSchema.parse(conditionSpell)).not.toThrow();
  });

  it('should validate heal spells', () => {
    const healSpell = {
      id: 'cure_light_wounds',
      name: 'Cure Light Wounds',
      level: 1,
      school: 'conjuration',
      target: 'single',
      effect: {
        type: 'heal',
        healDice: '1d8+1',
      },
      description: 'Heals target for 1d8+1 HP.',
    };

    expect(() => SpellSchema.parse(healSpell)).not.toThrow();
  });

  it('should validate new damage types', () => {
    const necroticSpell = {
      id: 'paralyzing_touch',
      name: 'Paralyzing Touch',
      level: 0,
      school: 'necromancy',
      target: 'single',
      effect: {
        type: 'damage',
        damageDice: '1d3',
        damageType: 'necrotic',
      },
      description: 'Necrotic touch.',
    };

    const thunderSpell = {
      id: 'thunderwave',
      name: 'Thunderwave',
      level: 1,
      school: 'evocation',
      target: 'single',
      effect: {
        type: 'damage',
        damageDice: '2d6',
        damageType: 'thunder',
      },
      description: 'Thunder damage.',
    };

    expect(() => SpellSchema.parse(necroticSpell)).not.toThrow();
    expect(() => SpellSchema.parse(thunderSpell)).not.toThrow();
  });
});

describe('SpellsSchema', () => {
  it('should validate a record of spells', () => {
    const validSpells = {
      ray_of_frost: {
        id: 'ray_of_frost',
        name: 'Ray of Frost',
        level: 0,
        school: 'evocation',
        target: 'single',
        effect: {
          type: 'damage',
          damageDice: '1d3',
          damageType: 'cold',
        },
        description: 'A ray of freezing air.',
      },
      fireball: {
        id: 'fireball',
        name: 'Fireball',
        level: 3,
        school: 'evocation',
        target: 'area',
        effect: {
          type: 'damage',
          damageDice: '8d6',
          damageType: 'fire',
        },
        description: 'A bright streak flashes.',
      },
    };

    expect(() => SpellsSchema.parse(validSpells)).not.toThrow();
  });

  it('should reject if any spell is invalid', () => {
    const invalidSpells = {
      valid: {
        id: 'valid',
        name: 'Valid Spell',
        level: 0,
        school: 'evocation',
        target: 'single',
        effect: {
          type: 'damage',
          damageDice: '1d6',
          damageType: 'fire',
        },
        description: 'Valid',
      },
      invalid: {
        id: 'invalid',
        name: 'Invalid Spell',
        level: 0,
        school: 'evocation',
        target: 'single',
        effect: {
          type: 'damage',
          damageDice: 'broken',
          damageType: 'fire',
        },
        description: 'Invalid',
      },
    };

    expect(() => SpellsSchema.parse(invalidSpells)).toThrow();
  });
});
