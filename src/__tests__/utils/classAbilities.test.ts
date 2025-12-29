import { describe, it, expect } from 'vitest';
import {
  activateSecondWind,
  activateChannelEnergy,
  getFeatBonuses,
  canSneakAttack,
  calculateSneakAttackDamage,
  activateDodge,
  hasEvasion,
  canUseAbility,
  consumeAbilityUse,
} from '../../utils/classAbilities';
import type { Character } from '../../types';
import { FEATS } from '../../data/feats';
import { WEAPONS, ARMORS } from '../../data/equipment';

// Map legacy feat names to new feat IDs
const featNameToId: Record<string, string> = {
  'Power Attack': 'power_attack',
  'Weapon Focus': 'weapon_focus',
  'Toughness': 'toughness',
  'Improved Initiative': 'improved_initiative',
  'Combat Reflexes': 'combat_reflexes',
};

// Test characters
const createFighter = (con: number = 14, featNames: string[] = []): Character => ({
  name: 'Test Fighter',
  avatarPath: 'human_female_00009.png',
  class: 'Fighter',
  level: 1,
  attributes: { STR: 16, DEX: 14, CON: con, INT: 10, WIS: 10, CHA: 8 },
  hp: 10,
  maxHp: 12,
  ac: 16,
  bab: 1,
  saves: { fortitude: 2, reflex: 0, will: 0 },
  skills: { Perception: 0, Stealth: 0, Athletics: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
  feats: featNames.map((name) => FEATS[featNameToId[name]]).filter(Boolean),
  equipment: { weapon: WEAPONS['longsword'], weapons: [WEAPONS['longsword']], armor: ARMORS.Chainmail, shield: { equipped: false, acBonus: 0 }, items: [] },
  resources: {
    abilities: [
      { name: 'Second Wind', type: 'encounter', maxUses: 1, currentUses: 1, description: 'Heal 1d10+1' },
    ],
  },
});

const createRogue = (): Character => ({
  name: 'Test Rogue',
  avatarPath: 'human_female_00009.png',
  class: 'Rogue',
  level: 1,
  attributes: { STR: 10, DEX: 18, CON: 12, INT: 14, WIS: 10, CHA: 10 },
  hp: 8,
  maxHp: 8,
  ac: 15,
  bab: 0,
  saves: { fortitude: 0, reflex: 2, will: 0 },
  skills: { Perception: 0, Stealth: 5, Athletics: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
  feats: [],
  equipment: { weapon: WEAPONS['rapier'], weapons: [WEAPONS['rapier']], armor: ARMORS.Leather, shield: { equipped: false, acBonus: 0 }, items: [] },
  resources: {
    abilities: [{ name: 'Dodge', type: 'encounter', maxUses: 1, currentUses: 1, description: '+4 AC' }],
  },
});

describe('Fighter Abilities - Second Wind', () => {
  it('should heal 1d10+1 HP', () => {
    const fighter = createFighter(14);
    fighter.hp = 5; // Damaged

    const result = activateSecondWind(fighter);

    expect(result.newHp).toBeGreaterThanOrEqual(6); // 5 + (1+1) min
    expect(result.newHp).toBeLessThanOrEqual(15); // 5 + (10+1) max
    expect(result.healed).toBeGreaterThanOrEqual(1);
    expect(result.healed).toBeLessThanOrEqual(11);
    expect(result.output).toContain('Second Wind');
  });

  it('should not exceed max HP', () => {
    const fighter = createFighter(14);
    fighter.hp = 11; // Near max (12)

    const result = activateSecondWind(fighter);

    expect(result.newHp).toBeLessThanOrEqual(fighter.maxHp);
    expect(result.newHp).toBe(12); // Capped at maxHp
  });

  it('should work when at full HP', () => {
    const fighter = createFighter(14);
    fighter.hp = fighter.maxHp;

    const result = activateSecondWind(fighter);

    expect(result.newHp).toBe(fighter.maxHp); // Still capped
  });
});

describe('Cleric Abilities - Channel Energy', () => {
  const createCleric = (wis: number = 14): Character => ({
    name: 'Test Cleric',
    avatarPath: 'human_female_00009.png',
    class: 'Cleric',
    level: 1,
    attributes: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: wis, CHA: 12 },
    hp: 8,
    maxHp: 12,
    ac: 18,
    bab: 0,
    saves: { fortitude: 2, reflex: 0, will: 2 },
    skills: { Perception: 0, Stealth: 0, Athletics: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
    feats: [],
    equipment: { weapon: WEAPONS['mace'], weapons: [WEAPONS['mace']], armor: ARMORS.Chainmail, shield: { equipped: true, acBonus: 2 }, items: [] },
    resources: {
      abilities: [
        { name: 'Channel Energy', type: 'daily', maxUses: 2, currentUses: 2, description: 'Heal 1d6 HP' },
      ],
      spellSlots: { level0: { current: 0, max: 0 }, level1: { current: 2, max: 2 } },
    },
  });

  it('should heal 1d6 HP', () => {
    const cleric = createCleric();
    cleric.hp = 5;

    const result = activateChannelEnergy(cleric);

    expect(result.newHp).toBeGreaterThanOrEqual(6); // 5 + 1 min
    expect(result.newHp).toBeLessThanOrEqual(11); // 5 + 6 max
    expect(result.healed).toBeGreaterThanOrEqual(1);
    expect(result.healed).toBeLessThanOrEqual(6);
    expect(result.output).toContain('Channel Energy');
  });

  it('should not exceed max HP', () => {
    const cleric = createCleric();
    cleric.hp = 11; // Near max (12)

    const result = activateChannelEnergy(cleric);

    expect(result.newHp).toBeLessThanOrEqual(cleric.maxHp);
    expect(result.newHp).toBe(12); // Capped at maxHp
  });

  it('should work when at full HP', () => {
    const cleric = createCleric();
    cleric.hp = cleric.maxHp;

    const result = activateChannelEnergy(cleric);

    expect(result.newHp).toBe(cleric.maxHp); // Still capped
    expect(result.healed).toBe(0); // No healing applied
  });
});

describe('Fighter Abilities - Feat Bonuses', () => {
  it('should grant +1 attack from Weapon Focus', () => {
    const fighter = createFighter(14, ['Weapon Focus']);

    const bonuses = getFeatBonuses(fighter);

    expect(bonuses.attackBonus).toBe(1);
  });

  it('should grant +4 initiative from Improved Initiative', () => {
    const fighter = createFighter(14, ['Improved Initiative']);

    const bonuses = getFeatBonuses(fighter);

    expect(bonuses.initiativeBonus).toBe(4);
  });

  it('should grant +3 HP per level from Toughness', () => {
    const fighter = createFighter(14, ['Toughness']);

    const bonuses = getFeatBonuses(fighter);

    expect(bonuses.hpBonus).toBe(3); // 3 * level 1
  });

  it('should grant +2 AC when dodging from Combat Reflexes', () => {
    const fighter = createFighter(14, ['Combat Reflexes']);

    const bonuses = getFeatBonuses(fighter);

    expect(bonuses.dodgeACBonus).toBe(2);
  });

  it('should stack multiple feat bonuses', () => {
    const fighter = createFighter(14, ['Weapon Focus', 'Improved Initiative', 'Toughness']);

    const bonuses = getFeatBonuses(fighter);

    expect(bonuses.attackBonus).toBe(1);
    expect(bonuses.initiativeBonus).toBe(4);
    expect(bonuses.hpBonus).toBe(3);
  });

  it('should return zero bonuses with no feats', () => {
    const fighter = createFighter(14, []);

    const bonuses = getFeatBonuses(fighter);

    expect(bonuses.attackBonus).toBe(0);
    expect(bonuses.initiativeBonus).toBe(0);
    expect(bonuses.hpBonus).toBe(0);
    expect(bonuses.dodgeACBonus).toBe(0);
  });
});

describe('Rogue Abilities - Sneak Attack', () => {
  it('should allow Sneak Attack when winning initiative', () => {
    const rogueInit = 18;
    const enemyInit = 12;

    expect(canSneakAttack(rogueInit, enemyInit, false)).toBe(true);
  });

  it('should not allow Sneak Attack when losing initiative', () => {
    const rogueInit = 10;
    const enemyInit = 15;

    expect(canSneakAttack(rogueInit, enemyInit, false)).toBe(false);
  });

  it('should not allow Sneak Attack on tied initiative', () => {
    const rogueInit = 12;
    const enemyInit = 12;

    expect(canSneakAttack(rogueInit, enemyInit, false)).toBe(false);
  });

  it('should deal 1d6 bonus damage', () => {
    const result = calculateSneakAttackDamage();

    expect(result.bonus).toBeGreaterThanOrEqual(1);
    expect(result.bonus).toBeLessThanOrEqual(6);
    expect(result.roll).toContain('1d6');
    expect(result.description).toContain('Sneak Attack');
  });
});

describe('Rogue Abilities - Dodge', () => {
  it('should grant +4 AC bonus', () => {
    const result = activateDodge();

    expect(result.acBonus).toBe(4);
    expect(result.output).toContain('Dodge');
    expect(result.output).toContain('+4 AC');
  });
});

describe('Rogue Abilities - Evasion', () => {
  it('should return true for Rogues', () => {
    const rogue = createRogue();

    expect(hasEvasion(rogue)).toBe(true);
  });

  it('should return false for non-Rogues', () => {
    const fighter = createFighter();

    expect(hasEvasion(fighter)).toBe(false);
  });
});

describe('Ability Resource Management', () => {
  it('should validate ability exists', () => {
    const fighter = createFighter();

    const result = canUseAbility(fighter, 'Second Wind');

    expect(result.canUse).toBe(true);
  });

  it('should fail if ability not found', () => {
    const fighter = createFighter();

    const result = canUseAbility(fighter, 'Nonexistent Ability');

    expect(result.canUse).toBe(false);
    expect(result.reason).toContain('not found');
  });

  it('should fail if no uses remaining', () => {
    const fighter = createFighter();
    fighter.resources.abilities[0].currentUses = 0;

    const result = canUseAbility(fighter, 'Second Wind');

    expect(result.canUse).toBe(false);
    expect(result.reason).toContain('No uses remaining');
  });

  it('should allow at-will abilities', () => {
    const fighter = createFighter();
    fighter.resources.abilities[0].type = 'at-will';
    fighter.resources.abilities[0].currentUses = 0; // Doesn't matter for at-will

    const result = canUseAbility(fighter, 'Second Wind');

    expect(result.canUse).toBe(true);
  });

  it('should consume one use of ability', () => {
    const fighter = createFighter();
    expect(fighter.resources.abilities[0].currentUses).toBe(1);

    const updated = consumeAbilityUse(fighter, 'Second Wind');

    expect(updated.resources.abilities[0].currentUses).toBe(0);
  });

  it('should not modify at-will abilities', () => {
    const fighter = createFighter();
    fighter.resources.abilities[0].type = 'at-will';
    fighter.resources.abilities[0].currentUses = 999;

    const updated = consumeAbilityUse(fighter, 'Second Wind');

    expect(updated.resources.abilities[0].currentUses).toBe(999); // Unchanged
  });

  it('should not consume uses if ability not found', () => {
    const fighter = createFighter();
    const originalUses = fighter.resources.abilities[0].currentUses;

    const updated = consumeAbilityUse(fighter, 'Nonexistent Ability');

    expect(updated.resources.abilities[0].currentUses).toBe(originalUses);
  });
});
