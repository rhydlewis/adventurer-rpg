# Save System Design

**Date:** 2025-12-18
**Status:** Design Complete, Ready for Implementation

## Overview

Implement a unified save system that persists player progress (character, narrative, screen position) and enables resuming exactly where they left off via a Continue button on the main menu.

## Requirements

1. **Resume to exact screen** - Load and return player to the screen they were on (story screen only is resumable)
2. **Auto-save triggers** - After story nodes, after combat resolution, when app backgrounds
3. **Single auto-save slot** - One save per device, automatically overwrites
4. **Silent error handling** - Save/load failures are logged but don't interrupt gameplay
5. **Version management** - Save format versioning with migration support
6. **Metadata display** - Continue button shows character name, level, last played timestamp

## Architecture

### File Structure

```
src/
├── utils/
│   ├── gameSaveManager.ts          # Core save/load logic
│   └── gameSaveMigrations.ts       # Version migration functions
├── types/
│   └── gameSave.ts                 # Save data structure types
└── stores/
    ├── characterStore.ts           # Updated to use manager
    └── narrativeStore.ts           # Updated to use manager
```

### Data Structure

```typescript
interface GameSave {
  version: string;                   // e.g., "1.0.0"
  timestamp: number;                 // Unix timestamp (ms)

  character: Character;              // Full character state
  narrative: {
    world: WorldState;               // Flags, visited nodes
    conversation: ConversationState; // Current node, log
    campaignId: string;              // Campaign reference
  };

  currentScreen: ScreenState;        // Where to resume

  metadata: {                        // For Continue button display
    characterName: string;
    characterLevel: number;
    playTimeSeconds: number;         // Total play time
  };
}

interface ScreenState {
  type: 'story' | 'home' | 'mainMenu' | 'characterSheet' | etc.;
  // Other screens save but resume to 'story'
}
```

**Key principle:** Save is atomic - all data saves together or none at all. This prevents character/narrative desync.

## GameSaveManager API

### Public Interface

```typescript
class GameSaveManager {
  // Core operations
  static async save(saveData: GameSave): Promise<void>
  static async load(): Promise<GameSave | null>
  static async hasSave(): Promise<boolean>
  static async deleteSave(): Promise<void>

  // Metadata for UI (fast, doesn't load full save)
  static async getSaveMetadata(): Promise<SaveMetadata | null>

  // Versioning
  static getCurrentVersion(): string  // Returns "1.0.0"
  private static async migrate(save: GameSave): Promise<GameSave>
}

interface SaveMetadata {
  characterName: string;
  characterLevel: number;
  lastPlayedTimestamp: number;
  playTimeSeconds: number;
}
```

### Key Behaviors

