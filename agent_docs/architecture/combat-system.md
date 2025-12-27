# Combat System Architecture

## Type System Layers

The type system is built in layers to ensure consistency:

1. **`types/entity.ts`** - Base Entity interface (shared by Character and Creature)
2. **`types/character.ts`** - Character extends Entity, adds class and background
3. **`types/creature.ts`** - Creature extends Entity, adds creatureClass and taunts
4. **`types/combat.ts`** - Combat state, initiative, conditions, and combat log
5. **`types/action.ts`** - Player action types (attack, use_ability, cast_spell, use_item)
6. **`types/condition.ts`** - Status effects with duration tracking

**Key Pattern**: The `Entity` interface is the single source of truth for derived stats (AC, HP, saves, attack bonuses). Both `Character` and `Creature` extend this base interface.

## Entity Base Structure

All combatants (players and enemies) share the same base stats via `Entity`:
- `attributes` - Six ability scores (STR, DEX, CON, INT, WIS, CHA)
- `hp`, `maxHp` - Current and maximum hit points
- `ac` - Armor Class (calculated during character creation)
- `bab` - Base Attack Bonus (from class and level)
- `saves` - Fortitude, Reflex, Will saves
- `equipment` - Weapons, armor, items
- `resources` - Spell slots and ability uses per day

Characters and Creatures extend this with class-specific properties:
- **Character**: `class` (Fighter/Rogue/Wizard/Cleric), `background`, `traits`, `gold`, `inventory`
- **Creature**: `creatureClass` (Beast/Humanoid/Undead), `taunts`, `lootTableId`

## Combat Flow

```
1. combatStore.startCombat(player, enemy)
   ↓
2. Roll initiative for both combatants (utils/initiative.ts::rollInitiative)
   ↓
3. Creates CombatState with initiative, turn=1, log=[], winner=null
   ↓
4. User selects action → combatStore.executeTurn(playerAction)
   ↓
5. utils/combat.ts::resolveCombatRound(state, playerAction)
   ├─→ Decrement player conditions (duration tracking)
   ├─→ Apply damage-over-time from conditions (Burning, Poisoned)
   ├─→ Handle player action:
   │   ├─→ attack: performAttack() with optional Power Attack modifiers
   │   ├─→ use_ability: Second Wind, Dodge, Channel Energy
   │   ├─→ cast_spell: castSpell() for cantrips/spells
   │   └─→ use_item: applyItemEffect() for consumables
   ├─→ Check for critical hits (natural 20), critical fumbles (natural 1)
   ├─→ Apply Sneak Attack bonus if Rogue and conditions met
   ├─→ Update HP, check for defeat
   ├─→ Decrement enemy conditions
   ├─→ Apply enemy damage-over-time
   ├─→ performAttack(enemy, player)
   └─→ Update HP, check for defeat, roll loot if enemy defeated
   ↓
6. Returns new CombatState with updated HP, conditions, log entries, winner
```

**Critical Pattern**: Combat utilities are pure functions that return new state. Never mutate state directly in utils - that's the store's job. The store calls utilities and replaces state immutably.

## Combat Actions

Players can perform different actions each turn:

1. **Attack** (`type: 'attack'`)
   - Standard melee attack with equipped weapon
   - Variant: Power Attack (optional `variant: 'power_attack'`)

2. **Use Ability** (`type: 'use_ability'`)
   - Fighter: Second Wind (heal 1d10 + level)
   - Rogue: Dodge (+4 AC until next turn)
   - Cleric: Channel Energy (heal 1d6 per 2 levels)

3. **Cast Spell** (`type: 'cast_spell'`)
   - Wizard/Cleric cantrips (unlimited use)
   - Leveled spells (consume spell slots)
   - Attack spells (Ray of Frost, Acid Splash)
   - Buff spells (Divine Favor, Resistance)

4. **Use Item** (`type: 'use_item'`)
   - Healing Potion, Antidote, Smoke Bomb (escape)

## Dice System

Uses `@dice-roller/rpg-dice-roller` library for advanced dice notation.

**Wrapper Pattern**: All dice rolling goes through `utils/dice.ts` wrappers (`rollAttack`, `rollDamage`, `roll`) which return structured objects with detailed output for combat logs. Never call the library directly from UI code.

Current dice notation:
- `roll('1d20+5')` - Attack roll (d20 + modifiers)
- `roll('1d8+3')` - Damage roll (weapon die + STR modifier)
- `roll('2d20kh1+5')` - Advantage (keep highest)
- `roll('2d20kl1+5')` - Disadvantage (keep lowest)
- `roll('2d8')` - Critical damage (double dice)

