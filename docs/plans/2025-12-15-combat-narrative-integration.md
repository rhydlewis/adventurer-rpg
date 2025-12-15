# Combat-Narrative Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate combat system with narrative flow so that story nodes can trigger combat encounters and return to the narrative after victory/defeat.

**Architecture:** Create enemy database, update App.tsx navigation to pass combat parameters to CombatScreen, add victory/defeat callbacks that return player to narrative flow at specified nodes. Uses existing combat and narrative stores with minimal changes.

**Tech Stack:** React 18, TypeScript, Zustand (state), Vitest (testing)

---

## Current State Analysis

**What Works:**
- Narrative system processes `startCombat` effects and extracts `enemyId` + `onVictoryNodeId`
- Combat system fully functional with turn-based mechanics, conditions, spells
- Navigation flow defined in types but not fully wired

**What's Missing:**
1. No enemy database - `enemyId` cannot be resolved to creature stats
2. CombatScreen doesn't receive `enemyId` or `onVictoryNodeId` props
3. No return path from combat back to narrative (always goes to home screen)
4. No defeat handling (should go to `deathNodeId`)

---

## Task 1: Create Enemy Database

**Files:**
- Create: `src/data/enemies.ts`
- Create: `src/__tests__/data/enemies.test.ts`

### Step 1: Write the failing test

```typescript
// src/__tests__/data/enemies.test.ts
import { describe, it, expect } from 'vitest';
import { enemies } from '../../../data/enemies';
import type { Creature } from '../../../types/combat';

describe('Enemy Database', () => {
  it('should have a bandit enemy definition', () => {
    const bandit = enemies['bandit'];
    expect(bandit).toBeDefined();
    expect(bandit.name).toBe('Bandit');
    expect(bandit.hp).toBeGreaterThan(0);
    expect(bandit.maxHp).toBeGreaterThan(0);
    expect(bandit.ac).toBeGreaterThan(0);
  });

  it('should have a skeleton enemy definition', () => {
    const skeleton = enemies['skeleton'];
    expect(skeleton).toBeDefined();
    expect(skeleton.name).toBe('Skeleton');
    expect(skeleton.hp).toBeGreaterThan(0);
    expect(skeleton.avatar).toBeDefined();
  });

  it('should return all required Creature fields', () => {
    const skeleton = enemies['skeleton'];
    expect(skeleton).toHaveProperty('name');
    expect(skeleton).toHaveProperty('hp');
    expect(skeleton).toHaveProperty('maxHp');
    expect(skeleton).toHaveProperty('ac');
    expect(skeleton).toHaveProperty('bab');
    expect(skeleton).toHaveProperty('attributes');
    expect(skeleton).toHaveProperty('saves');
    expect(skeleton).toHaveProperty('avatar');
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test src/__tests__/data/enemies.test.ts`

Expected: FAIL with "Cannot find module '../../../data/enemies'"

### Step 3: Write minimal implementation

