# Enhanced Encounter System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add discovery exploration outcomes and multi-step puzzle screen system to enable rich encounter variety.

**Architecture:** Extends existing narrative engine with new outcome types. Phase 1 adds `discovery` to ExplorationOutcome (skill check within exploration). Phase 2 adds dedicated puzzle screen with state management (similar to combat/merchant screens).

**Tech Stack:** React, TypeScript, Zustand, Vitest, Tailwind CSS

---

## Phase 1: Enhanced Exploration Outcomes (Discovery Type)

**Estimated Time:** 1-2 hours
**Files Changed:** 4 files (types, screen, tests)

### Task 1: Add Discovery Outcome Type

**Files:**
- Modify: `src/types/narrative.ts:21-26`
- Test: `src/__tests__/types/narrative.test.ts`

**Step 1: Write the failing test**

Create test file if it doesn't exist, or add to existing tests:

```typescript
// src/__tests__/types/narrative.test.ts
import { describe, it, expect } from 'vitest';
import type { ExplorationOutcome } from '../types/narrative';

describe('ExplorationOutcome - Discovery Type', () => {
  it('should accept discovery outcome with skill check and rewards', () => {
    const discovery: ExplorationOutcome = {
      type: 'discovery',
      description: 'A sword is wedged behind the waterfall!',
      skillCheck: { skill: 'Athletics', dc: 15 },
      successReward: { items: ['legendary_sword'] },
      failureMessage: 'The current is too strong.',
      flag: 'waterfall_sword_attempted'
    };

    expect(discovery.type).toBe('discovery');
    expect(discovery.skillCheck.skill).toBe('Athletics');
    expect(discovery.skillCheck.dc).toBe(15);
  });

  it('should accept discovery outcome without optional fields', () => {
    const discovery: ExplorationOutcome = {
      type: 'discovery',
      description: 'You found treasure!',
      skillCheck: { skill: 'Perception', dc: 10 },
      successReward: { gold: 50 }
    };

    expect(discovery.type).toBe('discovery');
    expect(discovery.failureMessage).toBeUndefined();
    expect(discovery.flag).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- narrative.test`
Expected: FAIL with type error "Type 'discovery' is not assignable to type ExplorationOutcome"

**Step 3: Add discovery type to ExplorationOutcome**

```typescript
// src/types/narrative.ts (around line 21-26)
export type ExplorationOutcome =
  | { type: 'combat'; enemyId: string; goldReward: number; itemReward?: string }
  | { type: 'treasure'; gold: number; items: string[] }
  | { type: 'vignette'; description: string; flavorOnly: true }
  | { type: 'nothing'; message: string }
  | {
      type: 'discovery';
      description: string;
      skillCheck: { skill: SkillName; dc: number };
      successReward: { gold?: number; items?: string[] };
      failureMessage?: string;
      flag?: string;
    };
```

**Step 4: Run test to verify it passes**

Run: `npm test -- narrative.test`
Expected: PASS

**Step 5: Run build to verify no type errors**

Run: `npm run build`
Expected: Build succeeds with no type errors

**Step 6: Commit**

```bash
git add src/types/narrative.ts src/__tests__/types/narrative.test.ts
git commit -m "feat: add discovery outcome type to ExplorationOutcome

- Supports skill checks within exploration
- Includes success/failure rewards
- Optional flag to prevent re-discovery"
```

---

### Task 2: Handle Discovery in Exploration Screen

**Files:**
- Modify: `src/screens/ExplorationScreen.tsx`
- Read: `src/utils/narrativeLogic.ts` (for skill check resolution)
- Read: `src/stores/characterStore.ts` (for adding rewards)

**Step 1: Identify current exploration screen structure**

Read the exploration screen to understand current outcome handling:

Run: `cat src/screens/ExplorationScreen.tsx | grep -A 10 "outcome.type"`

**Step 2: Write test for discovery outcome handling**

```typescript
// src/__tests__/screens/ExplorationScreen.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExplorationScreen } from '../screens/ExplorationScreen';
import type { ExplorationOutcome } from '../types/narrative';

describe('ExplorationScreen - Discovery Outcomes', () => {
  it('should render discovery description and skill check button', () => {
    const discovery: ExplorationOutcome = {
      type: 'discovery',
      description: 'A sword wedged behind the waterfall!',
      skillCheck: { skill: 'Athletics', dc: 15 },
      successReward: { items: ['legendary_sword'] }
    };

    // Mock the exploration context/props
    const mockOnComplete = vi.fn();

    render(<ExplorationScreen outcome={discovery} onComplete={mockOnComplete} />);

    expect(screen.getByText(/sword wedged behind the waterfall/i)).toBeInTheDocument();
    expect(screen.getByText(/Athletics DC 15/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /attempt/i })).toBeInTheDocument();
  });

  it('should show success reward when skill check passes', () => {
    const discovery: ExplorationOutcome = {
      type: 'discovery',
      description: 'A sword is here!',
      skillCheck: { skill: 'Athletics', dc: 15 },
      successReward: { items: ['legendary_sword'], gold: 100 }
    };

    const mockOnComplete = vi.fn();

    // Mock dice roll to succeed
    vi.mock('../utils/narrativeLogic', () => ({
      resolveSkillCheck: vi.fn(() => ({
        skill: 'Athletics',
        roll: 18,
        modifier: 2,
        total: 20,
        dc: 15,
        success: true
      }))
    }));

    render(<ExplorationScreen outcome={discovery} onComplete={mockOnComplete} />);

    const attemptButton = screen.getByRole('button', { name: /attempt/i });
    fireEvent.click(attemptButton);

    expect(screen.getByText(/legendary_sword/i)).toBeInTheDocument();
    expect(screen.getByText(/100 gold/i)).toBeInTheDocument();
  });
});
```

**Step 3: Run test to verify it fails**

Run: `npm test -- ExplorationScreen.test`
Expected: FAIL - ExplorationScreen doesn't handle discovery outcome yet

**Step 4: Add discovery handling to ExplorationScreen**

**Note:** The exact implementation depends on your current ExplorationScreen structure. Here's a general pattern:

