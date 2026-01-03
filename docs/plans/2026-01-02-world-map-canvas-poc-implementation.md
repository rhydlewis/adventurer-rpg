# World Map Canvas POC Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a coordinate-based world map POC with pan/zoom navigation using custom canvas rendering

**Architecture:** Hybrid approach with HTML5 Canvas for connection lines and positioned HTML elements for location nodes. Viewport state manages camera position and zoom level. Mouse/touch events handle pan/zoom interactions.

**Tech Stack:** React, TypeScript, HTML5 Canvas, CSS transforms for node positioning

---

## Task 1: Add Coordinates and Connections to Location Type

**Files:**
- Modify: `src/types/narrative.ts` (Location interface, ~line 242)
- Test: Manual verification (TypeScript compilation)

**Step 1: Add optional fields to Location interface**

Open `src/types/narrative.ts` and find the `Location` interface. Add these optional fields after `explorationTableId`:

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

  // Canvas map fields (optional - for coordinate-based map view)
  coordinates?: {
    x: number;  // Abstract units (100 units = typical connection distance)
    y: number;  // Abstract units
  };
  connections?: string[];  // IDs of locations this connects to
}
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no type errors

**Step 3: Commit**

```bash
git add src/types/narrative.ts
git commit -m "feat(types): add coordinates and connections to Location type

Add optional canvas map fields:
- coordinates: {x, y} for positioning on coordinate-based map
- connections: array of location IDs for path rendering

These fields enable alternative canvas map view while
remaining compatible with existing grid map."
```

---

## Task 2: Add Sample Location Data with Coordinates

**Files:**
- Modify: `src/data/locations.ts` (add coordinates to 5 locations)
- Test: Manual verification (inspect data, TypeScript compilation)

**Step 1: Add coordinates and connections to Crossroads**

In `src/data/locations.ts`, update the `'crossroads'` location:

```typescript
'crossroads': {
  id: 'crossroads',
  name: 'The Crossroads',
  image: 'card_location_signpost.png',
  ambience: 'The Crossroads - Where your journey begins',
  description: 'A weathered signpost marks the intersection of three paths',
  locationType: 'wilderness',
  coordinates: { x: 0, y: 0 },  // Center of map
  connections: ['rusty-tavern', 'forest-path', 'bandit-camp']
},
```

**Step 2: Add coordinates and connections to Rusty Tavern**

```typescript
'rusty-tavern': {
  id: 'rusty-tavern',
  name: 'The Rusty Tavern',
  image: 'card_location_exterior_00015.png',
  ambience: 'The air is thick with pipe smoke and the smell of ale',
  description: 'A weathered establishment on the edge of town',
  locationType: 'town',
  hasMerchant: false,
  coordinates: { x: -120, y: -80 },  // Northwest of crossroads
  connections: ['crossroads', 'town-square']
},
```

**Step 3: Add coordinates and connections to Town Square**

```typescript
'town-square': {
  id: 'town-square',
  name: 'Town Square',
  image: 'card_location_exterior_00020.png',
  ambience: 'Merchants call out their wares as townsfolk hurry about their business',
  description: 'The bustling heart of the settlement',
  locationType: 'town',
  hasMerchant: true,
  coordinates: { x: -180, y: -120 },  // West of tavern
  connections: ['rusty-tavern']
},
```

**Step 4: Add coordinates and connections to Forest Path**

```typescript
'forest-path': {
  id: 'forest-path',
  name: 'Forest Path',
  image: 'card_location_exterior_00035.png',
  ambience: 'Ancient trees loom overhead, their branches filtering the sunlight',
  description: 'A winding trail through dense woodland',
  locationType: 'wilderness',
  coordinates: { x: 100, y: 60 },  // Southeast of crossroads
  connections: ['crossroads']
},
```

**Step 5: Add coordinates and connections to Bandit Camp**

```typescript
'bandit-camp': {
  id: 'bandit-camp',
  name: 'The Bandit Camp',
  image: 'card_location_camp.jpg',
  ambience: 'A crude camp in a forest clearing, abandoned and eerily quiet',
  description: 'Makeshift tents and dying embers mark this temporary refuge',
  locationType: 'wilderness',
  coordinates: { x: 80, y: -100 },  // Northeast of crossroads
  connections: ['crossroads']
},
```

**Step 6: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds, no type errors

**Step 7: Commit**

```bash
git add src/data/locations.ts
git commit -m "feat(data): add coordinates and connections to 5 locations

Add canvas map data to POC locations:
- crossroads: (0, 0) - center, connects to 3 locations
- rusty-tavern: (-120, -80) - northwest
- town-square: (-180, -120) - west
- forest-path: (100, 60) - southeast
- bandit-camp: (80, -100) - northeast

Creates a simple branching path layout for testing
coordinate-based map rendering."
```

---

## Task 3: Create WorldMapCanvasScreen Component Shell

**Files:**
- Create: `src/screens/WorldMapCanvasScreen.tsx`
- Modify: `src/screens/index.ts`
- Test: Manual (import and render empty component)

**Step 1: Create basic component structure**

Create `src/screens/WorldMapCanvasScreen.tsx`:

