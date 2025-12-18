// src/types/gameSave.ts
import type { Character } from './character';
import type { WorldState, ConversationState } from './narrative';
import type { Screen } from './index';

export interface GameSave {
  version: string;
  timestamp: number;
  character: Character;
  narrative: {
    world: WorldState;
    conversation: ConversationState;
    campaignId: string;
  };
  currentScreen: {
    type: Screen['type'];
  };
  metadata: SaveMetadata;
}

export interface SaveMetadata {
  characterName: string;
  characterLevel: number;
  lastPlayedTimestamp: number;
  playTimeSeconds: number;
}
