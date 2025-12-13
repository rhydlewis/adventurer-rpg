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
 * Smart choice button that handles:
 * - Skill check prefixes ([Skill DC X])
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

  return (
    <Button
      variant={wasSelected ? 'secondary' : 'primary'}
      fullWidth
      onClick={handleClick}
      className={wasSelected ? 'opacity-60' : ''}
    >
      {displayText || choice.text}
    </Button>
  );
}
