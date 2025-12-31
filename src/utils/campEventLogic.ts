import type { CampEvent, CampEventTable, CampEventOutcome } from '../types/campEvents';
import type { Character } from '../types/character';
import type { WorldState, NodeEffect } from '../types/narrative';
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
  console.log('[CampEventLogic] Event roll:', eventRoll.toFixed(1), '/ needs <=', table.rollChance);

  if (eventRoll > table.rollChance) {
    console.log('[CampEventLogic] Roll failed, no event occurs');
    return null; // No event
  }

  console.log('[CampEventLogic] Roll succeeded! Selecting from', table.events.length, 'total events');

  // Filter events by requirements
  const availableEvents = table.events.filter(event => {
    if (!event.requirements) return true;
    return checkAllRequirements(event.requirements, world, character);
  });

  console.log('[CampEventLogic] Available events after filtering:', availableEvents.length);
  if (availableEvents.length === 0) {
    console.log('[CampEventLogic] No eligible events after requirement filtering');
    return null;
  }

  // Weighted random selection
  const totalWeight = availableEvents.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  console.log('[CampEventLogic] Weighted selection - total weight:', totalWeight, 'roll:', roll.toFixed(1));

  for (const event of availableEvents) {
    roll -= event.weight;
    if (roll <= 0) {
      console.log('[CampEventLogic] Selected event:', event.title, '(weight:', event.weight, ')');
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
  effects: NodeEffect[];
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
