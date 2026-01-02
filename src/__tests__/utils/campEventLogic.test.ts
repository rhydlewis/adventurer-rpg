import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rollForCampEvent, getAvailableCampChoices, resolveCampOutcome } from '../../utils/campEventLogic';
import type { CampEvent, CampEventTable } from '../../types/campEvents';
import type { WorldState } from '../../types/narrative';
import type { Character } from '../../types/character';

describe('rollForCampEvent', () => {
  const mockWorld: WorldState = {
    campaignId: 'test',
    currentActId: 'act1',
    currentNodeId: 'node1',
    flags: {},
    visitedNodeIds: [],
    inventory: [],
    currentLocationId: null,
    unlockedLocations: [],
    visitedLocations: [],
    unlockedSanctuaries: [],
  };

  const mockCharacter = {
    class: 'Fighter',
    skills: {},
    attributes: {},
  } as Character;

  const mockTable: CampEventTable = {
    locationId: 'test',
    rollChance: 100, // Always trigger for testing
    events: [
      {
        id: 'event1',
        type: 'story',
        title: 'Event 1',
        description: 'Test',
        weight: 10,
        repeatable: true,
        choices: [],
      },
      {
        id: 'event2',
        type: 'encounter',
        title: 'Event 2',
        description: 'Test',
        weight: 5,
        repeatable: true,
        choices: [],
      },
    ],
  };

  beforeEach(() => {
    // Reset Math.random mock before each test
    vi.unstubAllGlobals();
  });

  it('should return null if roll chance fails', () => {
    const table = { ...mockTable, rollChance: 0 };
    const result = rollForCampEvent(table, mockWorld, mockCharacter);

    expect(result).toBeNull();
  });

  it('should select event based on weight', () => {
    // Mock Math.random to return specific values
    // First call (event check) = 0.5 (triggers event since rollChance = 100)
    // Second call (event selection) = 0.1 (should select event1 with weight 10)
    let callCount = 0;
    vi.stubGlobal('Math', {
      ...Math,
      random: vi.fn(() => {
        callCount++;
        return callCount === 1 ? 0.5 : 0.1;
      }),
    });

    const result = rollForCampEvent(mockTable, mockWorld, mockCharacter);

    expect(result?.id).toBe('event1');
  });

  it('should filter events by requirements', () => {
    const tableWithRequirements: CampEventTable = {
      locationId: 'test',
      rollChance: 100,
      events: [
        {
          id: 'event-with-flag',
          type: 'story',
          title: 'Event With Flag',
          description: 'Test',
          weight: 10,
          repeatable: true,
          choices: [],
          requirements: [{ type: 'flag', flag: 'test_flag', value: true }],
        },
      ],
    };

    const worldWithoutFlag = { ...mockWorld, flags: {} };
    const result = rollForCampEvent(tableWithRequirements, worldWithoutFlag, mockCharacter);

    expect(result).toBeNull(); // Event filtered out due to unmet requirement
  });
});

describe('getAvailableCampChoices', () => {
  const mockWorld: WorldState = {
    campaignId: 'test',
    currentActId: 'act1',
    currentNodeId: 'node1',
    flags: { has_item: true },
    visitedNodeIds: [],
    inventory: [],
    currentLocationId: null,
    unlockedLocations: [],
    visitedLocations: [],
    unlockedSanctuaries: [],
  };

  const mockCharacter = {
    class: 'Fighter',
    skills: {},
    attributes: {},
  } as Character;

  const mockEvent: CampEvent = {
    id: 'test-event',
    type: 'encounter',
    title: 'Test Event',
    description: 'Test',
    weight: 10,
    repeatable: true,
    choices: [
      {
        id: 'choice1',
        text: 'Always available',
        outcome: { type: 'continue' },
      },
      {
        id: 'choice2',
        text: 'Requires flag',
        requirements: [{ type: 'flag', flag: 'has_item', value: true }],
        outcome: { type: 'continue' },
      },
      {
        id: 'choice3',
        text: 'Requires missing flag',
        requirements: [{ type: 'flag', flag: 'missing_flag', value: true }],
        outcome: { type: 'continue' },
      },
    ],
  };

  it('should return all choices when no requirements', () => {
    const simpleEvent: CampEvent = {
      ...mockEvent,
      choices: [
        { id: 'c1', text: 'Choice 1', outcome: { type: 'continue' } },
        { id: 'c2', text: 'Choice 2', outcome: { type: 'continue' } },
      ],
    };

    const result = getAvailableCampChoices(simpleEvent, mockWorld, mockCharacter);
    expect(result).toHaveLength(2);
  });

  it('should filter choices by requirements', () => {
    const result = getAvailableCampChoices(mockEvent, mockWorld, mockCharacter);

    expect(result).toHaveLength(2); // choice1 and choice2, not choice3
    expect(result.find(c => c.id === 'choice1')).toBeDefined();
    expect(result.find(c => c.id === 'choice2')).toBeDefined();
    expect(result.find(c => c.id === 'choice3')).toBeUndefined();
  });
});

describe('resolveCampOutcome', () => {
  it('should allow rest to continue on continue outcome', () => {
    const result = resolveCampOutcome({ type: 'continue' });

    expect(result.continueRest).toBe(true);
    expect(result.combatTriggered).toBe(false);
  });

  it('should interrupt rest on interrupt outcome', () => {
    const result = resolveCampOutcome({
      type: 'interrupt',
      effect: [{ type: 'damage', amount: 5 }],
    });

    expect(result.continueRest).toBe(false);
    expect(result.effects).toHaveLength(1);
  });

  it('should trigger combat on combat outcome', () => {
    const result = resolveCampOutcome({
      type: 'combat',
      enemyId: 'wolf',
      onVictoryReturn: 'rest',
    });

    expect(result.combatTriggered).toBe(true);
    expect(result.continueRest).toBe(false);
  });
});
