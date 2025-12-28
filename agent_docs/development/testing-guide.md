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

**MANDATORY: Use TodoWrite when writing tests for complex features**

Before writing each test, create todos for:
- [ ] Identify the user-observable outcome to test (HP change, attack miss, etc.)
- [ ] Set up test scenario (character stats, enemy stats, conditions)
- [ ] Mock dice/external dependencies to create deterministic scenario
- [ ] Call the function being tested
- [ ] Assert on BEHAVIOR (damage taken, attacks missed, etc.)
- [ ] Assert on SIDE EFFECTS only if observable (log messages users see)
- [ ] Verify test FAILS when feature is broken (comment out fix, test should fail)
- [ ] Run test to confirm it passes

Before submitting code:

- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Edge cases are covered
- [ ] Tests have descriptive names
- [ ] Mock external dependencies
- [ ] Tests are fast and focused
- [ ] Tests don't rely on implementation details

**Red Flag Check:**
- If your test checks `expect(result.someFlag).toBe(true)`, ask: "Would this test pass if the feature was completely broken?"
- If yes, you're testing implementation. Rewrite to test observable behavior.

## Behavioral Test Template

**Copy this template when testing game mechanics:**

```typescript
it('should [observable outcome] when [scenario]', () => {
  // 1. Setup: Create scenario with specific stats
  const character = createTestCharacter({
    ac: 14,        // Specific value for this test
    hp: 20,        // Enough to detect damage
    // ... other relevant stats
  });
  const enemy = createTestEnemy({ hp: 20 });

  const state: CombatState = {
    turn: 1,
    playerCharacter: character,
    enemy,
    // ... minimal required state
  };

  // 2. Mock: Create deterministic scenario
  vi.mocked(rollAttack).mockReturnValue({
    total: 16,      // Specific value to test boundary (e.g., hits AC 14, misses AC 18)
    d20Result: 14,
    output: '1d20+2: [14]+2 = 16',
  });
  vi.mocked(rollDamage).mockReturnValue({
    total: 5,
    output: '1d8+2: [3]+2 = 5',
  });

  // 3. Execute: Call the function
  const result = resolveCombatRound(state, action);

  // 4. Assert BEHAVIOR (what user experiences):
  expect(result.playerCharacter.hp).toBe(20);  // ✅ Observable: HP unchanged
  expect(result.log.some(entry => entry.message.includes('MISS'))).toBe(true);  // ✅ Observable: Log shows miss

  // 5. Optional: Assert side effects only if user-visible
  expect(result.log.some(entry => entry.message.includes('your ability triggers'))).toBe(true);  // ✅ User sees message

  // ❌ DON'T: Assert internal state that users never see
  // expect(result.someInternalFlag).toBe(true);  // User doesn't see flags!
  // expect(result.bonusValue).toBe(2);           // User doesn't see internal values!
});
```

**The Test Must Answer: "If I break the feature, will this test catch it?"**

## Behavior vs Implementation Testing

**Critical Principle: Test Observable Outcomes, Not Internal State**

### The Problem

Tests can pass while features are broken if you only test implementation details:

```typescript
// ❌ BAD - Tests implementation (flag is set)
test('start-hidden quirk sets playerHidden flag', () => {
  const result = applyQuirk(player, 'start-hidden');
  expect(result.playerHidden).toBe(true); // ✓ Passes
});

// But in actual gameplay: Enemy still hits the player!
// The test passed, but the feature doesn't work.
```

### The Solution

Test the **observable behavior** that users experience:

```typescript
// ✅ GOOD - Tests behavior (attacks actually miss)
test('start-hidden quirk makes enemy attacks miss', () => {
  const rogue = { ...player, startingQuirk: 'start-hidden' };

  // Simulate enemy attack that would normally hit
  mockAttackRoll(16); // 16 vs base AC 14 = hit

  const combat = startCombat(rogue, enemy);
  const result = resolveEnemyAttack(combat);

  // With Hidden +4 AC bonus, 16 vs 18 = miss
  expect(result.playerHP).toBe(rogue.hp); // No damage taken
  expect(result.log).toContain('MISS');   // Attack missed
});
```

### What to Test

| ❌ Implementation Details | ✅ Observable Behavior |
|---------------------------|------------------------|
| `playerHidden === true` | Enemy attacks miss more often |
| `quirkTriggered === true` | Quirk only fires once per combat |
| `acBonus === 2` | Attack that should hit actually misses |
| `playerHp === 9` | Character survives with 1 HP |

### When Implementation Testing Fails

**Case Study: Hidden Quirk Bug**

We had comprehensive tests for the hidden quirk:
- ✓ Quirk utility returns `playerHidden: true`
- ✓ Combat state stores `playerHidden: true`
- ✓ Integration test verifies flag is set

**All tests passed. Feature was completely broken.**

Why? We never tested that enemies actually missed! The `playerHidden` flag was set but never **used** in attack resolution.

**What we should have tested:**
1. Setup: Rogue with Hidden condition (AC 14 + 4 = 18)
2. Enemy attacks with roll of 16
3. Assert: Attack misses (16 < 18)
4. Assert: Player takes no damage

This would have caught the bug immediately.

### Guidelines

**Test Observable Outcomes:**
- HP changes from healing/damage
- Attacks hitting or missing based on modifiers
- Actions being blocked/allowed
- Log messages appearing
- Combat ending with correct winner

**Use Implementation Tests Sparingly:**
- Internal state that **directly affects** behavior
- Intermediate calculations you need to debug
- State transitions that are hard to observe externally

**Red Flag:** If your test mocks the thing you're testing, you're probably testing implementation.

## Common Testing Pitfalls

**Avoid**:
- Testing implementation details instead of behavior ⚠️ **MOST COMMON ERROR**
- Writing tests that are coupled to component structure
- Testing third-party library code
- Skipping edge cases
- Overly complex test setups
- Mocking so much that tests become meaningless

**Prefer**:
- Testing public API and expected behavior
- Simple, focused tests with minimal mocking
- Testing edge cases and error conditions
- Clear test names that describe **user-visible outcomes**
- Integration tests over unit tests when behavior spans multiple functions
