# 🚀 Quick Start Guide - Map POC

Get the map demonstration running in under 1 minute.

## ⚡ View the Demo

### Option 1: Direct Browser (Instant)
```bash
# From project root
open poc-maps/demo/index.html

# Or on Linux
xdg-open poc-maps/demo/index.html
```

### Option 2: Local Server (Recommended)
```bash
cd poc-maps/demo
python3 -m http.server 8080
```
Then visit: **http://localhost:8080**

---

## 📁 What's Inside

```
poc-maps/
├── demo/
│   ├── index.html        ← Open this file!
│   └── tilemap.css       (Tile rendering styles)
├── maps/
│   └── campaign-maps.js  (All 6+ map definitions)
├── README.md             (Full documentation)
├── MAP-LAYOUTS.md        (ASCII art reference)
├── TILESET-RESOURCES.md  (Download links for real tiles)
└── QUICK-START.md        (This file)
```

---

## 🎮 What You'll See

### 6 Rendered Maps
1. **Oakhaven Village** - Starting zone
2. **Blackwood Forest** - Dark wilderness
3. **Tower - Foyer** - Dungeon entrance
4. **Tower - Alchemist's Lab** - Upper level
5. **Underground Catacombs** - Maze dungeon
6. **Void Sanctum** - Boss arena
7. **Hex Grid Example** - Bonus demo

### Features Demonstrated
- ✅ CSS-based tile rendering (no images needed!)
- ✅ Animated tiles (water, void effects)
- ✅ Interactive elements (player, enemies, chests)
- ✅ 12+ different terrain types
- ✅ Responsive grid layout
- ✅ Both square and hex grid support

---

## 🔧 Quick Customization

### Change a Map (Example)
Edit `maps/campaign-maps.js`:
```javascript
oakhaven: {
  name: "Oakhaven Village",
  tiles: [
    "..........TT........",  // Row 1
    "..cc.....TTT........", // Row 2
    // ... edit tiles here
  ]
}
```

### Add Your Own Tile Type
1. Add CSS class in `demo/tilemap.css`:
```css
.tile-lava {
  background: linear-gradient(135deg, #ff4400 0%, #cc2200 100%);
  animation: lava-bubble 2s infinite;
}
```

2. Update tile map in `maps/campaign-maps.js`:
```javascript
const tileTypeMap = {
  'L': 'lava',  // Add this
  // ... other tiles
};
```

3. Use in map:
```javascript
tiles: [
  "####LL####",  // 'L' = lava
]
```

---

## 🎨 Using Real Tilesets

### Quick Download (Kenney - CC0)
```bash
cd poc-maps/tilesets
wget https://kenney.nl/content/3-assets/44/microroguelike.zip
unzip microroguelike.zip
```

### Update CSS
```css
/* In demo/tilemap.css */
.tile-stone-floor {
  background-image: url('../tilesets/microroguelike/tile_0001.png');
  background-size: cover;
  image-rendering: pixelated;
}
```

Refresh browser - Done! 🎉

---

## 📖 Full Documentation

- **README.md** - Complete implementation guide
- **MAP-LAYOUTS.md** - All maps in ASCII art with coordinates
- **TILESET-RESOURCES.md** - Free tileset download links and setup

---

## 🎯 Next Steps

### To Integrate into React App:
1. Copy `maps/campaign-maps.js` → `src/data/maps.ts`
2. Convert to TypeScript types
3. Create `<TileMap>` React component
4. Use CSS Grid or Canvas for rendering

### To Use with Real Tilesets:
1. See **TILESET-RESOURCES.md** for download links
2. Extract to `public/tilesets/`
3. Update CSS background-image URLs
4. Add attribution (if CC-BY license)

### To Create Custom Maps:
1. Edit ASCII art in `campaign-maps.js`
2. Add new tile types as needed
3. Test in browser
4. Export to game

---

## 💡 Tips

**Keyboard Shortcuts (in browser):**
- `Ctrl/Cmd + R` - Reload to see changes
- `Ctrl/Cmd + Shift + I` - Open DevTools to inspect tiles
- `Ctrl/Cmd + +/-` - Zoom in/out

**Performance:**
- CSS Grid handles 50x50 tiles easily
- Use 32x32 tile size for web (sweet spot)
- Consider viewport culling for huge maps (100x100+)

**Styling:**
- All tiles are 32x32px by default
- Change in `.tile { width: 32px; height: 32px; }`
- Mobile: Scales to 24x24 automatically

---

## ✅ Checklist

- [ ] Opened `demo/index.html` in browser
- [ ] Saw all 6+ maps rendered
- [ ] Explored different tile types in legend
- [ ] Read README.md for integration steps
- [ ] Downloaded free tilesets (optional)
- [ ] Tested with local HTTP server
- [ ] Ready to integrate into main app!

---

## 🆘 Troubleshooting

**Maps not showing?**
- Check browser console (F12) for errors
- Make sure `campaign-maps.js` loaded correctly
- Try using HTTP server instead of `file://`

**Tiles look wrong?**
- Check `tilemap.css` is loaded
- Verify tile class names match `tileTypeMap`
- Clear browser cache (Ctrl+Shift+R)

**Want to start fresh?**
```bash
cd poc-maps
git checkout .  # Reset all changes
```

---

**Total Setup Time:** < 1 minute
**Files Created:** 7
**Maps Included:** 6 + bonus
**Status:** ✅ Ready to use!

Open `demo/index.html` and enjoy! 🎮
