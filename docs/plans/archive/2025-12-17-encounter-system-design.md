# Enhanced Encounter System Design

**Date:** 2025-12-17
**Status:** Approved
**Priority:** Phase 1 (Discovery Outcomes) - Now, Phase 2 (Puzzle Screen) - Next

---

## Overview

This document defines an enhanced encounter system for Adventurer RPG that supports diverse encounter types beyond combat. After analyzing 10 encounter categories, we determined that **7 are already supported** by the existing narrative engine, and **3 require new mechanics**.

### What Already Works (No Changes Needed)

The current system handles these encounter types out of the box:
1. Social & Narrative Encounters (binary skill checks)
2. Traps & Hazards (check + damage)
3. Navigation Puzzles - Skill Gates (simple DC checks)
4. Stealth & Infiltration (single stealth checks)
5. Random Road Events (exploration tables)
6. Ambient Storytelling (location descriptions)
7. Skill & Utility - Phase 1 (simple skill gates)

### What Needs Building (3 New Systems)

1. **Enhanced Exploration Outcomes** (Resource Discoveries) - **Phase 1**
   - Add new `discovery` outcome type to `ExplorationOutcome`
   - Embeds skill check + reward directly in exploration
   - **Effort: LOW (1-2 hours)** - extends existing exploration system

2. **Puzzle Screen System** (Multi-Step Navigation Puzzles) - **Phase 2**
   - New dedicated screen (like combat/merchant/exploration)
   - Handles state-tracked puzzles with multiple steps
   - **Effort: MEDIUM (4-6 hours)** - new screen + outcome type + data structure

3. **Lockpicking Mini-Game** (Future Phase) - **Phase 3**
   - Dedicated screen with game mechanics
   - POC already exists
   - **Effort: TBD** - postponed for later

**Total Implementation Effort (Phase 1 + 2): 5-8 hours**

---

## Part 1: Already Supported Encounter Types

This section provides **example nodes** demonstrating how to author each of the 7 encounter types that work TODAY with no code changes.

### 1. Social & Narrative Encounters

**Use Case:** Negotiation, persuasion, intimidation - testing social skills.

**Example: Guard Blocking Gate**

```typescript
{
  id: 'gate_guard_encounter',
  description: 'A stern guard blocks the gate with her spear. "None shall pass without the captain\'s seal." She eyes you suspiciously.',
  speakerName: 'Gate Guard',
  choices: [
    {
      id: 'diplomacy_check',
      text: 'Explain that you\'re here on urgent business',
      category: 'dialogue',
      outcome: {
        type: 'check',
        skill: 'Diplomacy',
        dc: 12,
        success: { type: 'goto', nodeId: 'guard_convinced' },
        failure: { type: 'goto', nodeId: 'guard_suspicious' }
      }
    },
    {
      id: 'intimidate_check',
      text: 'Threaten to report her to the captain',
      category: 'dialogue',
      outcome: {
        type: 'check',
        skill: 'Intimidate',
        dc: 15,
        success: { type: 'goto', nodeId: 'guard_cowed' },
        failure: { type: 'goto', nodeId: 'guard_attacks' }
      }
    },
    {
      id: 'bribe',
      text: 'Offer 50 gold to look the other way',
      category: 'special',
      requirements: [{ type: 'item', itemId: 'gold_50' }],
      outcome: { type: 'goto', nodeId: 'guard_bribed' }
    }
  ]
}
```

---

### 2. Traps & Hazards

**Use Case:** Environmental dangers requiring perception to spot and skills to avoid/disarm.

**Example: Pressure Plate Trap**

```typescript
{
  id: 'trapped_hallway',
  description: 'The corridor ahead is lined with ancient stone tiles. Faint scratches mar the walls at chest height.',
  choices: [
    {
      id: 'perception_check',
      text: 'Search for traps',
      category: 'skillCheck',
      outcome: {
        type: 'check',
        skill: 'Perception',
        dc: 13,
        success: {
          // Spotted the trap! Now disarm it
          type: 'check',
          skill: 'DisableDevice',
          dc: 15,
          success: { type: 'goto', nodeId: 'trap_disarmed' },
          failure: { type: 'goto', nodeId: 'trap_triggered_partial' } // Take half damage
        },
        failure: { type: 'goto', nodeId: 'trap_triggered_full' } // Didn't see it, full damage
      }
    },
    {
      id: 'rush_through',
      text: 'Move quickly down the hallway',
      category: 'movement',
      outcome: { type: 'goto', nodeId: 'trap_triggered_full' }
    }
  ]
},
{
  id: 'trap_triggered_full',
  description: 'Blades swing from the walls! You barely dodge, but not fast enough.',
  onEnter: [
    { type: 'damage', amount: 8 }
  ],
  choices: [
    { id: 'continue', text: 'Continue onward', outcome: { type: 'goto', nodeId: 'beyond_hallway' } }
  ]
}
```

