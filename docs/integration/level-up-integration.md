# Level-Up Integration Guide

This guide shows how to integrate the Phase 4 level-up system into your campaign nodes.

## Overview

The level-up system is triggered at specific story milestones in your campaign. When a character reaches a milestone, you can trigger a level-up that allows them to:
- Gain HP, BAB, and saving throws
- Select a new feat (if applicable)
- Allocate skill points
- Learn new spells (for casters)

## Quick Start

### 1. Import the Trigger Utilities

```typescript
import { triggerLevelUp, autoLevelUp } from '../utils/levelUpTrigger';
```

### 2. Trigger Level-Up at Story Milestones

```typescript
// In your campaign node's onEnter or choice handler:
const success = triggerLevelUp(2); // Advance to level 2
if (success) {
  // Navigate to level-up screen or handle UI
  console.log('Level-up triggered!');
}
```

### 3. For Testing: Auto-Complete Level-Up

```typescript
// Useful for testing or NPCs - auto-selects default choices
autoLevelUp(2);
```

## API Reference

### `triggerLevelUp(newLevel: number): boolean`

Initiates a level-up process.

**Parameters:**
- `newLevel` - The level to advance to (must be 2-5)

**Returns:**
- `true` if level-up was successfully triggered
- `false` if validation failed (invalid level, no character, etc.)

**Example:**
```typescript
if (triggerLevelUp(3)) {
  navigateToLevelUpScreen();
}
```

### `isLevelUpInProgress(): boolean`

Check if a level-up is currently in progress.

**Example:**
```typescript
if (isLevelUpInProgress()) {
  // Don't allow certain actions during level-up
  return;
}
```

### `getPendingLevelUp(): LevelUpResult | null`

Get details about the pending level-up.

**Returns:**
- Level-up result with HP gained, BAB gained, feats, etc.
- `null` if no level-up is in progress

**Example:**
```typescript
const levelUp = getPendingLevelUp();
if (levelUp) {
  console.log(`Gaining ${levelUp.hpGained} HP!`);
  console.log(`New level: ${levelUp.newLevel}`);
}
```

### `completeLevelUp(): void`

Complete the level-up after player makes choices.

**Example:**
```typescript
// After player selects feat, allocates skills, etc.
completeLevelUp();
navigateBackToCampaign();
```

### `cancelLevelUp(): void`

Cancel the current level-up (useful for testing or if player backs out).

### `autoLevelUp(newLevel: number): boolean`

Automatically complete a level-up with default choices.

**Use cases:**
- Testing level-up flow
- Leveling NPCs
- Speedrunning through content

**Example:**
```typescript
// Quickly level up for testing
autoLevelUp(5); // Jump to level 5 with default choices
```

## Campaign Integration Examples

### Example 1: Simple Level-Up Milestone

```typescript
export const CHAPTER_1_END: NarrativeNode = {
  id: 'chapter-1-end',
  type: 'story',
  text: 'You have completed Chapter 1! Your skills have improved.',
  onEnter: () => {
    triggerLevelUp(2); // Auto-advance to level 2
  },
  choices: [
    {
      text: 'Review your improvements',
      nextNodeId: 'level-up-screen',
    },
    {
      text: 'Continue adventure',
      nextNodeId: 'chapter-2-start',
      onSelect: () => {
        // Complete with default choices if player skips
        completeLevelUp();
      },
    },
  ],
};
```

### Example 2: Conditional Level-Up

```typescript
export const BOSS_VICTORY: NarrativeNode = {
  id: 'boss-victory',
  type: 'story',
  text: 'You have defeated the ancient dragon!',
  onEnter: () => {
    const character = useCharacterStore.getState().character;

    // Only level up if at level 2 or 3
    if (character && character.level < 4) {
      triggerLevelUp(character.level + 1);
    }
  },
  choices: [
    {
      text: 'Continue',
      nextNodeId: 'next-chapter',
    },
  ],
};
```

### Example 3: Training Montage with Multiple Levels

