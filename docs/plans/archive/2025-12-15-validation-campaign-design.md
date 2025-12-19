# Validation Campaign - Mechanical Testing Design

## Document Overview

**Purpose:** Design a focused validation campaign to test critical game mechanics before building the full "Spire of the Lich King" campaign.

**Status:** 🟢 APPROVED - Ready for Implementation

**Created:** 2025-12-15

---

## Overview and Goals

### Purpose

Transform test-campaign validation approach from narrative demonstration into a **mechanical validation harness** that proves all critical systems work before building the full campaign.

### Validation Priorities

1. **Narrative structure**: Multi-outcome exploration as player choice
2. **Progression**: Inventory/gold/merchants + milestone-based leveling
3. **Combat polish**: Retreat, feedback/juice, in-combat items
4. **Character creation**: Two-phase system with quirk discovery

### Success Criteria

After playing validation-campaign, you should have confidence that:

- Exploration feels rewarding and optional
- Inventory/gold/merchant flow works smoothly
- Leveling at milestones creates satisfying progression
- Retreat mechanics provide difficulty escape valve
- Two-phase character creation delivers identity quickly
- Combat feels dynamic with taunts/effects/items

### Structure

**Linear sequence** of ~8 story nodes, each designed to test 1-2 specific systems.

**Total playtime:** 15-20 minutes (fast iteration for testing)

**Campaign file:** `src/data/campaigns/validation-campaign.ts` (new file, keeps existing test-campaign.ts intact)

---

## Critical Path Flow

### Node Sequence

**Node 1: Character Creation**
- **Test:** Phase 1 creation (class → background → trait → avatar)
- **Output:** Character with starting quirk, pre-filled attributes
- **Time:** 30 seconds
- **Node ID:** `validation-char-creation`

**Node 2: First Combat (Goblin)**
- **Test:** Starting quirk triggers, basic combat, enemy taunts, strike effects
- **Output:** Victory gives 50 gold + healing potion
- **Note:** No retreat option (tutorial fight, `canRetreat: false`)
- **Node ID:** `validation-first-combat`

**Node 3: Exploration Choice**
- **Test:** "Explore the forest / Continue on path"
- **Exploration table:**
  - 60% Wolf fight (30g + random item)
  - 20% Treasure chest (50g + 2 items)
  - 10% Atmospheric vignette (flavor text only)
  - 10% Nothing ("You find an empty clearing")
- **Output:** Demonstrates optional content, risk/reward
- **Node ID:** `validation-exploration-choice`

**Node 4: Merchant**
- **Test:** Browse inventory, buy/sell items
- **Shop inventory:**
  - Healing Potion (50g) - restores 2d8+2 HP
  - +1 Sword (100g) - +1 attack and damage
  - Antidote (30g) - removes poison condition
- **Output:** Gold economy works, inventory management feels smooth
- **Node ID:** `validation-merchant`

**Node 4b: Phase 2 Unlock**
- **Trigger:** Immediately after merchant interaction
- **Test:** Point-buy customization, skill allocation, feat selection
- **UI prompt:** "You've proven yourself in battle and trade. Refine your abilities?"
- **Output:** Character mechanics locked in, player feels ownership
- **Timing:** ~5-7 minutes into playthrough

**Node 5: Second Combat (Skeleton)**
- **Test:** Retreat option, in-combat item use (healing potion), enemy taunts
- **Retreat penalty:** Lose 20 gold, take 5 damage, set flag `fled_from_skeleton`
- **Output:** If retreat → return to safe node. If fight → harder combat, better loot (80g + rare item)
- **Node ID:** `validation-second-combat`

**Node 6: Story Milestone (Level Up)**
- **Test:** Level up to level 2 (story-triggered, not XP-based)
- **Output:** +HP, +BAB, choose 1 feat from 3 options
- **Narrative:** "Your trials have made you stronger. Choose how you've grown."
- **Node ID:** `validation-levelup`

