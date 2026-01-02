# World Map Canvas POC Design

**Date:** 2026-01-02
**Status:** Design Complete
**Goal:** Create a proof-of-concept coordinate-based world map with pan/zoom navigation

## Overview

This POC replaces the grid-based location layout with a coordinate-based canvas map that shows spatial relationships, distance, and direction between locations. The POC will eventually become an alternative view mode (toggle between grid and canvas).

## Design Decisions

### Visual Style
**Abstract node map** - Clean circles/icons for locations connected by lines, similar to a subway map or skill tree. Focuses on the coordinate system and navigation mechanics rather than graphics.

### Connections
**Explicit connection data with branching** - Locations define which other locations they connect to via `connections: string[]` field. Allows flexible branching paths (e.g., Crossroads connects to both Tavern and Forest).

### Interaction
**Pan & Zoom** - Mouse drag (or touch drag) to pan, scroll wheel (or pinch) to zoom in/out. Centers on current location when opening. Includes recenter button.

### Coordinates
**Abstract units** - Simple numbers like `x: 0, y: 0` that scale to pixels based on zoom. 100 units = typical distance between connected locations.

---

## Data Model

### Location Type Enhancement

Add two new optional fields to the `Location` interface in `src/types/narrative.ts`:

```typescript
export interface Location {
  id: string;
  name: string;
  image: string;
  ambience?: string;
  description?: string;
  locationType: LocationType;
  hasMerchant?: boolean;
  firstVisitNodeId?: string;
  hubNodeId?: string;
  explorationTableId?: string;

  // NEW: Canvas map fields (optional)
  coordinates?: {
    x: number;  // Abstract units (100 units = typical connection distance)
    y: number;  // Abstract units
  };
  connections?: string[];  // IDs of locations this connects to
}
```

### Coordinate System

- **Origin:** (0, 0) at the center of the world
- **Scale:** 100 units = standard distance between connected locations
- **Direction:**
  - Positive X = East, Negative X = West
  - Positive Y = South, Negative Y = North (standard canvas coordinates)

### Example Location Data

```typescript
'crossroads': {
  id: 'crossroads',
  name: 'The Crossroads',
  image: 'card_location_signpost.png',
  ambience: 'The Crossroads - Where your journey begins',
  description: 'A weathered signpost marks the intersection of three paths',
  locationType: 'wilderness',
  coordinates: { x: 0, y: 0 },
  connections: ['rusty-tavern', 'forest-path', 'bandit-camp']
},
'rusty-tavern': {
  id: 'rusty-tavern',
  name: 'The Rusty Tavern',
  image: 'card_location_exterior_00015.png',
  ambience: 'The air is thick with pipe smoke and the smell of ale',
  description: 'A weathered establishment on the edge of town',
  locationType: 'town',
  hasMerchant: false,
  coordinates: { x: -120, y: -80 },
  connections: ['crossroads', 'town-square']
}
```

---

## Component Architecture

### File Structure

```
src/screens/
├── WorldMapScreen.tsx           (existing grid view)
├── WorldMapCanvasScreen.tsx     (new canvas view - POC)
└── index.ts                     (export both)

src/components/
└── MapViewToggle.tsx            (future: toggle between grid/canvas)

src/data/
└── locations.ts                 (add coordinates & connections)
```

### Rendering Approach Options

**Note:** Phase 0 will investigate using Leaflet.js vs. custom implementation.

#### Option A: Leaflet.js (Under Investigation)
- **Pros:** Mature library, handles pan/zoom/gestures out of the box, well-tested, mobile-optimized
- **Cons:** Additional dependency (~150kb), some styling limitations, learning curve
- **Reference:** https://github.com/TaylorHo/rpg-interactive-map

#### Option B: Hybrid Canvas + HTML (Original Design)
**HTML5 Canvas** for drawing connection lines and background
**Positioned HTML elements** for location nodes (better for interactive buttons, icons, and text)

**Why hybrid?**
- Canvas excels at drawing many lines efficiently
- HTML elements provide natural hover states, click handlers, icons, and text with CSS/React
- Best of both worlds: performance + interactivity
- Full control over rendering and styling

