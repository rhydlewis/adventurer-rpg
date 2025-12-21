# Combat Actions UI Redesign

**Date:** 2025-12-21
**Status:** Design Complete
**Goal:** Simplify combat actions UI with consistent 2-row layout

## Problem Statement

The current combat actions area shows a dynamic grid of all available actions (attacks, spells, abilities, items), which becomes cluttered and inconsistent across different character classes. A Wizard might see 8+ buttons while a Fighter sees 2-3, creating an unpredictable interface.

## Solution Overview

Restructure combat actions into a fixed 2-row layout:
- **Row 1:** Primary Attack + Secondary Attack (always visible, core actions)
- **Row 2:** Spells + Inventory + Abilities (popup menus, always present but can be disabled)

This maintains visual consistency regardless of character class or available options.

## Layout Structure

```
┌─────────────────────────────────────────┐
│ ⚔️ Your Actions                         │
│ ┌──────────────┐ ┌──────────────┐      │
│ │   PRIMARY    │ │  SECONDARY   │      │
│ │   ATTACK     │ │   ATTACK     │      │
│ └──────────────┘ └──────────────┘      │
│ ┌────────┐ ┌──────────┐ ┌──────────┐  │
│ │ SPELLS │ │INVENTORY │ │ABILITIES │  │
│ └────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────┘
```

### Row 1: Attack Row (2 columns)

**Primary Attack Button:**
- Always visible, always enabled (uses unarmed if no weapon)
- Direct button (single click executes)
- Shows currently equipped weapon name + attack bonus
- Green gradient (`from-emerald-700 to-emerald-800`)

**Secondary Attack Button:**
- Always visible, grayed out when unavailable
- Direct button (single click executes)
- Shows tactical option: Power Attack, Defensive Strike, Aimed Shot, etc.
- Green gradient when available, gray when disabled
- Displays "No secondary attack" when unavailable

### Row 2: Resources Row (3 columns)

**Spells Popup Button:**
- Always visible
- Shows "X available" count (or "0 available" when disabled)
- Violet gradient (`from-violet-700 to-violet-800`)
- Opens popup with list of available spells

**Inventory Popup Button:**
- Always visible
- Shows "X available" count (or "0 available" when disabled)
- Amber gradient (`from-amber-700 to-amber-800`)
- Reuses existing `ItemsActionButton` component

**Abilities Popup Button:**
- Always visible
- Shows "X available" count (or "0 available" when disabled)
- Blue gradient (`from-blue-700 to-blue-800`)
- Opens popup with list of available class abilities

## Component Architecture

### New Components

**1. ActionPopupButton** (Generic Reusable Component)
```tsx
interface ActionPopupButtonProps {
  label: string;           // "Spells", "Inventory", "Abilities"
  icon: string;            // Lucide icon name
  actions: Action[];       // Filtered list of actions
  colorScheme: 'violet' | 'amber' | 'blue';
  onSelectAction: (action: Action) => void;
}
```

**Features:**
- Internal state: `const [isOpen, setIsOpen] = useState(false)`
- Disabled when `actions.length === 0`
- Popup positioning: `absolute bottom-full mb-2`
- Backdrop click to close
- Same list format as existing ItemsActionButton

**2. PrimaryAttackButton** (Direct Action)
```tsx
interface PrimaryAttackButtonProps {
  attack: Action | null;
  onExecute: (action: Action) => void;
}
```

**Features:**
- Always enabled (uses unarmed strike if no weapon)
- Shows weapon name + attack bonus
- Direct execution on click

**3. SecondaryAttackButton** (Direct Action)
```tsx
interface SecondaryAttackButtonProps {
  attack: Action | null;
  onExecute: (action: Action) => void;
}
```

**Features:**
- Grayed out when null
- Shows tactic name when available
- Direct execution on click

### Modified Components

**OptionsMenu.tsx:**
Add new menu item for Retreat:
```tsx
{showRetreat && onRetreat && (
  <button onClick={() => { onRetreat(); setIsOpen(false); }}>
    <Icon name="LogOut" size={20} />
    <span>Retreat from Combat</span>
  </button>
)}
```

## Data Flow

### Action Classification

```typescript
// In CombatScreen component:
const actions = getAvailableActions(combat.playerCharacter);

// Split into categories:
const primaryAttack = actions.find(a =>
  a.type === 'attack' && a.category === 'primary'
);

const secondaryAttack = actions.find(a =>
  a.type === 'attack' && a.category === 'secondary'
);

const spellActions = actions.filter(a => a.type === 'cast_spell');
const abilityActions = actions.filter(a => a.type === 'use_ability');

// Items already handled separately:
const usableItems = combat.playerCharacter.equipment.items.filter(
  item => item.usableInCombat && (item.quantity ?? 0) > 0
);
```

### Execution Flow

**Direct Buttons (Primary/Secondary):**
1. User clicks button
2. `executeTurn(action)` called immediately
3. Combat resolves, UI updates

**Popup Buttons (Spells/Inventory/Abilities):**
1. User clicks popup button
2. Popup opens with action list
3. User clicks action in popup
4. `executeTurn(action)` called
5. Popup closes automatically
6. Combat resolves, UI updates