```typescript
// src/data/enemies.ts
import type { Creature } from '../types/combat';
import { calculateModifier } from '../utils/dice';

/**
 * Enemy Database
 *
 * Defines all enemies that can be encountered in combat.
 * Each enemy is a Creature with full d20 stats.
 */

export const enemies: Record<string, Creature> = {
  bandit: {
    name: 'Bandit',
    level: 1,
    characterClass: 'Fighter',
    attributes: {
      str: 13,  // +1
      dex: 14,  // +2
      con: 12,  // +1
      int: 10,  // +0
      wis: 11,  // +0
      cha: 8,   // -1
    },
    hp: 10,
    maxHp: 10,
    ac: 13,  // 10 + 2 DEX + 1 leather armor
    bab: 1,
    saves: {
      fortitude: 3,  // 2 (Fighter) + 1 CON
      reflex: 2,     // 0 (Fighter) + 2 DEX
      will: 0,       // 0 (Fighter) + 0 WIS
    },
    skills: {
      Intimidate: 2,
      Stealth: 4,
    },
    attackBonus: 2,     // BAB 1 + STR 1
    damageBonus: 1,     // STR modifier
    attackStat: 'str',
    damageStat: 'str',
    weaponDamage: '1d6', // Short sword
    avatar: 'bandit',    // Will use default until avatar system updated
  },

  skeleton: {
    name: 'Skeleton',
    level: 1,
    characterClass: 'Fighter',
    attributes: {
      str: 13,  // +1
      dex: 15,  // +2
      con: 10,  // +0 (undead don't benefit from CON but keep for mechanics)
      int: 6,   // -2
      wis: 10,  // +0
      cha: 3,   // -4
    },
    hp: 12,
    maxHp: 12,
    ac: 15,  // 10 + 2 DEX + 2 natural armor + 1 shield
    bab: 1,
    saves: {
      fortitude: 2,  // 2 (Fighter) + 0 CON
      reflex: 4,     // 0 (Fighter) + 2 DEX + 2 (undead bonus)
      will: 2,       // 0 (Fighter) + 0 WIS + 2 (undead bonus)
    },
    skills: {},
    attackBonus: 2,     // BAB 1 + STR 1
    damageBonus: 1,     // STR modifier
    attackStat: 'str',
    damageStat: 'str',
    weaponDamage: '1d6', // Claw/rusty sword
    avatar: 'skeleton',
  },
};

/**
 * Get enemy by ID, return a fresh copy to prevent mutation
 */
export function getEnemy(enemyId: string): Creature | null {
  const enemy = enemies[enemyId];
  if (!enemy) return null;

  // Return a deep copy to prevent mutations affecting the template
  return {
    ...enemy,
    attributes: { ...enemy.attributes },
    saves: { ...enemy.saves },
    skills: { ...enemy.skills },
  };
}
```

### Step 4: Run test to verify it passes

Run: `npm test src/__tests__/data/enemies.test.ts`

Expected: PASS (all 3 tests)

### Step 5: Commit

```bash
git add src/data/enemies.ts src/__tests__/data/enemies.test.ts
git commit -m "feat: add enemy database with bandit and skeleton"
```

---

## Task 2: Update Navigation Types and App.tsx

**Files:**
- Modify: `src/App.tsx:96-97`
- Modify: `src/types/navigation.ts` (if needed)

### Step 1: Write the failing test

```typescript
// src/__tests__/App.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import * as combatStore from '../stores/combatStore';
import * as narrativeStore from '../stores/narrativeStore';

describe('App Navigation - Combat Integration', () => {
  it('should pass enemyId and onVictoryNodeId to CombatScreen', () => {
    // Mock the stores
    vi.spyOn(combatStore, 'useCombatStore').mockReturnValue({
      combat: null,
      startCombat: vi.fn(),
      executeTurn: vi.fn(),
      resetCombat: vi.fn(),
    });

    // Mock narrative store to trigger combat navigation
    const mockSetCurrentScreen = vi.fn();
    vi.spyOn(narrativeStore, 'useNarrativeStore').mockReturnValue({
      onNavigate: mockSetCurrentScreen,
      // ... other narrative store properties
    });

    // Simulate combat navigation
    const { rerender } = render(<App />);

    // Trigger combat navigation programmatically
    // (This test structure may need adjustment based on actual App implementation)

    // For now, verify CombatScreen receives props when rendered
    // This is a simplified test - may need more sophisticated approach
  });
});
```

**Note:** This test structure may need refinement. The key is verifying that CombatScreen receives the right props. For now, we'll implement the changes and verify manually, then improve tests.

### Step 2: Skip automated test for now (integration test better done manually)

We'll verify this works through manual testing after implementation.

### Step 3: Implement combat navigation in App.tsx

