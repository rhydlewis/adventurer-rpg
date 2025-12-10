import { useState } from 'react';
import { useCombatStore } from '../stores/combatStore';
import { setForcedD20Roll } from '../utils/dice';
import { getAvailableActions } from '../utils/actions';

interface CombatScreenProps {
  onEndCombat: () => void;
}

export function CombatScreen({ onEndCombat }: CombatScreenProps) {
  const { combat, executeTurn, resetCombat } = useCombatStore();
  const [debugMode, setDebugMode] = useState(false);

  const handleForceRoll = (value: number) => {
    setForcedD20Roll(value);
  };

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

        {/* Initiative Display */}
        {combat.initiative && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Initiative Order</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded ${combat.currentActor === 'player' ? 'bg-blue-700 font-bold ring-2 ring-blue-400' : 'bg-gray-700'}`}>
                  {combat.playerCharacter.name}: {combat.initiative.player.total}
                </div>
                <span className="text-gray-400">vs</span>
                <div className={`px-4 py-2 rounded ${combat.currentActor === 'enemy' ? 'bg-red-700 font-bold ring-2 ring-red-400' : 'bg-gray-700'}`}>
                  {combat.enemy.name}: {combat.initiative.enemy.total}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {combat.currentActor === 'player' ? combat.playerCharacter.name : combat.enemy.name}'s Turn
              </div>
            </div>
          </div>
        )}

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

            {/* Active Effects */}
            {(combat.dodgeActive?.player || combat.fumbleEffects?.player) && (
              <div className="mt-3 pt-3 border-t border-blue-700">
                <div className="text-xs font-semibold text-blue-300 mb-2">Active Effects:</div>
                <div className="space-y-1">
                  {combat.dodgeActive?.player && (
                    <div className="text-xs bg-green-700 text-white px-2 py-1 rounded">
                      ✓ Dodge: +4 AC (until your next turn)
                    </div>
                  )}
                  {combat.fumbleEffects?.player && (
                    <div className="text-xs bg-yellow-700 text-white px-2 py-1 rounded">
                      ⚠️ {combat.fumbleEffects.player.type.replace('_', ' ').toUpperCase()}
                      {combat.fumbleEffects.player.turnsRemaining && combat.fumbleEffects.player.turnsRemaining > 0
                        ? ` (${combat.fumbleEffects.player.turnsRemaining} turn${combat.fumbleEffects.player.turnsRemaining > 1 ? 's' : ''})`
                        : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
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

            {/* Active Effects */}
            {(combat.dodgeActive?.enemy || combat.fumbleEffects?.enemy) && (
              <div className="mt-3 pt-3 border-t border-red-700">
                <div className="text-xs font-semibold text-red-300 mb-2">Active Effects:</div>
                <div className="space-y-1">
                  {combat.dodgeActive?.enemy && (
                    <div className="text-xs bg-green-700 text-white px-2 py-1 rounded">
                      ✓ Dodge: +4 AC (until next turn)
                    </div>
                  )}
                  {combat.fumbleEffects?.enemy && (
                    <div className="text-xs bg-yellow-700 text-white px-2 py-1 rounded">
                      ⚠️ {combat.fumbleEffects.enemy.type.replace('_', ' ').toUpperCase()}
                      {combat.fumbleEffects.enemy.turnsRemaining && combat.fumbleEffects.enemy.turnsRemaining > 0
                        ? ` (${combat.fumbleEffects.enemy.turnsRemaining} turn${combat.fumbleEffects.enemy.turnsRemaining > 1 ? 's' : ''})`
                        : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Combat Log */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold mb-3">Combat Log</h3>
          <div className="bg-gray-900 p-4 rounded h-80 overflow-y-auto space-y-2 flex flex-col-reverse">
            {combat.log.length === 0 ? (
              <p className="text-gray-500 text-center">
                Combat has not started yet. Click Attack to begin!
              </p>
            ) : (
              combat.log.slice().reverse().map((entry, idx) => (
                <div
                  key={combat.log.length - 1 - idx}
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

        {/* Debug Panel */}
        <div className="bg-gray-800 border border-yellow-600 rounded-lg p-4 mb-6">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="w-full text-left font-bold text-yellow-400 hover:text-yellow-300 flex items-center justify-between"
          >
            <span>🐛 Debug Mode</span>
            <span>{debugMode ? '▼' : '▶'}</span>
          </button>

          {debugMode && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-400">Force next attack roll (affects both player and enemy):</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleForceRoll(20)}
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded font-semibold text-sm"
                >
                  Force Crit (20)
                </button>
                <button
                  onClick={() => handleForceRoll(1)}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded font-semibold text-sm"
                >
                  Force Fumble (1)
                </button>
                <button
                  onClick={() => handleForceRoll(15)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded font-semibold text-sm"
                >
                  Force Hit (15)
                </button>
                <button
                  onClick={() => handleForceRoll(5)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-sm"
                >
                  Force Miss (5)
                </button>
              </div>
              <p className="text-xs text-yellow-500 italic">
                Note: Forced roll applies to the next attack (either player or enemy, whoever attacks first)
              </p>
            </div>
          )}
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
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3">Your Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getAvailableActions(combat.playerCharacter).map((action, index) => {
                const isDisabled = !action.available || action.disabled;
                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && executeTurn(action)}
                    disabled={isDisabled}
                    className={`px-4 py-3 rounded-lg text-left transition-colors ${
                      isDisabled
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : action.type === 'attack'
                        ? 'bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg'
                        : action.type === 'cast_spell'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white font-semibold'
                        : action.type === 'use_ability'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white font-semibold'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white font-semibold'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold">{action.name}</div>
                        <div className="text-sm opacity-90 mt-1">{action.description}</div>
                        {action.type === 'use_ability' && action.usesRemaining !== undefined && (
                          <div className="text-xs mt-1 opacity-75">
                            Uses: {action.usesRemaining}/{action.maxUses}
                          </div>
                        )}
                      </div>
                    </div>
                    {isDisabled && action.disabledReason && (
                      <div className="text-xs text-gray-400 mt-1">
                        {action.disabledReason}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