```typescript
import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';
import { OptionsMenu } from '../components';

interface WorldMapCanvasScreenProps {
  onNavigate: (screen: { type: string; [key: string]: unknown }) => void;
  onViewCharacterSheet?: () => void;
  onExit: () => void;
}

export function WorldMapCanvasScreen({
  onNavigate,
  onViewCharacterSheet,
  onExit,
}: WorldMapCanvasScreenProps) {
  const { world, campaign } = useNarrativeStore();
  const { character } = useCharacterStore();

  if (!world || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <p className="text-fg-primary">No campaign loaded</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-primary overflow-hidden">
      {/* Header with Options Menu */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-4">
        <div>
          <h1 className="heading-primary text-h1 text-fg-primary mb-2">
            {campaign.title}
          </h1>
          <p className="body-secondary text-fg-muted">Canvas Map (POC)</p>
        </div>
        <OptionsMenu
          onViewCharacterSheet={onViewCharacterSheet}
          onExit={onExit}
          showMap={false}
        />
      </div>

      {/* Canvas container - to be implemented */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-fg-muted">Canvas map coming soon...</p>
      </div>
    </div>
  );
}
```

**Step 2: Export from index**

Add to `src/screens/index.ts`:

```typescript
export * from './WorldMapCanvasScreen';
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx src/screens/index.ts
git commit -m "feat(screens): create WorldMapCanvasScreen shell

Add basic component structure:
- Same props interface as WorldMapScreen
- Campaign/world state checks
- Header with title and OptionsMenu
- Placeholder for canvas rendering

Next: Add viewport state and canvas element."
```

---

## Task 4: Add Viewport State and Canvas Element

**Files:**
- Modify: `src/screens/WorldMapCanvasScreen.tsx`

**Step 1: Add viewport state and refs**

Add imports and state after the existing imports:

```typescript
import { useNarrativeStore } from '../stores/narrativeStore';
import { useCharacterStore } from '../stores/characterStore';
import { OptionsMenu } from '../components';
import { useState, useRef, useEffect } from 'react';

// ... existing interface ...

export function WorldMapCanvasScreen({...}: WorldMapCanvasScreenProps) {
  const { world, campaign } = useNarrativeStore();
  const { character } = useCharacterStore();

  // Viewport state
  const [viewport, setViewport] = useState({
    x: 0,      // Camera offset X (pixels)
    y: 0,      // Camera offset Y (pixels)
    zoom: 1.0  // Zoom level (0.5 to 2.0)
  });

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ... rest of component
```

**Step 2: Add canvas element to render**

Replace the placeholder div with canvas:

```typescript
return (
  <div className="relative min-h-screen bg-primary overflow-hidden">
    {/* Header with Options Menu */}
    <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-4">
      <div>
        <h1 className="heading-primary text-h1 text-fg-primary mb-2">
          {campaign.title}
        </h1>
        <p className="body-secondary text-fg-muted">Canvas Map (POC)</p>
      </div>
      <OptionsMenu
        onViewCharacterSheet={onViewCharacterSheet}
        onExit={onExit}
        showMap={false}
      />
    </div>

    {/* Canvas container */}
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ top: '80px' }} // Space for header
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  </div>
);
```

**Step 3: Add canvas sizing effect**

Add before the return statement:

```typescript
// Resize canvas to fill container
useEffect(() => {
  const canvas = canvasRef.current;
  const container = containerRef.current;
  if (!canvas || !container) return;

  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  return () => window.removeEventListener('resize', resizeCanvas);
}, []);
```

**Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(canvas): add viewport state and canvas element

Add canvas infrastructure:
- Viewport state: x, y, zoom (0.5-2.0 range)
- Canvas ref with retina display support
- Auto-resize canvas to fill container
- Grab cursor for pan interaction

Next: Implement pan functionality."
```

---

## Task 5: Implement Mouse Pan Functionality

**Files:**
- Modify: `src/screens/WorldMapCanvasScreen.tsx`

**Step 1: Add pan state tracking**

Add after viewport state:

```typescript
const [viewport, setViewport] = useState({
  x: 0,
  y: 0,
  zoom: 1.0
});

// Pan state
const [isPanning, setIsPanning] = useState(false);
const [panStart, setPanStart] = useState({ x: 0, y: 0 });
```

**Step 2: Add mouse event handlers**

Add before the return statement:

```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  setIsPanning(true);
  setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isPanning) return;

  setViewport(prev => ({
    ...prev,
    x: e.clientX - panStart.x,
    y: e.clientY - panStart.y
  }));
};

const handleMouseUp = () => {
  setIsPanning(false);
};

const handleMouseLeave = () => {
  setIsPanning(false);
};
```

**Step 3: Wire up event handlers to container**

Update the container div:

```typescript
<div
  ref={containerRef}
  className="absolute inset-0 cursor-grab active:cursor-grabbing"
  style={{ top: '80px' }}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseLeave}
>
```

**Step 4: Draw viewport debug info on canvas**

Add render effect after resize effect:

```typescript
// Debug: Draw viewport info
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw viewport info
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px monospace';
  ctx.fillText(`Viewport: x=${viewport.x.toFixed(0)}, y=${viewport.y.toFixed(0)}, zoom=${viewport.zoom.toFixed(2)}`, 10, 20);
}, [viewport]);
```

**Step 5: Test panning manually**

Run: `npm run dev`
Navigate to canvas map screen (needs App.tsx route - will add later)
Expected: Can drag to pan, see coordinates update

**Step 6: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(canvas): implement mouse pan functionality

Add pan interaction:
- Track isPanning state and pan start position
- Mouse down/move/up handlers update viewport x/y
- Cursor changes from grab to grabbing when panning
- Debug overlay shows current viewport coordinates

Next: Implement zoom functionality."
```

