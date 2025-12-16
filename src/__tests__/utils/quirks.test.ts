import { describe, it, expect } from 'vitest';
import { applyStartingQuirk } from '../../utils/quirks';
import type { Character } from '../../types';
import type { CombatState } from '../../types';

describe('Starting Quirks System', () => {
  const mockPlayer: Partial<Character> = {
    name: 'Test Fighter',
    class: 'Fighter',
    startingQuirk: 'auto-block-first-attack',
  };

  const mockCombat: Partial<CombatState> = {
    playerCharacter: mockPlayer as Character,
    turn: 1,
    log: [],
  };

  it('should apply auto-block quirk on first attack', () => {
    const result = applyStartingQuirk(
      mockPlayer as Character,
      mockCombat as CombatState,
      'first-attack'
    );

    // Check that AC bonus was applied
    expect(result.acBonus).toBe(2);

    // Check that discovery message was added
    const discoveryLog = result.log.find(entry =>
      entry.message.includes('guard training')
    );
    expect(discoveryLog).toBeDefined();
  });

  it('should apply start-hidden quirk on combat start', () => {
    const roguePlayer = { ...mockPlayer, class: 'Rogue', startingQuirk: 'start-hidden' };
    const result = applyStartingQuirk(
      roguePlayer as Character,
      mockCombat as CombatState,
      'combat-start'
    );

    expect(result.playerHidden).toBe(true);
    expect(result.log).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining('shadows') })
    );
  });

  it('should apply bonus-cantrip quirk on turn 1', () => {
    const wizardPlayer = { ...mockPlayer, class: 'Wizard', startingQuirk: 'bonus-cantrip-turn-1' };
    const result = applyStartingQuirk(
      wizardPlayer as Character,
      mockCombat as CombatState,
      'turn-1'
    );

    expect(result.playerExtraAction).toBe(true);
    expect(result.log).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining('Arcane energy') })
    );
  });

  it('should apply healing-aura quirk on turn 1', () => {
    const clericPlayer: Partial<Character> = {
      ...mockPlayer,
      class: 'Cleric',
      startingQuirk: 'healing-aura',
      hp: 10,
      maxHp: 15,
    };

    const result = applyStartingQuirk(
      clericPlayer as Character,
      mockCombat as CombatState,
      'turn-1'
    );

    expect(result.playerHp).toBe(11); // 10 + 1
    expect(result.log).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining('faith sustains') })
    );
  });

  it('should do nothing if quirk already triggered', () => {
    const result = applyStartingQuirk(
      mockPlayer as Character,
      { ...mockCombat, quirkTriggered: true } as CombatState,
      'first-attack'
    );

    expect(result.log).toHaveLength(0); // No new log entries
  });
});
