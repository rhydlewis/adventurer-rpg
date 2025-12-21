import { useState } from 'react';
import { icons } from 'lucide-react';
import type { Action } from '../../types/action';
import Icon from '../Icon';

interface ActionPopupButtonProps {
  label: string;
  icon: keyof typeof icons;
  actions: Action[];
  colorScheme: 'violet' | 'amber' | 'blue';
  onSelectAction: (action: Action) => void;
}

const colorClasses = {
  violet: {
    active: 'bg-gradient-to-br from-violet-700 to-violet-800 hover:from-violet-600 hover:to-violet-700 border-violet-600/50 shadow-violet-900/30',
    hover: 'hover:border-violet-500',
    count: 'text-violet-400',
  },
  amber: {
    active: 'bg-gradient-to-br from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 border-amber-600/50 shadow-amber-900/30',
    hover: 'hover:border-amber-500',
    count: 'text-amber-400',
  },
  blue: {
    active: 'bg-gradient-to-br from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 border-blue-600/50 shadow-blue-900/30',
    hover: 'hover:border-blue-500',
    count: 'text-blue-400',
  },
};

export function ActionPopupButton({
  label,
  icon,
  actions,
  colorScheme,
  onSelectAction,
}: ActionPopupButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = colorClasses[colorScheme];
  const isDisabled = actions.length === 0;

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`min-h-[48px] w-full p-2 rounded-lg transition-all button-text flex items-center space-x-2 ${
          isDisabled
            ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed border border-slate-800'
            : `${colors.active} text-white border shadow-lg active:scale-95`
        }`}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 p-1.5 rounded ${isDisabled ? 'bg-slate-800' : 'bg-black/20'}`}>
          <Icon name={icon} size={16} />
        </div>

        {/* Button Details */}
        <div className="flex-1 text-left min-w-0">
          <div className={`text-xs font-bold leading-tight truncate ${isDisabled ? 'opacity-60' : ''}`}>
            {label}
          </div>
          <div className="text-[9px] opacity-75 mt-0.5">
            {actions.length} available
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
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {actions.map((action, index) => {
                const actionDisabled = !action.available || action.disabled;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (!actionDisabled) {
                        onSelectAction(action);
                        setIsOpen(false);
                      }
                    }}
                    disabled={actionDisabled}
                    className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                      actionDisabled
                        ? 'bg-slate-900/30 border-slate-700 cursor-not-allowed opacity-60'
                        : `bg-slate-900/50 hover:bg-slate-700 border-slate-600 ${colors.hover}`
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`body-primary ${actionDisabled ? 'text-slate-500' : 'text-slate-200'}`}>
                        {action.name}
                      </span>
                      {action.type === 'use_ability' && action.usesRemaining !== undefined && (
                        <span className={`text-sm ${actionDisabled ? 'text-slate-600' : colors.count}`}>
                          {action.usesRemaining}/{action.maxUses}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${actionDisabled ? 'text-slate-600' : 'text-slate-400'}`}>
                      {action.description}
                    </p>
                    {actionDisabled && action.disabledReason && (
                      <p className="text-xs text-slate-500 italic mt-1">
                        {action.disabledReason}
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
