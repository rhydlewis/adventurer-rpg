import { useCombatStore } from '../stores/combatStore';

interface CombatScreenProps {
  onEndCombat: () => void;
}

export function CombatScreen({ onEndCombat }: CombatScreenProps) {
  const { combat, executeTurn, resetCombat } = useCombatStore();

  if (!combat) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl">No combat active</p>
          <button
            onClick={onEndCombat}
            className="mt-4 px-6 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const handleEndCombat = () => {
    resetCombat();
    onEndCombat();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Combat - Turn {combat.turn}</h1>
          <button
            onClick={handleEndCombat}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            End Combat
          </button>
        </div>

        {/* Character Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Player */}
          <div className="bg-blue-900 border-2 border-blue-500 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">{combat.playerCharacter.name}</h2>
            <p className="text-sm text-blue-300 mb-3">
              Level {combat.playerCharacter.level} {combat.playerCharacter.class}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">HP:</span>
                <span className={combat.playerCharacter.hp <= 3 ? 'text-red-400' : ''}>
                  {combat.playerCharacter.hp} / {combat.playerCharacter.maxHp}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">AC:</span>
                <span>{combat.playerCharacter.ac}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">BAB:</span>
                <span>+{combat.playerCharacter.bab}</span>
              </div>
            </div>
          </div>

          {/* Enemy */}
          <div className="bg-red-900 border-2 border-red-500 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">{combat.enemy.name}</h2>
            <p className="text-sm text-red-300 mb-3">
              Level {combat.enemy.level} {combat.enemy.class}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">HP:</span>
                <span className={combat.enemy.hp <= 2 ? 'text-red-400' : ''}>
                  {combat.enemy.hp} / {combat.enemy.maxHp}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">AC:</span>
                <span>{combat.enemy.ac}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">BAB:</span>
                <span>+{combat.enemy.bab}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Combat Log */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold mb-3">Combat Log</h3>
          <div className="bg-gray-900 p-4 rounded h-80 overflow-y-auto space-y-2">
            {combat.log.length === 0 ? (
              <p className="text-gray-500 text-center">
                Combat has not started yet. Click Attack to begin!
              </p>
            ) : (
              combat.log.map((entry, idx) => (
                <div
                  key={idx}
                  className={`text-sm p-2 rounded ${
                    entry.actor === 'player'
                      ? 'bg-blue-900/30 text-blue-200'
                      : entry.actor === 'enemy'
                      ? 'bg-red-900/30 text-red-200'
                      : 'bg-yellow-900/30 text-yellow-200 font-bold'
                  }`}
                >
                  <span className="font-mono text-gray-400">[Turn {entry.turn}]</span>{' '}
                  <span className="font-semibold">
                    {entry.actor === 'player' ? combat.playerCharacter.name :
                     entry.actor === 'enemy' ? combat.enemy.name :
                     'System'}:
                  </span>{' '}
                  {entry.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        {combat.winner ? (
          <div className="text-center space-y-4">
            <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6">
              <p className="text-3xl font-bold mb-2">
                {combat.winner === 'player' ? '🎉 Victory!' : '💀 Defeat!'}
              </p>
              <p className="text-gray-300">
                {combat.winner === 'player'
                  ? `${combat.enemy.name} has been defeated!`
                  : `${combat.playerCharacter.name} has fallen in battle.`}
              </p>
            </div>
            <button
              onClick={handleEndCombat}
              className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <button
            onClick={executeTurn}
            className="w-full px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            ⚔️ Attack
          </button>
        )}
      </div>
    </div>
  );
}
