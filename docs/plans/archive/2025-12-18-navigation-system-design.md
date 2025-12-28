# Navigation System Design

**Date:** 2025-12-18
**Status:** Design Complete, Ready for Implementation

## Overview

Implement back navigation for non-narrative screens (character creation, campaign selection, etc.) to allow players to cancel or return to previous screens. Includes support for Android hardware back button.

## Requirements

1. **Conservative back navigation** - Only add back buttons where players might want to cancel/return
2. **Extend previousScreen pattern** - Build on existing App.tsx navigation without full stack
3. **Context-aware CharacterSheet** - Preserve existing behavior (returns to Story when opened from Story)
4. **No confirmation dialogs** - Back navigation is immediate
5. **Android hardware back button** - Wire to same behavior as UI back buttons
6. **Disabled back on critical screens** - Combat, LevelUp must complete (no back)

## Navigation Architecture

### Core State (Already Exists)

```typescript
// App.tsx
const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'splash' });
const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
```

### Helper Functions (To Add)

```typescript
// Navigate forward, saving context for back
const navigateWithBack = (newScreen: Screen) => {
  setPreviousScreen(currentScreen);
  setCurrentScreen(newScreen);
};

// Navigate back to previous screen
const navigateBack = () => {
  if (previousScreen) {
    setCurrentScreen(previousScreen);
    setPreviousScreen(null);
  } else {
    // Fallback: go to home if no previous screen
    setCurrentScreen({ type: 'home' });
  }
};

// Navigate forward without back context (one-way navigation)
const navigateHome = () => {
  setPreviousScreen(null);
  setCurrentScreen({ type: 'home' });
};
```

## Screen-by-Screen Back Behavior

### Screens WITH Back Button

| Screen | Back Destination | Notes |
|--------|-----------------|-------|
| Character Creation | Home | No confirmation, loses progress |
| Choose Campaign | Home | Cancel campaign selection |
| Character Sheet | Previous screen | Context-aware (Story, Combat, Testing, or Home) |
| World Map | Story | Return to narrative |

### Screens WITHOUT Back Button

| Screen | Reason | User Action |
|--------|--------|------------|
| Story | Has Exit button to Home | Use Exit button |
| Combat | Must complete | Victory/Defeat only |
| Merchant | Has Close button | Use Close button |
| LevelUp | Must complete | Choose options then Complete |
| LockPicking | Has Exit button | Use Exit button |
| Exploration | Has onComplete | Complete encounter |
| Splash | Auto-transitions | N/A |
| Main Menu | Top-level | N/A |
| Testing | Debug screen | Use navigation buttons |

## UI Implementation

### BackButton Component

Create a reusable component for consistency:

```typescript
// src/components/BackButton.tsx
interface BackButtonProps {
  onBack: () => void;
  label?: string;  // Optional custom label, defaults to "Back"
}

export function BackButton({ onBack, label = "Back" }: BackButtonProps) {
  return (
    <button
      onClick={onBack}
      className="button-text /* existing button styles */"
      aria-label="Go back"
    >
      ← {label}
    </button>
  );
}
```

### Screen Updates

**CharacterCreationScreen.tsx:**
```typescript
interface CharacterCreationScreenProps {
  onBack?: () => void;  // New prop
}

// In render (top-left corner):
{onBack && <BackButton onBack={onBack} />}
```

**ChooseCampaignScreen.tsx:**
```typescript
// Already has onBack prop (App.tsx:178)
// Add BackButton component to UI
<BackButton onBack={onBack} />
```

**CharacterSheetScreen.tsx:**
```typescript
// Already has onClose (App.tsx:216)
// Add BackButton component (onClose already works as back)
<BackButton onBack={onClose} label="Back" />
```

**WorldMapScreen.tsx:**
```typescript
// Already has onReturnToStory (App.tsx:228)
// Add BackButton component
<BackButton onBack={onReturnToStory} label="Back to Story" />
```

**Positioning:** All back buttons in top-left corner of screen for consistency.

## App.tsx Navigation Wiring

### Updated Navigation Handlers

```typescript
// Character Creation
const handleCreateCharacter = () => {
  navigateWithBack({ type: 'characterCreation' });
};

const handleCancelCreation = () => {
  navigateHome();  // Back from character creation → Home
};

// Choose Campaign
const handleStartStory = () => {
  navigateWithBack({ type: 'chooseCampaign' });
};

// Character Sheet (preserve existing context behavior)
const handleViewSheet = () => {
  navigateWithBack({ type: 'characterSheet' });
};

const handleCloseSheet = () => {
  navigateBack();  // Returns to previous screen (Story, Combat, etc.)
};

// World Map
const handleViewMap = () => {
  navigateWithBack({ type: 'worldMap' });
};
```

