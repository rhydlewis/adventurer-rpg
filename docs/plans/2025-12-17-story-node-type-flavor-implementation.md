# StoryNode Type and Flavor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add optional `type` and `flavor` fields to StoryNode for improved UI presentation without breaking existing campaigns.

**Architecture:** Extend StoryNode interface with optional fields, add inference utilities for backwards compatibility, update UI to use new fields with graceful fallbacks. Type definitions in `/types`, utilities in `/utils`, UI changes in `/screens`.

**Tech Stack:** TypeScript, React, Zustand, Vitest, Lucide React icons, Tailwind CSS

---

## Task 1: Add Type Definitions

**Files:**
- Modify: `src/types/narrative.ts`

**Step 1: Add NodeType, NodeTone, NodeIcon types**

Add after line 15 (after Requirement type):

```typescript
// =============================================================================
// Node Presentation - Optional semantic type and flavor
// =============================================================================

export type NodeType = 'explore' | 'dialogue' | 'event' | 'combat';

export type NodeTone = 'calm' | 'tense' | 'mysterious' | 'danger' | 'triumphant' | 'urgent';

export type NodeIcon =
  // Combat
  | 'sword'
  | 'shield'
  | 'skull'
  | 'danger'
  // Social
  | 'dialogue'
  | 'speech'
  | 'question'
  | 'exclamation'
  // Exploration
  | 'map'
  | 'compass'
  | 'search'
  | 'location'
  // Outcomes
  | 'treasure'
  | 'victory'
  | 'defeat'
  | 'reward'
  // Atmosphere
  | 'mystery'
  | 'warning'
  | 'magic'
  | 'crown';

export interface NodeFlavor {
  tone?: NodeTone;
  icon?: NodeIcon;
}
```

**Step 2: Add fields to StoryNode interface**

Modify StoryNode interface (around line 97) to add new fields after `locationId`:

```typescript
export interface StoryNode {
  id: string;
  title?: string;
  description: string;
  speakerName?: string;
  speakerPortrait?: string;
  locationHint?: string;
  locationId?: string;

  // Optional semantic type and presentation flavor
  type?: NodeType;
  flavor?: NodeFlavor;

  choices: Choice[];
  onEnter?: NodeEffect[];
  companionHint?: string;
}
```

**Step 3: Build to verify types compile**

Run: `npm run build`
Expected: SUCCESS (no type errors)

**Step 4: Commit**

```bash
git add src/types/narrative.ts
git commit -m "feat: add NodeType, NodeFlavor, and optional fields to StoryNode

Add optional type and flavor fields for improved presentation:
- type: 'explore' | 'dialogue' | 'event' | 'combat'
- flavor: { tone?, icon? }

Fully backwards compatible (all fields optional)."
```

---

## Task 2: Add Type Inference Utilities (TDD)

**Files:**
- Modify: `src/utils/narrativeLogic.ts`
- Modify: `src/__tests__/utils/narrativeLogic.test.ts`

**Step 1: Write failing test for inferNodeType**

Add to `src/__tests__/utils/narrativeLogic.test.ts` at the end of file (after existing tests):