---

### 3. Navigation Puzzles - Skill Gates

**Use Case:** Simple skill checks to access areas (climbing, jumping, puzzle-solving).

**Example: Climbing a Cliff**

```typescript
{
  id: 'cliff_base',
  description: 'A steep cliff rises before you. Handholds are scarce but visible. At the top, you see the entrance to a cave.',
  locationHint: 'The wind howls across the rocky face.',
  choices: [
    {
      id: 'climb_check',
      text: 'Attempt to climb the cliff',
      category: 'skillCheck',
      outcome: {
        type: 'check',
        skill: 'Athletics',
        dc: 14,
        success: { type: 'goto', nodeId: 'cliff_top' },
        failure: { type: 'goto', nodeId: 'climb_fall' }
      }
    },
    {
      id: 'look_for_path',
      text: 'Search for an easier path',
      category: 'exploration',
      outcome: { type: 'goto', nodeId: 'cliff_alternate_path' }
    }
  ]
},
{
  id: 'climb_fall',
  description: 'Your grip fails halfway up! You tumble down the rocks.',
  onEnter: [
    { type: 'damage', amount: 5 }
  ],
  choices: [
    { id: 'try_again', text: 'Try again', outcome: { type: 'loop' } },
    { id: 'give_up', text: 'Look for another way', outcome: { type: 'goto', nodeId: 'cliff_alternate_path' } }
  ]
}
```

---

### 4. Stealth & Infiltration

**Use Case:** Sneaking past guards or enemies using Stealth skill.

**Example: Bypassing Sentries**

```typescript
{
  id: 'fort_entrance',
  description: 'Two guards patrol the entrance to the fort. They haven\'t noticed you yet. Torchlight flickers across the courtyard beyond.',
  choices: [
    {
      id: 'stealth_check',
      text: 'Sneak past the guards',
      category: 'skillCheck',
      outcome: {
        type: 'check',
        skill: 'Stealth',
        dc: 15,
        success: { type: 'goto', nodeId: 'inside_fort_undetected' },
        failure: { type: 'goto', nodeId: 'guards_alerted' }
      }
    },
    {
      id: 'distraction',
      text: 'Create a distraction',
      category: 'skillCheck',
      requirements: [{ type: 'item', itemId: 'throwing_stone' }],
      outcome: {
        type: 'check',
        skill: 'Sleight of Hand',
        dc: 12,
        success: { type: 'goto', nodeId: 'guards_distracted' },
        failure: { type: 'goto', nodeId: 'guards_alerted' }
      }
    },
    {
      id: 'talk_way_in',
      text: 'Approach openly and talk your way in',
      category: 'dialogue',
      outcome: { type: 'goto', nodeId: 'gate_guard_encounter' }
    }
  ]
}
```

---

### 5. Random Road Events

**Use Case:** World-building encounters that make travel feel alive (farmers, merchants, strange sights).

**Example: Road Encounters Table**

```typescript
// In data/explorationTables.ts
{
  id: 'road_to_town_events',
  locationId: 'forest_road',
  encounters: [
    {
      weight: 40,
      outcome: { type: 'nothing', message: 'The road is quiet. Only birdsong breaks the silence.' }
    },
    {
      weight: 25,
      outcome: {
        type: 'vignette',
        description: 'A farmer leads a cow down the road, muttering nervously. He doesn\'t meet your eyes as he passes.',
        flavorOnly: true
      }
    },
    {
      weight: 20,
      outcome: {
        type: 'combat',
        enemyId: 'bandit',
        goldReward: 15,
        itemReward: 'rusty_dagger'
      }
    },
    {
      weight: 10,
      outcome: {
        type: 'treasure',
        gold: 25,
        items: ['healing_potion']
      }
    },
    {
      weight: 5,
      outcome: {
        type: 'vignette',
        description: 'A traveling merchant waves you down. "Looking to buy? I have the finest wares!" He grins with too many teeth.',
        flavorOnly: true
      }
    }
  ]
}

// In campaign node
{
  id: 'travel_forest_road',
  description: 'You set off down the forest road toward town.',
  choices: [
    {
      id: 'explore_road',
      text: 'Keep your eyes open as you travel',
      category: 'exploration',
      outcome: {
        type: 'explore',
        tableId: 'road_to_town_events',
        onceOnly: false // Can trigger multiple times
      }
    },
    {
      id: 'hurry_along',
      text: 'Travel quickly without stopping',
      category: 'movement',
      outcome: { type: 'goto', nodeId: 'arrive_at_town' }
    }
  ]
}
```

