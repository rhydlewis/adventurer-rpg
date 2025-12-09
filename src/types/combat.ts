import type { Character } from './character';

// For now, Creature uses the same structure as Character
// We can differentiate them later (e.g., add AI behavior, loot, etc.)
export type Creature = Character;

export interface CombatLogEntry {
  turn: number;
  actor: 'player' | 'enemy' | 'system';
  message: string;
}

export interface CombatState {
  turn: number;
  playerCharacter: Character;
  enemy: Creature;
  log: CombatLogEntry[];
  winner: 'player' | 'enemy' | null;
}