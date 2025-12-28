# Puzzle Node Integration Design

**Date**: 2025-12-28
**Status**: Approved for Implementation
**Purpose**: Integrate the TimingGame puzzle component into the campaign story node system with extensibility for future puzzle types.

---

## Overview

This design extends the narrative system to support interactive puzzle mini-games as part of the campaign flow. Puzzles can be triggered either by player choice or automatically via node effects, and route to different story nodes based on success/failure.

### Requirements

1. **Generic skill challenge**: Not tied to specific narrative context - reusable across different scenarios
2. **Dual trigger pattern**: Support both player-initiated (choice outcome) and automatic (node effect) triggers
3. **Pure narrative routing**: Success/failure routes to different nodes; nodes handle rewards/penalties via their own effects
4. **Configurable difficulty**: Campaign authors can customize puzzle parameters per encounter
5. **Extensible**: Easy to add new puzzle types in the future

---

## Architecture

### Type System Design

The puzzle system uses a discriminated union pattern to support multiple puzzle types with type-safe configuration.

#### Core Types

```typescript
// Puzzle type registry
type PuzzleType = 'timing' | 'matching' | 'memory' | 'sequence';

// Base config (shared by all puzzles)
interface BasePuzzleConfig {
  // Could include common settings like time limits, attempts, etc.
}

// Specific puzzle configs
interface TimingPuzzleConfig extends BasePuzzleConfig {
  gridSize?: number;
  tickInterval?: number;
  lockDuration?: number;
  autoUnlock?: boolean;
  allowManualUnlock?: boolean;
}

// Future puzzle configs
interface MatchingPuzzleConfig extends BasePuzzleConfig {
  pairs?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Union of all configs
type PuzzleConfig = TimingPuzzleConfig | MatchingPuzzleConfig;
```

#### Integration with Existing Types

```typescript
// Choice outcome extension
type ChoiceOutcome =
  | {
      type: 'puzzle';
      puzzleType: PuzzleType;
      config?: PuzzleConfig;  // Optional - uses defaults if omitted
      successNodeId: string;
      failureNodeId: string;
    }
  | { type: 'goto'; nodeId: string }
  | { type: 'check'; /* ... */ }
  // ... existing types

// Node effect extension
type NodeEffect =
  | {
      type: 'startPuzzle';
      puzzleType: PuzzleType;
      config?: PuzzleConfig;
      successNodeId: string;
      failureNodeId: string;
    }
  | { type: 'setFlag'; /* ... */ }
  | { type: 'startCombat'; /* ... */ }
  // ... existing types
```

### Why Dual Pattern?

Following existing architectural precedents:
- **Combat**: Triggered by node effect (`startCombat`)
- **Merchant**: Triggered by choice outcome (`merchant`)

The dual pattern provides:
- Maximum flexibility for campaign authors
- Clear semantics (choice = player-initiated, effect = automatic)
- Consistent with existing patterns

---

## State Management

### Store State Addition

```typescript
// In narrativeStore.ts
interface NarrativeStore {
  // ... existing state

  // Puzzle state
  activePuzzle: {
    puzzleType: PuzzleType;
    config?: PuzzleConfig;
    successNodeId: string;
    failureNodeId: string;
  } | null;

  // Actions
  startPuzzle: (puzzleType, config, successNodeId, failureNodeId) => void;
  completePuzzle: (success: boolean) => void;
}
```

### State Flow

1. **Trigger**: Choice outcome or node effect detected
2. **Activation**: Store sets `activePuzzle` with puzzle config and destination nodes
3. **Display**: UI renders PuzzleDispatcher when `activePuzzle !== null`
4. **Completion**: Puzzle calls `onSuccess`/`onFailure` → store calls `completePuzzle(true/false)`
5. **Navigation**: Store reads `successNodeId` or `failureNodeId`, navigates to that node
6. **Cleanup**: Store sets `activePuzzle = null`

### Store Implementation

```typescript
startPuzzle: (puzzleType, config, successNodeId, failureNodeId) => {
  set({
    activePuzzle: { puzzleType, config, successNodeId, failureNodeId }
  });
},

completePuzzle: (success) => {
  const { activePuzzle } = get();
  if (!activePuzzle) return;

  const nextNodeId = success
    ? activePuzzle.successNodeId
    : activePuzzle.failureNodeId;

  set({ activePuzzle: null });
  get().enterNode(nextNodeId);
}
```

### Design Benefits

