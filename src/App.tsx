import { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { CombatScreen } from './screens/CombatScreen';
import { CharacterCreationScreen } from './screens/CharacterCreationScreen';
import { CharacterSheetScreen } from './screens/CharacterSheetScreen';
import { StoryScreen } from './screens/StoryScreen';
import { useCharacterStore } from './stores/characterStore';
import { useNarrativeStore } from './stores/narrativeStore';
import { testCampaign } from './data/campaigns/test-campaign';
import { createCharacter } from './utils/characterCreation';
import { CLASSES } from './data/classes';
import type { Screen } from './types/navigation';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'home' });
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
        name: 'Test Fighter',
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
      setCharacter(testChar);
    }

    const { loadCampaign, startCampaign } = useNarrativeStore.getState();
    loadCampaign(testCampaign);
    startCampaign();
    setCurrentScreen({ type: 'story' });
  };

  return (
    <>
      {currentScreen.type === 'home' && (
        <HomeScreen
          onStartCombat={() => setCurrentScreen({ type: 'combat', enemyId: 'goblin', onVictoryNodeId: '' })}
          onCreateCharacter={handleCreateCharacter}
          onViewCharacter={character ? handleViewSheet : undefined}
          hasCharacter={character !== null}
          onStartStory={handleStartStory}
        />
      )}
      {currentScreen.type === 'combat' && (
        <CombatScreen onEndCombat={() => setCurrentScreen({ type: 'home' })} />
      )}
      {currentScreen.type === 'characterCreation' && <CharacterCreationScreen />}
      {currentScreen.type === 'characterSheet' && character && (
        <CharacterSheetScreen character={character} onClose={handleCloseSheet} />
      )}
      {currentScreen.type === 'story' && (
        <StoryScreen onExit={() => setCurrentScreen({ type: 'home' })} />
      )}
    </>
  );
}

export default App;