---

### 6. Ambient Storytelling

**Use Case:** Static environmental details that tell stories (skeletons, campsites, letters).

**Example: Abandoned Campsite**

```typescript
// In data/locations.ts
{
  id: 'ruins_campsite',
  name: 'Ruined Campsite',
  image: '/assets/locations/ruins_campsite.jpg',
  description: 'The remains of a campfire sit cold among broken crates. Two skeletons lie nearby, hands clasped together. A weathered letter rests between them, its ink faded but still legible.'
}

// In campaign node
{
  id: 'discover_campsite',
  description: 'You come across the ruins of an old campsite. The scene is eerily peaceful.',
  locationId: 'ruins_campsite', // Uses location description for atmosphere
  locationHint: 'A gentle breeze stirs the ashes.',
  choices: [
    {
      id: 'read_letter',
      text: 'Read the letter',
      category: 'exploration',
      outcome: { type: 'goto', nodeId: 'campsite_letter_contents' }
    },
    {
      id: 'search_crates',
      text: 'Search the broken crates',
      category: 'exploration',
      outcome: {
        type: 'check',
        skill: 'Perception',
        dc: 10,
        success: { type: 'goto', nodeId: 'find_hidden_locket' },
        failure: { type: 'goto', nodeId: 'find_nothing' }
      }
    },
    {
      id: 'leave',
      text: 'Leave this place undisturbed',
      category: 'movement',
      outcome: { type: 'goto', nodeId: 'continue_through_ruins' }
    }
  ]
},
{
  id: 'campsite_letter_contents',
  description: 'The letter reads: "My love, if you find this, know that we tried. The creature was too strong. We go together, at least. --Elara & Marcus"',
  onEnter: [
    { type: 'setFlag', flag: 'learned_elara_marcus_fate', value: true }
  ],
  choices: [
    { id: 'continue', text: 'Continue', outcome: { type: 'goto', nodeId: 'discover_campsite' } }
  ]
}
```

---

### 7. Skill & Utility Encounters - Phase 1

**Use Case:** Locked chests, magical barriers, hacking terminals - skill checks to bypass obstacles.

**Example: Locked Chest**

```typescript
{
  id: 'treasure_chest_locked',
  description: 'An ornate chest sits in the corner, secured with a complex lock. The craftsmanship is exquisite.',
  choices: [
    {
      id: 'lockpick_check',
      text: 'Pick the lock',
      category: 'skillCheck',
      requirements: [{ type: 'skill', skill: 'DisableDevice', minRanks: 3 }], // Need skill ranks
      outcome: {
        type: 'check',
        skill: 'DisableDevice',
        dc: 18,
        success: { type: 'goto', nodeId: 'chest_opened' },
        failure: { type: 'goto', nodeId: 'lock_jammed' }
      }
    },
    {
      id: 'force_open',
      text: 'Smash the lock with your weapon',
      category: 'combat',
      outcome: {
        type: 'check',
        skill: 'Athletics',
        dc: 20,
        success: { type: 'goto', nodeId: 'chest_opened' },
        failure: { type: 'goto', nodeId: 'chest_damaged' } // Destroyed contents
      }
    },
    {
      id: 'leave_it',
      text: 'Leave the chest alone',
      category: 'movement',
      outcome: { type: 'exit' }
    }
  ]
},
{
  id: 'chest_opened',
  description: 'The lock clicks open smoothly. Inside, you find valuable treasures!',
  onEnter: [
    { type: 'giveGold', amount: 100 },
    { type: 'giveItem', itemId: 'enchanted_ring' }
  ],
  choices: [
    { id: 'take_loot', text: 'Take the treasure', outcome: { type: 'exit' } }
  ]
}
```

