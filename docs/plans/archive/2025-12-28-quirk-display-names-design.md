# Quirk Display Names Design

**Date**: 2025-12-28
**Status**: Approved

## Problem

Starting quirks are currently displayed using their internal key names (e.g., `auto-block-first-attack`) in the character creation UI. Players should see friendly display names and descriptions instead.

## Solution

Create a centralized quirk information registry that provides display names, descriptions, and combat messages for all quirks.

## Requirements

- Display friendly name + description in character creation UI
- Centralize combat messages (currently hardcoded in quirks.ts)
- Type-safe structure ensuring all quirks have display info
- Maintain existing combat behavior

## Data Structure

### New File: `src/data/quirkInfo.ts`

```typescript
import type { StartingQuirk } from '../types';

export interface QuirkDisplayInfo {
  displayName: string;
  description: string;
  combatMessage: string;
}

export const QUIRK_INFO: Record<StartingQuirk, QuirkDisplayInfo> = {
  'auto-block-first-attack': {
    displayName: 'Automatic Block',
    description: 'Your guard training deflects the first attack in combat',
    combatMessage: "Your guard training kicks in—you deflect the blow!",
  },
  'start-hidden': {
    displayName: 'Shadow Stealth',
    description: 'You begin combat hidden with a defense bonus',
    combatMessage: "You blend into the shadows (+4 AC bonus)...",
  },
  'arcane-shield-turn-1': {
    displayName: 'Arcane Shield',
    description: 'A magical shield protects you on your first turn',
    combatMessage: "An arcane shield flares to life (+4 AC this turn)!",
  },
  'auto-heal-first-hit': {
    displayName: 'Divine Renewal',
    description: 'Divine protection heals you when first struck',
    combatMessage: "Divine protection surrounds you...",
  },
};

export function getQuirkInfo(quirk: StartingQuirk): QuirkDisplayInfo {
  return QUIRK_INFO[quirk];
}
```

## Integration Points

### 1. UI - QuickCharacterCreationScreen.tsx

**Line 74 area** (detailed confirmation view):
```typescript
import { getQuirkInfo } from '../data/quirkInfo';

const quirkInfo = background.startingQuirk
  ? getQuirkInfo(background.startingQuirk)
  : null;

{quirkInfo && (
  <div className="flex items-start gap-2">
    <Icon name="Zap" size={16} className="text-fg-accent flex-shrink-0" />
    <div className="flex-1">
      <span className="body-primary text-sm font-semibold text-fg-accent">
        {quirkInfo.displayName}
      </span>
      <p className="body-secondary text-xs mt-1">
        {quirkInfo.description}
      </p>
    </div>
  </div>
)}
```

**Line 139 area** (quick class preview):
```typescript
<p className="text-xs">
  Quirk: {background.startingQuirk ? getQuirkInfo(background.startingQuirk).displayName : 'None'}
</p>
```

### 2. Combat Logic - quirks.ts

Replace hardcoded combat messages with centralized ones:

```typescript
import { QUIRK_INFO } from '../data/quirkInfo';

// In each case statement:
case 'auto-block-first-attack':
  if (trigger === 'first-attack' && combat.turn === 1) {
    return {
      log: [{
        turn: combat.turn,
        actor: 'system',
        message: QUIRK_INFO[quirk].combatMessage,
      }],
      autoBlockActive: true,
      quirkTriggered: true,
    };
  }
```

Apply same pattern to all four quirk cases.

## Testing

### New Test File: `src/__tests__/data/quirkInfo.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { QUIRK_INFO } from '../../data/quirkInfo';

describe('QuirkInfo', () => {
  it('should have display info for all quirks', () => {
    const quirks = ['auto-block-first-attack', 'start-hidden',
                    'arcane-shield-turn-1', 'auto-heal-first-hit'];

    quirks.forEach(quirk => {
      expect(QUIRK_INFO[quirk]).toBeDefined();
      expect(QUIRK_INFO[quirk].displayName).toBeTruthy();
      expect(QUIRK_INFO[quirk].description).toBeTruthy();
      expect(QUIRK_INFO[quirk].combatMessage).toBeTruthy();
    });
  });
});
```

### Existing Tests

Tests in `quirks.test.ts` should continue to pass unchanged since combat behavior remains the same.

## Manual Verification

1. Character creation shows friendly quirk names
2. Combat messages still appear correctly
3. No TypeScript errors
4. Run `npm test` and `npm run lint`

## Benefits

- **Single source of truth**: All quirk text in one place
- **Type safety**: TypeScript ensures completeness
- **Maintainability**: Easy to update quirk text
- **Consistency**: Same pattern as CLASSES and BACKGROUNDS
- **DRY**: No duplicated combat messages
