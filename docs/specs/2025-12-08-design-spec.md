# Adventurer Game - Design Specification Outline

## 📋 Document Overview

**Purpose:** Transform the current Fighting Fantasy-style combat game into a rich single-player narrative RPG using streamlined d20 mechanics

**Status:** ✅ FINALIZED - Ready for Implementation

**Last Updated:** 2025-12-08

---

## 🎯 Vision & Goals

### Core Vision
Transform from a simple combat simulator into a narrative-driven single-player RPG that combines:
- Tactical d20 combat with meaningful choices
- Rich storytelling with branching narratives
- Exploration and world-building
- Character progression and customization
- Varied gameplay loops (combat, exploration, rest, story events)

### Design Pillars
1. **Narrative First** - Story drives the experience, combat serves the narrative
2. **Meaningful Choices** - Player decisions matter and have consequences
3. **Tactical Depth** - d20 mechanics provide strategic combat options
4. **Exploration Rewards** - Encourage curiosity and world discovery
5. **Solo-Friendly** - Balanced for single-character gameplay

### Success Metrics
- Campaign duration: 1-2 hours for high replayability
- 50/50 story/combat balance with exploration
- Replayability through different classes (Fighter/Rogue/Wizard/Cleric) and story choices
- Player investment in character builds and narrative outcomes
- Permadeath creates meaningful tension

---

## 🗺️ Major System Changes

### 1. Combat System Migration (Fighting Fantasy → d20/Pathfinder)

#### Current State
- 2d6 + SKILL vs 2d6 + SKILL
- Fixed 2 damage per hit
- SKILL, STAMINA, LUCK attributes
- Simple opposed roll mechanics

#### Target State (Streamlined d20 for Single-Player)
- **Core Mechanic:** d20 + BAB + modifiers vs Armor Class
- **Damage:** Variable damage (1d8+STR, 2d6, etc.)
- **Attributes:** Six core attributes (STR, DEX, CON, INT, WIS, CHA)
- **Saving Throws:** Fort/Reflex/Will for spells and effects
- **Critical Hits:** Yes (natural 20s)
- **Attack of Opportunity:** Skipped for simplicity
- **Actions:** Streamlined - just "standard action" (attack OR cast spell)
- **Equipment:** Simple progression (+1/+2/+3 weapons, light/medium/heavy armor)
- **Conditions:** Basic only (stunned, poisoned, strengthened, weakened)

#### Solo Play Balance Adjustments
```
[ ] One-on-one battles (no multi-enemy encounters)
[ ] Buff player character by 20-30% (more HP, better stats than standard)
[ ] Give hybrid abilities (every class gets some healing/defense)
[ ] Generous rest system (heal frequently between fights)
```

#### Key Changes
```
[ ] Replace attribute system (SKILL/STAMINA/LUCK → STR/DEX/CON/INT/WIS/CHA)
[ ] Implement d20 attack roll vs AC
[ ] Add variable weapon damage dice
[ ] Create saving throw system (Fort/Reflex/Will)
[ ] Implement critical hit mechanics
[ ] Add class-based progression (Fighter, Rogue, Wizard, Cleric)
[ ] Calculate derived stats (HP, AC, BAB, saves)
[ ] Implement simplified action economy (standard action only)
[ ] Create basic condition system (4 conditions)
```

---

### 2. Narrative System

#### Core Concept
Story node-based narrative with **linear main story and optional side paths**, limited branching to avoid exponential complexity

#### First Campaign: "The Spire of the Lich King"
See detailed campaign spec: `docs/campaigns/2025-12-08-campaign-1.md`

**Overview:**
- **Villain:** Sorath, a Lich completing an immortality ritual
- **Companion:** "The Elder" - a magical artifact that provides exposition (unknowingly the final artifact the Lich seeks)
- **Structure:** 4 Acts + Epilogue across 5 locations
- **Duration:** 1-2 hours for replayability
- **Locations:** Oakhaven (village) → Blackwood Forest → Tower (3 interior levels) → Underground Catacombs → Void Sanctum

