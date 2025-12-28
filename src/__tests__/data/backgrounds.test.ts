import { describe, it, expect } from 'vitest';
import { BACKGROUNDS, getBackgroundByClass } from '../../data/backgrounds';

describe('Backgrounds Data', () => {
  it('should have exactly one background per class', () => {
    const classes = ['Fighter', 'Rogue', 'Wizard', 'Cleric'] as const;

    classes.forEach(cls => {
      const bg = getBackgroundByClass(cls);
      expect(bg).toBeDefined();
      expect(bg.class).toBe(cls);
    });
  });

  it('should have valid attribute biases (sum to 66)', () => {
    Object.values(BACKGROUNDS).forEach(bg => {
      const total = Object.values(bg.attributeBias || {}).reduce((sum, val) => sum + (val || 0), 0);
      expect(total).toBe(66); // All backgrounds use same total
    });
  });

  it('should map quirks correctly to classes', () => {
    expect(BACKGROUNDS['border-guard'].startingQuirk).toBe('auto-block-first-attack');
    expect(BACKGROUNDS['street-urchin'].startingQuirk).toBe('start-hidden');
    expect(BACKGROUNDS['academy-dropout'].startingQuirk).toBe('arcane-shield-turn-1');
    expect(BACKGROUNDS['temple-acolyte'].startingQuirk).toBe('auto-heal-first-hit');
  });

  it('should have dialogue tags for narrative gating', () => {
    expect(BACKGROUNDS['border-guard'].dialogueTags).toContain('authority');
    expect(BACKGROUNDS['street-urchin'].dialogueTags).toContain('streetwise');
    expect(BACKGROUNDS['academy-dropout'].dialogueTags).toContain('arcane');
    expect(BACKGROUNDS['temple-acolyte'].dialogueTags).toContain('faith');
  });
});
