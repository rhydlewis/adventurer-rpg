import type { Character } from './character';
import type { CombatState } from './combat';

export interface DefiningTrait {
  id: string;
  name: string;
  description: string;

  upside: {
    description: string; // "+2 initiative"
    apply: (character: Character) => Character;
  };

  downside: {
    description: string; // "-2 AC if acting last"
    apply: (character: Character, context?: CombatState) => Character;
  };
}