```typescript
// src/screens/ExplorationScreen.tsx
import { resolveSkillCheck, createSkillCheckLogEntry } from '../utils/narrativeLogic';
import { useCharacterStore } from '../stores/characterStore';
import { useNarrativeStore } from '../stores/narrativeStore';

// Inside the component, add state for discovery resolution
const [discoveryResult, setDiscoveryResult] = React.useState<{
  success: boolean;
  reward?: { gold?: number; items?: string[] };
} | null>(null);

const character = useCharacterStore((state) => state.character);
const world = useNarrativeStore((state) => state.world);

// Add handler for discovery attempts
const handleDiscoveryAttempt = () => {
  if (outcome.type !== 'discovery' || !character) return;

  const result = resolveSkillCheck(character, outcome.skillCheck.skill, outcome.skillCheck.dc);

  if (result.success) {
    // Add rewards to character
    if (outcome.successReward.gold) {
      useCharacterStore.getState().addGold(outcome.successReward.gold);
    }
    if (outcome.successReward.items) {
      outcome.successReward.items.forEach(item => {
        // Add to inventory via world state
        useNarrativeStore.getState().addInventoryItem(item);
      });
    }

    // Set flag if specified
    if (outcome.flag && world) {
      useNarrativeStore.getState().setFlag(outcome.flag, true);
    }

    setDiscoveryResult({ success: true, reward: outcome.successReward });
  } else {
    setDiscoveryResult({ success: false });
  }
};

// Add rendering for discovery outcome
if (outcome.type === 'discovery') {
  if (!discoveryResult) {
    // Show discovery description and attempt button
    return (
      <div className="p-4">
        <p className="body-primary mb-4">{outcome.description}</p>
        <button
          onClick={handleDiscoveryAttempt}
          className="px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/80"
        >
          Attempt {outcome.skillCheck.skill} DC {outcome.skillCheck.dc}
        </button>
      </div>
    );
  } else if (discoveryResult.success) {
    // Show success and rewards
    return (
      <div className="p-4">
        <p className="body-primary text-accent-green mb-4">Success!</p>
        {discoveryResult.reward?.items && (
          <p className="body-secondary">Received: {discoveryResult.reward.items.join(', ')}</p>
        )}
        {discoveryResult.reward?.gold && (
          <p className="body-secondary">Received: {discoveryResult.reward.gold} gold</p>
        )}
        <button onClick={onComplete} className="mt-4 px-4 py-2 bg-surface-tertiary rounded">
          Continue
        </button>
      </div>
    );
  } else {
    // Show failure
    return (
      <div className="p-4">
        <p className="body-primary text-accent-red mb-4">Failed!</p>
        {outcome.failureMessage && (
          <p className="body-secondary mb-4">{outcome.failureMessage}</p>
        )}
        <button onClick={onComplete} className="px-4 py-2 bg-surface-tertiary rounded">
          Continue
        </button>
      </div>
    );
  }
}
```

**Step 5: Add helper methods to stores if needed**

If `addInventoryItem` or `setFlag` don't exist in narrativeStore:

```typescript
// src/stores/narrativeStore.ts
// Add these actions to the store interface and implementation

addInventoryItem: (itemId: string) => {
  set((state) => {
    if (!state.world) return state;
    return {
      world: {
        ...state.world,
        inventory: [...state.world.inventory, itemId]
      }
    };
  });
},

setFlag: (flag: string, value: boolean) => {
  set((state) => {
    if (!state.world) return state;
    return {
      world: {
        ...state.world,
        flags: {
          ...state.world.flags,
          [flag]: value
        }
      }
    };
  });
}
```

**Step 6: Run tests to verify they pass**

Run: `npm test -- ExplorationScreen.test`
Expected: PASS

**Step 7: Run build and lint**

Run: `npm run build && npm run lint`
Expected: No errors

**Step 8: Manual test in browser**

1. Start dev server: `npm run dev`
2. Create a test exploration table with discovery outcome
3. Navigate to exploration, trigger discovery
4. Verify skill check appears, click attempt
5. Verify rewards are added on success

**Step 9: Commit**

```bash
git add src/screens/ExplorationScreen.tsx src/stores/narrativeStore.ts src/__tests__/screens/ExplorationScreen.test.tsx
git commit -m "feat: handle discovery outcomes in exploration screen

- Render skill check button for discovery outcomes
- Resolve skill check and add rewards on success
- Show failure message on failure
- Set flag to prevent re-discovery if specified"
```

---

### Task 3: Create Example Exploration Table with Discovery

**Files:**
- Read: `src/data/` (to find exploration tables location)
- Modify: Campaign data or create example exploration table

**Step 1: Find exploration table data location**

Run: `find src/data -name "*exploration*" -o -name "*table*"`

**Step 2: Create example discovery in exploration table**

Add to appropriate exploration table file:

```typescript
// src/data/explorationTables.ts (or wherever tables live)
{
  id: 'waterfall_area_exploration',
  locationId: 'mountain_waterfall',
  encounters: [
    {
      weight: 60,
      outcome: { type: 'nothing', message: 'The area is quiet except for the roar of water.' }
    },
    {
      weight: 25,
      outcome: {
        type: 'discovery',
        description: 'Behind the cascading water, you spot a legendary sword wedged between rocks!',
        skillCheck: { skill: 'Athletics', dc: 15 },
        successReward: { items: ['legendary_sword'] },
        failureMessage: 'The current is too strong. You barely make it back to shore.',
        flag: 'waterfall_sword_attempted'
      }
    },
    {
      weight: 15,
      outcome: { type: 'combat', enemyId: 'river_serpent', goldReward: 30 }
    }
  ]
}
```

**Step 3: Test in browser**

1. Navigate to location with this exploration table
2. Trigger exploration multiple times
3. Verify discovery appears with ~25% probability
4. Attempt skill check, verify success/failure
5. Verify flag prevents re-discovery

**Step 4: Commit**

```bash
git add src/data/explorationTables.ts
git commit -m "feat: add example discovery outcome to waterfall exploration

- 25% chance to discover legendary sword
- Requires Athletics DC 15 to retrieve
- Flag prevents re-attempts"
```

---

## Phase 1 Complete - Verification Checkpoint

