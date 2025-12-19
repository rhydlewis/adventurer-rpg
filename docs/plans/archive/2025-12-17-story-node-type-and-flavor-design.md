# StoryNode Type and Flavor Design

**Date:** 2025-12-17
**Status:** Approved
**Author:** Design brainstorming session

## Overview

This design adds optional `type` and `flavor` fields to `StoryNode` to separate **what happens** (game logic) from **how it's presented** (UI/UX). This enables clearer UI framing, future audio/visual cues, better analytics, and improved authoring clarity—all without impacting existing game logic or requiring migration.

## Motivation

### Why Add Node Type?

1. **Clear UI framing** - Different node types enable distinct presentations:
   - **Explore** → location header, ambience, "look around" style
   - **Dialogue** → speaker portrait, conversational layout
   - **Event** → focused "moment" card (rewards, transitions)
   - **Combat** → danger framing, skip choices if combat auto-starts

2. **Future-proof for enhancements** - Enables later additions without data changes:
   - Distinct ambience and music per type
   - Type-specific animations and transitions
   - Audio cues and sound effects

3. **Better pacing & analytics** - Measure where players:
   - Enter combat
   - Spend time in dialogue
   - Exit or struggle
   - Helps tune difficulty and narrative flow

4. **Authoring clarity** - Makes large campaigns easier to reason about at a glance

5. **Safe, incremental adoption** - Entirely optional with sensible inference fallbacks

### Why Add Node Flavor?

1. **Separates meaning from mood** - Narrative logic stays clean, flavor controls emphasis only

2. **Tonal consistency** - Ensures similar moments feel similar across the game

3. **Player readability** - Visual cues help players understand the moment instantly

4. **Incremental polish** - Start simple (icon + color), expand later (animations, sounds)

5. **Data-driven presentation** - Avoids hard-coded UI rules in components

6. **Entirely optional** - Nodes without flavor get neutral presentation

## Design Decisions

### Type System

**Field Definition:**
```typescript
type?: 'explore' | 'dialogue' | 'event' | 'combat'
```

**Approach: Mixed (Explicit + Inference)**
- Authors specify `type` explicitly when needed (ambiguous cases)
- Obvious cases are inferred automatically
- **Why:** Balance between clarity and convenience

**Inference Algorithm (Priority Order):**
```typescript
1. Has onEnter with startCombat → 'combat'
2. Has speakerName → 'dialogue'
3. Has title or locationHint → 'explore'
4. Otherwise → 'event'
```

**Why Effects Win:** If combat starts on entry, frame it as combat even if there's a speaker ("The bandit snarls and attacks!"). Actions speak louder than words.

**Independence from ChoiceCategory:**
- Node `type` controls overall scene framing and layout
- `ChoiceCategory` still styles individual choice buttons
- Both layers work together (e.g., dialogue node can have combat choice)

### Flavor System

**Field Definition:**
```typescript
flavor?: {
  tone?: 'calm' | 'tense' | 'mysterious' | 'danger' | 'triumphant' | 'urgent';
  icon?: NodeIcon; // Preset enum
}
```

**Tone Values:**
- `calm` - Peaceful, safe moments
- `tense` - High-stakes, uncertain situations
- `mysterious` - Intrigue, discovery, unknown
- `danger` - Immediate threat, combat
- `triumphant` - Victory, success, achievement
- `urgent` - Time-sensitive, critical decisions

**Icon Presets:**
```typescript
type NodeIcon =
  // Combat
  | 'sword' | 'shield' | 'skull' | 'danger'
  // Social
  | 'dialogue' | 'speech' | 'question' | 'exclamation'
  // Exploration
  | 'map' | 'compass' | 'search' | 'location'
  // Outcomes
  | 'treasure' | 'victory' | 'defeat' | 'reward'
  // Atmosphere
  | 'mystery' | 'warning' | 'magic' | 'crown';
```

**Icon Implementation:**
- Icons map to Lucide React components (not emojis)
- Author-configurable from preset list
- Ensures consistency while giving control

**No Default Tones:**
- When `flavor` is omitted, presentation is neutral
- Authors must explicitly set tone when they want it
- **Why:** Opt-in only, no surprises, backwards compatible

## Implementation

### Type Definitions

**Location:** `src/types/narrative.ts`

