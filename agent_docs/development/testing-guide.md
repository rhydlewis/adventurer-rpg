# Testing Guide

## Testing Philosophy

- **Test game mechanics, not UI** - Focus on `/utils` functions
- **Test edge cases** - Zero HP, max stats, critical hits, save failures
- **Use descriptive test names** - Make failures self-explanatory
- **Write tests first** - TDD works well for game mechanics
- **Mock dice rolls when needed** - For deterministic tests

## Test Structure

Tests are located in `src/__tests__/` following the same directory structure as the source.

```
src/
  utils/
    combat.ts
  __tests__/
    utils/
      combat.test.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm test combat.test.ts
```

## Writing Good Tests

### Descriptive Test Names

```typescript
// ❌ Poor
test('attack works', () => { ... });

// ✅ Good
test('rollAttack should add BAB and ability modifier to d20 result', () => { ... });
test('rollAttack should return miss when result is below target AC', () => { ... });
test('rollAttack should return critical hit on natural 20', () => { ... });
```

### Testing Pure Functions

```typescript
import { calculateModifier } from '@/utils/attributes';

describe('calculateModifier', () => {
  test('should return +4 for attribute score of 18', () => {
    expect(calculateModifier(18)).toBe(4);
  });

  test('should return -1 for attribute score of 8', () => {
    expect(calculateModifier(8)).toBe(-1);
  });

  test('should return 0 for attribute score of 10', () => {
    expect(calculateModifier(10)).toBe(0);
  });
});
```

### Testing with Mock Data

```typescript
import { resolveCombatRound } from '@/utils/combat';
import type { CombatState, Character } from '@/types';

describe('resolveCombatRound', () => {
  const mockPlayer: Character = {
    id: 'player-1',
    name: 'Test Fighter',
    attributes: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 10 },
    // ... other required fields
  };

  const mockEnemy: Character = {
    id: 'enemy-1',
    name: 'Test Goblin',
    // ... fields
  };

  test('should reduce enemy HP when player hits', () => {
    const initialState: CombatState = {
      player: mockPlayer,
      enemy: mockEnemy,
      turn: 1,
      log: [],
      winner: null,
    };

    // Mock dice to guarantee hit
    vi.mock('@/utils/dice', () => ({
      rollAttack: () => ({ total: 20, /* ... */ }),
      rollDamage: () => ({ total: 8, /* ... */ }),
    }));

    const result = resolveCombatRound(initialState);
    expect(result.enemy.currentHp).toBeLessThan(initialState.enemy.currentHp);
  });
});
```

## Testing Patterns

### Test Edge Cases

Always test boundary conditions:

```typescript
describe('character HP', () => {
  test('should not reduce HP below 0', () => { ... });
  test('should not increase HP above maximum', () => { ... });
  test('should handle exactly 0 HP', () => { ... });
});

describe('dice rolls', () => {
  test('should handle natural 1', () => { ... });
  test('should handle natural 20', () => { ... });
  test('should handle maximum damage roll', () => { ... });
  test('should handle minimum damage roll', () => { ... });
});
```

### Test State Immutability

```typescript
test('should not mutate original state', () => {
  const originalState = { /* ... */ };
  const stateCopy = { ...originalState };
  
  const newState = someUtilityFunction(originalState);
  
  // Original should be unchanged
  expect(originalState).toEqual(stateCopy);
  // New state should be different
  expect(newState).not.toBe(originalState);
});
```

### Mock External Dependencies

```typescript
import { vi } from 'vitest';

// Mock dice rolls for deterministic tests
vi.mock('@/utils/dice', () => ({
  rollAttack: vi.fn(() => ({ total: 15, d20: 12, modifier: 3 })),
  rollDamage: vi.fn(() => ({ total: 6, rolls: [4], modifier: 2 })),
}));
```

## Testing Stores

For Zustand stores, test the underlying utility functions, not the store itself:

```typescript
// ✅ Test the utility
import { addItemToInventory } from '@/utils/inventory';

test('addItemToInventory should append new item', () => {
  const items = [{ id: '1', name: 'Sword' }];
  const newItem = { id: '2', name: 'Shield' };
  
  const result = addItemToInventory(items, newItem);
  
  expect(result).toHaveLength(2);
  expect(result[1]).toEqual(newItem);
});
```

## Testing Checklist

Before submitting code:

- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Edge cases are covered
- [ ] Tests have descriptive names
- [ ] Mock external dependencies
- [ ] Tests are fast and focused
- [ ] Tests don't rely on implementation details

## Common Testing Pitfalls

**Avoid**:
- Testing implementation details instead of behaviour
- Writing tests that are coupled to component structure
- Testing third-party library code
- Skipping edge cases
- Overly complex test setups

**Prefer**:
- Testing public API and expected behaviour
- Simple, focused tests
- Testing edge cases and error conditions
- Clear test names that describe expectations
