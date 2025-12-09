import { useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { CombatScreen } from './screens/CombatScreen';
import { CharacterCreationScreen } from './screens/CharacterCreationScreen';
import { CharacterSheetScreen } from './screens/CharacterSheetScreen';
import { useCharacterStore } from './stores/characterStore';

type Screen = 'home' | 'combat' | 'creation' | 'sheet';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const { character, creationStep, startCreation } = useCharacterStore();

  // When character creation is complete, show character sheet
  if (creationStep === 'complete' && character && currentScreen === 'creation') {
    setCurrentScreen('sheet');
  }

  const handleCreateCharacter = () => {
    startCreation();
    setCurrentScreen('creation');
  };

  const handleViewSheet = () => {
    setCurrentScreen('sheet');
  };

  const handleCloseSheet = () => {
    setCurrentScreen('home');
  };

  return (
    <>
      {currentScreen === 'home' && (
        <HomeScreen
          onStartCombat={() => setCurrentScreen('combat')}
          onCreateCharacter={handleCreateCharacter}
          onViewCharacter={character ? handleViewSheet : undefined}
          hasCharacter={character !== null}
        />
      )}
      {currentScreen === 'combat' && (
        <CombatScreen onEndCombat={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'creation' && <CharacterCreationScreen />}
      {currentScreen === 'sheet' && character && (
        <CharacterSheetScreen character={character} onClose={handleCloseSheet} />
      )}
    </>
  );
}

export default App;
