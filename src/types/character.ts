import type { InventoryItem } from './equipment';
import type { Background, CharacterTrait, StartingQuirk } from './background';
import type { Entity } from "./entity";

export type CharacterClass = 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric';

export interface Character extends Entity {
  class: CharacterClass;
  background?: Background;
  traits?: CharacterTrait[];

  // Validation campaign: Inventory & Gold (optional for backward compatibility)
  gold?: number;
  inventory?: InventoryItem[];
  maxInventorySlots?: number;

  // Validation campaign: Character creation
  startingQuirk?: StartingQuirk;
  mechanicsLocked?: boolean; // false until Phase 2 complete
}