#### Structure
```
Story Nodes
├── Text/Description
├── Location Context
├── Multiple Choices (limited branching)
│   ├── Requirements (skills, items, stats)
│   └── Outcomes (next node, combat, skill check)
└── State Changes (quest updates, items gained, etc.)
```

#### Components
```
[ ] Story Node System
    - Node definitions (text, choices, outcomes)
    - Choice requirements and validation
    - Branching logic

[ ] Campaign Structure
    - Multiple campaigns (starter, advanced, custom)
    - Chapter/act organization
    - Progress tracking

[ ] Dialogue System
    - NPC conversations
    - Character reactions
    - Flavor text and atmosphere

[ ] Quest System
    - Quest objectives and tracking
    - Rewards and completion
    - Side quests vs main story

[ ] Lore & Journal
    - Story recap/summary
    - Discovered lore entries
    - Character notes
```

---

### 3. World & Exploration System

#### Core Concept
**5 interconnected locations** with **gated progression** (unlocked as story advances)

**Travel:** Instant travel (no survival mechanics)
**Content Mix:** Hand-crafted story locations + random encounters within them

#### First Campaign Locations
```
1. Oakhaven (Village) - Safe zone, tavern, magistrate
2. Blackwood Forest - Wilderness, corrupted nature enemies
3. Tower Upper Levels - 2 floors (Foyer, Alchemist's Lab)
4. Underground Catacombs - Maze, wraiths, ghouls, hidden treasures
5. Void Sanctum - Final boss arena
```

#### Structure
```
World Map
├── Locations (5 per campaign)
│   ├── Villages/Towns (safe zones)
│   ├── Wilderness Areas (random encounters)
│   ├── Dungeons (structured challenges)
│   └── Points of Interest (events, treasures)
├── Travel System
│   ├── Instant travel between unlocked locations
│   └── Gated progression (story unlocks new areas)
└── Fog of War
    └── Reveal as explored
```

#### Components
```
[ ] Location System
    - Location definitions (name, description, image)
    - Connected locations (graph structure)
    - Location states (explored, cleared, etc.)

[ ] Random Encounters
    - Encounter tables per location
    - Scaling difficulty
    - Creature variety

[ ] Points of Interest
    - Landmarks
    - Hidden treasures
    - Optional challenges

[ ] Map UI
    - Visual world map
    - Click-to-travel interface
    - Show available paths
    - Mark quest locations
```

---

### 4. Rest & Resource Management

#### Core Concept
Downtime between challenges for recovery, preparation, and story moments

**Resource Scarcity:** None initially (generous rest system for solo balance)
**Merchant System:** Minor feature (basic buy/sell in towns)
**Survival Mechanics:** None (no food/water tracking)

#### Rest Types
```
Short Rest (Quick Break)
├── Restore 50% HP
├── Restore 50% Mana
├── Duration: instant
└── Can use items/prepare spells

Long Rest (Camp/Inn)
├── Restore 100% HP
├── Restore 100% Mana
├── Restore limited-use abilities
├── Camp events (random encounters possible, story moments)
└── Item management

Town/Safe Haven
├── Full recovery (guaranteed safety)
├── Access to merchants (minor feature)
├── Quest givers
├── Leveling up (chapter completion)
└── Story progression
```

#### Components
```
[ ] Rest Mechanics
    - Short vs long rest rules
    - Resource recovery calculations
    - Rest limitations (once per location?)

[ ] Camp Events
    - Random night encounters
    - Story moments
    - Character development scenes

[ ] Merchant System
    - Buy/sell items
    - Upgrade equipment
    - Special merchant inventories

[ ] Crafting (Optional)
    - Combine items
    - Create potions
    - Upgrade gear
```

---

### 5. Character Progression

#### Core Concept
Meaningful advancement through levels, abilities, and choices

