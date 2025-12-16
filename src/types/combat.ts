import type { Character } from './character';
import type { Condition } from './condition';
import type { Creature } from './creature';

// Validation campaign: Combat actions
export type CombatAction = 'attack' | 'retreat' | 'use-item';

export interface CombatLogEntry {
  turn: number;
  actor: 'player' | 'enemy' | 'system';
  message: string;
  // Validation campaign: Combat polish
  taunt?: string; // Enemy taunt text (e.g., "The goblin sneers: 'Is that all you've got?'")
  visualEffect?: 'strike-flash' | 'critical-hit' | 'heal-glow' | 'miss-fade';
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
  // Phase 1.4: Unified conditions system (replaces fumbleEffects, dodgeActive, activeBuffs)
  activeConditions?: {
    player: Condition[];
    enemy: Condition[];
  };
  // Validation campaign: Retreat mechanics
  canRetreat?: boolean; // tutorial fights disable this
  retreatPenalty?: {
    goldLost: number;
    damageOnFlee: number;
    narrativeFlag?: string; // "fled_from_skeleton"
    safeNodeId: string; // Where to return after retreat
  };
}