```typescript
// src/App.tsx
// Find the combat screen rendering section (around line 96-97)
// BEFORE:
{currentScreen.type === 'combat' && (
  <CombatScreen onEndCombat={() => setCurrentScreen({ type: 'home' })} />
)}

// AFTER:
{currentScreen.type === 'combat' && (
  <CombatScreen
    enemyId={currentScreen.enemyId}
    onVictoryNodeId={currentScreen.onVictoryNodeId}
    onVictory={(victoryNodeId: string) => {
      // Return to narrative at specified node
      setCurrentScreen({ type: 'story' });
      // Narrative store will handle entering the victory node
      const narrativeStore = useNarrativeStore.getState();
      const gameStore = useGameStore.getState();
      narrativeStore.enterNode(victoryNodeId, gameStore.player);
    }}
    onDefeat={() => {
      // Return to narrative at death node
      setCurrentScreen({ type: 'story' });
      const narrativeStore = useNarrativeStore.getState();
      const gameStore = useGameStore.getState();
      const deathNodeId = narrativeStore.campaign?.acts[0]?.deathNodeId;
      if (deathNodeId) {
        narrativeStore.enterNode(deathNodeId, gameStore.player);
      } else {
        // Fallback: go home if no death node defined
        setCurrentScreen({ type: 'home' });
      }
    }}
  />
)}
```

### Step 4: Manual verification

Run: `npm run dev`

1. Start a campaign
2. Navigate to a node with `startCombat` effect
3. Verify combat screen appears
4. Complete combat (win or lose)
5. Verify return to correct narrative node

Expected: Combat triggers, completes, returns to narrative

### Step 5: Commit

```bash
git add src/App.tsx
git commit -m "feat: wire combat navigation to narrative flow"
```

---

## Task 3: Update CombatScreen to Accept Props and Trigger Callbacks

**Files:**
- Modify: `src/screens/CombatScreen.tsx:30-35` (props interface)
- Modify: `src/screens/CombatScreen.tsx:40-45` (component signature)
- Modify: `src/screens/CombatScreen.tsx:60-80` (useEffect to initialize combat)
- Modify: `src/screens/CombatScreen.tsx:400-420` (victory/defeat handlers)

### Step 1: Write the failing test

```typescript
// src/__tests__/screens/CombatScreen.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CombatScreen from '../../screens/CombatScreen';
import * as combatStore from '../../stores/combatStore';
import * as gameStore from '../../stores/gameStore';
import * as enemiesData from '../../data/enemies';

describe('CombatScreen - Narrative Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load enemy from enemyId and start combat on mount', () => {
    const mockStartCombat = vi.fn();
    const mockGetEnemy = vi.spyOn(enemiesData, 'getEnemy').mockReturnValue({
      name: 'Skeleton',
      hp: 12,
      maxHp: 12,
      // ... other creature properties
    } as any);

    vi.spyOn(combatStore, 'useCombatStore').mockReturnValue({
      combat: null,
      startCombat: mockStartCombat,
      executeTurn: vi.fn(),
      resetCombat: vi.fn(),
    });

    vi.spyOn(gameStore, 'useGameStore').mockReturnValue({
      player: { name: 'Hero', hp: 20 } as any,
    });

    render(
      <CombatScreen
        enemyId="skeleton"
        onVictoryNodeId="victory-node"
        onVictory={vi.fn()}
        onDefeat={vi.fn()}
      />
    );

    expect(mockGetEnemy).toHaveBeenCalledWith('skeleton');
    expect(mockStartCombat).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Hero' }),
      expect.objectContaining({ name: 'Skeleton' })
    );
  });

  it('should call onVictory callback when player wins', async () => {
    const mockOnVictory = vi.fn();

    vi.spyOn(combatStore, 'useCombatStore').mockReturnValue({
      combat: {
        winner: 'player',
        // ... other combat state
      } as any,
      startCombat: vi.fn(),
      executeTurn: vi.fn(),
      resetCombat: vi.fn(),
    });

    render(
      <CombatScreen
        enemyId="skeleton"
        onVictoryNodeId="victory-node"
        onVictory={mockOnVictory}
        onDefeat={vi.fn()}
      />
    );

    // Click "Continue" or "Return" button after victory
    const continueButton = await screen.findByText(/Continue|Return/i);
    await userEvent.click(continueButton);

    expect(mockOnVictory).toHaveBeenCalledWith('victory-node');
  });

  it('should call onDefeat callback when player loses', async () => {
    const mockOnDefeat = vi.fn();

    vi.spyOn(combatStore, 'useCombatStore').mockReturnValue({
      combat: {
        winner: 'enemy',
        // ... other combat state
      } as any,
      startCombat: vi.fn(),
      executeTurn: vi.fn(),
      resetCombat: vi.fn(),
    });

    render(
      <CombatScreen
        enemyId="skeleton"
        onVictoryNodeId="victory-node"
        onVictory={vi.fn()}
        onDefeat={mockOnDefeat}
      />
    );

    // Defeat screen should show
    const continueButton = await screen.findByText(/Continue|Return/i);
    await userEvent.click(continueButton);

    expect(mockOnDefeat).toHaveBeenCalled();
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm test src/__tests__/screens/CombatScreen.test.tsx`

