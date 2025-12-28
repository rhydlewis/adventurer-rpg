import { describe, it, expect } from 'vitest';
import { getAvailableActions, canPerformAction } from '../../utils/actions';
import type { Character } from '../../types';
import type { AttackAction, UseAbilityAction, CastSpellAction } from '../../types/action';
import { FEATS } from '../../data/feats';
import { WEAPONS, ARMORS } from '../../data/equipment';

// Test characters
const createFighter = (): Character => ({
  name: 'Test Fighter',
  avatarPath: 'human_female_00009.png',
  class: 'Fighter',
  level: 1,
  attributes: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 10, CHA: 8 },
  hp: 12,
  maxHp: 12,
  ac: 16,
  bab: 1,
  saves: { fortitude: 2, reflex: 0, will: 0 },
  skills: { Perception: 0, Stealth: 0, Athletics: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
  feats: [FEATS['Weapon Focus']],
  equipment: { weapon: WEAPONS.Longsword, weapons: [WEAPONS.Longsword], armor: ARMORS.Chainmail, shield: { equipped: false, acBonus: 0 }, items: [] },
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
  equipment: { weapon: WEAPONS.Rapier, weapons: [WEAPONS.Rapier], armor: ARMORS.Leather, shield: { equipped: false, acBonus: 0 }, items: [] },
  resources: {
    abilities: [{ name: 'Dodge', type: 'encounter', maxUses: 1, currentUses: 1, description: '+4 AC' }],
  },
});

const createWizard = (): Character => ({
  name: 'Test Wizard',
  avatarPath: 'human_female_00009.png',
  class: 'Wizard',
  level: 1,
  attributes: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 10, CHA: 10 },
  hp: 6,
  maxHp: 6,
  ac: 12,
  bab: 0,
  saves: { fortitude: 0, reflex: 2, will: 2 },
  skills: { Perception: 0, Stealth: 0, Athletics: 0, Arcana: 4, Medicine: 0, Intimidate: 0 },
  feats: [],
  equipment: { weapon: WEAPONS.Dagger, weapons: [WEAPONS.Dagger], armor: ARMORS.None, shield: { equipped: false, acBonus: 0 }, items: [] },
  resources: {
    abilities: [],
    spellSlots: { level0: { current: 0, max: 0 }, level1: { current: 2, max: 2 } },
  },
});

const createCleric = (): Character => ({
  name: 'Test Cleric',
  avatarPath: 'human_female_00009.png',
  class: 'Cleric',
  level: 1,
  attributes: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 12 },
  hp: 10,
  maxHp: 10,
  ac: 16,
  bab: 0,
  saves: { fortitude: 2, reflex: 0, will: 2 },
  skills: { Perception: 0, Stealth: 0, Athletics: 0, Arcana: 0, Medicine: 0, Intimidate: 4 },
  feats: [],
  equipment: { weapon: WEAPONS.Mace, weapons: [WEAPONS.Mace], armor: ARMORS.Chainmail, shield: { equipped: false, acBonus: 0 }, items: [] },
  resources: {
    abilities: [],
    spellSlots: { level0: { current: 0, max: 0 }, level1: { current: 2, max: 2 } },
  },
});