```typescript
describe('Node type inference', () => {
  it('infers combat from startCombat effect', () => {
    const node: StoryNode = {
      id: 'fight',
      description: 'Battle!',
      onEnter: [{ type: 'startCombat', enemyId: 'goblin', onVictoryNodeId: 'win' }],
      choices: [],
    };
    expect(inferNodeType(node)).toBe('combat');
  });

  it('infers dialogue from speakerName', () => {
    const node: StoryNode = {
      id: 'talk',
      description: 'Conversation',
      speakerName: 'Guard',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('dialogue');
  });

  it('infers explore from title', () => {
    const node: StoryNode = {
      id: 'location',
      title: 'The Darkwood',
      description: 'A mysterious forest',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('explore');
  });

  it('infers explore from locationHint', () => {
    const node: StoryNode = {
      id: 'location',
      description: 'You arrive',
      locationHint: 'The tavern is warm and noisy',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('explore');
  });

  it('defaults to event when no indicators present', () => {
    const node: StoryNode = {
      id: 'moment',
      description: 'Something happens',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('event');
  });

  it('prioritizes combat over dialogue when both present', () => {
    const node: StoryNode = {
      id: 'ambush',
      description: 'The bandit attacks!',
      speakerName: 'Bandit',
      onEnter: [{ type: 'startCombat', enemyId: 'bandit', onVictoryNodeId: 'win' }],
      choices: [],
    };
    expect(inferNodeType(node)).toBe('combat');
  });
});

describe('getNodeType', () => {
  it('returns explicit type when provided', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'Test',
      speakerName: 'NPC',
      type: 'event', // Explicit override
      choices: [],
    };
    expect(getNodeType(node)).toBe('event');
  });

  it('infers type when not provided', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'Test',
      speakerName: 'NPC',
      choices: [],
    };
    expect(getNodeType(node)).toBe('dialogue');
  });
});
```

**Step 2: Add missing import**

Add to imports at top of `src/__tests__/utils/narrativeLogic.test.ts`:

```typescript
import { inferNodeType, getNodeType } from '../../utils/narrativeLogic';
```

**Step 3: Run tests to verify they fail**

Run: `npm test narrativeLogic`
Expected: FAIL with "inferNodeType is not a function"

**Step 4: Implement inference utilities**

Add to end of `src/utils/narrativeLogic.ts`:

```typescript
// =============================================================================
// Node Type Inference
// =============================================================================

/**
 * Infer node type from structure (when type not explicitly set)
 * Priority order:
 * 1. Combat if startCombat effect present
 * 2. Dialogue if speaker present
 * 3. Explore if title or locationHint present
 * 4. Event otherwise
 */
export function inferNodeType(node: StoryNode): NodeType {
  // 1. Combat if startCombat effect present
  if (node.onEnter?.some((e) => e.type === 'startCombat')) {
    return 'combat';
  }

  // 2. Dialogue if speaker present
  if (node.speakerName) {
    return 'dialogue';
  }

  // 3. Explore if location/title hints
  if (node.title || node.locationHint) {
    return 'explore';
  }

  // 4. Default to event
  return 'event';
}

/**
 * Get effective node type (explicit or inferred)
 */
export function getNodeType(node: StoryNode): NodeType {
  return node.type ?? inferNodeType(node);
}
```

**Step 5: Add imports at top of narrativeLogic.ts**

Add `NodeType` to the import from types:

```typescript
import type {
  Requirement,
  Choice,
  ChoiceOutcome,
  NodeEffect,
  LogEntry,
  WorldState,
  SkillCheckResult,
  OutcomeResolution,
  EffectResult,
  NodeType, // ADD THIS
} from '../types';
```

**Step 6: Run tests to verify they pass**

Run: `npm test narrativeLogic`
Expected: PASS (all tests including new ones)

**Step 7: Commit**

```bash
git add src/utils/narrativeLogic.ts src/__tests__/utils/narrativeLogic.test.ts
git commit -m "feat: add node type inference utilities

Add inferNodeType() and getNodeType() with priority:
1. Combat (startCombat effect)
2. Dialogue (speakerName)
3. Explore (title/locationHint)
4. Event (default)

Comprehensive test coverage for all inference cases."
```

---

## Task 3: Add Icon Mapping Utility

**Files:**
- Create: `src/utils/nodeIcons.tsx`
- Modify: `package.json` (to ensure lucide-react is installed)

**Step 1: Check if lucide-react is installed**

Run: `npm list lucide-react`
Expected: Should show version (already installed in most React projects)

If NOT installed, run: `npm install lucide-react`

**Step 2: Create icon mapping utility**

Create file `src/utils/nodeIcons.tsx`:

```typescript
import {
  Sword,
  Shield,
  Skull,
  AlertTriangle,
  MessageCircle,
  Volume2,
  HelpCircle,
  AlertCircle,
  Map,
  Compass,
  Search,
  MapPin,
  Gem,
  Trophy,
  XCircle,
  Gift,
  Sparkles,
  AlertOctagon,
  Wand2,
  Crown,
} from 'lucide-react';
import type { NodeIcon } from '../types';

/**
 * Maps NodeIcon string values to Lucide React icon components
 */
export const ICON_MAP: Record<NodeIcon, React.ComponentType<{ className?: string }>> = {
  // Combat
  sword: Sword,
  shield: Shield,
  skull: Skull,
  danger: AlertTriangle,

  // Social
  dialogue: MessageCircle,
  speech: Volume2,
  question: HelpCircle,
  exclamation: AlertCircle,

  // Exploration
  map: Map,
  compass: Compass,
  search: Search,
  location: MapPin,

  // Outcomes
  treasure: Gem,
  victory: Trophy,
  defeat: XCircle,
  reward: Gift,

  // Atmosphere
  mystery: Sparkles,
  warning: AlertOctagon,
  magic: Wand2,
  crown: Crown,
};

/**
 * Get the icon component for a NodeIcon name
 */
export function getNodeIconComponent(
  icon: NodeIcon | undefined
): React.ComponentType<{ className?: string }> | null {
  if (!icon) return null;
  return ICON_MAP[icon] ?? null;
}
```

**Step 3: Build to verify no errors**

Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/utils/nodeIcons.tsx
git commit -m "feat: add icon mapping for NodeFlavor

Map NodeIcon values to Lucide React components.
Provides getNodeIconComponent() helper for UI usage."
```

---

## Task 4: Add Tone Styling Constants

**Files:**
- Create: `src/utils/nodeStyles.ts`

**Step 1: Create tone styling utility**

Create file `src/utils/nodeStyles.ts`:

```typescript
import type { NodeTone } from '../types';

/**
 * Tailwind CSS classes for each tone
 * Applied to node containers for visual emphasis
 */
export const TONE_STYLES: Record<NodeTone, string> = {
  calm: 'border-blue-300 bg-blue-50',
  tense: 'border-orange-400 bg-orange-50',
  mysterious: 'border-purple-400 bg-purple-50',
  danger: 'border-red-500 bg-red-50',
  triumphant: 'border-yellow-400 bg-yellow-50',
  urgent: 'border-red-600 bg-red-100 animate-pulse',
};

/**
 * Get Tailwind classes for a tone (or empty string if none)
 */
export function getToneStyles(tone: NodeTone | undefined): string {
  if (!tone) return '';
  return TONE_STYLES[tone] ?? '';
}
```

**Step 2: Build to verify**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/utils/nodeStyles.ts
git commit -m "feat: add tone-based styling utilities

Map NodeTone values to Tailwind CSS classes.
Provides getToneStyles() helper for UI components."
```

---

## Task 5: Update Type Tests for StoryNode

**Files:**
- Modify: `src/__tests__/types/narrative.test.ts`

**Step 1: Add tests for new fields**

Add to end of `src/__tests__/types/narrative.test.ts`:

```typescript
describe('StoryNode with type and flavor', () => {
  it('accepts optional type field', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      type: 'combat',
      choices: [],
    };
    expect(node.type).toBe('combat');
  });

  it('accepts optional flavor with tone', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      flavor: { tone: 'danger' },
      choices: [],
    };
    expect(node.flavor?.tone).toBe('danger');
  });

  it('accepts optional flavor with icon', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      flavor: { icon: 'sword' },
      choices: [],
    };
    expect(node.flavor?.icon).toBe('sword');
  });

  it('accepts optional flavor with both tone and icon', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      flavor: { tone: 'danger', icon: 'sword' },
      choices: [],
    };
    expect(node.flavor?.tone).toBe('danger');
    expect(node.flavor?.icon).toBe('sword');
  });

  it('works without type or flavor (backwards compatible)', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'Legacy node',
      choices: [],
    };
    expect(node.type).toBeUndefined();
    expect(node.flavor).toBeUndefined();
  });

  it('accepts all valid NodeType values', () => {
    const types: NodeType[] = ['explore', 'dialogue', 'event', 'combat'];
    types.forEach((type) => {
      const node: StoryNode = {
        id: 'test',
        description: 'Test',
        type,
        choices: [],
      };
      expect(node.type).toBe(type);
    });
  });

  it('accepts all valid NodeTone values', () => {
    const tones: NodeTone[] = ['calm', 'tense', 'mysterious', 'danger', 'triumphant', 'urgent'];
    tones.forEach((tone) => {
      const node: StoryNode = {
        id: 'test',
        description: 'Test',
        flavor: { tone },
        choices: [],
      };
      expect(node.flavor?.tone).toBe(tone);
    });
  });
});
```

**Step 2: Add missing imports**

Add to imports at top of `src/__tests__/types/narrative.test.ts`:

```typescript
import type { NodeType, NodeTone } from '../../types';
```

**Step 3: Run tests**

Run: `npm test narrative.test`
Expected: PASS (all new type tests)

**Step 4: Commit**

```bash
git add src/__tests__/types/narrative.test.ts
git commit -m "test: add comprehensive tests for type and flavor fields

Verify StoryNode accepts all optional type/flavor combinations
and maintains backwards compatibility."
```

---

## Task 6: Update NarrativeScreen to Display Type and Flavor

**Files:**
- Modify: `src/screens/NarrativeScreen.tsx`

**Step 1: Add imports**

Add to imports at top of `src/screens/NarrativeScreen.tsx`:

```typescript
import { getNodeType } from '../utils/narrativeLogic';
import { getNodeIconComponent } from '../utils/nodeIcons';
import { getToneStyles } from '../utils/nodeStyles';
```

**Step 2: Find the node content rendering section**

Look for where the node description is rendered (likely in a card/container).

**Step 3: Add icon rendering before description**

Add icon display above the description text. Example integration:

```typescript
// Get effective type and flavor
const nodeType = getNodeType(currentNode);
const tone = currentNode.flavor?.tone;
const IconComponent = getNodeIconComponent(currentNode.flavor?.icon);
const toneClasses = getToneStyles(tone);

// In JSX, render icon if present:
{IconComponent && (
  <div className="mb-2">
    <IconComponent className="w-6 h-6 text-text-accent" />
  </div>
)}
```

**Step 4: Add tone styling to node container**

Add tone classes to the main node card container. Example:

```typescript
<div className={`narrative-card ${toneClasses}`}>
  {/* existing content */}
</div>
```

**Step 5: Test in browser**

Run: `npm run dev`

Test with existing campaign - should work without changes (no tone/icon).

**Step 6: Commit**

```bash
git add src/screens/NarrativeScreen.tsx
git commit -m "feat: display node flavor (icon and tone) in NarrativeScreen

- Show icon if flavor.icon is present
- Apply tone styling if flavor.tone is present
- Graceful fallback when fields are missing
- Backwards compatible with existing nodes"
```

---

## Task 7: Add Example Nodes to Test Campaign

**Files:**
- Modify: `src/data/campaigns/test-campaign.ts`

**Step 1: Add explicit type and flavor to combat node**

Find the node `test-bandit-camp-fight` (around line 299) and add type/flavor:

```typescript
{
  id: 'test-bandit-camp-fight',
  description:
    'You charge forward! The skeleton\'s eyes flare bright as it rises to meet your attack.',
  locationId: 'bandit-camp',
  type: 'combat', // ADDED
  flavor: { tone: 'danger', icon: 'skull' }, // ADDED
  onEnter: [
    {
      type: 'startCombat',
      enemyId: 'skeleton',
      onVictoryNodeId: 'test-victory',
    },
  ],
  choices: [],
},
```