Expected: FAIL - CombatScreen doesn't accept these props yet

### Step 3: Implement CombatScreen changes

```typescript
// src/screens/CombatScreen.tsx

// UPDATE PROPS INTERFACE (around line 30-35)
interface CombatScreenProps {
  enemyId: string;
  onVictoryNodeId: string;
  onVictory: (victoryNodeId: string) => void;
  onDefeat: () => void;
}

// UPDATE COMPONENT SIGNATURE (around line 40)
function CombatScreen({ enemyId, onVictoryNodeId, onVictory, onDefeat }: CombatScreenProps) {
  const { combat, startCombat, executeTurn, resetCombat } = useCombatStore();
  const { player } = useGameStore();

  // ADD INITIALIZATION EFFECT (add after existing hooks, before return)
  useEffect(() => {
    // Only initialize combat if not already in combat
    if (!combat && player) {
      // Load enemy from database
      const enemy = getEnemy(enemyId);

      if (!enemy) {
        console.error(`Enemy with ID "${enemyId}" not found in database`);
        // Fallback: return to home or show error
        onDefeat();
        return;
      }

      // Start combat with loaded enemy
      startCombat(player, enemy);
    }
  }, [combat, player, enemyId, startCombat, onDefeat]);

  // ADD IMPORTS at top
  import { getEnemy } from '../data/enemies';

  // UPDATE VICTORY/DEFEAT BUTTON HANDLERS (around line 400-420)
  // Find the "Return Home" or "Continue" button in victory/defeat cards
  // BEFORE:
  <Button onClick={onEndCombat}>Return Home</Button>

  // AFTER (in victory card):
  <Button onClick={() => {
    resetCombat();
    onVictory(onVictoryNodeId);
  }}>
    Continue Adventure
  </Button>

  // AFTER (in defeat card):
  <Button onClick={() => {
    resetCombat();
    onDefeat();
  }}>
    Continue
  </Button>
```

### Step 4: Run test to verify it passes

Run: `npm test src/__tests__/screens/CombatScreen.test.tsx`

Expected: PASS (all 3 tests)

### Step 5: Commit

```bash
git add src/screens/CombatScreen.tsx src/__tests__/screens/CombatScreen.test.tsx
git commit -m "feat: integrate CombatScreen with narrative callbacks"
```

---

## Task 4: Update Narrative Store to Handle Combat Returns

**Files:**
- Modify: `src/stores/narrativeStore.ts:170-185` (combat trigger handling)

### Step 1: Current state is already correct

The narrative store already processes `startCombat` effects and triggers navigation via `onNavigate` callback. When App.tsx calls `enterNode()` after combat victory, the narrative will correctly resume at the specified node.

**No changes needed to narrative store** - the integration is complete via App.tsx callbacks.

### Step 2: Verify behavior

Manually test:
1. Start campaign
2. Reach node with `startCombat` effect
3. Win combat
4. Verify you're at `onVictoryNodeId` in narrative

### Step 3: Commit (documentation update)

```bash
git add docs/plans/2025-12-15-combat-narrative-integration.md
git commit -m "docs: confirm narrative store integration complete"
```

---

## Task 5: Update Test Campaign to Use Skeleton Enemy

**Files:**
- Modify: `src/data/campaigns/test-campaign.ts:265-278`

### Step 1: No test needed (campaign data)

Campaign data is loaded and used by the system. We verify through manual playtesting.

### Step 2: Update bandit camp node to use skeleton

