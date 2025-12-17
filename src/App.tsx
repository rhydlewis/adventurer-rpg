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
import { createCharacter } from './utils/characterCreation';
import { CLASSES } from './data/classes';
import type { Screen } from './types';
import {DEFAULT_AVATAR} from "./data/avatars.ts";
import { LockPickingScreen } from './screens';
import { MerchantScreen } from './screens';
import { ExplorationScreen } from './screens';
import { LevelUpScreen } from './screens';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'splash' });
  const { character, creationStep, startCreation, setCharacter } = useCharacterStore();
  const { setNavigationCallback } = useNarrativeStore();

  // Register navigation callback with narrative store
  useEffect(() => {
    setNavigationCallback(setCurrentScreen);
  }, [setNavigationCallback]);

  // When character creation is complete, show character sheet
  if (
    creationStep === 'complete' &&
    character &&
    currentScreen.type === 'characterCreation'
  ) {
    setCurrentScreen({ type: 'characterSheet' });
  }

  const handleCreateCharacter = () => {
    startCreation();
    setCurrentScreen({ type: 'characterCreation' });
  };

  const handleViewSheet = () => {
    setCurrentScreen({ type: 'characterSheet' });
  };

  const handleCloseSheet = () => {
    setCurrentScreen({ type: 'home' });
  };

  const handleStartStory = () => {
    // Create a default test character if none exists (for testing)
    if (!character) {
      const testChar = createCharacter({
        name: 'Theron Stormfist',
        avatarPath: DEFAULT_AVATAR,
        class: 'Fighter',
        attributes: CLASSES.Fighter.recommendedAttributes,
        skillRanks: {
          Athletics: 1,
          Stealth: 0,
          Perception: 1,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 1,
        },
        selectedFeat: 'Weapon Focus',
      });
      testChar.gold = 100;
      setCharacter(testChar);
    }

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
        />
      )}
      {currentScreen.type === 'home' && (
        <HomeScreen
          onStartCombat={() => setCurrentScreen({ type: 'combat', enemyId: 'goblin', onVictoryNodeId: '' })}
          onCreateCharacter={handleCreateCharacter}
          onViewCharacter={character ? handleViewSheet : undefined}
          hasCharacter={character !== null}
          onStartStory={handleStartStory}
          onNavigate={setCurrentScreen}
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
      {currentScreen.type === 'characterSheet' && character && (
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
    </>
  );
}

export default App;
