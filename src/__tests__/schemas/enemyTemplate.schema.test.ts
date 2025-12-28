import { describe, it, expect } from 'vitest';
import { EnemyTemplatesSchema } from '../../schemas/enemyTemplate.schema';

describe('EnemyTemplateSchema with equipment references', () => {
  it('should validate enemy with weapon/armor IDs instead of inline objects', () => {
    const enemyWithRefs = {
      id: 'test-warrior',
      baseName: 'Test Warrior',
      creatureClass: 'Humanoid',
      avatarPaths: ['Bandit'],
      levelRange: { min: 1, max: 2 },
      attributeRanges: {
        STR: { min: 12, max: 14 },
        DEX: { min: 10, max: 12 },
        CON: { min: 11, max: 13 },
        INT: { min: 9, max: 11 },
        WIS: { min: 10, max: 12 },
        CHA: { min: 8, max: 10 },
      },
      baseClass: 'Fighter',
      equipment: {
        weaponId: 'longsword',
        armorId: 'chainmail',
        shield: { equipped: true, acBonus: 2 },
        items: [],
      },
      skills: {
        Athletics: 0,
        Stealth: 0,
        Perception: 0,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 0,
      },
      feats: [],
      taunts: {
        onCombatStart: ['Test!'],
        onPlayerMiss: ['Ha!'],
        onEnemyHit: ['Got you!'],
        onLowHealth: ['Oof!'],
      },
      lootTableId: 'test_loot',
    };

    const templates = { 'test-warrior': enemyWithRefs };
    expect(() => EnemyTemplatesSchema.parse(templates)).not.toThrow();
  });

  it('should still validate enemy with inline weapon/armor (backward compat)', () => {
    const enemyWithInline = {
      id: 'test-bandit',
      baseName: 'Test Bandit',
      creatureClass: 'Humanoid',
      avatarPaths: ['Bandit'],
      levelRange: { min: 1, max: 2 },
      attributeRanges: {
        STR: { min: 12, max: 14 },
        DEX: { min: 10, max: 12 },
        CON: { min: 11, max: 13 },
        INT: { min: 9, max: 11 },
        WIS: { min: 10, max: 12 },
        CHA: { min: 8, max: 10 },
      },
      baseClass: 'Fighter',
      equipment: {
        weapon: {
          name: 'Dagger',
          damage: '1d6',
          damageType: 'piercing',
          finesse: true,
          description: 'A short blade',
        },
        weapons: [
          {
            name: 'Dagger',
            damage: '1d6',
            damageType: 'piercing',
            finesse: true,
            description: 'A short blade',
          },
        ],
        armor: {
          name: 'leather',
          baseAC: 11,
          maxDexBonus: null,
          description: 'Light armor',
        },
        shield: { equipped: false, acBonus: 0 },
        items: [],
      },
      skills: {
        Athletics: 0,
        Stealth: 0,
        Perception: 0,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 0,
      },
      feats: [],
      taunts: {
        onCombatStart: ['Test!'],
        onPlayerMiss: ['Ha!'],
        onEnemyHit: ['Got you!'],
        onLowHealth: ['Oof!'],
      },
      lootTableId: 'test_loot',
    };

    const templates = { 'test-bandit': enemyWithInline };
    expect(() => EnemyTemplatesSchema.parse(templates)).not.toThrow();
  });

  it('should validate enemy with null weaponId', () => {
    const enemyNoWeapon = {
      id: 'test-caster',
      baseName: 'Test Caster',
      creatureClass: 'Humanoid',
      avatarPaths: ['Cultist'],
      levelRange: { min: 1, max: 2 },
      attributeRanges: {
        STR: { min: 8, max: 10 },
        DEX: { min: 10, max: 12 },
        CON: { min: 10, max: 12 },
        INT: { min: 14, max: 16 },
        WIS: { min: 12, max: 14 },
        CHA: { min: 10, max: 12 },
      },
      baseClass: 'Wizard',
      equipment: {
        weaponId: null,
        armorId: 'none',
        shield: null,
        items: [],
      },
      skills: {
        Athletics: 0,
        Stealth: 0,
        Perception: 0,
        Arcana: 5,
        Medicine: 0,
        Intimidate: 0,
      },
      feats: [],
      taunts: {},
      lootTableId: 'test_loot',
    };

    const templates = { 'test-caster': enemyNoWeapon };
    expect(() => EnemyTemplatesSchema.parse(templates)).not.toThrow();
  });
});
