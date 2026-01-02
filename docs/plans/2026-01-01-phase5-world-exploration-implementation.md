# Phase 5: World & Exploration System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add overworld world map, location-based navigation, and exploration system to transform the game from story-only into a world-exploration RPG.

**Architecture:** Separate overworld layer above the story system. World map screen shows unlocked locations. Location hub screens provide context-sensitive menus (town/wilderness/dungeon). Story nodes can unlock locations and sanctuaries via effects.

**Tech Stack:** React + TypeScript + Zustand + Tailwind CSS

**Design Doc:** See `docs/plans/2026-01-01-phase5-world-exploration-design.md`

**Testing Guide:** See `agent_docs/development/testing-guide.md` - MUST follow behavioral testing approach

---

## Task 1: Add LocationType and Enhance Location Interface

**Files:**
- Modify: `src/types/narrative.ts:235-243`

**Step 1: Add LocationType and enhance Location interface**

Add after line 243 in `src/types/narrative.ts`:

```typescript
// Phase 5: Location types for context-sensitive hubs
export type LocationType = 'town' | 'wilderness' | 'dungeon';

export interface Location {
  id: string;
  name: string;
  image: string;
  ambience?: string;
  description?: string;

  // Phase 5: Location type and configuration
  locationType: LocationType;
  hasMerchant?: boolean;

  // Phase 5: Story integration
  firstVisitNodeId?: string;  // Story node for first arrival
  hubNodeId?: string;          // Optional custom hub node

  // Phase 5: Exploration
  explorationTableId?: string; // Link to encounter table
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No type errors

**Step 3: Commit**

```bash
git add src/types/narrative.ts
git commit -m "feat(types): add LocationType and enhance Location interface for Phase 5"
```

---

## Task 2: Enhance WorldState with Location Fields

**Files:**
- Modify: `src/types/narrative.ts:299-307`

**Step 1: Add Phase 5 fields to WorldState**

Modify WorldState interface in `src/types/narrative.ts` (around line 299):

```typescript
// Persistent - survives across the campaign
export interface WorldState {
  campaignId: string;
  currentActId: string;
  currentNodeId: string; // Where player is in the story
  flags: Record<string, boolean>; // Story flags
  visitedNodeIds: string[]; // All nodes ever visited
  inventory: string[]; // Item IDs

  // Phase 5: World map and location state
  currentLocationId: string | null;      // Where player is now (null = world map)
  unlockedLocations: string[];           // Available locations
  visitedLocations: string[];            // Track first visits (for hub logic)
  unlockedSanctuaries: string[];         // Dungeon safe rest points
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Type errors in stores (expected - we'll fix next)

**Step 3: Commit**

```bash
git add src/types/narrative.ts
git commit -m "feat(types): enhance WorldState with Phase 5 location fields"
```

---

## Task 3: Add New Node Effects for Locations

**Files:**
- Modify: `src/types/narrative.ts:183-204`

**Step 1: Add unlockLocation and unlockSanctuary effects**

Modify NodeEffect type in `src/types/narrative.ts` (around line 183):

```typescript
export type NodeEffect =
  | { type: 'setFlag'; flag: string; value: boolean }
  | { type: 'giveItem'; itemId: string }
  | { type: 'removeItem'; itemId: string }
  | { type: 'giveGold'; amount: number }
  | { type: 'startCombat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'heal'; amount: number | 'full' }
  | { type: 'damage'; amount: number }
  | { type: 'restoreSpellSlots' }
  | { type: 'showCompanionHint'; hint: string }
  | { type: 'levelUp'; newLevel: number; featChoices: string[] }
  | { type: 'createDefaultCharacter' }
  | { type: 'createWizard' }
  | { type: 'createCleric' }
  | { type: 'unlockLocation'; locationId: string }  // Phase 5
  | { type: 'unlockSanctuary'; locationId: string } // Phase 5
  | {
      type: 'startPuzzle';
      puzzleType: PuzzleType;
      config?: PuzzleConfig;
      successNodeId: string;
      failureNodeId: string;
    };
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Type errors in narrativeLogic.ts (expected - we'll handle effects later)

**Step 3: Commit**

```bash
git add src/types/narrative.ts
git commit -m "feat(types): add unlockLocation and unlockSanctuary node effects"
```

---

## Task 4: Add exitToHub Choice Outcome

**Files:**
- Modify: `src/types/narrative.ts:134-156`

**Step 1: Add exitToHub outcome type**

Modify ChoiceOutcome type in `src/types/narrative.ts` (around line 134):

```typescript
export type ChoiceOutcome =
  | { type: 'goto'; nodeId: string }
  | { type: 'loop' } // Return to current node (for questions)
  | { type: 'exit' } // End conversation, return to exploration
  | { type: 'exitToHub' }  // Phase 5: Return to current location hub
  | {
      type: 'check';
      skill: SkillName;
      dc: number;
      success: ChoiceOutcome;
      failure: ChoiceOutcome;
    }
  | { type: 'explore'; tableId: string; onceOnly: boolean }
  | { type: 'rest' } // Open rest screen with camp event system
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number> }
  | { type: 'characterCreation'; phase: 1 | 2; nextNodeId: string }
  | {
      type: 'puzzle';
      puzzleType: PuzzleType;
      config?: PuzzleConfig;
      successNodeId: string;
      failureNodeId: string;
    };
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Type errors in narrativeLogic.ts (expected - we'll handle outcome later)

**Step 3: Commit**

```bash
git add src/types/narrative.ts
git commit -m "feat(types): add exitToHub choice outcome for Phase 5"
```

---

## Task 5: Enhance Campaign Type with Location Fields

**Files:**
- Modify: `src/types/narrative.ts:258-266`

**Step 1: Add location fields to Campaign interface**

Modify Campaign interface in `src/types/narrative.ts` (around line 258):

```typescript
export interface Campaign {
  id: string;
  title: string; // "The Spire of the Lich King"
  description: string;
  companionName: string; // "The Elder"
  companionDescription: string; // For UI display
  acts: Act[];

  // Phase 5: World map configuration
  locations: Location[];                  // All locations in campaign
  startingLocationId: string;             // Where player begins
  initialUnlockedLocations: string[];     // Available at campaign start
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Type errors in campaign files (expected - we'll update campaigns later)

**Step 3: Commit**

```bash
git add src/types/narrative.ts
git commit -m "feat(types): enhance Campaign with Phase 5 location fields"
```

---

## Task 6: Create World Map Utility Functions - Tests First

**Files:**
- Create: `src/__tests__/utils/worldMap.test.ts`
- Create: `src/utils/worldMap.ts`

**Step 1: Write failing tests for world map utilities**

Create `src/__tests__/utils/worldMap.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  canTravelToLocation,
  unlockLocation,
  unlockSanctuary,
  getLocationHubOptions,
} from '@/utils/worldMap';
import type { WorldState, Location, LocationType } from '@/types';

describe('worldMap utilities', () => {
  describe('canTravelToLocation', () => {
    it('should return true for unlocked location', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford', 'oakhaven'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      expect(canTravelToLocation(worldState, 'oakhaven')).toBe(true);
    });

    it('should return false for locked location', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      expect(canTravelToLocation(worldState, 'tower')).toBe(false);
    });
  });