```typescript
export const TRAINING_MONTAGE: NarrativeNode = {
  id: 'training-montage',
  type: 'story',
  text: 'Months pass as you train with the master...',
  choices: [
    {
      text: 'Complete training (Level up to 5)',
      nextNodeId: 'training-complete',
      onSelect: () => {
        // Auto-level from current to level 5
        const character = useCharacterStore.getState().character;
        if (character) {
          for (let i = character.level + 1; i <= 5; i++) {
            autoLevelUp(i);
          }
        }
      },
    },
  ],
};
```

### Example 4: Player-Controlled Level-Up

```typescript
export const CAMPFIRE_REST: NarrativeNode = {
  id: 'campfire-rest',
  type: 'story',
  text: 'You rest by the campfire, reflecting on your journey.',
  choices: [
    {
      text: 'Review character improvements',
      nextNodeId: 'level-up-review',
      isAvailable: () => {
        const character = useCharacterStore.getState().character;
        return character && character.level < 5;
      },
      onSelect: () => {
        const character = useCharacterStore.getState().character;
        if (character && character.level < 5) {
          triggerLevelUp(character.level + 1);
        }
      },
    },
    {
      text: 'Continue resting',
      nextNodeId: 'wake-up',
    },
  ],
};
```

## Level-Up Store Integration

The level-up trigger utilities interact with the `useLevelUpStore`. Here's the full flow:

```typescript
// 1. Trigger level-up
triggerLevelUp(2);
// → Sets pendingLevelUp, levelUpInProgress = true

// 2. Player makes choices (UI handles this)
useLevelUpStore.getState().loadAvailableFeats();
useLevelUpStore.getState().selectFeat('power_attack');
useLevelUpStore.getState().allocateSkillPoint('Athletics');

// 3. Complete level-up
completeLevelUp();
// → Applies all choices to character, clears pending state
```

## Validation Rules

The level-up system enforces these rules:

1. **Level must increase**: Cannot level to current level or lower
2. **Maximum level 5**: Cannot exceed level 5
3. **Character must exist**: Cannot level up without an active character
4. **Sequential levels**: Must level up one at a time (1→2→3, not 1→3)

## Testing

Use the test utilities for campaign testing:

```typescript
import { autoLevelUp } from '../utils/levelUpTrigger';

// In test setup
beforeEach(() => {
  // Create test character at level 1
  createTestCharacter();

  // Quickly level to 5 for high-level content testing
  autoLevelUp(2);
  autoLevelUp(3);
  autoLevelUp(4);
  autoLevelUp(5);
});
```

## Common Patterns

### Pattern 1: Chapter-End Level-Ups

```typescript
// End of each chapter triggers a level-up
CHAPTER_1_END → Level 2
CHAPTER_2_END → Level 3
CHAPTER_3_END → Level 4
FINAL_BOSS → Level 5
```

### Pattern 2: Quest Milestone Level-Ups

```typescript
// Certain key quests grant levels
SAVE_THE_VILLAGE → Level 2
DEFEAT_BANDIT_KING → Level 3
RETRIEVE_ARTIFACT → Level 4
```

### Pattern 3: Experience-Based (Simulated)

```typescript
// Track "milestones" instead of XP
let milestonesCompleted = 0;

function onQuestComplete() {
  milestonesCompleted++;

  // Every 3 milestones = 1 level
  if (milestonesCompleted % 3 === 0) {
    const character = useCharacterStore.getState().character;
    if (character && character.level < 5) {
      triggerLevelUp(character.level + 1);
    }
  }
}
```

## UI Considerations

While Phase 4 provides the backend mechanics, UI implementation for level-up screens is planned for a future phase. For now, you can:

1. **Auto-complete with defaults**: Use `autoLevelUp()` for testing
2. **Manual console interaction**: Use store methods directly for development
3. **Build custom UI**: Create your own screens using the level-up store

## Next Steps

- **Phase 5**: Full UI implementation for level-up screens
- **Phase 6**: Enhanced campaign integration with visual level-up flow
- **Phase 7**: Character sheet enhancements to display progression data
