export type ClassFeatureType =
  | 'passive'     // Always active (e.g., Evasion)
  | 'active'      // Activated ability (e.g., Turn Undead)
  | 'combat'      // Used in combat (e.g., Sneak Attack)
  | 'spell'       // Spellcasting ability
  | 'bonus';      // Bonus to stats/rolls

export interface ClassFeature {
  id: string;
  name: string;
  type: ClassFeatureType;
  description: string;
  class: string;  // Which class gets this feature
  level: number;  // Level granted

  // Mechanical effects
  effect?: ClassFeatureEffect;
}

export type ClassFeatureEffect =
  | { type: 'damage_bonus'; amount: number | string }  // "+2" or "1d6"
  | { type: 'ac_bonus'; amount: number }
  | { type: 'save_bonus'; save: 'fort' | 'reflex' | 'will'; amount: number }
  | { type: 'skill_bonus'; skill: string; amount: number }
  | { type: 'special'; description: string };  // Custom effects handled in code

export interface ClassFeatureCatalog {
  [featureId: string]: ClassFeature;
}