```typescript
// Node semantic types
export type NodeType = 'explore' | 'dialogue' | 'event' | 'combat';

// Presentation tones
export type NodeTone = 'calm' | 'tense' | 'mysterious' | 'danger' | 'triumphant' | 'urgent';

// Icon presets
export type NodeIcon =
  | 'sword' | 'shield' | 'skull' | 'danger'
  | 'dialogue' | 'speech' | 'question' | 'exclamation'
  | 'map' | 'compass' | 'search' | 'location'
  | 'treasure' | 'victory' | 'defeat' | 'reward'
  | 'mystery' | 'warning' | 'magic' | 'crown';

// Flavor object
export interface NodeFlavor {
  tone?: NodeTone;
  icon?: NodeIcon;
}

// Update StoryNode interface
export interface StoryNode {
  id: string;
  title?: string;
  description: string;
  speakerName?: string;
  speakerPortrait?: string;
  locationHint?: string;
  locationId?: string;

  // NEW FIELDS
  type?: NodeType;
  flavor?: NodeFlavor;

  choices: Choice[];
  onEnter?: NodeEffect[];
  companionHint?: string;
}
```

### Utility Functions

**Location:** `src/utils/narrativeLogic.ts`

```typescript
/**
 * Infer node type from structure (when type not explicitly set)
 */
export function inferNodeType(node: StoryNode): NodeType {
  // 1. Combat if startCombat effect present
  if (node.onEnter?.some(e => e.type === 'startCombat')) {
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

### UI Implementation

**Icon Mapping:**

```typescript
// src/utils/nodeIcons.ts
import {
  Sword, Shield, Skull, AlertTriangle,
  MessageCircle, Volume2, HelpCircle, AlertCircle,
  Map, Compass, Search, MapPin,
  Gem, Trophy, XCircle, Gift,
  Sparkles, AlertOctagon, Wand2, Crown
} from 'lucide-react';
import type { NodeIcon } from '../types';