**Level Range:** 1-5 (focused, curated experience)
**Leveling:** Every chapter/act (story-driven progression)
**Multiclassing:** Not allowed (maintain class identity)

#### Power Curve (Levels 1-5)
```
Level 1: Novice adventurer (12 HP, basic attacks)
Level 2: Gaining confidence (18 HP, first signature ability)
Level 3: Competent hero (24 HP, enhanced abilities)
Level 4: Proven warrior (30 HP, powerful techniques)
Level 5: Seasoned hero (36 HP, signature abilities fully unlocked)

Creature Challenge: CR 1/4 to CR 7
```

#### Progression Systems
```
Experience & Leveling
├── Level up each chapter (story-driven)
├── Automatic progression (no XP tracking)
└── Level up bonuses (HP, BAB, saves, new abilities)

Class Features (Key Abilities Only)
├── Fighter: +damage bonuses, combat prowess, enhanced attacks
├── Rogue: Sneak attack, evasion, skill expertise
├── Wizard: Spell progression (spell levels 0-3), arcane knowledge
└── Cleric: Healing, divine magic (spell levels 0-3), undead turning

Equipment (Simple)
├── Weapons: +1/+2/+3 modifiers, basic damage types
├── Armor: Light/Medium/Heavy with simple AC bonuses
├── Accessories: Rings, amulets, belts (limited slots)
└── Consumables: Potions, scrolls

Feats & Skills
├── 10-15 impactful feats (no complex prerequisites)
└── 5-8 core skills (Athletics, Stealth, Perception, Arcana, Medicine, etc.)

Spells & Abilities
├── Spell levels 0-3 (limited range for balance)
├── Spells per day/rest
├── Special abilities/powers
└── Class features
```


---

## 🏗️ Implementation Phases

### Phase 0: Planning & Design
- [x] Initial research
- [x] Finalize design outline
- [ ] Create detailed specifications
- [ ] Define data structures
- [ ] Plan migration strategy

### Phase 1: Core d20 Mechanics (Foundation)
**Goal:** Replace Fighting Fantasy with streamlined d20 combat

```
[ ] New type definitions (attributes, character, creature)
[ ] Dice utilities (d4, d6, d8, d10, d12, d20)
[ ] Attribute modifier calculations
[ ] d20 attack roll vs AC system
[ ] Variable damage rolls
[ ] Saving throws (Fort/Reflex/Will)
[ ] Critical hits
[ ] Basic condition system (4 conditions)
[ ] Class presets (Fighter, Rogue, Wizard, Cleric) with hybrid abilities
[ ] Solo balance adjustments (HP buff, one-on-one combat)
[ ] Update all UI to show new stats
```

**Deliverable:** Game functions with d20 combat (no story yet)

### Phase 2: Narrative Foundation
**Goal:** Add basic story structure and first campaign

```
[ ] Story node system (linear with optional paths)
[ ] Campaign data structure
[ ] "The Spire of the Lich King" campaign implementation
[ ] Story UI components
[ ] Choice selection interface
[ ] Companion system ("The Elder")
[ ] Victory/defeat narrative scenes
[ ] Permadeath handling
```

**Deliverable:** Playable first campaign (1-2 hours) with combat and story

### Phase 3: Exploration & World Map
**Goal:** Add 5-location world with gated progression

```
[ ] Location system (5 locations)
[ ] World map UI
[ ] Gated progression (story unlocks)
[ ] Instant travel mechanics
[ ] Random encounters (mixed with hand-crafted)
[ ] Points of interest
[ ] Location-specific events
```

**Deliverable:** Explorable world with 5 locations

### Phase 4: Rest & Resource Management
**Goal:** Add downtime gameplay loop

```
[ ] Rest mechanics (short/long, generous for solo balance)
[ ] Camp system with random encounters
[ ] Merchant system (minor feature)
[ ] Item management improvements
[ ] Town/safe haven system
[ ] Sanctuary rooms (safe rest points in dungeons)
```

