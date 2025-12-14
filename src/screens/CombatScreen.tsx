import { useState, useEffect, useRef } from 'react';
import { useCombatStore } from '../stores/combatStore';
import { setForcedD20Roll } from '../utils/dice';
import { getAvailableActions } from '../utils/actions';
import type { CombatState } from '../types/combat';
import { Button, Card, Icon, Badge } from '../components';

// Tab type for navigation
type TabType = 'battle' | 'log' | 'status';

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
  onEndCombat: () => void;
}

export function CombatScreen({ onEndCombat }: CombatScreenProps) {
  const { combat, executeTurn, resetCombat } = useCombatStore();
  const [activeTab, setActiveTab] = useState<TabType>('battle');
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
          <div>
            <h1 className="text-display font-cinzel font-bold text-text-accent">Combat</h1>
            <p className="text-h2 text-text-secondary font-inter">Turn {combat.turn}</p>
          </div>
          <Button onClick={handleEndCombat} variant="secondary">
            End Combat
          </Button>
        </div>

        {/* Initiative Banner - Compact */}
        {combat.initiative && (
          <Card variant="neutral" className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Zap" size={20} className="text-warning" />
                <span className="font-inter text-sm text-text-muted">Initiative:</span>
                <div className={`px-3 py-1 rounded font-inter text-sm ${
                  combat.currentActor === 'player'
                    ? 'bg-player text-white font-bold'
                    : 'bg-surface text-text-secondary'
                }`}>
                  {combat.playerCharacter.name} {combat.initiative.player.total}
                </div>
                <span className="text-text-muted text-xs">vs</span>
                <div className={`px-3 py-1 rounded font-inter text-sm ${
                  combat.currentActor === 'enemy'
                    ? 'bg-enemy text-white font-bold'
                    : 'bg-surface text-text-secondary'
                }`}>
                  {combat.enemy.name} {combat.initiative.enemy.total}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Combatant Status - Compact Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Player Compact Card */}
          <CombatantCard
            character={combat.playerCharacter}
            conditions={combat.activeConditions?.player || []}
            variant="player"
          />

          {/* Enemy Compact Card */}
          <CombatantCard
            character={combat.enemy}
            conditions={combat.activeConditions?.enemy || []}
            variant="enemy"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <TabButton
            active={activeTab === 'battle'}
            onClick={() => setActiveTab('battle')}
            icon="Swords"
          >
            Battle
          </TabButton>
          <TabButton
            active={activeTab === 'log'}
            onClick={() => setActiveTab('log')}
            icon="ScrollText"
          >
            Log
          </TabButton>
          <TabButton
            active={activeTab === 'status'}
            onClick={() => setActiveTab('status')}
            icon="Info"
          >
            Status
          </TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'battle' && (
          <BattleTab
            combat={combat}
            executeTurn={executeTurn}
            handleEndCombat={handleEndCombat}
          />
        )}
        {activeTab === 'log' && (
          <LogTab combat={combat} logEndRef={logEndRef} />
        )}
        {activeTab === 'status' && (
          <StatusTab combat={combat} />
        )}

        {/* Debug Panel - Collapsed by default */}
        <Card variant="neutral" className="mt-6 border-warning">
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
              <div className="grid grid-cols-2 gap-2">
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
      </div>
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: keyof typeof import('lucide-react').icons;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-inter font-semibold transition-all min-h-[44px] ${
        active
          ? 'bg-player text-white shadow-lg'
          : 'bg-surface text-text-secondary hover:bg-surface/80 hover:text-text-primary'
      }`}
    >
      <Icon name={icon} size={20} />
      <span>{children}</span>
    </button>
  );
}

// Compact Combatant Card
interface CombatantCardProps {
  character: CombatState['playerCharacter'] | CombatState['enemy'];
  conditions: import('../types/condition').Condition[];
  variant: 'player' | 'enemy';
}

function CombatantCard({ character, conditions, variant }: CombatantCardProps) {
  const borderColor = variant === 'player' ? 'border-player' : 'border-enemy';
  const accentColor = variant === 'player' ? 'text-player' : 'text-enemy';

  return (
    <Card variant={variant} className="p-3">
      {/* Character Name & Level */}
      <div className="mb-3">
        <h2 className="text-lg font-cinzel font-bold text-text-accent">{character.name}</h2>
        <p className="text-xs text-text-secondary font-inter">
          Level {character.level} {character.class}
        </p>
      </div>

      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-inter text-text-muted">Hit Points</span>
          <span className="text-sm font-cinzel font-bold text-text-accent">
            {character.hp} / {character.maxHp}
          </span>
        </div>
        <div className="w-full bg-surface rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              variant === 'player' ? 'bg-player' : 'bg-enemy'
            }`}
            style={{ width: `${Math.max(0, (character.hp / character.maxHp) * 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface rounded p-2 border border-border-default">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} className={accentColor} />
            <div className="flex-1">
              <div className="font-inter text-xs text-text-muted">AC</div>
              <div className="font-cinzel font-bold text-lg text-text-accent">
                {character.ac}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded p-2 border border-border-default">
          <div className="flex items-center space-x-2">
            <Icon name="Sword" size={16} className={accentColor} />
            <div className="flex-1">
              <div className="font-inter text-xs text-text-muted">BAB</div>
              <div className="font-cinzel font-bold text-lg text-text-accent">
                {formatModifier(character.bab)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Conditions */}
      {conditions.length > 0 && (
        <div className={`mt-3 pt-3 border-t ${borderColor}`}>
          <div className="space-y-1">
            {conditions.map((condition, idx) => (
              <Badge
                key={idx}
                type={condition.category}
                duration={condition.turnsRemaining}
              >
                {condition.type}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// Battle Tab - Actions and Victory/Defeat
interface BattleTabProps {
  combat: CombatState;
  executeTurn: (action: ReturnType<typeof getAvailableActions>[number]) => void;
  handleEndCombat: () => void;
}

function BattleTab({ combat, executeTurn, handleEndCombat }: BattleTabProps) {
  if (combat.winner) {
    return (
      <div className="text-center space-y-4">
        <Card variant="neutral" className="border-2 border-warning p-6">
          <div className="mb-4">
            {combat.winner === 'player' ? (
              <Icon name="Trophy" size={48} className="text-warning mx-auto" />
            ) : (
              <Icon name="Skull" size={48} className="text-enemy mx-auto" />
            )}
          </div>
          <p className="text-3xl font-cinzel font-bold mb-2 text-text-accent">
            {combat.winner === 'player' ? 'Victory!' : 'Defeat!'}
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
    );
  }

  const actions = getAvailableActions(combat.playerCharacter);

  return (
    <Card variant="neutral">
      <h3 className="text-h2 font-cinzel font-bold mb-4">Your Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const isDisabled = !action.available || action.disabled;
          const iconName = actionIcons[action.type as keyof typeof actionIcons] || 'Zap';

          return (
            <button
              key={index}
              onClick={() => !isDisabled && executeTurn(action)}
              disabled={isDisabled}
              className={`w-full min-h-[60px] px-4 py-3 rounded-lg text-left transition-all font-inter flex items-center space-x-3 ${
                isDisabled
                  ? 'bg-surface text-text-muted cursor-not-allowed border border-border-default'
                  : action.type === 'attack'
                  ? 'bg-success hover:bg-success/90 text-white font-semibold shadow-lg active:scale-[0.98]'
                  : action.type === 'cast_spell'
                  ? 'bg-magic hover:bg-magic/90 text-white font-semibold shadow-lg active:scale-[0.98]'
                  : action.type === 'use_ability'
                  ? 'bg-player hover:bg-player/90 text-white font-semibold shadow-lg active:scale-[0.98]'
                  : 'bg-warning hover:bg-warning/90 text-white font-semibold shadow-lg active:scale-[0.98]'
              }`}
            >
              {/* Icon */}
              <div className={`p-2 rounded ${isDisabled ? 'bg-primary' : 'bg-black/20'}`}>
                <Icon name={iconName} size={24} />
              </div>

              {/* Action Details */}
              <div className="flex-1">
                <div className="font-bold text-base">{action.name}</div>
                <div className={`text-sm mt-1 ${isDisabled ? 'opacity-60' : 'opacity-90'}`}>
                  {action.description}
                </div>
                {action.type === 'use_ability' && action.usesRemaining !== undefined && (
                  <div className="text-xs mt-1 opacity-75">
                    Uses: {action.usesRemaining}/{action.maxUses}
                  </div>
                )}
                {isDisabled && action.disabledReason && (
                  <div className="text-xs mt-1 opacity-75">
                    {action.disabledReason}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// Log Tab
interface LogTabProps {
  combat: CombatState;
  logEndRef: React.RefObject<HTMLDivElement | null>;
}

function LogTab({ combat, logEndRef }: LogTabProps) {
  return (
    <Card variant="neutral">
      <h3 className="text-h2 font-cinzel font-bold mb-4">Combat Log</h3>
      <div className="bg-surface p-4 rounded h-96 overflow-y-auto space-y-2">
        {combat.log.length === 0 ? (
          <p className="text-text-muted text-center font-inter">
            Combat has not started yet. Go to Battle tab to begin!
          </p>
        ) : (
          combat.log.map((entry, idx) => (
            <div
              key={idx}
              className={`text-sm p-3 rounded-lg font-inter ${
                entry.actor === 'player'
                  ? 'bg-player/20 border-l-4 border-player'
                  : entry.actor === 'enemy'
                  ? 'bg-enemy/20 border-l-4 border-enemy'
                  : 'bg-warning/20 border-l-4 border-warning'
              }`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-text-muted text-xs min-w-[60px]">[Turn {entry.turn}]</span>
                <div className="flex-1">
                  <span className="font-semibold text-text-accent">
                    {entry.actor === 'player' ? combat.playerCharacter.name :
                     entry.actor === 'enemy' ? combat.enemy.name :
                     'System'}:
                  </span>{' '}
                  <span className="text-text-secondary">{entry.message}</span>
                </div>
              </div>
            </div>
          ))
        )}
        {/* Scroll anchor */}
        <div ref={logEndRef} />
      </div>
    </Card>
  );
}

// Status Tab - Detailed Stats
interface StatusTabProps {
  combat: CombatState;
}

function StatusTab({ combat }: StatusTabProps) {
  return (
    <div className="space-y-6">
      {/* Player Detailed Status */}
      <Card variant="neutral">
        <h3 className="text-h2 font-cinzel font-bold mb-4 flex items-center">
          <Icon name="User" size={24} className="mr-2 text-player" />
          {combat.playerCharacter.name}
        </h3>
        <DetailedStats character={combat.playerCharacter} variant="player" />
      </Card>

      {/* Enemy Detailed Status */}
      <Card variant="neutral">
        <h3 className="text-h2 font-cinzel font-bold mb-4 flex items-center">
          <Icon name="Skull" size={24} className="mr-2 text-enemy" />
          {combat.enemy.name}
        </h3>
        <DetailedStats character={combat.enemy} variant="enemy" />
      </Card>
    </div>
  );
}

// Detailed Stats Component
interface DetailedStatsProps {
  character: CombatState['playerCharacter'] | CombatState['enemy'];
  variant: 'player' | 'enemy';
}

function DetailedStats({ character, variant }: DetailedStatsProps) {
  const accentColor = variant === 'player' ? 'text-player' : 'text-enemy';

  return (
    <div className="space-y-4">
      {/* Core Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="Heart" label="HP" value={`${character.hp}/${character.maxHp}`} accentColor={accentColor} />
        <StatCard icon="Shield" label="AC" value={character.ac} accentColor={accentColor} />
        <StatCard icon="Sword" label="BAB" value={formatModifier(character.bab)} accentColor={accentColor} />
      </div>

      {/* Saving Throws */}
      <div>
        <h4 className="text-sm font-inter font-semibold text-text-muted mb-2">Saving Throws</h4>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon="Heart" label="Fort" value={formatModifier(character.saves.fortitude)} accentColor="text-success" />
          <StatCard icon="Zap" label="Reflex" value={formatModifier(character.saves.reflex)} accentColor="text-warning" />
          <StatCard icon="Brain" label="Will" value={formatModifier(character.saves.will)} accentColor="text-magic" />
        </div>
      </div>

      {/* Resources */}
      {(character.resources.abilities.length > 0 || character.resources.spellSlots) && (
        <div>
          <h4 className="text-sm font-inter font-semibold text-text-muted mb-2">Resources</h4>
          <div className="space-y-2">
            {/* Spell Slots */}
            {character.resources.spellSlots && character.resources.spellSlots.level1 && (
              <div className="bg-surface rounded-lg p-3 flex justify-between items-center border border-border-default">
                <div className="flex items-center space-x-2">
                  <Icon name="Sparkles" size={16} className="text-magic" />
                  <span className="font-inter text-sm">Level 1 Spell Slots</span>
                </div>
                <span className="font-cinzel font-bold text-text-accent">
                  {character.resources.spellSlots.level1.current}/{character.resources.spellSlots.level1.max}
                </span>
              </div>
            )}

            {/* Abilities */}
            {character.resources.abilities
              .filter(ability => ability.type === 'encounter' || ability.type === 'daily')
              .map((ability, idx) => (
                <div key={idx} className="bg-surface rounded-lg p-3 flex justify-between items-center border border-border-default">
                  <div className="flex items-center space-x-2">
                    <Icon name="Zap" size={16} className={accentColor} />
                    <span className="font-inter text-sm">{ability.name}</span>
                  </div>
                  <span className="font-cinzel font-bold text-text-accent">
                    {ability.currentUses}/{ability.maxUses}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Equipment */}
      {character.equipment && (
        <div>
          <h4 className="text-sm font-inter font-semibold text-text-muted mb-2">Equipment</h4>
          <div className="space-y-2">
            <EquipmentRow icon="Sword" label="Weapon" value={character.equipment.weapon.name} />
            <EquipmentRow icon="Shield" label="Armor" value={character.equipment.armor.name} />
            {character.equipment.shield?.equipped && (
              <EquipmentRow icon="ShieldAlert" label="Shield" value={`+${character.equipment.shield.acBonus} AC`} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: keyof typeof import('lucide-react').icons;
  label: string;
  value: string | number;
  accentColor: string;
}

function StatCard({ icon, label, value, accentColor }: StatCardProps) {
  return (
    <div className="bg-surface rounded-lg p-3 text-center border border-border-default">
      <Icon name={icon} size={20} className={`${accentColor} mx-auto mb-1`} />
      <div className="font-inter text-xs text-text-muted mb-1">{label}</div>
      <div className="font-cinzel font-bold text-xl text-text-accent">{value}</div>
    </div>
  );
}

// Equipment Row Component
interface EquipmentRowProps {
  icon: keyof typeof import('lucide-react').icons;
  label: string;
  value: string;
}

function EquipmentRow({ icon, label, value }: EquipmentRowProps) {
  return (
    <div className="bg-surface rounded p-3 flex justify-between items-center border border-border-default font-inter">
      <div className="flex items-center space-x-2">
        <Icon name={icon} size={16} className="text-text-accent" />
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}