export const ICON_MAP: Record<NodeIcon, React.ComponentType> = {
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
```

**Type-Based Framing:**

```typescript
// In NarrativeScreen component
function renderNodeByType(node: StoryNode, type: NodeType) {
  switch (type) {
    case 'explore':
      // Location header, atmospheric framing
      return <ExploreFrame location={node.locationHint} />;

    case 'dialogue':
      // Speaker portrait, conversational layout
      return <DialogueFrame speaker={node.speakerName} portrait={node.speakerPortrait} />;

    case 'combat':
      // Danger framing, skip choices if combat auto-starts
      return <CombatFrame />;

    case 'event':
      // Focused "moment" card (rewards, transitions)
      return <EventFrame />;
  }
}
```

**Tone-Based Styling:**

```typescript
// Example tone → CSS mapping (Tailwind)
const TONE_STYLES: Record<NodeTone, string> = {
  calm: 'border-blue-300 bg-blue-50',
  tense: 'border-orange-400 bg-orange-50',
  mysterious: 'border-purple-400 bg-purple-50',
  danger: 'border-red-500 bg-red-50',
  triumphant: 'border-yellow-400 bg-yellow-50',
  urgent: 'border-red-600 bg-red-100 animate-pulse'
};
```

## Testing Strategy

### Type Tests

**Location:** `src/__tests__/types/narrative.test.ts`

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

  it('accepts optional flavor field', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'A test node',
      flavor: { tone: 'danger', icon: 'sword' },
      choices: [],
    };
    expect(node.flavor?.tone).toBe('danger');
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
});
```

### Inference Tests

**Location:** `src/__tests__/utils/narrativeLogic.test.ts`

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

  it('defaults to event', () => {
    const node: StoryNode = {
      id: 'moment',
      description: 'Something happens',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('event');
  });

  it('respects explicit type over inference', () => {
    const node: StoryNode = {
      id: 'special',
      description: 'NPC attacks mid-dialogue',
      speakerName: 'Bandit',
      type: 'combat', // Explicit override
      onEnter: [{ type: 'startCombat', enemyId: 'bandit', onVictoryNodeId: 'win' }],
      choices: [],
    };
    expect(getNodeType(node)).toBe('combat'); // Uses explicit type
  });
});
```

## Example Usage

### Combat Node (Explicit + Flavor)

```typescript
{
  id: 'bandit-ambush',
  description: 'The bandit leaps from the shadows!',
  type: 'combat', // Explicit (though could be inferred)
  flavor: { tone: 'danger', icon: 'sword' },
  onEnter: [
    { type: 'startCombat', enemyId: 'bandit', onVictoryNodeId: 'victory' }
  ],
  choices: [], // Combat starts immediately
}
```

### Dialogue Node (Inferred + Tense Flavor)

```typescript
{
  id: 'interrogation',
  speakerName: 'Guard Captain',
  speakerPortrait: 'portraits/captain.png',
  description: 'The captain leans forward, eyes narrowed. "Tell me everything."',
  // type: 'dialogue' inferred from speakerName
  flavor: { tone: 'tense', icon: 'warning' },
  choices: [
    { id: 'tell-truth', text: 'Tell the truth', outcome: { type: 'goto', nodeId: 'truth' } },
    { id: 'lie', text: 'Lie convincingly', outcome: { type: 'check', skill: 'Bluff', dc: 15, ... } },
  ],
}
```

### Exploration Node (Explicit + Mysterious)

```typescript
{
  id: 'ancient-ruins',
  title: 'The Ancient Ruins',
  description: 'Crumbling stone pillars stretch into the mist. Strange runes pulse with faint light.',
  locationHint: 'Ancient Ruins - A place of forgotten magic',
  type: 'explore', // Explicit - needed to distinguish from 'event'
  flavor: { tone: 'mysterious', icon: 'compass' },
  choices: [
    { id: 'examine-runes', text: 'Examine the runes', outcome: { type: 'check', skill: 'Arcana', ... } },
    { id: 'search-area', text: 'Search for treasure', outcome: { type: 'explore', tableId: 'ruins-loot', ... } },
    { id: 'leave', text: 'Leave this place', outcome: { type: 'goto', nodeId: 'crossroads' } },
  ],
}
```

### Event Node (Triumphant Victory)

```typescript
{
  id: 'dragon-slain',
  title: 'Victory!',
  description: 'The dragon crashes to the ground, defeated. The kingdom is saved!',
  type: 'event', // Explicit
  flavor: { tone: 'triumphant', icon: 'victory' },
  onEnter: [
    { type: 'giveItem', itemId: 'dragon-scale' },
    { type: 'giveGold', amount: 1000 },
    { type: 'setFlag', flag: 'dragon_defeated', value: true },
  ],
  choices: [
    { id: 'celebrate', text: 'Return to the castle', outcome: { type: 'goto', nodeId: 'celebration' } },
  ],
}
```

### Legacy Node (No Changes)

```typescript
{
  id: 'crossroads',
  description: 'You stand at a crossroads.',
  // No type or flavor - works fine
  // type inferred as 'event' (no speaker, no title, no combat)
  // No flavor = neutral presentation
  choices: [
    { id: 'north', text: 'Go north', outcome: { type: 'goto', nodeId: 'village' } },
    { id: 'south', text: 'Go south', outcome: { type: 'goto', nodeId: 'forest' } },
  ],
}
```

## Backwards Compatibility

✅ **Fully backwards compatible:**
- All fields are optional
- Existing campaigns work unchanged
- Inference provides sensible defaults
- UI gracefully handles missing fields
- No migration required

## Future Extensibility

Easy to add later without changing data model:

1. **Audio cues** - Different music/ambience per type and tone
2. **Transition animations** - Type-specific scene transitions
3. **Additional tones** - `heroic`, `somber`, `playful`, `romantic`
4. **Additional icons** - Expand preset list as needed
5. **Flavor intensity** - `flavor: { tone: 'danger', intensity: 'high' }`
6. **Combination effects** - UI rules that combine type + tone

## Adoption Strategy

1. **Phase 1: Add types (non-breaking)**
   - Add type definitions to `narrative.ts`
   - Add inference utilities to `narrativeLogic.ts`
   - Add tests for types and inference

2. **Phase 2: Update UI (graceful)**
   - Create icon mapping utility
   - Update NarrativeScreen to use type/flavor when present
   - Add tone-based styling
   - Fallback to current presentation when fields missing

3. **Phase 3: Enhance campaigns (gradual)**
   - Add explicit `type` to ambiguous nodes (event vs explore)
   - Add `flavor` to key dramatic moments
   - Test player engagement with analytics

4. **Phase 4: Monitor & iterate**
   - Track which types/flavors engage players
   - Expand icon/tone options based on usage
   - Add audio/animation enhancements

## Summary

Adding `type` and `flavor` to StoryNode provides:

- **Clear UI framing** for different narrative moments
- **Future-proof architecture** for audio/visual enhancements
- **Better analytics** for pacing and engagement
- **Improved authoring** clarity and maintainability
- **Zero breaking changes** with graceful fallbacks
- **Incremental adoption** at author's pace

This design separates **what happens** from **how it's presented**, keeping game logic clean while enabling rich, polished presentation.
