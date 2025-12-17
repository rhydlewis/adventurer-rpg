import { Button } from '../Button';
import Icon from '../Icon';
import type { Choice, ChoiceCategory } from '../../types';

interface ChoiceButtonProps {
  /**
   * The choice data to render
   */
  choice: Choice;

  /**
   * Whether this choice was previously selected in this conversation
   */
  wasSelected: boolean;

  /**
   * Callback when choice is selected
   */
  onSelect: (choiceId: string) => void;

  /**
   * Optional display text override (for skill check formatting)
   */
  displayText?: string;
}

/**
 * Parses choice text to extract requirement (e.g., "🎲 Perception DC 12") and main text
 */
function parseChoiceText(text: string): { mainText: string; requirement?: string } {
  // Match format: "🎲 SkillName DC Number Main text"
  const match = text.match(/^🎲\s+(\w+\s+DC\s+\d+)\s+(.+)$/);
  if (match) {
    return {
      requirement: `🎲 ${match[1]}`,
      mainText: match[2],
    };
  }
  return { mainText: text };
}

/**
 * Gets the icon name for a choice category
 */
function getCategoryIcon(category?: ChoiceCategory): keyof typeof import('lucide-react').icons | null {
  if (!category) return null;

  const iconMap: Record<ChoiceCategory, keyof typeof import('lucide-react').icons> = {
    movement: 'MoveRight',
    combat: 'Swords',
    exploration: 'Compass',
    skillCheck: 'Sparkles',
    dialogue: 'MessageCircle',
    merchant: 'ShoppingBag',
    special: 'Star',
  };

  return iconMap[category];
}

/**
 * Gets the CSS class for a choice category
 */
function getCategoryClass(category?: ChoiceCategory): string {
  if (!category) return '';

  return `choice-${category}`;
}

/**
 * Smart choice button that handles:
 * - Skill check requirements displayed below main text
 * - Previously selected choices (grayed but still clickable for loops)
 * - Click handling
 *
 * @example
 * <ChoiceButton
 *   choice={choice}
 *   wasSelected={false}
 *   onSelect={handleChoice}
 *   displayText="[Intimidate DC 10] Lie to the guard"
 * />
 */
export function ChoiceButton({
  choice,
  wasSelected,
  onSelect,
  displayText,
}: ChoiceButtonProps) {
  const handleClick = () => {
    onSelect(choice.id);
  };

  const { mainText, requirement } = parseChoiceText(displayText || choice.text);
  const categoryIcon = getCategoryIcon(choice.category);
  const categoryClass = getCategoryClass(choice.category);

  return (
    <Button
      variant={wasSelected ? 'secondary' : 'primary'}
      fullWidth
      onClick={handleClick}
      className={`${wasSelected ? 'opacity-60' : ''} ${categoryClass} transition-all`}
    >
      <div className="flex items-center gap-3 w-full">
        {categoryIcon && (
          <Icon name={categoryIcon} size={20} className="flex-shrink-0" />
        )}
        <div className="flex flex-col items-start flex-1">
          <span className={categoryIcon ? 'text-left' : 'text-center w-full'}>{mainText}</span>
          {requirement && (
            <span className="text-xs mt-1 text-left">{requirement}</span>
          )}
        </div>
      </div>
    </Button>
  );
}
