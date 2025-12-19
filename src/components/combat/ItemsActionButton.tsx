import { useState } from 'react';
import type { Item } from '../../types';
import Icon from '../Icon';

interface ItemsActionButtonProps {
  items: Item[];
  onUseItem: (itemId: string) => void;
}

export function ItemsActionButton({ items, onUseItem }: ItemsActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[56px] p-2 rounded-lg transition-all button-text flex items-center space-x-2
                   bg-gradient-to-br from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700
                   text-white border border-amber-600/50 shadow-lg shadow-amber-900/30 active:scale-95"
      >
        {/* Icon */}
        <div className="flex-shrink-0 p-1.5 rounded bg-black/20">
          <Icon name="Backpack" size={18} />
        </div>

        {/* Button Details */}
        <div className="flex-1 text-left min-w-0">
          <div className="text-xs font-bold leading-tight truncate">
            Items
          </div>
          <div className="text-[9px] opacity-75 mt-0.5">
            {items.length} available
          </div>
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop to close popover */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover content */}
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onUseItem(item.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded
                             bg-slate-900/50 hover:bg-slate-700
                             border border-slate-600 hover:border-amber-500
                             transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="body-primary text-slate-200">{item.name}</span>
                    <span className="text-amber-400 text-sm">×{item.quantity}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
