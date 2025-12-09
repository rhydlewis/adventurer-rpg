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

export interface Item {
  name: ItemType;
  description: string;
  effect: ItemEffect;
  quantity: number;
}

export type ItemEffect =
  | { type: 'heal'; amount: string } // e.g., '2d8+2'
  | { type: 'escape' } // Smoke bomb
  | { type: 'spell'; spellName: string }; // Arcane scroll

export interface Equipment {
  weapon: Weapon;
  armor: Armor;
  shield: Shield;
  items: Item[];
}