**Run full test suite:**
```bash
npm test
```
Expected: All tests pass

**Run build:**
```bash
npm run build
```
Expected: Build succeeds

**Run lint:**
```bash
npm run lint
```
Expected: No errors

**Manual verification:**
1. Discovery outcomes render correctly
2. Skill checks resolve properly
3. Rewards added to character
4. Flags prevent re-discovery

**If all checks pass, Phase 1 is complete!**

---

## Phase 2: Puzzle Screen System

**Estimated Time:** 4-6 hours
**Files Changed:** 11 files (types, data, store, screen, tests, integration)

### Task 4: Add Puzzle Type Definitions

**Files:**
- Create: `src/types/puzzle.ts`
- Test: `src/__tests__/types/puzzle.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/types/puzzle.test.ts
import { describe, it, expect } from 'vitest';
import type { Puzzle, PuzzleStep } from '../types/puzzle';

describe('Puzzle Types', () => {
  it('should accept valid puzzle with multiple steps', () => {
    const puzzle: Puzzle = {
      id: 'test_puzzle',
      title: 'Test Puzzle',
      description: 'A test puzzle',
      steps: [
        {
          id: 'step1',
          description: 'First step',
          choices: [
            { id: 'a', text: 'Choice A', correct: true },
            { id: 'b', text: 'Choice B', correct: false }
          ]
        }
      ]
    };

    expect(puzzle.id).toBe('test_puzzle');
    expect(puzzle.steps).toHaveLength(1);
    expect(puzzle.steps[0].choices).toHaveLength(2);
  });

  it('should accept puzzle step with hint', () => {
    const step: PuzzleStep = {
      id: 'step1',
      description: 'A tricky step',
      choices: [
        { id: 'correct', text: 'Right answer', correct: true },
        { id: 'wrong', text: 'Wrong answer', correct: false }
      ],
      hint: 'Think carefully!'
    };

    expect(step.hint).toBe('Think carefully!');
  });

  it('should accept puzzle with optional fields', () => {
    const puzzle: Puzzle = {
      id: 'timed_puzzle',
      title: 'Timed Puzzle',
      description: 'Solve quickly!',
      steps: [],
      timeLimit: 60,
      allowBacktrack: false
    };

    expect(puzzle.timeLimit).toBe(60);
    expect(puzzle.allowBacktrack).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- puzzle.test`
Expected: FAIL with "Cannot find module '../types/puzzle'"

**Step 3: Create puzzle type definitions**

```typescript
// src/types/puzzle.ts
export interface PuzzleStep {
  id: string;
  description: string;
  choices: {
    id: string;
    text: string;
    correct: boolean;
  }[];
  hint?: string;
}

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  steps: PuzzleStep[];
  timeLimit?: number;
  allowBacktrack?: boolean;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- puzzle.test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/puzzle.ts src/__tests__/types/puzzle.test.ts
git commit -m "feat: add puzzle type definitions

- PuzzleStep with choices and optional hint
- Puzzle with ordered steps
- Optional timeLimit and allowBacktrack for future features"
```

---

### Task 5: Add Puzzle Outcome Type to Narrative

**Files:**
- Modify: `src/types/narrative.ts:40-54`
- Test: `src/__tests__/types/narrative.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/types/narrative.test.ts
import type { ChoiceOutcome } from '../types/narrative';

describe('ChoiceOutcome - Puzzle Type', () => {
  it('should accept puzzle outcome with recursive success/failure', () => {
    const outcome: ChoiceOutcome = {
      type: 'puzzle',
      puzzleId: 'temple_door_symbols',
      onSuccess: { type: 'goto', nodeId: 'door_opens' },
      onFailure: { type: 'goto', nodeId: 'door_sealed' }
    };

    expect(outcome.type).toBe('puzzle');
    expect(outcome.puzzleId).toBe('temple_door_symbols');
    expect(outcome.onSuccess.type).toBe('goto');
    expect(outcome.onFailure.type).toBe('goto');
  });

  it('should accept nested outcomes in puzzle success/failure', () => {
    const outcome: ChoiceOutcome = {
      type: 'puzzle',
      puzzleId: 'test',
      onSuccess: {
        type: 'check',
        skill: 'Perception',
        dc: 10,
        success: { type: 'goto', nodeId: 'found_secret' },
        failure: { type: 'goto', nodeId: 'missed_secret' }
      },
      onFailure: { type: 'exit' }
    };

    expect(outcome.onSuccess.type).toBe('check');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- narrative.test`
Expected: FAIL with type error

**Step 3: Add puzzle outcome type**

```typescript
// src/types/narrative.ts (around line 40-54)
export type ChoiceOutcome =
  | { type: 'goto'; nodeId: string }
  | { type: 'loop' }
  | { type: 'exit' }
  | {
      type: 'check';
      skill: SkillName;
      dc: number;
      success: ChoiceOutcome;
      failure: ChoiceOutcome;
    }
  | { type: 'explore'; tableId: string; onceOnly: boolean }
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number> }
  | { type: 'characterCreation'; phase: 1 | 2; nextNodeId: string }
  | {
      type: 'puzzle';
      puzzleId: string;
      onSuccess: ChoiceOutcome;
      onFailure: ChoiceOutcome;
    };
```

**Step 4: Run test to verify it passes**

Run: `npm test -- narrative.test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/narrative.ts src/__tests__/types/narrative.test.ts
git commit -m "feat: add puzzle outcome type to ChoiceOutcome

- Supports puzzleId reference
- Recursive onSuccess/onFailure outcomes
- Enables puzzle triggers from narrative choices"
```

---

### Task 6: Create Puzzle Data Structure

