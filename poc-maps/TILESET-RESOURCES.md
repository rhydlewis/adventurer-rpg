# 🎨 Tileset Resources Guide

A curated list of royalty-free tilesets perfect for Adventurer RPG.

## 🏆 Top Recommendations (Production-Ready)

### 1. LPC (Liberated Pixel Cup) - Universal Spritesheet
**Best for:** Complete outdoor and indoor environments

**Download:** https://opengameart.org/content/lpc-terrain-repack

**Specs:**
- Size: 32x32 pixels
- License: CC-BY-SA 3.0 (free for commercial)
- Tiles: 500+ terrain tiles

**Includes:**
- Grass (multiple variants)
- Stone floors and walls
- Dirt, sand, snow
- Water (animated frames available)
- Forest tiles
- Interior floors (wood, stone, carpet)
- Dungeon tiles
- Bridges, paths, fences

**Perfect for:** Oakhaven Village, Blackwood Forest

---

### 2. Kenney - Micro Roguelike
**Best for:** Dungeon crawlers, clean pixel art

**Download:** https://kenney.nl/assets/micro-roguelike

**Specs:**
- Size: 16x16 pixels
- License: CC0 (public domain)
- Tiles: 200+ tiles

**Includes:**
- Stone floors and walls
- Doors, gates
- Chests, barrels
- Torches, candles
- Stairs, ladders
- Characters and enemies
- UI elements

**Perfect for:** Tower Interior, Catacombs

---

### 3. 0x72 - Dungeon Tileset II
**Best for:** Atmospheric dungeons with great aesthetics

**Download:** https://0x72.itch.io/dungeontileset-ii

**Specs:**
- Size: 16x16 pixels
- License: Free for commercial use
- Tiles: 100+ dungeon tiles

**Includes:**
- Stone floor variants
- Cracked walls
- Prison cells
- Decorative elements
- Props (barrels, bones, chains)

**Perfect for:** Catacombs, Tower levels

---

### 4. Michele "Buch" - Dungeon Tileset
**Best for:** Classic RPG dungeon feel

**Download:** https://opengameart.org/content/dungeon-tileset

**Specs:**
- Size: 16x16 pixels
- License: CC0 (public domain)
- Tiles: 50+ basic dungeon tiles

**Includes:**
- Stone floors
- Walls with torches
- Doors
- Pillars
- Stairs

**Perfect for:** All dungeon locations

---

## 📦 Complete Starter Pack

### Recommended Combo for All 5 Campaign Locations

#### Outdoor Areas (Oakhaven, Forest)
```
LPC Terrain Pack
├── grass_01.png (32x32)
├── grass_dark_01.png
├── tree_01.png
├── tree_02.png
├── cobblestone_01.png
├── dirt_path_01.png
└── water_01.png (animated)
```

#### Indoor/Dungeon (Tower, Catacombs)
```
Kenney Micro Roguelike
├── floor_stone_01.png (16x16)
├── floor_stone_02.png
├── wall_stone.png
├── door_closed.png
├── stairs_up.png
├── stairs_down.png
└── torch.png (animated)
```

#### Special Areas (Void Sanctum)
```
Custom/Modified
├── void_floor.png (darkened stone with purple tint)
├── void_wall.png (dark stone)
└── altar.png (glowing altar sprite)
```

---

## 🔗 Direct Download Links

### Immediate Downloads (No Account Required)

#### OpenGameArt Collections
- **LPC Base Assets**: https://opengameart.org/content/liberated-pixel-cup-0-base-assets
- **LPC Terrain**: https://opengameart.org/content/lpc-terrain-repack
- **Generic Platformer**: https://opengameart.org/content/generic-platformer-tiles

#### Kenney (All Packs)
- **All Assets (1GB+)**: https://kenney.nl/assets (click "Download All")
- **Tiny Dungeon**: https://kenney.nl/content/3-assets/45/tinydungeon.zip
- **Micro Roguelike**: https://kenney.nl/content/3-assets/44/microroguelike.zip
- **Tiny Town**: https://kenney.nl/content/3-assets/44/tinytown.zip

#### Itch.io Free Assets
- **0x72 Dungeon Tileset**: https://0x72.itch.io/dungeontileset-ii (click "Download")
- **Cup Nooble Overworld**: https://cupnooble.itch.io/sprout-lands-asset-pack

---

## 🎮 Character Sprites (Bonus)

### For Player & NPC Characters

#### LPC Character Generator
- **URL:** https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets
- **Size:** 32x32 per frame
- **Animations:** Walk, attack, idle (all 4 directions)
- **Classes:** Fighter, Rogue, Wizard, Cleric all available
- **License:** CC-BY-SA 3.0

#### Kenney - Tiny Characters
- **URL:** https://kenney.nl/assets/bit-pack
- **Size:** 16x16
- **Style:** Minimalist but charming
- **License:** CC0

---

## 📐 Technical Setup Guide

