import { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from './screens';
import { SplashScreen } from './screens';
import { MainMenuScreen } from './screens';
import { CombatScreen } from './screens';
import { CharacterCreationScreen } from './screens';
import { QuickCharacterCreationScreen } from './screens';
import { CharacterSheetScreen } from './screens';
import { StoryScreen } from './screens';
import { ChooseCampaignScreen } from './screens';
import { WorldMapScreen } from './screens';
import { WorldMapCanvasScreen } from './screens';
import { WorldMapLeafletScreen } from './screens';
import { LocationHubScreen } from './screens/LocationHubScreen';
import { useCharacterStore } from './stores/characterStore';
import { useNarrativeStore } from './stores/narrativeStore';
import { availableCampaigns } from './data/campaigns';
import { initializePhase3Data } from './data/campaigns/single-node-campaign';
import type { Screen, Character, Campaign } from './types';
import { LockPickingScreen } from './screens';
import { TimingGame } from './screens/puzzles';
import { MerchantScreen } from './screens';
import { ExplorationScreen } from './screens';
import { LevelUpScreen } from './screens';
import { RestScreen } from './screens';
import {TestingScreen} from "./screens/TestingScreen.tsx";
import { App as CapApp } from '@capacitor/app';
import { GameSaveManager } from './utils/gameSaveManager';
import type { GameSave, SaveMetadata } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'splash' });
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [saveMetadata, setSaveMetadata] = useState<SaveMetadata | null>(null);
  const { character, creationStep, startCreation, setCharacter } = useCharacterStore();
  const { setNavigationCallback, phase2CustomizationPending, enterNode } = useNarrativeStore();

  // Debug: Log screen changes
  useEffect(() => {
    console.log('[DEBUG] Screen changed to:', currentScreen.type);
  }, [currentScreen]);

  // Check for saved game on mount
  useEffect(() => {
    const checkForSave = async () => {
      const metadata = await GameSaveManager.getSaveMetadata();
      setSaveMetadata(metadata);
      console.log('[App] Save metadata loaded:', metadata);
    };

    checkForSave();
  }, []);

  // Register navigation callback with narrative store
  useEffect(() => {
    const wrappedCallback = (screen: Screen) => {
      console.log('[DEBUG] Navigation callback called with screen:', screen.type);
      setCurrentScreen(screen);
    };
    setNavigationCallback(wrappedCallback);
  }, [setNavigationCallback]);

  // When Phase 2 customization starts, reset creation flow
  useEffect(() => {
    // Read fresh state from store to avoid object reference issues
    const freshCreationStep = useCharacterStore.getState().creationStep;
    const freshCharacter = useCharacterStore.getState().character;

    console.log('[DEBUG] Phase 2 reset effect fired:', {
      screenType: currentScreen.type,
      phase2Pending: !!phase2CustomizationPending,
      hasCharacter: !!freshCharacter,
      freshCreationStep,
    });

    // Only run reset once: when we're on characterCreation screen, phase2 is pending,
    // we have a character, AND creationStep is still "complete" (meaning we haven't reset yet)
    if (
      currentScreen.type === 'characterCreation' &&
      phase2CustomizationPending &&
      freshCharacter &&
      freshCreationStep === 'complete'
    ) {
      console.log('[DEBUG] Resetting character creation for Phase 2 with existing character data');
      // Reset creation step and prepare for Phase 2 customization
      // Pre-fill with current character data
      startCreation();
      const characterStore = useCharacterStore.getState();
      characterStore.setClass(freshCharacter.class);
      characterStore.setAttributes(freshCharacter.attributes);
      characterStore.setSkillRanks(freshCharacter.skills);
      characterStore.setName(freshCharacter.name);
      characterStore.setAvatarPath(freshCharacter.avatarPath);
      console.log('[DEBUG] Phase 2 reset complete, new creationStep:', useCharacterStore.getState().creationStep);
    }
  }, [currentScreen.type, phase2CustomizationPending, startCreation]);

  // When character creation is complete, handle navigation
  useEffect(() => {
    // Get fresh state from store to avoid stale closure issues
    const freshCreationStep = useCharacterStore.getState().creationStep;
    console.log('[DEBUG] Completion effect fired:', {
      creationStepFromClosure: creationStep,
      freshCreationStep,
      hasCharacter: !!character,
      screenType: currentScreen.type,
      phase2Pending: !!phase2CustomizationPending,
    });

    // Use fresh state from store, not closure
    if (
      freshCreationStep === 'complete' &&
      character &&
      currentScreen.type === 'characterCreation'
    ) {
      console.log('[DEBUG] Character creation is complete, handling navigation');
      // Check if this was Phase 2 customization from narrative
      if (phase2CustomizationPending) {
        console.log('[DEBUG] Phase 2 completion detected, marking character as fully customized');

        // IMPORTANT: Clear pending state FIRST, before setCharacter
        // Otherwise setCharacter triggers the reset effect while phase2Pending is still true
        const nextNodeId = phase2CustomizationPending.nextNodeId;
        useNarrativeStore.setState({ phase2CustomizationPending: null });

        // Mark character as fully customized (mechanicsLocked = true)
        const fullyCustomizedCharacter: Character = {
          ...character,
          mechanicsLocked: true,
        };
        setCharacter(fullyCustomizedCharacter);

        // Navigate to the next story node
        enterNode(nextNodeId, fullyCustomizedCharacter);

        // Navigate to story screen
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentScreen({ type: 'story' });
      } else {
        // Regular character creation from home - show character sheet
        setCurrentScreen({ type: 'characterSheet' });
      }
    }
  }, [creationStep, character, currentScreen.type, phase2CustomizationPending, setCharacter, enterNode]);

  // Auto-save when app goes to background
  useEffect(() => {
    const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
      if (!isActive) {
        console.log('[App] App backgrounding, triggering auto-save');

        const character = useCharacterStore.getState().character;
        const narrativeState = useNarrativeStore.getState();

        if (character && narrativeState.campaign) {
          const saveData: GameSave = {
            version: GameSaveManager.getCurrentVersion(),
            timestamp: Date.now(),
            character,
            narrative: {
              world: narrativeState.world!,
              conversation: narrativeState.conversation!,
              campaignId: narrativeState.campaign.id,
            },
            currentScreen: { type: currentScreen.type },
            metadata: {
              characterName: character.name,
              characterLevel: character.level,
              lastPlayedTimestamp: Date.now(),
              playTimeSeconds: 0, // TODO: Implement play time tracking
            },
          };

          GameSaveManager.save(saveData).catch(err => {
            console.error('[App] Background auto-save failed:', err);
          });
        }
      }
    };

    CapApp.addListener('appStateChange', handleAppStateChange).then(listener => {
      // Store listener for cleanup
      return listener;
    });

    return () => {
      CapApp.removeAllListeners();
    };
  }, [currentScreen.type]);

  // Navigation helper functions
  const navigateWithBack = useCallback((newScreen: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(newScreen);
  }, [currentScreen]);

  const navigateBack = useCallback(() => {
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    } else {
      // Fallback: go to home if no previous screen
      setCurrentScreen({ type: 'home' });
    }
  }, [previousScreen]);

  const navigateHome = useCallback(() => {
    setPreviousScreen(null);
    setCurrentScreen({ type: 'home' });
  }, []);

  // Hardware back button support (Android)
  useEffect(() => {
    const handleHardwareBack = () => {
      const screen = currentScreen.type;

      // Screens with back navigation
      if (screen === 'home') {
        setCurrentScreen({ type: 'mainMenu' });
        return;
      }

      if (screen === 'characterCreation') {
        navigateHome();
        return;
      }

      if (screen === 'chooseCampaign') {
        navigateHome();
        return;
      }

      if (screen === 'characterSheet') {
        navigateBack();
        return;
      }

      if (screen === 'worldMap') {
        navigateBack();
        return;
      }

      if (screen === 'worldMapCanvas') {
        navigateBack();
        return;
      }

      if (screen === 'worldMapLeaflet') {
        navigateBack();
        return;
      }

      // Story screen - allow exit to home (same as Exit button)
      if (screen === 'story') {
        setCurrentScreen({ type: 'mainMenu' });
        return;
      }

      // Screens without back (Combat, LevelUp, etc.)
      // Do nothing - hardware back is disabled
      // This prevents accidental exits during critical moments
    };

    const backButtonListener = CapApp.addListener('backButton', handleHardwareBack);

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [currentScreen, previousScreen, navigateBack, navigateHome]);

  const handleCreateCharacter = () => {
    startCreation();
    navigateWithBack({ type: 'characterCreation' });
  };

  const handleCancelCreation = () => {
    navigateHome();
  };

  const handleViewSheet = () => {
    navigateWithBack({ type: 'characterSheet' });
  };

  const handleCloseSheet = () => {
    navigateBack();
  };

  const handleContinue = async () => {
    console.log('[App] Continue button clicked, loading save...');

    const save = await GameSaveManager.load();
    if (!save) {
      console.error('[App] Failed to load save');
      return;
    }

    console.log('[App] Save loaded:', save);

    // Restore character
    setCharacter(save.character);
    console.log('[App] Character restored:', save.character.name);

    // Fix null conversation (can happen with old/incomplete saves)
    if (!save.narrative.conversation && save.narrative.world) {
      console.warn('[App] Conversation is null, re-initializing from world state');
      save.narrative.conversation = {
        active: true,
        currentNodeId: save.narrative.world.currentNodeId,
        visitedChoiceIds: [],
        log: [],
      };
    }

    // Restore narrative
    const { loadCampaign, restoreState } = useNarrativeStore.getState();
    const campaign = availableCampaigns.find(c => c.id === save.narrative.campaignId);

    if (!campaign) {
      console.error('[App] Campaign not found:', save.narrative.campaignId);
      return;
    }

    console.log('[App] Loading campaign:', campaign.title);
    loadCampaign(campaign);

    // Initialize Phase 3 data for single-node-campaign
    if (campaign.id === 'single-node-campaign') {
      initializePhase3Data();
      console.log('[App] Phase 3 data initialized for single-node-campaign (from save)');
    }

    console.log('[App] Restoring narrative state...', {
      world: save.narrative.world,
      conversation: save.narrative.conversation,
    });
    restoreState(save.narrative.world, save.narrative.conversation);

    // Verify state was set
    const state = useNarrativeStore.getState();
    console.log('[App] Narrative store state after restore:', {
      hasCampaign: !!state.campaign,
      hasConversation: !!state.conversation,
      hasWorld: !!state.world,
      currentNodeId: state.conversation?.currentNodeId,
    });

    // Check if we need to re-enter the current node
    let shouldNavigateToStory = true;

    if (state.conversation) {
      const { getCurrentNode, enterNode } = useNarrativeStore.getState();
      const currentNode = getCurrentNode();

      // Re-enter node if:
      // 1. Conversation log is empty (needs population), OR
      // 2. Node has combat/level-up triggers (need to fire on load)
      const hasCombatOrLevelUp = currentNode?.onEnter?.some(
        (e) => e.type === 'startCombat' || e.type === 'levelUp'
      );

      if (state.conversation.log.length === 0) {
        console.log('[App] Conversation log is empty, re-entering node:', state.conversation.currentNodeId);
        enterNode(state.conversation.currentNodeId, save.character);
      } else if (hasCombatOrLevelUp) {
        console.log('[App] Combat/level-up node detected on load. Clearing log and re-entering:', state.conversation.currentNodeId);
        // Clear the log to avoid duplicates when re-entering combat node
        useNarrativeStore.setState({
          conversation: {
            ...state.conversation,
            log: [],
          },
        });
        enterNode(state.conversation.currentNodeId, save.character);
        // Don't navigate to story - enterNode will handle navigation to combat/level-up
        shouldNavigateToStory = false;
      }
    }

    // Navigate to story screen only if we didn't trigger combat/level-up
    if (shouldNavigateToStory) {
      setCurrentScreen({ type: 'story' });
      console.log('[App] Save loaded successfully, navigating to story');
    } else {
      console.log('[App] Save loaded successfully, combat/level-up will handle navigation');
    }
  };

  const handleStartStory = () => {
    // Navigate to campaign selection screen with back context
    navigateWithBack({ type: 'chooseCampaign' });
  };

  const handleViewMap = () => {
    navigateWithBack({ type: 'worldMap' });
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    // Load and start the selected campaign
    const { loadCampaign, startCampaign } = useNarrativeStore.getState();
    loadCampaign(campaign);

    // Initialize Phase 3 data for single-node-campaign
    if (campaign.id === 'single-node-campaign') {
      initializePhase3Data();
      console.log('[App] Phase 3 data initialized for single-node-campaign');
    }

    startCampaign();
    setCurrentScreen({ type: 'story' });
  };

  return (
    <>
      {currentScreen.type === 'splash' && (
        <SplashScreen onComplete={() => setCurrentScreen({ type: 'mainMenu' })} />
      )}
      {currentScreen.type === 'mainMenu' && (
        <MainMenuScreen
          onNewGame={() => setCurrentScreen({ type: 'home' })}
          onContinue={saveMetadata ? handleContinue : undefined}
          continueMetadata={saveMetadata || undefined}
          onTesting={() => setCurrentScreen({ type: 'testing' })}
        />
      )}
      {currentScreen.type === 'home' && (
        <HomeScreen
          onStartStory={handleStartStory}
          onBack={() => setCurrentScreen({ type: 'mainMenu' })}
        />
      )}
      {currentScreen.type === 'chooseCampaign' && (
        <ChooseCampaignScreen
          campaigns={availableCampaigns}
          onSelectCampaign={handleSelectCampaign}
          onBack={navigateHome}
        />
      )}
      {currentScreen.type === 'combat' && (
        <CombatScreen
          enemyId={currentScreen.enemyId}
          onVictoryNodeId={currentScreen.onVictoryNodeId}
          onVictory={(victoryNodeId: string) => {
            // Return to narrative at specified node
            setCurrentScreen({ type: 'story' });
            // Narrative store will handle entering the victory node
            const narrativeStore = useNarrativeStore.getState();
            const characterStore = useCharacterStore.getState();
            if (characterStore.character) {
              narrativeStore.enterNode(victoryNodeId, characterStore.character);
            }
          }}
          onDefeat={() => {
            // Return to narrative at death node
            setCurrentScreen({ type: 'story' });
            const narrativeStore = useNarrativeStore.getState();
            const characterStore = useCharacterStore.getState();
            const deathNodeId = narrativeStore.campaign?.acts[0]?.deathNodeId;
            if (deathNodeId && characterStore.character) {
              narrativeStore.enterNode(deathNodeId, characterStore.character);
            } else {
              // Fallback: go home if no death node defined
              setCurrentScreen({ type: 'home' });
            }
          }}
          onViewCharacterSheet={character ? handleViewSheet : undefined}
          onExitToMainMenu={() => {
            // Exit to main menu
            setCurrentScreen({ type: 'mainMenu' });
          }}
        />
      )}
      {currentScreen.type === 'characterCreation' && (
        <CharacterCreationScreen onBack={handleCancelCreation} />
      )}
      {currentScreen.type === 'quickCharacterCreation' && (
        <QuickCharacterCreationScreen onComplete={currentScreen.onComplete} />
      )}
      {currentScreen.type === 'characterSheet' && (
        <CharacterSheetScreen character={character} onClose={handleCloseSheet} />
      )}
      {currentScreen.type === 'story' && (
        <StoryScreen
          onExit={() => setCurrentScreen({ type: 'mainMenu' })}
          onViewCharacterSheet={character ? handleViewSheet : undefined}
          onViewMap={handleViewMap}
        />
      )}
      {currentScreen.type === 'worldMap' && (
        <WorldMapScreen
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
          onViewCharacterSheet={character ? handleViewSheet : undefined}
          onExit={() => setCurrentScreen({ type: 'mainMenu' })}
        />
      )}
      {currentScreen.type === 'worldMapCanvas' && (
        <WorldMapCanvasScreen
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
          onViewCharacterSheet={character ? handleViewSheet : undefined}
          onExit={() => setCurrentScreen({ type: 'mainMenu' })}
        />
      )}
      {currentScreen.type === 'worldMapLeaflet' && (
        <WorldMapLeafletScreen
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
          onViewCharacterSheet={character ? handleViewSheet : undefined}
          onExit={() => setCurrentScreen({ type: 'mainMenu' })}
        />
      )}
      {currentScreen.type === 'locationHub' && (
        <LocationHubScreen
          locationId={currentScreen.locationId}
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
          onViewCharacterSheet={character ? handleViewSheet : undefined}
          onExit={() => setCurrentScreen({ type: 'mainMenu' })}
        />
      )}
      {currentScreen.type === 'lockPicking' && (
        <LockPickingScreen
          difficulty={currentScreen.difficulty}
          onSuccess={currentScreen.onSuccess}
          onFailure={currentScreen.onFailure}
          onExit={() => setCurrentScreen({ type: 'home' })}
        />
      )}
      {currentScreen.type === 'timingGame' && (
        <TimingGame
          onSuccess={currentScreen.onSuccess}
          onFailure={currentScreen.onFailure}
        />
      )}
      {currentScreen.type === 'merchant' && (
          <MerchantScreen
              shopInventory={currentScreen.shopInventory}
              buyPrices={currentScreen.buyPrices}
              onClose={currentScreen.onClose}
          />
      )}
      {currentScreen.type === 'levelUp' && <LevelUpScreen />}
      {currentScreen.type === 'exploration' && (
          <ExplorationScreen
              tableId={currentScreen.tableId}
              onceOnly={currentScreen.onceOnly}
              onComplete={currentScreen.onComplete}
              onNavigate={setCurrentScreen}
          />
      )}
      {currentScreen.type === 'rest' && (
          <RestScreen
              onClose={() => setCurrentScreen({ type: 'story' })}
          />
      )}
      {currentScreen.type === 'testing' && (
          <TestingScreen
              onStartCombat={() => setCurrentScreen({ type: 'combat', enemyId: 'goblin', onVictoryNodeId: '' })}
              onCreateCharacter={handleCreateCharacter}
              onViewCharacter={character ? handleViewSheet : undefined}
              onNavigate={setCurrentScreen}
          />
      )}
    </>
  );
}

export default App;
