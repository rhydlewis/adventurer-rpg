import type { SkillDefinition, SkillName } from '../types/skill';

export const SKILLS: Record<SkillName, SkillDefinition> = {
  Athletics: {
    name: 'Athletics',
    ability: 'STR',
    description: 'Climb, jump, swim, and perform feats of strength',
  },
  Stealth: {
    name: 'Stealth',
    ability: 'DEX',
    description: 'Move silently and hide from enemies',
  },
  Perception: {
    name: 'Perception',
    ability: 'WIS',
    description: 'Notice details and detect hidden things',
  },
  Arcana: {
    name: 'Arcana',
    ability: 'INT',
    description: 'Knowledge of magic, spells, and arcane lore',
  },
  Medicine: {
    name: 'Medicine',
    ability: 'WIS',
    description: 'Heal wounds and treat diseases',
  },
  Intimidate: {
    name: 'Intimidate',
    ability: 'CHA',
    description: 'Influence others through threats and force of personality',
  },
};

// Class skills (which classes get +3 bonus when trained)
export const CLASS_SKILLS: Record<string, SkillName[]> = {
  Fighter: ['Athletics', 'Intimidate'],
  Rogue: ['Stealth', 'Perception'],
  Wizard: ['Arcana'],
  Cleric: ['Medicine'],
};
