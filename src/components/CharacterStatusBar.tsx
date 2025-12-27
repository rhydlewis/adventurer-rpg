import { Coins } from 'lucide-react';
import type { Character } from '../types';

interface CharacterStatusBarProps {
  character: Character;
}

/**
 * Displays character HP (with visual bar) and gold in a compact horizontal layout.
 * Used in StoryScreen header to show vital stats during gameplay.
 */
export function CharacterStatusBar({ character }: CharacterStatusBarProps) {
  const hpPercentage = (character.hp / character.maxHp) * 100;

  // Determine HP bar color based on percentage
  const hpBarColor =
    hpPercentage > 50 ? 'bg-green-500' :
    hpPercentage > 25 ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <div className="flex items-center gap-4">
      {/* HP Bar */}
      <div className="flex-1 flex items-center gap-3">
        <span className="text-sm font-semibold text-blue-400">HP</span>
        <div className="flex-1 h-4 bg-surface-tertiary rounded-full overflow-hidden border border-border-primary">
          <div
            className={`h-full transition-all duration-300 ${hpBarColor}`}
            style={{ width: `${Math.max(0, hpPercentage)}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-blue-400 min-w-[4rem] text-right">
          {character.hp}/{character.maxHp}
        </span>
      </div>

      {/* Gold Indicator */}
      <div className="flex items-center gap-2 pl-4 border-l border-border-primary">
        <div className="w-6 h-6 rounded-full bg-yellow-600 border-2 border-yellow-400 flex items-center justify-center">
          <Coins className="w-4 h-4 text-yellow-900" />
        </div>
        <span className="text-sm font-semibold text-yellow-400 min-w-[3rem]">
          {character.gold || 0}
        </span>
      </div>
    </div>
  );
}
