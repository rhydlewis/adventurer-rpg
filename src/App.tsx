import { useState, useEffect } from 'react';
import { HomeScreen } from './screens';
import { SplashScreen } from './screens';
import { MainMenuScreen } from './screens';
import { CombatScreen } from './screens';
import { CharacterCreationScreen } from './screens';
import { QuickCharacterCreationScreen } from './screens';
import { CharacterSheetScreen } from './screens';
import { StoryScreen } from './screens';
import { useCharacterStore } from './stores/characterStore';
import { useNarrativeStore } from './stores/narrativeStore';
// import { testCampaign } from './data/campaigns/test-campaign';
import { validationCampaign } from './data/campaigns/validation-campaign.ts';
import type { Screen, Character } from './types';
import { LockPickingScreen } from './screens';
import { MerchantScreen } from './screens';
import { ExplorationScreen } from './screens';
import { LevelUpScreen } from './screens';
import {TestingScreen} from "./screens/TestingScreen.tsx";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'splash' });
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const { character, creationStep, startCreation, setCharacter } = useCharacterStore();
  const { setNavigationCallback, phase2CustomizationPending, enterNode } = useNarrativeStore();

  // Debug: Log screen changes
  useEffect(() => {
    console.log('[DEBUG] Screen changed to:', currentScreen.type);
  }, [currentScreen]);

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

  const handleStartStory = () => {
    // Load and start the validation campaign
    // Character creation will be handled by the campaign itself
    const { loadCampaign, startCampaign } = useNarrativeStore.getState();
    loadCampaign(validationCampaign);
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
          onTesting={() => setCurrentScreen({ type: 'testing' })}
        />
      )}
      {currentScreen.type === 'home' && (
        <HomeScreen
          hasCharacter={character !== null}
          onStartStory={handleStartStory}
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
          onExit={() => setCurrentScreen({ type: 'home' })}
          onViewCharacterSheet={character ? handleViewSheet : undefined}
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