---

## Part 2: New Systems to Build

### Phase 1: Enhanced Exploration Outcomes (Resource Discoveries)

**Goal:** Allow exploration to reveal items/treasures that require a skill check to actually obtain (hybrid exploration + skill check).

#### Type System Changes

**File:** `src/types/narrative.ts`

Add new outcome type to `ExplorationOutcome`:

```typescript
export type ExplorationOutcome =
  | { type: 'combat'; enemyId: string; goldReward: number; itemReward?: string }
  | { type: 'treasure'; gold: number; items: string[] }
  | { type: 'vignette'; description: string; flavorOnly: true }
  | { type: 'nothing'; message: string }
  | {
      type: 'discovery';
      description: string; // "A legendary sword is wedged behind the waterfall!"
      skillCheck: { skill: SkillName; dc: number };
      successReward: { gold?: number; items?: string[] };
      failureMessage?: string; // Optional custom failure text
      flag?: string; // Optional: prevent re-discovery (e.g., 'waterfall_sword_attempted')
    };
```

#### Flow

1. **Exploration table** includes `discovery` outcomes with weights
2. **Exploration screen** rolls and gets a `discovery` outcome
3. **Screen presents**: description + "Attempt [Skill] DC X" button
4. **Player clicks** → resolves skill check within exploration screen
5. **Success**: Shows reward message, adds items/gold to character, sets flag (if specified)
6. **Failure**: Shows failure message, no reward
7. **Returns** to exploration choices or narrative

#### Example Usage

```typescript
// In data/explorationTables.ts
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
        flag: 'waterfall_sword_attempted' // Can only try once
      }
    },
    {
      weight: 15,
      outcome: { type: 'combat', enemyId: 'river_serpent', goldReward: 30 }
    }
  ]
}
```

#### Implementation Changes

**Files to Modify:**
1. ✏️ `src/types/narrative.ts` - add `discovery` type (~10 lines)
2. ✏️ `src/screens/ExplorationScreen.tsx` - handle discovery outcome (~50 lines)
3. ✏️ `src/__tests__/types/narrative.test.ts` - test discovery type (~30 lines)
4. ✏️ `src/__tests__/screens/ExplorationScreen.test.tsx` - integration tests (~40 lines)

**Estimated Effort:** 1-2 hours
**Risk:** Low - extends existing exploration pattern

---

### Phase 2: Puzzle Screen System (Multi-Step Navigation Puzzles)

**Goal:** Support complex multi-step puzzles (aligning symbols, solving sequences) with dedicated UI, separate from simple skill checks.

#### Type System Changes

**File:** `src/types/narrative.ts`

Add new outcome type to `ChoiceOutcome`:

```typescript
export type ChoiceOutcome =
  | { type: 'goto'; nodeId: string }
  | { type: 'loop' }
  | { type: 'exit' }
  | { type: 'check'; skill: SkillName; dc: number; success: ChoiceOutcome; failure: ChoiceOutcome }
  | { type: 'explore'; tableId: string; onceOnly: boolean }
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number> }
  | { type: 'characterCreation'; phase: 1 | 2; nextNodeId: string }
  | {
      type: 'puzzle';
      puzzleId: string;
      onSuccess: ChoiceOutcome; // Recursive outcome on puzzle completion
      onFailure: ChoiceOutcome; // Recursive outcome on puzzle failure
    };
```

**New File:** `src/types/puzzle.ts`

```typescript
import type { SkillName } from './skill';

export interface PuzzleStep {
  id: string;
  description: string; // "Align the sun symbol with the eastern marker"
  choices: {
    id: string;
    text: string; // "Rotate sun symbol clockwise"
    correct: boolean;
  }[];
  hint?: string; // Optional companion hint
}

export interface Puzzle {
  id: string;
  title: string; // "Ancient Symbol Lock"
  description: string; // Initial puzzle introduction
  steps: PuzzleStep[]; // Ordered sequence of steps
  timeLimit?: number; // Optional: seconds to solve (future feature)
  allowBacktrack?: boolean; // Can undo previous steps? (future feature)
}
```

#### Puzzle Data Layer

**New File:** `src/data/puzzles.ts`