**Deliverable:** Complete gameplay loop (explore → combat → rest → repeat)

### Phase 5: Character Progression
**Goal:** Levels 1-5 advancement system

```
[ ] Story-driven leveling (per chapter, no XP tracking)
[ ] Class features by level (1-5, key abilities only)
[ ] Simplified feat system (10-15 feats)
[ ] Skill system (5-8 core skills)
[ ] Equipment upgrades (simple +1/+2/+3)
[ ] Spell progression (spell levels 0-3)
[ ] No multiclassing
```

**Deliverable:** Full character advancement system (levels 1-5)

### Phase 6: Mobile & Polish
**Goal:** Capacitor deployment and polish

```
[ ] Capacitor integration for iOS/Android
[ ] Mobile UI/UX optimization
[ ] Balance testing (solo play, difficulty curve)
[ ] Additional creatures (CR 1/4 to CR 7)
[ ] More items and spells
[ ] Visual improvements
[ ] Sound effects/music
[ ] Save system enhancements
[ ] Accessibility features
```

**Deliverable:** Complete, polished game on web and mobile platforms

---

## 🎮 Gameplay Loop Comparison

### Current Loop (Simple)
```
1. Select character preset
2. Fight creature
3. Repeat until death
```

### Target Loop (Rich)
```
1. Create/customize character
2. Story introduction
3. Explore location → Random encounter OR Story event OR Rest
4. Combat encounter (tactical d20 combat)
5. Victory → Loot, XP, story continuation
6. Choice: Continue exploring, Rest, Visit town, Pursue quest
7. Rest → Camp events, preparation, story moments
8. Level up → Meaningful progression choices
9. Return to step 3 until campaign complete
```

---

## 📊 Data Structure Overview

### High-Level Architecture
```
Game State
├── Character (player data)
│   ├── Attributes (STR, DEX, CON, INT, WIS, CHA)
│   ├── Derived Stats (HP, AC, BAB, Saves)
│   ├── Class & Level
│   ├── Inventory & Equipment
│   └── Spells & Abilities
├── Campaign Progress
│   ├── Current Location
│   ├── Current Story Node
│   ├── Visited Locations
│   ├── Active Quests
│   └── Completed Quests
├── World State
│   ├── Locations (explored, cleared, available)
│   ├── NPCs (met, alive, quests given)
│   └── Global Flags (events triggered, choices made)
└── Combat State (when in battle)
    ├── Combatants (player, enemies)
    ├── Initiative Order
    ├── Active Effects (buffs, conditions)
    └── Combat Log
```

---

## 🎨 UI/UX Changes Needed

### New Screens
```
[ ] Character Creation Screen
    - Attribute allocation
    - Class selection
    - Appearance customization

[ ] World Map Screen
    - Interactive map
    - Location selection
    - Quest markers

[ ] Story Screen
    - Narrative text display
    - Choice buttons
    - Character portraits

[ ] Rest Screen
    - Camp interface
    - Resource management
    - Merchant access

[ ] Character Sheet (Enhanced)
    - Full attribute display
    - Skills and feats
    - Equipment slots
    - Spell management

[ ] Quest Log
    - Active quests
    - Completed quests
    - Lore entries

[ ] Inventory (Enhanced)
    - Equipment slots
    - Item categories
    - Item details
```

### Updated Screens
```
[ ] Battle Screen
    - Show AC instead of opposed rolls
    - Display d20 rolls clearly
    - Show damage rolls separately
    - Critical hit indicators
    - Saving throw prompts

[ ] Character Stats Panel
    - Six attributes with modifiers
    - Derived stats (AC, BAB, saves)
    - Active effects with durations
    - Class features
```

---

## 🔧 Technical Considerations

### Architecture Approach
**Decision: Start fresh with new architecture**

