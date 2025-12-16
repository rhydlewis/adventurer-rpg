export type WeaponType = 'Longsword' | 'Rapier' | 'Dagger' | 'Mace';
export type ArmorType = 'None' | 'Leather' | 'Chainmail';
export type ItemType = 'Healing Potion' | 'Smoke Bomb' | 'Arcane Scroll';

export interface Weapon {
  name: WeaponType;
  damage: string; // Dice notation (e.g., '1d8', '1d6')
  damageType: 'slashing' | 'piercing' | 'bludgeoning';
  finesse: boolean; // If true, can use DEX for attack/damage instead of STR
  description: string;
}

export interface Armor {
  name: ArmorType;
  baseAC: number; // Base AC provided (10 = no armor)
  maxDexBonus: number | null; // null = unlimited DEX bonus
  description: string;
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
  type: 'consumable' | 'equipment' | 'quest';
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
  weapon: Weapon | null;
  armor: Armor | null;
  shield: Shield | null;
  items: Item[];
}