describe('Actions - Fighter', () => {
  it('should have Attack action', () => {
    const fighter = createFighter();
    const actions = getAvailableActions(fighter);

    const attackAction = actions.find((a) => a.type === 'attack' && a.name === 'Attack') as AttackAction;
    expect(attackAction).toBeDefined();
    expect(attackAction.available).toBe(true);
  });

  it('should have Power Attack action when mechanicsLocked is true', () => {
    const fighter = createFighter();
    fighter.mechanicsLocked = true;
    const actions = getAvailableActions(fighter);

    const powerAttack = actions.find(
      (a) => a.type === 'attack' && a.variant === 'power_attack'
    ) as AttackAction;
    expect(powerAttack).toBeDefined();
    expect(powerAttack.name).toBe('Power Attack');
    expect(powerAttack.attackModifier).toBe(-2);
    expect(powerAttack.damageModifier).toBe(4);
    expect(powerAttack.available).toBe(true);
  });

  it('should NOT have Power Attack when mechanicsLocked is false (Phase 1)', () => {
    const fighter = createFighter();
    fighter.mechanicsLocked = false;
    const actions = getAvailableActions(fighter);

    const powerAttack = actions.find(
      (a) => a.type === 'attack' && a.variant === 'power_attack'
    );
    expect(powerAttack).toBeUndefined();
  });

  it('should have Second Wind ability', () => {
    const fighter = createFighter();
    const actions = getAvailableActions(fighter);

    const secondWind = actions.find((a) => a.name === 'Second Wind') as UseAbilityAction;
    expect(secondWind).toBeDefined();
    expect(secondWind.type).toBe('use_ability');
    expect(secondWind.available).toBe(true);
    expect(secondWind.usesRemaining).toBe(1);
  });

  it('should disable Second Wind when no uses remaining', () => {
    const fighter = createFighter();
    fighter.resources.abilities[0].currentUses = 0;
    const actions = getAvailableActions(fighter);

    const secondWind = actions.find((a) => a.name === 'Second Wind') as UseAbilityAction;
    expect(secondWind.available).toBe(false);
    expect(secondWind.disabled).toBe(true);
    expect(secondWind.disabledReason).toContain('No uses remaining');
  });

  it('should not have cantrips', () => {
    const fighter = createFighter();
    const actions = getAvailableActions(fighter);

    const spellActions = actions.filter((a) => a.type === 'cast_spell');
    expect(spellActions).toHaveLength(0);
  });
});

describe('Actions - Rogue', () => {
  it('should have Attack action', () => {
    const rogue = createRogue();
    const actions = getAvailableActions(rogue);

    const attackAction = actions.find((a) => a.type === 'attack' && a.name === 'Attack');
    expect(attackAction).toBeDefined();
  });

  it('should not have Power Attack', () => {
    const rogue = createRogue();
    const actions = getAvailableActions(rogue);

    const powerAttack = actions.find((a) => a.type === 'attack' && a.name === 'Power Attack');
    expect(powerAttack).toBeUndefined();
  });

  it('should have Dodge ability', () => {
    const rogue = createRogue();
    const actions = getAvailableActions(rogue);

    const dodge = actions.find((a) => a.name === 'Dodge') as UseAbilityAction;
    expect(dodge).toBeDefined();
    expect(dodge.type).toBe('use_ability');
    expect(dodge.available).toBe(true);
  });
});

describe('Actions - Wizard', () => {
  it('should have 3 cantrips', () => {
    const wizard = createWizard();
    const actions = getAvailableActions(wizard);

    const cantrips = actions.filter(
      (a) => a.type === 'cast_spell' && a.spellLevel === 0
    ) as CastSpellAction[];

    expect(cantrips).toHaveLength(3);
    expect(cantrips.map((c) => c.name)).toContain('Ray of Frost');
    expect(cantrips.map((c) => c.name)).toContain('Acid Splash');
    expect(cantrips.map((c) => c.name)).toContain('Daze');
  });

  it('should mark cantrips as not requiring slots', () => {
    const wizard = createWizard();
    const actions = getAvailableActions(wizard);

    const cantrips = actions.filter(
      (a) => a.type === 'cast_spell' && a.spellLevel === 0
    ) as CastSpellAction[];

    cantrips.forEach((cantrip) => {
      expect(cantrip.requiresSlot).toBe(false);
      expect(cantrip.available).toBe(true);
    });
  });

  it('should have level 1 spell option when slots available', () => {
    const wizard = createWizard();
    const actions = getAvailableActions(wizard);

    const level1Spell = actions.find(
      (a) => a.type === 'cast_spell' && a.spellLevel === 1
    ) as CastSpellAction;

    expect(level1Spell).toBeDefined();
    expect(level1Spell.requiresSlot).toBe(true);
    expect(level1Spell.available).toBe(true);
    expect(level1Spell.description).toContain('2/2'); // Slots remaining
  });

  it('should not show level 1 spell when no slots', () => {
    const wizard = createWizard();
    wizard.resources.spellSlots!.level1.current = 0;
    const actions = getAvailableActions(wizard);

    const level1Spell = actions.find((a) => a.type === 'cast_spell' && a.spellLevel === 1);
    expect(level1Spell).toBeUndefined();
  });
});

