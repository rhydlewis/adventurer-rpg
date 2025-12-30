# Bug: Finesse Weapons Always Use STR Instead of DEX

**Status:** Open
**Priority:** Medium
**Affects:** Combat system (v0.3.2)
**Reported:** 2025-12-29

## Description

Finesse weapons (e.g., dagger, rapier) are currently always using STR modifier for attack and damage rolls, even when the wielder has higher DEX. According to d20 rules, finesse weapons should allow the wielder to choose the better of STR or DEX.

## Expected Behavior

When attacking with a finesse weapon:
- Use **max(STR, DEX)** modifier for attack rolls
- Use **max(STR, DEX)** modifier for damage rolls
- The weapon's `finesse: true` property should trigger this behavior

## Current Behavior

All attacks use STR modifier regardless of weapon type:
```typescript
// combat.ts:57
const abilityMod = calculateModifier(attacker.attributes.STR);
```

## Example

**Wizard with Dagger:**
- STR 8 = -1 modifier
- DEX 14 = +2 modifier
- Weapon: Dagger (finesse: true)

**Current:** `1d20-1` (using STR)
**Expected:** `1d20+2` (should use DEX)

## Impact

- **Wizards** start with daggers but have low STR (8), making them unnecessarily weak in melee
- **Rogues** are designed around DEX-based combat and rely on finesse weapons
- Makes finesse weapons strictly worse than regular weapons for these classes

## Test Coverage

Currently **NO tests** verify finesse weapon behavior. New tests should be added to `combat.test.ts`:
- Attack with finesse weapon when DEX > STR (should use DEX)
- Attack with finesse weapon when STR > DEX (should use STR)
- Attack with non-finesse weapon (should always use STR)

## Proposed Fix

In `performAttack` function (`combat.ts`):

```typescript
// Determine which ability modifier to use
let abilityMod: number;
if (attacker.equipment.weapon?.finesse &&
    calculateModifier(attacker.attributes.DEX) > calculateModifier(attacker.attributes.STR)) {
  abilityMod = calculateModifier(attacker.attributes.DEX);
} else {
  abilityMod = calculateModifier(attacker.attributes.STR);
}
```

## Related Files

- `src/utils/combat.ts:57` - Where ability modifier is calculated
- `src/types/equipment.ts:10` - Weapon.finesse property definition
- `src/data/weapons.json` - Weapons with finesse property (dagger, rapier)
- `src/data/classes.ts:130` - Wizard starts with dagger

## References

- d20 SRD: Finesse weapons allow using DEX instead of STR for attack/damage
- [Pathfinder Finesse Rules](https://www.d20pfsrd.com/feats/combat-feats/weapon-finesse-combat/)
