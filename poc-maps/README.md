# 🗺️ Map System - Proof of Concept

This directory contains a standalone proof-of-concept for the 2D tile-based map system for Adventurer RPG.

## 📁 Structure

```
poc-maps/
├── demo/
│   ├── index.html       # Main demo page
│   └── tilemap.css      # Tile renderer styles
├── maps/
│   └── campaign-maps.js # Map data for all 5 locations
└── README.md            # This file
```

## 🚀 Quick Start

### View the Demo

1. Open `demo/index.html` in any web browser:
   ```bash
   # From project root
   open poc-maps/demo/index.html

   # Or use a local server (recommended)
   cd poc-maps/demo
   python3 -m http.server 8080
   # Then visit: http://localhost:8080
   ```

2. You'll see all 6 maps rendered with CSS-based tiles

## 🎨 Features Demonstrated

### Current Implementation (CSS-based)
- ✅ **CSS Grid Layout** - Fast, responsive tile rendering
- ✅ **Procedural Textures** - CSS gradients for grass, stone, water, etc.
- ✅ **Animated Tiles** - Water shimmer, void pulse effects
- ✅ **Interactive Elements** - Player, enemies, NPCs, chests (using emojis)
- ✅ **Multiple Terrain Types** - 10+ different tile types
- ✅ **Hex Grid Support** - Example hex tile layout included

### Maps Included
1. **Oakhaven Village** (20x15) - Starting village with NPCs, buildings
2. **Blackwood Forest** (20x15) - Corrupted forest with paths
3. **Tower - Foyer** (16x16) - Entrance hall with enemies
4. **Tower - Alchemist's Lab** (16x16) - Laboratory level
5. **Underground Catacombs** (18x14) - Maze-like dungeon
6. **Void Sanctum** (16x16) - Final boss arena
7. **Hex Grid Example** (15x12) - Bonus hex layout demo

## 🔧 How It Works

### Tile Representation
Maps are stored as ASCII art strings:
```javascript
tiles: [
  "################",
  "#fffffffffffffff",  // 'f' = stone floor
  "#fff.....fffff#",   // '.' = grass
  "#ff...P...ffff#",   // 'P' = player start
  "#ffffffUffffff#",   // 'U' = stairs up
  "################"    // '#' = wall
]
```

### Tile Types
| Character | Tile Type | CSS Class |
|-----------|-----------|-----------|
| `.` | Grass | `tile-grass` |
| `D` | Dark Grass | `tile-dark-grass` |
| `#` | Wall | `tile-wall` |
| `f` | Stone Floor | `tile-stone-floor` |
| `w` | Water | `tile-water` |
| `T` | Tree | `tile-tree` |
| `c` | Cobblestone | `tile-cobblestone` |
| `W` | Wood Floor | `tile-wood-floor` |
| `v` | Void | `tile-void` |
| `P` | Player | `tile-player` |
| `E` | Enemy | `tile-enemy` |
| `N` | NPC | `tile-npc` |
| `C` | Chest | `tile-chest` |

### Rendering Process
```javascript
// 1. Define map data
const myMap = {
  name: "Example Map",
  width: 10,
  height: 10,
  tiles: [ /* ASCII grid */ ]
};

// 2. Render to container
renderMap(myMap, 'container-id');

// 3. CSS Grid displays tiles automatically
```

## 🎨 Swapping to Real Tilesets

### Option 1: Replace CSS Background Images
Update `tilemap.css`:
```css
.tile-grass {
  background-image: url('/tilesets/grass.png');
  background-size: cover;
  image-rendering: pixelated;
}
```

### Option 2: Use React Component
```tsx
interface TileProps {
  type: string;
  x: number;
  y: number;
}

const Tile: React.FC<TileProps> = ({ type, x, y }) => (
  <div
    className={`tile tile-${type}`}
    style={{
      backgroundImage: `url(/tilesets/${type}.png)`
    }}
  />
);
```

## 📦 Integrating into Main App

### Step 1: Copy Map Data
```bash
# Copy map definitions to src
cp poc-maps/maps/campaign-maps.js src/data/maps.ts
# Convert to TypeScript format
```

### Step 2: Create Map Component
```tsx
// src/components/TileMap.tsx
import { maps } from '@/data/maps';

export const TileMap: React.FC<{ mapId: string }> = ({ mapId }) => {
  const map = maps[mapId];

  return (
    <div className="grid" style={{
      gridTemplateColumns: `repeat(${map.width}, 32px)`
    }}>
      {/* Render tiles */}
    </div>
  );
};
```

### Step 3: Add to Game State
```typescript
interface GameState {
  currentLocation: string;
  currentMap: MapData;
  playerPosition: { x: number; y: number };
  visitedLocations: string[];
}
```

## 🆓 Recommended Tileset Resources

### For Production Use
1. **[OpenGameArt - LPC Terrain](https://opengameart.org/content/lpc-terrain-repack)**
   - 32x32 tiles
   - Grass, stone, dungeon, forest
   - CC-BY-SA 3.0

2. **[Kenney - Micro Roguelike](https://kenney.nl/assets/micro-roguelike)**
   - 16x16 tiles
   - Perfect for dungeons
   - CC0 (public domain)

3. **[0x72 - Dungeon Tileset II](https://0x72.itch.io/dungeontileset-ii)**
   - 16x16 tiles
   - Beautiful pixel art
   - Free for commercial use

### Tools
- **Tiled Map Editor** - https://www.mapeditor.org/
- **Aseprite** - Pixel art editor ($20 or compile free)
- **GIMP** - Free image editor for tile manipulation

## 🎯 Next Steps

- [ ] Download production tilesets (32x32 recommended)
- [ ] Convert to TypeScript types
- [ ] Integrate into React app
- [ ] Add tile interactions (click to move, etc.)
- [ ] Implement fog of war
- [ ] Add tile animations (torches, water, etc.)
- [ ] Create map transition system
- [ ] Add collision detection
- [ ] Implement pathfinding (A* algorithm)

## 📝 Notes

### Tile Size Recommendations
- **16x16** - Retro, pixel art style (larger maps)
- **32x32** - Sweet spot for web games
- **48x48** - More detail, better for mobile

### Performance
- CSS Grid handles up to 50x50 tiles easily
- For larger maps, use viewport culling
- Consider Canvas API for 100+ tile maps

### Hex Grid Implementation
See `hexExample` map for offset hex layout:
```javascript
// Odd rows are offset by 16px (half tile width)
if (y % 2 === 1) {
  tileDiv.style.marginLeft = '16px';
}
```

## 🤝 Attribution

If using the recommended free tilesets:
- **LPC Assets**: "Liberated Pixel Cup contributors (CC-BY-SA 3.0)"
- **Kenney Assets**: "Kenney.nl (CC0)"
- **game-icons.net**: "game-icons.net (CC-BY 3.0)" (for icons)

---

**POC Status:** ✅ Complete - Ready for integration

**Created:** December 2025
**Purpose:** Demonstrate tile-based map rendering for Adventurer RPG
