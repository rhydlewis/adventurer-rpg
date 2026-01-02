import type { SkillName, AbilityScore } from './skill';
import type { CharacterClass } from './character';

// =============================================================================
// Requirements - Conditions to SEE a choice option
// =============================================================================

export type Requirement =
  | { type: 'flag'; flag: string; value: boolean }
  | { type: 'item'; itemId: string }
  | { type: 'attribute'; attr: AbilityScore; min: number }
  | { type: 'skill'; skill: SkillName; minRanks: number }
  | { type: 'class'; class: CharacterClass }
  | { type: 'previousChoice'; choiceId: string }
  | { type: 'nodeVisited'; nodeId: string };

// =============================================================================
// Node Presentation - Optional semantic type and flavor
// =============================================================================

export type NodeType = 'explore' | 'dialogue' | 'event' | 'combat';

export type NodeTone = 'calm' | 'tense' | 'mysterious' | 'danger' | 'triumphant' | 'urgent';

export type NodeIcon =
  // Combat
  | 'sword'
  | 'shield'
  | 'skull'
  | 'danger'
  // Social
  | 'dialogue'
  | 'speech'
  | 'question'
  | 'exclamation'
  // Exploration
  | 'map'
  | 'compass'
  | 'search'
  | 'location'
  // Outcomes
  | 'treasure'
  | 'victory'
  | 'defeat'
  | 'reward'
  // Atmosphere
  | 'mystery'
  | 'warning'
  | 'magic'
  | 'crown';

export interface NodeFlavor {
  tone?: NodeTone;
  icon?: NodeIcon;
}

// =============================================================================
// Exploration System - Multi-outcome encounters
// =============================================================================

export type ExplorationOutcome =
  | { type: 'combat'; enemyId: string; goldReward: number; itemReward?: string }
  | { type: 'treasure'; gold: number; items: string[] }
  | { type: 'vignette'; description: string; flavorOnly: true }
  | { type: 'nothing'; message: string };

export interface ExplorationTable {
  id: string;
  locationId: string;
  encounters: {
    weight: number; // 60 for combat, 20 for treasure, etc.
    outcome: ExplorationOutcome;
  }[];
}

// =============================================================================
// Puzzle System - Interactive mini-game challenges
// =============================================================================

export type PuzzleType = 'timing' | 'matching' | 'memory' | 'sequence' | 'sliding' | 'rotation' | 'tumbler' | 'pressure';

// Base config shared by all puzzles
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BasePuzzleConfig {
  // Reserved for common settings like time limits, attempts, etc.
}

// Timing puzzle configuration
export interface TimingPuzzleConfig extends BasePuzzleConfig {
  gridSize?: number;
  tickInterval?: number;
  lockDuration?: number;
  autoUnlock?: boolean;
  allowManualUnlock?: boolean;
}

// Future puzzle configs
export interface MatchingPuzzleConfig extends BasePuzzleConfig {
  pairs?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Sliding symbol match configuration
export interface SlidingPuzzleConfig extends BasePuzzleConfig {
  gridSize?: number;
  targetLength?: number;
}

// Rune rotation configuration
export interface RotationPuzzleConfig extends BasePuzzleConfig {
  gridSize?: number;
}

// Lock tumbler configuration
export interface TumblerPuzzleConfig extends BasePuzzleConfig {
  dialCount?: number;
  symbolsPerDial?: number;
  linkedDials?: boolean;
}

// Pressure plates configuration
export interface PressurePuzzleConfig extends BasePuzzleConfig {
  gridSize?: number;
  togglePattern?: 'cross' | 'plus' | 'diagonal' | 'adjacent';
}

// Union of all puzzle configs
export type PuzzleConfig = TimingPuzzleConfig | MatchingPuzzleConfig | SlidingPuzzleConfig | RotationPuzzleConfig | TumblerPuzzleConfig | PressurePuzzleConfig;

// =============================================================================
// Choice Outcomes - Unified recursive pattern for all choice routing
// =============================================================================

export type ChoiceOutcome =
  | { type: 'goto'; nodeId: string }
  | { type: 'loop' } // Return to current node (for questions)
  | { type: 'exit' } // End conversation, return to exploration
  | {
      type: 'check';
      skill: SkillName;
      dc: number;
      success: ChoiceOutcome;
      failure: ChoiceOutcome;
    }
  | { type: 'explore'; tableId: string; onceOnly: boolean }
  | { type: 'rest' } // Open rest screen with camp event system
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number> }
  | { type: 'characterCreation'; phase: 1 | 2; nextNodeId: string }
  | {
      type: 'puzzle';
      puzzleType: PuzzleType;
      config?: PuzzleConfig;
      successNodeId: string;
      failureNodeId: string;
    };

// =============================================================================
// Choice Categories - Visual styling for different action types
// =============================================================================

export type ChoiceCategory =
  | 'movement' // Moving to a new location (goto)
  | 'combat' // Entering combat or aggressive action
  | 'exploration' // Exploring/searching area
  | 'skillCheck' // Attempting action with DC check
  | 'dialogue' // Conversation or social interaction
  | 'merchant' // Trading/shopping
  | 'special'; // Unique/quest actions

export interface Choice {
  id: string;
  text: string; // Display text, e.g., "Lie to the guard"
  displayText?: string; // Optional different text for skill checks: "[Intimidate DC 10] Lie"
  requirements?: Requirement[]; // Must pass ALL to see this choice
  outcome: ChoiceOutcome;
  explorationOutcome?: ExplorationOutcome; // Validation campaign: random exploration
  category?: ChoiceCategory; // Optional visual styling hint
}

// =============================================================================
// Node Effects - Triggered when entering a node
// =============================================================================

