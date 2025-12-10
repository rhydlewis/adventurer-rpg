import type { Character } from './character';

// For now, Creature uses the same structure as Character
// We can differentiate them later (e.g., add AI behavior, loot, etc.)
export type Creature = Character;

export interface CombatLogEntry {
  turn: number;
  actor: 'player' | 'enemy' | 'system';
  message: string;
}

export interface InitiativeResult {
  actor: 'player' | 'enemy';
  roll: number;
  bonus: number;
  total: number;
}

export interface CombatState {
  turn: number;
  playerCharacter: Character;
  enemy: Creature;
  log: CombatLogEntry[];
  winner: 'player' | 'enemy' | null;
  // Phase 1.2: Initiative and turn order
  initiative: {
    player: InitiativeResult;
    enemy: InitiativeResult;
    order: ('player' | 'enemy')[];
  } | null;
  currentActor: 'player' | 'enemy';
  // Phase 1.2+: Fumble effects tracking
  fumbleEffects?: {
    player?: {
      type: string;
      turnsRemaining?: number;
    };
    enemy?: {
      type: string;
      turnsRemaining?: number;
    };
  };
  // Phase 1.3: Rogue Dodge tracking
  dodgeActive?: {
    player?: boolean;
    enemy?: boolean;
  };
  // Phase 1.3: Spell buff tracking (Divine Favor, Resistance, etc.)
  activeBuffs?: {
    player?: string[]; // Array of active buff names
    enemy?: string[];
  };
}