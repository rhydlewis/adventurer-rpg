import type { CampEvent, CampEventTable, CampEventOutcome } from '../types/campEvents';
import type { Character } from '../types/character';
import type { WorldState } from '../types/narrative';
import { checkAllRequirements } from './narrativeLogic';

/**
 * Determine if a camp event should occur.
 * Uses weighted random selection from available events.
 */
export function rollForCampEvent(
  table: CampEventTable,
  world: WorldState,
  character: Character
): CampEvent | null {
  // First, check if any event happens at all
  const eventRoll = Math.random() * 100;
  if (eventRoll > table.rollChance) {
    return null; // No event
  }

  // Filter events by requirements
  const availableEvents = table.events.filter(event => {
    if (!event.requirements) return true;
    return checkAllRequirements(event.requirements, world, character);
  });

  if (availableEvents.length === 0) return null;

  // Weighted random selection
  const totalWeight = availableEvents.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const event of availableEvents) {
    roll -= event.weight;
    if (roll <= 0) {
      return event;
    }
  }

  return availableEvents[0]; // Fallback
}

/**
 * Get available choices for a camp event based on requirements.
 */
export function getAvailableCampChoices(
  event: CampEvent,
  world: WorldState,
  character: Character
) {
  return event.choices.filter(choice => {
    if (!choice.requirements) return true;
    return checkAllRequirements(choice.requirements, world, character);
  });
}

/**
 * Resolve a camp event outcome.
 */
export function resolveCampOutcome(
  outcome: CampEventOutcome
): {
  continueRest: boolean;
  combatTriggered: boolean;
  effects: any[];
} {
  switch (outcome.type) {
    case 'continue':
      return { continueRest: true, combatTriggered: false, effects: [] };

    case 'interrupt':
      return { continueRest: false, combatTriggered: false, effects: outcome.effect };

    case 'combat':
      return { continueRest: false, combatTriggered: true, effects: [] };
  }
}
