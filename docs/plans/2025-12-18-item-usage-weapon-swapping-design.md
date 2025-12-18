# Item Usage & Weapon Swapping Design

**Date:** 2025-12-18
**Status:** Approved
**Phase:** 1.3+ (Item Usage & Equipment Management)

## Overview

This design adds item usage and weapon swapping to combat, enabling players to use consumables (healing potions, antidotes, etc.) and tactically switch weapons during battle. The implementation uses a hybrid approach with both combat UI shortcuts and character sheet management.

## Goals

1. ✅ Player can access character sheet from any screen (already implemented via OptionsMenu)
2. ✅ Player can use consumable items during combat
3. ✅ Player can switch weapons during combat
4. ✅ Items and weapon swaps are free actions (no turn cost)
5. ✅ Proficiency-based equipment restrictions

## Design Decisions

### Item Usage Approach: Hybrid (Option C)
- **Combat UI:** "Items" button opens popover menu for quick access
- **Character Sheet:** "Use" buttons on each item for deliberate usage
- **Rationale:** Fast combat access when needed, full inventory control in character sheet

### Weapon Swapping: Quick Swap + Sheet Management (Option C)
- **Combat UI:** Swap button in player card (next to AC/BAB) cycles through weapons
- **Character Sheet:** "Equip" buttons for deliberate weapon changes
- **Rationale:** Tactical mid-combat swapping without cluttering action grid

### Action Economy: Free Actions (Option B)
- Items and weapon swaps cost no turns
- Can swap weapon + use item + attack in same turn
- **Rationale:** Player-friendly, encourages experimentation

### Item Display: Collapsible "Items" Button (Option C)
- Single "Items" button in action grid
- Opens popover showing all usable items
- **Rationale:** Mobile-friendly (thumb access), scales to any number of items

### Out-of-Combat Items: Context-Based Restrictions (Option B)
- Items enabled/disabled based on state (HP, conditions, combat status)
- **Rationale:** Prevents wasting items, provides helpful feedback

### Weapon Cycling: Cycle Through All (Option A)
- Each click cycles to next weapon in inventory order
- **Rationale:** Simple, predictable, works for 2-5 weapons

### Feedback: Combat Log + Stat Updates (Option A)
- All actions logged with detailed roll output
- Stats update in real-time
- **Rationale:** Consistent with existing combat system

### Equipment Restrictions: Proficiency System (Option B)
- Class-based proficiency requirements
- Non-proficient items grayed out with warnings
- **Rationale:** Standard d20 rules, encourages class identity

### Weapon Storage: Separate Weapons Array (Option B)
- `equipment.weapons[]` for all owned weapons
- `equipment.items[]` for consumables only
- **Rationale:** Clear separation, cleaner UI logic

### Armor: Deferred (Option C)
- Single armor slot, no swapping in Phase 1
- Future feature
- **Rationale:** YAGNI, focus on core features first

### Fumbles: Universal (Option C)
- Fumbles work the same regardless of weapon
- No weapon-specific effects
- **Rationale:** Keep it simple, can extend later

---

## Architecture

### Data Structure Updates

#### Equipment Type (`types/equipment.ts`)

```typescript
export interface Equipment {
  weapon: Weapon | null;       // Currently equipped weapon
  weapons: Weapon[];           // All owned weapons (includes equipped)
  armor: Armor | null;         // Currently equipped armor (no swapping Phase 1)
  shield: Shield | null;       // Shield status
  items: Item[];               // Consumables only (potions, scrolls, etc.)
}
```

#### Proficiency System

Add to Weapon and Armor types:

```typescript
export interface Weapon {
  // ... existing fields
  proficiencyRequired?: 'simple' | 'martial' | 'martial-finesse';
}

export interface Armor {
  // ... existing fields
  proficiencyRequired?: 'light' | 'medium' | 'heavy';
}
```

Add to class definitions (`data/classes.ts`):

