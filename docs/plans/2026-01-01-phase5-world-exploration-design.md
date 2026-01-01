# Phase 5: World & Exploration System - Design Document

**Created**: 2026-01-01
**Status**: Validated and ready for implementation
**Scope**: Add overworld navigation, location-based gameplay, and exploration system

---

## Overview

Transform the game from a purely story-driven narrative into a world-exploration RPG with a separate overworld layer. Players will navigate between 7 distinct locations via a world map, with each location offering context-sensitive options based on its type (town/wilderness/dungeon).

**Key Features**:
- Overworld world map with clickable locations
- Location hubs with context-sensitive menus
- Gated progression (story unlocks new locations)
- Location-specific encounter tables for exploration
- Sanctuary system for safe rest points in dungeons
- Hybrid story/exploration gameplay loop

**Deferred to Future**:
- Points of Interest (POIs) - Phase 5.5
- Encounter scaling by player level
- Travel time/distance mechanics
- Advanced map visuals (fog of war, animated travel)

---

## Section 1: Architecture Overview

**Core Concept**: Separate overworld layer that sits above the existing story node system. The world map becomes a new navigation hub, with locations serving as containers for story content, exploration, and services.

**Player Flow**:
```
World Map Screen
  ↓ (click location)
Location Hub Screen (context-sensitive)
  ↓ (choose action: story/explore/rest/shop)
Story/Combat/Exploration/Rest Screen
  ↓ (complete action)
Location Hub Screen
  ↓ (choose "Leave location")
World Map Screen
```

**Key Architectural Changes**:

1. **New Screen**: `WorldMapScreen` - shows unlocked locations, travel between them
2. **New Screen**: `LocationHubScreen` - context-sensitive menu for current location
3. **Enhanced Types**: Location type gets `locationType`, `hasMerchant`, `sanctuaryUnlocked` fields
4. **New State**: World state tracks `unlockedLocations: string[]` and `currentLocation: string | null`
5. **New Effects**: `unlockLocation` and `unlockSanctuary` node effects

**Integration with Existing Systems**: Story nodes remain unchanged. Campaigns define first-visit story nodes per location. The hub-centric flow ensures story content always leads back to hub, which leads to world map.

---

## Section 2: Data Structures

**Enhanced Location Type** (`types/narrative.ts`):
```typescript
export type LocationType = 'town' | 'wilderness' | 'dungeon';

export interface Location {
  id: string;
  name: string;
  image: string;
  description?: string;

  // NEW Phase 5 fields
  locationType: LocationType;
  hasMerchant?: boolean;

  // Story integration
  firstVisitNodeId?: string;  // Story node for first arrival
  hubNodeId?: string;          // Optional custom hub node

  // Exploration
  explorationTableId?: string; // Link to encounter table
}
```

**Enhanced WorldState** (`types/narrative.ts`):
```typescript
export interface WorldState {
  campaignId: string;
  currentActId: string;
  currentNodeId: string;
  flags: Record<string, boolean>;
  visitedNodeIds: string[];
  inventory: string[];

  // NEW Phase 5 fields
  currentLocationId: string | null;      // Where player is now
  unlockedLocations: string[];           // Available locations
  visitedLocations: string[];            // Track first visits
  unlockedSanctuaries: string[];         // Dungeon safe rest points
}
```

**New Node Effects** (`types/narrative.ts`):
```typescript
export type NodeEffect =
  | { type: 'unlockLocation'; locationId: string }
  | { type: 'unlockSanctuary'; locationId: string }
  | /* ...existing effects */;
```

**New Choice Outcome** (`types/narrative.ts`):
```typescript
export type ChoiceOutcome =
  | { type: 'exitToHub' }  // Return to current location hub
  | /* ...existing outcomes */;
```

---

## Section 3: Location Hub Screen

**LocationHubScreen** - The central navigation point for each location.

**Hub Behavior**:
- **First Visit**: If location not in `visitedLocations`, immediately navigate to `firstVisitNodeId` story node (skip hub menu)
- **Return Visits**: Show context-sensitive menu based on location type
- **After Story**: All story nodes with `exitToHub` outcome return here

**Context-Sensitive Options**:

