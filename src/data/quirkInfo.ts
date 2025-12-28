import type { StartingQuirk } from '../types';

export interface QuirkDisplayInfo {
  displayName: string;
  description: string;
  combatMessage: string;
}

export const QUIRK_INFO: Record<StartingQuirk, QuirkDisplayInfo> = {
  'auto-block-first-attack': {
    displayName: 'Automatic Block',
    description: 'Your guard training deflects the first attack in combat',
    combatMessage: "Your guard training kicks in—you deflect the blow!",
  },
  'start-hidden': {
    displayName: 'Shadow Stealth',
    description: 'You begin combat hidden with a defense bonus',
    combatMessage: "You blend into the shadows (+4 AC bonus)...",
  },
  'arcane-shield-turn-1': {
    displayName: 'Arcane Shield',
    description: 'A magical shield protects you on your first turn',
    combatMessage: "An arcane shield flares to life (+4 AC this turn)!",
  },
  'auto-heal-first-hit': {
    displayName: 'Divine Renewal',
    description: 'Divine protection heals you when first struck',
    combatMessage: "Divine protection surrounds you...",
  },
};

export function getQuirkInfo(quirk: StartingQuirk): QuirkDisplayInfo {
  return QUIRK_INFO[quirk];
}
