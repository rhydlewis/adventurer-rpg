> Should we introducer a **reducer-based implementation** to run the game by treating it as a **pure state machine**?

**current state + event → new state**.

Can you review this suggestion and advise whether we should adopt this approach please?

----

## 1. The core idea (in one sentence)

> The game never “does things” directly — it **dispatches events**, and a **reducer calculates the next state**.

No hidden mutations. No ad-hoc logic.

## 2. Why this fits your RPG perfectly

Your game already has:

* Explicit states (node, combat, death)
* Explicit events (choice selected, check resolved, combat ended)
* Explicit outcomes (goto, setFlag, giveItem)

That’s exactly what reducers are good at.

## 3. What “state” looks like

Think of one authoritative object:

```ts
type GameState = {
  mode: 'narrative' | 'combat' | 'death' | 'exit';

  currentNodeId: string;

  flags: Record<string, boolean>;
  inventory: Record<string, number>;

  party: {
    class: 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric';
    skills: Record<string, number>;
    hp: number;
  };

  combat?: CombatState;
};
```

Nothing else is “live”.

## 4. What “events” look like

Events are **player actions or system results**:

```ts
type GameEvent =
  | { type: 'ENTER_NODE'; nodeId: string }
  | { type: 'CHOOSE_OPTION'; choiceId: string }
  | { type: 'CHECK_RESULT'; success: boolean }
  | { type: 'COMBAT_STARTED'; enemyId: string }
  | { type: 'COMBAT_ENDED'; victory: boolean }
  | { type: 'EXIT_GAME' };
```

UI and engine logic *only* dispatch events.

## 5. The reducer (the heart of it)

A reducer is just a function:

```ts
function gameReducer(state: GameState, event: GameEvent): GameState {
  switch (event.type) {

    case 'ENTER_NODE': {
      const node = getNode(event.nodeId);

      let nextState = {
        ...state,
        currentNodeId: node.id,
        mode: 'narrative',
      };

      return applyEffects(nextState, node.onEnter);
    }

    case 'CHOOSE_OPTION': {
      const node = getNode(state.currentNodeId);
      const choice = node.choices.find(c => c.id === event.choiceId)!;

      return resolveOutcome(state, choice.outcome);
    }

    case 'COMBAT_STARTED':
      return {
        ...state,
        mode: 'combat',
        combat: createCombatState(event.enemyId),
      };

    case 'COMBAT_ENDED':
      return event.victory
        ? { ...state, mode: 'narrative' }
        : { ...state, mode: 'death' };

    default:
      return state;
  }
}
```

This function is **pure**:

* Same input → same output
* Easy to test
* Easy to debug

## 6. Where checks and randomness live

Randomness happens **outside** the reducer.

Example:

```ts
// UI / engine layer
const success = rollSkill('Perception', 12);
dispatch({ type: 'CHECK_RESULT', success });
```

Reducer just consumes the result.

This avoids nondeterministic state updates.

## 7. How this maps to your campaign data

| Narrative concept | Reducer concept                 |
| ----------------- | ------------------------------- |
| StoryNode         | State snapshot                  |
| Choice            | Event trigger                   |
| Outcome           | State transition                |
| onEnter effects   | Reducer side-effect application |
| Combat            | Sub-state                       |

Your test campaign already *is* a reducer input.

## 8. Why this scales well (future-proofing)

With reducers, you can add:

* Save/load (serialise GameState)
* Undo / rewind (keep previous states)
* Analytics (log events)
* Replays (re-run event log)
* Multiplayer (event sync)

All without rewriting content.

## 9. Mental model to keep it simple

> UI shows state
> Player causes event
> Reducer computes new state
> Repeat

If you can explain a feature in those terms, it belongs in the reducer.

## 10. One practical suggestion

Start with **one reducer**.
Do not split until it hurts.

Later, you might have:

* `narrativeReducer`
* `combatReducer`
* `worldReducer`

But only after v1 works.

⏺ I'll review this reducer-based architecture proposal against your current codebase and roadmap.

My Recommendation: Not Right Now

Here's why, with context:

1. Your Current Architecture is Already "Reducer-Adjacent"

Looking at your combatStore pattern:

// Current (Zustand)
executeTurn: () => set((state) => ({
combat: resolveCombatRound(state.combat)
}))