**Town Locations** (Ashford, Oakhaven):
- "Continue your journey" → Resume story if `hubNodeId` or story content available
- "Visit the market" → Merchant screen (if `hasMerchant: true`)
- "Rest at the inn" → Safe rest (guaranteed, no camp events)
- "Leave town" → Return to world map

**Wilderness Locations** (Blackwood Forest, Tower Approach):
- "Continue exploring" → Resume story if available
- "Search the area" → Exploration screen (roll on encounter table)
- "Make camp" → Long rest with camp events
- "Leave area" → Return to world map

**Dungeon Locations** (Tower Interior, Catacombs, Void Sanctum):
- "Venture deeper" → Resume story if available
- "Search for treasure" → Exploration screen (roll on encounter table)
- "Rest at sanctuary" → Safe rest (only if `locationId` in `unlockedSanctuaries`)
- "Leave dungeon" → Return to world map

**Visual Design**: Simple list of buttons with icons, location image as background, location description at top.

---

## Section 4: World Map Screen

**WorldMapScreen** - The overworld navigation interface.

**Visual Layout**:
- **Background**: World map image showing the campaign region
- **Location Markers**: 7 clickable location markers positioned on the map
- **Current Location**: Highlighted marker showing where player is now
- **Locked Locations**: Grayed out, unclickable, with lock icon
- **Unlocked Locations**: Full color, clickable, show location name on hover
- **Travel Lines**: Optional visual connections between locations showing travel paths

**Initial State** (Campaign Start):
- Only starting location unlocked (typically Ashford for Campaign 1)
- Player starts at that location
- All other locations locked and grayed

**Interaction**:
1. Click unlocked location → Travel confirmation dialog: "Travel to [Location Name]?"
2. Confirm → Navigate to LocationHubScreen for that location
3. Set `currentLocationId` in world state
4. If first visit (`!visitedLocations.includes(locationId)`), auto-enter `firstVisitNodeId` story node

**When Shown**:
- After character creation
- When player selects "Leave location" from any hub
- Via navigation menu (if we add one)

**Campaign Integration**:
- Campaign defines initial unlocked locations: `unlockedLocations: ['ashford']`
- Story nodes unlock new locations via `{ type: 'unlockLocation', locationId: 'oakhaven' }` effects

---

## Section 5: Campaign Integration & Story Flow

**Campaign Definition Updates**:

Campaigns now define world locations alongside acts:

```typescript
interface Campaign {
  id: string;
  title: string;
  description: string;
  companionName: string;
  companionDescription: string;

  // NEW: World map configuration
  locations: Location[];           // All locations in campaign
  startingLocationId: string;      // Where player begins
  initialUnlockedLocations: string[]; // Available at start

  acts: Act[];
}
```

**Story Flow Integration**:

1. **Campaign Start**:
   - Player enters world map
   - Only `initialUnlockedLocations` available
   - Auto-travel to `startingLocationId`
   - Triggers first-visit story node

2. **Story Progression**:
   - Story nodes use `{ type: 'exitToHub' }` to return to location hub
   - Story nodes use `{ type: 'unlockLocation', locationId: 'X' }` to open new areas
   - Hub always available between story sequences

3. **Location-Based Story**:
   - Each location's `firstVisitNodeId` introduces that area
   - Subsequent story in that location accessed via hub "Continue" option
   - Acts can span multiple locations or focus on one

**Example Flow** (Campaign 1 opening):
1. Start → World map (only Ashford unlocked)
2. Auto-travel to Ashford → First visit story (tutorial)
3. Complete tutorial → Exit to Ashford hub
4. Hub → "Continue journey" → Story unlocks Blackwood Forest
5. Exit to hub → "Leave town" → World map (now Ashford + Blackwood available)
6. Travel to Blackwood Forest → First visit story (forest encounter)

---

## Section 6: Encounter Tables & Exploration

**Linking Encounter Tables to Locations**:

Each wilderness/dungeon location defines an `explorationTableId`:

```typescript
{
  id: 'blackwood-forest',
  name: 'Blackwood Forest',
  locationType: 'wilderness',
  explorationTableId: 'blackwood-encounters',
  // ...
}
```

**Exploration Flow**:
1. Player at location hub (wilderness/dungeon)
2. Click "Search the area" / "Search for treasure"
3. Navigate to ExplorationScreen
4. Roll on location's encounter table
5. Show outcome (combat/treasure/vignette/nothing)
6. If combat → Navigate to CombatScreen
7. After resolution → Return to location hub