```typescript
// src/data/campaigns/test-campaign.ts

// FIND NODE 11 (around line 265-278)
// BEFORE:
{
  id: 'test-bandit-camp',
  title: 'The Bandit Camp',
  description:
    'You find a crude camp in a forest clearing. A single bandit sits by a dying fire, sharpening his blade. He spots you and leaps to his feet!',
  onEnter: [
    {
      type: 'startCombat',
      enemyId: 'bandit',
      onVictoryNodeId: 'test-victory',
    },
  ],
  choices: [], // No choices - combat starts immediately
},

// AFTER:
{
  id: 'test-bandit-camp',
  title: 'The Bandit Camp',
  description:
    'You find a crude camp in a forest clearing. A skeletal warrior sits motionless by a dying fire. As you approach, its empty eye sockets flare with unholy light and it rises to attack!',
  onEnter: [
    {
      type: 'startCombat',
      enemyId: 'skeleton',  // Changed from 'bandit'
      onVictoryNodeId: 'test-victory',
    },
  ],
  choices: [], // No choices - combat starts immediately
},
```

### Step 3: Update victory node description (optional)

```typescript
// FIND NODE 12 (around line 282-299)
// Update to match skeleton instead of bandit
{
  id: 'test-victory',
  title: 'Victory!',
  description:
    'The skeleton crumbles to dust. Searching the camp, you find the stolen goods from the village, along with a mysterious letter bearing an unfamiliar seal.',
  onEnter: [
    { type: 'setFlag', flag: 'defeated_bandit', value: true },  // Keep flag name for now
    { type: 'giveItem', itemId: 'mysterious-letter' },
    { type: 'heal', amount: 'full' },
  ],
  choices: [
    {
      id: 'choice-return-village',
      text: 'Return to the village with the goods',
      outcome: { type: 'goto', nodeId: 'test-end' },
    },
  ],
},
```

### Step 4: Commit

```bash
git add src/data/campaigns/test-campaign.ts
git commit -m "feat: update test campaign to use skeleton enemy"
```

---

## Task 6: Add Death Node Integration

**Files:**
- Modify: `src/data/campaigns/test-campaign.ts:372-378` (death node)
- Verify: App.tsx already handles defeat case

### Step 1: Verify death node exists

```typescript
// src/data/campaigns/test-campaign.ts (line 372-378)
{
  id: 'test-death',
  title: 'A Hero Falls',
  description:
    'Your vision fades as you collapse. The forest claims another victim, and your story ends here in the darkness of the Darkwood.',
  choices: [],
}
```

Already exists! ✓

### Step 2: Verify defeat handler in App.tsx

```typescript
// Should be already implemented in Task 2
onDefeat={() => {
  setCurrentScreen({ type: 'story' });
  const narrativeStore = useNarrativeStore.getState();
  const gameStore = useGameStore.getState();
  const deathNodeId = narrativeStore.campaign?.acts[0]?.deathNodeId;
  if (deathNodeId) {
    narrativeStore.enterNode(deathNodeId, gameStore.player);
  }
}}
```

Already implemented! ✓

### Step 3: Manual test defeat scenario

1. Start test campaign
2. Navigate to combat node
3. Let enemy defeat you (take damage, lose combat)
4. Verify you're shown the death node

### Step 4: Commit (if any adjustments needed)

```bash
# Only if changes were made
git add src/App.tsx
git commit -m "feat: add defeat handling to narrative flow"
```

---

## Task 7: End-to-End Integration Test

### Step 1: Manual Playthrough Test

Run: `npm run dev`

**Test Victory Path:**
1. Start app → Go to home screen
2. Click "Create Character" → Select Fighter, STR 16, CON 14, etc.
3. Click "Begin Adventure" → Start test campaign
4. Navigate choices to reach combat node (test-bandit-camp)
5. **Verify**: Combat screen appears with skeleton enemy
6. **Verify**: Player can attack, combat resolves
7. Win combat (attack until skeleton HP = 0)
8. **Verify**: Victory card appears
9. Click "Continue Adventure"
10. **Verify**: Narrative resumes at victory node (test-victory)
11. **Verify**: Conversation log shows victory node description