### Component Structure

```
WorldMapCanvasScreen
├── Canvas layer (backdrop - draws connection lines)
├── LocationNode components (positioned HTML - one per location)
│   ├── Icon component
│   ├── Location name
│   ├── Lock icon (if locked)
│   └── Click handler for navigation
└── MapControls (floating buttons)
    ├── Zoom in (+)
    ├── Zoom out (-)
    └── Recenter (⊙)
```

### Props Interface

```typescript
interface WorldMapCanvasScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
  onViewCharacterSheet?: () => void;
  onExit: () => void;
}
```

Same props as `WorldMapScreen` for easy interchangeability.

---

## Interaction & Controls

### Viewport State

```typescript
const [viewport, setViewport] = useState({
  x: 0,        // Camera offset X (pixels)
  y: 0,        // Camera offset Y (pixels)
  zoom: 1.0    // Zoom level (0.5 to 2.0)
});
```

### Zoom Behavior

- **Range:** 0.5 (zoomed out) to 2.0 (zoomed in)
- **Default:** 1.0 (100%)
- **Mouse wheel:** Zoom in/out by 0.1 increments
- **Pinch gesture:** Zoom on mobile (preventDefault to avoid browser zoom)
- **Buttons:** +/- buttons in MapControls

### Pan Behavior

- **Mouse:** Click and drag to pan (cursor: grab → grabbing)
- **Touch:** Single finger drag to pan
- **Auto-center:** Viewport centers on current location when screen opens
- **Recenter button:** Snaps back to current location with smooth animation

### Location Node States

| State | Visual | Interaction |
|-------|--------|-------------|
| **Unlocked** | Full opacity, icon, name | Clickable, hover scale + glow |
| **Locked** | 50% opacity, lock icon | Not clickable, shows ??? |
| **Current** | Pulsing blue glow (like existing dot) | Clickable |
| **Visited** | Badge or checkmark | Clickable |

### Location Interaction

- **Click unlocked location:** Same behavior as grid map
  - First visit → Navigate to `firstVisitNodeId` story node
  - Return visit → Navigate to location hub
- **Hover:** Scale slightly (1.1x), show glow border
- **Double-tap (mobile):** Navigate to location (easier than tapping small nodes)
- **Long-press (mobile):** Show tooltip with location name/type

### Connection Lines