**Node 7: Final Combat (Wraith)**
- **Test:** All systems together (level 2 abilities, items, retreat option, full combat)
- **Difficulty:** CR 1 (challenging but winnable with items/abilities)
- **Output:** Victory gives special reward (100g + unique item), validates difficulty curve
- **Node ID:** `validation-final-combat`

**Node 8: End Summary**
- **Display:**
  - Total gold earned
  - Items collected
  - Choices made (explored? retreated? Phase 2 customized?)
  - Systems tested checklist
- **Feedback prompt:** "What felt good? What needs work?"
- **Node ID:** `validation-end`

---

## System Implementation

### Exploration Mechanics

**New Type Required** (`types/narrative.ts`):

```typescript
export type ExplorationOutcome =
  | { type: 'combat'; enemyId: string; goldReward: number; itemReward?: string }
  | { type: 'treasure'; gold: number; items: string[] }
  | { type: 'vignette'; description: string; flavorOnly: true }
  | { type: 'nothing'; message: string };

export interface ExplorationTable {
  locationId: string;
  encounters: {
    weight: number; // 60 for combat, 20 for treasure, etc.
    outcome: ExplorationOutcome;
  }[];
}
```

**New Choice Outcome Type** (`types/narrative.ts`):

```typescript
export type ChoiceOutcome =
  // ... existing outcomes
  | { type: 'explore'; tableId: string; onceOnly: boolean };
```

**Resolution Logic** (`utils/exploration.ts` - new file):

```typescript
export function resolveExploration(
  tableId: string,
  worldState: WorldState
): ExplorationOutcome {
  // 1. Load exploration table by ID
  // 2. Roll d100
  // 3. Compare to cumulative weights (0-60 = combat, 61-80 = treasure, 81-90 = vignette, 91-100 = nothing)
  // 4. Return outcome
}
```

**Flow:**
- Player chooses exploration → roll d100
- If combat: trigger fight, on victory give rewards, return to parent node with "Explore" greyed out
- If treasure: add gold/items to inventory, log message, return
- If vignette: show atmospheric text, return
- If nothing: "You find nothing of interest", return

**Test Data Needed:**

```typescript
// data/explorationTables.ts
export const FOREST_EXPLORATION: ExplorationTable = {
  locationId: 'validation-forest',
  encounters: [
    { weight: 60, outcome: { type: 'combat', enemyId: 'wolf', goldReward: 30, itemReward: 'wolf-pelt' } },
    { weight: 20, outcome: { type: 'treasure', gold: 50, items: ['healing-potion', 'antidote'] } },
    { weight: 10, outcome: { type: 'vignette', description: 'You find ancient carvings on a tree...', flavorOnly: true } },
    { weight: 10, outcome: { type: 'nothing', message: 'You find an empty clearing. Nothing of interest here.' } }
  ]
};
```

---

### Progression Mechanics

#### Inventory & Gold System

**Add to `types/character.ts`:**

```typescript
export interface Character {
  // ... existing fields
  gold: number;
  inventory: InventoryItem[];
  maxInventorySlots: number; // e.g., 10
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'equipment' | 'quest';
  usableInCombat: boolean;
  effect?: ItemEffect;
  value: number; // sell price (typically 50% of buy price)
}

export type ItemEffect =
  | { type: 'heal'; amount: string } // "2d8+2"
  | { type: 'buff'; stat: string; bonus: number; duration: number }
  | { type: 'damage'; amount: string }; // throwable items
```

#### Merchant System

**New Choice Outcome Type:**

```typescript
export type ChoiceOutcome =
  // ... existing outcomes
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number> };
```

**New Utils File** (`utils/merchant.ts`):

