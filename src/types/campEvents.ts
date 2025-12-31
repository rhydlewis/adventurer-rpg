import type { Requirement, NodeEffect } from './narrative';

export type CampEventType = 'encounter' | 'story' | 'ambush' | 'discovery';

export interface CampEvent {
  id: string;
  type: CampEventType;
  title: string;
  description: string;

  // Requirements to trigger this event
  requirements?: Requirement[];

  // Weight for random selection (higher = more likely)
  weight: number;

  // Choices available during this event
  choices: CampEventChoice[];

  // Can this event repeat?
  repeatable: boolean;
}

export interface CampEventChoice {
  id: string;
  text: string;

  // Requirements to see this choice
  requirements?: Requirement[];

  // Outcome when selected
  outcome: CampEventOutcome;
}

export type CampEventOutcome =
  | { type: 'continue' }  // Continue resting
  | { type: 'interrupt'; effect: NodeEffect[] }  // Cancel rest, apply effects
  | { type: 'combat'; enemyId: string; onVictoryReturn: 'rest' | 'story' };

export interface CampEventTable {
  locationId: string;      // Which location/act uses this table
  events: CampEvent[];
  rollChance: number;      // 0-100, chance of event happening at all
}
