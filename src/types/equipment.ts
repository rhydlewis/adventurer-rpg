export type WeaponType = 'Longsword' | 'Rapier' | 'Dagger' | 'Mace' | 'Scimitar' | 'Bite' | 'Slam' | 'Tusk' | 'Spectral Touch';
export type ArmorType = 'none' | 'leather' | 'chainmail' | 'chain-mail' | 'leather-armor' | 'natural-armor';
export type ItemType = 'Healing Potion' | 'Smoke Bomb' | 'Arcane Scroll';

export interface Weapon {
  id?: string; // Unique identifier for weapon instances
  name: string; // Weapon name (loaded from JSON)
  damage: string; // Dice notation (e.g., '1d8', '1d6')
  damageType: 'slashing' | 'piercing' | 'bludgeoning';
  finesse: boolean; // If true, can use DEX for attack/damage instead of STR
  description: string;
  proficiencyRequired?: 'simple' | 'martial' | 'martial-finesse';
}

export interface Armor {
  name: string; // Armor name (loaded from JSON)
  baseAC: number; // Base AC provided (10 = no armor)
  maxDexBonus: number | null; // null = unlimited DEX bonus
  description: string;
  proficiencyRequired?: 'light' | 'medium' | 'heavy';
}

export interface Shield {
  equipped: boolean;
  acBonus: number; // Usually +2
}

// Enhanced for validation campaign
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'equipment' | 'quest' | 'treasure';
  usableInCombat: boolean;
  effect?: ItemEffect;
  value: number; // Sell price (typically 50% of buy price)
  quantity?: number; // For stackable items
}

// Backward compatibility
export type Item = InventoryItem;

export type ItemEffect =
  | { type: 'heal'; amount: string } // e.g., '2d8+2'
  | { type: 'buff'; stat: string; bonus: number; duration: number }
  | { type: 'damage'; amount: string } // throwable items
  | { type: 'escape' } // Smoke bomb (keep for backward compat)
  | { type: 'spell'; spellName: string } // Arcane scroll (keep for backward compat)
  | { type: 'remove-condition'; condition: string }; // NEW: Antidote

export interface Equipment {
  weapon: Weapon | null;        // Currently equipped weapon
  weapons: Weapon[];            // All owned weapons
  armor: Armor | null;          // Currently equipped armor
  shield: Shield | null;        // Shield status
  items: Item[];                // Consumables only (potions, scrolls, etc.)
}