```typescript
export const CLASSES = {
  Fighter: {
    // ... existing
    proficiencies: {
      weapons: ['simple', 'martial'],
      armor: ['light', 'medium', 'heavy'],
    },
  },
  Wizard: {
    proficiencies: {
      weapons: ['simple'],
      armor: [], // No armor proficiency
    },
  },
  Rogue: {
    proficiencies: {
      weapons: ['simple', 'martial-finesse'], // Rapier, dagger
      armor: ['light'],
    },
  },
  Cleric: {
    proficiencies: {
      weapons: ['simple'],
      armor: ['light', 'medium'],
    },
  },
};
```

---

## Combat UI Implementation

### Items Button (Action Grid)

**Component:** `ItemsActionButton.tsx` (NEW)
- Styled as amber gradient (matches `use_item` type in CombatScreen line 270)
- Shows "Items" with Backpack icon
- Opens popover menu with all usable items
- Popover lists items with quantities: "Healing Potion (×2)"

**Integration in `CombatScreen.tsx`:**

```typescript
const usableItems = combat.playerCharacter.equipment.items.filter(
  item => item.usableInCombat && (item.quantity ?? 0) > 0
);

// Add to action grid
{usableItems.length > 0 && (
  <ItemsActionButton
    items={usableItems}
    onUseItem={(itemId) => executeTurn({ type: 'use_item', itemId })}
  />
)}
```

### Weapon Swap Button (Player Card)

**Location:** `CompactCombatant` component (lines 370-476 in CombatScreen.tsx)
**Placement:** Same row as AC/BAB stats (three-column layout)

```typescript
// In Stats Row section (after line 437)
<div className="flex space-x-1.5">
  {/* AC */}
  <StatBadge label="AC" value={character.ac} />

  {/* BAB */}
  <StatBadge label="BAB" value={formatModifier(character.bab)} />

  {/* Swap Weapon Button (only if 2+ weapons) */}
  {variant === 'player' && character.equipment.weapons.length > 1 && (
    <button
      onClick={() => onSwapWeapon()}
      className="flex-1 bg-slate-900/50 border border-emerald-900/30 rounded p-1.5
                 hover:bg-slate-800/50 transition-colors flex flex-col items-center justify-center"
      title="Swap Weapon"
    >
      <Icon name="RefreshCw" size={12} />
      <span className="text-[9px] text-slate-500 label-secondary mt-0.5">Swap</span>
    </button>
  )}
</div>
```

---

## Action Utilities

### Update `utils/actions.ts`

Replace TODO comments:

```typescript
export function getAvailableActions(character: Character): Action[] {
  const actions: Action[] = [];

  // 1. Basic Attack (always available)
  actions.push({ type: 'attack', name: 'Attack', available: true });

  // 2. Class abilities (existing code)
  // ... existing ability code

  // 3. Spells (existing code)
  // ... existing spell code

  // 4. Use Item
  // Note: Items handled separately via Items button, not individual actions
  // This section intentionally left minimal

  return actions;
}

export function canPerformAction(character: Character, action: Action): boolean {
  switch (action.type) {
    case 'attack':
      return true;
    case 'use_ability':
      // ... existing code
    case 'cast_spell':
      // ... existing code
    case 'use_item':
      // Check if item exists and has quantity
      const item = character.equipment.items.find(i => i.id === action.itemId);
      return item ? (item.quantity ?? 0) > 0 : false;
    default:
      return false;
  }
}
```

### New Utility: `utils/itemEffects.ts`

