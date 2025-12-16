import { describe, it, expect } from 'vitest';
import { TRAITS, getTrait } from '../../data/traits';
import type { Character } from '../../types';

describe('Defining Traits Data', () => {
  it('should have exactly 3 universal traits', () => {
    expect(Object.keys(TRAITS)).toHaveLength(3);
    expect(TRAITS.bold).toBeDefined();
    expect(TRAITS.cautious).toBeDefined();
    expect(TRAITS['silver-tongued']).toBeDefined();
  });

  it('should have upside and downside for each trait', () => {
    Object.values(TRAITS).forEach(trait => {
      expect(trait.upside).toBeDefined();
      expect(trait.downside).toBeDefined();
      expect(typeof trait.upside.apply).toBe('function');
      expect(typeof trait.downside.apply).toBe('function');
    });
  });

  it('cautious trait should increase AC by 2', () => {
    const mockCharacter = { ac: 15 } as Character;
    const result = TRAITS.cautious.upside.apply(mockCharacter);

    expect(result.ac).toBe(17);
  });

  it('should throw error for non-existent trait', () => {
    expect(() => getTrait('fake-trait')).toThrow('Trait not found');
  });
});