export type NodeEffect =
  | { type: 'setFlag'; flag: string; value: boolean }
  | { type: 'giveItem'; itemId: string }
  | { type: 'removeItem'; itemId: string }
  | { type: 'giveGold'; amount: number }
  | { type: 'startCombat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'heal'; amount: number | 'full' }
  | { type: 'damage'; amount: number }
  | { type: 'restoreSpellSlots' }  // Restore all spell slots to maximum
  | { type: 'showCompanionHint'; hint: string }
  | { type: 'levelUp'; newLevel: number; featChoices: string[] }
  | { type: 'createDefaultCharacter' }
  | { type: 'createWizard' }
  | { type: 'createCleric' }
  | {
      type: 'startPuzzle';
      puzzleType: PuzzleType;
      config?: PuzzleConfig;
      successNodeId: string;
      failureNodeId: string;
    };

// =============================================================================
// Story Nodes - The building blocks of narrative
// =============================================================================

export interface StoryNode {
  id: string;
  title?: string; // Optional scene title
  description: string; // Main narrative text
  speakerName?: string; // If dialogue, who is speaking
  speakerPortrait?: string; // Portrait image path
  locationHint?: string; // For atmosphere: "The tavern is warm and noisy"
  locationId?: string; // Override Act's default location for this node

  // Optional semantic type and presentation flavor
  type?: NodeType;
  flavor?: NodeFlavor;

  choices: Choice[];

  // Effects triggered when this node is entered
  onEnter?: NodeEffect[];

  // Companion hint available for this node (player must request it)
  companionHint?: string;
}

// =============================================================================
// Locations - Physical settings for narrative scenes
// =============================================================================

// Phase 5: Location types for context-sensitive hubs
export type LocationType = 'town' | 'wilderness' | 'dungeon';

export interface Location {
  id: string;
  name: string;
  image: string;
  ambience?: string;
  description?: string;

  // Phase 5: Location type and configuration
  locationType?: LocationType;
  hasMerchant?: boolean;

  // Phase 5: Story integration
  firstVisitNodeId?: string;  // Story node for first arrival
  hubNodeId?: string;          // Optional custom hub node

  // Phase 5: Exploration
  explorationTableId?: string; // Link to encounter table
}

// =============================================================================
// Campaign Hierarchy - Campaign → Act → Node
// =============================================================================

export interface Act {
  id: string;
  title: string; // "Act 1: The Hook"
  description?: string; // Brief summary
  locationId?: string; // Primary location for this act
  startingNodeId: string; // First node when entering this act
  deathNodeId?: string; // Narrative death scene for permadeath
  nodes: StoryNode[];
}

export interface Campaign {
  id: string;
  title: string; // "The Spire of the Lich King"
  description: string;
  companionName: string; // "The Elder"
  companionDescription: string; // For UI display
  acts: Act[];
}

// =============================================================================
// Log Entries - For narrative log display
// =============================================================================

export type LogEntry =
  | { type: 'narrative'; text: string; speaker?: string }
  | { type: 'playerChoice'; text: string }
  | {
      type: 'skillCheck';
      skill: SkillName;
      roll: number;
      modifier: number;
      total: number;
      dc: number;
      success: boolean;
    }
  | { type: 'effect'; message: string } // "You received Rusty Sword"
  | { type: 'companion'; hint: string };

// =============================================================================
// State Management - Separated ephemeral vs persistent
// =============================================================================

// Ephemeral - resets when leaving a conversation
export interface ConversationState {
  active: boolean;
  currentNodeId: string;
  visitedChoiceIds: string[]; // Grayed-out choices in THIS conversation
  log: LogEntry[];
}

// Persistent - survives across the campaign
export interface WorldState {
  campaignId: string;
  currentActId: string;
  currentNodeId: string; // Where player is in the story
  flags: Record<string, boolean>; // Story flags
  visitedNodeIds: string[]; // All nodes ever visited
  inventory: string[]; // Item IDs
}

// =============================================================================
// Skill Check Result - Returned by skill check resolver
// =============================================================================

export interface SkillCheckResult {
  skill: SkillName;
  roll: number; // Natural d20 result
  modifier: number; // Total skill bonus
  total: number; // roll + modifier
  dc: number;
  success: boolean;
}

// =============================================================================
// Outcome Resolution - Result of resolving a choice outcome
// =============================================================================

export interface OutcomeResolution {
  nextNodeId: string | null; // null = exit conversation
  logEntries: LogEntry[];
  worldUpdates: Partial<WorldState>;
  exploreTrigger?: {
    tableId: string;
    onceOnly: boolean;
  };
  restTrigger?: boolean; // Trigger rest screen
  merchantTrigger?: {
    shopInventory: string[];
    buyPrices: Record<string, number>;
  };
  characterCreationTrigger?: {
    phase: 1 | 2;
    nextNodeId: string;
  };
  puzzleTrigger?: {
    puzzleType: PuzzleType;
    config?: PuzzleConfig;
    successNodeId: string;
    failureNodeId: string;
  };
}

// =============================================================================
// Effect Processing Result
// =============================================================================

export interface EffectResult {
  logEntries: LogEntry[];
  worldUpdates: Partial<WorldState>;
  combatTrigger?: {
    enemyId: string;
    onVictoryNodeId: string;
  };
  levelUpTrigger?: {
    newLevel: number;
    featChoices: string[];
  };
  deathTrigger?: {
    nodeId?: string; // Optional custom death node, otherwise use Act's deathNodeId
  };
  puzzleTrigger?: {
    puzzleType: PuzzleType;
    config?: PuzzleConfig;
    successNodeId: string;
    failureNodeId: string;
  };
}
