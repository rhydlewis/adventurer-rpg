import { describe, it, expect } from 'vitest';
import type { CampEvent, CampEventTable } from '../../types/campEvents';

describe('Camp Event Types', () => {
  it('should create valid camp event', () => {
    const event: CampEvent = {
      id: 'night-prowler',
      type: 'encounter',
      title: 'Night Prowler',
      description: 'You hear something moving in the darkness...',
      weight: 10,
      repeatable: true,
      choices: [
        {
          id: 'investigate',
          text: 'Investigate the sound',
          outcome: { type: 'continue' },
        },
      ],
    };

    expect(event.id).toBe('night-prowler');
    expect(event.choices).toHaveLength(1);
  });

  it('should create valid camp event table', () => {
    const table: CampEventTable = {
      locationId: 'act1-forest',
      rollChance: 50,
      events: [],
    };

    expect(table.rollChance).toBe(50);
    expect(table.events).toEqual([]);
  });

  it('should create combat outcome', () => {
    const combatOutcome: CampEvent = {
      id: 'wolf-attack',
      type: 'ambush',
      title: 'Wolf Attack',
      description: 'A wolf leaps from the shadows!',
      weight: 5,
      repeatable: true,
      choices: [
        {
          id: 'fight',
          text: 'Fight the wolf',
          outcome: {
            type: 'combat',
            enemyId: 'blighted-wolf',
            onVictoryReturn: 'rest',
          },
        },
      ],
    };

    const outcome = combatOutcome.choices[0].outcome;
    expect(outcome.type).toBe('combat');
    if (outcome.type === 'combat') {
      expect(outcome.enemyId).toBe('blighted-wolf');
      expect(outcome.onVictoryReturn).toBe('rest');
    }
  });
});