```typescript
export function buyItem(character: Character, itemId: string, price: number): Character {
  // 1. Check gold >= price
  // 2. Check inventory not full
  // 3. Deduct gold, add item to inventory
  // 4. Return updated character
}

export function sellItem(character: Character, itemId: string): Character {
  // 1. Find item in inventory
  // 2. Add item.value to gold
  // 3. Remove item from inventory
  // 4. Return updated character
}
```

#### Leveling System

**New Node Effect Type:**

```typescript
export type NodeEffect =
  // ... existing effects
  | { type: 'levelUp'; newLevel: number; featChoices: string[] };
```

**Level Up Flow:**
1. Node triggers `levelUp` effect
2. UI shows level-up screen:
   - HP increase (displayed)
   - BAB increase (displayed)
   - Save bonuses (displayed)
   - **Choose 1 feat** from provided options
3. Player selects feat
4. Character updated with new level, feat applied
5. Continue to next node

**Feat Selection (Interactive):**

Validation campaign provides 3 feat options at level 2:
- **Power Attack**: Trade attack bonus for extra damage
- **Improved Initiative**: +4 to initiative rolls
- **Weapon Focus**: +1 to attack rolls with chosen weapon type

**Key Design Decision:** Leveling is **interactive** (player chooses feat) rather than automatic. Validates level-up UI and choice meaningfulness.

---

### Combat Polish

#### Retreat Mechanics

**Add to `types/combat.ts`:**

```typescript
export interface CombatState {
  // ... existing fields
  canRetreat: boolean; // tutorial fights disable this
  retreatPenalty?: {
    goldLost: number;
    damageOnFlee: number;
    narrativeFlag?: string; // "fled_from_skeleton"
  };
}
```

**New Combat Action:**

```typescript
export type CombatAction =
  | { type: 'attack' }
  | { type: 'defend' }
  | { type: 'spell'; spellId: string }
  | { type: 'item'; itemId: string }
  | { type: 'retreat' }; // NEW
```

**Retreat Flow:**
1. Player clicks "Retreat" button (only visible if `canRetreat: true`)
2. Apply penalties: deduct gold, apply damage, set flag
3. Exit combat, return to safe node (defined in combat setup)
4. Combat log: "You flee from battle! (-20 gold, -5 HP)"

**Design Note:** Retreat is NOT a skill check (guaranteed success) but has meaningful penalties. Prevents soft-locks on hard fights.

#### Combat Feedback/Juice

**Add to `types/combat.ts`:**

```typescript
export interface CombatLogEntry {
  actor: 'player' | 'enemy' | 'system';
  message: string;
  taunt?: string; // "The goblin sneers: 'Is that all you've got?'"
  visualEffect?: 'strike-flash' | 'critical-hit' | 'heal-glow' | 'miss-fade';
}
```

**Enemy Taunts:**

Defined per enemy type in `data/creatures.ts`:

```typescript
export const GOBLIN: Creature = {
  // ... existing stats
  taunts: {
    onCombatStart: ["You'll regret crossing me!", "Fresh meat!"],
    onPlayerMiss: ["Too slow!", "Hah! Missed!"],
    onEnemyHit: ["How'd you like that?", "You're finished!"],
    onLowHealth: ["I'll... get you...", "This isn't over!"]
  }
};
```

**Taunt Trigger Chances:**
- Combat start: 50%
- Player miss: 30%
- Enemy successful hit: 20%
- Enemy below 25% HP: 40%

**Visual Effects:**

Triggered in UI via `visualEffect` field:
- `strike-flash`: Red flash on avatar when hit
- `critical-hit`: Gold flash + shake animation
- `heal-glow`: Green pulse on HP restoration
- `miss-fade`: Grey fade on missed attack

#### In-Combat Item Use

**Items with `usableInCombat: true`** appear as combat actions.

**Flow:**
1. Player clicks "Items" in combat UI
2. Show inventory filtered to `usableInCombat: true` items
3. Player selects item (e.g., Healing Potion)
4. Item effect applied immediately:
   - Healing Potion: restore 2d8+2 HP, remove item from inventory
   - Antidote: remove poison condition, remove item
