# Narrative UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build StoryScreen, ChoiceButton, and NarrativeLog components to enable interactive narrative gameplay with the test campaign.

**Architecture:** React components using the design system (Button, Card, Badge components), connected to narrativeStore via Zustand. Components handle narrative text display, choice selection, skill check formatting, and scrollable log rendering.

**Tech Stack:** React, TypeScript, Tailwind CSS, Zustand, existing component library

---

## Task 1: Create NarrativeLog Component

**Files:**
- Create: `src/components/narrative/NarrativeLog.tsx`

**Step 1: Create the component file**

Create `src/components/narrative/NarrativeLog.tsx`:

```typescript
import type { LogEntry } from '../../types/narrative';

interface NarrativeLogProps {
  /**
   * Array of log entries to display
   */
  entries: LogEntry[];

  /**
   * Optional className for additional styling
   */
  className?: string;
}

/**
 * Displays narrative log entries with appropriate styling for each type.
 *
 * Entry types:
 * - narrative: Story text and NPC dialogue (with optional speaker name)
 * - playerChoice: What the player selected (indented, player color)
 * - skillCheck: Dice roll results with success/failure coloring
 * - effect: System messages (item received, HP changes, etc.)
 * - companion: Hints from the companion character
 *
 * @example
 * <NarrativeLog entries={conversation.log} />
 */
export function NarrativeLog({ entries, className = '' }: NarrativeLogProps) {
  if (entries.length === 0) {
    return (
      <div className={`text-text-muted text-sm italic ${className}`}>
        Your adventure begins...
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {entries.map((entry, index) => (
        <div key={index}>
          {entry.type === 'narrative' && (
            <div className="text-text-primary font-inter text-body">
              {entry.speaker && (
                <div className="font-semibold text-player mb-1">
                  {entry.speaker}:
                </div>
              )}
              <div>{entry.text}</div>
            </div>
          )}

          {entry.type === 'playerChoice' && (
            <div className="text-player font-semibold font-inter text-body pl-4 border-l-2 border-player">
              → {entry.text}
            </div>
          )}

          {entry.type === 'skillCheck' && (
            <div
              className={`font-mono text-sm pl-4 border-l-2 ${
                entry.success
                  ? 'text-green-400 border-green-400'
                  : 'text-red-400 border-red-400'
              }`}
            >
              <div>
                <span className="font-semibold">{entry.skill} Check:</span> 1d20
                [{entry.roll}] + {entry.modifier} = {entry.total} vs DC{' '}
                {entry.dc}
              </div>
              <div className="font-semibold">
                {entry.success ? '✓ SUCCESS' : '✗ FAILURE'}
              </div>
            </div>
          )}

          {entry.type === 'effect' && (
            <div className="text-text-muted font-inter text-sm italic pl-4 border-l-2 border-border-default">
              {entry.message}
            </div>
          )}

          {entry.type === 'companion' && (
            <div className="bg-secondary border-2 border-yellow-600 rounded-lg p-3">
              <div className="text-yellow-600 font-semibold text-sm mb-1 font-inter">
                Companion Hint:
              </div>
              <div className="text-text-secondary text-sm font-inter">
                {entry.hint}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Export from components index**

Modify `src/components/index.ts`:

```typescript
export * from './Icon';
export * from './Button';
export * from './Card';
export * from './StatusBar';
export * from './Badge';
export * from './narrative/NarrativeLog';
```

**Step 3: Commit**

```bash
git add src/components/narrative/NarrativeLog.tsx src/components/index.ts
git commit -m "feat: add NarrativeLog component for displaying story events"
```

---

## Task 2: Create ChoiceButton Component

**Files:**
- Create: `src/components/narrative/ChoiceButton.tsx`

**Step 1: Create the component file**

Create `src/components/narrative/ChoiceButton.tsx`:

```typescript
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
```

**Step 2: Export from components index**

Modify `src/components/index.ts`:

```typescript
export * from './Icon';
export * from './Button';
export * from './Card';
export * from './StatusBar';
export * from './Badge';
export * from './narrative/NarrativeLog';
export * from './narrative/ChoiceButton';
```

**Step 3: Commit**

```bash
git add src/components/narrative/ChoiceButton.tsx src/components/index.ts
git commit -m "feat: add ChoiceButton component for narrative choices"
```

---

## Task 3: Create Basic StoryScreen

**Files:**
- Create: `src/screens/StoryScreen.tsx`

**Step 1: Create the screen component**

Create `src/screens/StoryScreen.tsx`:

```typescript
import { useEffect, useRef } from 'react';
import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';
import { NarrativeLog, ChoiceButton, Card, Button } from '../components';
import { Icon } from '../components/Icon';
import { Book, Lightbulb } from 'lucide-react';

interface StoryScreenProps {
  /**
   * Callback to exit story mode (return to home/world map)
   */
  onExit: () => void;
}

