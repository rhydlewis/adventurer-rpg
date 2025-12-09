# 🗺️ Campaign Map Layouts Reference

Visual reference for all campaign locations in ASCII art format.

---

## 1. Oakhaven Village (20x15)
**Description:** Starting village with NPCs, buildings, and a peaceful stream

```
..........TT........
..cc.....TTT........
.cccc.....TT........
.cNcc................    Legend:
.cccc................    . = grass
..cc..##d##..........    c = cobblestone
......#WWW#...##d##..    N = NPC (village elder)
......#WWW#...#WWW#..    # = wall
......#WWW#...#CWW#..    W = wood floor
......##d##...##d##..    d = door
.....................    C = chest
..P..................    P = player start
.......wwwwwwww......    w = water
.......wwwwwwww......    T = tree
...TT...wwwwww......T
```

**Features:**
- Safe zone (no combat)
- 2 buildings (tavern + shop)
- Village elder NPC
- Chest with starting gear
- Decorative stream and trees

---

## 2. Blackwood Forest (20x15)
**Description:** Corrupted wilderness with a winding path through dark vegetation

```
TTTDDDTTTDDDTTTTDDTT
TTDDDDDTDDDDDTTDDDDT
TDDDDDDDDDDDDDDDDTTT    Legend:
TDDDT.DpppDD.DDDTTTT    D = dark grass (corrupted)
DDD...DpppD...DDTTTT    T = tree
DD.P..DpppD....DTTTT    p = dirt path
DD....DpppD...EDTTTT    . = grass
DDD...DpppDD...DTTTT    P = player start
TDDD..DpppDDD..DTTTT    E = enemy (corrupted creature)
TTDD.DDpppDD..DDTTTT    C = hidden chest
TTTD.DDpppDDD.DDTTTT
TTTD..DpppDD..DDTTTT
TTDD...pppD....DTTTT
TTTD...pppDD.CDDTTTT
TTTT...ppppDDDDTTTTT
```

**Features:**
- Linear path through corruption
- 1 enemy encounter
- Hidden chest off the path
- Increasingly dark vegetation
- Leads to tower entrance

---

## 3. Tower - Foyer (16x16)
**Description:** Grand entrance hall with symmetrical design

```
################
#fffffffffffffff
#fffffffffffff#    Legend:
#fff.....fffff#    # = wall
#ff.......ffff#    f = stone floor
#ff...P...ffff#    . = grass (central area)
#ff.......ffff#    P = player start
#fff.....fffff#    U = stairs up
#ffffffUffffff#    d = door
#fffffffffffff#    E = enemy guard
#ff#d#####d#ff#    C = chest
#ff#fffff#fff#
#E.#fCfff#.E.#
#..#fffff#...#
#..dfffffd...#
################
```

**Features:**
- Symmetrical layout
- Central grassy courtyard
- 2 enemy guards
- Side rooms with chest
- Stairs to upper level

---

## 4. Tower - Alchemist's Lab (16x16)
**Description:** Experimental laboratory with workbenches and storage

```
################
#fffffffffffff#
#fffffffffffff#    Legend:
#ff##ff##ffff#    # = wall
#ff##ff##ffff#    f = stone floor
#fffffffffffff#    ## = workbench/table
#fffffffffffff#    C = chest (ingredients)
#ffff...ffffff#    P = player start
#fffC...Cfffff#    E = alchemist enemy
#ffff...ffffff#    D = stairs down
#fffffffffffff#
#ffPffffffEff#
#fffffffffffff#
#ffffffDffffff#
#fffffffffffff#
################
```

**Features:**
- Workbenches (tables)
- 2 chests with alchemical items
- 1 enemy (corrupted alchemist)
- Stairs down to catacombs
- Open floor plan

---

## 5. Underground Catacombs (18x14)
**Description:** Maze-like burial chambers with multiple rooms

```
##################
#kkkkkk#kkkkkkkk##
#kkkkkk#kkkkkkkkE#    Legend:
#U#d####kkkkkkk###    # = wall
#k#kkkkkkk###d#kk#    k = crypt floor (dark stone)
#k#kCkkkk##kkk#Ck#    U = stairs up (to tower)
#k#kkkk###kkk###k#    d = door
#k####d#kkkkkk#kk#    C = chest (treasure/bones)
#kkkkkk#kkEkk##kk#    P = player start
#P#kkk##kkkkk#kkk#    E = enemy (wraith/ghoul)
###kkk#kkkk###kkk#
#Ekkk##kkkk#Ckkk##
#kkkk#kkkkkk#kkkk#
##################
```

**Features:**
- Non-linear maze layout
- Multiple rooms and corridors
- 3 enemy encounters
- 3 treasure chests
- Stairs back to tower

---

## 6. Void Sanctum (16x16)
**Description:** Final boss arena, the lich's ritual chamber

