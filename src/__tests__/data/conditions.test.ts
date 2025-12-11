import { describe, it, expect } from 'vitest';
import { CONDITION_DEFINITIONS, DEFAULT_DURATIONS } from '../../data/conditions';
import type { ConditionType } from '../../types';

describe('data/conditions', () => {
  it('CONDITION_DEFINITIONS should be defined and contain expected conditions', () => {
    expect(CONDITION_DEFINITIONS).toBeDefined();
    expect(Object.keys(CONDITION_DEFINITIONS).length).toBeGreaterThan(0);
  });

  it('each condition definition should have required properties', () => {
    for (const conditionType in CONDITION_DEFINITIONS) {
      const condition = CONDITION_DEFINITIONS[conditionType as ConditionType];
      expect(condition).toHaveProperty('type');
      expect(condition).toHaveProperty('category');
      expect(condition).toHaveProperty('description');
      expect(condition).toHaveProperty('modifiers');
      expect(typeof condition.type).toBe('string');
      expect(['debuff', 'buff']).toContain(condition.category);
      expect(typeof condition.description).toBe('string');
      expect(typeof condition.modifiers).toBe('object');
    }
  });

  it('specific condition modifiers should be correct', () => {
    // Debuffs
    expect(CONDITION_DEFINITIONS.Stunned.modifiers.preventActions).toBe(true);
    expect(CONDITION_DEFINITIONS.Poisoned.modifiers.attackBonus).toBe(-2);
    expect(CONDITION_DEFINITIONS.Poisoned.modifiers.damagePerTurn).toEqual({ formula: '1d4', type: 'poison' });
    expect(CONDITION_DEFINITIONS.Weakened.modifiers.damageBonus).toBe(-2);
    expect(CONDITION_DEFINITIONS.Blinded.modifiers.attackBonus).toBe(-4);
    expect(CONDITION_DEFINITIONS.Blinded.modifiers.preventTargetedSpells).toBe(true);
    expect(CONDITION_DEFINITIONS.Silenced.modifiers.preventSpellcasting).toBe(true);
    expect(CONDITION_DEFINITIONS['Off-Balance'].modifiers.attackBonus).toBe(-2);


    // Buffs
    expect(CONDITION_DEFINITIONS.Strengthened.modifiers.attackBonus).toBe(2);
    expect(CONDITION_DEFINITIONS.Enchanted.modifiers.spellDcBonus).toBe(1);
    expect(CONDITION_DEFINITIONS.Shielded.modifiers.acBonus).toBe(4);
    expect(CONDITION_DEFINITIONS.Dodge.modifiers.acBonus).toBe(4);
    expect(CONDITION_DEFINITIONS['Divine Favor'].modifiers.saveBonus).toBe(1);
    expect(CONDITION_DEFINITIONS.Resistance.modifiers.saveBonus).toBe(1);
  });

  it('DEFAULT_DURATIONS should be defined', () => {
    expect(DEFAULT_DURATIONS).toBeDefined();
    expect(Object.keys(DEFAULT_DURATIONS).length).toBeGreaterThan(0);
  });

  it('every condition in CONDITION_DEFINITIONS should have a default duration', () => {
    const definedConditionTypes = Object.keys(CONDITION_DEFINITIONS);
    const durationTypes = Object.keys(DEFAULT_DURATIONS);

    definedConditionTypes.forEach(type => {
      expect(durationTypes).toContain(type);
      expect(typeof DEFAULT_DURATIONS[type as ConditionType]).toBe('number');
      expect(DEFAULT_DURATIONS[type as ConditionType]).toBeGreaterThan(0);
    });
  });

  it('every duration in DEFAULT_DURATIONS should correspond to a defined condition', () => {
    const definedConditionTypes = Object.keys(CONDITION_DEFINITIONS);
    const durationTypes = Object.keys(DEFAULT_DURATIONS);

    durationTypes.forEach(type => {
      expect(definedConditionTypes).toContain(type);
    });
  });
});