---

## Task 6: Implement Mouse Wheel Zoom

**Files:**
- Modify: `src/screens/WorldMapCanvasScreen.tsx`

**Step 1: Add wheel event handler**

Add after mouse handlers:

```typescript
const handleWheel = (e: React.WheelEvent) => {
  e.preventDefault();

  const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;

  setViewport(prev => ({
    ...prev,
    zoom: Math.min(2.0, Math.max(0.5, prev.zoom + zoomDelta))
  }));
};
```

**Step 2: Wire up wheel handler**

Update container div:

```typescript
<div
  ref={containerRef}
  className="absolute inset-0 cursor-grab active:cursor-grabbing"
  style={{ top: '80px' }}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseLeave}
  onWheel={handleWheel}
>
```

**Step 3: Test zoom manually**

Run: `npm run dev`
Expected: Mouse wheel zooms in/out (0.5-2.0 range), debug text updates

**Step 4: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(canvas): implement mouse wheel zoom

Add zoom interaction:
- Wheel handler adjusts zoom by 0.1 increments
- Clamps zoom to 0.5-2.0 range
- Updates viewport state and debug display

Next: Render location nodes with coordinate positioning."
```

---

## Task 7: Render Location Nodes as Positioned HTML

**Files:**
- Modify: `src/screens/WorldMapCanvasScreen.tsx`
- Import: `src/data/locations.ts`, `src/utils/worldMap.ts`

**Step 1: Import location utilities**

Add imports:

```typescript
import { LOCATIONS } from '../data/locations';
import { canTravelToLocation } from '../utils/worldMap';
import { Icon } from '../components';
```

**Step 2: Get locations with coordinates**

Add after refs:

```typescript
// Get campaign locations with coordinates
const campaignLocations = campaign.locations || [];
const locationsWithCoords = campaignLocations.filter(loc => loc.coordinates);
```

**Step 3: Create coordinate transform helper**

Add before handlers:

```typescript
// Transform world coordinates to screen coordinates
const worldToScreen = (worldX: number, worldY: number) => {
  const container = containerRef.current;
  if (!container) return { x: 0, y: 0 };

  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  return {
    x: centerX + (worldX * viewport.zoom) + viewport.x,
    y: centerY + (worldY * viewport.zoom) + viewport.y
  };
};
```

**Step 4: Add location node rendering**

Add after canvas element, before closing container div:

```typescript
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />

      {/* Location nodes */}
      {locationsWithCoords.map((location) => {
        const screenPos = worldToScreen(
          location.coordinates!.x,
          location.coordinates!.y
        );

        const isUnlocked = canTravelToLocation(world, location.id);
        const isCurrent = world.currentLocationId === location.id;

        return (
          <div
            key={location.id}
            className="absolute"
            style={{
              left: `${screenPos.x}px`,
              top: `${screenPos.y}px`,
              transform: 'translate(-50%, -50%)', // Center on coordinates
              pointerEvents: isUnlocked ? 'auto' : 'none',
            }}
          >
            {/* Location button */}
            <button
              className={`
                flex flex-col items-center gap-2 p-3 rounded-lg
                min-w-[44px] min-h-[44px]
                transition-transform hover:scale-110
                ${isUnlocked ? 'bg-secondary border-2 border-border-default hover:border-accent' : 'bg-secondary/50 border-2 border-border-default opacity-50'}
                ${isCurrent ? 'border-accent shadow-lg shadow-blue-500/50' : ''}
              `}
              disabled={!isUnlocked}
            >
              {/* Icon */}
              <div className="w-8 h-8 flex items-center justify-center">
                <Icon
                  name={isUnlocked ? 'MapPin' : 'Lock'}
                  size={20}
                  className="text-fg-primary"
                />
              </div>

              {/* Location name */}
              <span className="text-xs text-fg-primary whitespace-nowrap">
                {isUnlocked ? location.name : '???'}
              </span>
            </button>
          </div>
        );
      })}
    </div>
```

**Step 5: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Test rendering manually**

Run: `npm run dev`
Expected: See 5 location nodes positioned based on coordinates, pan/zoom affects positions

**Step 7: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(canvas): render location nodes as positioned HTML

Add location node rendering:
- Filter campaign locations with coordinates
- Transform world coords to screen coords based on viewport
- Render nodes as positioned absolute divs
- Show icon, name, locked/unlocked states
- Apply current location accent border
- Nodes scale on hover (unlocked only)

Nodes respond to pan/zoom viewport changes.
Next: Draw connection lines on canvas."
```

---

## Task 8: Draw Connection Lines on Canvas

**Files:**
- Modify: `src/screens/WorldMapCanvasScreen.tsx`

**Step 1: Create connection drawing function**

Add before handlers:

