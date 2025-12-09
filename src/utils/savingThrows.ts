import type { Character } from '../types/character';

export type SaveType = 'negates' | 'half' | 'partial';
export type SaveCategory = 'fortitude' | 'reflex' | 'will';

export interface SaveResult {
  success: boolean;
  roll: number;
  bonus: number;
  total: number;
  dc: number;
  saveType: SaveCategory;
}

export interface AppliedSaveResult {
  applied: boolean;
  damageMultiplier?: number;
  duration?: number;
  description: string;
}

/**
 * Calculate save DC for spells and abilities
 * DC = 10 + spell/ability level + casting ability modifier
 *
 * @param level Spell or ability level (0 for cantrips)
 * @param abilityModifier Caster's ability modifier (INT for Wizard, WIS for Cleric, etc.)
 * @returns Save DC
 */
export function calculateSaveDC(level: number, abilityModifier: number): number {
  return 10 + level + abilityModifier;
}

/**
 * Make a saving throw for a character
 * Roll 1d20 + save bonus vs DC
 *
 * @param character Character making the save
 * @param saveType Type of save (fortitude, reflex, will)
 * @param dc Difficulty class to beat
 * @param naturalRoll Natural d20 roll (for testing, if not provided will roll)
 * @returns Save result with success/failure and details
 */
export function makeSavingThrow(
  character: Character,
  saveType: SaveCategory,
  dc: number,
  naturalRoll?: number
): SaveResult {
  const roll = naturalRoll ?? Math.floor(Math.random() * 20) + 1; // 1d20
  const bonus = character.saves[saveType];
  const total = roll + bonus;
  const success = total >= dc;

  return {
    success,
    roll,
    bonus,
    total,
    dc,
    saveType,
  };
}

/**
 * Apply save result based on save type
 *
 * @param saveResult The result of the saving throw
 * @param saveType Type of save effect (negates, half, partial)
 * @param baseDuration Base duration for partial saves (optional)
 * @returns Applied result with damage/duration modifiers
 */
export function applySaveResult(
  saveResult: SaveResult,
  saveType: SaveType,
  baseDuration?: number
): AppliedSaveResult {
  switch (saveType) {
    case 'negates':
      if (saveResult.success) {
        return {
          applied: false,
          description: 'Save successful! Effect resisted.',
        };
      } else {
        return {
          applied: true,
          damageMultiplier: 1,
          description: 'Save failed! Full effect applied.',
        };
      }

    case 'half':
      if (saveResult.success) {
        return {
          applied: true,
          damageMultiplier: 0.5,
          description: 'Save successful! half damage taken.',
        };
      } else {
        return {
          applied: true,
          damageMultiplier: 1,
          description: 'Save failed! Full damage taken.',
        };
      }

    case 'partial':
      if (saveResult.success) {
        return {
          applied: true,
          duration: 1, // Reduced duration
          description: 'Save successful! Duration reduced to 1 turn.',
        };
      } else {
        return {
          applied: true,
          duration: baseDuration ?? 1,
          description: `Save failed! Full duration (${baseDuration ?? 1} turns).`,
        };
      }
  }
}