Key technical decisions:
- Clean break from Fighting Fantasy codebase
- Modern architecture built for d20 mechanics from the ground up
- **Capacitor support** for iOS and Android apps (cross-platform mobile deployment)
- Component-based design for reusability
- TypeScript for type safety

### Backwards Compatibility
```
Decision: Clean break (new version, old saves incompatible)
- No migration of old Fighting Fantasy saves
- Fresh start allows better architecture
- Clear separation between old and new versions
```

### Performance
```
[ ] Story node graph complexity
    - How to handle large branching trees efficiently?
    - Lazy loading of campaign data?

[ ] Save system
    - JSON save files
    - Cloud save support?
    - Auto-save frequency
```

### Content Management
```
[ ] Story authoring tools
    - JSON files or visual editor?
    - How to make content creation easy?

[ ] Modding support
    - Custom campaigns?
    - Community content?
```

---

## ❓ Key Decision Points

### Decision Matrix

| Decision | Options | **DECISION** | Notes |
|----------|---------|-------------|-------|
| **Complexity Level** | A) Full Pathfinder<br>B) Simplified d20<br>C) Hybrid | **B - Streamlined d20** | Core Pathfinder feel but streamlined for single-player browser gameplay |
| **Level Range** | A) 1-20<br>B) 1-10<br>C) 1-5 | **C (1-5)** | Tight, curated experience with faster campaigns (1-2 hours) |
| **Feats & Skills** | A) Full system<br>B) Simplified<br>C) Skip entirely | **B - Simplified** | 10-15 impactful feats, 5-8 core skills (Athletics, Stealth, Perception, etc.) |
| **World Size** | A) 5-10 locations<br>B) 20-30 locations<br>C) 50+ locations | **A (5 locations)** | Start focused with first campaign |
| **Story Structure** | A) Linear with choices<br>B) Branching paths<br>C) Fully open | **A - Linear with optional side paths** | Limited branching to avoid exponential complexity |
| **Campaign Length** | A) 1-2 hours<br>B) 3-5 hours<br>C) 10+ hours | **A (1-2 hours)** | Short, replayable campaigns with different classes |
| **Permadeath** | A) Yes (roguelike)<br>B) No (retry)<br>C) Optional | **A - Yes** | Permadeath for tension and replayability |
| **Survival Mechanics** | A) Full (food, water)<br>B) Light (rest limits)<br>C) None | **C - None initially** | Avoid overcomplication |
| **Story/Combat Balance** | A) 50/50<br>B) 70/30 (story)<br>C) 30/70 (combat) | **A - 50/50** | Equal emphasis on narrative and combat |
| **Multiclassing** | A) Allowed<br>B) Not allowed | **B - Not allowed** | Keep focused on single class identity |
| **Priority Features** | Various | **Character builds > Narrative > Combat** | Design focus order |

---

## 📝 Next Steps

### ✅ Outline Status: FINALIZED

All key decisions have been made. See `DESIGN_SPEC_OUTLINE-QUESTIONS-AND-ANSWERS.md` for decision rationale.

### Ready for Implementation

1. Create detailed specification for Phase 1 (d20 mechanics)
2. Design data structures and type definitions
3. Plan file structure and new architecture approach (with Capacitor)
4. Begin implementation of core d20 combat system

---

## 🎯 Success Criteria

This redesign will be considered successful when:

- [ ] Combat feels tactical and engaging (d20 mechanics with meaningful choices)
- [ ] Story provides context and motivation for battles
- [ ] Players have meaningful choices that affect outcomes
- [ ] Exploration feels rewarding (mix of story and random encounters)
- [ ] Character progression provides sense of growth and power (levels 1-5)
- [ ] Gameplay loop has variety (50/50 combat/story balance + exploration + rest)
- [ ] Campaign duration is 1-2 hours for high replayability
- [ ] Players want to replay with different classes (Fighter/Rogue/Wizard/Cleric)
- [ ] Permadeath creates tension and makes victories feel earned
- [ ] Mobile deployment works smoothly (iOS/Android via Capacitor)