  describe('unlockLocation', () => {
    it('should add location to unlockedLocations array', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      const result = unlockLocation(worldState, 'oakhaven');

      expect(result.unlockedLocations).toContain('oakhaven');
      expect(result.unlockedLocations).toHaveLength(2);
    });

    it('should not duplicate if location already unlocked', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford', 'oakhaven'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      const result = unlockLocation(worldState, 'oakhaven');

      expect(result.unlockedLocations).toHaveLength(2);
    });

    it('should not mutate original world state', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'ashford',
        unlockedLocations: ['ashford'],
        visitedLocations: ['ashford'],
        unlockedSanctuaries: [],
      };

      const originalLength = worldState.unlockedLocations.length;
      unlockLocation(worldState, 'oakhaven');

      expect(worldState.unlockedLocations).toHaveLength(originalLength);
    });
  });

  describe('unlockSanctuary', () => {
    it('should add sanctuary to unlockedSanctuaries array', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'tower-interior',
        unlockedLocations: ['ashford', 'tower-interior'],
        visitedLocations: ['ashford', 'tower-interior'],
        unlockedSanctuaries: [],
      };

      const result = unlockSanctuary(worldState, 'tower-interior');

      expect(result.unlockedSanctuaries).toContain('tower-interior');
      expect(result.unlockedSanctuaries).toHaveLength(1);
    });

    it('should not duplicate if sanctuary already unlocked', () => {
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'tower-interior',
        unlockedLocations: ['ashford', 'tower-interior'],
        visitedLocations: ['ashford', 'tower-interior'],
        unlockedSanctuaries: ['tower-interior'],
      };

      const result = unlockSanctuary(worldState, 'tower-interior');

      expect(result.unlockedSanctuaries).toHaveLength(1);
    });
  });

  describe('getLocationHubOptions', () => {
    const createTestLocation = (locationType: LocationType, overrides = {}): Location => ({
      id: 'test-location',
      name: 'Test Location',
      image: 'test.png',
      locationType,
      ...overrides,
    });

    it('should return town options for town location with merchant', () => {
      const location = createTestLocation('town', { hasMerchant: true });
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'test-location',
        unlockedLocations: ['test-location'],
        visitedLocations: ['test-location'],
        unlockedSanctuaries: [],
      };

      const options = getLocationHubOptions(location, worldState);

      expect(options).toContain('continue-story');
      expect(options).toContain('visit-merchant');
      expect(options).toContain('rest-inn');
      expect(options).toContain('leave-location');
    });

    it('should return wilderness options for wilderness location', () => {
      const location = createTestLocation('wilderness', { explorationTableId: 'forest-encounters' });
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'test-location',
        unlockedLocations: ['test-location'],
        visitedLocations: ['test-location'],
        unlockedSanctuaries: [],
      };

      const options = getLocationHubOptions(location, worldState);

      expect(options).toContain('continue-story');
      expect(options).toContain('explore-area');
      expect(options).toContain('make-camp');
      expect(options).toContain('leave-location');
    });

    it('should return dungeon options without sanctuary initially', () => {
      const location = createTestLocation('dungeon', { explorationTableId: 'dungeon-encounters' });
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'test-location',
        unlockedLocations: ['test-location'],
        visitedLocations: ['test-location'],
        unlockedSanctuaries: [],
      };

      const options = getLocationHubOptions(location, worldState);

      expect(options).toContain('continue-story');
      expect(options).toContain('explore-area');
      expect(options).not.toContain('rest-sanctuary');
      expect(options).toContain('leave-location');
    });

    it('should include sanctuary rest option when dungeon sanctuary is unlocked', () => {
      const location = createTestLocation('dungeon', { explorationTableId: 'dungeon-encounters' });
      const worldState: WorldState = {
        campaignId: 'test',
        currentActId: 'act-1',
        currentNodeId: 'node-1',
        flags: {},
        visitedNodeIds: [],
        inventory: [],
        currentLocationId: 'test-location',
        unlockedLocations: ['test-location'],
        visitedLocations: ['test-location'],
        unlockedSanctuaries: ['test-location'],
      };

      const options = getLocationHubOptions(location, worldState);

      expect(options).toContain('rest-sanctuary');
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test worldMap.test.ts`
Expected: FAIL - "Cannot find module '@/utils/worldMap'"

**Step 3: Commit failing tests**

```bash
git add src/__tests__/utils/worldMap.test.ts
git commit -m "test(worldMap): add failing tests for world map utilities (TDD)"
```

---

## Task 7: Implement World Map Utility Functions

**Files:**
- Create: `src/utils/worldMap.ts`

**Step 1: Create world map utility functions**

Create `src/utils/worldMap.ts`:

```typescript
import type { WorldState, Location } from '../types';

/**
 * Check if player can travel to a location
 */
export function canTravelToLocation(worldState: WorldState, locationId: string): boolean {
  return worldState.unlockedLocations.includes(locationId);
}

/**
 * Unlock a new location (immutable)
 */
export function unlockLocation(worldState: WorldState, locationId: string): WorldState {
  // Don't duplicate if already unlocked
  if (worldState.unlockedLocations.includes(locationId)) {
    return worldState;
  }

  return {
    ...worldState,
    unlockedLocations: [...worldState.unlockedLocations, locationId],
  };
}

/**
 * Unlock a sanctuary in a dungeon location (immutable)
 */
export function unlockSanctuary(worldState: WorldState, locationId: string): WorldState {
  // Don't duplicate if already unlocked
  if (worldState.unlockedSanctuaries.includes(locationId)) {
    return worldState;
  }

  return {
    ...worldState,
    unlockedSanctuaries: [...worldState.unlockedSanctuaries, locationId],
  };
}

/**
 * Hub option IDs for LocationHubScreen
 */
export type HubOption =
  | 'continue-story'
  | 'visit-merchant'
  | 'rest-inn'
  | 'explore-area'
  | 'make-camp'
  | 'rest-sanctuary'
  | 'leave-location';

/**
 * Get available hub options based on location type and state
 */
export function getLocationHubOptions(location: Location, worldState: WorldState): HubOption[] {
  const options: HubOption[] = [];

  // All locations have story option
  options.push('continue-story');

  // Type-specific options
  switch (location.locationType) {
    case 'town':
      if (location.hasMerchant) {
        options.push('visit-merchant');
      }
      options.push('rest-inn');
      break;

    case 'wilderness':
      if (location.explorationTableId) {
        options.push('explore-area');
      }
      options.push('make-camp');
      break;

    case 'dungeon':
      if (location.explorationTableId) {
        options.push('explore-area');
      }
      // Sanctuary only if unlocked
      if (worldState.unlockedSanctuaries.includes(location.id)) {
        options.push('rest-sanctuary');
      }
      break;
  }

  // All locations can be exited
  options.push('leave-location');

  return options;
}

/**
 * Check if this is the first visit to a location
 */
export function isFirstVisit(worldState: WorldState, locationId: string): boolean {
  return !worldState.visitedLocations.includes(locationId);
}

/**
 * Mark location as visited (immutable)
 */
export function markLocationVisited(worldState: WorldState, locationId: string): WorldState {
  // Don't duplicate if already visited
  if (worldState.visitedLocations.includes(locationId)) {
    return worldState;
  }

  return {
    ...worldState,
    visitedLocations: [...worldState.visitedLocations, locationId],
  };
}
```

**Step 2: Run tests to verify they pass**

Run: `npm test worldMap.test.ts`
Expected: PASS - All tests green

**Step 3: Commit implementation**

```bash
git add src/utils/worldMap.ts
git commit -m "feat(worldMap): implement world map utility functions (TDD)"
```

---

## Task 8: Update Narrative Logic to Handle New Effects

**Files:**
- Modify: `src/utils/narrativeLogic.ts`
- Test: `src/__tests__/utils/narrativeLogic.test.ts`

**Step 1: Add test for unlockLocation effect**

Add to `src/__tests__/utils/narrativeLogic.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { processNodeEffects } from '@/utils/narrativeLogic';
import type { NodeEffect, WorldState } from '@/types';

describe('processNodeEffects - Phase 5', () => {
  const createTestWorldState = (): WorldState => ({
    campaignId: 'test',
    currentActId: 'act-1',
    currentNodeId: 'node-1',
    flags: {},
    visitedNodeIds: [],
    inventory: [],
    currentLocationId: 'ashford',
    unlockedLocations: ['ashford'],
    visitedLocations: ['ashford'],
    unlockedSanctuaries: [],
  });

  it('should unlock location when processing unlockLocation effect', () => {
    const effects: NodeEffect[] = [
      { type: 'unlockLocation', locationId: 'oakhaven' },
    ];
    const worldState = createTestWorldState();

    const result = processNodeEffects(effects, worldState);

    expect(result.worldUpdates.unlockedLocations).toContain('oakhaven');
  });

  it('should unlock sanctuary when processing unlockSanctuary effect', () => {
    const effects: NodeEffect[] = [
      { type: 'unlockSanctuary', locationId: 'tower-interior' },
    ];
    const worldState = createTestWorldState();

    const result = processNodeEffects(effects, worldState);

    expect(result.worldUpdates.unlockedSanctuaries).toContain('tower-interior');
  });

  it('should add log entry when unlocking location', () => {
    const effects: NodeEffect[] = [
      { type: 'unlockLocation', locationId: 'oakhaven' },
    ];
    const worldState = createTestWorldState();

    const result = processNodeEffects(effects, worldState);

    expect(result.logEntries.some(entry =>
      entry.type === 'effect' && entry.message.includes('Oakhaven')
    )).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test narrativeLogic.test.ts`
Expected: FAIL - "unlockLocation effect not handled"

**Step 3: Update processNodeEffects to handle new effects**

Modify `src/utils/narrativeLogic.ts` in the `processNodeEffects` function:

Find the switch statement and add these cases:

```typescript
case 'unlockLocation': {
  const updated = unlockLocation(currentWorld, effect.locationId);
  currentWorld = updated;
  logEntries.push({
    type: 'effect',
    message: `New location unlocked: ${effect.locationId}`,
  });
  break;
}

case 'unlockSanctuary': {
  const updated = unlockSanctuary(currentWorld, effect.locationId);
  currentWorld = updated;
  logEntries.push({
    type: 'effect',
    message: `Safe sanctuary discovered in ${effect.locationId}`,
  });
  break;
}
```

And add imports at the top:

```typescript
import { unlockLocation, unlockSanctuary } from './worldMap';
```

**Step 4: Run test to verify it passes**

Run: `npm test narrativeLogic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/narrativeLogic.ts src/__tests__/utils/narrativeLogic.test.ts
git commit -m "feat(narrative): handle unlockLocation and unlockSanctuary effects"
```

---

## Task 9: Update Narrative Logic to Handle exitToHub Outcome

**Files:**
- Modify: `src/utils/narrativeLogic.ts`
- Test: `src/__tests__/utils/narrativeLogic.test.ts`

**Step 1: Add test for exitToHub outcome**

Add to `src/__tests__/utils/narrativeLogic.test.ts`:

```typescript
it('should return special marker for exitToHub outcome', () => {
  const outcome: ChoiceOutcome = { type: 'exitToHub' };
  const player = createTestCharacter();
  const currentNodeId = 'test-node';

  const result = resolveOutcome(outcome, player, currentNodeId);

  // exitToHub should set a special nextNodeId that LocationHub can detect
  expect(result.nextNodeId).toBe('__EXIT_TO_HUB__');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test narrativeLogic.test.ts`
Expected: FAIL

**Step 3: Update resolveOutcome to handle exitToHub**

Modify `src/utils/narrativeLogic.ts` in the `resolveOutcome` function:

Add this case to the switch statement:

```typescript
case 'exitToHub':
  // Special marker for LocationHubScreen to detect
  return {
    nextNodeId: '__EXIT_TO_HUB__',
    logEntries: [],
    worldUpdates: {},
  };
```

**Step 4: Run test to verify it passes**

Run: `npm test narrativeLogic.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/narrativeLogic.ts src/__tests__/utils/narrativeLogic.test.ts
git commit -m "feat(narrative): handle exitToHub choice outcome"
```

---

## Task 10: Fix Narrative Store for New WorldState Fields

**Files:**
- Modify: `src/stores/narrativeStore.ts`

**Step 1: Initialize new WorldState fields in startCampaign**

Modify `startCampaign` method in `src/stores/narrativeStore.ts` (around line 120):

```typescript
startCampaign: () => {
  const { campaign } = get();
  if (!campaign || campaign.acts.length === 0) {
    throw new Error('No campaign loaded or campaign has no acts');
  }

  const firstAct = campaign.acts[0];

  // Initialize world state
  const world: WorldState = {
    campaignId: campaign.id,
    currentActId: firstAct.id,
    currentNodeId: firstAct.startingNodeId,
    flags: {},
    visitedNodeIds: [],
    inventory: [],
    // Phase 5: Location state
    currentLocationId: campaign.startingLocationId || null,
    unlockedLocations: campaign.initialUnlockedLocations || [],
    visitedLocations: [],
    unlockedSanctuaries: [],
  };

  // ... rest of function
},
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Type errors in campaign files (expected - campaigns missing new fields)

**Step 3: Commit**

```bash
git add src/stores/narrativeStore.ts
git commit -m "fix(store): initialize Phase 5 location fields in narrativeStore"
```

---

## Task 11: Update Locations Data with Phase 5 Fields

**NOTE: We made locationType optional temporarily in Task 1**. We need to make it required in this Task.

**Files:**
- Modify: `src/data/locations.ts`

**Step 1: Add Phase 5 fields to all locations**

Update `src/data/locations.ts`:

```typescript
import type { Location } from '../types';

export const LOCATIONS: Record<string, Location> = {
  // Phase 5: Campaign 1 Locations
  'ashford': {
    id: 'ashford',
    name: 'Ashford',
    image: 'card_location_exterior_00015.png',
    ambience: 'The smell of smoke still lingers in the air from recent fires',
    description: 'A small village on the edge of civilization, recently attacked by bandits',
    locationType: 'town',
    hasMerchant: true,
    firstVisitNodeId: 'ashford-gates', // Tutorial start
  },
  'blackwood-forest': {
    id: 'blackwood-forest',
    name: 'Blackwood Forest',
    image: 'card_location_exterior_00035.png',
    ambience: 'Ancient trees loom overhead, their branches filtering the dappled sunlight',
    description: 'A dense woodland with winding game trails and shadowed paths',
    locationType: 'wilderness',
    explorationTableId: 'blackwood-encounters',
    firstVisitNodeId: 'blackwood-entrance',
  },
  'oakhaven': {
    id: 'oakhaven',
    name: 'Oakhaven',
    image: 'card_location_exterior_00020.png',
    ambience: 'Merchants call out their wares as townsfolk hurry about their business',
    description: 'The bustling heart of the region, a safe haven for travelers',
    locationType: 'town',
    hasMerchant: true,
    firstVisitNodeId: 'oakhaven-arrival',
  },
  'tower-approach': {
    id: 'tower-approach',
    name: 'Tower Approach',
    image: 'card_location_exterior_00031.png',
    ambience: 'The air grows cold and still as the ancient tower looms before you',
    description: 'A desolate courtyard surrounds the base of the corrupted tower',
    locationType: 'wilderness',
    explorationTableId: 'tower-approach-encounters',
    firstVisitNodeId: 'tower-courtyard',
  },
  'tower-interior': {
    id: 'tower-interior',
    name: 'Tower Interior',
    image: 'card_location_exterior_00014.png',
    ambience: 'Dust motes dance in shafts of sickly green light',
    description: 'The upper levels of the Lich\'s tower, filled with ancient magic and undead',
    locationType: 'dungeon',
    explorationTableId: 'tower-interior-encounters',
    firstVisitNodeId: 'tower-foyer',
  },
  'catacombs': {
    id: 'catacombs',
    name: 'Underground Catacombs',
    image: 'card_location_exterior_00046.png',
    ambience: 'Cold stone walls echo with whispers of the long dead',
    description: 'A maze of ancient burial chambers beneath the tower',
    locationType: 'dungeon',
    explorationTableId: 'catacombs-encounters',
    firstVisitNodeId: 'catacombs-entrance',
  },
  'void-sanctum': {
    id: 'void-sanctum',
    name: 'Void Sanctum',
    image: 'card_location_exterior_00031.png',
    ambience: 'Reality itself seems to flicker and warp in this ethereal chamber',
    description: 'A place between worlds, where the Lich performs his dark rituals',
    locationType: 'dungeon',
    explorationTableId: 'void-sanctum-encounters',
    firstVisitNodeId: 'void-sanctum-entrance',
  },

  // Keep existing special locations
  'rusty-tavern': {
    id: 'rusty-tavern',
    name: 'The Rusty Tavern',
    image: 'card_location_exterior_00015.png',
    ambience: 'The air is thick with pipe smoke and the smell of ale',
    description: 'A weathered establishment on the edge of town',
    locationType: 'town',
    hasMerchant: false,
  },
  'town-square': {
    id: 'town-square',
    name: 'Town Square',
    image: 'card_location_exterior_00020.png',
    ambience: 'Merchants call out their wares as townsfolk hurry about their business',
    description: 'The bustling heart of the settlement',
    locationType: 'town',
    hasMerchant: true,
  },
  'forest-path': {
    id: 'forest-path',
    name: 'Forest Path',
    image: 'card_location_exterior_00035.png',
    ambience: 'Ancient trees loom overhead, their branches filtering the sunlight',
    description: 'A winding trail through dense woodland',
    locationType: 'wilderness',
  },
  'crossroads': {
    id: 'crossroads',
    name: 'The Crossroads',
    image: 'card_location_signpost.png',
    ambience: 'The Crossroads - Where your journey begins',
    description: 'A weathered signpost marks the intersection of three paths',
    locationType: 'wilderness',
  },
  'bandit-camp': {
    id: 'bandit-camp',
    name: 'The Bandit Camp',
    image: 'card_location_camp.jpg',
    ambience: 'A crude camp in a forest clearing, abandoned and eerily quiet',
    description: 'Makeshift tents and dying embers mark this temporary refuge',
    locationType: 'wilderness',
  },
  'darkwood-forest': {
    id: 'darkwood-forest',
    name: 'Darkwood Forest',
    image: 'card_location_exterior_00015.png',
    ambience: 'Ancient trees loom overhead, their branches filtering the dappled sunlight',
    description: 'A dense woodland with winding game trails and shadowed paths',
    locationType: 'wilderness',
    explorationTableId: 'forest-exploration',
  },
  'village-market': {
    id: 'village-market',
    name: 'Village Market',
    image: 'card_location_merchant.png',
    ambience: 'The smell of fresh bread and leather mingles with the chatter of merchants',
    description: 'A bustling market square with wooden carts and weathered traders',
    locationType: 'town',
    hasMerchant: true,
  },
  'crypt': {
    id: 'crypt',
    name: 'Ancient Crypt',
    image: 'card_location_exterior_00014.png',
    ambience: 'Cold stone walls echo with whispers of the long dead',
    description: 'A forgotten tomb beneath the earth, its air thick with dust and decay',
    locationType: 'dungeon',
  },
  'character-reflection': {
    id: 'character-reflection',
    name: 'Moment of Clarity',
    image: 'card_location_exterior_00036.png',
    ambience: 'Time seems to slow as you contemplate your journey and growth',
    description: 'A space of inner reflection where potential becomes power',
    locationType: 'wilderness',
  },
  'victory-hall': {
    id: 'victory-hall',
    name: 'Hall of Triumph',
    image: 'card_location_exterior_00049.png',
    ambience: 'Golden light cascades through ancient windows, celebrating your victory',
    description: 'A sacred place where heroes are forged and legends are born',
    locationType: 'town',
  },
  'shadowed-end': {
    id: 'shadowed-end',
    name: 'The Final Darkness',
    image: 'card_location_exterior_00046.png',
    ambience: 'All light fades as consciousness slips away into endless shadow',
    description: 'The cold embrace of defeat, where all journeys end',
    locationType: 'dungeon',
  },
} as const;

export const LOCATION_IDS = Object.keys(LOCATIONS) as Array<keyof typeof LOCATIONS>;
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Should compile without location type errors

**Step 3: Commit**

```bash
git add src/data/locations.ts
git commit -m "feat(data): add Phase 5 fields to all locations"
```

---

## Task 12: Create Encounter Tables Directory and First Table

**Files:**
- Create: `src/data/encounterTables/blackwood-encounters.ts`
- Create: `src/data/encounterTables/index.ts`

**Step 1: Create blackwood-encounters table**

Create `src/data/encounterTables/blackwood-encounters.ts`:

```typescript
import type { ExplorationTable } from '../../types';

export const blackwoodEncounters: ExplorationTable = {
  id: 'blackwood-encounters',
  locationId: 'blackwood-forest',
  encounters: [
    {
      weight: 40,
      outcome: {
        type: 'combat',
        enemyId: 'wolf',
        goldReward: 10,
      },
    },
    {
      weight: 30,
      outcome: {
        type: 'combat',
        enemyId: 'bandit',
        goldReward: 30,
        itemReward: 'rusty-sword',
      },
    },
    {
      weight: 15,
      outcome: {
        type: 'treasure',
        gold: 50,
        items: ['healing-potion'],
      },
    },
    {
      weight: 10,
      outcome: {
        type: 'vignette',
        description: 'You find a moss-covered statue of a forgotten hero. The forest has long since reclaimed this place.',
        flavorOnly: true,
      },
    },
    {
      weight: 5,
      outcome: {
        type: 'nothing',
        message: 'You search the undergrowth carefully, but find nothing of interest.',
      },
    },
  ],
};
```

**Step 2: Create index file for encounter tables**

Create `src/data/encounterTables/index.ts`:

```typescript
import type { ExplorationTable } from '../../types';
import { blackwoodEncounters } from './blackwood-encounters';

export const ENCOUNTER_TABLES: Record<string, ExplorationTable> = {
  'blackwood-encounters': blackwoodEncounters,
};

export function getEncounterTable(tableId: string): ExplorationTable | null {
  return ENCOUNTER_TABLES[tableId] || null;
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

**Step 4: Commit**

```bash
git add src/data/encounterTables/
git commit -m "feat(data): create blackwood-encounters exploration table"
```

---

## Task 13: Create Remaining Encounter Tables

**Files:**
- Create: `src/data/encounterTables/tower-approach-encounters.ts`
- Create: `src/data/encounterTables/tower-interior-encounters.ts`
- Create: `src/data/encounterTables/catacombs-encounters.ts`
- Create: `src/data/encounterTables/void-sanctum-encounters.ts`
- Modify: `src/data/encounterTables/index.ts`

**Step 1: Create tower-approach encounters**

Create `src/data/encounterTables/tower-approach-encounters.ts`:

```typescript
import type { ExplorationTable } from '../../types';

export const towerApproachEncounters: ExplorationTable = {
  id: 'tower-approach-encounters',
  locationId: 'tower-approach',
  encounters: [
    {
      weight: 50,
      outcome: {
        type: 'combat',
        enemyId: 'skeleton',
        goldReward: 15,
      },
    },
    {
      weight: 25,
      outcome: {
        type: 'combat',
        enemyId: 'zombie',
        goldReward: 20,
        itemReward: 'healing-potion',
      },
    },
    {
      weight: 15,
      outcome: {
        type: 'treasure',
        gold: 40,
        items: ['antidote'],
      },
    },
    {
      weight: 10,
      outcome: {
        type: 'vignette',
        description: 'Rusted weapons and armor litter the courtyard. Many have tried to breach this tower before you.',
        flavorOnly: true,
      },
    },
  ],
};
```

**Step 2: Create tower-interior encounters**

Create `src/data/encounterTables/tower-interior-encounters.ts`:

```typescript
import type { ExplorationTable } from '../../types';

export const towerInteriorEncounters: ExplorationTable = {
  id: 'tower-interior-encounters',
  locationId: 'tower-interior',
  encounters: [
    {
      weight: 40,
      outcome: {
        type: 'combat',
        enemyId: 'skeleton',
        goldReward: 25,
      },
    },
    {
      weight: 30,
      outcome: {
        type: 'combat',
        enemyId: 'wraith',
        goldReward: 50,
        itemReward: 'magic-scroll',
      },
    },
    {
      weight: 20,
      outcome: {
        type: 'treasure',
        gold: 75,
        items: ['healing-potion', 'antidote'],
      },
    },
    {
      weight: 10,
      outcome: {
        type: 'vignette',
        description: 'Ancient tapestries depicting dark rituals line the walls. You feel a chill run down your spine.',
        flavorOnly: true,
      },
    },
  ],
};
```

**Step 3: Create catacombs encounters**

Create `src/data/encounterTables/catacombs-encounters.ts`:

```typescript
import type { ExplorationTable } from '../../types';

export const catacombsEncounters: ExplorationTable = {
  id: 'catacombs-encounters',
  locationId: 'catacombs',
  encounters: [
    {
      weight: 45,
      outcome: {
        type: 'combat',
        enemyId: 'ghoul',
        goldReward: 30,
      },
    },
    {
      weight: 30,
      outcome: {
        type: 'combat',
        enemyId: 'wraith',
        goldReward: 60,
        itemReward: 'magic-ring',
      },
    },
    {
      weight: 15,
      outcome: {
        type: 'treasure',
        gold: 100,
        items: ['greater-healing-potion', 'enchanted-amulet'],
      },
    },
    {
      weight: 10,
      outcome: {
        type: 'vignette',
        description: 'Rows of stone sarcophagi stretch into the darkness. The names carved upon them have long since faded.',
        flavorOnly: true,
      },
    },
  ],
};
```

**Step 4: Create void-sanctum encounters**

Create `src/data/encounterTables/void-sanctum-encounters.ts`:

```typescript
import type { ExplorationTable } from '../../types';

export const voidSanctumEncounters: ExplorationTable = {
  id: 'void-sanctum-encounters',
  locationId: 'void-sanctum',
  encounters: [
    {
      weight: 50,
      outcome: {
        type: 'combat',
        enemyId: 'void-wraith',
        goldReward: 75,
      },
    },
    {
      weight: 30,
      outcome: {
        type: 'combat',
        enemyId: 'death-knight',
        goldReward: 100,
        itemReward: 'legendary-weapon',
      },
    },
    {
      weight: 20,
      outcome: {
        type: 'treasure',
        gold: 150,
        items: ['supreme-healing-potion', 'enchanted-armor'],
      },
    },
  ],
};
```

**Step 5: Update index to export all tables**

Modify `src/data/encounterTables/index.ts`:

```typescript
import type { ExplorationTable } from '../../types';
import { blackwoodEncounters } from './blackwood-encounters';
import { towerApproachEncounters } from './tower-approach-encounters';
import { towerInteriorEncounters } from './tower-interior-encounters';
import { catacombsEncounters } from './catacombs-encounters';
import { voidSanctumEncounters } from './void-sanctum-encounters';

export const ENCOUNTER_TABLES: Record<string, ExplorationTable> = {
  'blackwood-encounters': blackwoodEncounters,
  'tower-approach-encounters': towerApproachEncounters,
  'tower-interior-encounters': towerInteriorEncounters,
  'catacombs-encounters': catacombsEncounters,
  'void-sanctum-encounters': voidSanctumEncounters,
};

export function getEncounterTable(tableId: string): ExplorationTable | null {
  return ENCOUNTER_TABLES[tableId] || null;
}
```

**Step 6: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

**Step 7: Commit**

```bash
git add src/data/encounterTables/
git commit -m "feat(data): create all Campaign 1 encounter tables"
```

---

## Task 14: Create WorldMapScreen Component

**Files:**
- Create: `src/screens/WorldMapScreen.tsx`

**Step 1: Create WorldMapScreen component**

Create `src/screens/WorldMapScreen.tsx`:

```typescript
import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';
import { canTravelToLocation, isFirstVisit, markLocationVisited } from '../utils/worldMap';
import { LOCATIONS } from '../data/locations';
import type { Location } from '../types';

interface WorldMapScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
}

export function WorldMapScreen({ onNavigate }: WorldMapScreenProps) {
  const { world, campaign, enterNode } = useNarrativeStore();
  const { character } = useCharacterStore();

  if (!world || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">No campaign loaded</p>
      </div>
    );
  }

  const handleLocationClick = (location: Location) => {
    if (!canTravelToLocation(world, location.id)) {
      return; // Location locked
    }

    // Check if first visit
    if (isFirstVisit(world, location.id) && location.firstVisitNodeId) {
      // Mark as visited
      const updatedWorld = markLocationVisited(world, location.id);
      useNarrativeStore.setState({ world: updatedWorld });

      // Enter first visit story node
      if (character) {
        enterNode(location.firstVisitNodeId, character);
      }
      onNavigate({ type: 'story' });
    } else {
      // Return visit - go to location hub
      const updatedWorld = {
        ...world,
        currentLocationId: location.id,
      };
      useNarrativeStore.setState({ world: updatedWorld });
      onNavigate({ type: 'locationHub', locationId: location.id });
    }
  };

  const campaignLocations = campaign.locations || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">{campaign.title}</h1>
        <p className="text-gray-400 mb-8">World Map</p>

        {/* Location Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {campaignLocations.map((location) => {
            const isUnlocked = canTravelToLocation(world, location.id);
            const isCurrent = world.currentLocationId === location.id;
            const hasVisited = world.visitedLocations.includes(location.id);

            return (
              <button
                key={location.id}
                onClick={() => handleLocationClick(location)}
                disabled={!isUnlocked}
                className={`
                  relative p-6 rounded-lg border-2 transition-all
                  ${isCurrent ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}
                  ${isUnlocked ? 'hover:border-blue-400 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  ${hasVisited ? 'bg-gray-800' : 'bg-gray-900'}
                `}
              >
                {/* Lock Icon for Locked Locations */}
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                )}

                {/* Current Location Indicator */}
                {isCurrent && (
                  <div className="absolute top-2 left-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                )}

                {/* Location Name */}
                <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                  {location.name}
                </h3>

                {/* Location Type Badge */}
                <div className={`inline-block px-3 py-1 rounded text-xs font-medium mb-2 ${
                  location.locationType === 'town' ? 'bg-green-500/20 text-green-400' :
                  location.locationType === 'wilderness' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {location.locationType}
                </div>

                {/* Location Description */}
                {isUnlocked && location.description && (
                  <p className="text-sm text-gray-400 mt-2">{location.description}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Location Info */}
        {world.currentLocationId && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-2">Current Location</h2>
            <p className="text-gray-300">
              {LOCATIONS[world.currentLocationId]?.name || 'Unknown'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/screens/WorldMapScreen.tsx
git commit -m "feat(ui): create WorldMapScreen component"
```

---

## Task 15: Create LocationHubScreen Component

**Files:**
- Create: `src/screens/LocationHubScreen.tsx`

**Step 1: Create LocationHubScreen component**

Create `src/screens/LocationHubScreen.tsx`:

```typescript
import { useNarrativeStore } from '../stores/narrativeStore';
import { getLocationHubOptions, type HubOption } from '../utils/worldMap';
import { LOCATIONS } from '../data/locations';
import { getEncounterTable } from '../data/encounterTables';
import type { Location } from '../types';

interface LocationHubScreenProps {
  locationId: string;
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
}

export function LocationHubScreen({ locationId, onNavigate }: LocationHubScreenProps) {
  const { world, campaign } = useNarrativeStore();

  if (!world || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">No campaign loaded</p>
      </div>
    );
  }

  const location = LOCATIONS[locationId];
  if (!location) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Location not found: {locationId}</p>
      </div>
    );
  }

  const hubOptions = getLocationHubOptions(location, world);

  const handleOptionClick = (option: HubOption) => {
    switch (option) {
      case 'continue-story':
        // Navigate to story node (hubNodeId or resume where left off)
        if (location.hubNodeId) {
          onNavigate({ type: 'story' });
        } else {
          // TODO: Resume story at current node
          onNavigate({ type: 'story' });
        }
        break;

      case 'visit-merchant':
        // TODO: Navigate to merchant screen
        onNavigate({ type: 'merchant', shopInventory: [], buyPrices: {} });
        break;

      case 'rest-inn':
      case 'rest-sanctuary':
        // Navigate to rest screen (safe rest)
        onNavigate({ type: 'rest' });
        break;

      case 'make-camp':
        // Navigate to rest screen (camp with events)
        onNavigate({ type: 'rest' });
        break;

      case 'explore-area':
        // Navigate to exploration screen
        if (location.explorationTableId) {
          onNavigate({
            type: 'exploration',
            tableId: location.explorationTableId,
            onceOnly: false,
            onComplete: () => {
              onNavigate({ type: 'locationHub', locationId });
            },
          });
        }
        break;

      case 'leave-location':
        // Return to world map
        const updatedWorld = {
          ...world,
          currentLocationId: null,
        };
        useNarrativeStore.setState({ world: updatedWorld });
        onNavigate({ type: 'worldMap' });
        break;
    }
  };

  const getOptionLabel = (option: HubOption): string => {
    switch (option) {
      case 'continue-story': return 'Continue Your Journey';
      case 'visit-merchant': return 'Visit the Market';
      case 'rest-inn': return 'Rest at the Inn';
      case 'rest-sanctuary': return 'Rest at Sanctuary';
      case 'explore-area': return 'Search the Area';
      case 'make-camp': return 'Make Camp';
      case 'leave-location': return `Leave ${location.name}`;
      default: return option;
    }
  };

  const getOptionIcon = (option: HubOption): string => {
    switch (option) {
      case 'continue-story': return '📖';
      case 'visit-merchant': return '🏪';
      case 'rest-inn': return '🛏️';
      case 'rest-sanctuary': return '⛪';
      case 'explore-area': return '🔍';
      case 'make-camp': return '🏕️';
      case 'leave-location': return '🗺️';
      default: return '•';
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-8"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/assets/${location.image})`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Location Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{location.name}</h1>
          {location.description && (
            <p className="text-lg text-gray-300 mb-4">{location.description}</p>
          )}
          {location.ambience && (
            <p className="text-sm text-gray-400 italic">{location.ambience}</p>
          )}
        </div>

        {/* Hub Options */}
        <div className="space-y-4">
          {hubOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className="w-full p-6 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-600 hover:border-blue-500 rounded-lg transition-all text-left group"
            >
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{getOptionIcon(option)}</span>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {getOptionLabel(option)}
                  </h3>
                  {option === 'explore-area' && location.explorationTableId && (
                    <p className="text-sm text-gray-400 mt-1">
                      Search for treasure and encounters
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/screens/LocationHubScreen.tsx
git commit -m "feat(ui): create LocationHubScreen component"
```

---

## Task 16: Add Screen Types for Phase 5

**Files:**
- Modify: `src/types/screen.ts` (or wherever Screen type is defined)

**Step 1: Add worldMap and locationHub screen types**

Find the Screen type definition and add:

```typescript
export type Screen =
  | { type: 'mainMenu' }
  | { type: 'characterCreation' }
  | { type: 'story' }
  | { type: 'combat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'characterSheet' }
  | { type: 'worldMap' }  // Phase 5
  | { type: 'locationHub'; locationId: string }  // Phase 5
  // ... other screen types
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Type errors in App.tsx (expected - we'll add routing next)

**Step 3: Commit**

```bash
git add src/types/screen.ts
git commit -m "feat(types): add worldMap and locationHub screen types"
```

---

## Task 17: Add Phase 5 Screens to App Routing

**Files:**
- Modify: `src/App.tsx`

**Step 1: Import Phase 5 screens**

Add imports at top of `src/App.tsx`:

```typescript
import { WorldMapScreen } from './screens/WorldMapScreen';
import { LocationHubScreen } from './screens/LocationHubScreen';
```

**Step 2: Add screen routing cases**

In the screen rendering switch statement, add:

```typescript
case 'worldMap':
  return <WorldMapScreen onNavigate={handleNavigate} />;

case 'locationHub':
  return <LocationHubScreen
    locationId={currentScreen.locationId}
    onNavigate={handleNavigate}
  />;
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

**Step 4: Test in dev mode**

Run: `npm run dev`
Expected: App loads without crashes

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): add Phase 5 screen routing for worldMap and locationHub"
```

---

## Task 18: Update Campaign with Phase 5 Fields (Minimal Test)

**Files:**
- Modify: `src/data/campaigns/test-campaign.ts`

**Step 1: Add Phase 5 fields to test campaign**

Modify `src/data/campaigns/test-campaign.ts`:

```typescript
import type { Campaign } from '../../types';
import { LOCATIONS } from '../locations';

export const testCampaign: Campaign = {
  id: 'test-campaign',
  title: 'Test Campaign',
  description: 'A simple campaign for testing Phase 5',
  companionName: 'Test Companion',
  companionDescription: 'A helpful guide for testing',

  // Phase 5: Location configuration
  locations: [
    LOCATIONS['ashford'],
    LOCATIONS['blackwood-forest'],
    LOCATIONS['oakhaven'],
  ],
  startingLocationId: 'ashford',
  initialUnlockedLocations: ['ashford'],

  acts: [
    // ... existing act structure
  ],
};
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/data/campaigns/test-campaign.ts
git commit -m "feat(campaign): add Phase 5 fields to test campaign"
```

---

## Task 19: Manual Testing - World Map and Location Hub

**Files:**
- None (manual testing)

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Manual test checklist**

Test the following:
- [ ] World map shows starting location unlocked
- [ ] Other locations are locked (grayed out, unclickable)
- [ ] Click starting location → enters first visit story node (if defined)
- [ ] Return to location → shows location hub
- [ ] Location hub shows correct options based on type
- [ ] "Leave location" returns to world map
- [ ] Current location is highlighted on world map

**Step 3: Document any issues**

If issues found, create bug fixes before proceeding.

**Step 4: Commit any fixes**

```bash
git add <fixed files>
git commit -m "fix(phase5): <description of fix>"
```

---

## Task 20: Create Integration Tests for Phase 5 Flow

**Files:**
- Create: `src/__tests__/integration/phase5-flow.test.ts`

**Step 1: Write integration tests**

Create `src/__tests__/integration/phase5-flow.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useNarrativeStore } from '@/stores/narrativeStore';
import { useCharacterStore } from '@/stores/characterStore';
import { testCampaign } from '@/data/campaigns/test-campaign';
import type { Character } from '@/types';

describe('Phase 5: World Map Integration Flow', () => {
  let mockCharacter: Character;

  beforeEach(() => {
    // Reset stores
    useNarrativeStore.getState().resetNarrative();
    useCharacterStore.getState().reset();

    // Create mock character
    mockCharacter = {
      id: 'test-char',
      name: 'Test Hero',
      class: 'fighter',
      level: 1,
      hp: 20,
      maxHp: 20,
      // ... other required fields
    };
    useCharacterStore.setState({ character: mockCharacter });

    // Load campaign
    useNarrativeStore.getState().loadCampaign(testCampaign);
  });

  it('should initialize world state with starting location unlocked', () => {
    useNarrativeStore.getState().startCampaign();
    const { world } = useNarrativeStore.getState();

    expect(world?.unlockedLocations).toContain('ashford');
    expect(world?.currentLocationId).toBe('ashford');
    expect(world?.visitedLocations).toHaveLength(0);
  });

  it('should unlock new location via story effect', () => {
    useNarrativeStore.getState().startCampaign();

    const effects = [
      { type: 'unlockLocation' as const, locationId: 'oakhaven' },
    ];

    // Simulate processing effects
    const { world } = useNarrativeStore.getState();
    if (world) {
      const updated = {
        ...world,
        unlockedLocations: [...world.unlockedLocations, 'oakhaven'],
      };
      useNarrativeStore.setState({ world: updated });
    }

    const { world: newWorld } = useNarrativeStore.getState();
    expect(newWorld?.unlockedLocations).toContain('oakhaven');
  });

  it('should mark location as visited on first entry', () => {
    useNarrativeStore.getState().startCampaign();

    const { world } = useNarrativeStore.getState();
    if (world) {
      const updated = {
        ...world,
        visitedLocations: ['ashford'],
      };
      useNarrativeStore.setState({ world: updated });
    }

    const { world: newWorld } = useNarrativeStore.getState();
    expect(newWorld?.visitedLocations).toContain('ashford');
  });

  it('should unlock sanctuary in dungeon location', () => {
    useNarrativeStore.getState().startCampaign();

    const { world } = useNarrativeStore.getState();
    if (world) {
      const updated = {
        ...world,
        unlockedSanctuaries: ['tower-interior'],
      };
      useNarrativeStore.setState({ world: updated });
    }

    const { world: newWorld } = useNarrativeStore.getState();
    expect(newWorld?.unlockedSanctuaries).toContain('tower-interior');
  });
});
```

**Step 2: Run integration tests**

Run: `npm test phase5-flow.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add src/__tests__/integration/phase5-flow.test.ts
git commit -m "test(phase5): add integration tests for world map flow"
```

---

## Task 21: Update Save System for Phase 5 Fields

**Files:**
- Modify: `src/utils/gameSaveManager.ts`

**Step 1: Add migration for Phase 5 fields**

Add to migration logic in `gameSaveManager.ts`:

```typescript
// Migrate old saves without Phase 5 location fields
if (!saveData.narrative.world.currentLocationId) {
  saveData.narrative.world.currentLocationId = null;
  saveData.narrative.world.unlockedLocations = [];
  saveData.narrative.world.visitedLocations = [];
  saveData.narrative.world.unlockedSanctuaries = [];
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: No errors

**Step 3: Test save/load manually**

1. Start campaign
2. Create save
3. Load save
4. Verify location state preserved

**Step 4: Commit**

```bash
git add src/utils/gameSaveManager.ts
git commit -m "feat(save): migrate old saves to support Phase 5 location fields"
```

---

## Task 22: Documentation - Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add Phase 5 status to project overview**

Update CLAUDE.md:

```markdown
**CURRENT STATUS**: Phase 5 in progress: world map and exploration system.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Phase 5"
```

---

## Task 23: Final Testing and Polish

**Files:**
- None (testing phase)

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Run build**

Run: `npm run build`
Expected: Clean build

**Step 4: Manual testing checklist**

Test full Phase 5 flow:
- [ ] Campaign starts with world map
- [ ] Starting location auto-selected
- [ ] First visit triggers story node
- [ ] Return visit shows location hub
- [ ] Hub options correct for each location type (town/wilderness/dungeon)
- [ ] Story can unlock new locations
- [ ] Story can unlock sanctuaries
- [ ] Sanctuaries appear in dungeon hubs when unlocked
- [ ] Exploration works from hubs
- [ ] Save/load preserves location state
- [ ] World map shows current location
- [ ] Locked locations cannot be clicked

**Step 5: Fix any issues found**

**Step 6: Final commit**

```bash
git add .
git commit -m "feat(phase5): complete world map and exploration system"
```

---

## Success Criteria

Phase 5 is complete when:

- [x] All TypeScript compiles without errors
- [x] All tests pass
- [x] World map screen displays campaign locations
- [x] Location hub screen shows context-sensitive options
- [x] Story nodes can unlock locations via effects
- [x] Story nodes can unlock sanctuaries via effects
- [x] First visit to location triggers story node
- [x] Return visit to location shows hub
- [x] 5 encounter tables created for Campaign 1
- [x] Save/load preserves location state
- [x] Manual testing checklist complete

---

## Future Enhancements (Phase 5.5)

Deferred features:
- Points of Interest (POI) system
- Encounter scaling by player level
- Travel time/distance mechanics
- Visual map improvements (fog of war, animated travel)
- World map images and custom positioning
- Location connection lines/paths

---

## Notes

- Follow TDD approach (test first, then implement)
- Keep tasks bite-sized (2-5 minutes each)
- Commit frequently after each task
- Reference testing guide for behavioral testing
- Use TodoWrite tool for complex test suites
- Test behavior (observable outcomes), not implementation details