5. Consumes player's turn (like casting a spell)
6. Combat log: "You drink a healing potion. (+12 HP)"

**Tactical Decision:** Use item now vs. save for later? Risk missing attack to heal?

---

### Character Creation Integration

#### Phase 1: Identity-First Creation

**New Data Files Needed:**

1. **`data/backgrounds.ts`** - 4 backgrounds (from character creation revised design)
   - Border Guard (Fighter)
   - Street Urchin (Rogue)
   - Academy Dropout (Wizard)
   - Temple Acolyte (Cleric)

2. **`data/traits.ts`** - 3 defining traits
   - Bold (+2 initiative, -2 AC if acting last)
   - Cautious (+2 AC, -2 initiative)
   - Silver-Tongued (+2 Charisma checks, NPC hostility escalates on failure)

3. **`data/quirks.ts`** - 4 starting quirks
   - Auto-block first attack (Fighter)
   - Start hidden (Rogue)
   - Bonus cantrip turn 1 (Wizard)
   - Healing aura (Cleric)

**Add to `types/character.ts`:**

```typescript
export interface Character {
  // ... existing fields
  background: Background;
  trait: DefiningTrait;
  avatar: string; // asset path
  startingQuirk: StartingQuirk;
  mechanicsLocked: boolean; // false until Phase 2 complete
}
```

**UI Flow (Phase 1):**

1. Choose class (Fighter/Rogue/Wizard/Cleric) - visual cards
2. Choose background (1 per class, shows quirk preview)
3. Choose defining trait (shows trade-off explicitly)
4. Choose avatar (4-6 portraits per class)
5. Enter name (optional, can skip)
6. **Total time:** <30 seconds

**Quirk Discovery:**

First combat triggers quirk via `utils/quirks.ts::applyStartingQuirk()`:

```typescript
export function applyStartingQuirk(
  character: Character,
  combat: CombatState,
  trigger: 'combat-start' | 'turn-1' | 'first-attack'
): CombatState {
  // Check character.startingQuirk
  // Apply appropriate effect based on trigger
  // Add discovery message to combat log
  // Return updated combat state
}
```

**Example Discovery:**
- Goblin attacks Fighter
- Combat log: "Your guard training kicks in—you deflect the blow! (+2 AC)"
- Player discovers quirk naturally, no pre-explanation

#### Phase 2: Mechanical Customization

**Unlocks at Node 4b** (after merchant, ~5 minutes into playthrough)

**UI Flow:**

1. Show current attributes (pre-filled from background bias)
2. Allow point-buy override (28-point buy, same as Phase 1 plan)
3. Allocate skill points (tagged skills from background highlighted)
4. Choose 1 feat from available list (level 1 feats)
5. Lock mechanics (`mechanicsLocked = true`)

**Design Note:** Phase 2 is **refinement, not contradiction**. Background suggestions are sensible defaults. Players can accept defaults ("Use Recommended Build") or customize.

**Validation Goal:** Does Phase 2 feel like building on Phase 1 identity, or does it feel like starting over?

---

## Test-Campaign vs Validation-Campaign

### Keep Both Campaigns

**Current `test-campaign.ts`:**
- Purpose: Narrative/type system demonstration
- Structure: ~23 nodes with branching story
- Tests: Story nodes, dialogue, skill checks, combat integration, requirements
- **Keep as-is** (already serves its purpose)

**New `validation-campaign.ts`:**
- Purpose: Mechanical validation harness
- Structure: 8-node critical path
- Tests: Exploration, progression, combat polish, character creation
- **Build new** (focused validation before full campaign)

Both campaigns selectable from campaign menu.

### Validation Campaign Data Requirements

**New files to create:**

1. **`src/data/campaigns/validation-campaign.ts`**
   - Campaign definition
   - 8 story nodes (as defined in Critical Path Flow)
   - Acts structure (single act for simplicity)