```typescript
// Draw connection lines on canvas
const drawConnections = (ctx: CanvasRenderingContext2D) => {
  if (!containerRef.current) return;

  const rect = containerRef.current.getBoundingClientRect();

  // Clear canvas
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Draw each connection
  locationsWithCoords.forEach((location) => {
    if (!location.connections || !location.coordinates) return;

    const fromScreen = worldToScreen(location.coordinates.x, location.coordinates.y);
    const isFromUnlocked = canTravelToLocation(world, location.id);

    if (!isFromUnlocked) return; // Only draw from unlocked locations

    location.connections.forEach((toId) => {
      const toLocation = LOCATIONS[toId];
      if (!toLocation?.coordinates) return;

      const toScreen = worldToScreen(toLocation.coordinates.x, toLocation.coordinates.y);
      const isToUnlocked = canTravelToLocation(world, toId);
      const isCurrent = location.id === world.currentLocationId || toId === world.currentLocationId;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(fromScreen.x, fromScreen.y);
      ctx.lineTo(toScreen.x, toScreen.y);

      // Style based on unlock state and current location
      if (isCurrent) {
        ctx.strokeStyle = 'rgb(59, 130, 246)'; // accent color
      } else {
        ctx.strokeStyle = 'rgb(100, 116, 139)'; // border-default
      }

      ctx.lineWidth = 2 * viewport.zoom;

      // Dashed if target is locked
      if (!isToUnlocked) {
        ctx.setLineDash([5, 5]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.stroke();
    });
  });
};
```

**Step 2: Call drawConnections in render effect**

Replace the debug render effect:

```typescript
// Render canvas (connections)
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  drawConnections(ctx);
}, [viewport, world, locationsWithCoords]);
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Test connections manually**

Run: `npm run dev`
Expected: See lines connecting locations, solid for unlocked, dashed for locked

**Step 5: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(canvas): draw connection lines between locations

Add connection rendering on canvas:
- Draw lines between connected locations
- Only draw from unlocked locations
- Solid lines for unlocked connections
- Dashed lines for locked connections
- Highlight connections from current location (accent color)
- Line width scales with zoom

Canvas updates on viewport or world state changes.
Next: Add click handlers for navigation."
```

---

## Task 9: Add Location Click Navigation

**Files:**
- Modify: `src/screens/WorldMapCanvasScreen.tsx`
- Reference: `src/screens/WorldMapScreen.tsx` (for navigation logic)

**Step 1: Import navigation utilities**

Already imported, verify these are present:

```typescript
import { canTravelToLocation, isFirstVisit, markLocationVisited } from '../utils/worldMap';
```

**Step 2: Add click handler**

Add after wheel handler:

```typescript
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
      const { enterNode } = useNarrativeStore.getState();
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
```

**Step 3: Wire up click handler to location buttons**

Update location button:

```typescript
<button
  className={`...`}
  disabled={!isUnlocked}
  onClick={() => handleLocationClick(location)}
>
```

**Step 4: Test navigation manually**

Run: `npm run dev`
Expected: Clicking unlocked location navigates to hub or story

**Step 5: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(canvas): add location click navigation

Add navigation logic:
- Click unlocked location to travel
- First visit: navigate to firstVisitNodeId story node
- Return visit: navigate to location hub
- Mark location as visited
- Update world state with current location
- Locked locations not clickable

Same navigation behavior as grid WorldMapScreen.
Next: Add MapControls component."
```

---

## Task 10: Create MapControls Component

**Files:**
- Create: `src/components/MapControls.tsx`
- Modify: `src/components/index.ts`
- Modify: `src/screens/WorldMapCanvasScreen.tsx`

**Step 1: Create MapControls component**

Create `src/components/MapControls.tsx`:

```typescript
import { Icon } from './Icon';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  currentZoom: number;
  minZoom?: number;
  maxZoom?: number;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  currentZoom,
  minZoom = 0.5,
  maxZoom = 2.0,
}: MapControlsProps) {
  const canZoomIn = currentZoom < maxZoom;
  const canZoomOut = currentZoom > minZoom;

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-4">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className="w-[60px] h-[60px] rounded-lg bg-secondary border-2 border-border-default hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        aria-label="Zoom in"
      >
        <Icon name="Plus" size={24} className="text-fg-primary" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className="w-[60px] h-[60px] rounded-lg bg-secondary border-2 border-border-default hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        aria-label="Zoom out"
      >
        <Icon name="Minus" size={24} className="text-fg-primary" />
      </button>

      {/* Recenter */}
      <button
        onClick={onRecenter}
        className="w-[60px] h-[60px] rounded-lg bg-secondary border-2 border-border-default hover:border-accent transition-colors flex items-center justify-center"
        aria-label="Recenter on current location"
      >
        <Icon name="Circle" size={24} className="text-fg-primary" />
      </button>
    </div>
  );
}
```

**Step 2: Export from components index**

Add to `src/components/index.ts`:

```typescript
export * from './MapControls';
```

**Step 3: Add MapControls to WorldMapCanvasScreen**

Import:

```typescript
import { OptionsMenu, Icon, MapControls } from '../components';
```

Add control handlers:

```typescript
const handleZoomIn = () => {
  setViewport(prev => ({
    ...prev,
    zoom: Math.min(2.0, prev.zoom + 0.1)
  }));
};

const handleZoomOut = () => {
  setViewport(prev => ({
    ...prev,
    zoom: Math.max(0.5, prev.zoom - 0.1)
  }));
};

const handleRecenter = () => {
  // Center on current location or (0, 0) if none
  setViewport({
    x: 0,
    y: 0,
    zoom: 1.0
  });
};
```

Add to render (after location nodes, before closing div):

```typescript
      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        currentZoom={viewport.zoom}
      />
    </div>