### File Structure for Your Project
```
adventurer-rpg/
├── public/
│   └── tilesets/
│       ├── terrain/
│       │   ├── grass_01.png
│       │   ├── grass_dark_01.png
│       │   ├── dirt_01.png
│       │   └── ...
│       ├── dungeon/
│       │   ├── floor_stone_01.png
│       │   ├── wall_stone.png
│       │   └── ...
│       ├── objects/
│       │   ├── door.png
│       │   ├── chest.png
│       │   ├── torch.png
│       │   └── ...
│       └── characters/
│           ├── player_fighter.png
│           ├── enemy_goblin.png
│           └── ...
```

### Import Commands
```bash
# Create tileset directory
mkdir -p public/tilesets/{terrain,dungeon,objects,characters}

# Download and extract LPC
cd public/tilesets/terrain
wget https://opengameart.org/sites/default/files/lpc-terrains_0.zip
unzip lpc-terrains_0.zip

# Download Kenney
cd ../dungeon
wget https://kenney.nl/content/3-assets/44/microroguelike.zip
unzip microroguelike.zip
```

### CSS Integration
```css
/* In your tilemap.css */
.tile-grass {
  background-image: url('/tilesets/terrain/grass_01.png');
  background-size: cover;
  image-rendering: pixelated; /* Keeps pixel art crisp */
}

.tile-stone-floor {
  background-image: url('/tilesets/dungeon/floor_stone_01.png');
  background-size: cover;
  image-rendering: pixelated;
}
```

### React Component
```tsx
// src/components/Tile.tsx
interface TileProps {
  type: string;
  size?: number;
}

export const Tile: React.FC<TileProps> = ({ type, size = 32 }) => (
  <div
    className={`tile tile-${type}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundImage: `url(/tilesets/${getTilesetPath(type)})`,
      backgroundSize: 'cover',
      imageRendering: 'pixelated'
    }}
  />
);
```

---

## 🎨 Creating Custom Tiles

### Tools
1. **Aseprite** ($20, or compile free from source)
   - Best for pixel art
   - Built-in animation support
   - Export to sprite sheets

2. **GIMP** (Free)
   - Powerful image editor
   - Good for modifying existing tilesets
   - Supports 8x8, 16x16, 32x32 grids

3. **Piskel** (Free, web-based)
   - https://www.piskelapp.com/
   - Simple online pixel art editor
   - Export to PNG

### Creating Void Tiles (Example)
```
1. Start with dungeon stone tile (gray)
2. Adjust hue: Purple tint (HSL: 270°)
3. Reduce brightness: 30%
4. Add glow effect: Outer glow, purple, 5px
5. Save as: void_floor.png (32x32)
```

---

## 📄 License Requirements

### CC0 (Public Domain)
- **No attribution required**
- Use freely for any purpose
- Examples: Kenney assets, some OpenGameArt

### CC-BY 3.0 / CC-BY-SA 3.0
- **Attribution required**
- Credit the creator in your game
- Examples: LPC assets, game-icons.net

#### Attribution Template
```
Credits:
- Terrain tiles: Liberated Pixel Cup contributors (CC-BY-SA 3.0)
  https://opengameart.org/content/lpc-base-assets
- Dungeon tiles: Kenney (CC0) https://kenney.nl
- Icons: game-icons.net (CC-BY 3.0) https://game-icons.net
```

---

## 🚀 Quick Start (Copy-Paste Ready)

### Download All Recommended Assets (Bash)
```bash
#!/bin/bash
# Download script for Adventurer RPG tilesets

mkdir -p public/tilesets/downloads
cd public/tilesets/downloads

# LPC Terrain
wget -O lpc-terrain.zip "https://opengameart.org/sites/default/files/lpc-terrains_0.zip"

# Kenney Micro Roguelike
wget -O kenney-roguelike.zip "https://kenney.nl/content/3-assets/44/microroguelike.zip"

# Extract all
unzip lpc-terrain.zip -d ../terrain/
unzip kenney-roguelike.zip -d ../dungeon/

echo "✅ Tilesets downloaded and extracted!"
```

---

## 📊 Tileset Comparison Table

| Tileset | Size | Tiles | License | Best For | Download |
|---------|------|-------|---------|----------|----------|
| **LPC Terrain** | 32x32 | 500+ | CC-BY-SA | Outdoor | [Link](https://opengameart.org/content/lpc-terrain-repack) |
| **Kenney Roguelike** | 16x16 | 200+ | CC0 | Dungeon | [Link](https://kenney.nl/assets/micro-roguelike) |
| **0x72 Dungeon** | 16x16 | 100+ | Free | Dungeon | [Link](https://0x72.itch.io/dungeontileset-ii) |
| **Michele Buch** | 16x16 | 50+ | CC0 | Basic | [Link](https://opengameart.org/content/dungeon-tileset) |

---

## 🎯 Next Steps

1. ✅ Choose tileset(s) from recommendations above
2. ✅ Download to `public/tilesets/`
3. ✅ Update CSS classes in `tilemap.css`
4. ✅ Test in POC demo (`poc-maps/demo/index.html`)
5. ✅ Integrate into React app
6. ✅ Add attribution to credits screen

---

**Last Updated:** December 2025
**POC Location:** `/poc-maps/`