**Encounter Tables for Campaign 1** (7 tables needed):

1. **blackwood-forest**: Wolves, bandits, corrupted wildlife (Acts 0-1)
2. **tower-approach**: Skeletons, animated armor, corrupted guards (Act 1-2)
3. **tower-interior**: Skeletons, wraiths, magic-using undead (Act 2)
4. **catacombs**: Ghouls, wraiths, spectral enemies (Act 3)
5. **void-sanctum**: High-level undead, void creatures (Act 4)

**Note**: Towns (Ashford, Oakhaven) have no encounter tables - no exploration option in hub.

**Encounter Scaling**: For now, tables are static per location. Future enhancement could check player level and adjust encounter CR.

**Reusable Encounters**: Players can explore multiple times - encounters regenerate. Balances risk/reward (grind for loot vs move on).

---

## Section 7: Sanctuary Mechanics

**Sanctuary System** - Safe rest points discovered within dangerous dungeons.

**How Sanctuaries Work**:

1. **Initial State**: Dungeons have no rest option in hub menu
2. **Discovery**: Story nodes in dungeons can unlock sanctuaries:
   ```typescript
   onEnter: [
     { type: 'unlockSanctuary', locationId: 'tower-interior' }
   ]
   ```
3. **After Unlock**: "Rest at sanctuary" appears in dungeon hub menu
4. **Rest Type**: Safe rest (like towns) - 100% HP/mana, no camp events, guaranteed safety

**Campaign 1 Sanctuaries**:
- **Tower Interior**: Sanctuary unlocked after clearing Level 1 (Foyer of Dust)
- **Catacombs**: Sanctuary unlocked after finding hidden chamber
- **Void Sanctum**: No sanctuary (final gauntlet area)

**Narrative Integration**:
- Story nodes describe finding the sanctuary: *"You discover a small chapel, its holy wards still intact. The air here feels safe, protected from the tower's corruption."*
- Sanctuary unlock provides natural story checkpoint
- Encourages thorough exploration (reward for progressing)

**Technical Implementation**:
- `unlockedSanctuaries: string[]` in WorldState
- Hub checks `unlockedSanctuaries.includes(currentLocationId)` to show rest option
- `processNodeEffects()` handles `unlockSanctuary` effect

**Player Experience**: Dungeons feel dangerous initially, then safer after finding sanctuary. Creates satisfying progression and safe checkpoint for long dungeon crawls.

---

## Section 8: Error Handling & Testing

**Edge Cases to Handle**:

1. **Invalid Location Travel**:
   - Attempting to travel to locked location → Show error message, prevent navigation
   - Attempting to travel to non-existent location → Log error, don't crash

2. **Missing Story Nodes**:
   - Location missing `firstVisitNodeId` → Skip to hub immediately (treat as "visited")
   - Location missing encounter table but has exploration → Show "Nothing here" message

3. **Story Node Exits**:
   - Story node uses `exitToHub` but not in a location → Exit to world map instead
   - Current location becomes null → Default to world map screen

4. **Save/Load**:
   - Loading save with old world state (no location fields) → Migrate to new format
   - Loading save with invalid `currentLocationId` → Reset to world map

**Testing Strategy**:

**Unit Tests** (`utils/` functions):
- `unlockLocation()` - adds location to unlocked list
- `unlockSanctuary()` - adds sanctuary to unlocked list
- `canTravelToLocation()` - checks unlock status
- `getLocationHubOptions()` - returns correct options per type

**Integration Tests**:
- First visit → story node flow
- Return visit → hub menu flow
- Unlock location via story effect
- Unlock sanctuary in dungeon
- Hub navigation to exploration/rest/merchant
- Exit to hub → exit to world map flow

**Manual Testing Checklist**:
- [ ] Travel between all 7 locations
- [ ] First visit triggers story for each location
- [ ] Return visits show hub for each location
- [ ] Town hubs show merchant/rest options
- [ ] Wilderness hubs show explore/camp options
- [ ] Dungeon hubs show explore only (initially)
- [ ] Sanctuary unlocks and allows rest in dungeons
- [ ] Save/load preserves location state

---

## Section 9: Implementation Overview