**Step 2: Add flavor to victory node**

Find node `test-victory` (around line 335) and add flavor:

```typescript
{
  id: 'test-victory',
  title: 'Victory!',
  description:
    'The skeleton crumbles to dust. Searching the camp, you find the stolen goods from the village, along with a mysterious letter bearing an unfamiliar seal.',
  type: 'event', // ADDED
  flavor: { tone: 'triumphant', icon: 'victory' }, // ADDED
  onEnter: [
    { type: 'setFlag', flag: 'defeated_bandit', value: true },
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

**Step 3: Add tense flavor to intimidation node**

Find node `test-guard-refuses` (around line 135) and add flavor:

```typescript
{
  id: 'test-guard-refuses',
  speakerName: 'Village Guard',
  speakerPortrait: 'portraits/guard.png',
  description:
    'The guard narrows his eyes. "I\'ve dealt with worse than you today. Try that again and you\'ll regret it."',
  flavor: { tone: 'tense', icon: 'warning' }, // ADDED
  choices: [
    {
      id: 'choice-back-down',
      text: 'Back down and ask politely',
      outcome: { type: 'goto', nodeId: 'test-village' },
    },
    {
      id: 'choice-leave-angry',
      text: 'Leave in frustration',
      outcome: { type: 'exit' },
    },
  ],
},
```

**Step 4: Add mysterious exploration flavor**

Find node `test-forest` (around line 198) and add type/flavor:

```typescript
{
  id: 'test-forest',
  title: 'The Darkwood Forest',
  description:
    'The forest is unnaturally quiet. Twisted trees block out most of the sunlight, and the air feels heavy. You notice disturbed undergrowth - someone passed through here recently.',
  locationHint: 'Darkwood Forest - A place of shadows',
  type: 'explore', // ADDED (explicit to override event inference)
  flavor: { tone: 'mysterious', icon: 'compass' }, // ADDED
  companionHint: 'There are tracks here. A skilled eye might be able to read them.',
  choices: [
    // ... existing choices
  ],
},
```

**Step 5: Test in browser**

Run: `npm run dev`

Navigate through the test campaign and verify:
- Victory node shows trophy icon + triumphant styling (yellow)
- Combat node shows skull icon + danger styling (red)
- Forest node shows compass icon + mysterious styling (purple)
- Guard refusal shows warning icon + tense styling (orange)
- Other nodes without flavor look normal (backwards compatible)

**Step 6: Commit**

```bash
git add src/data/campaigns/test-campaign.ts
git commit -m "feat: add type and flavor to test campaign nodes

Demonstrate new presentation features:
- Combat: danger tone + skull icon
- Victory: triumphant tone + victory icon
- Tense dialogue: tense tone + warning icon
- Mysterious exploration: mysterious tone + compass icon

All other nodes work unchanged (backwards compatible)."
```

---

## Task 8: Run Full Test Suite and Build

**Step 1: Run all tests**

Run: `npm test`
Expected: PASS (all tests including new ones)

**Step 2: Run linter**

Run: `npm run lint`
Expected: No errors

**Step 3: Build for production**

Run: `npm run build`
Expected: SUCCESS (no type errors, builds cleanly)

**Step 4: Test in browser one more time**

Run: `npm run dev`

Test:
- Navigate through test campaign
- Verify icons and tones display correctly
- Check console for any errors
- Test on both desktop and mobile viewport

**Step 5: Final commit if any fixes needed**

If you made any fixes in previous steps, commit them:

```bash
git add .
git commit -m "fix: final cleanup and polish for type/flavor system"
```

---

## Task 9: Update Documentation (Optional but Recommended)

**Files:**
- Modify: `CLAUDE.md` (project instructions)

**Step 1: Add section about type and flavor**

Add to `CLAUDE.md` after the "Semantic Typography System" section (around line 270):

```markdown
### StoryNode Type and Flavor System

