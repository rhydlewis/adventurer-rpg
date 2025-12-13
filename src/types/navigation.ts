// =============================================================================
// Screen Navigation Types
// =============================================================================

export type Screen =
  | { type: 'home' }
  | { type: 'characterCreation' }
  | { type: 'story' }
  | { type: 'combat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'gameOver'; deathNodeId?: string }
  | { type: 'victory' }
  | { type: 'characterSheet' }
  | { type: 'worldMap' } // Phase 3
  | { type: 'rest' } // Phase 4
  | { type: 'lockPicking'; difficulty: 'easy' | 'medium' | 'hard'; onSuccess: () => void; onFailure: () => void };
