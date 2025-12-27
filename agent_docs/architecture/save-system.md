# Save System Architecture

The save system provides cross-platform game persistence using Capacitor Preferences (localStorage on web, native storage on iOS/Android).

## Architecture Flow

```
GameSaveManager (utils/gameSaveManager.ts)
  ↓
Capacitor Preferences API
  ↓
Storage: adventurer-rpg:save (JSON)
```

## Key Files

- **`types/gameSave.ts`** - Save data structure and metadata types
- **`utils/gameSaveManager.ts`** - Single source of truth for save/load operations
- **`utils/gameSaveMigrations.ts`** - Version migration system for backwards compatibility

## Save Data Structure

Reference `types/gameSave.ts` for the authoritative structure. Key components:

- `version` - Semantic versioning (e.g., "1.0.0")
- `timestamp` - Last save time (ms since epoch)
- `character` - Full character state
- `narrative` - World state, conversation state, campaign ID
- `currentScreen` - Where to resume
- `metadata` - Lightweight info for UI display

## Auto-Save Triggers

1. **Story Node Progression** - Saves after entering each story node (`narrativeStore.enterNode()`)
2. **App Backgrounding** - Saves when app goes to background (Capacitor App plugin listener in `App.tsx`)

Both triggers are **fire-and-forget** (non-blocking async) to avoid UI freezes.

## Usage Pattern

```typescript
// Save game
const saveData: GameSave = { /* ... */ };
await GameSaveManager.save(saveData);

// Load full save
const save = await GameSaveManager.load(); // Returns GameSave | null

// Load just metadata (fast, for UI display)
const metadata = await GameSaveManager.getSaveMetadata(); // Returns SaveMetadata | null

// Get current version
const version = GameSaveManager.getCurrentVersion(); // Returns "1.0.0"
```

## Version Migration

Save data includes a semantic version number. When loading, `GameSaveManager.load()` automatically applies migrations to bring old saves up to the current version.

Reference `utils/gameSaveMigrations.ts` for existing migration examples and patterns.

## Best Practices

1. **Always use GameSaveManager** - Never access Capacitor Preferences directly
2. **Test migrations thoroughly** - Old saves must work with new code
3. **Keep metadata lightweight** - It's loaded for UI display before full saves
4. **Handle missing saves gracefully** - Both methods return `null` when no save exists
