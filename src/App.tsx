import { useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { CombatScreen } from './screens/CombatScreen';
import { CharacterSheetScreen } from './screens/CharacterSheetScreen';
import type { Character } from './types';

type Screen = 'home' | 'combat' | 'character';

// Sample character with buffs and debuffs for demonstration
const sampleCharacter: Character = {
  name: 'Theron Brightblade',
  class: 'Fighter',
  level: 5,
  attributes: {
    STR: 18,
    DEX: 14,
    CON: 16,
    INT: 10,
    WIS: 12,
    CHA: 8,
  },
  hp: 45,
  maxHp: 52,
  ac: 18,
  bab: 5,
  saves: {
    fortitude: 5,
    reflex: 2,
    will: 1,
  },
  effects: [
    {
      id: '1',
      name: 'Bull\'s Strength',
      description: '+4 bonus to Strength',
      type: 'buff',
      modifier: 4,
      duration: 5,
      affectedStat: 'STR',
    },
    {
      id: '2',
      name: 'Blessed',
      description: '+1 bonus to attack rolls',
      type: 'buff',
      modifier: 1,
      duration: 3,
    },
    {
      id: '3',
      name: 'Poisoned',
      description: '-2 penalty to Constitution',
      type: 'debuff',
      modifier: -2,
      duration: 4,
      affectedStat: 'CON',
    },
  ],
  avatarUrl: undefined, // Can be set to a URL for a character portrait
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  return (
    <>
      {currentScreen === 'home' && (
        <HomeScreen
          onStartCombat={() => setCurrentScreen('combat')}
          onViewCharacter={() => setCurrentScreen('character')}
        />
      )}
      {currentScreen === 'combat' && (
        <CombatScreen onEndCombat={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'character' && (
        <CharacterSheetScreen
          character={sampleCharacter}
          onBack={() => setCurrentScreen('home')}
        />
      )}
    </>
  );
}

export default App;