- **Visibility:** Only draw lines between:
  - Two unlocked locations (solid line)
  - Unlocked to locked location (dashed line, shows what's reachable)
- **Style:**
  - Solid: Both locations unlocked
  - Dashed: One location locked
- **Color:**
  - Default: `border-default` from design system
  - Highlighted: `accent` for connections from current location
- **Width:** 2px at zoom 1.0, scales with zoom

---

## Responsive & Mobile Design

### Canvas Sizing

- **Viewport fill:** `width: 100vw`, `height: 100vh` (minus header/UI)
- **Dynamic resize:** Listen for window resize and orientation change
- **Retina display:** Use `devicePixelRatio` for crisp rendering

### Touch-Optimized Controls

- **Location nodes:** Minimum 44x44px touch targets (even when zoomed out)
- **MapControls:** Large floating buttons (60x60px) in bottom-right corner
  - Positioned to avoid accidental thumb presses
  - Fixed position, always visible
- **Spacing:** 16px gap between control buttons

### Gesture Handling

| Gesture | Action |
|---------|--------|
| Single finger drag | Pan the map |
| Pinch | Zoom in/out |
| Double-tap location | Navigate to location |
| Long-press location | Show tooltip |
| Double-tap empty space | Zoom in (centered on tap point) |

### Performance Optimization

- **Culling:** Only render location nodes visible in viewport
- **Line rendering:** Only draw connections for visible locations
- **Animation:** Use `requestAnimationFrame` for smooth pan/zoom
- **Debouncing:** Debounce canvas redraws during rapid panning (16ms threshold)

### Layout Adaptation

- **Portrait:** Canvas fills vertical space, controls in bottom-right
- **Landscape:** Canvas fills horizontal space, controls stay in corner
- **Small screens:** Reduce location node size slightly, increase zoom range to 0.4 min
- **Text scaling:** Location names remain readable at all zoom levels (minimum 12px font)

---

## Integration with Existing Code

### POC Route Setup

Add to `App.tsx`:

```typescript
{currentScreen.type === 'worldMapCanvas' && (
  <WorldMapCanvasScreen
    onNavigate={(screen) => setCurrentScreen(screen as Screen)}
    onViewCharacterSheet={character ? handleViewSheet : undefined}
    onExit={() => setCurrentScreen({ type: 'mainMenu' })}
  />
)}
```

### Shared State

Both grid and canvas views share:

- **Narrative state:** `useNarrativeStore` (world, campaign, unlocked locations)
- **Character state:** `useCharacterStore` (for navigation)
- **Location data:** `LOCATIONS` from `src/data/locations.ts`

Both views have identical navigation behavior when clicking locations.

### View Toggle (Future - Option 3)

Add toggle to OptionsMenu or as floating button:

```typescript
<MapViewToggle
  currentView={mapView}  // 'grid' | 'canvas'
  onToggle={() => setMapView(prev => prev === 'grid' ? 'canvas' : 'grid')}
/>
```

Toggle preserves:
- Current location
- Unlocked locations
- World state

### Navigation Flow

```
StoryScreen
    ↓ (View Map button)
WorldMap (grid or canvas view based on preference)
    ↓ (Click location)
LocationHubScreen OR StoryScreen (first visit)
```

---

## POC Implementation Plan

### Phase 0: Technology Investigation
1. Research Leaflet.js as map renderer
   - Review https://github.com/TaylorHo/rpg-interactive-map example
   - Evaluate if Leaflet.js fits our needs (pan/zoom, markers, custom styling)
   - Compare with custom canvas approach (complexity, bundle size, flexibility)
   - Decision: Use Leaflet.js vs. custom implementation
2. If using Leaflet.js:
   - Install `leaflet` and `@types/leaflet`
   - Explore React integration (`react-leaflet` or custom hooks)
   - Test basic map setup with markers
3. Document findings and update implementation approach

### Phase 1: Basic Canvas/Map Setup
1. Create `WorldMapCanvasScreen.tsx` with chosen renderer (Leaflet or canvas)
2. Implement viewport state (x, y, zoom)
3. Add pan with mouse drag
4. Add zoom with mouse wheel

### Phase 2: Location Rendering
5. Add coordinates & connections to 3-5 locations in `locations.ts`
6. Render location nodes as HTML elements positioned on canvas
7. Transform positions based on viewport (zoom/pan)
8. Apply locked/unlocked visual states

### Phase 3: Connections
9. Draw connection lines on canvas between connected locations
10. Apply line styles (solid/dashed based on unlock state)
11. Highlight connections from current location

### Phase 4: Interaction
12. Add click handlers to location nodes (same navigation as grid)
13. Add hover effects (scale, glow)
14. Center viewport on current location on mount

### Phase 5: Mobile & Polish
15. Add touch gestures (pan, pinch-zoom)
16. Add MapControls component (zoom buttons, recenter)
17. Optimize for mobile performance
18. Test on various screen sizes

### Phase 6: Testing & Iteration
19. Compare with grid view for feature parity
20. Test navigation flow
21. Gather feedback
22. Iterate on visuals/UX

---

## Success Criteria

✅ Locations positioned via x,y coordinates
✅ Pan map by dragging (mouse/touch)
✅ Zoom in/out (wheel/pinch)
✅ Connection lines show relationships between locations
✅ Locked/unlocked states clearly visible
✅ Same navigation behavior as grid view
✅ Smooth performance on mobile devices
✅ Viewport centers on current location
✅ Recenter button returns to current location

---

## Future Enhancements (Post-POC)

- Minimap in corner showing full world + viewport position
- Distance labels on connection lines ("2 days travel")
- Animated path highlighting when hovering a location
- Fog of war for unexplored regions
- Background terrain/biome visualization
- Location clustering when zoomed out
- Fast-travel animation (pan + zoom to destination)