```

**Step 4: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Test controls manually**

Run: `npm run dev`
Expected: Zoom buttons change zoom, recenter resets to (0,0)

**Step 6: Commit**

```bash
git add src/components/MapControls.tsx src/components/index.ts src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(components): add MapControls for zoom and recenter

Create MapControls component:
- Zoom in/out buttons (60x60px touch targets)
- Recenter button (resets to 0,0)
- Disabled state when at zoom limits
- Fixed position bottom-right corner

Integrate with WorldMapCanvasScreen:
- Wire up zoom in/out handlers (0.1 increments)
- Wire up recenter handler (resets viewport)

Next: Add touch gestures for mobile."
```

---

## Task 11: Add Touch Gestures (Pan and Pinch-Zoom)

**Files:**
- Modify: `src/screens/WorldMapCanvasScreen.tsx`

**Step 1: Add touch state**

Add after pan state:

```typescript
// Touch state
const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
const [initialZoom, setInitialZoom] = useState<number>(1.0);
```

**Step 2: Add pinch distance calculator**

Add before handlers:

```typescript
// Calculate distance between two touch points
const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};
```

**Step 3: Add touch handlers**

Add after mouse handlers:

```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  if (e.touches.length === 1) {
    // Single touch - pan
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX - viewport.x, y: touch.clientY - viewport.y });
  } else if (e.touches.length === 2) {
    // Two touches - pinch zoom
    e.preventDefault();
    const distance = getTouchDistance(e.touches[0], e.touches[1]);
    setInitialPinchDistance(distance);
    setInitialZoom(viewport.zoom);
  }
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (e.touches.length === 1 && touchStart) {
    // Pan
    const touch = e.touches[0];
    setViewport(prev => ({
      ...prev,
      x: touch.clientX - touchStart.x,
      y: touch.clientY - touchStart.y
    }));
  } else if (e.touches.length === 2 && initialPinchDistance !== null) {
    // Pinch zoom
    e.preventDefault();
    const distance = getTouchDistance(e.touches[0], e.touches[1]);
    const scale = distance / initialPinchDistance;
    const newZoom = Math.min(2.0, Math.max(0.5, initialZoom * scale));

    setViewport(prev => ({
      ...prev,
      zoom: newZoom
    }));
  }
};

const handleTouchEnd = () => {
  setTouchStart(null);
  setInitialPinchDistance(null);
};
```

**Step 4: Wire up touch handlers**

Update container div:

```typescript
<div
  ref={containerRef}
  className="absolute inset-0 cursor-grab active:cursor-grabbing"
  style={{ top: '80px', touchAction: 'none' }}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseLeave}
  onWheel={handleWheel}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
```

**Step 5: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Test touch gestures on mobile (or browser dev tools)**

Run: `npm run dev`
Use mobile device or browser mobile emulation
Expected: Single finger pans, two finger pinch zooms

**Step 7: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(canvas): add touch gestures for mobile

Add touch support:
- Single finger drag to pan
- Two finger pinch to zoom
- Calculate distance between touch points for pinch
- Prevent default on multi-touch (avoid browser zoom)
- touchAction: none for reliable gesture handling

Mobile-optimized pan/zoom now functional.
Next: Integrate with App.tsx routing."
```

---

## Task 12: Integrate WorldMapCanvasScreen into App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/types/navigation.ts` (add worldMapCanvas screen type)

**Step 1: Add worldMapCanvas to Screen union type**

Edit `src/types/navigation.ts`, find the Screen type and add:

```typescript
export type Screen =
  | { type: 'splash' }
  | { type: 'mainMenu' }
  | { type: 'home' }
  | { type: 'chooseCampaign' }
  | { type: 'characterCreation' }
  | { type: 'quickCharacterCreation'; onComplete: (character: Character) => void }
  | { type: 'characterSheet' }
  | { type: 'story' }
  | { type: 'combat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'worldMap' }
  | { type: 'worldMapCanvas' }  // NEW
  | { type: 'locationHub'; locationId: string }
  // ... rest of screen types
```

**Step 2: Import WorldMapCanvasScreen in App.tsx**

Add to imports:

```typescript
import { WorldMapCanvasScreen } from './screens';
```

**Step 3: Add route for worldMapCanvas screen**

Add after the worldMap route (around line 480):

```typescript
{currentScreen.type === 'worldMap' && (
  <WorldMapScreen
    onNavigate={(screen) => setCurrentScreen(screen as Screen)}
    onViewCharacterSheet={character ? handleViewSheet : undefined}
    onExit={() => setCurrentScreen({ type: 'mainMenu' })}
  />
)}
{currentScreen.type === 'worldMapCanvas' && (
  <WorldMapCanvasScreen
    onNavigate={(screen) => setCurrentScreen(screen as Screen)}
    onViewCharacterSheet={character ? handleViewSheet : undefined}
    onExit={() => setCurrentScreen({ type: 'mainMenu' })}
  />
)}
```

**Step 4: Add temporary navigation to canvas map (for testing)**

Find `handleViewMap` function and update:

```typescript
const handleViewMap = () => {
  // TODO: Add toggle between grid and canvas views
  // For now, go to canvas POC
  navigateWithBack({ type: 'worldMapCanvas' });
};
```

**Step 5: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Test full integration**

