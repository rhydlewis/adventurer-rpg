# State Management with Zustand

## Core Principles

- **Stores are simple and focused** - Each store manages a specific domain
- **State updates are immutable** - Utilities return new objects, stores replace state
- **No logic in stores** - Stores orchestrate utilities, they don't implement game logic
- **Pure functions in utils** - Game mechanics live in `/utils`, not stores

## Store Pattern

```typescript
const useCombatStore = create<CombatStore>((set) => ({
  combat: null,
  executeTurn: () => set((state) => ({
    combat: resolveCombatRound(state.combat)
  }))
}))
```

## Current Stores

**`combatStore`** - Manages active combat state (turn, HP, log, winner)

Reference the store files directly for implementation details.

## Best Practices

### Store Responsibilities

Stores should:
- Hold current state
- Expose methods to update state
- Call pure utility functions to calculate new state
- Replace state immutably

Stores should NOT:
- Implement game logic (belongs in `/utils`)
- Mutate state directly
- Make API calls (use utilities for side effects)
- Contain business rules

### Utility Responsibilities

Utilities (`/utils`) should:
- Implement game mechanics (combat, dice, saves, etc.)
- Return new state objects
- Be pure functions (same input = same output)
- Be easily testable

Utilities should NOT:
- Access Zustand stores
- Mutate input parameters
- Have side effects (except for explicitly async utilities)

## Adding New Stores

When creating a new store:

1. **Define the store interface** in a type file
2. **Create pure utility functions** for state calculations
3. **Implement the store** using `create<T>` pattern
4. **Write tests** for the utility functions
5. **Keep it simple** - stores are glue code, not logic

## State Structure

Design state to be:
- **Serialisable** - For saves, time travel debugging
- **Normalised** - Avoid duplication, use IDs for relationships
- **Immutable** - Never modify state directly
- **Flat when possible** - Deep nesting makes updates complex

## Example: Adding a New Store

```typescript
// 1. Define types (types/inventory.ts)
interface InventoryStore {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
}

// 2. Create utilities (utils/inventory.ts)
export function addItemToInventory(items: Item[], newItem: Item): Item[] {
  return [...items, newItem];
}

// 3. Implement store (stores/inventoryStore.ts)
export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: addItemToInventory(state.items, item)
  })),
  // ...
}))
```

## Testing Stores

- **Test utilities in isolation** - Don't test stores directly
- **Test state calculations** - Focus on the pure functions
- **Mock stores in component tests** - When testing UI
