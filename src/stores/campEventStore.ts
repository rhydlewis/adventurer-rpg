import { create } from 'zustand';
import type { CampEvent, CampEventTable } from '../types/campEvents';
import { rollForCampEvent, resolveCampOutcome } from '../utils/campEventLogic';
import { useCharacterStore } from './characterStore';
import { useNarrativeStore } from './narrativeStore';

interface CampEventStore {
  currentEvent: CampEvent | null;
  eventTables: Record<string, CampEventTable>;

  // Actions
  loadEventTable: (table: CampEventTable) => void;
  triggerCampEvent: (locationId: string) => CampEvent | null;
  selectChoice: (choiceId: string) => void;
  clearEvent: () => void;
}

export const useCampEventStore = create<CampEventStore>((set, get) => ({
  currentEvent: null,
  eventTables: {},

  loadEventTable: (table: CampEventTable) => {
    set(state => ({
      eventTables: {
        ...state.eventTables,
        [table.locationId]: table,
      },
    }));
  },

  triggerCampEvent: (locationId: string) => {
    const table = get().eventTables[locationId];
    console.log('[CampEventStore] Trigger check for location:', locationId);
    console.log('[CampEventStore] Available tables:', Object.keys(get().eventTables));

    if (!table) {
      console.log('[CampEventStore] No event table found for location:', locationId);
      return null;
    }

    console.log('[CampEventStore] Event table found, rollChance:', table.rollChance + '%');
    const character = useCharacterStore.getState().character;
    const world = useNarrativeStore.getState().world;
    if (!character || !world) {
      console.log('[CampEventStore] Missing character or world state');
      return null;
    }

    const event = rollForCampEvent(table, world, character);
    console.log('[CampEventStore] Roll result:', event ? `Event: ${event.title}` : 'No event');
    set({ currentEvent: event });
    return event;
  },

  selectChoice: (choiceId: string) => {
    const { currentEvent } = get();
    if (!currentEvent) return;

    const choice = currentEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const result = resolveCampOutcome(choice.outcome);

    // TODO: Apply effects, trigger combat if needed

    if (result.continueRest) {
      set({ currentEvent: null });
    }
  },

  clearEvent: () => {
    set({ currentEvent: null });
  },
}));