### Prop Updates

```typescript
// Pass onBack props to screens
{currentScreen.type === 'characterCreation' && (
  <CharacterCreationScreen onBack={handleCancelCreation} />
)}

{currentScreen.type === 'chooseCampaign' && (
  <ChooseCampaignScreen
    campaigns={availableCampaigns}
    onSelectCampaign={handleSelectCampaign}
    onBack={navigateHome}
  />
)}

{currentScreen.type === 'characterSheet' && (
  <CharacterSheetScreen
    character={character}
    onClose={handleCloseSheet}  // Already works as back
  />
)}

{currentScreen.type === 'worldMap' && (
  <WorldMapScreen
    onReturnToStory={() => setCurrentScreen({ type: 'story' })}
  />
)}
```

## Hardware Back Button Support

### Capacitor App Plugin Integration

Add hardware back button listener in App.tsx:

```typescript
import { App as CapApp } from '@capacitor/app';

useEffect(() => {
  // Define back button behavior per screen
  const handleHardwareBack = () => {
    const screen = currentScreen.type;

    // Screens with back navigation
    if (screen === 'characterCreation') {
      navigateHome();
      return;
    }

    if (screen === 'chooseCampaign') {
      navigateHome();
      return;
    }

    if (screen === 'characterSheet') {
      navigateBack();
      return;
    }

    if (screen === 'worldMap') {
      setCurrentScreen({ type: 'story' });
      return;
    }

    // Story screen - allow exit to home (same as Exit button)
    if (screen === 'story') {
      navigateHome();
      return;
    }

    // Screens without back (Combat, LevelUp, etc.)
    // Do nothing - hardware back is disabled
    // This prevents accidental exits during critical moments
  };

  const backButtonListener = CapApp.addListener('backButton', handleHardwareBack);

  return () => backButtonListener.remove();
}, [currentScreen, previousScreen]); // Re-register when screen changes
```

### Platform Behavior

- **Android:** Hardware back button triggers `handleHardwareBack()`
- **iOS:** No hardware back button, listener is ignored (no-op)
- **Web:** No hardware back button, listener is ignored (no-op)

## Implementation Phases

### Phase 1: Core Navigation Helpers
1. Add `navigateWithBack()`, `navigateBack()`, `navigateHome()` functions to App.tsx
2. Update existing navigation handlers to use new helpers
3. Test that CharacterSheet context behavior still works

### Phase 2: UI Components
1. Create `components/BackButton.tsx` component
2. Add BackButton to CharacterCreationScreen
3. Add BackButton to ChooseCampaignScreen
4. Add BackButton to CharacterSheetScreen
5. Add BackButton to WorldMapScreen

### Phase 3: Hardware Back Button
1. Add Capacitor App plugin listener in App.tsx
2. Implement `handleHardwareBack()` with per-screen logic
3. Test on Android device

### Phase 4: Testing & Polish
1. Test all back navigation paths on web
2. Test hardware back button on Android
3. Verify CharacterSheet returns to correct screen (Story, Combat, etc.)
4. Verify disabled screens (Combat, LevelUp) ignore hardware back

## Testing Strategy

### Manual Testing Checklist

**UI Back Button:**
- [ ] Character Creation → Back → Returns to Home ✓
- [ ] Choose Campaign → Back → Returns to Home ✓
- [ ] Character Sheet (opened from Story) → Back → Returns to Story ✓
- [ ] Character Sheet (opened from Home) → Back → Returns to Home ✓
- [ ] World Map → Back → Returns to Story ✓

**Hardware Back Button (Android):**
- [ ] Character Creation → Hardware back → Returns to Home ✓
- [ ] Choose Campaign → Hardware back → Returns to Home ✓
- [ ] Character Sheet (opened from Story) → Hardware back → Returns to Story ✓
- [ ] World Map → Hardware back → Returns to Story ✓
- [ ] Combat → Hardware back → No effect (disabled) ✓
- [ ] LevelUp → Hardware back → No effect (disabled) ✓
- [ ] Story → Hardware back → Returns to Home ✓

**Edge Cases:**
- [ ] Rapid back button presses don't cause navigation errors
- [ ] Back button during screen transitions behaves correctly
- [ ] previousScreen state is correctly reset after navigation

## Success Criteria

- ✅ Players can cancel character creation and return to Home
- ✅ Players can go back from campaign selection
- ✅ Character Sheet returns to correct previous screen (context-aware)
- ✅ World Map returns to Story
- ✅ Android hardware back button works for all navigable screens
- ✅ Hardware back button disabled on critical screens (Combat, LevelUp)
- ✅ No confirmation dialogs (immediate navigation)
- ✅ Back button UI is consistent across all screens
- ✅ No breaking of existing navigation behavior
