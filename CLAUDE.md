# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**WHAT**: Adventurer RPG is a single-player narrative RPG with streamlined d20 mechanics, built for web and mobile (iOS/Android via Capacitor).

**WHY**: Create an accessible, story-driven RPG experience that works seamlessly across platforms.

**CURRENT STATUS**: Phase 1 complete (4 character classes, spell system, combat mechanics). Phase 2 in progress: narrative campaign and character customization.

## Essential Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm test             # Run all tests
npm run lint         # Lint code

# Mobile (always build before syncing)
npm run build && npx cap sync
npx cap open ios     # Open in Xcode
npx cap open android # Open in Android Studio
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **State**: Zustand stores
- **Mobile**: Capacitor (iOS/Android)
- **Testing**: Vitest with jsdom
- **Dice**: @dice-roller/rpg-dice-roller library

## Core Architecture

**Separation of data and logic** with strict TypeScript:
- `/types` - TypeScript definitions (the contract)
- `/utils` - Pure functions for game mechanics (the logic)
- `/data` - Game content definitions (the content)
- `/stores` - Zustand state management (the state)
- `/components` - Reusable UI components (the building blocks)
- `/screens` - React components for full-screen views (the UI)

**Key principle**: Utilities are pure functions that return new state. Never mutate state directly in utils - that's the store's job. All state updates are immutable.

## Testing Philosophy

**CRITICAL: Always test BEHAVIOR, not implementation details**

- Test game mechanics in `/utils`, not UI
- Test edge cases (zero HP, max stats, critical hits)
- Use descriptive test names
- Mock dice rolls for deterministic tests
- **MANDATORY**: Before writing ANY test, read `agent_docs/development/testing-guide.md`
- **Use TodoWrite** when writing tests for complex features to follow the checklist
- **Red Flag**: If your test checks flags/internal state instead of observable outcomes (HP changes, attacks missing, log messages), it's wrong

## Development Workflow

1. **Before making changes**: Check if relevant documentation exists in `agent_docs/`
2. **Read relevant docs**: Architecture, systems, or workflow guides as needed
3. **Write tests first**: Especially for game mechanics
   - **MANDATORY**: Follow `agent_docs/development/testing-guide.md`
   - Use the behavioral test template from the guide
   - Create TodoWrite todos for test checklist items
4. **Extend, don't rewrite**: Never break the walking skeleton
5. **Verify changes**: Run `npm test` and `npm run lint` before committing

## Working in Batches

When implementing complex features, work in **small, focused batches**:
1. Execute batch (complete 2-3 related tasks)
2. Verify batch (run tests, fix `npm run build` and `npm run lint` errors)
3. Report for review
4. Commit batch after approval
5. Repeat with next batch

This approach provides clear progress tracking, easier rollback points, and independently tested commits.

## Documentation

Detailed documentation is in `agent_docs/`. **Before starting work, read relevant files**:

**Architecture** (system deep dives):
- `architecture/combat-system.md` - Combat flow, dice mechanics, spells, extending combat
- `architecture/save-system.md` - Save/load, migrations, Capacitor Preferences
- `architecture/state-management.md` - Zustand patterns, pure functions

**UI/UX**:
- `ui/guidelines.md` - Semantic typography, component patterns, mobile
- `ui/component-patterns.md` - Reusable components, usage patterns, design system

**Workflows**:
- `workflows/phase-1.md` - Phase 1 workflow (archived - see /docs/plans/archive/)

**Development**:
- `development/testing-guide.md` - Testing philosophy, patterns, mocking
- `development/git-workflow.md` - Branching, commits, operations
- `development/mobile-deployment.md` - Capacitor workflow, debugging

Use `view` to read these before working on related features.
