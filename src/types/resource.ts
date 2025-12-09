export type ResourceType =
  | 'encounter' // Restores on short rest
  | 'daily' // Restores on long rest
  | 'at-will'; // Unlimited

export interface AbilityResource {
  name: string;
  type: ResourceType;
  maxUses: number;
  currentUses: number;
  description: string;
}

export interface SpellSlots {
  level0: { max: number; current: number }; // Cantrips (at-will, but tracked for UI)
  level1: { max: number; current: number };
}

export interface Resources {
  abilities: AbilityResource[]; // e.g., Second Wind, Dodge, Channel Energy
  spellSlots?: SpellSlots; // Only for Wizard/Cleric
  powerAttackActive?: boolean; // Fighter-specific toggle
}
