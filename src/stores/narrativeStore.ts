import { create } from 'zustand';
import type { Character } from '../types';
import type {
  Campaign,
  Act,
  StoryNode,
  Choice,
  WorldState,
  ConversationState,
  LogEntry
} from '../types';
import type { Screen } from '../types';
import {
  getAvailableChoices,
  resolveOutcome,
  processNodeEffects,
  getChoiceDisplayText,
} from '../utils/narrativeLogic';
import { useCharacterStore } from './characterStore';

interface NarrativeStore {
  // Persistent state
  world: WorldState | null;

  // Ephemeral conversation state
  conversation: ConversationState | null;

  // Campaign data (loaded)
  campaign: Campaign | null;

  // Navigation callback (set by App to handle screen transitions)
  onNavigate: ((screen: Screen) => void) | null;

  // Actions
  loadCampaign: (campaign: Campaign) => void;
  startCampaign: () => void;
  setNavigationCallback: (callback: (screen: Screen) => void) => void;

  enterNode: (nodeId: string, player: Character) => void;
  selectChoice: (choiceId: string, player: Character) => void;
  requestCompanionHint: () => void;

  exitConversation: () => void;
  resetNarrative: () => void;

  // Getters
  getCurrentAct: () => Act | null;
  getCurrentNode: () => StoryNode | null;
  getAvailableChoices: (player: Character) => Choice[];
  getChoiceDisplayText: (choice: Choice) => string;
}

/**
 * Find a node by ID across all acts in the campaign
 */
function findNode(campaign: Campaign, nodeId: string): StoryNode | null {
  for (const act of campaign.acts) {
    const node = act.nodes.find((n) => n.id === nodeId);
    if (node) return node;
  }
  return null;
}

/**
 * Find which act contains a given node
 */
function findActForNode(campaign: Campaign, nodeId: string): Act | null {
  for (const act of campaign.acts) {
    if (act.nodes.some((n) => n.id === nodeId)) {
      return act;
    }
  }
  return null;
}