## Initiative System

Combat uses initiative to determine turn order:

1. Both combatants roll 1d20 + DEX modifier (`utils/initiative.ts`)
2. Highest total goes first
3. Turn order stored in `CombatState.initiative.order`
4. Initiative affects Sneak Attack eligibility (Rogues get bonus damage if they go first)

## Critical Hits and Fumbles

**Critical Hit** (natural 20):
- Always hits regardless of AC
- Double weapon damage dice (2d8 instead of 1d8)
- Modifiers NOT doubled (add once)

**Critical Fumble** (natural 1):
- Always misses regardless of roll total
- Roll fumble effect (`utils/criticals.ts::rollFumbleEffect`)
- Effects: drop weapon (lose turn), hit self (take damage), off-balance (-2 AC), opening (enemy free attack)

## Conditions System

Status effects with duration tracking (`utils/conditions.ts`):

**Buffs** (positive effects):
- Dodge (+4 AC for 1 turn)
- Divine Favor (+1 attack and damage for 1 turn)
- Resistance (+1 saves for 1 turn)

**Debuffs** (negative effects):
- Off-Balance (-2 attack for 1 turn)
- Stunned (cannot attack for 1 turn)
- Burning (1d4 fire damage per turn)
- Poisoned (1d3 poison damage per turn)

Conditions decrement at the start of each combatant's turn. Damage-over-time applies before actions.

## Spell System

Implemented in `utils/spellcasting.ts`. Key functions:

- `castSpell(caster, target, spell)` - Main spell casting function
- `getCastingAbilityModifier(entity)` - INT for Wizards, WIS for Clerics
- `getSpellAttackBonus(entity)` - BAB + casting modifier
- `getSpellSaveDC(spell, caster)` - 10 + spell level + casting modifier

**Spell Types**:
- **Attack spells**: Roll spell attack vs target AC (Ray of Frost, Acid Splash)
- **Save spells**: Target rolls saving throw vs DC (Daze)
- **Buff spells**: Apply condition to caster (Divine Favor, Resistance)
- **Healing spells**: Restore HP (Cure Light Wounds)

## Class Abilities

Implemented in `utils/classAbilities.ts`. Each class has unique mechanics:

**Fighter**:
- Second Wind: Heal 1d10 + level (1/day)
- Power Attack: -2 attack, +4 damage

**Rogue**:
- Sneak Attack: +1d6 damage when going first in initiative
- Dodge: +4 AC for 1 turn (1/day)

**Wizard**:
- Cantrips: Unlimited use attack spells (Ray of Frost, Acid Splash, Daze)
- Spell slots: Per-day resource for leveled spells

**Cleric**:
- Channel Energy: Heal 1d6 per 2 levels (3/day)
- Cantrips: Unlimited use utility spells (Resistance, Virtue)

## Extending Combat System

When adding new combat mechanics (new conditions, spells, abilities):

1. **Extend `CombatState` type** if needed (e.g., new tracking fields)
2. **Add calculation utilities** in `/utils` (`utils/newMechanic.ts`)
3. **Update `resolveCombatRound()`** to incorporate new mechanics
4. **Update combat log messages** to show new information
5. **Add UI controls** in CombatScreen for player interaction
6. **Write tests** for the new mechanics in `__tests__/utils/`

**Never break the walking skeleton** - new mechanics should be additive, not replace existing functionality.

## Combat Log Messages

Follow established format for consistency. Reference existing code in `utils/combat.ts` for current patterns.

**Actor types**:
- `player` - Player character actions and results (blue in UI)
- `enemy` - Enemy actions and results (red in UI)
- `system` - Combat events, condition changes, defeat messages (gray in UI)

**Taunts**: Creatures can have contextual taunts that display alongside combat messages:
- `onCombatStart` - When combat begins
- `onPlayerMiss` - When player attack misses
- `onEnemyHit` - When enemy successfully hits player
- `onLowHealth` - When enemy HP drops below 30%

## Retreat Mechanics

Players can retreat from combat (if allowed):

- **Retreat allowed by default** - Narrative nodes can disable via `canRetreat: false`
- **Retreat penalties** configured per combat:
  - Gold lost (default: 20)
  - Damage taken on flee (default: 5, minimum 1 HP remaining)
  - Narrative flag set (e.g., "fled_from_skeleton")
  - Safe node to return to
- **Implementation**: `combatStore.retreat()` and `utils/combat.ts::handleRetreat()`
