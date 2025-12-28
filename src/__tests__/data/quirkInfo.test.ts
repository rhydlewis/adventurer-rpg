import { describe, it, expect } from 'vitest';
import { QUIRK_INFO, getQuirkInfo } from '../../data/quirkInfo';

describe('QuirkInfo', () => {
  it('should have display info for all quirks', () => {
    const quirks = ['auto-block-first-attack', 'start-hidden',
                    'arcane-shield-turn-1', 'auto-heal-first-hit'] as const;

    quirks.forEach(quirk => {
      expect(QUIRK_INFO[quirk]).toBeDefined();
      expect(QUIRK_INFO[quirk].displayName).toBeTruthy();
      expect(QUIRK_INFO[quirk].description).toBeTruthy();
      expect(QUIRK_INFO[quirk].combatMessage).toBeTruthy();
    });
  });

  it('should return quirk info via getQuirkInfo helper', () => {
    const quirkInfo = getQuirkInfo('auto-block-first-attack');

    expect(quirkInfo).toBeDefined();
    expect(quirkInfo.displayName).toBe('Automatic Block');
    expect(quirkInfo.description).toBe('Your guard training deflects the first attack in combat');
    expect(quirkInfo.combatMessage).toBe("Your guard training kicks in—you deflect the blow!");
  });

  it('should have non-empty strings for all fields', () => {
    Object.values(QUIRK_INFO).forEach(info => {
      expect(info.displayName.length).toBeGreaterThan(0);
      expect(info.description.length).toBeGreaterThan(0);
      expect(info.combatMessage.length).toBeGreaterThan(0);
    });
  });
});