Run: `npm run dev`
1. Start game, select campaign
2. Click "View Map" from story screen
3. Expected: Canvas map loads with locations
4. Test: Pan, zoom, click locations

**Step 7: Commit**

```bash
git add src/types/navigation.ts src/App.tsx
git commit -m "feat(app): integrate WorldMapCanvasScreen into routing

Add worldMapCanvas screen type and route:
- Add to Screen union type
- Import and render WorldMapCanvasScreen
- Wire up navigation, character sheet, exit callbacks
- Temporarily route View Map to canvas (testing)

Canvas POC now accessible from story screen.
Next: Add auto-center on current location."
```

---

## Task 13: Auto-Center on Current Location

**Files:**
- Modify: `src/screens/WorldMapCanvasScreen.tsx`

**Step 1: Add centering effect on mount**

Add after the resize effect:

```typescript
// Center viewport on current location when component mounts
useEffect(() => {
  if (!world?.currentLocationId) return;

  const currentLocation = LOCATIONS[world.currentLocationId];
  if (!currentLocation?.coordinates) return;

  // Calculate viewport offset to center current location
  // Viewport offset moves camera, so we need negative of location coords
  setViewport({
    x: -currentLocation.coordinates.x,
    y: -currentLocation.coordinates.y,
    zoom: 1.0
  });
}, []); // Only on mount
```

**Step 2: Update recenter handler to use current location**

Update handleRecenter:

```typescript
const handleRecenter = () => {
  // Center on current location
  if (world?.currentLocationId) {
    const currentLocation = LOCATIONS[world.currentLocationId];
    if (currentLocation?.coordinates) {
      setViewport({
        x: -currentLocation.coordinates.x,
        y: -currentLocation.coordinates.y,
        zoom: 1.0
      });
      return;
    }
  }

  // Fallback: center on (0, 0)
  setViewport({
    x: 0,
    y: 0,
    zoom: 1.0
  });
};
```

**Step 3: Test auto-centering**

Run: `npm run dev`
1. Start game with current location set
2. Open canvas map
Expected: Map centers on current location
3. Pan away and click recenter
Expected: Map returns to current location

**Step 4: Commit**

```bash
git add src/screens/WorldMapCanvasScreen.tsx
git commit -m "feat(canvas): auto-center on current location

Add centering behavior:
- On mount: center viewport on current location
- Recenter button: returns to current location
- Falls back to (0,0) if no current location

Improves orientation and usability.
Next: Add integration test."
```

---

## Task 14: Add Integration Test for Canvas Map

**Files:**
- Create: `src/__tests__/integration/world-map-canvas.test.ts`

**Step 1: Create integration test file**

Create `src/__tests__/integration/world-map-canvas.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useNarrativeStore } from '../../stores/narrativeStore';
import { useCharacterStore } from '../../stores/characterStore';
import { singleNodeCampaign } from '../../data/campaigns/single-node-campaign';
import { LOCATIONS } from '../../data/locations';
import type { Character } from '../../types';

describe('Canvas Map Integration', () => {
  let mockCharacter: Character;

  beforeEach(() => {
    // Reset stores
    useNarrativeStore.getState().resetNarrative();

    // Create mock character
    mockCharacter = {
      name: 'Test Hero',
      avatarPath: '/avatars/default.png',
      class: 'Fighter',
      level: 3,
      hp: 30,
      maxHp: 30,
      ac: 16,
      bab: 3,
      attributes: {
        STR: 14,
        DEX: 12,
        CON: 14,
        INT: 10,
        WIS: 12,
        CHA: 10,
      },
      skills: {
        Athletics: 2,
        Stealth: 1,
        Perception: 1,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 2,
      },
      saves: {
        fortitude: 5,
        reflex: 3,
        will: 2,
      },
      feats: [],
      equipment: {
        weapon: null,
        weapons: [],
        armor: null,
        shield: null,
        items: [],
      },
      resources: {
        abilities: [],
        spellSlots: {
          level0: { max: 0, current: 0 },
          level1: { max: 0, current: 0 },
        },
      },
    };
    useCharacterStore.setState({ character: mockCharacter });

    // Load campaign
    useNarrativeStore.getState().loadCampaign(singleNodeCampaign);
    useNarrativeStore.getState().startCampaign();
  });

  it('should have locations with coordinates for canvas rendering', () => {
    const { campaign } = useNarrativeStore.getState();

    // Check that campaign has locations
    expect(campaign?.locations).toBeDefined();
    expect(campaign!.locations.length).toBeGreaterThan(0);

    // Check that locations have coordinates
    const locationsWithCoords = campaign!.locations.filter(loc => loc.coordinates);
    expect(locationsWithCoords.length).toBeGreaterThanOrEqual(3);

    // Verify coordinate format
    locationsWithCoords.forEach(loc => {
      expect(loc.coordinates).toBeDefined();
      expect(typeof loc.coordinates!.x).toBe('number');
      expect(typeof loc.coordinates!.y).toBe('number');
    });
  });

  it('should have connections defined for locations', () => {
    const { campaign } = useNarrativeStore.getState();

    const locationsWithConns = campaign!.locations.filter(loc => loc.connections && loc.connections.length > 0);
    expect(locationsWithConns.length).toBeGreaterThanOrEqual(1);

    // Verify connections reference valid location IDs
    locationsWithConns.forEach(loc => {
      loc.connections!.forEach(connId => {
        expect(LOCATIONS[connId]).toBeDefined();
      });
    });
  });

  it('should start with crossroads as current location', () => {
    const { world } = useNarrativeStore.getState();

    expect(world?.currentLocationId).toBe('crossroads');
    expect(LOCATIONS['crossroads'].coordinates).toBeDefined();
  });

  it('should have crossroads at origin (0, 0)', () => {
    const crossroads = LOCATIONS['crossroads'];

    expect(crossroads.coordinates).toEqual({ x: 0, y: 0 });
  });

  it('should have crossroads connected to multiple locations', () => {
    const crossroads = LOCATIONS['crossroads'];

    expect(crossroads.connections).toBeDefined();
    expect(crossroads.connections!.length).toBeGreaterThanOrEqual(2);
  });
});
```

