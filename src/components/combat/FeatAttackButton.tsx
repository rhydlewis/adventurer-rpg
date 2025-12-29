import { useState } from 'react';
import type { Action, AttackAction } from '../../types/action';
import Icon from '../Icon';

interface FeatAttackButtonProps {
  attacks: AttackAction[];
  onExecute: (action: Action) => void;
}

/**
 * Combat button that displays attack variant feats in a popup selector
 * Replaces the old SecondaryAttackButton with dynamic feat support
 */
export function FeatAttackButton({ attacks, onExecute }: FeatAttackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isDisabled = attacks.length === 0;

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`min-h-[56px] w-full p-2 rounded-lg transition-all button-text flex items-center space-x-2 ${
          isDisabled
            ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800'
            : 'bg-gradient-to-br from-orange-700 to-orange-800 hover:from-orange-600 hover:to-orange-700 text-white border border-orange-600/50 shadow-lg shadow-orange-900/30 active:scale-95'
        }`}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 p-1.5 rounded ${isDisabled ? 'bg-slate-800' : 'bg-black/20'}`}>
          <Icon name="Zap" size={20} />
        </div>

        {/* Button Details */}
        <div className="flex-1 text-left min-w-0">
          <div className={`text-sm font-bold leading-tight truncate ${isDisabled ? 'opacity-60' : ''}`}>
            {isDisabled ? 'No feat attacks' : 'Feat Attacks'}
          </div>
          <div className="text-[10px] opacity-75 mt-0.5">
            {isDisabled ? 'Not available' : `${attacks.length} available`}
          </div>
        </div>
      </button>

      {/* Popover */}
      {isOpen && !isDisabled && (
        <>
          {/* Backdrop to close popover */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover content */}
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
                Select Attack Feat
              </div>
              {attacks.map((attack, index) => {
                const actionDisabled = !attack.available || attack.disabled;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!actionDisabled) {
                        onExecute(attack);
                        setIsOpen(false);
                      }
                    }}
                    disabled={actionDisabled}
                    className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                      actionDisabled
                        ? 'bg-slate-900/30 border-slate-700 cursor-not-allowed opacity-60'
                        : 'bg-slate-900/50 hover:bg-slate-700 border-slate-600 hover:border-orange-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`body-primary font-semibold ${actionDisabled ? 'text-slate-500' : 'text-slate-200'}`}>
                        {attack.name}
                      </span>
                      {(attack.attackModifier !== undefined || attack.damageModifier !== undefined) && (
                        <div className="flex gap-1 ml-2">
                          {attack.attackModifier !== undefined && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              attack.attackModifier >= 0
                                ? 'bg-emerald-900/50 text-emerald-400'
                                : 'bg-red-900/50 text-red-400'
                            }`}>
                              {attack.attackModifier >= 0 ? '+' : ''}{attack.attackModifier} ATK
                            </span>
                          )}
                          {attack.damageModifier !== undefined && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              attack.damageModifier >= 0
                                ? 'bg-orange-900/50 text-orange-400'
                                : 'bg-blue-900/50 text-blue-400'
                            }`}>
                              {attack.damageModifier >= 0 ? '+' : ''}{attack.damageModifier} DMG
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${actionDisabled ? 'text-slate-600' : 'text-slate-400'}`}>
                      {attack.description}
                    </p>
                    {actionDisabled && attack.disabledReason && (
                      <p className="text-xs text-slate-500 italic mt-1">
                        {attack.disabledReason}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
