import { CharacterSheet } from '../components/CharacterSheet';
import type { Character } from '../types';

interface CharacterSheetScreenProps {
  character: Character;
  onBack: () => void;
}

export function CharacterSheetScreen({ character, onBack }: CharacterSheetScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Back
        </button>
        <CharacterSheet character={character} />
      </div>
    </div>
  );
}
