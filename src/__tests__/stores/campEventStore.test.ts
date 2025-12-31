import { describe, it, expect, beforeEach } from 'vitest';
import { useCampEventStore } from '../../stores/campEventStore';
import type { CampEventTable } from '../../types/campEvents';

describe('CampEventStore', () => {
  beforeEach(() => {
    useCampEventStore.getState().clearEvent();
  });

  it('should load event table', () => {
    const table: CampEventTable = {
      locationId: 'test-location',
      rollChance: 50,
      events: [],
    };

    useCampEventStore.getState().loadEventTable(table);

    expect(useCampEventStore.getState().eventTables['test-location']).toBeDefined();
  });

  it('should clear current event', () => {
    useCampEventStore.setState({
      currentEvent: {
        id: 'test',
        type: 'story',
        title: 'Test',
        description: 'Test',
        weight: 10,
        repeatable: true,
        choices: [],
      },
    });

    useCampEventStore.getState().clearEvent();

    expect(useCampEventStore.getState().currentEvent).toBeNull();
  });

  it('should store multiple event tables by location', () => {
    const table1: CampEventTable = {
      locationId: 'location1',
      rollChance: 50,
      events: [],
    };

    const table2: CampEventTable = {
      locationId: 'location2',
      rollChance: 60,
      events: [],
    };

    useCampEventStore.getState().loadEventTable(table1);
    useCampEventStore.getState().loadEventTable(table2);

    const store = useCampEventStore.getState();
    expect(store.eventTables['location1']).toBeDefined();
    expect(store.eventTables['location2']).toBeDefined();
    expect(store.eventTables['location1'].rollChance).toBe(50);
    expect(store.eventTables['location2'].rollChance).toBe(60);
  });
});
