# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adventurer RPG is a single-player narrative RPG with streamlined d20 mechanics, built for web and mobile (iOS/Android via Capacitor). The project is currently in **Phase 0 (Walking Skeleton Complete)** with a minimal combat system that proves the full stack works end-to-end.

**Current Status:** Basic d20 combat (Level 1 Fighter vs Goblin) is working with turn-based attacks, damage rolls, and combat logs. The walking skeleton validates the tech stack (React + TypeScript + Vite + Capacitor + Zustand) but lacks class differentiation, spells, narrative, and progression systems.

**Next Phase:** Phase 1 will implement all 4 character classes (Fighter/Rogue/Wizard/Cleric) with distinct mechanics, a complete spell system, and combat variety with 6 enemy types.

## Commands

### Development
```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with UI
npm test:ui
```

Testing framework: Vitest with jsdom environment. Tests are located in `src/__tests__/` following the same directory structure as the source.

### Mobile Development
```bash
# Build web app and sync to native platforms
npm run build && npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio (Android)
npx cap open android
```

**Important:** Always run `npm run build` before `npx cap sync` to ensure native platforms have the latest web assets.

## Architecture

### Core Philosophy

The project uses **separation of data and logic** with strict TypeScript types throughout:

- **`/types`** - TypeScript type definitions (the contract)
- **`/utils`** - Pure functions for game mechanics (the logic)
- **`/data`** - Game content definitions (the content)
- **`/stores`** - Zustand state management (the state)
- **`/screens`** - React components for full-screen views (the UI)

### Type System Architecture

The type system is built in layers to ensure consistency:

1. **`types/attributes.ts`** - Core 6 attributes (STR, DEX, CON, INT, WIS, CHA)
2. **`types/dice.ts`** - Dice roll results and notation
3. **`types/character.ts`** - Character structure with attributes, class, HP, AC, BAB, saves
4. **`types/combat.ts`** - Combat state, creatures (same as Character for now), and combat log

**Key Type Pattern:**
```typescript
// Characters have:
interface Character {
  attributes: Attributes;  // Base stats
  // Derived stats (calculated from attributes):
  ac: number;    // Armor Class
  bab: number;   // Base Attack Bonus
  saves: { fortitude, reflex, will };
}
```

All derived stats (AC, HP, saves, attack bonuses) are calculated from attributes + class + level. Never store these separately without a clear source of truth.

### Combat System Flow

```
1. combatStore.startCombat(player, enemy)
   ↓
2. Creates CombatState with turn=1, log=[], winner=null
   ↓
3. User clicks "Attack" → combatStore.executeTurn()
   ↓
4. utils/combat.ts::resolveCombatRound()
   ├─→ performAttack(player, enemy)
   │   ├─→ rollAttack(bab, abilityMod) from utils/dice.ts
   │   ├─→ Compare to defender.ac
   │   └─→ If hit: rollDamage('1d8', mod)
   ├─→ Update enemy HP, check for defeat
   ├─→ performAttack(enemy, player)
   └─→ Update player HP, check for defeat
   ↓
5. Returns new CombatState with updated HP, log entries, winner
```

**Critical Pattern:** Combat utilities are pure functions that return new state. Never mutate state directly in utils - that's the store's job.

### Dice System

Uses `@dice-roller/rpg-dice-roller` library for advanced dice notation:

```typescript
// Current usage:
roll('1d20+5')  // Attack roll
roll('1d8+3')   // Damage roll

// Future-proofed for Phase 1+:
roll('2d20kh1+5')  // Advantage (keep highest)
roll('2d20kl1+5')  // Disadvantage (keep lowest)
roll('1d6!')       // Exploding dice for crits
```

**Wrapper Pattern:** All dice rolling goes through `utils/dice.ts` wrappers (`rollAttack`, `rollDamage`, etc.) which return structured objects with detailed output for combat logs. Never call the library directly from UI code.