Nodes can optionally specify a **semantic type** and **presentation flavor** to improve UI framing without affecting game logic.

**Defined in:** `src/types/narrative.ts`

**Type (optional):**
```typescript
type?: 'explore' | 'dialogue' | 'event' | 'combat'
```

**Automatic inference when omitted:**
1. `startCombat` effect → `'combat'`
2. `speakerName` present → `'dialogue'`
3. `title` or `locationHint` → `'explore'`
4. Otherwise → `'event'`

Get effective type: `getNodeType(node)` from `utils/narrativeLogic`

**Flavor (optional):**
```typescript
flavor?: {
  tone?: 'calm' | 'tense' | 'mysterious' | 'danger' | 'triumphant' | 'urgent';
  icon?: NodeIcon; // See types/narrative.ts for full list
}
```

**Icon mapping:** Icons use Lucide React components via `ICON_MAP` in `utils/nodeIcons`

**Tone styling:** CSS classes defined in `utils/nodeStyles`

**Usage pattern:**
```typescript
// Explicit combat with danger flavor
{
  id: 'ambush',
  type: 'combat',
  flavor: { tone: 'danger', icon: 'sword' },
  onEnter: [{ type: 'startCombat', ... }],
  // ...
}

// Inferred dialogue with tense flavor
{
  id: 'interrogation',
  speakerName: 'Guard',
  // type: 'dialogue' inferred
  flavor: { tone: 'tense', icon: 'warning' },
  // ...
}

// Legacy node (no changes needed)
{
  id: 'old-node',
  description: 'Works fine without type or flavor',
  // ...
}
```

**Benefits:**
- Clear UI framing per node type
- Visual emphasis with tone/icon
- Future-proof for audio/animations
- Better analytics
- Fully backwards compatible
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add StoryNode type and flavor system to CLAUDE.md

Document the new optional fields, inference rules, and usage patterns
for future development."
```

---

## Completion Checklist

- [ ] Type definitions added to `narrative.ts`
- [ ] Inference utilities implemented with tests
- [ ] Icon mapping utility created (Lucide React)
- [ ] Tone styling utility created (Tailwind)
- [ ] Type tests pass
- [ ] Inference tests pass
- [ ] UI updated to display icon and tone
- [ ] Test campaign enhanced with examples
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Browser testing complete
- [ ] Documentation updated (CLAUDE.md)

## Testing the Implementation

**Manual test flow:**

1. Start dev server: `npm run dev`
2. Load test campaign
3. Navigate to forest node → should see compass icon + purple mysterious styling
4. Navigate to guard refusal → should see warning icon + orange tense styling
5. Trigger skeleton combat → should see skull icon + red danger styling
6. Win combat → should see trophy icon + yellow triumphant styling
7. Visit nodes without flavor → should look normal (neutral)

**Automated tests:**

```bash
npm test                    # Run all tests
npm test narrativeLogic     # Test inference specifically
npm test narrative.test     # Test type definitions
npm run build              # Verify TypeScript compiles
npm run lint               # Verify code style
```

## Architecture Notes

**Why this approach:**

- **Backwards compatible** - All fields optional, existing nodes unchanged
- **DRY** - Inference reduces boilerplate for obvious cases
- **YAGNI** - Start with 6 tones and ~20 icons, expand only if needed
- **Separation of concerns** - Game logic unchanged, presentation enhanced
- **Type-safe** - TypeScript ensures valid type/tone/icon values
- **Testable** - Inference logic is pure functions, easily tested

**Future enhancements:**

Can add later without breaking changes:
- Audio cues per tone
- Animations per type
- Additional tones/icons
- Flavor intensity levels
- Analytics tracking

## Design Document Reference

See `docs/plans/2025-12-17-story-node-type-and-flavor-design.md` for complete design rationale and examples.
