# Leaflet.js Investigation for World Map Canvas POC

**Date:** 2026-01-02
**Purpose:** Evaluate Leaflet.js vs custom canvas for coordinate-based world map

---

## Research Summary

### Leaflet.js Overview

**What it is:** Leading open-source JavaScript library for mobile-friendly interactive maps (~42 KB)

**Key Features:**
- Pan/zoom with inertia and smooth animations
- Mobile gestures (pinch-zoom, drag) built-in
- Hardware acceleration on mobile
- Retina display support
- Event system (click, hover, drag)
- Layer system (markers, polylines, polygons, GeoJSON)
- Highly extensible plugin ecosystem

**Mobile Support:**
- iOS Safari 7+, Chrome, Firefox, mobile IE10+
- Tap delay elimination
- CSS-based smooth panning/zooming
- Touch gesture support out of the box

### React Integration: react-leaflet

**Package:** `react-leaflet` (React components for Leaflet)

**Installation:**
```bash
npm install leaflet react-leaflet @types/leaflet
```

**TypeScript Support:** Excellent - full type definitions available

**Basic Usage:**
```tsx
import { MapContainer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

<MapContainer center={[0, 0]} zoom={1}>
  <Marker position={[0, 0]}>
    <Popup>Location Name</Popup>
  </Marker>
  <Polyline positions={[[0, 0], [100, 100]]} />
</MapContainer>
```

**Component Model:** Declarative React components that wrap Leaflet's imperative API

---

## RPG Interactive Map Example Analysis

**Repository:** https://github.com/TaylorHo/rpg-interactive-map

**What it does:**
- Displays custom fantasy maps with clickable markers
- Uses Leaflet for pan/zoom navigation
- CSV-driven marker data
- Sidebar panel for location details
- Toggleable marker layers by category

**Key Implementation Details:**
- **Tile-based maps:** Converts custom maps to tiles using maptiles tool
- **CSV markers:** Loads location data from CSV (coordinates, icons, descriptions)
- **Leaflet sidebar plugin:** Shows location info on marker click
- **Static hosting:** Works on GitHub Pages, Vercel

