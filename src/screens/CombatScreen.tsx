import { useState, useEffect, useRef } from 'react';
import { useCombatStore } from '../stores/combatStore';
import { setForcedD20Roll } from '../utils/dice';
import { getAvailableActions } from '../utils/actions';
import type { CombatState } from '../types/combat';
import { Button, Card, StatusBar, Badge } from '../components';

// Reusable Resources component
interface ResourcesProps {
  character: CombatState['playerCharacter'];
  borderColor: string;
  textColor: string;
}

function Resources({ character, borderColor, textColor }: ResourcesProps) {
  const hasResources =
    character.resources.abilities.length > 0 ||
    character.resources.spellSlots;

  if (!hasResources) return null;

  return (
    <div className={`mt-3 pt-3 border-t border-${borderColor}`}>
      <div className={`text-xs font-semibold text-${textColor} mb-2`}>Resources:</div>
      <div className="space-y-1">
        {/* Spell Slots */}
        {character.resources.spellSlots && (
          <div className="text-xs text-text-secondary font-inter">
            <span className="font-semibold">Spell Slots:</span>
            {character.resources.spellSlots.level1 && (
              <span className="ml-2">
                Level 1: {character.resources.spellSlots.level1.current}/{character.resources.spellSlots.level1.max}
              </span>
            )}
          </div>
        )}

        {/* Abilities */}
        {character.resources.abilities
          .filter(ability => ability.type === 'encounter' || ability.type === 'daily')
          .map((ability, idx) => (
            <div key={idx} className="text-xs text-text-secondary font-inter">
              <span className="font-semibold">{ability.name}:</span>
              <span className="ml-2">
                {ability.currentUses}/{ability.maxUses}
                {ability.type === 'encounter' && <span className="text-text-muted ml-1">(per combat)</span>}
                {ability.type === 'daily' && <span className="text-text-muted ml-1">(per day)</span>}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

// Phase 1.4: Active Effects using Badge component
interface ActiveEffectsProps {
  conditions: import('../types/condition').Condition[];
  borderColor: string;
  textColor: string;
}

function ActiveEffects({ conditions, borderColor, textColor }: ActiveEffectsProps) {
  if (conditions.length === 0) return null;

  return (
    <div className={`mt-3 pt-3 border-t border-${borderColor}`}>
      <div className={`text-xs font-semibold text-${textColor} mb-2 font-inter`}>Active Effects:</div>
      <div className="space-y-1">
        {conditions.map((condition, idx) => (
          <Badge
            key={idx}
            type={condition.category}
            duration={condition.turnsRemaining}
          >
            {condition.type}: {condition.description}
          </Badge>
        ))}
      </div>
    </div>
  );
}

interface CombatScreenProps {
  onEndCombat: () => void;
}

export function CombatScreen({ onEndCombat }: CombatScreenProps) {
  const { combat, executeTurn, resetCombat } = useCombatStore();
  const [debugMode, setDebugMode] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of combat log when new entries are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combat?.log]);

  const handleForceRoll = (value: number) => {
    setForcedD20Roll(value);
  };

  if (!combat) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary text-text-primary">
        <div className="text-center">
          <p className="text-xl font-inter">No combat active</p>
          <Button onClick={onEndCombat} variant="secondary" className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const handleEndCombat = () => {
    resetCombat();
    onEndCombat();
  };

  return (
    <div className="min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-h1 font-cinzel font-bold text-text-accent">
            Combat - Turn {combat.turn}
          </h1>
          <Button onClick={handleEndCombat} variant="secondary">
            End Combat
          </Button>
        </div>

        {/* Initiative Display */}
        {combat.initiative && (
          <Card variant="neutral" className="mb-6">
            <h3 className="text-lg font-cinzel font-bold mb-3">Initiative Order</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded font-inter ${
                  combat.currentActor === 'player'
                    ? 'bg-player font-bold ring-2 ring-player'
                    : 'bg-surface'
                }`}>
                  {combat.playerCharacter.name}: {combat.initiative.player.total}
                </div>
                <span className="text-text-muted">vs</span>
                <div className={`px-4 py-2 rounded font-inter ${
                  combat.currentActor === 'enemy'
                    ? 'bg-enemy font-bold ring-2 ring-enemy'
                    : 'bg-surface'
                }`}>
                  {combat.enemy.name}: {combat.initiative.enemy.total}
                </div>
              </div>
              <div className="text-sm text-text-muted font-inter">
                {combat.currentActor === 'player' ? combat.playerCharacter.name : combat.enemy.name}'s Turn
              </div>
            </div>
          </Card>
        )}

        {/* Character Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Player */}
          <Card variant="player">
            <h2 className="text-xl font-cinzel font-bold mb-2">{combat.playerCharacter.name}</h2>
            <p className="text-sm text-text-accent mb-3 font-inter">
              Level {combat.playerCharacter.level} {combat.playerCharacter.class}
            </p>

            {/* HP Bar */}
            <div className="mb-3">
              <StatusBar
                current={combat.playerCharacter.hp}
                max={combat.playerCharacter.maxHp}
                label="HP"
              />
            </div>

            {/* Stats */}
            <div className="space-y-2 font-inter">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">AC:</span>
                <span>{combat.playerCharacter.ac}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">BAB:</span>
                <span>+{combat.playerCharacter.bab}</span>
              </div>
            </div>

            {/* Resources */}
            <Resources
              character={combat.playerCharacter}
              borderColor="border-player"
              textColor="text-text-accent"
            />

            {/* Active Effects */}
            <ActiveEffects
              conditions={combat.activeConditions?.player || []}
              borderColor="border-player"
              textColor="text-text-accent"
            />
          </Card>

          {/* Enemy */}
          <Card variant="enemy">
            <h2 className="text-xl font-cinzel font-bold mb-2">{combat.enemy.name}</h2>
            <p className="text-sm text-text-accent mb-3 font-inter">
              Level {combat.enemy.level} {combat.enemy.class}
            </p>

            {/* HP Bar */}
            <div className="mb-3">
              <StatusBar
                current={combat.enemy.hp}
                max={combat.enemy.maxHp}
                label="HP"
              />
            </div>

            {/* Stats */}
            <div className="space-y-2 font-inter">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">AC:</span>
                <span>{combat.enemy.ac}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">BAB:</span>
                <span>+{combat.enemy.bab}</span>
              </div>
            </div>

            {/* Active Effects */}
            <ActiveEffects
              conditions={combat.activeConditions?.enemy || []}
              borderColor="border-enemy"
              textColor="text-text-accent"
            />
          </Card>
        </div>

        {/* Combat Log */}
        <Card variant="neutral" className="mb-6">
          <h3 className="text-lg font-cinzel font-bold mb-3">Combat Log</h3>
          <div className="bg-surface p-4 rounded h-80 overflow-y-auto space-y-2">
            {combat.log.length === 0 ? (
              <p className="text-text-muted text-center font-inter">
                Combat has not started yet. Click Attack to begin!
              </p>
            ) : (
              combat.log.map((entry, idx) => (
                <div
                  key={idx}
                  className={`text-sm p-2 rounded font-monospace ${
                    entry.actor === 'player'
                      ? 'bg-player/20 text-blue-200'
                      : entry.actor === 'enemy'
                      ? 'bg-enemy/20 text-red-200'
                      : 'bg-warning/20 text-yellow-200 font-bold'
                  }`}
                >
                  <span className="text-text-muted">[Turn {entry.turn}]</span>{' '}
                  <span className="font-semibold">
                    {entry.actor === 'player' ? combat.playerCharacter.name :
                     entry.actor === 'enemy' ? combat.enemy.name :
                     'System'}:
                  </span>{' '}
                  {entry.message}
                </div>
              ))
            )}
            {/* Scroll anchor */}
            <div ref={logEndRef} />
          </div>
        </Card>

        {/* Debug Panel */}
        <Card variant="neutral" className="mb-6 border-warning">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="w-full text-left font-bold text-warning hover:text-warning/80 flex items-center justify-between font-inter transition-colors"
          >
            <span>🐛 Debug Mode</span>
            <span>{debugMode ? '▼' : '▶'}</span>
          </button>

          {debugMode && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-text-muted font-inter">
                Force next attack roll (affects both player and enemy):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  onClick={() => handleForceRoll(20)}
                  variant="primary"
                  className="bg-success hover:bg-success/90"
                >
                  Force Crit (20)
                </Button>
                <Button
                  onClick={() => handleForceRoll(1)}
                  variant="danger"
                >
                  Force Fumble (1)
                </Button>
                <Button
                  onClick={() => handleForceRoll(15)}
                  variant="primary"
                >
                  Force Hit (15)
                </Button>
                <Button
                  onClick={() => handleForceRoll(5)}
                  variant="secondary"
                >
                  Force Miss (5)
                </Button>
              </div>
              <p className="text-xs text-warning italic font-inter">
                Note: Forced roll applies to the next attack (either player or enemy, whoever attacks first)
              </p>
            </div>
          )}
        </Card>

        {/* Actions */}
        {combat.winner ? (
          <div className="text-center space-y-4">
            <Card variant="neutral" className="border-2 border-warning">
              <p className="text-3xl font-cinzel font-bold mb-2">
                {combat.winner === 'player' ? '🎉 Victory!' : '💀 Defeat!'}
              </p>
              <p className="text-text-secondary font-inter">
                {combat.winner === 'player'
                  ? `${combat.enemy.name} has been defeated!`
                  : `${combat.playerCharacter.name} has fallen in battle.`}
              </p>
            </Card>
            <Button
              onClick={handleEndCombat}
              variant="primary"
              className="w-full text-lg"
            >
              Return to Home
            </Button>
          </div>
        ) : (
          <Card variant="neutral">
            <h3 className="text-lg font-cinzel font-bold mb-3">Your Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getAvailableActions(combat.playerCharacter).map((action, index) => {
                const isDisabled = !action.available || action.disabled;

                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && executeTurn(action)}
                    disabled={isDisabled}
                    className={`min-h-[44px] px-4 py-3 rounded-lg text-left transition-all font-inter ${
                      isDisabled
                        ? 'bg-surface text-text-muted cursor-not-allowed'
                        : action.type === 'attack'
                        ? 'bg-success hover:bg-success/90 text-white font-semibold shadow-lg active:scale-[0.98]'
                        : action.type === 'cast_spell'
                        ? 'bg-magic hover:bg-magic/90 text-white font-semibold active:scale-[0.98]'
                        : action.type === 'use_ability'
                        ? 'bg-player hover:bg-player/90 text-white font-semibold active:scale-[0.98]'
                        : 'bg-warning hover:bg-warning/90 text-white font-semibold active:scale-[0.98]'
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
                      <div className="text-xs text-text-muted mt-1">
                        {action.disabledReason}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