### State Management (Zustand)

Stores are simple and focused:

- **`combatStore`** - Manages active combat state (turn, HP, log, winner)

**Pattern:**
```typescript
const useCombatStore = create<CombatStore>((set) => ({
  combat: null,
  executeTurn: () => set((state) => ({
    combat: resolveCombatRound(state.combat)
  }))
}))
```

State updates are **immutable** - utilities return new objects, stores replace state.

### File Organization

```
src/
├── types/           # Type definitions (*.ts only, no logic)
├── utils/           # Game mechanics (pure functions, fully tested)
├── data/            # Game content (classes, spells, enemies) [Phase 1+]
├── stores/          # Zustand stores (state management)
├── screens/         # Full-screen React components
├── __tests__/       # Vitest tests (mirrors src/ structure)
└── App.tsx          # Root component, minimal routing logic
```

## Design Documents

**Critical references** when implementing features:

- **`/docs/specs/2025-12-08-design-spec.md`** - Complete design vision, all 6 phases planned
- **`/docs/plans/2025-12-09-phase-1.md`** - Detailed Phase 1 implementation plan (next work)
- **`/docs/specs/2025-12-08-questions-and-answers.md`** - Design decisions and rationale
- **`/docs/campaigns/2025-12-08-campaign-1.md`** - First campaign narrative

**Before implementing any feature, check the Phase 1 plan for:**
- Data structures to use
- File organization
- Calculation formulas (AC, saves, damage, etc.)
- Testing requirements

## Key Implementation Patterns

### Adding New Game Mechanics

**Example: Adding a new character class ability**

1. **Define types** in `/types` (e.g., `types/character.ts` - add to Character interface)
2. **Create calculation logic** in `/utils` (e.g., `utils/classAbilities.ts::calculateSecondWind()`)
3. **Write tests** in `/__tests__/utils/` (test the calculation)
4. **Add to data** in `/data` (e.g., `data/classes.ts` - define ability parameters)
5. **Wire to store** in `/stores` (e.g., `combatStore.useAbility()`)
6. **Update UI** in `/screens` (show the button, display the effect)

### Extending Combat System

When adding new combat mechanics (crits, saves, conditions):

1. **Extend `CombatState` type** with new fields (e.g., `activeConditions: Condition[]`)
2. **Add calculation utilities** (`utils/savingThrows.ts`, `utils/conditions.ts`)
3. **Modify `resolveCombatRound()`** to incorporate new mechanics
4. **Update combat log messages** to show new information
5. **Add UI indicators** (icons, badges, color coding)

**Never break the walking skeleton** - new mechanics should be additive, not replace existing functionality.

### Spell System (Phase 1 Step 2)

Spell architecture (from Phase 1 plan):

```typescript
// types/spell.ts
interface Spell {
  name: string;
  level: number;  // 0 = cantrip
  school: string;
  castingTime: 'standard' | 'immediate';
  target: 'self' | 'single' | 'area';
  effect: SpellEffect;  // damage, heal, condition, buff
  savingThrow?: { type: 'fort' | 'reflex' | 'will', dc: number };
}

// utils/spellcasting.ts
function castSpell(caster: Character, spell: Spell, target: Character) {
  // 1. Check spell slots
  // 2. Calculate DC (10 + spell.level + abilityMod)
  // 3. Roll saves if needed
  // 4. Apply effects
  // 5. Consume spell slot
  // 6. Return new state + log messages
}
```

## Mobile Deployment (Capacitor)

### Native Folder Structure

```
ios/                 # iOS project (committed to git)
├── App/
│   ├── App/
│   │   ├── public/      # Synced from dist/ (IGNORED in git)
│   │   └── capacitor.config.json
│   └── Podfile

android/             # Android project (committed to git)
├── app/
│   └── src/
│       └── main/
│           └── assets/  # Synced from dist/ (IGNORED in git)
```