```typescript
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

#### State Management

**New File:** `src/stores/puzzleStore.ts`

```typescript
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

  // Actions
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
    const { puzzle, currentStepIndex, attemptLog } = get();
    if (!puzzle || get().completed || get().failed) return;

    const currentStep = puzzle.steps[currentStepIndex];
    if (!currentStep) return;

    const choice = currentStep.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    // Log the attempt
    const newLog = [
      ...attemptLog,
      { stepId: currentStep.id, choiceId, correct: choice.correct },
    ];

    if (choice.correct) {
      // Correct! Advance to next step
      const nextIndex = currentStepIndex + 1;
      if (nextIndex >= puzzle.steps.length) {
        // Puzzle completed!
        set({ completed: true, attemptLog: newLog });
      } else {
        // Move to next step
        set({ currentStepIndex: nextIndex, attemptLog: newLog });
      }
    } else {
      // Wrong choice - puzzle failed
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

#### Puzzle Screen Component

**New File:** `src/screens/PuzzleScreen.tsx`

```typescript
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
      // Resolve success outcome and navigate back
      reset();
      // TODO: Resolve onSuccess outcome via narrativeLogic
      if (onNavigate) {
        onNavigate({ type: 'story' });
      }
    } else if (failed && onFailure) {
      // Resolve failure outcome and navigate back
      reset();
      // TODO: Resolve onFailure outcome via narrativeLogic
      if (onNavigate) {
        onNavigate({ type: 'story' });
      }
    }
  }, [completed, failed, onSuccess, onFailure, reset, onNavigate]);

  if (!puzzle || !currentStep) {
    return <div className="p-4">Loading puzzle...</div>;
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

#### Integration with Narrative System

**File:** `src/utils/narrativeLogic.ts`

Add puzzle outcome resolution to `resolveOutcome()`:

```typescript
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

Update `OutcomeResolution` type:

```typescript
export interface OutcomeResolution {
  nextNodeId: string | null;
  logEntries: LogEntry[];
  worldUpdates: Partial<WorldState>;
  exploreTrigger?: { tableId: string; onceOnly: boolean };
  merchantTrigger?: { shopInventory: string[]; buyPrices: Record<string, number> };
  characterCreationTrigger?: { phase: 1 | 2; nextNodeId: string };
  puzzleTrigger?: {
    puzzleId: string;
    onSuccess: ChoiceOutcome;
    onFailure: ChoiceOutcome;
  };
}
```

**File:** `src/stores/narrativeStore.ts`

Handle puzzle trigger in `selectChoice()`:

```typescript
// Handle puzzle trigger
if (resolution.puzzleTrigger) {
  const { onNavigate } = get();
  if (onNavigate) {
    onNavigate({
      type: 'puzzle',
      puzzleId: resolution.puzzleTrigger.puzzleId,
      onComplete: (success: boolean) => {
        // Resolve success/failure outcome, then return to story
        const outcome = success
          ? resolution.puzzleTrigger!.onSuccess
          : resolution.puzzleTrigger!.onFailure;

        const nextResolution = resolveOutcome(outcome, player, conversation.currentNodeId);

        // Navigate to the next node or exit
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

**File:** `src/types/screen.ts` (or wherever Screen type is defined)

Add puzzle screen type:

```typescript
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

**File:** `src/App.tsx`

Add puzzle screen routing:

```typescript
{currentScreen.type === 'puzzle' && (
  <PuzzleScreen />
)}
```

#### Example Usage in Campaign

```typescript
// In campaign node
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
        dc: 25, // Very hard
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

#### Implementation Changes

**New Files:**
1. 📄 `src/types/puzzle.ts` - puzzle type definitions (~40 lines)
2. 📄 `src/data/puzzles.ts` - puzzle data structure (~50 lines with examples)
3. 📄 `src/stores/puzzleStore.ts` - puzzle state management (~100 lines)
4. 📄 `src/screens/PuzzleScreen.tsx` - puzzle UI (~150 lines)
5. 📄 `src/__tests__/stores/puzzleStore.test.ts` - store tests (~100 lines)
6. 📄 `src/__tests__/screens/PuzzleScreen.test.tsx` - component tests (~80 lines)

**Modified Files:**
1. ✏️ `src/types/narrative.ts` - add `puzzle` outcome type (~10 lines)
2. ✏️ `src/utils/narrativeLogic.ts` - puzzle outcome resolution (~25 lines)
3. ✏️ `src/stores/narrativeStore.ts` - puzzle trigger handling (~35 lines)
4. ✏️ `src/types/screen.ts` - add puzzle screen type (~5 lines)
5. ✏️ `src/App.tsx` - puzzle screen routing (~5 lines)
6. ✏️ `src/__tests__/utils/narrativeLogic.test.ts` - puzzle outcome tests (~40 lines)

**Estimated Effort:** 4-6 hours
**Risk:** Medium - new screen, new patterns, integration with recursive outcomes

---

## Testing Strategy

### Enhanced Exploration (Discovery Outcomes)

**Unit Tests (`__tests__/types/narrative.test.ts`):**
- ✅ Discovery outcome type validation
- ✅ Success/failure reward logic
- ✅ Flag setting on discovery

**Integration Tests (exploration screen):**
- ✅ Discovery outcome renders correctly with skill check button
- ✅ Skill check resolves properly on player click
- ✅ Rewards added to character on success
- ✅ Failure message shown on failure
- ✅ Flag prevents re-discovery if specified

---

### Puzzle Screen System

**Unit Tests (`__tests__/stores/puzzleStore.test.ts`):**
- ✅ Puzzle loading from ID
- ✅ Step progression on correct choice
- ✅ Failure on incorrect choice
- ✅ Completion triggers success outcome
- ✅ Failure triggers failure outcome
- ✅ Attempt log tracks all choices

**Unit Tests (`__tests__/utils/narrativeLogic.test.ts`):**
- ✅ Puzzle outcome resolution returns correct trigger
- ✅ Puzzle trigger contains puzzleId, onSuccess, onFailure

**Component Tests (`__tests__/screens/PuzzleScreen.test.tsx`):**
- ✅ Renders puzzle title and description
- ✅ Renders current step description
- ✅ Renders choice buttons for current step
- ✅ Advances to next step on correct choice
- ✅ Shows failure state on wrong choice
- ✅ Shows completion state when all steps correct
- ✅ Displays hints when available

**Integration Tests:**
- ✅ End-to-end: narrative choice → puzzle trigger → puzzle screen → completion → resolve outcome → return to narrative
- ✅ Success outcome navigates to correct node
- ✅ Failure outcome navigates to correct node
- ✅ Puzzle state resets after completion/failure

**Manual Testing:**
- Create 2-3 sample puzzles in `data/puzzles.ts`
- Add puzzle choices to campaign nodes
- Test full flow in dev environment:
  - Solve puzzle correctly → verify success outcome
  - Fail puzzle → verify failure outcome
  - Test hints display
  - Test step progression
- Verify UI responsiveness and styling

---

## Implementation Priority & Roadmap

### Phase 1: Enhanced Exploration (Now)
- **Goal:** Add `discovery` outcome type to enable hybrid exploration + skill check
- **Effort:** 1-2 hours
- **Risk:** Low
- **Files:** 4 files modified/created
- **Testing:** Unit + integration tests
- **Value:** Immediate - enables new encounter type with minimal effort

### Phase 2: Puzzle Screen System (Next)
- **Goal:** Add dedicated puzzle screen for multi-step puzzles
- **Effort:** 4-6 hours
- **Risk:** Medium
- **Files:** 11 files modified/created
- **Testing:** Unit + component + integration tests
- **Value:** High - unlocks entirely new content type, reusable system

### Phase 3: Lockpicking Mini-Game (Future)
- **Goal:** Replace simple lockpicking skill checks with interactive mini-game
- **Effort:** TBD (POC already exists)
- **Risk:** TBD
- **Dependencies:** Can leverage puzzle screen patterns
- **Value:** Polish - enhances existing mechanic

---

## Summary

### Already Supported (7 encounter types)
No code changes needed - authors can use these TODAY:
1. Social & Narrative Encounters
2. Traps & Hazards
3. Navigation Puzzles (skill gates)
4. Stealth & Infiltration
5. Random Road Events
6. Ambient Storytelling
7. Skill & Utility (Phase 1)

### New Systems (3 additions)
1. **Enhanced Exploration** - Phase 1 (1-2 hours, low risk)
2. **Puzzle Screen** - Phase 2 (4-6 hours, medium risk)
3. **Lockpicking Mini-Game** - Phase 3 (postponed)

**Total Effort (Phase 1 + 2): 5-8 hours**

This design enables a rich variety of encounter types while maintaining the clean separation of data and logic established in the codebase. Most encounter types require no new code, and the two new systems extend the existing architecture without breaking changes.