- **Separation**: Puzzle components don't know about narrative routing
- **Reusable**: Puzzle callbacks are simple success/failure signals
- **Testable**: Pure functions resolve routing, store handles state
- **Clean**: Puzzle state is ephemeral (null when inactive)
- **Consistent**: Matches how combat state works

---

## Resolver Logic

### Choice Outcome Resolver

Extend `resolveChoiceOutcome` in `narrativeLogic.ts`:

```typescript
export function resolveChoiceOutcome(
  outcome: ChoiceOutcome,
  worldState: WorldState,
  conversationLog: LogEntry[]
): OutcomeResult {
  switch (outcome.type) {
    // ... existing cases (goto, check, merchant, etc.)

    case 'puzzle': {
      // Don't navigate yet - puzzle will handle it
      return {
        navigationTarget: null,  // Stay on current node
        updatedWorldState: worldState,
        logEntries: conversationLog,
        triggerPuzzle: {
          puzzleType: outcome.puzzleType,
          config: outcome.config,
          successNodeId: outcome.successNodeId,
          failureNodeId: outcome.failureNodeId
        }
      };
    }
  }
}
```

### Node Effect Processor

Extend `processNodeEffects` in `narrativeLogic.ts`:

```typescript
export function processNodeEffects(
  effects: NodeEffect[],
  worldState: WorldState
): EffectResult {
  for (const effect of effects) {
    switch (effect.type) {
      // ... existing cases (setFlag, giveItem, startCombat, etc.)

      case 'startPuzzle': {
        return {
          updatedWorldState: worldState,
          logEntries: [],
          triggerPuzzle: {
            puzzleType: effect.puzzleType,
            config: effect.config,
            successNodeId: effect.successNodeId,
            failureNodeId: effect.failureNodeId
          }
        };
      }
    }
  }
}
```

### Store Integration

The store's `selectChoice` and `enterNode` functions check for `triggerPuzzle` in results:

```typescript
selectChoice: (choiceId) => {
  const result = resolveChoiceOutcome(outcome, worldState, log);

  if (result.triggerPuzzle) {
    get().startPuzzle(
      result.triggerPuzzle.puzzleType,
      result.triggerPuzzle.config,
      result.triggerPuzzle.successNodeId,
      result.triggerPuzzle.failureNodeId
    );
  } else {
    // Normal navigation
  }
}
```

---

## UI Integration

### Component Hierarchy

```
<StoryScreen>
  └─ {activePuzzle ? <PuzzleDispatcher /> : <ConversationUI />}
```

### StoryScreen Modification

```typescript
export function StoryScreen() {
  const { activePuzzle, completePuzzle } = useNarrativeStore();

  // If puzzle is active, show puzzle instead of conversation
  if (activePuzzle) {
    return (
      <PuzzleDispatcher
        puzzleType={activePuzzle.puzzleType}
        config={activePuzzle.config}
        onSuccess={() => completePuzzle(true)}
        onFailure={() => completePuzzle(false)}
      />
    );
  }

  // Normal story/conversation UI
  return (
    <div className="story-container">
      {/* existing conversation rendering */}
    </div>
  );
}
```

### PuzzleDispatcher Component

```typescript
// /src/screens/puzzles/PuzzleDispatcher.tsx
interface PuzzleDispatcherProps {
  puzzleType: PuzzleType;
  config?: PuzzleConfig;
  onSuccess: () => void;
  onFailure: () => void;
}

export function PuzzleDispatcher({
  puzzleType,
  config,
  onSuccess,
  onFailure
}: PuzzleDispatcherProps) {
  switch (puzzleType) {
    case 'timing':
      return <TimingGame {...config} onSuccess={onSuccess} onFailure={onFailure} />;

    // Future puzzles
    case 'matching':
      return <MatchingGame {...config} onSuccess={onSuccess} onFailure={onFailure} />;

    default:
      // Fallback: auto-fail unknown puzzle types
      console.error(`Unknown puzzle type: ${puzzleType}`);
      onFailure();
      return null;
  }
}
```

### Visual Flow

1. Player sees conversation/story UI
2. Selects choice or enters node with puzzle trigger
3. Screen transitions to full-screen puzzle
4. Player completes or fails puzzle
5. Puzzle calls callback (`onSuccess`/`onFailure`)
6. Screen returns to conversation UI at success/failure node

---

## Testing Strategy

Following the project's behavioral testing philosophy: test game mechanics and observable outcomes, not implementation details.

### Resolver Logic Tests

**File**: `src/__tests__/utils/narrativeLogic.test.ts`

