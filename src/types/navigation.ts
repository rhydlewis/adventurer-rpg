// =============================================================================
// Screen Navigation Types
// =============================================================================

import type { CharacterClass } from './character';

export type Screen =
  | { type: 'splash' }
  | { type: 'mainMenu' }
  | { type: 'home' }
  | { type: 'characterCreation' }
  | { type: 'quickCharacterCreation'; onComplete: (characterClass: CharacterClass) => void }
  | { type: 'story' }
  | { type: 'combat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'gameOver'; deathNodeId?: string }
  | { type: 'victory' }
  | { type: 'characterSheet' }
  | { type: 'worldMap' } // Phase 3
  | { type: 'rest' } // Phase 4
  | { type: 'lockPicking'; difficulty: 'easy' | 'medium' | 'hard'; onSuccess: () => void; onFailure: () => void }
  | { type: 'timingGame'; onSuccess: () => void; onFailure: () => void }
  // Validation campaign screens
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number>; onClose: () => void }
  | { type: 'levelUp'; newLevel: number; featChoices: string[]; onComplete: () => void }
  | { type: 'exploration'; tableId: string; onceOnly: boolean; onComplete: () => void }
  // Testing screen
  | { type: 'testing' }
  | { type: 'chooseCampaign' };

