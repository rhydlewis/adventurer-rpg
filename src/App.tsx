import { useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { CombatScreen } from './screens/CombatScreen';

type Screen = 'home' | 'combat';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  return (
    <>
      {currentScreen === 'home' && (
        <HomeScreen onStartCombat={() => setCurrentScreen('combat')} />
      )}
      {currentScreen === 'combat' && (
        <CombatScreen onEndCombat={() => setCurrentScreen('home')} />
      )}
    </>
  );
}

export default App;