/**
 * Main narrative screen displaying story text, choices, and conversation log.
 *
 * Features:
 * - Current node description display
 * - Choice buttons (filtered by requirements)
 * - Scrollable log of conversation history
 * - Companion hint button (when available)
 * - Auto-scroll to bottom on new entries
 *
 * @example
 * <StoryScreen onExit={() => setScreen('home')} />
 */
export function StoryScreen({ onExit }: StoryScreenProps) {
  const {
    conversation,
    campaign,
    getCurrentNode,
    getAvailableChoices,
    getChoiceDisplayText,
    selectChoice,
    requestCompanionHint,
    exitConversation,
  } = useNarrativeStore();

  const { character } = useCharacterStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when log updates
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.log]);

  if (!conversation || !character || !campaign) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card variant="neutral" padding="spacious">
          <p className="text-text-primary font-inter text-center">
            No active story. Please start a campaign.
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={onExit}
            className="mt-4"
          >
            Return to Menu
          </Button>
        </Card>
      </div>
    );
  }

  const currentNode = getCurrentNode();
  if (!currentNode) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card variant="neutral" padding="spacious">
          <p className="text-text-primary font-inter text-center">
            Story node not found. This is a bug.
          </p>
          <Button
            variant="danger"
            fullWidth
            onClick={onExit}
            className="mt-4"
          >
            Exit Story
          </Button>
        </Card>
      </div>
    );
  }

  const availableChoices = getAvailableChoices(character);
  const hasCompanionHint = !!currentNode.companionHint;

  const handleChoice = (choiceId: string) => {
    selectChoice(choiceId, character);
  };

  const handleCompanionHint = () => {
    requestCompanionHint();
  };

  const handleExit = () => {
    exitConversation();
    onExit();
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        <Card variant="neutral" padding="compact">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name={Book} className="text-player" />
              <div>
                <h1 className="font-pirata text-h1 text-text-primary">
                  {currentNode.title || campaign.title}
                </h1>
                {currentNode.locationHint && (
                  <p className="text-xs text-text-muted font-inter">
                    {currentNode.locationHint}
                  </p>
                )}
              </div>
            </div>
            <Button variant="secondary" onClick={handleExit} className="text-sm">
              Exit
            </Button>
          </div>
        </Card>
      </div>

      {/* Scrollable Log Area */}
      <div className="flex-1 overflow-y-auto mb-4">
        <Card variant="neutral" className="min-h-full">
          <NarrativeLog entries={conversation.log} />
          {/* Scroll anchor */}
          <div ref={logEndRef} />
        </Card>
      </div>

      {/* Choices Section */}
      <div className="space-y-2">
        {/* Companion Hint Button */}
        {hasCompanionHint && (
          <Button
            variant="secondary"
            fullWidth
            onClick={handleCompanionHint}
            icon={<Icon name={Lightbulb} />}
            className="mb-2"
          >
            Ask {campaign.companionName}
          </Button>
        )}

        {/* Choice Buttons */}
        {availableChoices.length > 0 ? (
          availableChoices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              wasSelected={conversation.visitedChoiceIds.includes(choice.id)}
              onSelect={handleChoice}
              displayText={getChoiceDisplayText(choice)}
            />
          ))
        ) : (
          <Card variant="neutral" padding="spacious">
            <p className="text-text-muted text-center font-inter text-sm italic">
              No available choices. The story continues...
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/screens/StoryScreen.tsx
git commit -m "feat: add StoryScreen for interactive narrative gameplay"
```

---

## Task 4: Wire Up Navigation

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update App.tsx to include StoryScreen**

Replace the entire contents of `src/App.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { CombatScreen } from './screens/CombatScreen';
import { CharacterCreationScreen } from './screens/CharacterCreationScreen';
import { CharacterSheetScreen } from './screens/CharacterSheetScreen';
import { StoryScreen } from './screens/StoryScreen';
import { useCharacterStore } from './stores/characterStore';
import { useNarrativeStore } from './stores/narrativeStore';
import type { Screen } from './types/navigation';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'home' });
  const { character, creationStep, startCreation } = useCharacterStore();
  const { setNavigationCallback } = useNarrativeStore();

  // Register navigation callback with narrative store
  useEffect(() => {
    setNavigationCallback(setCurrentScreen);
  }, [setNavigationCallback]);

  // When character creation is complete, show character sheet
  if (
    creationStep === 'complete' &&
    character &&
    currentScreen.type === 'characterCreation'
  ) {
    setCurrentScreen({ type: 'characterSheet' });
  }

  const handleCreateCharacter = () => {
    startCreation();
    setCurrentScreen({ type: 'characterCreation' });
  };

  const handleViewSheet = () => {
    setCurrentScreen({ type: 'characterSheet' });
  };

  const handleCloseSheet = () => {
    setCurrentScreen({ type: 'home' });
  };

  const handleStartStory = () => {
    setCurrentScreen({ type: 'story' });
  };

  return (
    <>
      {currentScreen.type === 'home' && (
        <HomeScreen
          onStartCombat={() => setCurrentScreen({ type: 'combat', enemyId: 'goblin', onVictoryNodeId: '' })}
          onCreateCharacter={handleCreateCharacter}
          onViewCharacter={character ? handleViewSheet : undefined}
          hasCharacter={character !== null}
          onStartStory={character ? handleStartStory : undefined}
        />
      )}
      {currentScreen.type === 'combat' && (
        <CombatScreen onEndCombat={() => setCurrentScreen({ type: 'home' })} />
      )}
      {currentScreen.type === 'characterCreation' && <CharacterCreationScreen />}
      {currentScreen.type === 'characterSheet' && character && (
        <CharacterSheetScreen character={character} onClose={handleCloseSheet} />
      )}
      {currentScreen.type === 'story' && (
        <StoryScreen onExit={() => setCurrentScreen({ type: 'home' })} />
      )}
    </>
  );
}

