import type { ExplorationTable, ExplorationOutcome } from '../types/narrative';

/**
 * Roll on an exploration table to determine outcome
 * Uses d100 with weighted ranges (e.g., 1-60 = combat, 61-80 = treasure)
 */
export function rollExplorationTable(table: ExplorationTable): ExplorationOutcome {
  // Roll d100 (1-100)
  const roll = Math.floor(Math.random() * 100) + 1;

  // Calculate cumulative weights
  let cumulative = 0;
  for (const encounter of table.encounters) {
    cumulative += encounter.weight;
    if (roll <= cumulative) {
      return encounter.outcome;
    }
  }

  // Fallback to last encounter if something goes wrong
  return table.encounters[table.encounters.length - 1].outcome;
}

/**
 * Resolve exploration by table ID
 * Looks up table, rolls for outcome
 */
export function resolveExploration(
  tableId: string,
  tables: Record<string, ExplorationTable>
): ExplorationOutcome {
  const table = tables[tableId];
  if (!table) {
    throw new Error(`Exploration table not found: ${tableId}`);
  }

  return rollExplorationTable(table);
}

/**
 * Validate exploration table weights sum to 100
 */
export function validateExplorationTable(table: ExplorationTable): boolean {
  const total = table.encounters.reduce((sum, e) => sum + e.weight, 0);
  return total === 100;
}