**New Files to Create**:

**Types & Data**:
- Modify `types/narrative.ts` - Add LocationType, enhance Location & WorldState
- Modify `data/locations.ts` - Add location type and configuration fields
- Create `data/encounterTables/` directory - One table per location

**Screens**:
- Create `screens/WorldMapScreen.tsx` - Overworld navigation
- Create `screens/LocationHubScreen.tsx` - Context-sensitive hub menu

**Utilities**:
- Create `utils/worldMap.ts` - Location unlock/travel logic
- Modify `utils/narrativeLogic.ts` - Add `exitToHub` outcome, new effects

**Stores**:
- Modify `stores/narrativeStore.ts` - Add location state management

**Files to Modify**:

- `App.tsx` - Add world map and location hub to screen routing
- `stores/narrativeStore.ts` - Track current location, unlocked locations
- `utils/gameSaveManager.ts` - Handle location state in saves
- Campaign files - Add location definitions and unlock effects

**Implementation Order**:

1. **Foundation**: Types, data structures, utilities
2. **World Map**: Screen and navigation
3. **Location Hub**: Screen and context-sensitive menus
4. **Story Integration**: exitToHub outcome, unlock effects
5. **Encounter Tables**: Create 7 tables for Campaign 1
6. **Sanctuary System**: Unlock mechanics and dungeon rest
7. **Campaign Updates**: Add locations and unlock effects to Campaign 1
8. **Testing**: Unit tests, integration tests, manual testing

**Deferred for Future**:
- POIs (Phase 5.5)
- Encounter scaling by level
- Travel time/distance mechanics
- Visual map improvements (animated travel, fog of war)

---

## Campaign 1: Location Mapping

**The Spire of the Lich King** - 7 Locations:

1. **Ashford** (Town)
   - Type: Town
   - Merchant: Yes
   - First Visit: Tutorial/character creation
   - Acts: 0

2. **Blackwood Forest** (Wilderness)
   - Type: Wilderness
   - Exploration: Yes (wolves, bandits, corrupted wildlife)
   - Acts: 0-1

3. **Oakhaven** (Town)
   - Type: Town
   - Merchant: Yes
   - First Visit: Magistrate quest hook
   - Acts: 1

4. **Tower Approach** (Wilderness)
   - Type: Wilderness
   - Exploration: Yes (skeletons, animated armor)
   - Acts: 1-2

5. **Tower Interior** (Dungeon)
   - Type: Dungeon
   - Exploration: Yes (skeletons, wraiths, magic undead)
   - Sanctuary: Unlocked after Foyer of Dust
   - Acts: 2

6. **Catacombs** (Dungeon)
   - Type: Dungeon
   - Exploration: Yes (ghouls, wraiths, spectral enemies)
   - Sanctuary: Unlocked after finding hidden chamber
   - Acts: 3

7. **Void Sanctum** (Dungeon)
   - Type: Dungeon
   - Exploration: Yes (high-level undead, void creatures)
   - Sanctuary: No (final gauntlet)
   - Acts: 4

**Unlock Progression**:
- Start: Ashford only
- Act 0 complete: +Blackwood Forest
- Reach Oakhaven: +Oakhaven
- Accept tower quest: +Tower Approach
- Enter tower: +Tower Interior
- Descend stairs: +Catacombs
- Complete ritual: +Void Sanctum

---

## Success Criteria

Phase 5 is complete when:

- [ ] World map screen shows all 7 locations (locked/unlocked correctly)
- [ ] Players can travel between unlocked locations
- [ ] First visit to location triggers story node
- [ ] Return visits show context-sensitive hub menu
- [ ] Town hubs offer: story, merchant, rest, leave
- [ ] Wilderness hubs offer: story, explore, camp, leave
- [ ] Dungeon hubs offer: story, explore, (sanctuary if unlocked), leave
- [ ] Story nodes can unlock new locations via effects
- [ ] Story nodes can unlock sanctuaries in dungeons
- [ ] 5 encounter tables created for explorable locations
- [ ] Exploration from hub works correctly
- [ ] Save/load preserves location state
- [ ] All tests pass

---

## Next Steps

1. Review and validate this design
2. Create implementation plan using `superpowers:writing-plans`
3. Set up git worktree for Phase 5 development
4. Begin implementation following the plan
