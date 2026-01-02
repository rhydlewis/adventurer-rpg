import type { ExplorationTable } from '../../types';
import { blackwoodEncounters } from './blackwood-encounters';

export const ENCOUNTER_TABLES: Record<string, ExplorationTable> = {
  'blackwood-encounters': blackwoodEncounters,
};

export function getEncounterTable(tableId: string): ExplorationTable | null {
  return ENCOUNTER_TABLES[tableId] || null;
}
