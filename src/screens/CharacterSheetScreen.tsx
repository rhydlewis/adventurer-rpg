import { CharacterSheet } from '../components/CharacterSheet';
import { Button } from '../components';
import Icon from '../components/Icon';
import type { Character } from '../types';

interface CharacterSheetScreenProps {
  character: Character;
  onBack: () => void;
}

/**
 * CharacterSheetScreen displays the full character sheet.
 *
 * Features:
 * - Dark themed background matching design system
 * - Back button for navigation
 * - Full character sheet display
 * - Mobile-optimized layout
 */
export function CharacterSheetScreen({ character, onBack }: CharacterSheetScreenProps) {
  return (
    <div className="min-h-screen bg-primary text-text-primary p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <Button
            variant="secondary"
            onClick={onBack}
            icon={<Icon name="ArrowLeft" />}
          >
            Back
          </Button>
        </div>
        <CharacterSheet character={character} />
      </div>
    </div>
  );
}