**Files:**
- Create: `src/data/puzzles.ts`
- Test: `src/__tests__/data/puzzles.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/data/puzzles.test.ts
import { describe, it, expect } from 'vitest';
import { PUZZLES, getPuzzleById } from '../data/puzzles';

describe('Puzzle Data', () => {
  it('should export PUZZLES object', () => {
    expect(PUZZLES).toBeDefined();
    expect(typeof PUZZLES).toBe('object');
  });

  it('should have temple_door_symbols puzzle', () => {
    const puzzle = PUZZLES.temple_door_symbols;
    expect(puzzle).toBeDefined();
    expect(puzzle.id).toBe('temple_door_symbols');
    expect(puzzle.steps.length).toBeGreaterThan(0);
  });

  it('should retrieve puzzle by ID', () => {
    const puzzle = getPuzzleById('temple_door_symbols');
    expect(puzzle).not.toBeNull();
    expect(puzzle?.title).toBe('Ancient Symbol Lock');
  });

  it('should return null for non-existent puzzle', () => {
    const puzzle = getPuzzleById('nonexistent');
    expect(puzzle).toBeNull();
  });

  it('should have valid step structure', () => {
    const puzzle = PUZZLES.temple_door_symbols;
    const step = puzzle.steps[0];

    expect(step.id).toBeDefined();
    expect(step.description).toBeDefined();
    expect(step.choices.length).toBeGreaterThan(0);
    expect(step.choices.some(c => c.correct)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- puzzles.test`
Expected: FAIL with "Cannot find module '../data/puzzles'"

**Step 3: Create puzzle data file**

```typescript
// src/data/puzzles.ts
import type { Puzzle } from '../types/puzzle';

export const PUZZLES: Record<string, Puzzle> = {
  temple_door_symbols: {
    id: 'temple_door_symbols',
    title: 'Ancient Symbol Lock',
    description: 'Three symbols must be aligned in the correct sequence to unlock the door. Choose carefully - one mistake could seal the door forever.',
    steps: [
      {
        id: 'step1_sun',
        description: 'The sun symbol glows faintly. Which direction should it face?',
        choices: [
          { id: 'east', text: 'Align with eastern marker', correct: true },
          { id: 'west', text: 'Align with western marker', correct: false },
          { id: 'north', text: 'Align with northern marker', correct: false }
        ],
        hint: 'The sun rises in the east.'
      },
      {
        id: 'step2_moon',
        description: 'The moon symbol begins to glow. Where does the moon belong?',
        choices: [
          { id: 'west', text: 'Align with western marker', correct: true },
          { id: 'east', text: 'Align with eastern marker', correct: false },
          { id: 'south', text: 'Align with southern marker', correct: false }
        ],
        hint: 'The moon sets in the west.'
      },
      {
        id: 'step3_star',
        description: 'The final star symbol pulses with light. Which direction completes the pattern?',
        choices: [
          { id: 'north', text: 'Align with northern marker', correct: true },
          { id: 'south', text: 'Align with southern marker', correct: false },
          { id: 'center', text: 'Place in the center', correct: false }
        ],
        hint: 'The north star guides travelers home.'
      }
    ]
  },

  vault_combination: {
    id: 'vault_combination',
    title: 'Vault Lock Mechanism',
    description: 'A series of rotating dials must be set to the correct positions. Each dial has ancient runes etched into it.',
    steps: [
      {
        id: 'dial1',
        description: 'The first dial shows three runes: Fire, Water, and Earth.',
        choices: [
          { id: 'fire', text: 'Set to Fire rune', correct: false },
          { id: 'water', text: 'Set to Water rune', correct: true },
          { id: 'earth', text: 'Set to Earth rune', correct: false }
        ]
      },
      {
        id: 'dial2',
        description: 'The second dial shows: Sun, Moon, and Stars.',
        choices: [
          { id: 'sun', text: 'Set to Sun rune', correct: false },
          { id: 'moon', text: 'Set to Moon rune', correct: false },
          { id: 'stars', text: 'Set to Stars rune', correct: true }
        ]
      }
    ]
  }
};

export function getPuzzleById(id: string): Puzzle | null {
  return PUZZLES[id] || null;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- puzzles.test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/data/puzzles.ts src/__tests__/data/puzzles.test.ts
git commit -m "feat: add puzzle data with example puzzles

- temple_door_symbols: 3-step symbol alignment puzzle
- vault_combination: 2-step dial puzzle
- getPuzzleById helper function"
```

---

### Task 7: Create Puzzle Store

**Files:**
- Create: `src/stores/puzzleStore.ts`
- Test: `src/__tests__/stores/puzzleStore.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/stores/puzzleStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { usePuzzleStore } from '../stores/puzzleStore';

describe('PuzzleStore', () => {
  beforeEach(() => {
    // Reset store before each test
    usePuzzleStore.getState().reset();
  });

  it('should start with null puzzle', () => {
    const state = usePuzzleStore.getState();
    expect(state.puzzle).toBeNull();
    expect(state.completed).toBe(false);
    expect(state.failed).toBe(false);
  });

  it('should load puzzle by ID', () => {
    const onSuccess = { type: 'goto' as const, nodeId: 'success' };
    const onFailure = { type: 'goto' as const, nodeId: 'failure' };

    usePuzzleStore.getState().startPuzzle('temple_door_symbols', onSuccess, onFailure);

    const state = usePuzzleStore.getState();
    expect(state.puzzle).not.toBeNull();
    expect(state.puzzle?.id).toBe('temple_door_symbols');
    expect(state.currentStepIndex).toBe(0);
    expect(state.onSuccess).toEqual(onSuccess);
    expect(state.onFailure).toEqual(onFailure);
  });

  it('should throw error for non-existent puzzle', () => {
    expect(() => {
      usePuzzleStore.getState().startPuzzle('nonexistent', { type: 'exit' }, { type: 'exit' });
    }).toThrow('Puzzle not found: nonexistent');
  });

  it('should advance to next step on correct choice', () => {
    usePuzzleStore.getState().startPuzzle('temple_door_symbols', { type: 'exit' }, { type: 'exit' });

    // Select correct choice for step 1 (east)
    usePuzzleStore.getState().selectChoice('east');

    const state = usePuzzleStore.getState();
    expect(state.currentStepIndex).toBe(1);
    expect(state.completed).toBe(false);
    expect(state.failed).toBe(false);
  });

  it('should mark as failed on incorrect choice', () => {
    usePuzzleStore.getState().startPuzzle('temple_door_symbols', { type: 'exit' }, { type: 'exit' });

    // Select incorrect choice for step 1 (west)
    usePuzzleStore.getState().selectChoice('west');

    const state = usePuzzleStore.getState();
    expect(state.failed).toBe(true);
    expect(state.completed).toBe(false);
  });

  it('should mark as completed when all steps correct', () => {
    usePuzzleStore.getState().startPuzzle('temple_door_symbols', { type: 'exit' }, { type: 'exit' });

    // Complete all 3 steps correctly
    usePuzzleStore.getState().selectChoice('east');  // Step 1
    usePuzzleStore.getState().selectChoice('west');  // Step 2
    usePuzzleStore.getState().selectChoice('north'); // Step 3

    const state = usePuzzleStore.getState();
    expect(state.completed).toBe(true);
    expect(state.failed).toBe(false);
    expect(state.currentStepIndex).toBe(3);
  });

  it('should log all attempts', () => {
    usePuzzleStore.getState().startPuzzle('temple_door_symbols', { type: 'exit' }, { type: 'exit' });

    usePuzzleStore.getState().selectChoice('east');
    usePuzzleStore.getState().selectChoice('west');

    const state = usePuzzleStore.getState();
    expect(state.attemptLog).toHaveLength(2);
    expect(state.attemptLog[0]).toEqual({ stepId: 'step1_sun', choiceId: 'east', correct: true });
    expect(state.attemptLog[1]).toEqual({ stepId: 'step2_moon', choiceId: 'west', correct: true });
  });

  it('should get current step', () => {
    usePuzzleStore.getState().startPuzzle('temple_door_symbols', { type: 'exit' }, { type: 'exit' });

    const step = usePuzzleStore.getState().getCurrentStep();
    expect(step).not.toBeNull();
    expect(step?.id).toBe('step1_sun');
  });

  it('should reset puzzle state', () => {
    usePuzzleStore.getState().startPuzzle('temple_door_symbols', { type: 'exit' }, { type: 'exit' });
    usePuzzleStore.getState().selectChoice('east');
    usePuzzleStore.getState().reset();

    const state = usePuzzleStore.getState();
    expect(state.puzzle).toBeNull();
    expect(state.currentStepIndex).toBe(0);
    expect(state.attemptLog).toHaveLength(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- puzzleStore.test`