**Step 2: Run the test**

Run: `npm test world-map-canvas`
Expected: All tests pass

**Step 3: Commit**

```bash
git add src/__tests__/integration/world-map-canvas.test.ts
git commit -m "test(canvas): add integration tests for canvas map

Add integration tests verifying:
- Locations have coordinates defined
- Coordinates are valid numbers
- Connections reference valid location IDs
- Crossroads is at origin (0, 0)
- Crossroads connects to multiple locations
- Campaign starts with crossroads as current location

Validates canvas map data structure.
POC implementation complete."
```

---

## Task 15: Update Documentation

**Files:**
- Create: `docs/plans/2026-01-02-world-map-canvas-poc-completed.md`

**Step 1: Create completion summary**

Create `docs/plans/2026-01-02-world-map-canvas-poc-completed.md`:

```markdown
# World Map Canvas POC - Completed

**Date:** 2026-01-02
**Status:** POC Complete

## Summary

Successfully implemented coordinate-based world map POC with pan/zoom navigation using custom canvas + HTML hybrid approach.

## Implemented Features

✅ **Data Model**
- Added `coordinates` and `connections` to Location type
- Added coordinate data to 5 sample locations
- Created branching path layout (crossroads → 3 locations)

✅ **Viewport System**
- Viewport state (x, y, zoom: 0.5-2.0)
- World-to-screen coordinate transformation
- Auto-resize canvas for retina displays

✅ **Pan Interaction**
- Mouse drag to pan (grab cursor)
- Touch drag to pan (single finger)
- Smooth viewport updates

✅ **Zoom Interaction**
- Mouse wheel zoom (0.1 increments)
- Pinch-to-zoom on mobile
- Zoom controls (buttons)
- Clamped range (0.5-2.0)

✅ **Location Rendering**
- Positioned HTML nodes based on coordinates
- Icons and labels
- Locked/unlocked visual states
- Current location highlight (blue glow)
- Hover effects (scale + glow)
- Minimum 44x44px touch targets

✅ **Connection Lines**
- Canvas rendering between connected locations
- Solid lines for unlocked connections
- Dashed lines for locked connections
- Highlighted lines from current location
- Line width scales with zoom

✅ **Navigation**
- Click location to travel
- First visit → story node
- Return visit → location hub
- Same behavior as grid map

✅ **Controls**
- MapControls component (zoom in/out, recenter)
- 60x60px touch targets
- Fixed bottom-right position
- Disabled states at zoom limits

✅ **Auto-Centering**
- Viewport centers on current location on mount
- Recenter button returns to current location

✅ **Mobile Support**
- Touch gestures (pan, pinch-zoom)
- Responsive canvas sizing
- Touch-optimized controls
- touchAction: none for reliable gestures

✅ **Integration**
- WorldMapCanvasScreen integrated into App.tsx
- Screen type added to navigation
- Accessible via "View Map" from story

✅ **Testing**
- Integration tests for coordinate data
- Validation of connections

## Technical Architecture

**Rendering:** Hybrid Canvas + HTML
- Canvas: Connection lines (efficient drawing)
- HTML: Location nodes (interactive, styled)

**Coordinate System:**
- Origin (0, 0) at world center
- 100 units = typical connection distance
- Positive X = East, Positive Y = South

**State Management:**
- Viewport state: { x, y, zoom }
- Pan state: isPanning, panStart
- Touch state: touchStart, pinchDistance

## Files Created/Modified

**Created:**
- `src/screens/WorldMapCanvasScreen.tsx` (main component)
- `src/components/MapControls.tsx` (zoom/recenter controls)
- `src/__tests__/integration/world-map-canvas.test.ts` (tests)

**Modified:**
- `src/types/narrative.ts` (Location type)
- `src/data/locations.ts` (added coordinates/connections)
- `src/App.tsx` (routing)
- `src/types/navigation.ts` (Screen type)
- `src/screens/index.ts` (exports)
- `src/components/index.ts` (exports)

## Next Steps

### Immediate (Polish)
1. Improve recenter animation (smooth pan/zoom)
2. Add location tooltips on hover
3. Optimize viewport culling for many locations
4. Add minimap (optional)

### Migration to Leaflet.js
Once POC validated, migrate to Leaflet.js for production:
1. Install `leaflet`, `react-leaflet`, `@types/leaflet`
2. Replace viewport state with `<MapContainer crs={L.CRS.Simple}>`
3. Convert HTML nodes to `<Marker>` with `DivIcon`
4. Convert canvas lines to `<Polyline>` components
5. Remove custom pan/zoom code
6. Test mobile gestures feel
7. Benchmark performance

### View Toggle
1. Create MapViewToggle component
2. Add toggle button to OptionsMenu
3. Share state between grid and canvas views
4. Preserve current location on toggle

## Lessons Learned

**What worked well:**
- Hybrid canvas + HTML gives best of both worlds
- Abstract coordinate units are intuitive
- Pan/zoom with simple state management
- Touch gestures straightforward to implement

**What could improve:**
- Viewport culling not yet needed (5 locations)
- Recenter animation would feel smoother
- Mobile testing needed on real devices

**Migration considerations:**
- Leaflet.js would eliminate ~200 lines of pan/zoom code
- CRS.Simple adapts well to our coordinate system
- DivIcon allows same HTML node customization
- Bundle size increase (~70kb) is acceptable

## Conclusion

POC successfully demonstrates coordinate-based world map concept. Custom implementation provides full control and deep understanding of mechanics. Ready for Leaflet.js migration when desired for production polish and reduced maintenance.
```