**Key Points:**
- Native projects (`ios/`, `android/`) are committed to git (contain customizable config)
- Generated web assets (`ios/App/App/public/`, `android/app/src/main/assets/`) are gitignored
- Always build (`npm run build`) before syncing (`npx cap sync`)

### Debugging Mobile Issues

1. **Web debugging:** Test in browser first (`npm run dev`)
2. **iOS Safari debugging:** Open Safari → Develop → [Device] → localhost
3. **Android Chrome debugging:** chrome://inspect on desktop Chrome
4. **Console logs:** Use `console.log()` - visible in platform dev tools

## Common Patterns & Conventions

### TypeScript Strict Mode

- **Strict null checks enabled** - always handle `null`/`undefined` explicitly
- **No implicit `any`** - all types must be explicit
- **Prefer interfaces over types** for object shapes (established pattern in codebase)

### Testing Philosophy

- **Test game mechanics, not UI** - focus on `/utils` functions
- **Test edge cases** - zero HP, max stats, critical hits, save failures
- **Use descriptive test names** - `"rollAttack should add BAB and ability modifier to d20 result"`
- **Mock dice rolls when needed** - for deterministic tests of combat logic

### Combat Log Messages

Follow established format for consistency:

```typescript
// Attack roll format:
`1d20+${bonus}: [${d20Result}]+${bonus} = ${total} vs AC ${ac} - ${hit ? 'HIT!' : 'MISS!'}`

// Damage format:
`1d8+${mod}: [${roll}]+${mod} = ${total} damage`

// System messages:
`${character.name} has been defeated!`
```

Color coding by actor: player (blue), enemy (red), system (gray).

## Deployment

### Web (Vercel)

Auto-deploys on push to `main` branch. No manual steps required.

### App Stores

Not yet implemented. See:
- iOS: [Capacitor iOS Deployment Guide](https://capacitorjs.com/docs/ios)
- Android: [Capacitor Android Deployment Guide](https://capacitorjs.com/docs/android)

## Development Workflow

### Working on Phase 1

The Phase 1 plan (`/docs/plans/2025-12-09-phase-1.md`) breaks work into sequential steps:

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

**Approach:** Build incrementally. Each phase should leave the game in a playable state (even if incomplete). Always extend, never rewrite. Offer to write unit tests where appropriate.

### Batch Execution and Commits

When implementing phases from the plan, work in **batches of 3 tasks** with commits after each batch:

1. **Execute batch** - Complete 3 tasks (or remaining tasks if <3 left)
2. **Verify batch** - Run all tests for the batch, ensure they pass
3. **Report for review** - Show what was implemented and test results
4. **Commit batch** - After user approval, commit with descriptive message
5. **Repeat** - Continue with next batch

**Commit Message Format:**
```bash
# Batch commits during a phase:
"Add Phase 1.2 Batch 1: initiative, criticals, saving throws utilities"
"Add Phase 1.2 Batch 2: integrate systems into combat store"

# Final commit at end of phase (if needed):
"Complete Phase 1.2: Enhanced Combat Foundation"
```

**Benefits:**
- Smaller, focused commits that are easy to review and revert
- Clear progress tracking through git history
- Each commit is independently tested and verified
- Rollback points if issues are discovered later

### Before Making Changes

1. **Read the design spec** - understand the vision
2. **Check Phase 1 plan** - see if it's already designed
3. **Review existing types** - understand current data structures
4. **Write tests first** - especially for game mechanics in `/utils`, data types in `/data` and storage mechanisms in `/stores`
5. **Update incrementally** - extend existing files where possible

### After Making Changes

1. **Run tests** - `npm test` must pass
2. **Run lint** - `npm run lint` should be clean
3. **Test in browser** - `npm run dev` and play through the feature
4. **Test on mobile** - `npm run build && npx cap sync` if UI changes
5. **Update this file** - if you changed architecture or added new patterns
