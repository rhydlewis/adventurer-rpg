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
// Exploration Outcomes - Results from exploring (validation campaign)
// =============================================================================

export type ExplorationOutcome =
  | { type: 'combat'; enemyId: string }
  | { type: 'treasure'; loot: { gold?: number; items?: string[] } }
  | { type: 'vignette'; text: string }
  | { type: 'nothing'; text: string };

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
    };

export interface Choice {
  id: string;
  text: string; // Display text, e.g., "Lie to the guard"
  displayText?: string; // Optional different text for skill checks: "[Intimidate DC 10] Lie"
  requirements?: Requirement[]; // Must pass ALL to see this choice
  outcome: ChoiceOutcome;
  explorationOutcome?: ExplorationOutcome; // Validation campaign: random exploration
}

// =============================================================================
// Node Effects - Triggered when entering a node
// =============================================================================

export type NodeEffect =
  | { type: 'setFlag'; flag: string; value: boolean }
  | { type: 'giveItem'; itemId: string }
  | { type: 'removeItem'; itemId: string }
  | { type: 'startCombat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'heal'; amount: number | 'full' }
  | { type: 'damage'; amount: number }
  | { type: 'showCompanionHint'; hint: string };

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

  choices: Choice[];

  // Effects triggered when this node is entered
  onEnter?: NodeEffect[];

  // Companion hint available for this node (player must request it)
  companionHint?: string;
}

// =============================================================================
// Locations - Physical settings for narrative scenes
// =============================================================================

export interface Location {
  id: string;
  name: string;
  image: string;
  ambience?: string;
  description?: string;
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
}