describe('Actions - Cleric', () => {
  it('should have 3 cantrips', () => {
    const cleric = createCleric();
    const actions = getAvailableActions(cleric);

    const cantrips = actions.filter(
      (a) => a.type === 'cast_spell' && a.spellLevel === 0
    ) as CastSpellAction[];

    expect(cantrips).toHaveLength(3);
    expect(cantrips.map((c) => c.name)).toContain('Divine Favor');
    expect(cantrips.map((c) => c.name)).toContain('Resistance');
    expect(cantrips.map((c) => c.name)).toContain('Sacred Flame');
  });

  it('should have both Attack and cantrips', () => {
    const cleric = createCleric();
    const actions = getAvailableActions(cleric);

    const attack = actions.find((a) => a.type === 'attack');
    const cantrips = actions.filter((a) => a.type === 'cast_spell' && a.spellLevel === 0);

    expect(attack).toBeDefined();
    expect(cantrips).toHaveLength(3);
  });
});

describe('Action Validation - canPerformAction', () => {
  it('should allow Attack action', () => {
    const fighter = createFighter();
    const actions = getAvailableActions(fighter);
    const attack = actions.find((a) => a.name === 'Attack')!;

    expect(canPerformAction(fighter, attack)).toBe(true);
  });

  it('should allow ability with uses remaining', () => {
    const fighter = createFighter();
    const actions = getAvailableActions(fighter);
    const secondWind = actions.find((a) => a.name === 'Second Wind')!;

    expect(canPerformAction(fighter, secondWind)).toBe(true);
  });

  it('should block ability with no uses', () => {
    const fighter = createFighter();
    fighter.resources.abilities[0].currentUses = 0;
    const actions = getAvailableActions(fighter);
    const secondWind = actions.find((a) => a.name === 'Second Wind')!;

    expect(canPerformAction(fighter, secondWind)).toBe(false);
  });

  it('should allow at-will abilities', () => {
    const fighter = createFighter();
    fighter.resources.abilities[0].type = 'at-will';
    fighter.resources.abilities[0].currentUses = 0;
    const actions = getAvailableActions(fighter);
    const ability = actions.find((a) => a.name === 'Second Wind')!;

    expect(canPerformAction(fighter, ability)).toBe(true);
  });

  it('should allow cantrips (at-will spells)', () => {
    const wizard = createWizard();
    const actions = getAvailableActions(wizard);
    const cantrip = actions.find((a) => a.type === 'cast_spell' && a.spellLevel === 0)!;

    expect(canPerformAction(wizard, cantrip)).toBe(true);
  });

  it('should allow level 1 spell with slots', () => {
    const wizard = createWizard();
    const actions = getAvailableActions(wizard);
    const level1Spell = actions.find((a) => a.type === 'cast_spell' && a.spellLevel === 1)!;

    expect(canPerformAction(wizard, level1Spell)).toBe(true);
  });

  it('should block level 1 spell without slots', () => {
    const wizard = createWizard();
    wizard.resources.spellSlots!.level1.current = 0;
    const actions = getAvailableActions(wizard);
    const level1Spell = actions.find((a) => a.type === 'cast_spell' && a.spellLevel === 1);

    // Level 1 spell shouldn't even appear in actions if no slots
    expect(level1Spell).toBeUndefined();
  });

  it('should block unavailable actions', () => {
    const fighter = createFighter();
    const fakeAction = {
      type: 'attack' as const,
      name: 'Fake Attack',
      description: 'Fake',
      available: false,
    };

    expect(canPerformAction(fighter, fakeAction)).toBe(false);
  });
});