2. **`src/data/explorationTables.ts`**
   - Forest exploration table (1 entry for validation)

3. **Enemy definitions** (if not already in `src/data/creatures.ts`):
   - Goblin (CR 1/4)
   - Skeleton (CR 1/2)
   - Wraith (CR 1)
   - Each with taunt tables

4. **Item definitions** (if not already in `src/data/items.ts`):
   - Healing Potion (consumable, 2d8+2 heal, 50g)
   - +1 Sword (equipment, +1 attack/damage, 100g)
   - Antidote (consumable, remove poison, 30g)
   - Wolf Pelt (quest item, 15g sell value)

5. **Feat definitions** (`src/data/feats.ts` - may need to create):
   - Power Attack
   - Improved Initiative
   - Weapon Focus

**Estimated build time:** ~8-10 hours (assuming systems are built, just wiring data + nodes)

---

## Testing Strategy

### Phase 1: Build Systems with Unit Tests

**New utils files to create:**

1. **`utils/exploration.ts`**
   - `resolveExploration()` - roll encounter table
   - Unit test: weights add to 100, outcomes match table

2. **`utils/merchant.ts`**
   - `buyItem()`, `sellItem()`
   - Unit test: gold deduction, inventory changes, edge cases (not enough gold, full inventory)

3. **`utils/retreat.ts`** (or extend `utils/combat.ts`)
   - `handleRetreat()` - apply penalties, exit combat
   - Unit test: gold lost, damage applied, flags set

4. **`utils/levelUp.ts`**
   - `applyLevelUp()` - increase stats, apply feat
   - Unit test: HP increase correct, feat effects applied

5. **`utils/quirks.ts`**
   - `applyStartingQuirk()` - trigger quirk effects
   - Unit test: each quirk triggers correctly on appropriate trigger

**Testing Principle:** Build each system with tests BEFORE wiring to campaign.

### Phase 2: Wire Validation Campaign

**Steps:**
1. Create `validation-campaign.ts` with 8 nodes
2. Wire exploration to Node 3
3. Wire merchant to Node 4
4. Wire Phase 2 unlock to Node 4b
5. Wire retreat to Node 5
6. Wire level-up to Node 6
7. Test full playthrough manually

### Phase 3: Playtest & Validate

**Playtest the validation campaign and answer these questions:**

#### Exploration
- ✅ Does "Explore" feel rewarding enough to choose?
- ✅ Does 60/20/10/10 distribution feel right, or should combat be less common?
- ✅ Is finding "nothing" frustrating or acceptably risky?
- ✅ Can encounter percentages be tuned easily (data-driven)?

#### Progression
- ✅ Does gold economy feel balanced? (Earn ~150g, spend ~100g in one playthrough)
- ✅ Can you afford 1-2 shop items without grinding?
- ✅ Does inventory management feel smooth or tedious?
- ✅ Does level-up feel impactful (stats + feat choice)?
- ✅ Does hybrid model work (exploration → loot, story → XP)?

#### Combat
- ✅ Does retreat provide difficulty escape valve without feeling exploitable?
- ✅ Are retreat penalties meaningful (20g + 5 damage)?
- ✅ Do enemy taunts add flavor without being annoying?
- ✅ Do strike effects make hits feel impactful?
- ✅ Does in-combat item use create tactical decisions?

#### Character Creation
- ✅ Does Phase 1 create identity in <30 seconds?
- ✅ Does starting quirk discovery feel rewarding (not explained, discovered)?
- ✅ Does Phase 2 unlock timing feel natural (~5 minutes in)?
- ✅ Does customization feel like refinement, not contradiction of Phase 1?

---

## Success Metrics

### Quantitative Metrics

After 5 playtests of validation campaign:

- **Time to complete:** 15-20 minutes
- **Gold earned:** 130-180g (varies with exploration choices)
- **Gold spent:** 50-150g (player choice)
- **Level achieved:** Level 2 (100% of playthroughs)
- **Retreat usage:** 0-30% of players (should be available, not required)
- **Exploration participation:** 50%+ of players should explore at least once
- **Phase 2 customization:** 70%+ should engage with customization (not just accept defaults)

### Qualitative Validation

You should be able to answer **"yes, confident"** to these:

**Exploration:**
- I know how to design exploration tables for full campaign
- I can balance risk/reward for exploration encounters
- I can integrate exploration into story without breaking pacing

**Progression:**
- I can balance gold economy for a 1-2 hour campaign
- I know what items to offer in shops and when
- I understand how milestone leveling paces progression
- I can design meaningful level-up choices

**Combat:**
- I can tune difficulty knowing retreat is available
- I know when to enable/disable retreat (tutorial fights off, boss fights on)
- I can write enemy taunts that add flavor without annoyance

**Character Creation:**
- I trust Phase 1 creates identity quickly on mobile
- I know quirks will feel impactful without explanation
- I understand when to unlock Phase 2 in full campaign
- I can design backgrounds/traits that touch all 3 pillars (combat, dialogue, puzzles)

**Integration:**
- All systems work together without conflicts
- Pacing feels good (variety, not repetitive)
- Systems enhance story, not distract from it

---

## Next Steps After Validation

### Step 1: Tune Based on Feedback

After playtesting validation campaign:

1. **Adjust percentages** (exploration table weights, retreat penalties, gold rewards)
2. **Refine UI** (combat feedback, merchant interface, level-up screen)
3. **Balance economy** (item prices, gold drops, merchant inventory)
4. **Polish systems** (taunt frequency, strike effects, quirk timing)

### Step 2: Integrate into Full Campaign Design

With validated systems, update full campaign spec:

1. **Map exploration opportunities** across 5 locations (where can player explore?)
2. **Design merchant locations** (Oakhaven village tavern, Tower merchant, safe rooms)
3. **Plan level-up milestones** (end of Act 1, Act 2, Act 3, Act 4 = levels 2, 3, 4, 5)
4. **Tune retreat availability** (enable for most fights, disable for story beats)
5. **Design enemy variety** (mix easy/medium/hard, different taunts per enemy type)

### Step 3: Write Full Campaign with Confidence

Begin "Spire of the Lich King" campaign knowing:
- Mechanics are proven
- Balance is tuned
- Player experience is validated
- Systems integrate smoothly

**Confidence level:** High enough to commit to writing ~2 hours of narrative content around these systems.

---

## Summary

**Validation campaign** is a **15-20 minute critical path** that tests:
1. Multi-outcome exploration (60/20/10/10 encounters)
2. Inventory, gold, and merchant system
3. Milestone leveling with feat selection
4. Retreat, taunts, strike effects, in-combat items
5. Two-phase character creation with quirk discovery

**8-node structure** systematically validates each system before full campaign.

**Success:** After playtest, answer "yes, confident" to all validation questions.

**Next:** Tune systems, integrate into full campaign design, write "Spire of the Lich King" with confidence.

---

## Related Documents

- **Original Design Spec:** `/docs/specs/2025-12-08-design-spec.md`
- **Character Creation Revised:** `/docs/specs/2025-12-14-character-creation-revised-design.md`
- **Phase 1 Plan:** `/docs/plans/2025-12-09-phase-1.md`
- **Campaign 1 Spec:** `/docs/campaigns/2025-12-08-campaign-1.md`
- **Current Test Campaign:** `/src/data/campaigns/test-campaign.ts`

---

**Document Status:** ✅ Approved and ready for implementation

**Estimated Implementation Time:** 2-3 weeks (1 week systems, 1 week wiring, 1 week playtesting/tuning)

**Priority:** High - blocks full campaign development until validated