**Save operation:**
1. Validate data structure (ensure required fields exist)
2. Add current version and timestamp
3. Serialize to JSON
4. Write to Capacitor Preferences under key `"adventurer-rpg:save"`
5. Silent failure (log error, don't throw)

**Load operation:**
1. Read from Capacitor Preferences
2. Parse JSON
3. Check version - if old, run migrations
4. Return save data or null if missing/corrupted
5. Silent failure on corruption (return null)

**Storage:** Uses `@capacitor/preferences` instead of localStorage for better mobile support (handles app backgrounding, storage limits, works cross-platform).

## Auto-Save Triggers

### 1. After Story Node Progression

```typescript
// In narrativeStore.ts - enterNode() method
enterNode: (nodeId: string, character: Character) => {
  // ... existing logic to enter node ...

  // After state update, trigger auto-save
  GameSaveManager.save({
    character,
    narrative: { world, conversation, campaignId },
    currentScreen: { type: 'story' },
    // ... metadata
  });
}
```

### 2. After Combat Resolution

Combat saves are handled by the story node trigger since combat always transitions to a story node after victory/defeat. No additional save needed in combat handlers.

### 3. App Backgrounding (Capacitor Lifecycle)

```typescript
// In App.tsx - add useEffect for Capacitor lifecycle
import { App as CapApp } from '@capacitor/app';

useEffect(() => {
  const handler = CapApp.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      // App going to background - save current state
      const character = useCharacterStore.getState().character;
      const narrative = useNarrativeStore.getState();

      if (character && narrative.campaign) {
        GameSaveManager.save({ /* current state */ });
      }
    }
  });

  return () => handler.remove();
}, []);
```

All triggers are **fire-and-forget** - they don't wait for save to complete or check for errors (silent fallback).

## Continue Button & Load Flow

### Main Menu Changes

**MainMenuScreen.tsx:**
```typescript
interface MainMenuScreenProps {
  onNewGame: () => void;
  onContinue?: () => void;           // New prop
  continueMetadata?: SaveMetadata;   // New prop for display
  onTesting: () => void;
}

// Button display:
{continueMetadata ? (
  <button onClick={onContinue}>
    Continue: {continueMetadata.characterName} (Level {continueMetadata.level})
    <span className="text-sm">Last played {formatTimestamp(continueMetadata.lastPlayedTimestamp)}</span>
  </button>
) : (
  <button disabled>Continue</button>
)}
```

### Load Flow

**App.tsx:**
```typescript
// On mount, check for saved game
useEffect(() => {
  const checkSave = async () => {
    const metadata = await GameSaveManager.getSaveMetadata();
    setSaveMetadata(metadata);
  };
  checkSave();
}, []);

// Continue handler
const handleContinue = async () => {
  const save = await GameSaveManager.load();
  if (!save) return; // Silent failure

  // Restore character
  useCharacterStore.getState().setCharacter(save.character);

  // Restore narrative
  const { loadCampaign, restoreState } = useNarrativeStore.getState();
  const campaign = availableCampaigns.find(c => c.id === save.narrative.campaignId);
  if (campaign) {
    loadCampaign(campaign);
    restoreState(save.narrative.world, save.narrative.conversation);
  }

  // Navigate to saved screen (story only)
  setCurrentScreen({ type: 'story' });
};
```

The load is all-or-nothing - if any step fails, we don't partially restore state.

## Versioning & Migration

### Version Management

**Current version:** `"1.0.0"` (semantic versioning)

```typescript
// In gameSaveManager.ts
const CURRENT_VERSION = "1.0.0";

static getCurrentVersion(): string {
  return CURRENT_VERSION;
}
```

**Version bumping rules:**
- **Patch (1.0.X):** Bug fixes, no data structure changes → no migration needed
- **Minor (1.X.0):** New fields added with defaults → simple migration
- **Major (X.0.0):** Breaking changes to existing fields → complex migration

### Migration System

```typescript
// gameSaveMigrations.ts
type MigrationFunction = (save: any) => any;

const migrations: Record<string, MigrationFunction> = {
  "1.0.0": (save) => save, // No migration for current version

  // Future example:
  // "1.1.0": (save) => ({
  //   ...save,
  //   metadata: {
  //     ...save.metadata,
  //     playTimeSeconds: 0, // Add new field with default
  //   }
  // }),
};

export function migrateToCurrentVersion(save: GameSave): GameSave {
  let currentSave = save;
  const versions = Object.keys(migrations).sort(); // Semantic sort

  for (const version of versions) {
    if (compareVersions(currentSave.version, version) < 0) {
      currentSave = migrations[version](currentSave);
      currentSave.version = version;
    }
  }

  return currentSave;
}
```

Migrations run automatically on load. Each migration is a pure function that transforms the save data.

## Error Handling

### Save Failures (Silent)

```typescript
static async save(saveData: GameSave): Promise<void> {
  try {
    const serialized = JSON.stringify(saveData);
    await Preferences.set({
      key: 'adventurer-rpg:save',
      value: serialized,
    });
    console.log('[GameSave] Save successful');
  } catch (error) {
    console.error('[GameSave] Save failed:', error);
    // Don't throw - silent failure
    // Game continues, will retry on next auto-save trigger
  }
}
```

### Load Failures (Return Null)

```typescript
static async load(): Promise<GameSave | null> {
  try {
    const { value } = await Preferences.get({ key: 'adventurer-rpg:save' });
    if (!value) return null;

    const save = JSON.parse(value) as GameSave;
    return migrateToCurrentVersion(save);
  } catch (error) {
    console.error('[GameSave] Load failed:', error);
    return null; // Treat as no save exists
  }
}
```

**Philosophy:** No user-facing error messages. Failed saves retry on next trigger. Failed loads just hide the Continue button.

## Testing Strategy

### Unit Tests

**GameSaveManager:**
- Save/load round-trip
- Migration from v1.0.0 → v1.1.0 (when we add next version)
- Corrupted save returns null
- Missing save returns null
- Metadata extraction without full load

### Integration Tests

- Save after story node → load → verify character/narrative restored
- App backgrounding triggers save
- Continue button appears/disappears based on save existence
- Version migration preserves all data

### Manual Testing

- Play through story → quit → reopen → Continue works
- Force-quit during combat → Continue resumes at story
- Save on web → load on iOS (Capacitor Preferences cross-platform)
- Corrupt save file → Continue button disabled, no crash

## Store Updates Required

### characterStore.ts

**Remove:** Existing `saveCharacter()` and `loadCharacter()` methods (lines 343-372)

**Add:** Method to get current character for save operations (if not already exposed)

### narrativeStore.ts

**Remove:** Existing `saveNarrativeState()` and `loadNarrativeState()` methods (lines 456-503)

**Add:** `restoreState(world: WorldState, conversation: ConversationState)` method for loading

## Implementation Phases

### Phase 1: Core Save System
1. Create `types/gameSave.ts` with interfaces
2. Create `utils/gameSaveManager.ts` with save/load/metadata methods
3. Create `utils/gameSaveMigrations.ts` with migration infrastructure
4. Write unit tests for GameSaveManager

### Phase 2: Auto-Save Integration
1. Update `narrativeStore.enterNode()` to trigger auto-save
2. Add Capacitor lifecycle listener in `App.tsx` for backgrounding saves
3. Remove old localStorage save methods from stores

### Phase 3: Continue Button
1. Update `MainMenuScreen.tsx` with Continue button and metadata display
2. Add load flow to `App.tsx` (check for save on mount, handle Continue)
3. Update `narrativeStore` with `restoreState()` method

### Phase 4: Testing & Polish
1. Integration testing (save/load flows)
2. Manual testing on web and mobile
3. Performance testing (ensure saves don't block UI)

## Success Criteria

- ✅ Player can quit app mid-story and resume exactly where they left off
- ✅ Continue button shows character name and level
- ✅ Auto-saves work after story nodes, combat, and app backgrounding
- ✅ No user-facing errors on save/load failures
- ✅ Save format supports versioning and migration
- ✅ Works on web, iOS, and Android
