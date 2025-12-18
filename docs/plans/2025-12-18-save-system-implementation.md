# Save System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement unified save system with Capacitor Preferences, auto-save triggers, and Continue button functionality.

**Architecture:** Create GameSaveManager utility as single source of truth for persistence, replace localStorage with Capacitor Preferences, add auto-save triggers (story nodes, combat, app backgrounding), and wire Continue button to restore game state.

**Tech Stack:** TypeScript, Zustand stores, Capacitor Preferences API, Vitest for testing

---

## Phase 1: Core Save System Infrastructure

### Task 1.1: Create Save Data Types

**Files:**
- Create: `src/types/gameSave.ts`

**Step 1: Create gameSave.ts with type definitions**

```typescript
// src/types/gameSave.ts
import type { Character } from './character';
import type { WorldState, ConversationState } from './narrative';
import type { Screen } from './index';

export interface GameSave {
  version: string;
  timestamp: number;
  character: Character;
  narrative: {
    world: WorldState;
    conversation: ConversationState;
    campaignId: string;
  };
  currentScreen: {
    type: Screen['type'];
  };
  metadata: SaveMetadata;
}

export interface SaveMetadata {
  characterName: string;
  characterLevel: number;
  lastPlayedTimestamp: number;
  playTimeSeconds: number;
}
```

**Step 2: Export from index.ts**

In `src/types/index.ts`, add:
```typescript
export type { GameSave, SaveMetadata } from './gameSave';
```

**Step 3: Verify types compile**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add src/types/gameSave.ts src/types/index.ts
git commit -m "feat: add GameSave and SaveMetadata types"
```

---

### Task 1.2: Create Migration Infrastructure

**Files:**
- Create: `src/utils/gameSaveMigrations.ts`

**Step 1: Write test for migration system**

Create `src/__tests__/utils/gameSaveMigrations.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { migrateToCurrentVersion, CURRENT_VERSION } from '../../utils/gameSaveMigrations';

