import { Button } from '../Button';
import type { Choice } from '../../types/narrative';

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

  return (
    <Button
      variant={wasSelected ? 'secondary' : 'primary'}
      fullWidth
      onClick={handleClick}
      className={wasSelected ? 'opacity-60' : ''}
    >
      <div className="flex flex-col items-center w-full">
        <span className="text-center">{mainText}</span>
        {requirement && (
          <span className="text-xs mt-1 text-center">{requirement}</span>
        )}
      </div>
    </Button>
  );
}
