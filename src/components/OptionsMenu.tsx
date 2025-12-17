import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface OptionsMenuProps {
  /**
   * Callback when "View Character Sheet" is clicked
   */
  onViewCharacterSheet?: () => void;

  /**
   * Callback when "Save Game" is clicked
   */
  onSaveGame?: () => void;

  /**
   * Callback when "Exit to Main Menu" is clicked
   */
  onExit: () => void;

  /**
   * Whether to show the "View Character Sheet" option
   * @default true
   */
  showCharacterSheet?: boolean;

  /**
   * Whether to show the "Save Game" option
   * @default true
   */
  showSaveGame?: boolean;
}

/**
 * Options menu component for in-game navigation.
 *
 * Features:
 * - Dropdown menu with character sheet, save, and exit options
 * - Click outside to close
 * - Accessible keyboard navigation
 * - Mobile-optimized touch targets (44x44px minimum)
 *
 * @example
 * <OptionsMenu
 *   onViewCharacterSheet={() => navigate('characterSheet')}
 *   onSaveGame={() => saveGameState()}
 *   onExit={() => navigate('mainMenu')}
 * />
 */
export function OptionsMenu({
  onViewCharacterSheet,
  onSaveGame,
  onExit,
  showCharacterSheet = true,
  showSaveGame = true,
}: OptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleMenuItemClick = (callback: (() => void) | undefined) => {
    if (callback) {
      callback();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-surface hover:bg-surface/80 transition-colors border border-border-default focus:outline-none focus:ring-2 focus:ring-player focus:ring-offset-2 focus:ring-offset-primary"
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Icon name={isOpen ? 'X' : 'Menu'} size={24} className="text-fg-primary" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-secondary rounded-lg shadow-lg border border-border-default overflow-hidden z-50">
          {/* Character Sheet Option */}
          {showCharacterSheet && onViewCharacterSheet && (
            <button
              onClick={() => handleMenuItemClick(onViewCharacterSheet)}
              className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left body-primary text-fg-primary bg-secondary hover:bg-slate-700 transition-colors border-b border-border-default"
            >
              <Icon name="User" size={20} className="text-player" />
              <span>View Character Sheet</span>
            </button>
          )}

          {/* Save Game Option */}
          {showSaveGame && onSaveGame && (
            <button
              onClick={() => handleMenuItemClick(onSaveGame)}
              className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left body-primary text-fg-primary bg-secondary hover:bg-slate-700 transition-colors border-b border-border-default"
            >
              <Icon name="Save" size={20} className="text-success" />
              <span>Save Game</span>
            </button>
          )}

          {/* Exit Option */}
          <button
            onClick={() => handleMenuItemClick(onExit)}
            className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-left body-primary text-fg-primary bg-secondary hover:bg-slate-700 transition-colors"
          >
            <Icon name="LogOut" size={20} className="text-enemy" />
            <span>Exit to Main Menu</span>
          </button>
        </div>
      )}
    </div>
  );
}