```typescript
import { roll } from './dice';
import type { Character, ItemEffect } from '../types';

export function applyItemEffect(
  character: Character,
  effect: ItemEffect,
  inCombat: boolean
): { character: Character; logMessage: string } {
  try {
    let updatedCharacter = { ...character };
    let logMessage = '';

    switch (effect.type) {
      case 'heal':
        const healRoll = roll(effect.amount);
        const healAmount = Math.min(healRoll.total, character.maxHp - character.hp);
        updatedCharacter.hp = Math.min(character.hp + healRoll.total, character.maxHp);
        logMessage = `${effect.amount}: ${healRoll.output} = ${healAmount} HP restored`;
        break;

      case 'escape':
        // Only works in combat
        logMessage = inCombat ? 'Escaped from combat!' : 'No effect outside combat';
        break;

      case 'remove-condition':
        // Remove specified condition (Phase 1.4 integration)
        logMessage = `Removed ${effect.condition} condition`;
        break;

      case 'buff':
        // Apply stat buff for duration
        logMessage = `+${effect.bonus} ${effect.stat} for ${effect.duration} turns`;
        break;

      case 'damage':
        // Throwable items (future: apply to enemy)
        logMessage = `Deals ${effect.amount} damage`;
        break;

      case 'spell':
        // Arcane scrolls (future: trigger spell casting)
        logMessage = `Casts ${effect.spellName}`;
        break;
    }

    return { character: updatedCharacter, logMessage };
  } catch (error) {
    console.error('Item effect failed:', error);
    return {
      character,
      logMessage: 'Item effect failed',
    };
  }
}
```

---

## Combat Store & Round Resolution

### Update `stores/combatStore.ts`

Add weapon swap action:

```typescript
interface CombatStore {
  combat: CombatState | null;
  startCombat: (player: Character, enemy: Character) => void;
  executeTurn: (playerAction: Action) => void;
  swapWeapon: (weaponId: string) => void;  // NEW
  resetCombat: () => void;
  retreat: () => { player: Character; safeNodeId: string } | null;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  // ... existing code

  swapWeapon: (weaponId: string) => {
    set((state) => {
      if (!state.combat) {
        console.warn('Cannot swap weapon: no active combat');
        return state;
      }

      const newWeapon = state.combat.playerCharacter.equipment.weapons.find(
        w => w.id === weaponId
      );

      if (!newWeapon) {
        console.error(`Weapon not found: ${weaponId}`);
        return state; // No-op if weapon doesn't exist
      }

      const updatedPlayer = {
        ...state.combat.playerCharacter,
        equipment: {
          ...state.combat.playerCharacter.equipment,
          weapon: newWeapon,
        },
      };

      // Recalculate AC if weapon affects it (e.g., finesse + dex)
      const updatedAC = calculateAC(updatedPlayer);
      updatedPlayer.ac = updatedAC;

      return {
        combat: {
          ...state.combat,
          playerCharacter: updatedPlayer,
          log: [
            ...state.combat.log,
            {
              turn: state.combat.turn,
              actor: 'system',
              message: `Switched to ${newWeapon.name}`,
            },
          ],
        },
      };
    });
  },
}));
```

### Update `utils/combat.ts::resolveCombatRound()`

Handle `use_item` actions:

```typescript
export function resolveCombatRound(
  state: CombatState,
  playerAction: Action
): CombatState {
  // ... existing initiative/turn logic

  // Handle player action
  if (playerAction.type === 'use_item') {
    const item = state.playerCharacter.equipment.items.find(
      i => i.id === playerAction.itemId
    );

    if (item && item.effect) {
      // Apply item effect
      const { character, logMessage } = applyItemEffect(
        state.playerCharacter,
        item.effect,
        true // inCombat = true
      );

      updatedState.playerCharacter = character;

      // Decrement item quantity
      const updatedItems = character.equipment.items.map(i =>
        i.id === item.id
          ? { ...i, quantity: (i.quantity ?? 1) - 1 }
          : i
      ).filter(i => (i.quantity ?? 0) > 0); // Remove if quantity = 0

      updatedState.playerCharacter.equipment.items = updatedItems;

      // Add log entry
      logEntries.push({
        turn: updatedState.turn,
        actor: 'player',
        message: `Uses ${item.name}: ${logMessage}`,
      });

      // Handle escape items (special case: end combat)
      if (item.effect.type === 'escape') {
        updatedState.winner = 'player'; // Escaped successfully
        return updatedState;
      }
    }
  }

  // ... rest of combat logic (enemy turn, etc.)
}
```

---

## Character Sheet Updates

### Items Section - Add "Use" Buttons