```typescript
describe('resolveChoiceOutcome - puzzle type', () => {
  it('should return triggerPuzzle for puzzle outcome', () => {
    const outcome = {
      type: 'puzzle',
      puzzleType: 'timing',
      config: { gridSize: 2 },
      successNodeId: 'win',
      failureNodeId: 'lose'
    };

    const result = resolveChoiceOutcome(outcome, worldState, []);

    expect(result.triggerPuzzle).toEqual({
      puzzleType: 'timing',
      config: { gridSize: 2 },
      successNodeId: 'win',
      failureNodeId: 'lose'
    });
    expect(result.navigationTarget).toBeNull();
  });
});

describe('processNodeEffects - startPuzzle', () => {
  it('should return triggerPuzzle for startPuzzle effect', () => {
    const effects = [{
      type: 'startPuzzle',
      puzzleType: 'timing',
      successNodeId: 'win',
      failureNodeId: 'lose'
    }];

    const result = processNodeEffects(effects, worldState);

    expect(result.triggerPuzzle).toBeDefined();
    expect(result.triggerPuzzle.puzzleType).toBe('timing');
  });
});
```

### Store Integration Tests

**File**: `src/__tests__/stores/narrativeStore.test.ts`

```typescript
describe('puzzle integration', () => {
  it('should navigate to success node when puzzle completed successfully', () => {
    store.startPuzzle('timing', {}, 'win-node', 'lose-node');
    store.completePuzzle(true);

    expect(store.getState().currentNodeId).toBe('win-node');
    expect(store.getState().activePuzzle).toBeNull();
  });

  it('should navigate to failure node when puzzle failed', () => {
    store.startPuzzle('timing', {}, 'win-node', 'lose-node');
    store.completePuzzle(false);

    expect(store.getState().currentNodeId).toBe('lose-node');
    expect(store.getState().activePuzzle).toBeNull();
  });

  it('should clear active puzzle state after completion', () => {
    store.startPuzzle('timing', {}, 'win-node', 'lose-node');
    store.completePuzzle(true);

    expect(store.getState().activePuzzle).toBeNull();
  });
});
```

### Component Tests

**File**: `src/__tests__/screens/puzzles/PuzzleDispatcher.test.tsx`

```typescript
describe('PuzzleDispatcher', () => {
  it('should render TimingGame for timing puzzle type', () => {
    render(
      <PuzzleDispatcher
        puzzleType="timing"
        onSuccess={vi.fn()}
        onFailure={vi.fn()}
      />
    );
    expect(screen.getByText('Symbol Match')).toBeInTheDocument();
  });

  it('should call onFailure for unknown puzzle type', () => {
    const onFailure = vi.fn();
    render(
      <PuzzleDispatcher
        puzzleType="unknown"
        onSuccess={vi.fn()}
        onFailure={onFailure}
      />
    );
    expect(onFailure).toHaveBeenCalled();
  });
});
```

---

## File Organization

```
/src/types/
  └─ narrative.ts (add PuzzleType, PuzzleConfig, update unions)

/src/screens/puzzles/
  ├─ PuzzleDispatcher.tsx (NEW)
  ├─ TimingGame.tsx (MOVE from /src/screens/)
  └─ index.ts (exports)

/src/utils/
  └─ narrativeLogic.ts (add puzzle cases)

/src/stores/
  └─ narrativeStore.ts (add activePuzzle state + actions)

/src/__tests__/
  ├─ utils/narrativeLogic.test.ts (add puzzle tests)
  ├─ stores/narrativeStore.test.ts (add puzzle tests)
  └─ screens/puzzles/PuzzleDispatcher.test.tsx (NEW)
```

---

## Migration & Backward Compatibility

### No Breaking Changes

- Existing outcome/effect types remain unchanged
- Opt-in feature: campaigns only use puzzles if they explicitly add them
- Graceful degradation: unknown puzzle types auto-fail (logged to console)
- Type safety: TypeScript ensures new campaigns use correct types

### TimingGame Refactor

The existing `TimingGame.tsx` needs minor updates to accept config:

```typescript
// Current: uses internal DEFAULT_CONFIG
const [config] = useState<GameConfig>(DEFAULT_CONFIG);

// Updated: accepts config prop with defaults
interface TimingGameProps {
  config?: Partial<TimingPuzzleConfig>;
  onSuccess: () => void;
  onFailure: () => void;
}

export function TimingGame({
  config: configOverride,
  onSuccess,
  onFailure
}: TimingGameProps) {
  const config = { ...DEFAULT_CONFIG, ...configOverride };
  // ... rest unchanged
}
```

---

## Implementation Checklist