**Retreat:**
1. User opens Options menu
2. User clicks "Retreat from Combat"
3. `retreat()` called from combatStore
4. Combat resolves with penalty
5. Navigation handled by parent

## Visual Design

### Button Sizing
- Attack row buttons: `min-h-[56px]` (comfortable touch target)
- Resource row buttons: `min-h-[48px]` (slightly smaller, still accessible)
- All buttons: `p-2 rounded-lg`

### Color Schemes
- **Primary/Secondary Attack**: Green (`emerald-700/800`)
- **Spells**: Violet (`violet-700/800`)
- **Inventory**: Amber (`amber-700/800`)
- **Abilities**: Blue (`blue-700/800`)
- **Disabled**: Gray (`slate-900/50, text-slate-600`)

### Popup Styling
- Width: `w-64` (consistent with ItemsActionButton)
- Max height: `max-h-64` with `overflow-y-auto`
- Background: `bg-slate-800 border border-slate-700`
- Shadow: `shadow-xl`
- Z-index: `z-50` (popup), `z-40` (backdrop)

### Action List Items (in popups)
```tsx
<button className="w-full text-left px-3 py-2 rounded
                   bg-slate-900/50 hover:bg-slate-700
                   border border-slate-600 hover:border-{color}-500
                   transition-colors">
  <div className="flex justify-between">
    <span className="body-primary text-slate-200">{action.name}</span>
    <span className="text-{color}-400 text-sm">{uses remaining}</span>
  </div>
  <p className="text-xs text-slate-400 mt-1">{action.description}</p>
  {/* Grayed out with reason if disabled */}
  {!action.available && (
    <p className="text-xs text-slate-500 italic mt-1">{action.disabledReason}</p>
  )}
</button>
```

## Edge Cases

### No Weapon Equipped
- Primary Attack shows "Unarmed Strike"
- Uses 1d3 + STR modifier damage
- Never disabled

### No Secondary Attack
- Button shows "No secondary attack"
- Grayed out (`bg-slate-900/50 text-slate-600`)
- Not clickable

### All Resources Empty (Fighter with no items/abilities)
- All 3 bottom row buttons show "0 available"
- All 3 are grayed out/disabled
- Layout remains consistent (no shifting)

### Dynamic Updates
- Using last spell slot → Spells button updates to "0 available"
- Using last ability charge → shown grayed in popup on next open
- Consuming last item → Inventory updates to "0 available"
- Picking up item mid-combat → Inventory count increments

### Mobile/Touch Targets
- All buttons maintain minimum 44px height for accessibility
- Popup backdrop is full-screen (`fixed inset-0`) for easy closing

## Implementation Steps

### Phase 1: Create Generic ActionPopupButton
1. Create `src/components/combat/ActionPopupButton.tsx`
2. Implement popup state, backdrop, and action list rendering
3. Add color scheme variants (violet, amber, blue)
4. Handle disabled state when `actions.length === 0`

### Phase 2: Create Attack Buttons
1. Create `src/components/combat/PrimaryAttackButton.tsx`
2. Create `src/components/combat/SecondaryAttackButton.tsx`
3. Handle disabled states and fallbacks

### Phase 3: Update CombatScreen Layout
1. Remove existing grid layout
2. Add 2-row structure (attack row + resource row)
3. Wire up new components with action classification
4. Remove retreat button from actions area

### Phase 4: Add Retreat to OptionsMenu
1. Add `showRetreat` and `onRetreat` props to OptionsMenu
2. Add menu item with LogOut icon
3. Wire up to combat store's `retreat()` function

### Phase 5: Update Action Classification
1. Modify `getAvailableActions()` to mark primary/secondary attacks
2. Ensure backward compatibility with existing action structure
3. Add `category` field to Action type if needed

## Testing Checklist

- [ ] Fighter with no spells/abilities: only Primary Attack + Inventory active
- [ ] Wizard with full spells: all buttons active with correct counts
- [ ] Rogue with Sneak Attack: appears as secondary attack option
- [ ] Use last spell slot: Spells button grays out immediately
- [ ] Use last ability charge: shown grayed in popup with reason
- [ ] Consume last item: Inventory grays out
- [ ] No weapon equipped: Primary Attack shows "Unarmed Strike"
- [ ] Retreat from options menu: triggers retreat penalty correctly
- [ ] Popup closes on backdrop click
- [ ] Popup closes after selecting action
- [ ] Disabled actions in popup show correct reason
- [ ] All touch targets ≥44px on mobile
- [ ] Layout doesn't shift when categories become empty

## Migration Notes

### Breaking Changes
None - this is a visual redesign only. All action execution logic remains the same.

### Backward Compatibility
- Existing `Action` type unchanged
- Existing `executeTurn()` function unchanged
- Existing `retreat()` function moved to options menu
- ItemsActionButton pattern reused (no changes needed)

### Future Enhancements
- Add keyboard shortcuts (1-5 for quick actions)
- Add combat tutorial highlighting the new layout
- Consider customizable action bar for advanced players
