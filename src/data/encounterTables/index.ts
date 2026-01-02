import type { ExplorationTable } from '../../types';
import { blackwoodEncounters } from './blackwood-encounters';
import { towerApproachEncounters } from './tower-approach-encounters';
import { towerInteriorEncounters } from './tower-interior-encounters';
import { catacombsEncounters } from './catacombs-encounters';
import { voidSanctumEncounters } from './void-sanctum-encounters';

export const ENCOUNTER_TABLES: Record<string, ExplorationTable> = {
  'blackwood-encounters': blackwoodEncounters,
  'tower-approach-encounters': towerApproachEncounters,
  'tower-interior-encounters': towerInteriorEncounters,
  'catacombs-encounters': catacombsEncounters,
  'void-sanctum-encounters': voidSanctumEncounters,
};

export function getEncounterTable(tableId: string): ExplorationTable | null {
  return ENCOUNTER_TABLES[tableId] || null;
}
