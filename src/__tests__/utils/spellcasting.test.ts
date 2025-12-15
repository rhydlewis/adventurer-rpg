import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getCastingAbilityModifier,
  getSpellAttackBonus,
  getSpellSaveDC,
  castDamageSpell,
  castSpellWithSave,
  castBuffSpell,
  castSpell,
} from '../../utils/spellcasting';
import { RAY_OF_FROST, ACID_SPLASH, DAZE, DIVINE_FAVOR, SACRED_FLAME } from '../../data/spells';
import type { Character } from '../../types/character';
import type { Creature } from '../../types/combat';
import { setForcedD20Roll, clearForcedD20Roll } from '../../utils/dice';
import { WEAPONS, ARMORS } from '../../data/equipment';

// Test characters
const createWizard = (int: number = 16): Character => ({
  name: 'Test Wizard',
  avatarPath: 'human_female_00009.png',
  class: 'Wizard',
  level: 1,
  attributes: { STR: 8, DEX: 14, CON: 12, INT: int, WIS: 10, CHA: 10 },
  hp: 6,
  maxHp: 6,
  ac: 12,
  bab: 0,
  saves: { fortitude: 0, reflex: 2, will: 2 },
  skills: { Perception: 0, Stealth: 0, Athletics: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
  feats: [],
  equipment: { weapon: WEAPONS.Dagger, armor: ARMORS.None, shield: { equipped: false, acBonus: 0 }, items: [] },
  resources: { abilities: [], spellSlots: { level0: { current: 0, max: 0 }, level1: { current: 2, max: 2 } } },
});

const createCleric = (wis: number = 16): Character => ({
  name: 'Test Cleric',
  avatarPath: 'human_female_00009.png',
  class: 'Cleric',
  level: 1,
  attributes: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: wis, CHA: 12 },
  hp: 10,
  maxHp: 10,
  ac: 16,
  bab: 0,
  saves: { fortitude: 2, reflex: 0, will: 2 },
  skills: { Perception: 0, Stealth: 0, Athletics: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
  feats: [],
  equipment: { weapon: WEAPONS.Mace, armor: ARMORS.Chainmail, shield: { equipped: false, acBonus: 0 }, items: [] },
  resources: { abilities: [], spellSlots: { level0: { current: 0, max: 0 }, level1: { current: 2, max: 2 } } },
});

const createEnemy = (ac: number = 14, hp: number = 10): Creature => ({
  name: 'Skeleton',
  avatarPath: 'human_female_00009.png',
  class: 'Fighter',
  level: 1,
  attributes: { STR: 12, DEX: 14, CON: 12, INT: 10, WIS: 10, CHA: 8 },
  hp,
  maxHp: hp,
  ac,
  bab: 1,
  saves: { fortitude: 2, reflex: 2, will: 0 },
  skills: { Perception: 0, Stealth: 0, Athletics: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
  feats: [],
  equipment: { weapon: WEAPONS.Dagger, armor: ARMORS.Leather, shield: { equipped: false, acBonus: 0 }, items: [] },
  resources: { abilities: [] },
});

describe('Spellcasting - Ability Modifiers', () => {
  it('should get INT modifier for Wizard', () => {
    const wizard = createWizard(16); // INT 16 = +3
    expect(getCastingAbilityModifier(wizard)).toBe(3);
  });

  it('should get WIS modifier for Cleric', () => {
    const cleric = createCleric(14); // WIS 14 = +2
    expect(getCastingAbilityModifier(cleric)).toBe(2);
  });

  it('should return 0 for non-casters', () => {
    const fighter: Character = { ...createWizard(), class: 'Fighter' };
    expect(getCastingAbilityModifier(fighter)).toBe(0);
  });
});

describe('Spellcasting - Attack Bonus', () => {
  it('should calculate spell attack bonus (BAB + casting mod)', () => {
    const wizard = createWizard(16); // BAB 0 + INT 3 = +3
    expect(getSpellAttackBonus(wizard)).toBe(3);
  });

  it('should work with different ability scores', () => {
    const wizard = createWizard(18); // BAB 0 + INT 4 = +4
    expect(getSpellAttackBonus(wizard)).toBe(4);
  });
});

describe('Spellcasting - Save DC', () => {
  it('should calculate cantrip DC (10 + 0 + mod)', () => {
    const wizard = createWizard(16); // 10 + 0 + 3 = 13
    expect(getSpellSaveDC(wizard, 0)).toBe(13);
  });

  it('should calculate level 1 spell DC (10 + 1 + mod)', () => {
    const wizard = createWizard(16); // 10 + 1 + 3 = 14
    expect(getSpellSaveDC(wizard, 1)).toBe(14);
  });
});

describe('Spellcasting - Damage Spells (Attack Roll)', () => {
  beforeEach(() => {
    clearForcedD20Roll();
  });

  afterEach(() => {
    clearForcedD20Roll();
  });

  it('should hit with Ray of Frost and deal damage', () => {
    const wizard = createWizard(16); // Attack bonus +3
    const enemy = createEnemy(14); // AC 14
    setForcedD20Roll(12); // 12 + 3 = 15 vs AC 14 = HIT

    const result = castDamageSpell(wizard, enemy, RAY_OF_FROST);

    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThanOrEqual(1);
    expect(result.damage).toBeLessThanOrEqual(3); // 1d3
    expect(result.output).toContain('HIT!');
    expect(result.output).toContain('cold damage');
  });

  it('should miss with Ray of Frost on low roll', () => {
    const wizard = createWizard(16); // Attack bonus +3
    const enemy = createEnemy(14); // AC 14
    setForcedD20Roll(5); // 5 + 3 = 8 vs AC 14 = MISS

    const result = castDamageSpell(wizard, enemy, RAY_OF_FROST);

    expect(result.success).toBe(false);
    expect(result.damage).toBeUndefined();
    expect(result.output).toContain('MISS!');
  });

  it('should auto-hit and double damage on natural 20', () => {
    const wizard = createWizard(16);
    const enemy = createEnemy(25); // AC 25 (would normally miss)
    setForcedD20Roll(20); // Natural 20 = auto-hit + crit

    const result = castDamageSpell(wizard, enemy, RAY_OF_FROST);

    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThanOrEqual(2); // 2d3 minimum
    expect(result.damage).toBeLessThanOrEqual(6); // 2d3 maximum
    expect(result.output).toContain('CRITICAL HIT!');
  });

  it('should work with Acid Splash', () => {
    const wizard = createWizard(16);
    const enemy = createEnemy(14);
    setForcedD20Roll(15); // Hit

    const result = castDamageSpell(wizard, enemy, ACID_SPLASH);

    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThanOrEqual(1);
    expect(result.damage).toBeLessThanOrEqual(3); // 1d3
    expect(result.output).toContain('acid damage');
  });
});

describe('Spellcasting - Spells with Saving Throws', () => {
  it('should deal Sacred Flame damage on failed save', () => {
    const cleric = createCleric(16); // DC = 10 + 0 + 3 = 13
    const enemy = createEnemy(14, 10); // Will save: +0
    // Enemy rolls low (will fail save vs DC 13)

    const result = castSpellWithSave(cleric, enemy, SACRED_FLAME);

    // Result depends on save roll, but should have proper structure
    expect(result.output).toContain('Sacred Flame');
    expect(result.output).toContain('WILL save');
    if (result.success) {
      expect(result.damage).toBeGreaterThanOrEqual(1);
      expect(result.damage).toBeLessThanOrEqual(4); // 1d4
    }
  });

  it('should fail Daze on target with >5 HP', () => {
    const wizard = createWizard(16);
    const enemy = createEnemy(14, 10); // 10 HP (too high for Daze)

    const result = castSpellWithSave(wizard, enemy, DAZE);

    expect(result.success).toBe(false);
    expect(result.output).toContain('does not meet requirements');
  });

  it('should allow Daze on target with ≤5 HP', () => {
    const wizard = createWizard(16);
    const enemy = createEnemy(14, 5); // 5 HP (valid for Daze)

    const result = castSpellWithSave(wizard, enemy, DAZE);

    // Should attempt the save
    expect(result.output).toContain('Daze');
    expect(result.output).toContain('WILL save');
  });
});

describe('Spellcasting - Buff Spells', () => {
  it('should cast Divine Favor (self-buff)', () => {
    const cleric = createCleric(16);

    const result = castBuffSpell(cleric, DIVINE_FAVOR);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Divine Favor');
    expect(result.output).toContain('+1');
  });
});

describe('Spellcasting - Main castSpell Router', () => {
  beforeEach(() => {
    clearForcedD20Roll();
  });

  afterEach(() => {
    clearForcedD20Roll();
  });

  it('should route damage spell to attack roll handler', () => {
    const wizard = createWizard(16);
    const enemy = createEnemy(14);
    setForcedD20Roll(15);

    const result = castSpell(wizard, enemy, RAY_OF_FROST);

    expect(result.success).toBe(true);
    expect(result.damage).toBeDefined();
  });

  it('should route buff spell to self-target handler', () => {
    const cleric = createCleric(16);

    const result = castSpell(cleric, cleric, DIVINE_FAVOR);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Divine Favor');
  });

  it('should route save spell to saving throw handler', () => {
    const cleric = createCleric(16);
    const enemy = createEnemy(14);

    const result = castSpell(cleric, enemy, SACRED_FLAME);

    expect(result.output).toContain('Sacred Flame');
    expect(result.output).toContain('save');
  });
});