Expected: FAIL with "Cannot find module '../stores/puzzleStore'"

**Step 3: Create puzzle store**

```typescript
// src/stores/puzzleStore.ts
import { create } from 'zustand';
import type { Puzzle, PuzzleStep } from '../types/puzzle';
import type { ChoiceOutcome } from '../types/narrative';
import { getPuzzleById } from '../data/puzzles';

interface AttemptLog {
  stepId: string;
  choiceId: string;
  correct: boolean;
}

interface PuzzleStore {
  puzzle: Puzzle | null;
  currentStepIndex: number;
  completed: boolean;
  failed: boolean;
  attemptLog: AttemptLog[];
  onSuccess: ChoiceOutcome | null;
  onFailure: ChoiceOutcome | null;

  startPuzzle: (puzzleId: string, onSuccess: ChoiceOutcome, onFailure: ChoiceOutcome) => void;
  selectChoice: (choiceId: string) => void;
  getCurrentStep: () => PuzzleStep | null;
  reset: () => void;
}

export const usePuzzleStore = create<PuzzleStore>((set, get) => ({
  puzzle: null,
  currentStepIndex: 0,
  completed: false,
  failed: false,
  attemptLog: [],
  onSuccess: null,
  onFailure: null,

  startPuzzle: (puzzleId, onSuccess, onFailure) => {
    const puzzle = getPuzzleById(puzzleId);
    if (!puzzle) {
      throw new Error(`Puzzle not found: ${puzzleId}`);
    }
    set({
      puzzle,
      currentStepIndex: 0,
      completed: false,
      failed: false,
      attemptLog: [],
      onSuccess,
      onFailure,
    });
  },

  selectChoice: (choiceId) => {
    const { puzzle, currentStepIndex, attemptLog, completed, failed } = get();
    if (!puzzle || completed || failed) return;

    const currentStep = puzzle.steps[currentStepIndex];
    if (!currentStep) return;

    const choice = currentStep.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    const newLog = [
      ...attemptLog,
      { stepId: currentStep.id, choiceId, correct: choice.correct },
    ];

    if (choice.correct) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex >= puzzle.steps.length) {
        set({ completed: true, attemptLog: newLog });
      } else {
        set({ currentStepIndex: nextIndex, attemptLog: newLog });
      }
    } else {
      set({ failed: true, attemptLog: newLog });
    }
  },

  getCurrentStep: () => {
    const { puzzle, currentStepIndex } = get();
    if (!puzzle) return null;
    return puzzle.steps[currentStepIndex] || null;
  },

  reset: () => {
    set({
      puzzle: null,
      currentStepIndex: 0,
      completed: false,
      failed: false,
      attemptLog: [],
      onSuccess: null,
      onFailure: null,
    });
  },
}));
```

**Step 4: Run test to verify it passes**

Run: `npm test -- puzzleStore.test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/stores/puzzleStore.ts src/__tests__/stores/puzzleStore.test.ts
git commit -m "feat: create puzzle store with state management

- Load puzzles by ID
- Track current step and completion status
- Advance on correct choice, fail on incorrect
- Log all attempts for debugging
- Reset functionality"
```

---

### Task 8: Add Puzzle Outcome Resolution to Narrative Logic

**Files:**
- Modify: `src/utils/narrativeLogic.ts`
- Modify: `src/types/narrative.ts` (OutcomeResolution type)
- Test: `src/__tests__/utils/narrativeLogic.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/utils/narrativeLogic.test.ts
import { resolveOutcome } from '../utils/narrativeLogic';
import type { ChoiceOutcome } from '../types/narrative';

describe('resolveOutcome - Puzzle', () => {
  it('should resolve puzzle outcome with trigger', () => {
    const outcome: ChoiceOutcome = {
      type: 'puzzle',
      puzzleId: 'temple_door_symbols',
      onSuccess: { type: 'goto', nodeId: 'door_opens' },
      onFailure: { type: 'goto', nodeId: 'door_sealed' }
    };

    const result = resolveOutcome(outcome, null, 'current_node');

    expect(result.nextNodeId).toBe('current_node');
    expect(result.puzzleTrigger).toBeDefined();
    expect(result.puzzleTrigger?.puzzleId).toBe('temple_door_symbols');
    expect(result.puzzleTrigger?.onSuccess).toEqual({ type: 'goto', nodeId: 'door_opens' });
    expect(result.puzzleTrigger?.onFailure).toEqual({ type: 'goto', nodeId: 'door_sealed' });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- narrativeLogic.test`