**Step 2: Commit documentation**

```bash
git add docs/plans/2026-01-02-world-map-canvas-poc-completed.md
git commit -m "docs(canvas): add POC completion summary

Document completed canvas map POC:
- All implemented features
- Technical architecture
- Files created/modified
- Next steps (polish, Leaflet migration, toggle)
- Lessons learned

POC validates coordinate-based map approach.
Ready for Leaflet.js migration or polish."
```

---

## Summary

This implementation plan creates a fully functional coordinate-based world map POC with:
- Pan/zoom interaction (mouse + touch)
- Location nodes positioned by coordinates
- Connection lines showing paths
- Navigation integration
- Mobile-optimized controls

The POC demonstrates the core mechanics needed for a Leaflet.js migration while providing hands-on understanding of map rendering fundamentals.

**Total Tasks:** 15
**Estimated Time:** 4-6 hours
**Test Coverage:** Integration tests for data model
**Documentation:** Design doc, investigation doc, completion summary

---

## Implementation Completion

**Status:** ✅ COMPLETE

**Completed:** 2026-01-02

### What Was Built

All 15 tasks completed successfully:

1. ✅ Location type extended with coordinates & connections
2. ✅ 5 POC locations with coordinate data (crossroads, tavern, town square, forest, bandit camp)
3. ✅ WorldMapCanvasScreen component created
4. ✅ Viewport state (pan offset + zoom level)
5. ✅ Mouse drag panning
6. ✅ Mouse wheel zooming (0.5x - 2.0x range)
7. ✅ Location nodes rendered as positioned HTML elements
8. ✅ Connection lines drawn on canvas with unlock state styling
9. ✅ Click navigation to location hubs
10. ✅ MapControls component with zoom in/out/reset buttons
11. ✅ Touch gestures (single-finger pan, two-finger pinch zoom)
12. ✅ App.tsx integration with TestingScreen entry point
13. ✅ Auto-center viewport on current location
14. ✅ Integration tests (6 passing tests)
15. ✅ Documentation updates

### Files Created

- `src/screens/WorldMapCanvasScreen.tsx` - Main POC component (309 lines)
- `src/components/MapControls.tsx` - Zoom controls component (77 lines)
- `src/__tests__/integration/world-map-canvas.test.tsx` - Integration tests (115 lines)

### Files Modified

- `src/types/narrative.ts` - Added coordinates & connections fields to Location
- `src/data/locations.ts` - Added coordinate data to 5 locations
- `src/screens/index.ts` - Exported WorldMapCanvasScreen
- `src/components/index.ts` - Exported MapControls
- `src/types/navigation.ts` - Added 'worldMapCanvas' screen type
- `src/App.tsx` - Added worldMapCanvas screen case
- `src/screens/TestingScreen.tsx` - Added Canvas Map test button

### Known Limitations

1. **POC Scope**: Only 5 locations have coordinates (crossroads, rusty-tavern, town-square, forest-path, bandit-camp)
2. **Simple Rendering**: No advanced features like minimap, location labels on hover, or path highlighting
3. **No Persistence**: Viewport state (pan/zoom) resets on screen change
4. **Basic Touch**: Pinch zoom works but could be smoother
5. **Canvas DPI**: Uses devicePixelRatio for crisp rendering but not tested on all devices

### Next Steps

Per `docs/plans/2026-01-02-leaflet-investigation.md`, the recommended path forward is:

**Phase 2: Production Implementation with Leaflet.js**

1. Install leaflet & react-leaflet dependencies
2. Create custom marker components for locations
3. Implement custom tile layer or blank map
4. Migrate viewport state & interaction handlers
5. Add minimap, legend, and advanced features
6. Polish mobile experience
7. Performance testing on devices

**Migration Effort:** 2-3 days (design already validated)

### Testing

All tests passing:
- `npm run build` - TypeScript compilation ✅
- `npm test -- world-map-canvas` - 6 integration tests ✅

### Usage

Navigate to Testing Screen from Main Menu, then click "View Canvas Map" button to access the POC.

Controls:
- **Mouse**: Drag to pan, scroll wheel to zoom
- **Touch**: Single finger to pan, pinch to zoom
- **Buttons**: Bottom-right controls for zoom in/out/reset
- **Navigation**: Click unlocked locations to travel

---

**POC successfully demonstrates coordinate-based world map with pan/zoom navigation. Ready for production implementation with Leaflet.js.**
