import type { ClassFeatureCatalog } from '../../types/classFeatures';

export const classFeatures: ClassFeatureCatalog = {
  // ========================================
  // FIGHTER FEATURES
  // ========================================
  'fighter-bonus-feat': {
    id: 'fighter-bonus-feat',
    name: 'Bonus Feat',
    type: 'bonus',
    description: 'Fighters gain bonus combat feats at levels 1, 2, and 4.',
    class: 'Fighter',
    level: 1,
  },
  'fighter-bonus-feat-2': {
    id: 'fighter-bonus-feat-2',
    name: 'Bonus Feat',
    type: 'bonus',
    description: 'Fighters gain bonus combat feats at levels 1, 2, and 4.',
    class: 'Fighter',
    level: 2,
  },
  'weapon-specialization': {
    id: 'weapon-specialization',
    name: 'Weapon Specialization',
    type: 'combat',
    description: 'Gain +2 damage with all melee weapons.',
    class: 'Fighter',
    level: 3,
    effect: { type: 'damage_bonus', amount: 2 },
  },
  'fighter-bonus-feat-4': {
    id: 'fighter-bonus-feat-4',
    name: 'Bonus Feat',
    type: 'bonus',
    description: 'Fighters gain bonus combat feats at levels 1, 2, and 4.',
    class: 'Fighter',
    level: 4,
  },
  'improved-critical': {
    id: 'improved-critical',
    name: 'Improved Critical',
    type: 'combat',
    description: 'Critical hits deal triple damage instead of double.',
    class: 'Fighter',
    level: 5,
    effect: { type: 'special', description: 'Triple damage on crits' },
  },

  // ========================================
  // ROGUE FEATURES
  // ========================================
  'sneak-attack-1d6': {
    id: 'sneak-attack-1d6',
    name: 'Sneak Attack +1d6',
    type: 'combat',
    description: 'Deal +1d6 damage when attacking with advantage or flanking.',
    class: 'Rogue',
    level: 1,
    effect: { type: 'damage_bonus', amount: '1d6' },
  },
  'sneak-attack-2d6': {
    id: 'sneak-attack-2d6',
    name: 'Sneak Attack +2d6',
    type: 'combat',
    description: 'Deal +2d6 damage when attacking with advantage or flanking.',
    class: 'Rogue',
    level: 3,
    effect: { type: 'damage_bonus', amount: '2d6' },
  },
  'sneak-attack-3d6': {
    id: 'sneak-attack-3d6',
    name: 'Sneak Attack +3d6',
    type: 'combat',
    description: 'Deal +3d6 damage when attacking with advantage or flanking.',
    class: 'Rogue',
    level: 5,
    effect: { type: 'damage_bonus', amount: '3d6' },
  },
  'trapfinding': {
    id: 'trapfinding',
    name: 'Trapfinding',
    type: 'passive',
    description: 'Gain +2 bonus to find and disable traps.',
    class: 'Rogue',
    level: 1,
    effect: { type: 'skill_bonus', skill: 'disable-device', amount: 2 },
  },
  'evasion': {
    id: 'evasion',
    name: 'Evasion',
    type: 'passive',
    description: 'Take no damage on successful Reflex save (instead of half).',
    class: 'Rogue',
    level: 2,
    effect: { type: 'special', description: 'No damage on successful Reflex save' },
  },
  'uncanny-dodge': {
    id: 'uncanny-dodge',
    name: 'Uncanny Dodge',
    type: 'passive',
    description: 'Cannot be caught flat-footed.',
    class: 'Rogue',
    level: 3,
    effect: { type: 'special', description: 'Never flat-footed' },
  },

  // ========================================
  // WIZARD FEATURES
  // ========================================
  'arcane-spellcasting': {
    id: 'arcane-spellcasting',
    name: 'Arcane Spellcasting',
    type: 'spell',
    description: 'Cast arcane spells from your spellbook.',
    class: 'Wizard',
    level: 1,
  },
  'scribe-scroll': {
    id: 'scribe-scroll',
    name: 'Scribe Scroll',
    type: 'passive',
    description: 'Create spell scrolls (not implemented yet).',
    class: 'Wizard',
    level: 1,
  },
  'bonus-feat-wizard': {
    id: 'bonus-feat-wizard',
    name: 'Bonus Metamagic Feat',
    type: 'bonus',
    description: 'Gain a bonus metamagic feat.',
    class: 'Wizard',
    level: 5,
  },

  // ========================================
  // CLERIC FEATURES
  // ========================================
  'divine-spellcasting': {
    id: 'divine-spellcasting',
    name: 'Divine Spellcasting',
    type: 'spell',
    description: 'Cast divine spells granted by your deity.',
    class: 'Cleric',
    level: 1,
  },
  'turn-undead': {
    id: 'turn-undead',
    name: 'Turn Undead',
    type: 'active',
    description: 'Force undead creatures to flee or be destroyed.',
    class: 'Cleric',
    level: 1,
    effect: { type: 'special', description: 'Turn/destroy undead' },
  },
};

export function getClassFeature(featureId: string) {
  return classFeatures[featureId] || null;
}

export function getClassFeaturesForLevel(className: string, level: number) {
  return Object.values(classFeatures).filter(
    f => f.class === className && f.level === level
  );
}
