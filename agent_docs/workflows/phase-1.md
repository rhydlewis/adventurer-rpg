# Phase 1 Workflow

## Phase 1 Overview

The Phase 1 plan (`/docs/plans/archive/2025-12-09-phase-1.md`) breaks work into sequential steps:

**Step 1: Class Differentiation** (5 phases)
- 1.1: Character creation & point buy
- 1.2: Initiative, crits, fumbles, saves, action selection
- 1.3: Class-specific abilities (Second Wind, Sneak Attack, etc.)
- 1.4: Conditions system (8 conditions with duration tracking)
- 1.5: Rest system (short/long rest)

**Step 2: Spell System**
- Spell infrastructure, casting, saves, cantrips, spell slots

**Step 3: Combat Variety**
- 6 enemy types (Goblin, Skeleton, Wolf, Cultist, Spider, Wraith)

## Development Approach

**Build incrementally**. Each phase should leave the game in a playable state (even if incomplete). Always extend, never rewrite.

## Batch Execution Pattern

When implementing phases from the plan, work in **batches of 3 tasks** with commits after each batch:

### Batch Workflow

1. **Execute batch** - Complete 3 tasks (or remaining tasks if <3 left)
2. **Verify batch** - Run all tests for the batch, ensure they pass
3. **Fix build issues** - **Important:** Always run and fix issues reported by `npm run build` & `npm run lint` before the next stage
4. **Report for review** - Show what was implemented and test results
5. **Commit batch** - After user approval, commit with descriptive message
6. **Repeat** - Continue with next batch

### Commit Message Format

```bash
# Batch commits during a phase:
"Add Phase 1.2 Batch 1: initiative, criticals, saving throws utilities"
"Add Phase 1.2 Batch 2: integrate systems into combat store"

# Final commit at end of phase (if needed):
"Complete Phase 1.2: Enhanced Combat Foundation"
```

### Benefits

- Smaller, focused commits that are easy to review and revert
- Clear progress tracking through git history
- Each commit is independently tested and verified
- Rollback points if issues are discovered later

## Before Making Changes

1. **Read the design spec** in `/docs/plans/` - understand the vision
2. **Check Phase 1 plan** - see if it's already designed
3. **Review existing types** - understand current data structures
4. **Write tests first** - especially for game mechanics in `/utils`
5. **Update incrementally** - extend existing files where possible

## After Making Changes

1. **Run tests** - `npm test` must pass
2. **Run lint** - `npm run lint` should be clean
3. **Run build** - `npm run build` must succeed
4. **Test in browser** - `npm run dev` and play through the feature
5. **Test on mobile** - `npm run build && npx cap sync` if UI changes
6. **Update documentation** - if you changed architecture or added new patterns

## Working with Tests

- **Test game mechanics**, not UI
- **Test edge cases** - zero HP, max stats, critical hits, save failures
- **Use descriptive test names** - `"rollAttack should add BAB and ability modifier to d20 result"`
- **Mock dice rolls when needed** - for deterministic tests of combat logic
- **Write tests in `/src/__tests__/`** following the same directory structure as the source

## Reference Files

For detailed Phase 1 task breakdown and acceptance criteria, always reference the authoritative plan document at `/docs/plans/archive/2025-12-09-phase-1.md`.