Expected: FAIL - puzzle case not handled in resolveOutcome

**Step 3: Update OutcomeResolution type**

```typescript
// src/types/narrative.ts (around line 208-224)
export interface OutcomeResolution {
  nextNodeId: string | null;
  logEntries: LogEntry[];
  worldUpdates: Partial<WorldState>;
  exploreTrigger?: {
    tableId: string;
    onceOnly: boolean;
  };
  merchantTrigger?: {
    shopInventory: string[];
    buyPrices: Record<string, number>;
  };
  characterCreationTrigger?: {
    phase: 1 | 2;
    nextNodeId: string;
  };
  puzzleTrigger?: {
    puzzleId: string;
    onSuccess: ChoiceOutcome;
    onFailure: ChoiceOutcome;
  };
}
```

**Step 4: Add puzzle case to resolveOutcome**

```typescript
// src/utils/narrativeLogic.ts (add to resolveOutcome function, around line 172-259)
case 'puzzle':
  return {
    nextNodeId: currentNodeId, // Stay on current node until puzzle resolves
    logEntries: [],
    worldUpdates: {},
    puzzleTrigger: {
      puzzleId: outcome.puzzleId,
      onSuccess: outcome.onSuccess,
      onFailure: outcome.onFailure,
    },
  };
```

**Step 5: Run test to verify it passes**

Run: `npm test -- narrativeLogic.test`
Expected: PASS

**Step 6: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 7: Commit**

```bash
git add src/utils/narrativeLogic.ts src/types/narrative.ts src/__tests__/utils/narrativeLogic.test.ts
git commit -m "feat: add puzzle outcome resolution to narrative logic

- Return puzzleTrigger with puzzleId and outcomes
- Stay on current node until puzzle resolves
- Update OutcomeResolution type"
```

---

### Task 9: Handle Puzzle Trigger in Narrative Store

**Files:**
- Modify: `src/stores/narrativeStore.ts`
- Test: Integration with puzzle store

**Step 1: Find puzzle trigger handling location**

Read narrativeStore to find where other triggers (exploration, merchant) are handled:

Run: `grep -n "exploreTrigger\|merchantTrigger" src/stores/narrativeStore.ts`

**Step 2: Add puzzle trigger handling**

Add after merchant trigger handling (around line 265-282):

```typescript
// src/stores/narrativeStore.ts
// Handle puzzle trigger
if (resolution.puzzleTrigger) {
  const { onNavigate } = get();
  if (onNavigate) {
    onNavigate({
      type: 'puzzle',
      puzzleId: resolution.puzzleTrigger.puzzleId,
      onComplete: (success: boolean) => {
        // Resolve success/failure outcome
        const outcome = success
          ? resolution.puzzleTrigger!.onSuccess
          : resolution.puzzleTrigger!.onFailure;

        const nextResolution = resolveOutcome(outcome, player, conversation.currentNodeId);

        // Update conversation log
        const newLog = [...conversation.log, ...nextResolution.logEntries];
        set({
          conversation: {
            ...conversation,
            log: newLog,
          },
        });

        // Navigate to next node or exit
        if (nextResolution.nextNodeId) {
          get().enterNode(nextResolution.nextNodeId, player);
          if (onNavigate) {
            onNavigate({ type: 'story' });
          }
        } else {
          // Exit conversation
          get().exitConversation();
        }
      },
    });
  }
  return; // Don't process navigation yet
}
```

**Step 3: Run build to verify no type errors**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/stores/narrativeStore.ts
git commit -m "feat: handle puzzle trigger in narrative store

- Navigate to puzzle screen on trigger
- Resolve success/failure outcome on completion
- Return to story or exit based on outcome"
```

---

### Task 10: Add Puzzle Screen Type

**Files:**
- Modify: `src/types/screen.ts` (or wherever Screen type is defined)

**Step 1: Find Screen type definition**

Run: `grep -rn "type Screen" src/types/`

If not found, check: `grep -rn "type Screen" src/`

**Step 2: Add puzzle screen type**

```typescript
// src/types/screen.ts (or wherever Screen is defined)
export type Screen =
  | { type: 'story' }
  | { type: 'combat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'exploration'; tableId: string; onceOnly: boolean; onComplete: () => void }
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number>; onClose: () => void }
  | { type: 'characterCreation' }
  | { type: 'quickCharacterCreation'; onComplete: (characterClass: CharacterClass) => void }
  | { type: 'levelUp'; newLevel: number; featChoices: string[]; onComplete: () => void }
  | { type: 'puzzle'; puzzleId: string; onComplete: (success: boolean) => void };
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/types/screen.ts
git commit -m "feat: add puzzle screen type to Screen union"
```

---

### Task 11: Create Puzzle Screen Component

**Files:**
- Create: `src/screens/PuzzleScreen.tsx`
- Test: `src/__tests__/screens/PuzzleScreen.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/screens/PuzzleScreen.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleScreen } from '../screens/PuzzleScreen';
import { usePuzzleStore } from '../stores/puzzleStore';

