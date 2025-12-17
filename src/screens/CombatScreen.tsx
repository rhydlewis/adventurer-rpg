import { useState, useEffect, useRef } from 'react';
import { useCombatStore } from '../stores/combatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useNarrativeStore } from '../stores/narrativeStore';
import { setForcedD20Roll } from '../utils/dice';
import { getAvailableActions } from '../utils/actions';
import { generateEnemy } from '../utils/enemyGeneration';
import type { CombatState } from '../types';
import { Icon, HamburgerMenu } from '../components';
import { getEntityDisplayClass } from '../utils/entityHelpers';

// Action icon mapping
const actionIcons = {
  attack: 'Sword' as const,
  cast_spell: 'Sparkles' as const,
  use_ability: 'Zap' as const,
  special: 'Star' as const,
};

const formatModifier = (value: number): string => {
  return value >= 0 ? `+${value}` : `${value}`;
};

interface CombatScreenProps {
  enemyId: string;
  onVictoryNodeId: string;
  onVictory: (victoryNodeId: string) => void;
  onDefeat: () => void;
  onViewCharacterSheet?: () => void;
}

export function CombatScreen({ enemyId, onVictoryNodeId, onVictory, onDefeat, onViewCharacterSheet }: CombatScreenProps) {
  const { combat, startCombat, executeTurn, resetCombat, retreat } = useCombatStore();
  const { character, setCharacter, saveCharacter } = useCharacterStore();
  const { saveNarrativeState } = useNarrativeStore();
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Initialize combat when component mounts
  useEffect(() => {
    // Only initialize combat if not already in combat
    if (!combat && character) {
      // Generate enemy from template
      const enemy = generateEnemy(enemyId);

      if (!enemy) {
        console.error(`Enemy with ID "${enemyId}" not found in database`);
        // Fallback: trigger defeat callback
        onDefeat();
        return;
      }

      // Start combat with loaded enemy
      startCombat(character, enemy);
    }
  }, [combat, character, enemyId, startCombat, onDefeat]);

  // Auto-scroll to bottom of combat log when new entries are added
  useEffect(() => {
    if (logEndRef.current && logContainerRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [combat?.log]);

  const handleForceRoll = (value: number) => {
    setForcedD20Roll(value);
  };

  if (!combat) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary text-fg-primary">
        <div className="text-center">
          <p className="text-xl body-primary">Loading combat...</p>
        </div>
      </div>
    );
  }

  const handleVictory = () => {
    resetCombat();
    onVictory(onVictoryNodeId);
  };

  const handleDefeat = () => {
    resetCombat();
    onDefeat();
  };

  const handleEndCombat = () => {
    // Early exit from combat (treated as retreat/defeat)
    resetCombat();
    onDefeat();
  };

  const handleSaveGame = () => {
    saveCharacter();
    saveNarrativeState();
  };

  const actions = getAvailableActions(combat.playerCharacter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-fg-primary">
      {/* Fixed Container - No page scroll */}
      <div className="h-screen flex flex-col max-w-2xl mx-auto">

        {/* Header - Compact */}
        <div className="flex-none px-4 pt-4 pb-2 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm border-b border-amber-900/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-600/20 border border-amber-600/50 rounded flex items-center justify-center">
                <span className="text-amber-500 stat-small text-sm">{combat.turn}</span>
              </div>
              <h1 className="text-lg heading-tertiary text-amber-500 tracking-wide">BATTLE</h1>
            </div>
            <HamburgerMenu
              onViewCharacterSheet={onViewCharacterSheet}
              onSaveGame={handleSaveGame}
              onExit={handleEndCombat}
            />
          </div>

          {/* Initiative Strip - Minimal */}
          {combat.initiative && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-xs body-secondary">
              <div className={`px-2 py-1 rounded ${
                combat.currentActor === 'player'
                  ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
              }`}>
                {combat.playerCharacter.name.split(' ')[0]} {combat.initiative.player.total}
              </div>
              <span className="text-slate-600">vs</span>
              <div className={`px-2 py-1 rounded ${
                combat.currentActor === 'enemy'
                  ? 'bg-red-900/50 text-red-300 border border-red-700/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
              }`}>
                {combat.enemy.name.split(' ')[0]} {combat.initiative.enemy.total}
              </div>
            </div>
          )}
        </div>

        {/* Combatants - Compact Side-by-Side */}
        <div className="flex-none px-4 pt-3 pb-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Player Compact */}
            <CompactCombatant
              character={combat.playerCharacter}
              conditions={combat.activeConditions?.player || []}
              variant="player"
            />

            {/* Enemy Compact */}
            <CompactCombatant
              character={combat.enemy}
              conditions={combat.activeConditions?.enemy || []}
              variant="enemy"
            />
          </div>

          {/* Detailed Stats Toggle */}
          <button
            onClick={() => setShowDetailedStats(!showDetailedStats)}
            className="w-full mt-2 text-xs text-slate-500 hover:text-slate-300 body-secondary flex items-center justify-center space-x-1 transition-colors"
          >
            <Icon name="Info" size={12} />
            <span>{showDetailedStats ? 'Hide' : 'Show'} Detailed Stats</span>
          </button>

          {/* Expandable Detailed Stats */}
          {showDetailedStats && (
            <div className="mt-3 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <DetailedStatsCompact character={combat.playerCharacter} variant="player" />
              <DetailedStatsCompact character={combat.enemy} variant="enemy" />
            </div>
          )}
        </div>

        {/* Combat Chronicle - Compact Fixed Height */}
        <div className="flex-none px-4 py-2">
          <div className="h-32 flex flex-col bg-gradient-to-br from-amber-950/30 to-slate-900/50 rounded-lg border border-amber-900/40 backdrop-blur-sm overflow-hidden">
            {/* Chronicle Header */}
            <div className="flex-none px-3 py-1.5 bg-gradient-to-r from-amber-900/20 to-transparent border-b border-amber-800/30 flex items-center space-x-2">
              <Icon name="ScrollText" size={12} className="text-amber-600" />
              <span className="text-[10px] label-primary text-amber-500 tracking-wider">Battle Chronicle</span>
            </div>

            {/* Scrollable Log */}
            <div
              ref={logContainerRef}
              className="flex-1 overflow-y-auto px-3 py-1.5 space-y-1 scrollbar-thin scrollbar-thumb-amber-900/50 scrollbar-track-transparent"
            >
              {combat.log.length === 0 ? (
                <div className="text-center text-slate-600 text-[10px] body-secondary italic py-4">
                  The battle is about to begin...
                </div>
              ) : (
                combat.log.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`text-[10px] combat-log p-1.5 rounded border-l-2 leading-snug ${
                      entry.actor === 'player'
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                        : entry.actor === 'enemy'
                        ? 'bg-red-950/40 border-red-700/60 text-red-200'
                        : 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] text-slate-500 mr-1">[T{entry.turn}]</span>
                      <span className="font-semibold">
                        {entry.actor === 'player' ? combat.playerCharacter.name.split(' ')[0] :
                         entry.actor === 'enemy' ? combat.enemy.name.split(' ')[0] :
                         'System'}:
                      </span>{' '}
                      <span className="opacity-90">{entry.message}</span>
                    </div>
                    {/* Display taunt if present */}
                    {entry.taunt && (
                      <div className="mt-1 pl-2 text-[9px] border-l border-gray-600">
                        🌀 {entry.taunt}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Actions Area - Fixed Bottom */}
        <div className="flex-none px-4 pb-4 pt-2">
          {combat.winner ? (
            <VictoryDefeatCard
              winner={combat.winner}
              playerName={combat.playerCharacter.name}
              enemyName={combat.enemy.name}
              handleVictory={handleVictory}
              handleDefeat={handleDefeat}
            />
          ) : (
            <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs label-primary text-amber-500 tracking-wider flex items-center space-x-2">
                  <Icon name="Swords" size={14} />
                  <span>Your Actions</span>
                </h3>
                <span className="text-[10px] text-slate-500 body-secondary">
                  {actions.filter(a => a.available && !a.disabled).length} available
                </span>
              </div>

              {/* Grid Layout Actions - 2 columns, auto rows */}
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action, index) => {
                  const isDisabled = !action.available || action.disabled;
                  const iconName = actionIcons[action.type as keyof typeof actionIcons] || 'Zap';

                  return (
                    <button
                      key={index}
                      onClick={() => !isDisabled && executeTurn(action)}
                      disabled={isDisabled}
                      className={`min-h-[56px] p-2 rounded-lg transition-all button-text flex items-center space-x-2 ${
                        isDisabled
                          ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800'
                          : action.type === 'attack'
                          ? 'bg-gradient-to-br from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white border border-emerald-600/50 shadow-lg shadow-emerald-900/30 active:scale-95'
                          : action.type === 'cast_spell'
                          ? 'bg-gradient-to-br from-violet-700 to-violet-800 hover:from-violet-600 hover:to-violet-700 text-white border border-violet-600/50 shadow-lg shadow-violet-900/30 active:scale-95'
                          : action.type === 'use_ability'
                          ? 'bg-gradient-to-br from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white border border-blue-600/50 shadow-lg shadow-blue-900/30 active:scale-95'
                          : 'bg-gradient-to-br from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white border border-amber-600/50 shadow-lg shadow-amber-900/30 active:scale-95'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-1.5 rounded ${isDisabled ? 'bg-slate-800' : 'bg-black/20'}`}>
                        <Icon name={iconName} size={18} />
                      </div>

                      {/* Action Details */}
                      <div className="flex-1 text-left min-w-0">
                        <div className={`text-xs font-bold leading-tight truncate ${isDisabled ? 'opacity-60' : ''}`}>
                          {action.name}
                        </div>
                        {action.type === 'use_ability' && action.usesRemaining !== undefined && (
                          <div className="text-[9px] opacity-75 mt-0.5">
                            {action.usesRemaining}/{action.maxUses} uses
                          </div>
                        )}
                        {isDisabled && action.disabledReason && (
                          <div className="text-[9px] opacity-75 leading-tight mt-0.5">
                            {action.disabledReason}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Retreat Button - Full Width Below Actions */}
              {combat.canRetreat && (
                <button
                  className="w-full mt-3 px-4 py-3 rounded-lg button-text text-sm bg-gradient-to-br from-orange-700/30 to-orange-800/30 border-2 border-orange-600/50 text-orange-300 hover:from-orange-600/40 hover:to-orange-700/40 hover:border-orange-500/60 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                  onClick={() => {
                    const retreatResult = retreat();
                    if (retreatResult) {
                      // Update character with retreat damage/gold loss
                      setCharacter(retreatResult.player);

                      // Navigate to safe node
                      // TODO: Wire this up with narrative store
                      onDefeat(); // For now, treat as defeat
                    }
                  }}
                >
                  <Icon name="LogOut" size={18} />
                  <span>Retreat from Combat</span>
                  <span className="text-[10px] opacity-75">(Penalty: -20 gold, 5 damage)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Debug Panel - Collapsible */}
        {debugMode && (
          <div className="flex-none px-4 pb-4">
            <div className="bg-slate-900/90 border border-amber-800/50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleForceRoll(20)}
                  className="px-2 py-1.5 bg-emerald-900/50 text-emerald-300 rounded border border-emerald-700/50 hover:bg-emerald-800/50 transition-colors"
                >
                  Force Crit (20)
                </button>
                <button
                  onClick={() => handleForceRoll(1)}
                  className="px-2 py-1.5 bg-red-900/50 text-red-300 rounded border border-red-700/50 hover:bg-red-800/50 transition-colors"
                >
                  Force Fumble (1)
                </button>
                <button
                  onClick={() => handleForceRoll(15)}
                  className="px-2 py-1.5 bg-blue-900/50 text-blue-300 rounded border border-blue-700/50 hover:bg-blue-800/50 transition-colors"
                >
                  Force Hit (15)
                </button>
                <button
                  onClick={() => handleForceRoll(5)}
                  className="px-2 py-1.5 bg-slate-700/50 text-slate-300 rounded border border-slate-600/50 hover:bg-slate-600/50 transition-colors"
                >
                  Force Miss (5)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Toggle - Floating */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="fixed bottom-4 left-4 w-8 h-8 bg-amber-900/50 border border-amber-700/50 rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-800/50 transition-colors z-50"
        >
          <span className="text-xs">🐛</span>
        </button>
      </div>
    </div>
  );
}

// Compact Combatant Component
interface CompactCombatantProps {
  character: CombatState['playerCharacter'] | CombatState['enemy'];
  conditions: import('../types/condition').Condition[];
  variant: 'player' | 'enemy';
}

function CompactCombatant({ character, conditions, variant }: CompactCombatantProps) {
  const hpPercent = Math.max(0, (character.hp / character.maxHp) * 100);
  const isLowHp = hpPercent < 30;

  return (
    <div className={`rounded-lg p-2.5 border backdrop-blur-sm ${
      variant === 'player'
        ? 'bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border-emerald-800/50'
        : 'bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-800/50'
    }`}>
      {/* Name & Level */}
      <div className="mb-2 flex gap-2 items-start">
        {/* Avatar - player uses /avatars, enemy uses /creatures */}
        {character.avatarPath && (
          <img
            src={`/assets/${variant === 'player' ? 'avatars' : 'creatures'}/${character.avatarPath}`}
            alt={character.name}
            className={`w-12 h-12 rounded-full ring-2 flex-shrink-0 ${
              variant === 'player'
                ? 'ring-emerald-500/50'
                : 'ring-red-500/50'
            }`}
          />
        )}
        <div className="flex-1">
          <h2 className={`text-sm character-name text-sm leading-tight ${
            variant === 'player' ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {character.name.length > 12 ? character.name.split(' ')[0] : character.name}
          </h2>
          <p className="text-[10px] text-slate-500 label-secondary">
            Lv{character.level} {getEntityDisplayClass(character)}
          </p>
        </div>
      </div>

      {/* HP Bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-[9px] label-secondary text-slate-500 tracking-wide">HP</span>
          <span className={`text-xs stat-small ${
            isLowHp ? 'text-red-400' : variant === 'player' ? 'text-emerald-300' : 'text-red-300'
          }`}>
            {character.hp}/{character.maxHp}
          </span>
        </div>
        <div className="w-full bg-slate-900/70 rounded-full h-1.5 border border-slate-800/50">
          <div
            className={`h-full rounded-full transition-all ${
              isLowHp
                ? 'bg-gradient-to-r from-red-600 to-red-500'
                : variant === 'player'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                : 'bg-gradient-to-r from-red-600 to-red-500'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex space-x-1.5">
        <div className={`flex-1 bg-slate-900/50 rounded p-1.5 border ${
          variant === 'player' ? 'border-emerald-900/30' : 'border-red-900/30'
        }`}>
          <div className="text-[9px] text-slate-500 label-secondary">AC</div>
          <div className={`text-sm stat-small ${
            variant === 'player' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {character.ac}
          </div>
        </div>
        <div className={`flex-1 bg-slate-900/50 rounded p-1.5 border ${
          variant === 'player' ? 'border-emerald-900/30' : 'border-red-900/30'
        }`}>
          <div className="text-[9px] text-slate-500 label-secondary">BAB</div>
          <div className={`text-sm stat-small ${
            variant === 'player' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {formatModifier(character.bab)}
          </div>
        </div>
      </div>

      {/* Conditions */}
      {conditions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {conditions.map((condition, idx) => (
            <span
              key={idx}
              className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-400 border border-amber-800/40 label-secondary"
            >
              {condition.type}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Detailed Stats Compact Component
interface DetailedStatsCompactProps {
  character: CombatState['playerCharacter'] | CombatState['enemy'];
  variant: 'player' | 'enemy';
}

function DetailedStatsCompact({ character, variant }: DetailedStatsCompactProps) {
  return (
    <div className={`rounded-lg p-2 border backdrop-blur-sm text-xs ${
      variant === 'player'
        ? 'bg-emerald-950/20 border-emerald-900/30'
        : 'bg-red-950/20 border-red-900/30'
    }`}>
      <div className="space-y-1.5">
        {/* Saves */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 label-secondary text-[10px]">Fort</span>
          <span className="text-emerald-400 stat-modifier">{formatModifier(character.saves.fortitude)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 label-secondary text-[10px]">Reflex</span>
          <span className="text-amber-400 stat-modifier">{formatModifier(character.saves.reflex)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 label-secondary text-[10px]">Will</span>
          <span className="text-violet-400 stat-modifier">{formatModifier(character.saves.will)}</span>
        </div>

        {/* Equipment */}
        {character.equipment && (
          <>
            <div className="border-t border-slate-800/50 pt-1.5 mt-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 label-secondary text-[10px]">Weapon</span>
                <span className="text-slate-300 text-[10px] truncate ml-2">{character.equipment.weapon?.name || 'Unarmed'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Victory/Defeat Card Component
interface VictoryDefeatCardProps {
  winner: 'player' | 'enemy';
  playerName: string;
  enemyName: string;
  handleVictory: () => void;
  handleDefeat: () => void;
}

function VictoryDefeatCard({ winner, playerName, enemyName, handleVictory, handleDefeat }: VictoryDefeatCardProps) {
  return (
    <div className={`rounded-xl p-6 text-center backdrop-blur-md border-2 ${
      winner === 'player'
        ? 'bg-gradient-to-br from-emerald-900/80 to-emerald-950/80 border-emerald-600/50'
        : 'bg-gradient-to-br from-red-900/80 to-red-950/80 border-red-600/50'
    }`}>
      <div className="mb-4">
        {winner === 'player' ? (
          <Icon name="Trophy" size={48} className="text-amber-500 mx-auto" />
        ) : (
          <Icon name="Skull" size={48} className="text-red-500 mx-auto" />
        )}
      </div>
      <h2 className={`text-3xl heading-display mb-2 ${
        winner === 'player' ? 'text-amber-400' : 'text-red-400'
      }`}>
        {winner === 'player' ? 'VICTORY!' : 'DEFEAT!'}
      </h2>
      <p className="text-slate-300 body-primary text-sm mb-4">
        {winner === 'player'
          ? `${enemyName} has been vanquished!`
          : `${playerName} has fallen in battle.`}
      </p>
      <button
        onClick={winner === 'player' ? handleVictory : handleDefeat}
        className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white button-text rounded-lg border border-slate-600 transition-all active:scale-95"
      >
        {winner === 'player' ? 'Continue Adventure' : 'Continue'}
      </button>
    </div>
  );
}