// Proposed (Reducer)
dispatch({ type: 'EXECUTE_TURN' })
// → reducer calls resolveCombatRound(state.combat)

You're already doing:
- ✅ Immutable state updates (set replaces state)
- ✅ Pure utility functions (resolveCombatRound returns new state)
- ✅ Centralized state (Zustand stores)
- ✅ Clear state transitions

The difference is mostly syntactic at this stage.

2. YAGNI: You Aren't Gonna Need It (Yet)

The reducer proposal justifies itself with features like:

| Feature     | In your roadmap?               |
  |-------------|--------------------------------|
| Save/load   | ❌ Not mentioned in Phases 1-6 |
| Undo/rewind | ❌ Not mentioned               |
| Analytics   | ❌ Not mentioned               |
| Replays     | ❌ Not mentioned               |
| Multiplayer | ❌ Single-player game          |

You're building a single-player narrative RPG, not a multiplayer game with complex state synchronization needs.

3. Opportunity Cost

Refactoring to reducers would require:
- Rewriting all existing stores
- Updating all UI components to dispatch events
- Restructuring how randomness is handled
- Re-testing everything

Time investment: ~1-2 weeks

Phase 1 has actual features waiting:
- 4 character classes with distinct mechanics
- Complete spell system (cantrips, spell slots, spell saves)
- 6 enemy types
- Critical hits, initiative, saving throws, conditions

Better use of time: Implement features users will experience.

4. Current Architecture Isn't Broken

From your CLAUDE.md:

"Combat utilities are pure functions that return new state. Never mutate state directly in utils - that's the store's job."

This is solid architecture. Your code is:
- Testable (pure functions in /utils)
- Predictable (immutable updates)
- Organized (clear separation of concerns)

Don't refactor working code to solve problems you don't have.

  ---
When Reducers Would Make Sense

Reconsider reducers if you add:

1. Campaign editor - Building campaigns in a GUI would benefit from undo/redo
2. Save system with branches - "What if I chose differently?" time-travel debugging
3. Online leaderboards - Event logs for verifying runs aren't cheated
4. Modding support - Clean event system for plugins

None of these are in your current scope.

  ---
What You Should Adopt From This Proposal

The proposal has good ideas you can use incrementally without a full refactor:

✅ Event Logging (Add Now)

Add this to your existing stores:

// In combatStore
const useCombatStore = create<CombatStore>((set) => ({
combat: null,
eventLog: [], // NEW: Track what happened

    executeTurn: () => set((state) => {
      const newCombat = resolveCombatRound(state.combat);
      return {
        combat: newCombat,
        eventLog: [...state.eventLog, { type: 'TURN_EXECUTED', turn: state.combat.turn }]
      };
    })
}))

Benefits:
- Analytics (which enemies kill players most?)
- Debugging (what led to this game state?)
- Zero refactoring required

✅ Explicit State Types (Already Doing This)

Your proposed GameState type is great:

type GameState = {
mode: 'narrative' | 'combat' | 'death' | 'exit';
currentNodeId: string;
flags: Record<string, boolean>;
// ...
}

You should define this now in types/game.ts even while using Zustand. Having a clear type helps regardless of the state management library.

❌ Full Reducer Refactor (Skip For Now)

Wait until you have a concrete need. Your Phase 1-6 roadmap doesn't require it.

  ---
My Advice

Short term (Phase 1-3):
1. ✅ Keep Zustand - it's working fine
2. ✅ Add event logging to stores for analytics/debugging
3. ✅ Define a top-level GameState type for clarity
4. ✅ Continue with pure functions in /utils (already doing this)

Long term (Phase 4+):
- Revisit reducers if you add features that benefit from event sourcing
- The migration path from "Zustand with event logs" → "full reducer" is straightforward
- Your current architecture won't paint you into a corner

  ---
Final Thought

The reducer proposal is technically sound and well-designed. But architecture decisions should serve actual requirements, not theoretical elegance.

Right now, your requirements are:
- ✅ Build 4 character classes
- ✅ Implement spell system
- ✅ Add combat variety
- ✅ Deliver Phase 1

Your current architecture supports all of this. A reducer refactor would delay all of this.

Ship features first. Refactor if/when you hit actual limitations.