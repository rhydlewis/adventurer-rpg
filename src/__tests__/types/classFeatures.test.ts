import { describe, it, expect } from 'vitest';
import type { ClassFeature } from '../../types/classFeatures';

describe('Class Feature Types', () => {
  it('should create valid class feature', () => {
    const sneakAttack: ClassFeature = {
      id: 'sneak-attack-1d6',
      name: 'Sneak Attack +1d6',
      type: 'combat',
      description: 'Deal +1d6 damage when attacking from advantage',
      class: 'Rogue',
      level: 1,
      effect: { type: 'damage_bonus', amount: '1d6' },
    };

    expect(sneakAttack.id).toBe('sneak-attack-1d6');
    expect(sneakAttack.effect?.type).toBe('damage_bonus');
  });

  it('should create passive feature', () => {
    const evasion: ClassFeature = {
      id: 'evasion',
      name: 'Evasion',
      type: 'passive',
      description: 'Take no damage on successful Reflex save',
      class: 'Rogue',
      level: 2,
      effect: { type: 'special', description: 'No damage on successful Reflex save' },
    };

    expect(evasion.type).toBe('passive');
  });

  it('should create feature without effect', () => {
    const spellcasting: ClassFeature = {
      id: 'arcane-spellcasting',
      name: 'Arcane Spellcasting',
      type: 'spell',
      description: 'Cast arcane spells from your spellbook',
      class: 'Wizard',
      level: 1,
    };

    expect(spellcasting.effect).toBeUndefined();
  });
});