**Test Defeat Path:**
1. Repeat steps 1-5
2. Let skeleton attack until player HP = 0 (may need to reload and try multiple times)
3. **Verify**: Defeat card appears
4. Click "Continue"
5. **Verify**: Narrative shows death node (test-death)

### Step 2: Verify logs and state

Check browser console for:
- No error messages
- Correct enemy loaded: `"Loaded enemy: Skeleton"`
- Combat state transitions logged
- Navigation events logged

### Step 3: Test edge cases

**Missing Enemy ID:**
1. Temporarily change `enemyId: 'skeleton'` to `enemyId: 'invalid'`
2. Verify: Error logged, graceful fallback (return to home or show error)

**Missing Victory Node:**
1. Temporarily remove `onVictoryNodeId` from test campaign
2. Verify: Error logged or graceful fallback

### Step 4: Document results

Create test report in this plan:

```markdown
## Integration Test Results

**Date:** [YYYY-MM-DD]
**Tester:** [Name]

| Test Case | Result | Notes |
|-----------|--------|-------|
| Victory path | ✓ PASS | Combat → Victory node |
| Defeat path | ✓ PASS | Combat → Death node |
| Missing enemy | ✓ PASS | Error logged, fallback |
| Missing victory node | ✓ PASS | Error logged, fallback |
```

### Step 5: Final commit

```bash
git add docs/plans/2025-12-15-combat-narrative-integration.md
git commit -m "test: verify combat-narrative integration end-to-end"
```

---

## Task 8: Build and Verify Production

### Step 1: Build production bundle

Run: `npm run build`

Expected: Build succeeds, no errors

### Step 2: Preview production build

Run: `npm run preview`

1. Open preview URL (e.g., http://localhost:4173)
2. Repeat full integration test (victory + defeat paths)
3. Verify no console errors

### Step 3: Sync to mobile platforms (optional)

Run: `npx cap sync`

**iOS Test (if available):**
```bash
npx cap open ios
# Build and run in iOS Simulator
# Test combat integration on mobile
```

**Android Test (if available):**
```bash
npx cap open android
# Build and run in Android Emulator
# Test combat integration on mobile
```

### Step 4: Final commit and tag

```bash
git add .
git commit -m "feat: complete combat-narrative integration"
git tag v0.2.0-combat-narrative
git push origin main --tags
```

---

## Verification Checklist

Before marking this plan complete, verify:

- [ ] Enemy database created with bandit and skeleton
- [ ] App.tsx passes combat parameters to CombatScreen
- [ ] CombatScreen loads enemy by ID on mount
- [ ] Combat victory returns to specified narrative node
- [ ] Combat defeat returns to death node
- [ ] Test campaign uses skeleton enemy
- [ ] Manual playthrough succeeds (victory path)
- [ ] Manual playthrough succeeds (defeat path)
- [ ] Production build works
- [ ] No console errors or warnings
- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)

---

## Future Enhancements (Out of Scope)

These are intentionally NOT included in this plan:

1. **Multiple enemies** - Currently 1v1 only
2. **Enemy AI patterns** - All enemies use same attack logic
3. **Loot drops** - Victory gives items but not from enemy loot tables
4. **XP and leveling** - Combat victory doesn't grant XP yet
5. **Escape/flee option** - No way to exit combat early
6. **Combat animations** - Static display only
7. **Sound effects** - No audio feedback
8. **Save combat state** - Combat doesn't persist on refresh

These will be addressed in future phases per the design spec.

---

## Implementation Notes

**DRY Principles:**
- Enemy database is single source of truth
- Combat callbacks avoid duplication (one path for victory, one for defeat)
- Navigation logic centralized in App.tsx

**YAGNI Principles:**
- No premature enemy variation system
- No complex AI - all enemies attack each turn
- No save/load combat state (can add later if needed)

**TDD Principles:**
- Tests written before implementation where feasible
- Manual testing documented for integration points
- Edge cases tested (missing enemy, missing victory node)

**Commit Strategy:**
- Small, focused commits per task
- Each commit leaves app in working state
- Clear commit messages following conventional commits format