export default App;
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up StoryScreen navigation in App.tsx"
```

---

## Task 5: Add Story Button to HomeScreen

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

**Step 1: Read current HomeScreen**

Read `src/screens/HomeScreen.tsx` to understand current structure.

**Step 2: Add onStartStory prop and button**

Add the `onStartStory` prop to the HomeScreen interface and add a button to start the story (only shown when character exists).

Example modification:
```typescript
interface HomeScreenProps {
  onStartCombat: () => void;
  onCreateCharacter: () => void;
  onViewCharacter?: () => void;
  onStartStory?: () => void; // NEW
  hasCharacter: boolean;
}
```

Add button in the render section (after "View Character" button):
```typescript
{onStartStory && (
  <Button
    variant="primary"
    fullWidth
    onClick={onStartStory}
    icon={<Icon name={Book} />}
  >
    Start Story
  </Button>
)}
```

**Step 3: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: add Start Story button to HomeScreen"
```

---

## Task 6: Load Test Campaign on Start

**Files:**
- Modify: `src/App.tsx`

**Step 1: Load test campaign when story starts**

Modify `src/App.tsx` to load the test campaign when starting story:

```typescript
import { testCampaign } from './data/campaigns/test-campaign';

// ... in App component ...

const handleStartStory = () => {
  const { loadCampaign, startCampaign } = useNarrativeStore.getState();
  loadCampaign(testCampaign);
  startCampaign();
  setCurrentScreen({ type: 'story' });
};
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: load test campaign when starting story"
```

---

## Task 7: Manual Testing

**Files:**
- None (testing only)

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Create a character**

1. Click "Create Character"
2. Complete character creation
3. Return to home screen

**Step 3: Start the story**

1. Click "Start Story"
2. Verify you see: "The Crossroads" scene
3. Verify three choices appear
4. Verify companion hint button appears

**Step 4: Test narrative flow**

1. Click "Examine the signpost more closely"
   - Expected: Choice grays out, node loops back to same choices
2. Click "Ask The Guide" (companion hint)
   - Expected: Yellow hint box appears in log
3. Click "Head north toward the village"
   - Expected: New scene loads, NPC dialogue with "Village Guard" speaker name

**Step 5: Test skill checks**

1. At village, click "[Intimidate DC 10] Let me through. Now."
   - Expected: Dice roll appears in log with success/failure color
   - Expected: Routes to different node based on result

**Step 6: Test exit**

1. Click "Exit" button
   - Expected: Returns to home screen
2. Click "Start Story" again
   - Expected: Fresh campaign starts from beginning

**Step 7: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

---

## Task 8: Final Commit

**Files:**
- All modified files

**Step 1: Verify all tests pass**

Run: `npm test`
Expected: All tests pass (no new tests added in this phase, but existing should still pass)

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 2 Steps 4.1-4.3 - narrative UI components"
```

---

## Success Criteria

- [ ] StoryScreen displays narrative text and choices
- [ ] NarrativeLog renders all entry types with correct styling
- [ ] ChoiceButton handles skill check formatting and visited state
- [ ] Companion hint button appears and adds hint to log
- [ ] Skill checks show dice rolls with success/failure colors
- [ ] Navigation works: home → story → home
- [ ] Test campaign loads and is playable in browser
- [ ] Build succeeds with no errors
- [ ] Existing tests still pass

---

## Notes

- **Portraits:** The test campaign references `portraits/guard.png` but we're not implementing portrait images yet. The UI will gracefully handle missing portraits.
- **Combat Integration:** Combat triggering from narrative (Step 5.3 in Phase 2 plan) is NOT included in this implementation. That will come later.
- **Loop Behavior:** The "examine signpost" choice demonstrates loop behavior - selecting it grays the choice but returns to the same node with all choices still available.
- **Exit vs Loop:** "Exit" outcome exits the conversation completely, while "loop" returns to the current node.