export const useNarrativeStore = create<NarrativeStore>((set, get) => ({
  world: null,
  conversation: null,
  campaign: null,
  onNavigate: null,

  loadCampaign: (campaign) => {
    set({ campaign });
  },

  startCampaign: () => {
    const { campaign } = get();
    if (!campaign || campaign.acts.length === 0) {
      throw new Error('No campaign loaded or campaign has no acts');
    }

    const firstAct = campaign.acts[0];

    // Initialize world state
    const world: WorldState = {
      campaignId: campaign.id,
      currentActId: firstAct.id,
      currentNodeId: firstAct.startingNodeId,
      flags: {},
      visitedNodeIds: [],
      inventory: [],
    };

    // Initialize conversation state
    const conversation: ConversationState = {
      active: true,
      currentNodeId: firstAct.startingNodeId,
      visitedChoiceIds: [],
      log: [],
    };

    set({ world, conversation });
  },

  setNavigationCallback: (callback) => {
    set({ onNavigate: callback });
  },

  enterNode: (nodeId, _player) => {
    const { campaign, world, conversation } = get();

    if (!campaign || !world || !conversation) {
      throw new Error('Cannot enter node without active campaign');
    }

    const node = findNode(campaign, nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    const act = findActForNode(campaign, nodeId);
    const newLogEntries: LogEntry[] = [];

    // Add narrative text to log
    if (node.description) {
      newLogEntries.push({
        type: 'narrative',
        text: node.description,
        speaker: node.speakerName,
      });
    }

    // Process onEnter effects
    let worldUpdates: Partial<WorldState> = {};
    let combatTrigger: { enemyId: string; onVictoryNodeId: string } | undefined;
    let levelUpTrigger = undefined;

    if (node.onEnter && node.onEnter.length > 0) {
      const effectResult = processNodeEffects(node.onEnter, world);
      newLogEntries.push(...effectResult.logEntries);
      worldUpdates = effectResult.worldUpdates;
      combatTrigger = effectResult.combatTrigger;
      levelUpTrigger = effectResult.levelUpTrigger;

      // NEW: Process character effects
      useCharacterStore.getState().processNarrativeEffects(node.onEnter);
    }

    // Update world state
    const newWorld: WorldState = {
      ...world,
      ...worldUpdates,
      currentNodeId: nodeId,
      currentActId: act?.id || world.currentActId,
      visitedNodeIds: world.visitedNodeIds.includes(nodeId)
        ? world.visitedNodeIds
        : [...world.visitedNodeIds, nodeId],
    };

    // Update conversation state
    const newConversation: ConversationState = {
      ...conversation,
      currentNodeId: nodeId,
      log: [...conversation.log, ...newLogEntries],
    };

    set({ world: newWorld, conversation: newConversation });

    // Handle combat trigger
    if (combatTrigger) {
      const { onNavigate } = get();
      if (onNavigate) {
        onNavigate({
          type: 'combat',
          enemyId: combatTrigger.enemyId,
          onVictoryNodeId: combatTrigger.onVictoryNodeId,
        });
      }
    }

    // Handle level-up trigger
    if (levelUpTrigger) {
      const { onNavigate } = get();
      if (onNavigate) {
        onNavigate({
          type: 'levelUp',
          newLevel: levelUpTrigger.newLevel,
          featChoices: levelUpTrigger.featChoices,
          onComplete: () => {
            // Return to story after level-up completes
            const nav = get().onNavigate;
            if (nav) {
              nav({ type: 'story' });
            }
          },
        });
      }
    }
  },

  selectChoice: (choiceId, player) => {
    const { campaign, world, conversation } = get();

    if (!campaign || !world || !conversation) {
      throw new Error('Cannot select choice without active campaign');
    }

    const currentNode = findNode(campaign, conversation.currentNodeId);
    if (!currentNode) {
      throw new Error(`Current node not found: ${conversation.currentNodeId}`);
    }

    const choice = currentNode.choices.find((c) => c.id === choiceId);
    if (!choice) {
      throw new Error(`Choice not found: ${choiceId}`);
    }

    // Add player choice to log
    const choiceLogEntry: LogEntry = {
      type: 'playerChoice',
      text: choice.text,
    };

    // Resolve the outcome
    const resolution = resolveOutcome(choice.outcome, player, conversation.currentNodeId);

    // Handle exploration trigger
    if (resolution.exploreTrigger) {
      const { onNavigate } = get();
      if (onNavigate) {
        onNavigate({
          type: 'exploration',
          tableId: resolution.exploreTrigger.tableId,
          onceOnly: resolution.exploreTrigger.onceOnly,
          onComplete: () => {
            // Exploration screen will trigger combat/treasure/etc, then return to node
            // For now, just go back to story
            if (onNavigate) {
              onNavigate({ type: 'story' });
            }
          },
        });
      }
      return; // Don't process navigation yet, wait for exploration to complete
    }

    // Handle merchant trigger
    if (resolution.merchantTrigger) {
      const { onNavigate } = get();
      if (onNavigate) {
        onNavigate({
          type: 'merchant',
          shopInventory: resolution.merchantTrigger.shopInventory,
          buyPrices: resolution.merchantTrigger.buyPrices,
          onClose: () => {
            // Return to story after merchant closes
            if (onNavigate) {
              onNavigate({ type: 'story' });
            }
          },
        });
      }
      return; // Don't process navigation yet
    }

    // Handle character creation trigger
    if (resolution.characterCreationTrigger) {
      const { onNavigate } = get();
      if (onNavigate) {
        if (resolution.characterCreationTrigger.phase === 1) {
          // Phase 1: Quick creation
          onNavigate({
            type: 'quickCharacterCreation',
            onComplete: (characterClass) => {
              // Create character using background defaults
              useCharacterStore.getState().createQuickCharacter(characterClass);

              // Navigate to next node
              const nextNodeId = resolution.characterCreationTrigger!.nextNodeId;
              const char = useCharacterStore.getState().character;
              if (char) {
                get().enterNode(nextNodeId, char);
              }

              // Return to story
              const nav = get().onNavigate;
              if (nav) {
                nav({ type: 'story' });
              }
            },
          });
        } else {
          // Phase 2: Full customization (existing CharacterCreationScreen)
          onNavigate({
            type: 'characterCreation',
          });
        }
      }
      return; // Don't process navigation yet
    }

    // Update conversation state with visited choice
    const newVisitedChoiceIds = conversation.visitedChoiceIds.includes(choiceId)
      ? conversation.visitedChoiceIds
      : [...conversation.visitedChoiceIds, choiceId];

    const newLog = [
      ...conversation.log,
      choiceLogEntry,
      ...resolution.logEntries,
    ];

    // Handle exit
    if (resolution.nextNodeId === null) {
      // Exit conversation
      set({
        world: {
          ...world,
          ...resolution.worldUpdates,
        },
        conversation: null,
      });
      return;
    }

    // Update state
    set({
      world: {
        ...world,
        ...resolution.worldUpdates,
      },
      conversation: {
        ...conversation,
        visitedChoiceIds: newVisitedChoiceIds,
        log: newLog,
      },
    });

    // Enter the next node
    get().enterNode(resolution.nextNodeId, player);
  },

  requestCompanionHint: () => {
    const { campaign, conversation } = get();

    if (!campaign || !conversation) {
      return;
    }

    const currentNode = findNode(campaign, conversation.currentNodeId);
    if (!currentNode || !currentNode.companionHint) {
      return;
    }

    // Add companion hint to log
    const hintEntry: LogEntry = {
      type: 'companion',
      hint: currentNode.companionHint,
    };

    set({
      conversation: {
        ...conversation,
        log: [...conversation.log, hintEntry],
      },
    });
  },

  exitConversation: () => {
    set({ conversation: null });
  },

  resetNarrative: () => {
    set({
      world: null,
      conversation: null,
      campaign: null,
    });
  },

  // Getters
  getCurrentAct: () => {
    const { campaign, world } = get();
    if (!campaign || !world) return null;

    return campaign.acts.find((act) => act.id === world.currentActId) || null;
  },

  getCurrentNode: () => {
    const { campaign, conversation } = get();
    if (!campaign || !conversation) return null;

    return findNode(campaign, conversation.currentNodeId);
  },

  getAvailableChoices: (player) => {
    const { campaign, world, conversation } = get();
    if (!campaign || !world || !conversation) return [];

    const currentNode = findNode(campaign, conversation.currentNodeId);
    if (!currentNode) return [];

    return getAvailableChoices(
      currentNode.choices,
      world,
      player,
      conversation.visitedChoiceIds
    );
  },

  getChoiceDisplayText: (choice) => {
    return getChoiceDisplayText(choice);
  },
}));
