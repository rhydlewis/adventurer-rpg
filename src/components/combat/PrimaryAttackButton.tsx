import type { Action } from '../../types/action';
import Icon from '../Icon';

interface PrimaryAttackButtonProps {
  attack: Action | null;
  weaponName?: string;
  onExecute: (action: Action) => void;
}

export function PrimaryAttackButton({ attack, weaponName, onExecute }: PrimaryAttackButtonProps) {
  // Always show button, fallback to unarmed strike if no attack
  const displayName = weaponName || attack?.name || 'Unarmed Strike';
  const isAvailable = !!attack;

  return (
    <button
      onClick={() => attack && onExecute(attack)}
      disabled={!isAvailable}
      className={`min-h-[56px] w-full p-2 rounded-lg transition-all button-text flex items-center space-x-2 ${
        isAvailable
          ? 'bg-gradient-to-br from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-white border border-emerald-600/50 shadow-lg shadow-emerald-900/30 active:scale-95'
          : 'bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800'
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-1.5 rounded ${isAvailable ? 'bg-black/20' : 'bg-slate-800'}`}>
        <Icon name="Sword" size={20} />
      </div>

      {/* Attack Details */}
      <div className="flex-1 text-left min-w-0">
        <div className={`text-sm font-bold leading-tight truncate ${!isAvailable ? 'opacity-60' : ''}`}>
          {displayName}
        </div>
        <div className="text-[10px] opacity-75 mt-0.5">
          Primary Attack
        </div>
      </div>
    </button>
  );
}