describe('gameSaveMigrations', () => {
  it('should return save unchanged if version matches current', () => {
    const save = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      character: {} as any,
      narrative: { world: {}, conversation: {}, campaignId: 'test' } as any,
      currentScreen: { type: 'story' as const },
      metadata: {
        characterName: 'Test',
        characterLevel: 1,
        lastPlayedTimestamp: Date.now(),
        playTimeSeconds: 0,
      },
    };

    const result = migrateToCurrentVersion(save);
    expect(result).toEqual(save);
  });

  it('should migrate old version to current', () => {
    const oldSave = {
      version: '0.9.0',
      timestamp: Date.now(),
      character: {} as any,
      narrative: { world: {}, conversation: {}, campaignId: 'test' } as any,
      currentScreen: { type: 'story' as const },
      metadata: {
        characterName: 'Test',
        characterLevel: 1,
        lastPlayedTimestamp: Date.now(),
        // Missing playTimeSeconds field
      },
    };

    const result = migrateToCurrentVersion(oldSave as any);
    expect(result.version).toBe(CURRENT_VERSION);
    expect(result.metadata.playTimeSeconds).toBe(0); // Default value added
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test gameSaveMigrations`
Expected: FAIL - module not found

**Step 3: Implement migration system**

Create `src/utils/gameSaveMigrations.ts`:
```typescript
import type { GameSave } from '../types/gameSave';

export const CURRENT_VERSION = '1.0.0';

type MigrationFunction = (save: any) => any;

const migrations: Record<string, MigrationFunction> = {
  '1.0.0': (save: any): GameSave => {
    // Migration from pre-1.0.0 to 1.0.0
    return {
      ...save,
      version: '1.0.0',
      metadata: {
        ...save.metadata,
        playTimeSeconds: save.metadata?.playTimeSeconds ?? 0,
      },
    };
  },
};

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

export function migrateToCurrentVersion(save: any): GameSave {
  let currentSave = save;
  const versions = Object.keys(migrations).sort(compareVersions);

  for (const version of versions) {
    if (compareVersions(currentSave.version || '0.0.0', version) < 0) {
      console.log(`[Migration] Migrating from ${currentSave.version} to ${version}`);
      currentSave = migrations[version](currentSave);
      currentSave.version = version;
    }
  }

  return currentSave as GameSave;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test gameSaveMigrations`
Expected: PASS - both tests pass

**Step 5: Commit**

```bash
git add src/utils/gameSaveMigrations.ts src/__tests__/utils/gameSaveMigrations.test.ts
git commit -m "feat: add save version migration system"
```

---

### Task 1.3: Create GameSaveManager (Part 1 - Save/Load)

**Files:**
- Create: `src/utils/gameSaveManager.ts`
- Create: `src/__tests__/utils/gameSaveManager.test.ts`

**Step 1: Write test for save operation**

Create `src/__tests__/utils/gameSaveManager.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameSaveManager } from '../../utils/gameSaveManager';
import type { GameSave } from '../../types/gameSave';
import { Preferences } from '@capacitor/preferences';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('GameSaveManager', () => {
  const mockSave: GameSave = {
    version: '1.0.0',
    timestamp: Date.now(),
    character: {
      name: 'TestHero',
      class: 'fighter',
      level: 1,
    } as any,
    narrative: {
      world: { flags: {}, visitedNodes: [] } as any,
      conversation: { currentNodeId: 'start', log: [] } as any,
      campaignId: 'campaign-1',
    },
    currentScreen: { type: 'story' },
    metadata: {
      characterName: 'TestHero',
      characterLevel: 1,
      lastPlayedTimestamp: Date.now(),
      playTimeSeconds: 100,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save game data to Preferences', async () => {
    await GameSaveManager.save(mockSave);

    expect(Preferences.set).toHaveBeenCalledWith({
      key: 'adventurer-rpg:save',
      value: JSON.stringify(mockSave),
    });
  });

  it('should load game data from Preferences', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({
      value: JSON.stringify(mockSave),
    });

    const result = await GameSaveManager.load();

    expect(Preferences.get).toHaveBeenCalledWith({
      key: 'adventurer-rpg:save',
    });
    expect(result).toEqual(mockSave);
  });

  it('should return null if no save exists', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });

    const result = await GameSaveManager.load();

    expect(result).toBeNull();
  });

  it('should return null if save is corrupted', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({
      value: 'invalid json',
    });

    const result = await GameSaveManager.load();

    expect(result).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test gameSaveManager`
Expected: FAIL - module not found

**Step 3: Implement GameSaveManager save/load**

Create `src/utils/gameSaveManager.ts`:
```typescript
import { Preferences } from '@capacitor/preferences';
import type { GameSave, SaveMetadata } from '../types/gameSave';
import { migrateToCurrentVersion, CURRENT_VERSION } from './gameSaveMigrations';

const SAVE_KEY = 'adventurer-rpg:save';

export class GameSaveManager {
  /**
   * Save game data to persistent storage
   */
  static async save(saveData: GameSave): Promise<void> {
    try {
      // Ensure version is current
      const dataToSave = {
        ...saveData,
        version: CURRENT_VERSION,
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(dataToSave);
      await Preferences.set({
        key: SAVE_KEY,
        value: serialized,
      });

      console.log('[GameSave] Save successful');
    } catch (error) {
      console.error('[GameSave] Save failed:', error);
      // Silent failure - don't throw
    }
  }

  /**
   * Load game data from persistent storage
   * Returns null if no save exists or if corrupted
   */
  static async load(): Promise<GameSave | null> {
    try {
      const { value } = await Preferences.get({ key: SAVE_KEY });

      if (!value) {
        return null;
      }

      const save = JSON.parse(value);

      // Run migrations if needed
      const migratedSave = migrateToCurrentVersion(save);

      return migratedSave;
    } catch (error) {
      console.error('[GameSave] Load failed:', error);
      return null; // Treat as no save exists
    }
  }

  /**
   * Check if a save exists without loading full data
   */
  static async hasSave(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: SAVE_KEY });
      return value !== null;
    } catch (error) {
      console.error('[GameSave] hasSave check failed:', error);
      return false;
    }
  }

  /**
   * Delete saved game
   */
  static async deleteSave(): Promise<void> {
    try {
      await Preferences.remove({ key: SAVE_KEY });
      console.log('[GameSave] Save deleted');
    } catch (error) {
      console.error('[GameSave] Delete failed:', error);
    }
  }

  /**
   * Get current version string
   */
  static getCurrentVersion(): string {
    return CURRENT_VERSION;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test gameSaveManager`
Expected: PASS - all tests pass

**Step 5: Commit**

```bash
git add src/utils/gameSaveManager.ts src/__tests__/utils/gameSaveManager.test.ts
git commit -m "feat: add GameSaveManager save/load functionality"
```

---

### Task 1.4: Add Metadata Extraction

**Files:**
- Modify: `src/utils/gameSaveManager.ts`
- Modify: `src/__tests__/utils/gameSaveManager.test.ts`

**Step 1: Write test for metadata extraction**

In `src/__tests__/utils/gameSaveManager.test.ts`, add:
```typescript
it('should extract metadata without loading full save', async () => {
  const mockSave: GameSave = {
    version: '1.0.0',
    timestamp: Date.now(),
    character: { name: 'TestHero', level: 3 } as any,
    narrative: {} as any,
    currentScreen: { type: 'story' },
    metadata: {
      characterName: 'TestHero',
      characterLevel: 3,
      lastPlayedTimestamp: 1234567890,
      playTimeSeconds: 500,
    },
  };

  vi.mocked(Preferences.get).mockResolvedValue({
    value: JSON.stringify(mockSave),
  });

  const metadata = await GameSaveManager.getSaveMetadata();

  expect(metadata).toEqual({
    characterName: 'TestHero',
    characterLevel: 3,
    lastPlayedTimestamp: 1234567890,
    playTimeSeconds: 500,
  });
});

it('should return null metadata if no save exists', async () => {
  vi.mocked(Preferences.get).mockResolvedValue({ value: null });

  const metadata = await GameSaveManager.getSaveMetadata();

  expect(metadata).toBeNull();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test gameSaveManager`
Expected: FAIL - getSaveMetadata not defined

**Step 3: Implement getSaveMetadata**

In `src/utils/gameSaveManager.ts`, add:
```typescript
/**
 * Get save metadata for UI display (fast, doesn't load full save)
 */
static async getSaveMetadata(): Promise<SaveMetadata | null> {
  try {
    const { value } = await Preferences.get({ key: SAVE_KEY });

    if (!value) {
      return null;
    }

    const save = JSON.parse(value) as GameSave;
    return save.metadata;
  } catch (error) {
    console.error('[GameSave] getSaveMetadata failed:', error);
    return null;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test gameSaveManager`
Expected: PASS - all tests pass

**Step 5: Commit**

```bash
git add src/utils/gameSaveManager.ts src/__tests__/utils/gameSaveManager.test.ts
git commit -m "feat: add metadata extraction to GameSaveManager"
```

---

## Phase 2: Auto-Save Integration

### Task 2.1: Add restoreState to narrativeStore

**Files:**
- Modify: `src/stores/narrativeStore.ts`

**Step 1: Add restoreState method**

In `src/stores/narrativeStore.ts`, find the store actions (around line 400+) and add:
```typescript
/**
 * Restore narrative state from saved game
 */
restoreState: (world: WorldState, conversation: ConversationState) => {
  set({ world, conversation });
  console.log('[NarrativeStore] State restored from save');
},
```

**Step 2: Export WorldState and ConversationState types**

In `src/types/narrative.ts`, ensure these types are exported:
```typescript
export type { WorldState, ConversationState };
```

**Step 3: Verify types compile**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/stores/narrativeStore.ts src/types/narrative.ts
git commit -m "feat: add restoreState method to narrativeStore"
```

---

### Task 2.2: Add Auto-Save Trigger to enterNode

**Files:**
- Modify: `src/stores/narrativeStore.ts`

**Step 1: Import GameSaveManager**

At top of `src/stores/narrativeStore.ts`:
```typescript
import { GameSaveManager } from '../utils/gameSaveManager';
import type { GameSave } from '../types/gameSave';
```

**Step 2: Add auto-save to enterNode method**

Find the `enterNode` method (around line 100-150) and add at the end:
```typescript
enterNode: (nodeId: string, character: Character) => {
  // ... existing logic ...

  // Auto-save after entering node
  const { world, conversation, campaign } = get();
  if (world && conversation && campaign && character) {
    const saveData: GameSave = {
      version: GameSaveManager.getCurrentVersion(),
      timestamp: Date.now(),
      character,
      narrative: {
        world,
        conversation,
        campaignId: campaign.id,
      },
      currentScreen: { type: 'story' },
      metadata: {
        characterName: character.name,
        characterLevel: character.level,
        lastPlayedTimestamp: Date.now(),
        playTimeSeconds: 0, // TODO: Implement play time tracking
      },
    };

    GameSaveManager.save(saveData).catch(err => {
      console.error('[NarrativeStore] Auto-save failed:', err);
    });
  }
},
```

**Step 3: Verify it compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Manual test (optional)**

Run: `npm run dev`
- Start a new game, progress through a story node
- Check browser console for "[GameSave] Save successful"

**Step 5: Commit**

```bash
git add src/stores/narrativeStore.ts
git commit -m "feat: add auto-save trigger to story node progression"
```

---

### Task 2.3: Add App Backgrounding Auto-Save

**Files:**
- Modify: `src/App.tsx`

**Step 1: Import Capacitor App plugin and GameSaveManager**

At top of `src/App.tsx`:
```typescript
import { App as CapApp } from '@capacitor/app';
import { GameSaveManager } from './utils/gameSaveManager';
import type { GameSave } from './types/gameSave';
```

**Step 2: Add useEffect for app lifecycle**

Add after the existing useEffect hooks (around line 75):
```typescript
// Auto-save when app goes to background
useEffect(() => {
  const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
    if (!isActive) {
      console.log('[App] App backgrounding, triggering auto-save');

      const character = useCharacterStore.getState().character;
      const narrativeState = useNarrativeStore.getState();

      if (character && narrativeState.campaign) {
        const saveData: GameSave = {
          version: GameSaveManager.getCurrentVersion(),
          timestamp: Date.now(),
          character,
          narrative: {
            world: narrativeState.world!,
            conversation: narrativeState.conversation!,
            campaignId: narrativeState.campaign.id,
          },
          currentScreen: { type: currentScreen.type },
          metadata: {
            characterName: character.name,
            characterLevel: character.level,
            lastPlayedTimestamp: Date.now(),
            playTimeSeconds: 0, // TODO: Implement play time tracking
          },
        };

        GameSaveManager.save(saveData).catch(err => {
          console.error('[App] Background auto-save failed:', err);
        });
      }
    }
  };

  const listener = CapApp.addListener('appStateChange', handleAppStateChange);

  return () => {
    listener.remove();
  };
}, [currentScreen.type]);
```

**Step 3: Verify it compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add auto-save on app backgrounding"
```

---

### Task 2.4: Remove Old Save Methods from Stores

**Files:**
- Modify: `src/stores/characterStore.ts`
- Modify: `src/stores/narrativeStore.ts`

**Step 1: Remove old characterStore save methods**

In `src/stores/characterStore.ts`, remove the `saveCharacter` and `loadCharacter` methods (lines 343-372):
```typescript
// DELETE these methods:
saveCharacter: () => { ... }
loadCharacter: () => { ... }
```

**Step 2: Remove old narrativeStore save methods**

In `src/stores/narrativeStore.ts`, remove the `saveNarrativeState` and `loadNarrativeState` methods (lines 456-503):
```typescript
// DELETE these methods:
saveNarrativeState: () => { ... }
loadNarrativeState: () => { ... }
```

**Step 3: Verify it compiles**

Run: `npm run build`
Expected: Build succeeds (no one was calling these methods)

**Step 4: Commit**

```bash
git add src/stores/characterStore.ts src/stores/narrativeStore.ts
git commit -m "refactor: remove old localStorage save methods"
```

---

## Phase 3: Continue Button Implementation

### Task 3.1: Update MainMenuScreen Props

**Files:**
- Modify: `src/screens/MainMenuScreen.tsx`

**Step 1: Update interface**

In `src/screens/MainMenuScreen.tsx`, update the props interface:
```typescript
import type { SaveMetadata } from '../types/gameSave';

interface MainMenuScreenProps {
  onNewGame: () => void;
  onContinue?: () => void;           // New prop
  continueMetadata?: SaveMetadata;   // New prop
  onTesting: () => void;
}
```

**Step 2: Add Continue button to UI**

Find the button section and add Continue button (before New Game button):
```typescript
export function MainMenuScreen({
  onNewGame,
  onContinue,
  continueMetadata,
  onTesting
}: MainMenuScreenProps) {
  return (
    <div className="screen-container">
      {/* ... existing header ... */}

      <div className="flex flex-col gap-4 w-full max-w-md">
        {/* Continue Button */}
        {continueMetadata ? (
          <button
            onClick={onContinue}
            className="menu-button primary"
          >
            <div className="flex flex-col items-start">
              <span className="heading-tertiary">Continue</span>
              <span className="body-secondary text-sm">
                {continueMetadata.characterName} (Level {continueMetadata.characterLevel})
              </span>
              <span className="body-muted text-xs">
                Last played {formatTimestamp(continueMetadata.lastPlayedTimestamp)}
              </span>
            </div>
          </button>
        ) : (
          <button
            disabled
            className="menu-button disabled"
          >
            Continue
          </button>
        )}

        {/* Existing New Game Button */}
        <button onClick={onNewGame} className="menu-button">
          New Game
        </button>

        {/* ... rest of buttons ... */}
      </div>
    </div>
  );
}

// Helper function for timestamp formatting
function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
```

**Step 3: Verify it compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/screens/MainMenuScreen.tsx
git commit -m "feat: add Continue button to main menu"
```

---

### Task 3.2: Wire Continue Button in App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add state for save metadata**

In `src/App.tsx`, add state after existing state declarations (around line 25):
```typescript
const [saveMetadata, setSaveMetadata] = useState<SaveMetadata | null>(null);
```

Import SaveMetadata:
```typescript
import type { SaveMetadata } from './types/gameSave';
```

**Step 2: Check for save on mount**

Add useEffect to check for save (around line 40):
```typescript
// Check for saved game on mount
useEffect(() => {
  const checkForSave = async () => {
    const metadata = await GameSaveManager.getSaveMetadata();
    setSaveMetadata(metadata);
    console.log('[App] Save metadata loaded:', metadata);
  };

  checkForSave();
}, []);
```

**Step 3: Add Continue handler**

Add handler function (around line 150):
```typescript
const handleContinue = async () => {
  console.log('[App] Continue button clicked, loading save...');

  const save = await GameSaveManager.load();
  if (!save) {
    console.error('[App] Failed to load save');
    return;
  }

  // Restore character
  setCharacter(save.character);

  // Restore narrative
  const { loadCampaign, restoreState } = useNarrativeStore.getState();
  const campaign = availableCampaigns.find(c => c.id === save.narrative.campaignId);

  if (!campaign) {
    console.error('[App] Campaign not found:', save.narrative.campaignId);
    return;
  }

  loadCampaign(campaign);
  restoreState(save.narrative.world, save.narrative.conversation);

  // Navigate to story screen
  setCurrentScreen({ type: 'story' });
  console.log('[App] Save loaded successfully, navigating to story');
};
```

**Step 4: Pass props to MainMenuScreen**

Update MainMenuScreen render (around line 163):
```typescript
{currentScreen.type === 'mainMenu' && (
  <MainMenuScreen
    onNewGame={() => setCurrentScreen({ type: 'home' })}
    onContinue={saveMetadata ? handleContinue : undefined}
    continueMetadata={saveMetadata || undefined}
    onTesting={() => setCurrentScreen({ type: 'testing' })}
  />
)}
```

**Step 5: Verify it compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire Continue button with load functionality"
```

---

## Phase 4: Testing & Verification

### Task 4.1: End-to-End Manual Testing

**Step 1: Test save/continue flow on web**

Run: `npm run dev`

Test steps:
1. Click "New Game"
2. Select a campaign
3. Progress through 2-3 story nodes
4. Check console for "[GameSave] Save successful" messages
5. Refresh the page (simulates app restart)
6. Verify Continue button is enabled and shows character info
7. Click Continue
8. Verify you resume at the correct story node

**Step 2: Test auto-save triggers**

Continue from Step 1:
1. Make a story choice
2. Check console for auto-save
3. Open DevTools → Application → Storage → Preferences (or localStorage if testing on web)
4. Verify "adventurer-rpg:save" key exists with JSON data

**Step 3: Test corrupted save handling**

1. In DevTools → Application → Storage, edit the save value to invalid JSON
2. Refresh page
3. Verify Continue button is disabled (no crash)
4. Check console for "[GameSave] Load failed" message

**Step 4: Document test results**

Expected output:
```
✅ Auto-save triggers after story nodes
✅ Continue button appears when save exists
✅ Continue button shows character name and level
✅ Load restores character, narrative, and screen state
✅ Corrupted save handled gracefully (Continue disabled)
```

**Step 5: Commit test results**

Create `docs/testing/2025-12-18-save-system-manual-tests.md`:
```markdown
# Save System Manual Test Results

Date: 2025-12-18
Tester: [Your Name]

## Test Cases

### 1. Save/Continue Flow
- ✅ Save triggers after story node progression
- ✅ Continue button enabled when save exists
- ✅ Continue loads correct character and narrative state
- ✅ Resume to correct story node

### 2. Auto-Save Triggers
- ✅ Auto-save after entering story node
- ✅ Save data visible in Capacitor Preferences

### 3. Error Handling
- ✅ Corrupted save returns null (no crash)
- ✅ Continue button disabled when no valid save

## Notes
[Any issues or observations]
```

Commit:
```bash
git add docs/testing/2025-12-18-save-system-manual-tests.md
git commit -m "docs: add save system manual test results"
```

---

### Task 4.2: Mobile Testing (iOS/Android)

**Files:**
- None (manual testing)

**Step 1: Build and sync to mobile**

Run:
```bash
npm run build
npx cap sync
```

**Step 2: Test on iOS**

Run:
```bash
npx cap open ios
```

Test steps:
1. Run app on iOS simulator or device
2. Play through story, verify auto-save
3. Force quit app (swipe up in app switcher)
4. Reopen app
5. Verify Continue button works
6. Check Xcode console for save messages

**Step 3: Test app backgrounding**

1. While in-game, press Home button (app backgrounds)
2. Check console for "[App] App backgrounding, triggering auto-save"
3. Reopen app, verify state preserved

**Step 4: Test on Android**

Run:
```bash
npx cap open android
```

Repeat iOS test steps on Android device/emulator.

**Step 5: Document mobile test results**

Add to `docs/testing/2025-12-18-save-system-manual-tests.md`:
```markdown
## Mobile Testing

### iOS
- ✅ Auto-save works on story progression
- ✅ Auto-save triggers on app backgrounding
- ✅ Continue button works after app restart
- ✅ Capacitor Preferences persists across app launches

### Android
- ✅ Auto-save works on story progression
- ✅ Auto-save triggers on app backgrounding
- ✅ Continue button works after app restart
- ✅ Capacitor Preferences persists across app launches
```

**Step 6: Commit**

```bash
git add docs/testing/2025-12-18-save-system-manual-tests.md
git commit -m "docs: add mobile test results for save system"
```

---

## Phase 5: Final Verification & Cleanup

### Task 5.1: Run Full Test Suite

**Step 1: Run all unit tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Run linter**

Run: `npm run lint`
Expected: No lint errors

**Step 4: Commit if any fixes were needed**

```bash
git add .
git commit -m "fix: address test/lint issues"
```

---

### Task 5.2: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add Save System section**

In `CLAUDE.md`, add after the "State Management (Zustand)" section:

```markdown
### Save System (GameSaveManager)

The game uses a unified save system with automatic persistence:

- **`utils/gameSaveManager.ts`** - Single source of truth for save/load operations
- **Storage:** Capacitor Preferences API (works cross-platform: web, iOS, Android)
- **Save Format:** JSON with version number for migration support
- **Auto-save Triggers:**
  - After every story node progression
  - When app goes to background (mobile lifecycle)

**Save Data Structure:**
```typescript
interface GameSave {
  version: string;                    // For migration (e.g., "1.0.0")
  timestamp: number;                  // Last save time
  character: Character;               // Full character state
  narrative: {
    world: WorldState;                // Flags, visited nodes
    conversation: ConversationState;  // Current node, log
    campaignId: string;
  };
  currentScreen: { type: string };    // Resume location
  metadata: SaveMetadata;             // For UI display
}
```

**Usage Pattern:**
```typescript
// Auto-save (fire-and-forget)
GameSaveManager.save(saveData).catch(err => console.error(err));

// Load on app startup
const save = await GameSaveManager.load();
if (save) {
  // Restore character and narrative state
}

// Check for save (for Continue button)
const metadata = await GameSaveManager.getSaveMetadata();
```

**Error Handling:** Silent failures - save errors are logged but don't interrupt gameplay. Load failures return null and disable Continue button.

**Versioning:** Save format uses semantic versioning with migration support. When adding new fields, create migration in `gameSaveMigrations.ts`.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add save system documentation to CLAUDE.md"
```

---

### Task 5.3: Create Final Summary Commit

**Step 1: Verify all changes**

Run: `git status`
Expected: Working directory clean

**Step 2: Review commit history**

Run: `git log --oneline -20`
Expected: See all save system commits

**Step 3: Create summary**

Create `docs/plans/2025-12-18-save-system-completion.md`:
```markdown
# Save System Implementation - Completion Summary

**Date:** 2025-12-18
**Status:** ✅ Complete

## What Was Built

- ✅ GameSaveManager utility with Capacitor Preferences
- ✅ Save versioning and migration system
- ✅ Auto-save triggers (story nodes, app backgrounding)
- ✅ Continue button with metadata display
- ✅ Load flow with state restoration
- ✅ Unit tests for save/load/migration
- ✅ Manual testing on web, iOS, Android

## Files Changed

**New Files:**
- `src/types/gameSave.ts` - Type definitions
- `src/utils/gameSaveManager.ts` - Core save system
- `src/utils/gameSaveMigrations.ts` - Migration infrastructure
- `src/__tests__/utils/gameSaveManager.test.ts` - Unit tests
- `src/__tests__/utils/gameSaveMigrations.test.ts` - Migration tests

**Modified Files:**
- `src/stores/narrativeStore.ts` - Added auto-save and restoreState
- `src/stores/characterStore.ts` - Removed old save methods
- `src/App.tsx` - Added Continue button wiring and app lifecycle
- `src/screens/MainMenuScreen.tsx` - Added Continue button UI
- `CLAUDE.md` - Added save system documentation

**Removed:**
- Old localStorage save methods in stores

## Test Results

### Unit Tests
- ✅ All GameSaveManager tests passing
- ✅ Migration tests passing

### Integration Tests
- ✅ Save/load round-trip works
- ✅ Auto-save triggers correctly
- ✅ Continue button functionality verified

### Mobile Tests
- ✅ iOS: Save persists across app restarts
- ✅ Android: Save persists across app restarts
- ✅ App backgrounding triggers save

## Known Issues / Future Work

- [ ] Play time tracking not implemented (metadata.playTimeSeconds always 0)
- [ ] Could add "Delete Save" option in settings
- [ ] Could add save slots (currently single slot)

## Next Steps

Ready to proceed with **Navigation System Implementation** (Phase 2).
```

**Step 4: Commit**

```bash
git add docs/plans/2025-12-18-save-system-completion.md
git commit -m "docs: add save system completion summary"
```

---

## Success Criteria

- ✅ GameSaveManager created with save/load/metadata methods
- ✅ Capacitor Preferences replaces localStorage
- ✅ Auto-save triggers after story nodes and app backgrounding
- ✅ Continue button shows character name/level/last played
- ✅ Continue loads and restores full game state
- ✅ Version migration system in place
- ✅ Silent error handling (no user-facing errors)
- ✅ Unit tests cover save/load/migration
- ✅ Manual testing on web and mobile platforms
- ✅ Documentation updated in CLAUDE.md

## Reference Skills

- **@superpowers:test-driven-development** - Write tests before implementation
- **@superpowers:verification-before-completion** - Verify tests pass before claiming done
- **@CLAUDE.md** - Project structure and architecture patterns

## Notes for Implementation

- Use **TDD** throughout - write failing test, implement, verify passes
- Commit frequently (after each task or sub-task)
- Run `npm run build` before commits to catch TypeScript errors
- Test on actual mobile devices if possible (not just simulators)
- Keep save operations fire-and-forget (don't block UI)
- Log all save/load operations for debugging