describe('PuzzleScreen', () => {
  beforeEach(() => {
    usePuzzleStore.getState().reset();
  });

  it('should render puzzle title and description on start', () => {
    usePuzzleStore.getState().startPuzzle(
      'temple_door_symbols',
      { type: 'exit' },
      { type: 'exit' }
    );

    render(<PuzzleScreen />);

    expect(screen.getByText(/Ancient Symbol Lock/i)).toBeInTheDocument();
    expect(screen.getByText(/Three symbols must be aligned/i)).toBeInTheDocument();
  });

  it('should render current step description', () => {
    usePuzzleStore.getState().startPuzzle(
      'temple_door_symbols',
      { type: 'exit' },
      { type: 'exit' }
    );

    render(<PuzzleScreen />);

    expect(screen.getByText(/sun symbol glows faintly/i)).toBeInTheDocument();
  });

  it('should render choice buttons', () => {
    usePuzzleStore.getState().startPuzzle(
      'temple_door_symbols',
      { type: 'exit' },
      { type: 'exit' }
    );

    render(<PuzzleScreen />);

    expect(screen.getByText(/Align with eastern marker/i)).toBeInTheDocument();
    expect(screen.getByText(/Align with western marker/i)).toBeInTheDocument();
    expect(screen.getByText(/Align with northern marker/i)).toBeInTheDocument();
  });

  it('should advance to next step on correct choice', () => {
    usePuzzleStore.getState().startPuzzle(
      'temple_door_symbols',
      { type: 'exit' },
      { type: 'exit' }
    );

    render(<PuzzleScreen />);

    const eastButton = screen.getByText(/Align with eastern marker/i);
    fireEvent.click(eastButton);

    // Should show step 2 now
    expect(screen.getByText(/moon symbol begins to glow/i)).toBeInTheDocument();
  });

  it('should show hint if available', () => {
    usePuzzleStore.getState().startPuzzle(
      'temple_door_symbols',
      { type: 'exit' },
      { type: 'exit' }
    );

    render(<PuzzleScreen />);

    expect(screen.getByText(/The sun rises in the east/i)).toBeInTheDocument();
  });

  it('should show success screen on completion', () => {
    usePuzzleStore.getState().startPuzzle(
      'temple_door_symbols',
      { type: 'exit' },
      { type: 'exit' }
    );

    const { rerender } = render(<PuzzleScreen />);

    // Complete all steps
    fireEvent.click(screen.getByText(/Align with eastern marker/i));
    rerender(<PuzzleScreen />);
    fireEvent.click(screen.getByText(/Align with western marker/i));
    rerender(<PuzzleScreen />);
    fireEvent.click(screen.getByText(/Align with northern marker/i));
    rerender(<PuzzleScreen />);

    expect(screen.getByText(/Success/i)).toBeInTheDocument();
  });

  it('should show failure screen on wrong choice', () => {
    usePuzzleStore.getState().startPuzzle(
      'temple_door_symbols',
      { type: 'exit' },
      { type: 'exit' }
    );

    render(<PuzzleScreen />);

    // Choose wrong answer
    fireEvent.click(screen.getByText(/Align with western marker/i));

    expect(screen.getByText(/Failed/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- PuzzleScreen.test`
Expected: FAIL with "Cannot find module '../screens/PuzzleScreen'"

**Step 3: Create PuzzleScreen component**

```typescript
// src/screens/PuzzleScreen.tsx
import React from 'react';
import { usePuzzleStore } from '../stores/puzzleStore';
import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';

export const PuzzleScreen: React.FC = () => {
  const {
    puzzle,
    currentStepIndex,
    completed,
    failed,
    onSuccess,
    onFailure,
    selectChoice,
    getCurrentStep,
    reset,
  } = usePuzzleStore();

  const onNavigate = useNarrativeStore((state) => state.onNavigate);
  const character = useCharacterStore((state) => state.character);

  const currentStep = getCurrentStep();

  // Handle completion/failure navigation
  React.useEffect(() => {
    if (completed && onSuccess) {
      // Small delay for user to see success message
      const timer = setTimeout(() => {
        reset();
        // Navigate back to story - narrativeStore will handle outcome resolution
        if (onNavigate) {
          onNavigate({ type: 'story' });
        }
      }, 1500);
      return () => clearTimeout(timer);
    } else if (failed && onFailure) {
      // Small delay for user to see failure message
      const timer = setTimeout(() => {
        reset();
        // Navigate back to story - narrativeStore will handle outcome resolution
        if (onNavigate) {
          onNavigate({ type: 'story' });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [completed, failed, onSuccess, onFailure, reset, onNavigate]);

  if (!puzzle || !currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <p className="body-primary">Loading puzzle...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-900 to-black p-4">
        <h1 className="heading-display text-accent-green mb-4">Success!</h1>
        <p className="body-primary text-center">You've solved the puzzle.</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-900 to-black p-4">
        <h1 className="heading-display text-accent-red mb-4">Failed!</h1>
        <p className="body-primary text-center">The mechanism locks with a heavy click.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      {/* Puzzle Header */}
      <div className="mb-6 text-center">
        <h1 className="heading-display text-text-accent mb-2">{puzzle.title}</h1>
        {currentStepIndex === 0 && (
          <p className="body-secondary mb-4">{puzzle.description}</p>
        )}
        <p className="body-muted">Step {currentStepIndex + 1} of {puzzle.steps.length}</p>
      </div>

      {/* Current Step */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-surface-secondary p-6 rounded-lg border border-border-primary">
          <p className="body-primary mb-6">{currentStep.description}</p>

          {/* Choices */}
          <div className="space-y-3">
            {currentStep.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => selectChoice(choice.id)}
                className="w-full px-4 py-3 bg-surface-tertiary hover:bg-surface-hover border border-border-secondary rounded transition-colors text-left"
              >
                <span className="button-text text-text-primary">{choice.text}</span>
              </button>
            ))}
          </div>

          {/* Hint (if available) */}
          {currentStep.hint && (
            <div className="mt-4 p-3 bg-accent-blue/10 border border-accent-blue/30 rounded">
              <p className="body-secondary text-accent-blue">💡 Hint: {currentStep.hint}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- PuzzleScreen.test`
Expected: PASS

**Step 5: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/screens/PuzzleScreen.tsx src/__tests__/screens/PuzzleScreen.test.tsx
git commit -m "feat: create puzzle screen component

- Render puzzle title, description, and progress
- Display current step and choices
- Handle choice selection and step progression
- Show success/failure screens
- Auto-navigate back to story on completion"
```

---

### Task 12: Add Puzzle Screen Routing in App

**Files:**
- Modify: `src/App.tsx`

**Step 1: Find screen routing location**

Run: `grep -n "currentScreen.type ===" src/App.tsx | head -20`

**Step 2: Add puzzle screen routing**

Add after other screen type checks:

```typescript
// src/App.tsx
import { PuzzleScreen } from './screens/PuzzleScreen';

// ... in the render section
{currentScreen.type === 'puzzle' && (
  <PuzzleScreen />
)}
```

**Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Run dev server and test manually**

Run: `npm run dev`

Navigate to a node with a puzzle choice (you'll need to create one or modify campaign data for testing).

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add puzzle screen routing to App

- Import PuzzleScreen component
- Render when currentScreen.type is 'puzzle'"
```

---

### Task 13: Create Example Puzzle in Campaign

**Files:**
- Read: Campaign data location
- Modify: Add puzzle choice to a node

**Step 1: Find campaign data**

Run: `find src/data -name "*campaign*"`

**Step 2: Add puzzle choice to a node**

Add to an appropriate node in the campaign:

```typescript
// In campaign data
{
  id: 'temple_sealed_door',
  description: 'A massive stone door blocks your path. Ancient symbols are carved into its surface, each one surrounded by rotating rings.',
  locationHint: 'The temple is silent except for the sound of stone grinding on stone.',
  choices: [
    {
      id: 'attempt_puzzle',
      text: 'Attempt to solve the symbol lock',
      category: 'special',
      outcome: {
        type: 'puzzle',
        puzzleId: 'temple_door_symbols',
        onSuccess: { type: 'goto', nodeId: 'temple_door_opens' },
        onFailure: { type: 'goto', nodeId: 'temple_door_sealed' }
      }
    },
    {
      id: 'force_door',
      text: 'Try to force the door open',
      category: 'combat',
      outcome: {
        type: 'check',
        skill: 'Athletics',
        dc: 25,
        success: { type: 'goto', nodeId: 'temple_door_forced' },
        failure: { type: 'goto', nodeId: 'door_wont_budge' }
      }
    },
    {
      id: 'leave',
      text: 'Leave the temple',
      category: 'movement',
      outcome: { type: 'exit' }
    }
  ]
},
{
  id: 'temple_door_opens',
  description: 'The symbols align perfectly! With a deep rumble, the ancient door swings open, revealing a dark passage beyond.',
  onEnter: [
    { type: 'setFlag', flag: 'temple_door_unlocked', value: true }
  ],
  choices: [
    { id: 'enter', text: 'Enter the temple', outcome: { type: 'goto', nodeId: 'temple_interior' } }
  ]
},
{
  id: 'temple_door_sealed',
  description: 'A wrong symbol clicks into place. The mechanism locks with a resounding boom. The door will not open now.',
  onEnter: [
    { type: 'setFlag', flag: 'temple_door_failed', value: true }
  ],
  choices: [
    { id: 'leave', text: 'Leave in frustration', outcome: { type: 'exit' } }
  ]
}
```

**Step 3: Test in browser**

1. Start dev server: `npm run dev`
2. Navigate to the temple door node
3. Select "Attempt to solve the symbol lock"
4. Verify puzzle screen appears
5. Test correct path: east → west → north
6. Verify success screen appears
7. Verify navigation to temple_door_opens node
8. Test failure path (choose wrong answer)
9. Verify failure screen and navigation to temple_door_sealed

**Step 4: Commit**

```bash
git add src/data/campaigns/
git commit -m "feat: add example puzzle encounter to campaign

- Temple door with symbol lock puzzle
- Success opens door, failure seals it
- Demonstrates puzzle screen integration"
```

---

## Phase 2 Complete - Final Verification Checkpoint

**Run full test suite:**
```bash
npm test
```
Expected: All tests pass

**Run build:**
```bash
npm run build
```
Expected: Build succeeds with no errors

**Run lint:**
```bash
npm run lint
```
Expected: No lint errors

**Manual verification checklist:**
1. ✅ Puzzle screen renders correctly
2. ✅ Step progression works on correct choices
3. ✅ Failure state triggers on wrong choices
4. ✅ Success/failure outcomes resolve correctly
5. ✅ Navigation returns to story after completion
6. ✅ Hints display when available
7. ✅ Multiple puzzles can be created and work independently

**If all checks pass, Phase 2 is complete!**

---

## Complete Implementation - Final Verification

**Run all checks:**
```bash
npm test && npm run build && npm run lint
```
Expected: All pass

**Test both features end-to-end:**
1. Discovery outcomes in exploration
2. Puzzle encounters in narrative

**Git status check:**
```bash
git log --oneline -15
```
Verify all commits are present with clear messages.

---

## Summary

**Phase 1 Deliverables:**
- ✅ Discovery outcome type added to ExplorationOutcome
- ✅ Exploration screen handles discovery with skill checks
- ✅ Rewards added to character on success
- ✅ Flags prevent re-discovery
- ✅ Example discovery in exploration table
- ✅ Tests passing

**Phase 2 Deliverables:**
- ✅ Puzzle type definitions (Puzzle, PuzzleStep)
- ✅ Puzzle data structure with examples
- ✅ Puzzle store with state management
- ✅ Puzzle outcome type in narrative system
- ✅ Outcome resolution in narrative logic
- ✅ Trigger handling in narrative store
- ✅ Puzzle screen component with UI
- ✅ Screen routing in App
- ✅ Example puzzle encounter in campaign
- ✅ Tests passing

**Total Files Changed:** 15 files
**Total Commits:** ~13 commits
**Estimated Time:** 5-8 hours
**Actual Time:** [To be filled after implementation]

**Next Steps:**
- Add more puzzles to puzzle data
- Add more discovery outcomes to exploration tables
- Consider Phase 3: Lockpicking mini-game (future)

---

## Notes for Future Development

**Puzzle System Extensions:**
- Add time limits (timeLimit field already in type)
- Add backtracking (allowBacktrack field already in type)
- Add puzzle difficulty ratings
- Add visual puzzle representations
- Add sound effects for success/failure

**Discovery System Extensions:**
- Add partial success (get item but take damage)
- Add multiple skill check options
- Add progressive difficulty (first attempt easier than retry)

**Testing Improvements:**
- Add integration tests for full narrative → puzzle → narrative flow
- Add performance tests for large puzzles
- Add accessibility tests for screen readers