```
################
#vvvvvvvvvvvvv#
#vvvvvvvvvvvvv#    Legend:
#vvv........vvv#    # = wall
#vv..........vv#    v = void (dark purple energy)
#vv....vv....vv#    . = stone floor (ritual area)
#vv...vvvv...vv#    A = altar (ritual focus)
#vv...vvvv...vv#    P = player start
#vv...vAAv...vv#    E = Sorath the Lich (boss)
#vv...vvvv...vv#
#vv....vv....vv#
#vv....P.....vv#
#vvv........vvv#
#vvvvv.E.vvvvv#
#vvvvvvvvvvvvv#
################
```

**Features:**
- Circular arena design
- Void energy surrounding ritual area
- Central altar (objective)
- Boss encounter (Sorath)
- Dramatic final confrontation

---

## 7. Hex Grid Example (15x12) [BONUS]
**Description:** Demonstration of offset hex grid layout

```
...TT...TT...TT
..TT...TT...TT.    Legend:
...TT.ppp.TT...    . = grass
..TT..ppp..TT..    T = tree
...T..pPp..T...    p = path
..TT..ppp..TT..    P = player
...TT.ppp.TT...    w = water
..TTTTpppTTTT..
...wwwwwwwww...    Note: Odd rows offset
..wwwwwwwwww...    by 16px for hex layout
...wwwwwwww....
...............
```

**Features:**
- Offset hex grid pattern
- Works with same tile system
- Alternative for strategic games
- CSS offset: `margin-left: 16px` on odd rows

---

## 🎨 Tile Statistics

| Map Name | Dimensions | Tiles | Terrain Types | Entities |
|----------|------------|-------|---------------|----------|
| Oakhaven | 20x15 | 300 | 7 | 1 NPC, 1 chest |
| Blackwood | 20x15 | 300 | 5 | 1 enemy, 1 chest |
| Tower Foyer | 16x16 | 256 | 3 | 2 enemies, 1 chest |
| Alchemist Lab | 16x16 | 256 | 2 | 1 enemy, 2 chests |
| Catacombs | 18x14 | 252 | 2 | 3 enemies, 3 chests |
| Void Sanctum | 16x16 | 256 | 3 | 1 boss, 1 altar |
| **Total** | - | **1,620** | **12 unique** | **8E + 1N + 8C** |

---

## 🎯 Design Patterns Used

### Progressive Difficulty
1. **Oakhaven** - Safe zone, tutorial area
2. **Blackwood** - First combat, linear path
3. **Tower Foyer** - Multiple enemies, branching
4. **Alchemist Lab** - Puzzle elements, exploration
5. **Catacombs** - Non-linear, challenging navigation
6. **Void Sanctum** - Boss fight, dramatic finale

### Room Types
- **Safe Zones** - No enemies (Oakhaven)
- **Linear Paths** - Guided progression (Blackwood)
- **Symmetrical** - Strategic combat (Tower Foyer)
- **Open Floor** - Free movement (Alchemist Lab)
- **Maze** - Navigation challenge (Catacombs)
- **Arena** - Boss battle (Void Sanctum)

### Visual Density
```
Sparse:  Oakhaven (lots of open space)
         ↓
Medium:  Blackwood, Tower Foyer
         ↓
Dense:   Catacombs, Void Sanctum (claustrophobic)
```

---

## 🔧 Modifying Maps

### Adding an Enemy
```javascript
// In campaign-maps.js, change a floor tile:
"#ffPffffffEff#"  // Before
"#ffPffffffEEf#"  // After (2 enemies now)
```

### Creating a New Room
```javascript
// Add to Tower Foyer:
"#ff##########f#"  // New wall segment
"#ff#fffffff#ff#"  // New room interior
"#ff#ffCffff#ff#"  // With chest
"#ffd#######dff#"  // Two doors
```

### Expanding Map Size
```javascript
oakhaven: {
  width: 25,  // Increased from 20
  height: 20, // Increased from 15
  tiles: [
    ".........................",  // Wider rows
    // ... more rows
  ]
}
```

---

## 📐 Grid Alignment Check

All maps use consistent tile sizes:
- **Standard tiles:** 32x32 pixels
- **Alignment:** Grid-based (no half-tiles)
- **Coordinate system:** (0,0) = top-left

### Coordinate Examples
```
Oakhaven - Player start: (2, 11)
Blackwood - Enemy: (17, 6)
Tower Foyer - Stairs up: (7, 8)
Catacombs - Stairs up: (1, 3)
Void Sanctum - Boss: (7, 13)
```

---

**Map Design Philosophy:**
- Simple, readable layouts
- Clear visual hierarchy
- Strategic enemy placement
- Hidden secrets for exploration
- Progressive difficulty curve

**Created:** December 2025
**Version:** 1.0 - POC
**Status:** ✅ Ready for implementation
