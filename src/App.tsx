import { useState, useEffect } from 'react';
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
import { useCharacterStore } from './stores/characterStore';
import { useNarrativeStore } from './stores/narrativeStore';
import { availableCampaigns } from './data/campaigns';
import type { Screen, Character, Campaign } from './types';
import { LockPickingScreen } from './screens';
import { MerchantScreen } from './screens';
import { ExplorationScreen } from './screens';
import { LevelUpScreen } from './screens';
import {TestingScreen} from "./screens/TestingScreen.tsx";
import { App as CapApp } from '@capacitor/app';
import { GameSaveManager } from './utils/gameSaveManager';
import type { GameSave, SaveMetadata } from './types/gameSave';

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

  const handleCreateCharacter = () => {
    startCreation();
    setCurrentScreen({ type: 'characterCreation' });
  };

  const handleViewSheet = () => {
    setPreviousScreen(currentScreen);
    setCurrentScreen({ type: 'characterSheet' });
  };

  const handleCloseSheet = () => {
    // Return to previous screen, or home if no previous screen exists
    if (previousScreen) {
      setCurrentScreen(previousScreen);
      setPreviousScreen(null);
    } else {
      setCurrentScreen({ type: 'home' });
    }
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

    // If conversation log is empty (happens with re-initialized conversation),
    // re-enter the current node to populate the log with the node's description
    if (state.conversation && state.conversation.log.length === 0) {
      console.log('[App] Conversation log is empty, re-entering node:', state.conversation.currentNodeId);
      const { enterNode } = useNarrativeStore.getState();
      enterNode(state.conversation.currentNodeId, save.character);
    }

    // Navigate to story screen
    setCurrentScreen({ type: 'story' });
    console.log('[App] Save loaded successfully, navigating to story');
  };

  const handleStartStory = () => {
    // Navigate to campaign selection screen
    setCurrentScreen({ type: 'chooseCampaign' });
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    // Load and start the selected campaign
    const { loadCampaign, startCampaign } = useNarrativeStore.getState();
    loadCampaign(campaign);
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
        />
      )}
      {currentScreen.type === 'chooseCampaign' && (
        <ChooseCampaignScreen
          campaigns={availableCampaigns}
          onSelectCampaign={handleSelectCampaign}
          onBack={() => setCurrentScreen({ type: 'home' })}
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
        />
      )}
      {currentScreen.type === 'characterCreation' && <CharacterCreationScreen />}
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
          onViewMap={() => setCurrentScreen({ type: 'worldMap' })}
        />
      )}
      {currentScreen.type === 'worldMap' && (
        <WorldMapScreen
          onReturnToStory={() => setCurrentScreen({ type: 'story' })}
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
      {currentScreen.type === 'merchant' && (
          <MerchantScreen
              shopInventory={currentScreen.shopInventory}
              buyPrices={currentScreen.buyPrices}
              onClose={currentScreen.onClose}
          />
      )}
      {currentScreen.type === 'levelUp' && (
          <LevelUpScreen
              newLevel={currentScreen.newLevel}
              featChoices={currentScreen.featChoices}
              onComplete={currentScreen.onComplete}
          />
      )}
      {currentScreen.type === 'exploration' && (
          <ExplorationScreen
              tableId={currentScreen.tableId}
              onceOnly={currentScreen.onceOnly}
              onComplete={currentScreen.onComplete}
              onNavigate={setCurrentScreen}
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
