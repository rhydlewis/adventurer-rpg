# Location Visuals Design

**Date:** 2025-12-15
**Status:** Design Complete - Ready for Implementation

## Overview

Add visual atmosphere to the narrative engine by displaying location images as full-screen backgrounds with gradient overlays. Locations use a rich metadata system with IDs, names, images, and atmospheric text.

## Design Decisions

### 1. Location Data Structure

**Approach:** Location IDs with rich metadata

Locations are defined as reusable objects with:
- `id` - Unique identifier (e.g., 'rusty-tavern')
- `name` - Display name (e.g., 'The Rusty Tavern')
- `image` - Filename in `/public/assets/locations/`
- `ambience` (optional) - Atmospheric flavor text
- `description` (optional) - Longer scene description

**Rationale:** Rich metadata enables atmospheric world-building while maintaining flexibility through optional fields.

### 2. Node-to-Location Relationship

**Approach:** Node-level override with Act fallback

- Acts have default `locationId` (already exists in schema)
- StoryNodes can override with their own `locationId?` field
- Resolution priority: `node.locationId` → `act.locationId` → `null`

**Rationale:** DRY principle for most nodes (inherit from Act), flexibility for scene-specific overrides.

### 3. UI Presentation

**Approach:** Full background with dark gradient overlay

- Location image fills screen/container as background
- CSS gradient overlay (30% dark at top → 70% dark at bottom)
- Narrative text sits in Card components over the darker area
- Ensures text readability across varied images

**Rationale:** Maximum immersion and atmosphere while guaranteeing text contrast.

### 4. Text Readability Solution

**Approach:** Dark gradient overlay (transparent to opaque)

```css
background-image:
  linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%),
  url(/assets/locations/image.png);
```

**Rationale:** Subtle, professional approach that works with most images without heavy-handed overlays.

## Architecture

### Type Definitions

**File:** `src/types/narrative.ts`

```typescript
export interface Location {
  id: string;
  name: string;
  image: string;
  ambience?: string;
  description?: string;
}

export interface StoryNode {
  // ... existing fields ...
  locationId?: string;  // NEW: Override Act's location
}
```

### Data Layer

**File:** `src/data/locations.ts`

```typescript
import type { Location } from '../types/narrative';

export const LOCATIONS: Record<string, Location> = {
  'rusty-tavern': {
    id: 'rusty-tavern',
    name: 'The Rusty Tavern',
    image: 'card_location_exterior_00015.png',
    ambience: 'The air is thick with pipe smoke and the smell of ale',
    description: 'A weathered establishment on the edge of town'
  },
  // ... more locations
} as const;

export const LOCATION_IDS = Object.keys(LOCATIONS) as Array<keyof typeof LOCATIONS>;
```

### Resolution Logic

**File:** `src/utils/locationResolver.ts`

```typescript
import type { Location, StoryNode, Act } from '../types/narrative';
import { LOCATIONS } from '../data/locations';

/**
 * Resolves the location for a story node
 * Priority: node.locationId > act.locationId > null
 */
export function resolveLocation(
  node: StoryNode,
  act: Act
): Location | null {
  const locationId = node.locationId ?? act.locationId;

  if (!locationId) return null;

  return LOCATIONS[locationId] ?? null;
}

/**
 * Gets default ambience text for a node's location
 * Can be overridden by node.locationHint
 */
export function getLocationAmbience(
  node: StoryNode,
  act: Act
): string | undefined {
  const location = resolveLocation(node, act);
  return location?.ambience;
}
```

### UI Implementation

**File:** `src/screens/StoryScreen.tsx`

```typescript
import { resolveLocation } from '../utils/locationResolver';

// Inside component:
const location = currentNode && currentAct
  ? resolveLocation(currentNode, currentAct)
  : null;

const backgroundStyle = location ? {
  backgroundImage: `
    linear-gradient(to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.7) 100%
    ),
    url(/assets/locations/${location.image})
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
} : {};

// Apply to container element
<div style={backgroundStyle} className="...">
  {/* Narrative content */}
</div>
```

## Data Flow

1. UI renders with `currentNode` and `currentAct` from narrative store
2. Component calls `resolveLocation(currentNode, currentAct)`
3. Resolver checks `node.locationId` first, falls back to `act.locationId`
4. Returns `Location` object or `null` (graceful degradation)
5. UI applies background styling if location exists
6. Gradient overlay ensures text readability

## Testing Strategy

**File:** `src/__tests__/utils/locationResolver.test.ts`

Test cases:
- Node `locationId` overrides Act `locationId`
- Falls back to Act `locationId` when node doesn't specify
- Returns `null` when neither has `locationId`
- Returns `null` for invalid `locationId` references (error handling)
- `getLocationAmbience()` returns correct ambience text

## Integration Points

### Narrative Store
- **No changes needed** - location resolution is pure function
- Store continues managing `currentNodeId` and `currentActId`
- UI calls `resolveLocation()` directly during render

### Backward Compatibility
- All new fields are optional (`locationId?`, `ambience?`, `description?`)
- Existing campaigns without locations work unchanged
- No migration needed for existing story nodes
- Locations can be added incrementally to content

### Content Authoring
1. Define locations in `data/locations.ts` with IDs, names, images, metadata
2. Set `act.locationId` for default location throughout the act
3. Override with `node.locationId` only when scene changes within an act
4. Node's `locationHint` can still provide custom atmospheric text overrides

## Implementation Checklist

- [ ] Add `Location` interface to `src/types/narrative.ts`
- [ ] Add `locationId?: string` field to `StoryNode` interface
- [ ] Create `src/data/locations.ts` with `LOCATIONS` record
- [ ] Create `src/utils/locationResolver.ts` with resolution logic
- [ ] Write tests in `src/__tests__/utils/locationResolver.test.ts`
- [ ] Update `src/screens/StoryScreen.tsx` with background styling
- [ ] Add location IDs to test campaign acts/nodes
- [ ] Verify text readability across different location images
- [ ] Test on mobile viewports for background scaling

## Edge Cases & Considerations

- **Missing image files:** Broken URLs gracefully fall back to no background
- **Very bright images:** May require darker gradient values (adjustable)
- **Mobile viewports:** Ensure `background-size: cover` scales appropriately
- **Performance:** Consider lazy loading images for large campaigns
- **Accessibility:** Verify text contrast meets WCAG standards against gradient

## Optional Future Enhancements

- Parallax scrolling effects on background
- Smooth fade transitions when location changes between nodes
- Multiple image variants per location
- Time-of-day variants (dawn/day/dusk/night versions)
- Location name badge display (subtle UI element showing `location.name`)
- Use `location.ambience` as smart default for `locationHint` text

## Assets

**Location:** `/public/assets/locations/`
**Format:** PNG images
**Example:** `card_location_exterior_00015.png`

Images should work well with dark gradient overlay and be optimized for web (reasonable file sizes).

---

**Next Steps:** Ready for implementation. Consider using git worktrees for isolation and creating detailed implementation plan.