**Relevance to our project:**
- ✅ Pan/zoom mechanics (directly applicable)
- ✅ Marker interaction (similar to our location nodes)
- ❌ Tile-based background (we want abstract nodes, not image tiles)
- ❌ CSV data (we use TypeScript/JSON)
- ⚠️ Coordinate system (uses lat/lng, we'd need to adapt to abstract x/y)

---

## Comparison: Leaflet.js vs Custom Canvas

| Aspect | Leaflet.js | Custom Canvas + HTML |
|--------|-----------|---------------------|
| **Bundle Size** | +42 KB (leaflet) + ~30 KB (react-leaflet) | 0 KB (native browser APIs) |
| **Development Time** | Faster (pan/zoom/gestures built-in) | Slower (build everything from scratch) |
| **Mobile Gestures** | ✅ Built-in (pinch, drag, inertia) | ⚠️ Manual implementation needed |
| **TypeScript Support** | ✅ Excellent (@types/leaflet) | ✅ Native (no types needed) |
| **Learning Curve** | ⚠️ Moderate (new API to learn) | ✅ Low (familiar canvas/DOM APIs) |
| **Flexibility** | ⚠️ Limited to Leaflet's model | ✅ Full control over everything |
| **Performance** | ✅ Highly optimized | ⚠️ Depends on our implementation |
| **Coordinate System** | ⚠️ Uses lat/lng (need adapter) | ✅ Native x/y coordinates |
| **Connection Lines** | ✅ Polyline component | ✅ Canvas line drawing |
| **Markers/Nodes** | ✅ Marker + DivIcon (HTML) | ✅ Positioned divs |
| **Zoom Controls** | ✅ Built-in | ⏱️ Need to build |
| **Centering/Bounds** | ✅ Built-in methods | ⏱️ Need to implement |
| **Customization** | ⚠️ CSS + Leaflet options | ✅ Complete control |
| **Testing** | ✅ Well-tested library | ⏱️ Need comprehensive tests |
| **Documentation** | ✅ Excellent docs + examples | ⚠️ Self-documented only |

---

## Technical Considerations

### Coordinate System Adaptation

**Leaflet's model:** Latitude/Longitude coordinates (geographic)
**Our model:** Abstract x/y units

**Solution:** Use Leaflet's CRS.Simple (non-geographic coordinate system)

```tsx
import L from 'leaflet';

<MapContainer
  center={[0, 0]}
  zoom={1}
  crs={L.CRS.Simple}  // Use simple x/y instead of lat/lng
  minZoom={0.5}
  maxZoom={2.0}
>
```

With `CRS.Simple`, coordinates work as `[y, x]` (note: reversed) and map directly to pixels.

### Custom Marker Styling

Leaflet supports custom HTML markers via DivIcon:

```tsx
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const customIcon = L.divIcon({
  className: 'custom-location-marker',
  html: '<div class="location-node">...</div>',
  iconSize: [44, 44]
});

<Marker position={[0, 0]} icon={customIcon} />
```

This gives us full React component + CSS control over markers (same as our HTML approach).

### Connection Lines

```tsx
import { Polyline } from 'react-leaflet';

<Polyline
  positions={[[0, 0], [100, 50]]}
  pathOptions={{
    color: '#border-default',
    weight: 2,
    dashArray: '5, 5'  // Dashed for locked connections
  }}
/>
```

---

## Pros & Cons Summary

### Leaflet.js Pros ✅
1. **Mobile-optimized out of the box** - pinch-zoom, drag, inertia all work perfectly
2. **Faster development** - pan/zoom/gestures already implemented and tested
3. **Battle-tested** - used by major mapping applications, handles edge cases
4. **Excellent documentation** - tons of examples, tutorials, community support
5. **React integration** - react-leaflet provides clean declarative API
6. **Performance optimized** - viewport culling, layer management, hardware acceleration
7. **Zoom controls built-in** - recenter, bounds, zoom levels all available

### Leaflet.js Cons ❌
1. **Bundle size** - adds ~70 KB total (not huge, but not zero)
2. **Learning curve** - need to understand Leaflet's API and concepts
3. **Coordinate system** - uses [y, x] ordering with CRS.Simple (minor adaptation)
4. **Overkill for POC** - we're only using 20% of Leaflet's features
5. **Styling limitations** - some CSS must work within Leaflet's structure
6. **Dependency** - adds external dependency to maintain/update

### Custom Canvas Pros ✅
1. **Zero dependencies** - native browser APIs only
2. **Full control** - customize every pixel and interaction
3. **Native coordinates** - use x, y directly (no lat/lng confusion)
4. **Lightweight** - no bundle size increase
5. **Perfect fit** - build exactly what we need, nothing more

### Custom Canvas Cons ❌
1. **Development time** - implement pan, zoom, gestures from scratch
2. **Mobile gestures** - pinch-zoom, inertia, tap handling all manual
3. **Edge cases** - need to handle all viewport/zoom edge cases ourselves
4. **Testing burden** - comprehensive tests needed for all interactions
5. **Performance** - need to optimize viewport culling, rendering ourselves

---

## Recommendation

**Use Custom Canvas + HTML for POC, migrate to Leaflet.js for production**

### Two-Phase Approach

**Phase 1: POC with Custom Canvas**
Build proof-of-concept with custom implementation to:
- Understand the exact mechanics and requirements
- Test coordinate placement and navigation flow
- Validate the abstract node map concept
- Learn what features we actually need

**Phase 2: Migrate to Leaflet.js for Production**
Once POC validates the approach, migrate to Leaflet.js for:
- Battle-tested mobile gestures (pinch-zoom, inertia)
- Performance optimization at scale (50+ locations)
- Professional pan/zoom feel
- Reduced maintenance burden

### Reasoning for Custom POC First

1. **Requirements clarity:** Building it ourselves reveals exactly what we need from Leaflet
2. **Learning value:** Understand pan/zoom mechanics deeply before using library abstractions
3. **Native coordinates:** Test with simple x/y before adapting to Leaflet's CRS.Simple
4. **Faster POC iteration:** No time spent learning Leaflet API upfront
5. **Informed migration:** Know which Leaflet features to use when we switch

### Reasoning for Leaflet Production Implementation

1. **Mobile optimization:** Leaflet's gestures are battle-tested on millions of devices
2. **Performance:** Handles viewport culling, layer management, hardware acceleration automatically
3. **Maintenance:** Less code to maintain, more time for game features
4. **Edge cases:** Leaflet handles zoom bounds, viewport limits, orientation changes
5. **Future features:** Easy to add tile backgrounds, minimap, advanced interactions

### Migration Path

The POC will naturally map to Leaflet concepts:

| Custom POC | Leaflet.js Equivalent |
|------------|----------------------|
| Viewport state (x, y, zoom) | `MapContainer` with `center` and `zoom` |
| HTML positioned nodes | `Marker` with `DivIcon` |
| Canvas connection lines | `Polyline` components |
| Pan/zoom handlers | Built-in (zero code) |
| Touch gestures | Built-in (zero code) |
| Recenter button | `map.setView()` method |

### Implementation Plan

**POC Phase (Custom Canvas):**
1. Implement basic pan/zoom (mouse/wheel)
2. Test with 3-5 locations
3. Add touch gestures (pinch, drag)
4. Validate coordinate system and navigation flow
5. Document lessons learned

**Migration Phase (To Leaflet.js):**
1. Install `leaflet`, `react-leaflet`, `@types/leaflet`
2. Replace viewport state with `<MapContainer crs={L.CRS.Simple}>`
3. Convert HTML nodes to `<Marker>` with `DivIcon`
4. Convert canvas lines to `<Polyline>` components
5. Remove custom pan/zoom code (Leaflet handles it)
6. Test mobile gestures feel natural
7. Compare bundle size impact (~70kb)

**Timeline:** POC first, then migrate once validated

---

## Sources

- [Leaflet.js Official Site](https://leafletjs.com)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [RPG Interactive Map Example](https://github.com/TaylorHo/rpg-interactive-map)
- [React Leaflet TypeScript Guide](https://jsdev.space/mastering-react-leaflet/)
- [React Leaflet Installation](https://react-leaflet.js.org/docs/start-installation/)
- [Leaflet TypeScript Tutorial](https://docs.maptiler.com/leaflet/examples/ts-get-started/)
