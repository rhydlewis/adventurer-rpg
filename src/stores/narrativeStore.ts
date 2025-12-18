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
import { GameSaveManager } from '../utils/gameSaveManager';
import type { GameSave } from '../types/gameSave';

interface NarrativeStore {
  // Persistent state
  world: WorldState | null;

  // Ephemeral conversation state
  conversation: ConversationState | null;

  // Campaign data (loaded)
  campaign: Campaign | null;

  // Navigation callback (set by App to handle screen transitions)
  onNavigate: ((screen: Screen) => void) | null;

  // Phase 2 character customization tracking
  phase2CustomizationPending: { nextNodeId: string } | null;

  // Actions
  loadCampaign: (campaign: Campaign) => void;
  startCampaign: () => void;
  setNavigationCallback: (callback: (screen: Screen) => void) => void;

  enterNode: (nodeId: string, player: Character) => void;
  selectChoice: (choiceId: string, player: Character | null) => void;
  requestCompanionHint: () => void;

  exitConversation: () => void;
  resetNarrative: () => void;
  restoreState: (world: WorldState, conversation: ConversationState) => void;

  // Getters
  getCurrentAct: () => Act | null;
  getCurrentNode: () => StoryNode | null;
  getAvailableChoices: (player: Character) => Choice[];
  getChoiceDisplayText: (choice: Choice) => string;

  // Save/Load
  saveNarrativeState: () => void;
  loadNarrativeState: () => boolean;
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
  phase2CustomizationPending: null,

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

    // Auto-save after entering node
    const character = _player;
    if (character) {
      const saveData: GameSave = {
        version: GameSaveManager.getCurrentVersion(),
        timestamp: Date.now(),
        character,
        narrative: {
          world,
          conversation,
          campaignId: campaign.id,
        },
        currentScreen: { type: 'story' },
        metadata: {
          characterName: character.name,
          characterLevel: character.level,
          lastPlayedTimestamp: Date.now(),
          playTimeSeconds: 0, // TODO: Implement play time tracking
        },
      };

      GameSaveManager.save(saveData).catch(err => {
        console.error('[NarrativeStore] Auto-save failed:', err);
      });
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
      console.log('[DEBUG] Character creation trigger detected:', resolution.characterCreationTrigger);
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
                // Check if the next node has combat/level-up triggers
                const { campaign } = get();
                const nextNode = campaign ? findNode(campaign, nextNodeId) : null;
                const hasCombatOrLevelUp = nextNode?.onEnter?.some(
                  (e) => e.type === 'startCombat' || e.type === 'levelUp'
                );

                get().enterNode(nextNodeId, char);

                // Only navigate to story if the node doesn't trigger combat/level-up
                // (combat/level-up will handle their own navigation)
                if (!hasCombatOrLevelUp) {
                  const nav = get().onNavigate;
                  if (nav) {
                    nav({ type: 'story' });
                  }
                }
              }
            },
          });
        } else {
          // Phase 2: Full customization (existing CharacterCreationScreen)
          console.log('[DEBUG] Phase 2 customization triggered, nextNodeId:', resolution.characterCreationTrigger.nextNodeId);
          // Store the next node ID so we can navigate there after customization
          set({
            phase2CustomizationPending: {
              nextNodeId: resolution.characterCreationTrigger.nextNodeId,
            },
          });
          console.log('[DEBUG] Navigating to characterCreation screen');
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
    // Player should exist at this point (character creation is handled above)
    if (!player) {
      throw new Error('Cannot navigate to next node without a character');
    }
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

  /**
   * Restore narrative state from saved game
   */
  restoreState: (world: WorldState, conversation: ConversationState) => {
    set({ world, conversation });
    console.log('[NarrativeStore] State restored from save');
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

  saveNarrativeState: () => {
    const { world, conversation, campaign } = get();

    if (!world || !conversation || !campaign) {
      console.warn('No narrative state to save');
      return;
    }

    try {
      const saveData = {
        world,
        conversation,
        campaignId: campaign.id, // Save campaign ID for reference
      };
      localStorage.setItem('adventurer-rpg:narrative', JSON.stringify(saveData));
      console.log('Narrative state saved successfully');
    } catch (error) {
      console.error('Failed to save narrative state:', error);
    }
  },

  loadNarrativeState: () => {
    try {
      const saved = localStorage.getItem('adventurer-rpg:narrative');
      if (saved) {
        const saveData = JSON.parse(saved);

        // Note: Campaign data is not saved to localStorage (it's static data)
        // The campaign must be loaded separately before loading narrative state
        const { campaign } = get();
        if (!campaign || campaign.id !== saveData.campaignId) {
          console.warn('Cannot load narrative state: campaign not loaded or mismatch');
          return false;
        }

        set({
          world: saveData.world,
          conversation: saveData.conversation,
        });
        console.log('Narrative state loaded successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load narrative state:', error);
      return false;
    }
  },
}));