### Phase 1: Type System
- [ ] Add `PuzzleType` union to `narrative.ts`
- [ ] Add `TimingPuzzleConfig` interface
- [ ] Add `puzzle` to `ChoiceOutcome` union
- [ ] Add `startPuzzle` to `NodeEffect` union
- [ ] Add `triggerPuzzle` to outcome/effect result types

### Phase 2: Components
- [ ] Create `/src/screens/puzzles/` directory
- [ ] Move `TimingGame.tsx` to puzzles directory
- [ ] Refactor `TimingGame` to accept config prop
- [ ] Create `PuzzleDispatcher.tsx`
- [ ] Create `index.ts` barrel export

### Phase 3: Logic
- [ ] Add `puzzle` case to `resolveChoiceOutcome`
- [ ] Add `startPuzzle` case to `processNodeEffects`
- [ ] Update return types to include `triggerPuzzle`

### Phase 4: State
- [ ] Add `activePuzzle` to store state
- [ ] Implement `startPuzzle` action
- [ ] Implement `completePuzzle` action
- [ ] Update `selectChoice` to handle `triggerPuzzle`
- [ ] Update `enterNode` to handle `triggerPuzzle`

### Phase 5: UI
- [ ] Update `StoryScreen` to render `PuzzleDispatcher` when active
- [ ] Test UI flow manually

### Phase 6: Tests
- [ ] Test `resolveChoiceOutcome` puzzle case
- [ ] Test `processNodeEffects` startPuzzle case
- [ ] Test store `startPuzzle`/`completePuzzle` actions
- [ ] Test `PuzzleDispatcher` component
- [ ] Test end-to-end puzzle flow

### Phase 7: Example Campaign
- [ ] Add puzzle nodes to test-campaign or create new test file
- [ ] Test both choice-triggered and effect-triggered puzzles
- [ ] Test with custom config and default config
- [ ] Verify success/failure routing

### Phase 8: Documentation
- [ ] Document puzzle system in `agent_docs/architecture/`
- [ ] Add usage examples to campaign authoring guide

---

## Usage Examples

### Player-Initiated Puzzle (Choice Outcome)

```typescript
{
  id: 'attempt-lockpick',
  text: 'Attempt to pick the lock',
  outcome: {
    type: 'puzzle',
    puzzleType: 'timing',
    config: {
      gridSize: 2,          // Easy 2x2 puzzle
      tickInterval: 2000,   // Slower ticks
      lockDuration: 6000,   // Longer lock time
    },
    successNodeId: 'lock-opened',
    failureNodeId: 'lock-failed'
  }
}
```

### Auto-Triggered Puzzle (Node Effect)

```typescript
{
  id: 'trapped-hallway',
  description: 'You step into the hallway. Suddenly, runes on the floor begin to glow!',
  onEnter: [{
    type: 'startPuzzle',
    puzzleType: 'timing',
    config: {
      gridSize: 3,          // Harder 3x3 puzzle
      tickInterval: 1000,   // Fast ticks
      lockDuration: 3000,   // Short lock time
    },
    successNodeId: 'trap-disarmed',
    failureNodeId: 'trap-triggered'
  }],
  choices: [] // No choices - forced puzzle
}
```

### Using Default Configuration

```typescript
{
  id: 'simple-puzzle',
  text: 'Try the puzzle',
  outcome: {
    type: 'puzzle',
    puzzleType: 'timing',
    // No config - uses DEFAULT_CONFIG
    successNodeId: 'success',
    failureNodeId: 'failure'
  }
}
```

---

## Future Extensibility

Adding a new puzzle type requires:

1. **Add type to union**: `type PuzzleType = 'timing' | 'matching' | 'newType';`
2. **Create config interface**: `interface NewPuzzleConfig extends BasePuzzleConfig { ... }`
3. **Implement component**: `NewPuzzleGame.tsx` with `onSuccess`/`onFailure` props
4. **Add to dispatcher**: Add case in `PuzzleDispatcher` switch statement
5. **Write tests**: Test resolver logic and component
6. **Done!**

The system is designed for easy extension without modifying existing code.

---

## Summary

This design provides:

- ✅ Extensible puzzle framework (easy to add new types)
- ✅ Dual trigger pattern (choice outcomes + node effects)
- ✅ Pure narrative routing (nodes handle rewards/penalties)
- ✅ Configurable difficulty per encounter
- ✅ Type-safe campaign authoring
- ✅ Clean separation of concerns
- ✅ Comprehensive testing strategy
- ✅ Backward compatible
- ✅ Follows existing architectural patterns