**Location:** `screens/CharacterSheetScreen.tsx` - Equipment Tab

```typescript
{character.equipment.items.length > 0 && (
  <div>
    <h3 className="heading-tertiary mb-2">Consumables</h3>
    {character.equipment.items.map((item, idx) => {
      const canUse = canUseItem(character, item, inCombat);
      return (
        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800">
          <div className="flex-1">
            <span className="body-primary">{item.name}</span>
            <span className="text-fg-muted ml-2">×{item.quantity}</span>
            {!canUse && (
              <span className="ml-2 text-slate-500 text-xs">
                {getItemDisabledReason(character, item, inCombat)}
              </span>
            )}
          </div>
          <button
            onClick={() => handleUseItem(item.id)}
            disabled={!canUse}
            className={`px-3 py-1 rounded button-text text-sm ${
              canUse
                ? 'bg-amber-700 hover:bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Use
          </button>
        </div>
      );
    })}
  </div>
)}
```

### Weapons Section - Add "Equip" Buttons

```typescript
{character.equipment.weapons.length > 0 && (
  <div className="mt-4">
    <h3 className="heading-tertiary mb-2">Weapons</h3>
    {character.equipment.weapons.map((weapon, idx) => {
      const isEquipped = character.equipment.weapon?.id === weapon.id;
      const canEquip = hasWeaponProficiency(character, weapon);

      return (
        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800">
          <div className="flex-1">
            <span className="body-primary">{weapon.name}</span>
            <span className="text-slate-500 ml-2 text-xs">{weapon.damage} {weapon.damageType}</span>
            {isEquipped && <span className="ml-2 text-emerald-400 text-xs">✓ Equipped</span>}
            {!canEquip && (
              <span className="ml-2 text-red-400 text-xs">
                ⚠️ Requires {weapon.proficiencyRequired} proficiency
              </span>
            )}
          </div>
          <button
            onClick={() => handleEquipWeapon(weapon.id)}
            disabled={isEquipped || !canEquip}
            className={`px-3 py-1 rounded button-text text-sm ${
              !isEquipped && canEquip
                ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isEquipped ? 'Equipped' : 'Equip'}
          </button>
        </div>
      );
    })}
  </div>
)}
```

### Helper Functions

```typescript
function canUseItem(character: Character, item: Item, inCombat: boolean): boolean {
  // No quantity left
  if ((item.quantity ?? 0) === 0) return false;

  // Context-based restrictions
  if (item.effect?.type === 'heal') {
    return character.hp < character.maxHp; // Only if damaged
  }
  if (item.effect?.type === 'escape') {
    return inCombat; // Only during combat
  }
  if (item.effect?.type === 'remove-condition') {
    // Check if character has the condition (Phase 1.4+)
    return character.conditions?.some(c => c.type === item.effect.condition) ?? false;
  }

  // Default: usable if it's a combat-usable item
  return item.usableInCombat || !inCombat;
}

function getItemDisabledReason(character: Character, item: Item, inCombat: boolean): string {
  if ((item.quantity ?? 0) === 0) return 'None left';
  if (item.effect?.type === 'heal' && character.hp >= character.maxHp) return 'At full HP';
  if (item.effect?.type === 'escape' && !inCombat) return 'Only usable in combat';
  return '';
}

function hasWeaponProficiency(character: Character, weapon: Weapon): boolean {
  const classProficiencies = CLASSES[character.class].proficiencies.weapons;
  const required = weapon.proficiencyRequired ?? 'simple';
  return classProficiencies.includes(required);
}

function handleUseItem(itemId: string) {
  const character = useCharacterStore.getState().character;
  if (!character) return;

  const item = character.equipment.items.find(i => i.id === itemId);
  if (!item || !item.effect) return;

  // Apply effect
  const inCombat = useCombatStore.getState().combat !== null;
  const { character: updated, logMessage } = applyItemEffect(character, item.effect, inCombat);

  // Decrement quantity
  const updatedItems = updated.equipment.items.map(i =>
    i.id === itemId
      ? { ...i, quantity: (i.quantity ?? 1) - 1 }
      : i
  ).filter(i => (i.quantity ?? 0) > 0);

  updated.equipment.items = updatedItems;

  // Update character store
  useCharacterStore.getState().setCharacter(updated);

  // Show feedback (toast or log)
  console.log(`Used ${item.name}: ${logMessage}`);
}

function handleEquipWeapon(weaponId: string) {
  const character = useCharacterStore.getState().character;
  if (!character) return;

  const weapon = character.equipment.weapons.find(w => w.id === weaponId);
  if (!weapon) return;

  // Check proficiency
  if (!hasWeaponProficiency(character, weapon)) {
    console.warn('Cannot equip: not proficient');
    return;
  }

  // Equip weapon
  const updated = {
    ...character,
    equipment: {
      ...character.equipment,
      weapon,
    },
  };

  // Recalculate AC (weapon may affect it)
  updated.ac = calculateAC(updated);

  useCharacterStore.getState().setCharacter(updated);
}
```

---

## Testing Requirements

### Test File: `__tests__/utils/itemEffects.test.ts` (NEW)

```typescript
import { describe, it, expect } from 'vitest';
import { applyItemEffect } from '../../utils/itemEffects';
import { createTestCharacter } from '../helpers';
import type { ItemEffect } from '../../types';

describe('itemEffects', () => {
  describe('applyItemEffect', () => {
    it('should heal character with 2d8+2 for healing potion', () => {
      const character = createTestCharacter({ hp: 10, maxHp: 30 });
      const effect: ItemEffect = { type: 'heal', amount: '2d8+2' };

      const { character: updated, logMessage } = applyItemEffect(
        character,
        effect,
        true
      );

      expect(updated.hp).toBeGreaterThan(10);
      expect(updated.hp).toBeLessThanOrEqual(30);
      expect(logMessage).toContain('HP restored');
    });

    it('should not overheal above maxHp', () => {
      const character = createTestCharacter({ hp: 28, maxHp: 30 });
      const effect: ItemEffect = { type: 'heal', amount: '2d8+2' };

      const { character: updated } = applyItemEffect(character, effect, true);

      expect(updated.hp).toBe(30);
    });

    it('should handle escape items only in combat', () => {
      const character = createTestCharacter();
      const effect: ItemEffect = { type: 'escape' };

      const inCombat = applyItemEffect(character, effect, true);
      const outOfCombat = applyItemEffect(character, effect, false);

      expect(inCombat.logMessage).toContain('Escaped');
      expect(outOfCombat.logMessage).toContain('No effect');
    });

    it('should handle remove-condition effects', () => {
      const character = createTestCharacter({
        conditions: [{ type: 'poisoned', duration: 3 }],
      });
      const effect: ItemEffect = { type: 'remove-condition', condition: 'poisoned' };

      const { logMessage } = applyItemEffect(character, effect, true);

      expect(logMessage).toContain('poisoned');
    });
  });
});
```

### Test File: `__tests__/utils/combat.test.ts` (UPDATE)

Add item usage tests:

```typescript
describe('combat - item usage', () => {
  it('should apply healing potion effect during combat', () => {
    const player = createTestCharacter({
      hp: 10,
      maxHp: 30,
      equipment: {
        items: [{ id: 'healing-potion', quantity: 2, ...ITEMS['healing-potion'] }],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = { type: 'use_item', itemId: 'healing-potion' };
    const result = resolveCombatRound(combat, action);

    expect(result.playerCharacter.hp).toBeGreaterThan(10);
    expect(result.playerCharacter.hp).toBeLessThanOrEqual(30);
  });

  it('should decrement item quantity after use', () => {
    const player = createTestCharacter({
      equipment: {
        items: [{ id: 'healing-potion', quantity: 2, ...ITEMS['healing-potion'] }],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = { type: 'use_item', itemId: 'healing-potion' };
    const result = resolveCombatRound(combat, action);

    const item = result.playerCharacter.equipment.items.find(
      i => i.id === 'healing-potion'
    );
    expect(item?.quantity).toBe(1);
  });

  it('should remove item when quantity reaches 0', () => {
    const player = createTestCharacter({
      equipment: {
        items: [{ id: 'healing-potion', quantity: 1, ...ITEMS['healing-potion'] }],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = { type: 'use_item', itemId: 'healing-potion' };
    const result = resolveCombatRound(combat, action);

    const item = result.playerCharacter.equipment.items.find(
      i => i.id === 'healing-potion'
    );
    expect(item).toBeUndefined();
  });

  it('should add item usage to combat log', () => {
    const player = createTestCharacter({
      equipment: {
        items: [{ id: 'healing-potion', quantity: 1, ...ITEMS['healing-potion'] }],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = { type: 'use_item', itemId: 'healing-potion' };
    const result = resolveCombatRound(combat, action);

    const logEntry = result.log.find(l => l.message.includes('Healing Potion'));
    expect(logEntry).toBeDefined();
    expect(logEntry?.actor).toBe('player');
    expect(logEntry?.message).toContain('HP restored');
  });

  it('should handle smoke bomb escape', () => {
    const player = createTestCharacter({
      equipment: {
        items: [{ id: 'smoke-bomb', quantity: 1, ...ITEMS['smoke-bomb'] }],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = { type: 'use_item', itemId: 'smoke-bomb' };
    const result = resolveCombatRound(combat, action);

    expect(result.winner).toBe('player'); // Escaped
    expect(result.log.some(l => l.message.includes('Escaped'))).toBe(true);
  });
});

describe('combat - weapon swapping', () => {
  it('should swap weapons and update combat state', () => {
    const longsword = { id: 'longsword', name: 'Longsword', ...WEAPONS.Longsword };
    const rapier = { id: 'rapier', name: 'Rapier', ...WEAPONS.Rapier };

    const player = createTestCharacter({
      equipment: {
        weapon: longsword,
        weapons: [longsword, rapier],
      },
    });
    const enemy = createTestEnemy();

    useCombatStore.getState().startCombat(player, enemy);
    useCombatStore.getState().swapWeapon('rapier');

    const combat = useCombatStore.getState().combat;
    expect(combat?.playerCharacter.equipment.weapon?.id).toBe('rapier');
  });

  it('should add weapon swap to combat log', () => {
    const longsword = { id: 'longsword', name: 'Longsword', ...WEAPONS.Longsword };
    const rapier = { id: 'rapier', name: 'Rapier', ...WEAPONS.Rapier };

    const player = createTestCharacter({
      equipment: {
        weapon: longsword,
        weapons: [longsword, rapier],
      },
    });
    const enemy = createTestEnemy();

    useCombatStore.getState().startCombat(player, enemy);
    useCombatStore.getState().swapWeapon('rapier');

    const combat = useCombatStore.getState().combat;
    expect(combat?.log.some(l => l.message.includes('Switched to Rapier'))).toBe(true);
  });

  it('should not swap to non-existent weapon', () => {
    const longsword = { id: 'longsword', name: 'Longsword', ...WEAPONS.Longsword };

    const player = createTestCharacter({
      equipment: {
        weapon: longsword,
        weapons: [longsword],
      },
    });
    const enemy = createTestEnemy();

    useCombatStore.getState().startCombat(player, enemy);
    useCombatStore.getState().swapWeapon('fake-weapon');

    const combat = useCombatStore.getState().combat;
    expect(combat?.playerCharacter.equipment.weapon?.id).toBe('longsword'); // Unchanged
  });
});
```

### Test File: `__tests__/data/equipment.test.ts` (UPDATE)

Add proficiency tests:

```typescript
describe('proficiency system', () => {
  it('Fighter should be proficient with all weapons', () => {
    const fighter = createTestCharacter({ class: 'Fighter' });

    expect(hasWeaponProficiency(fighter, WEAPONS.Longsword)).toBe(true);
    expect(hasWeaponProficiency(fighter, WEAPONS.Rapier)).toBe(true);
    expect(hasWeaponProficiency(fighter, WEAPONS.Dagger)).toBe(true);
  });

  it('Wizard should only be proficient with simple weapons', () => {
    const wizard = createTestCharacter({ class: 'Wizard' });

    expect(hasWeaponProficiency(wizard, WEAPONS.Dagger)).toBe(true);
    expect(hasWeaponProficiency(wizard, WEAPONS.Longsword)).toBe(false);
  });

  it('Rogue should be proficient with finesse weapons', () => {
    const rogue = createTestCharacter({ class: 'Rogue' });

    expect(hasWeaponProficiency(rogue, WEAPONS.Rapier)).toBe(true);
    expect(hasWeaponProficiency(rogue, WEAPONS.Dagger)).toBe(true);
    expect(hasWeaponProficiency(rogue, WEAPONS.Longsword)).toBe(false);
  });

  it('Cleric should be proficient with simple weapons and light/medium armor', () => {
    const cleric = createTestCharacter({ class: 'Cleric' });

    expect(hasWeaponProficiency(cleric, WEAPONS.Mace)).toBe(true);
    expect(hasWeaponProficiency(cleric, WEAPONS.Longsword)).toBe(false);
    expect(hasArmorProficiency(cleric, ARMORS.Leather)).toBe(true);
    expect(hasArmorProficiency(cleric, ARMORS.Chainmail)).toBe(true);
  });
});
```

---

## Error Handling & Edge Cases

### Error Handling

```typescript
// utils/itemEffects.ts
export function applyItemEffect(
  character: Character,
  effect: ItemEffect,
  inCombat: boolean
): { character: Character; logMessage: string } {
  try {
    // ... existing effect logic
  } catch (error) {
    console.error('Item effect failed:', error);
    return {
      character,
      logMessage: 'Item effect failed',
    };
  }
}

// stores/combatStore.ts - swapWeapon
swapWeapon: (weaponId: string) => {
  set((state) => {
    if (!state.combat) {
      console.warn('Cannot swap weapon: no active combat');
      return state;
    }

    const newWeapon = state.combat.playerCharacter.equipment.weapons.find(
      w => w.id === weaponId
    );

    if (!newWeapon) {
      console.error(`Weapon not found: ${weaponId}`);
      return state; // No-op if weapon doesn't exist
    }

    // ... rest of swap logic
  });
}
```

### Edge Cases

| Edge Case | Solution |
|-----------|----------|
| No weapons in inventory | Swap button doesn't render (check `weapons.length > 1`) |
| Item with `quantity: undefined` | Treat as `quantity: 1`, decrement removes item |
| Using item during enemy turn | Items are free actions, allowed anytime |
| Equipping weapon mid-attack animation | State updates are synchronous, no race conditions |
| Using last healing potion at full HP | Button disabled by `canUseItem()` context check |
| Non-proficient weapon in inventory | "Equip" button disabled, shows warning tooltip |
| Smoke bomb used outside combat | No effect, log message: "No effect outside combat" |
| Item popover open when combat ends | Popover auto-closes on state change |

---

## Data Migration

**Not needed** - no production users. Equipment type will be updated directly:
- Add `equipment.weapons: Weapon[]` to Character type
- Update character creation to initialize `weapons` array
- Update starting equipment to populate `weapons` array

---

## Implementation Checklist

### Phase 1: Data Structures & Types
- [ ] Update `Equipment` type with `weapons: Weapon[]` array
- [ ] Add `proficiencyRequired` to Weapon and Armor types
- [ ] Add `proficiencies` to class definitions in `data/classes.ts`
- [ ] Update weapon/armor data with proficiency requirements
- [ ] Update character creation to initialize `equipment.weapons`
- [ ] Update starting equipment to populate `weapons` array

### Phase 2: Item Effects Utility
- [ ] Create `utils/itemEffects.ts`
- [ ] Implement `applyItemEffect()` function
- [ ] Handle heal, escape, remove-condition, buff, damage, spell effects
- [ ] Add error handling
- [ ] Write tests for `itemEffects.test.ts`

### Phase 3: Combat Integration
- [ ] Update `utils/actions.ts` - remove TODO comments
- [ ] Implement `canPerformAction()` for `use_item`
- [ ] Update `utils/combat.ts::resolveCombatRound()` to handle `use_item`
- [ ] Add item quantity decrement logic
- [ ] Add combat log entries for item usage
- [ ] Handle escape items (set `winner = 'player'`)
- [ ] Write tests for combat item usage

### Phase 4: Combat Store - Weapon Swapping
- [ ] Add `swapWeapon()` to `combatStore.ts`
- [ ] Implement weapon swap logic with AC recalculation
- [ ] Add combat log entry for weapon swaps
- [ ] Add error handling (no combat, weapon not found)
- [ ] Write tests for weapon swapping

### Phase 5: Combat UI - Items Button
- [ ] Create `ItemsActionButton.tsx` component
- [ ] Implement popover menu with item list
- [ ] Style as amber gradient (match existing `use_item` style)
- [ ] Wire to `executeTurn({ type: 'use_item', itemId })`
- [ ] Add to combat action grid (only if `usableItems.length > 0`)

### Phase 6: Combat UI - Weapon Swap Button
- [ ] Add swap button to `CompactCombatant` component
- [ ] Place in same row as AC/BAB (three-column layout)
- [ ] Only show if `weapons.length > 1`
- [ ] Wire to `swapWeapon()` from combatStore
- [ ] Add cycling logic (next weapon in array)

### Phase 7: Character Sheet - Item Usage
- [ ] Add "Use" buttons to consumables section
- [ ] Implement `canUseItem()` helper (context-based restrictions)
- [ ] Implement `getItemDisabledReason()` helper
- [ ] Implement `handleUseItem()` (apply effect, decrement quantity, update store)
- [ ] Add disabled states with tooltips

### Phase 8: Character Sheet - Weapon Equipping
- [ ] Add weapons section to Equipment tab
- [ ] Add "Equip" buttons to each weapon
- [ ] Implement `hasWeaponProficiency()` helper
- [ ] Implement `handleEquipWeapon()` (equip, recalculate AC, update store)
- [ ] Show proficiency warnings for non-proficient items
- [ ] Disable "Equip" for already-equipped or non-proficient items

### Phase 9: Testing
- [ ] Run all tests: `npm test`
- [ ] Fix any failing tests
- [ ] Verify test coverage for new features
- [ ] Manual testing: use items in combat, swap weapons, equip from sheet

### Phase 10: Polish & Integration
- [ ] Verify combat log messages formatting
- [ ] Test on mobile (thumb-friendly buttons)
- [ ] Test Items popover on small screens
- [ ] Verify weapon swap updates stats in real-time
- [ ] Test out-of-combat item usage
- [ ] Test proficiency restrictions
- [ ] Run `npm run build` and `npm run lint`

---

## Future Enhancements (Out of Scope)

- Armor swapping system (separate `armors[]` array, swap button)
- Weapon-specific fumble effects
- Item crafting/combining
- Inventory weight limits
- Quick item slots (hotbar)
- Item tooltips with full descriptions
- Throwable items (damage enemy directly)
- Buff item duration tracking
- Equipment sets with bonuses

---

## Success Metrics

- [ ] Player can use healing potion via Items button in combat
- [ ] Player can use healing potion via character sheet (in/out of combat)
- [ ] Healing potion rolls 2d8+2 and applies healing correctly
- [ ] Item quantity decrements after use
- [ ] Item removed when quantity = 0
- [ ] Player can swap weapons via swap button (cycles through all weapons)
- [ ] Player can equip weapons via character sheet
- [ ] Proficiency restrictions prevent equipping non-proficient weapons
- [ ] Combat log shows item usage and weapon swaps with detailed feedback
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Build succeeds (`npm run build`)
- [ ] Lint succeeds (`npm run lint`)
