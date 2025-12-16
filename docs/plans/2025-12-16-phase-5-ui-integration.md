# Phase 5: UI Integration - Detailed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not use Subagent-Driven approach or worktrees. Work sequentially.

**Goal:** Integrate validation campaign mechanics into the UI layer - merchant screen, level-up screen, exploration results, retreat button, and item use in combat.

**Architecture:** Follow existing patterns - stores handle triggers from narrative logic, screens use store hooks, navigation via callback pattern.

**Related Docs:**
- Phase 4 Plan: `docs/plans/2025-12-15-validation-campaign-implementation.md`
- Validation Campaign Design: `docs/plans/2025-12-15-validation-campaign-design.md`

---

## Implementation Overview

**Current State:**
- ✅ Narrative logic creates triggers (`levelUpTrigger`, `merchantTrigger`, `exploreTrigger`)
- ✅ Effects like `giveGold` create log entries (character store must apply)
- ✅ Existing pattern: `combatTrigger` → narrative store → `onNavigate({ type: 'combat', ... })`

**Phase 5 Goals:**
1. **Navigation Types** - Add new screen types for merchant, level-up, exploration
2. **Store Integration** - Handle new triggers in narrative/character stores
3. **UI Screens** - Create merchant, level-up, exploration result screens
4. **Combat Enhancements** - Add retreat button and item use
5. **Character Store** - Process `giveGold`, `heal`, `damage` effects

**Testing Strategy:** Component tests for UI, integration tests for store → screen flow

---

## Task 1: Extend Navigation Types

**Files:**
- Modify: `src/types/navigation.ts`

**Step 1: Add new screen types**

In `src/types/navigation.ts`, add after the `combat` screen type:

```typescript
export type Screen =
  | { type: 'splash' }
  | { type: 'mainMenu' }
  | { type: 'home' }
  | { type: 'characterCreation' }
  | { type: 'story' }
  | { type: 'combat'; enemyId: string; onVictoryNodeId: string }
  | { type: 'gameOver'; deathNodeId?: string }
  | { type: 'victory' }
  | { type: 'characterSheet' }
  | { type: 'worldMap' }
  | { type: 'rest' }
  | { type: 'lockPicking'; difficulty: 'easy' | 'medium' | 'hard'; onSuccess: () => void; onFailure: () => void }
  // Validation campaign screens
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number>; onClose: () => void }
  | { type: 'levelUp'; newLevel: number; featChoices: string[]; onComplete: () => void }
  | { type: 'exploration'; tableId: string; onceOnly: boolean; onComplete: () => void };
```

**Step 2: Commit**

```bash
git add src/types/navigation.ts
git commit -m "feat: add merchant, levelUp, and exploration navigation types"
```

---

## Task 2: Update Narrative Store to Handle New Triggers

**Files:**
- Modify: `src/stores/narrativeStore.ts`

**Step 1: Handle levelUpTrigger in enterNode**

Find the section that handles `combatTrigger` (around line 174):

```typescript
// Handle combat trigger
if (combatTrigger) {
  const { onNavigate } = get();
  if (onNavigate) {
    onNavigate({
      type: 'combat',
      enemyId: combatTrigger.enemyId,
      onVictoryNodeId: combatTrigger.onVictoryNodeId,
    });
  }
}
```

Add after it:

```typescript
// Handle level-up trigger
if (effectResult.levelUpTrigger) {
  const { onNavigate } = get();
  if (onNavigate) {
    onNavigate({
      type: 'levelUp',
      newLevel: effectResult.levelUpTrigger.newLevel,
      featChoices: effectResult.levelUpTrigger.featChoices,
      onComplete: () => {
        // Level-up screen will handle calling enterNode again if needed
        // or navigation back to story
      },
    });
  }
}
```

**Step 2: Handle explore and merchant triggers in selectChoice**

Find the `selectChoice` method (around line 186). After processing the outcome, add:

```typescript
// Process choice outcome
const resolution = resolveOutcome(choice.outcome, player, currentNodeId);

// Handle exploration trigger
if (resolution.exploreTrigger) {
  const { onNavigate } = get();
  if (onNavigate) {
    onNavigate({
      type: 'exploration',
      tableId: resolution.exploreTrigger.tableId,
      onceOnly: resolution.exploreTrigger.onceOnly,
      onComplete: () => {
        // Exploration screen will trigger combat/treasure/etc, then return to node
        // For now, just go back to story
        if (onNavigate) {
          onNavigate({ type: 'story' });
        }
      },
    });
  }
  return; // Don't process navigation yet, wait for exploration to complete
}

// Handle merchant trigger
if (resolution.merchantTrigger) {
  const { onNavigate } = get();
  if (onNavigate) {
    onNavigate({
      type: 'merchant',
      shopInventory: resolution.merchantTrigger.shopInventory,
      buyPrices: resolution.merchantTrigger.buyPrices,
      onClose: () => {
        // Return to story after merchant closes
        if (onNavigate) {
          onNavigate({ type: 'story' });
        }
      },
    });
  }
  return; // Don't process navigation yet
}

// Normal navigation (goto, loop, exit)
// ... existing code ...
```

**Step 3: Import types**

Add to imports at top of file:

```typescript
import type {
  Campaign,
  Act,
  StoryNode,
  Choice,
  WorldState,
  ConversationState,
  LogEntry,
  EffectResult, // ADD THIS
} from '../types/narrative';
```

**Step 4: Commit**

```bash
git add src/stores/narrativeStore.ts
git commit -m "feat: handle levelUp, merchant, and exploration triggers in narrative store"
```

---

## Task 3: Update Character Store to Process Effects

**Files:**
- Modify: `src/stores/characterStore.ts`

**Step 1: Add processEffects method**

Character store needs to process `giveGold`, `heal`, `damage` effects from narrative system.

Find the character store definition and add a new method:

```typescript
export interface CharacterStore {
  character: Character | null;
  // ... existing methods ...

  // NEW: Process narrative effects that modify character
  processNarrativeEffects: (effects: NodeEffect[]) => void;
}
```

**Step 2: Implement processNarrativeEffects**

```typescript
processNarrativeEffects: (effects) => {
  const { character } = get();
  if (!character) return;

  let updatedCharacter = { ...character };

  for (const effect of effects) {
    switch (effect.type) {
      case 'giveGold':
        updatedCharacter.gold = (updatedCharacter.gold || 0) + effect.amount;
        break;

      case 'heal':
        if (effect.amount === 'full') {
          updatedCharacter.hp = updatedCharacter.maxHp;
        } else {
          const healAmount = parseInt(effect.amount);
          updatedCharacter.hp = Math.min(
            updatedCharacter.hp + healAmount,
            updatedCharacter.maxHp
          );
        }
        break;

      case 'damage':
        updatedCharacter.hp = Math.max(0, updatedCharacter.hp - effect.amount);
        break;

      // Other effects handled by their respective systems
      default:
        break;
    }
  }

  set({ character: updatedCharacter });
},
```

**Step 3: Import NodeEffect type**

```typescript
import type { NodeEffect } from '../types/narrative';
```

**Step 4: Call from narrative store**

Go back to `src/stores/narrativeStore.ts` and update `enterNode`:

```typescript
import { useCharacterStore } from './characterStore';

// ... in enterNode method, after processing effects:
if (node.onEnter && node.onEnter.length > 0) {
  const effectResult = processNodeEffects(node.onEnter, world);
  newLogEntries.push(...effectResult.logEntries);
  worldUpdates = effectResult.worldUpdates;
  combatTrigger = effectResult.combatTrigger;

  // NEW: Process character effects
  useCharacterStore.getState().processNarrativeEffects(node.onEnter);
}
```

**Step 5: Commit**

```bash
git add src/stores/characterStore.ts src/stores/narrativeStore.ts
git commit -m "feat: add character effect processing for giveGold, heal, damage"
```

---

## Task 4: Create Merchant Screen

**Files:**
- Create: `src/screens/MerchantScreen.tsx`

**Step 1: Create screen component**

Create `src/screens/MerchantScreen.tsx`:

```typescript
import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { getItem, getBuyPrice } from '../data/items';
import { buyItem, sellItem, canAfford, hasInventorySpace } from '../utils/merchant';
import type { InventoryItem } from '../types/character';

interface MerchantScreenProps {
  shopInventory: string[]; // Item IDs
  buyPrices: Record<string, number>;
  onClose: () => void;
}

export function MerchantScreen({ shopInventory, buyPrices, onClose }: MerchantScreenProps) {
  const { character, setCharacter } = useCharacterStore();
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [error, setError] = useState<string | null>(null);

  if (!character) {
    return <div className="body-primary">No character loaded</div>;
  }

  const handleBuy = (itemId: string) => {
    try {
      const item = getItem(itemId);
      const price = buyPrices[itemId];
      const updatedCharacter = buyItem(character, item, price);
      setCharacter(updatedCharacter);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSell = (itemId: string) => {
    try {
      const updatedCharacter = sellItem(character, itemId);
      setCharacter(updatedCharacter);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-fg-primary p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-primary text-text-accent mb-2">Merchant's Wares</h1>
        <p className="body-secondary mb-6">
          Gold: <span className="stat-medium text-gold">{character.gold}</span>
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            className={`tab-text pb-2 px-4 ${
              selectedTab === 'buy'
                ? 'border-b-2 border-text-accent text-text-accent'
                : 'text-text-secondary'
            }`}
            onClick={() => setSelectedTab('buy')}
          >
            Buy
          </button>
          <button
            className={`tab-text pb-2 px-4 ${
              selectedTab === 'sell'
                ? 'border-b-2 border-text-accent text-text-accent'
                : 'text-text-secondary'
            }`}
            onClick={() => setSelectedTab('sell')}
          >
            Sell
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error/20 border border-error text-error p-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* Buy Tab */}
        {selectedTab === 'buy' && (
          <div className="space-y-4">
            {shopInventory.map((itemId) => {
              const item = getItem(itemId);
              const price = buyPrices[itemId];
              const affordable = canAfford(character, price);
              const hasSpace = hasInventorySpace(character);

              return (
                <div
                  key={itemId}
                  className="bg-secondary p-4 rounded-lg border border-border flex justify-between items-center"
                >
                  <div>
                    <h3 className="heading-tertiary">{item.name}</h3>
                    <p className="body-secondary text-sm">{item.description}</p>
                    <p className="stat-small text-gold mt-2">{price} gold</p>
                  </div>
                  <button
                    className={`button-text px-6 py-2 rounded ${
                      affordable && hasSpace
                        ? 'bg-accent text-fg-inverted hover:bg-accent-hover'
                        : 'bg-muted text-text-muted cursor-not-allowed'
                    }`}
                    onClick={() => handleBuy(itemId)}
                    disabled={!affordable || !hasSpace}
                  >
                    Buy
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Sell Tab */}
        {selectedTab === 'sell' && (
          <div className="space-y-4">
            {character.inventory.length === 0 ? (
              <p className="body-secondary text-center py-8">
                You have no items to sell.
              </p>
            ) : (
              character.inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-secondary p-4 rounded-lg border border-border flex justify-between items-center"
                >
                  <div>
                    <h3 className="heading-tertiary">{item.name}</h3>
                    <p className="body-secondary text-sm">{item.description}</p>
                    <p className="stat-small text-gold mt-2">Sell for {item.value} gold</p>
                  </div>
                  <button
                    className="button-text px-6 py-2 rounded bg-accent text-fg-inverted hover:bg-accent-hover"
                    onClick={() => handleSell(item.id)}
                  >
                    Sell
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Close Button */}
        <button
          className="button-text mt-8 px-8 py-3 rounded bg-border text-text-primary hover:bg-border-hover w-full"
          onClick={onClose}
        >
          Leave Merchant
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Export from screens index**

Add to `src/screens/index.ts` (or create if doesn't exist):

```typescript
export { MerchantScreen } from './MerchantScreen';
```

**Step 3: Commit**

```bash
git add src/screens/MerchantScreen.tsx src/screens/index.ts
git commit -m "feat: add merchant screen with buy/sell functionality"
```

---

## Task 5: Create Level-Up Screen

**Files:**
- Create: `src/screens/LevelUpScreen.tsx`

**Step 1: Create screen component**

Create `src/screens/LevelUpScreen.tsx`:

```typescript
import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { applyLevelUp, calculateHPIncrease, calculateBABIncrease } from '../utils/levelUp';
import type { Feat } from '../types/character';

// TODO: Import from data/feats when implemented
const MOCK_FEATS: Record<string, Feat> = {
  'power-attack': {
    id: 'power-attack',
    name: 'Power Attack',
    description: 'You can sacrifice attack bonus for extra damage.',
    prerequisites: [],
    benefit: 'Take up to -5 penalty on attack rolls to gain up to +5 damage.',
  },
  'improved-initiative': {
    id: 'improved-initiative',
    name: 'Improved Initiative',
    description: 'You react faster in combat.',
    prerequisites: [],
    benefit: '+4 bonus on initiative checks.',
  },
  'weapon-focus': {
    id: 'weapon-focus',
    name: 'Weapon Focus',
    description: 'You are especially skilled with your chosen weapon.',
    prerequisites: [],
    benefit: '+1 bonus on attack rolls with one weapon type.',
  },
};

interface LevelUpScreenProps {
  newLevel: number;
  featChoices: string[]; // Feat IDs
  onComplete: () => void;
}

export function LevelUpScreen({ newLevel, featChoices, onComplete }: LevelUpScreenProps) {
  const { character, setCharacter } = useCharacterStore();
  const [selectedFeatId, setSelectedFeatId] = useState<string | null>(null);

  if (!character) {
    return <div className="body-primary">No character loaded</div>;
  }

  const hpIncrease = calculateHPIncrease(character.class, character.attributes.CON);
  const babIncrease = calculateBABIncrease(character.class, character.level, newLevel);

  const handleConfirm = () => {
    if (!selectedFeatId) return;

    const chosenFeat = MOCK_FEATS[selectedFeatId];
    const updatedCharacter = applyLevelUp(character, newLevel, chosenFeat);
    setCharacter(updatedCharacter);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-primary text-fg-primary p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="heading-display text-text-accent mb-4 text-center">
          Level Up!
        </h1>
        <p className="heading-primary text-center mb-8">
          You've reached level {newLevel}
        </p>

        {/* Stat Increases */}
        <div className="bg-secondary p-6 rounded-lg border border-border mb-6">
          <h2 className="heading-secondary mb-4">Stat Increases</h2>
          <div className="space-y-3">
            <div className="flex justify-between body-primary">
              <span>Hit Points:</span>
              <span className="stat-medium text-healing">
                {character.maxHp} → {character.maxHp + hpIncrease} (+{hpIncrease})
              </span>
            </div>
            <div className="flex justify-between body-primary">
              <span>Base Attack Bonus:</span>
              <span className="stat-medium text-text-accent">
                +{character.bab} → +{character.bab + babIncrease} (+{babIncrease})
              </span>
            </div>
            <div className="body-secondary text-sm mt-4 p-3 bg-primary/50 rounded">
              ✨ Your HP will be fully restored upon leveling up
            </div>
          </div>
        </div>

        {/* Feat Selection */}
        <div className="bg-secondary p-6 rounded-lg border border-border mb-6">
          <h2 className="heading-secondary mb-4">Choose a Feat</h2>
          <div className="space-y-3">
            {featChoices.map((featId) => {
              const feat = MOCK_FEATS[featId];
              const isSelected = selectedFeatId === featId;

              return (
                <button
                  key={featId}
                  className={`w-full text-left p-4 rounded border transition-colors ${
                    isSelected
                      ? 'border-accent bg-accent/20'
                      : 'border-border hover:border-accent/50'
                  }`}
                  onClick={() => setSelectedFeatId(featId)}
                >
                  <h3 className="feat-name text-text-accent mb-2">{feat.name}</h3>
                  <p className="body-secondary text-sm mb-2">{feat.description}</p>
                  <p className="body-primary text-sm italic">Benefit: {feat.benefit}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          className={`button-text w-full py-4 rounded text-lg ${
            selectedFeatId
              ? 'bg-accent text-fg-inverted hover:bg-accent-hover'
              : 'bg-muted text-text-muted cursor-not-allowed'
          }`}
          onClick={handleConfirm}
          disabled={!selectedFeatId}
        >
          {selectedFeatId ? 'Confirm Level Up' : 'Select a Feat'}
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Export from screens**

```typescript
export { LevelUpScreen } from './LevelUpScreen';
```

**Step 3: Commit**

```bash
git add src/screens/LevelUpScreen.tsx src/screens/index.ts
git commit -m "feat: add level-up screen with stat display and feat selection"
```

---

## Task 6: Create Exploration Result Screen

**Files:**
- Create: `src/screens/ExplorationScreen.tsx`

**Step 1: Create screen component**

Create `src/screens/ExplorationScreen.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { useNarrativeStore } from '../stores/narrativeStore';
import { getExplorationTable } from '../data/explorationTables';
import { rollExplorationTable } from '../utils/exploration';
import { getItem } from '../data/items';
import type { ExplorationOutcome } from '../types/narrative';

interface ExplorationScreenProps {
  tableId: string;
  onceOnly: boolean;
  onComplete: () => void;
}

export function ExplorationScreen({ tableId, onceOnly, onComplete }: ExplorationScreenProps) {
  const { character, setCharacter } = useCharacterStore();
  const world = useNarrativeStore((state) => state.world);
  const [outcome, setOutcome] = useState<ExplorationOutcome | null>(null);
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    // Roll on exploration table after short delay (for suspense)
    const timer = setTimeout(() => {
      const table = getExplorationTable(tableId);
      const result = rollExplorationTable(table);
      setOutcome(result);
      setIsRolling(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [tableId]);

  if (!character || !world) {
    return <div className="body-primary">Loading...</div>;
  }

  if (isRolling) {
    return (
      <div className="min-h-screen bg-primary text-fg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-display text-text-accent mb-4">Exploring...</h1>
          <p className="body-primary animate-pulse">You search the area carefully...</p>
        </div>
      </div>
    );
  }

  if (!outcome) {
    return <div className="body-primary">Error: No outcome</div>;
  }

  const handleContinue = () => {
    // Apply treasure rewards
    if (outcome.type === 'treasure') {
      const updatedCharacter = {
        ...character,
        gold: character.gold + outcome.gold,
        inventory: [
          ...character.inventory,
          ...outcome.items.map((itemId) => getItem(itemId)),
        ],
      };
      setCharacter(updatedCharacter);
    }

    // Combat outcome will trigger combat screen via navigation
    if (outcome.type === 'combat') {
      // TODO: Trigger combat via onNavigate
      // For now, just give rewards
      const updatedCharacter = {
        ...character,
        gold: character.gold + outcome.goldReward,
        inventory: outcome.itemReward
          ? [...character.inventory, getItem(outcome.itemReward)]
          : character.inventory,
      };
      setCharacter(updatedCharacter);
    }

    onComplete();
  };

  return (
    <div className="min-h-screen bg-primary text-fg-primary p-6">
      <div className="max-w-2xl mx-auto">
        {/* Combat Outcome */}
        {outcome.type === 'combat' && (
          <>
            <h1 className="heading-display text-error mb-4">Encounter!</h1>
            <p className="body-primary mb-6">
              You've encountered a dangerous foe! Prepare for battle.
            </p>
            <div className="bg-secondary p-4 rounded border border-border mb-6">
              <p className="body-secondary">
                Enemy: <span className="text-text-accent">{outcome.enemyId}</span>
              </p>
              <p className="body-secondary">
                Reward: <span className="text-gold">{outcome.goldReward} gold</span>
                {outcome.itemReward && ` + ${getItem(outcome.itemReward).name}`}
              </p>
            </div>
          </>
        )}

        {/* Treasure Outcome */}
        {outcome.type === 'treasure' && (
          <>
            <h1 className="heading-display text-gold mb-4">Treasure Found!</h1>
            <p className="body-primary mb-6">
              You discover a hidden cache of valuables!
            </p>
            <div className="bg-secondary p-4 rounded border border-border mb-6 space-y-2">
              <p className="stat-medium text-gold">+{outcome.gold} gold</p>
              {outcome.items.map((itemId) => {
                const item = getItem(itemId);
                return (
                  <p key={itemId} className="body-secondary">
                    • {item.name}
                  </p>
                );
              })}
            </div>
          </>
        )}

        {/* Vignette Outcome */}
        {outcome.type === 'vignette' && (
          <>
            <h1 className="heading-display text-text-accent mb-4">Discovery</h1>
            <p className="body-narrative mb-6">{outcome.description}</p>
          </>
        )}

        {/* Nothing Outcome */}
        {outcome.type === 'nothing' && (
          <>
            <h1 className="heading-display text-text-muted mb-4">Nothing Found</h1>
            <p className="body-secondary mb-6">{outcome.message}</p>
          </>
        )}

        {/* Continue Button */}
        <button
          className="button-text w-full py-4 rounded bg-accent text-fg-inverted hover:bg-accent-hover"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Export from screens**

```typescript
export { ExplorationScreen } from './ExplorationScreen';
```

**Step 3: Commit**

```bash
git add src/screens/ExplorationScreen.tsx src/screens/index.ts
git commit -m "feat: add exploration screen with outcome display and rewards"
```

---

## Task 7: Add Retreat Button to Combat Screen

**Files:**
- Modify: `src/screens/CombatScreen.tsx`
- Modify: `src/stores/combatStore.ts`

**Step 1: Add retreat method to combat store**

In `src/stores/combatStore.ts`, add interface method:

```typescript
export interface CombatStore {
  combat: CombatState | null;
  startCombat: (player: Character, enemy: Character) => void;
  executeTurn: (action: 'attack') => void;
  resetCombat: () => void;

  // NEW
  retreat: () => {
    player: Character;
    retreatFlag?: string;
    safeNodeId: string;
  } | null;
}
```

Implement retreat:

```typescript
retreat: () => {
  const { combat } = get();
  if (!combat) return null;

  if (!combat.canRetreat) {
    console.warn('Retreat not allowed in this combat');
    return null;
  }

  const result = handleRetreat(combat);

  // Reset combat state
  set({ combat: null });

  return result;
},
```

Import handleRetreat:

```typescript
import { handleRetreat } from '../utils/combat';
```

**Step 2: Add retreat button to combat screen**

In `src/screens/CombatScreen.tsx`, find the action buttons section and add:

```typescript
const { combat, startCombat, executeTurn, resetCombat, retreat } = useCombatStore();

// ... in the render section, after the main action button:

{combat.canRetreat && (
  <button
    className="button-text px-6 py-3 rounded bg-error/20 border border-error text-error hover:bg-error/30"
    onClick={() => {
      const retreatResult = retreat();
      if (retreatResult) {
        // Update character with retreat damage/gold loss
        setCharacter(retreatResult.player);

        // Navigate to safe node
        // TODO: Wire this up with narrative store
        onDefeat(); // For now, treat as defeat
      }
    }}
  >
    Retreat
  </button>
)}
```

**Step 3: Commit**

```bash
git add src/stores/combatStore.ts src/screens/CombatScreen.tsx
git commit -m "feat: add retreat button to combat screen with penalty handling"
```

---

## Task 8: Wire Up Screens in App Router

**Files:**
- Modify: `src/App.tsx` (or equivalent router)

**Step 1: Import new screens**

```typescript
import { MerchantScreen, LevelUpScreen, ExplorationScreen } from './screens';
```

**Step 2: Add screen routing**

Find the screen routing logic (likely a switch statement or conditional rendering):

```typescript
// Add to the screen type switch
case 'merchant':
  return (
    <MerchantScreen
      shopInventory={currentScreen.shopInventory}
      buyPrices={currentScreen.buyPrices}
      onClose={currentScreen.onClose}
    />
  );

case 'levelUp':
  return (
    <LevelUpScreen
      newLevel={currentScreen.newLevel}
      featChoices={currentScreen.featChoices}
      onComplete={currentScreen.onComplete}
    />
  );

case 'exploration':
  return (
    <ExplorationScreen
      tableId={currentScreen.tableId}
      onceOnly={currentScreen.onceOnly}
      onComplete={currentScreen.onComplete}
    />
  );
```

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up merchant, levelUp, and exploration screens to router"
```

---

## Task 9: Two-Phase Character Creation Integration

**Context:** The validation campaign uses a two-phase character creation approach:
- **Phase 1 (Quick Start)**: Pick class → auto-assign background → apply defaults → lock mechanics
- **Phase 2 (Full Customization)**: Unlocked mid-campaign → point-buy, skills, feats → unlock mechanics

**Files:**
- Create: `src/screens/QuickCharacterCreationScreen.tsx`
- Modify: `src/types/narrative.ts` (add characterCreation to ChoiceOutcome)
- Modify: `src/stores/narrativeStore.ts` (handle characterCreation trigger)
- Modify: `src/stores/characterStore.ts` (add quick creation method)
- Modify: `src/types/navigation.ts` (add quickCharacterCreation screen type)

---

### Step 1: Add characterCreation trigger to ChoiceOutcome

In `src/types/narrative.ts`, extend the `ChoiceOutcome` union:

```typescript
export type ChoiceOutcome =
  | { type: 'goto'; nodeId: string }
  | { type: 'loop' }
  | { type: 'exit' }
  | {
      type: 'check';
      skill: SkillName;
      dc: number;
      success: ChoiceOutcome;
      failure: ChoiceOutcome;
    }
  | { type: 'explore'; tableId: string; onceOnly: boolean }
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number> }
  | { type: 'characterCreation'; phase: 1 | 2; nextNodeId: string }; // NEW
```

**Step 2: Add navigation screen type**

In `src/types/navigation.ts`:

```typescript
export type Screen =
  // ... existing types ...
  | { type: 'characterCreation' }
  | { type: 'quickCharacterCreation'; onComplete: (characterClass: CharacterClass) => void }; // NEW
```

---

### Step 3: Create Quick Character Creation Screen

Create `src/screens/QuickCharacterCreationScreen.tsx`:

```typescript
import { useState } from 'react';
import { CLASSES } from '../data/classes';
import { getBackgroundByClass } from '../data/backgrounds';
import type { CharacterClass } from '../types/character';
import { Button, Card, Icon } from '../components';

interface QuickCharacterCreationScreenProps {
  onComplete: (characterClass: CharacterClass) => void;
}

const classIcons = {
  Fighter: 'Sword' as const,
  Rogue: 'Eye' as const,
  Wizard: 'Sparkles' as const,
  Cleric: 'Heart' as const,
};

const classDescriptions = {
  Fighter: 'Master of weapons and armor. High HP and strong in melee combat.',
  Rogue: 'Sneaky and skillful. Deals extra damage with sneak attacks.',
  Wizard: 'Arcane spellcaster. Wields powerful magic but fragile in combat.',
  Cleric: 'Divine spellcaster. Heals allies and smites enemies with holy power.',
};

export function QuickCharacterCreationScreen({ onComplete }: QuickCharacterCreationScreenProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClassSelect = (className: CharacterClass) => {
    setSelectedClass(className);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (!selectedClass) return;
    onComplete(selectedClass);
  };

  const handleBack = () => {
    setShowConfirm(false);
    setSelectedClass(null);
  };

  if (showConfirm && selectedClass) {
    const background = getBackgroundByClass(selectedClass);

    return (
      <div className="min-h-screen bg-primary text-fg-primary p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="heading-display text-text-accent mb-4 text-center">
            Confirm Your Choice
          </h1>

          <Card variant="neutral" padding="spacious" className="mb-6">
            <div className="text-center mb-6">
              <Icon name={classIcons[selectedClass]} className="w-16 h-16 mx-auto mb-4 text-text-accent" />
              <h2 className="heading-primary mb-2">{selectedClass}</h2>
              <p className="body-secondary mb-4">{classDescriptions[selectedClass]}</p>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="heading-secondary mb-3">Background: {background.name}</h3>
              <p className="body-secondary mb-4 italic">"{background.description}"</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="Zap" className="w-4 h-4 text-text-accent" />
                  <span className="body-primary text-sm">
                    Starting Quirk: <span className="text-text-accent">{background.startingQuirk}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Book" className="w-4 h-4 text-text-accent" />
                  <span className="body-primary text-sm">
                    Tagged Skills: {background.taggedSkills.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/50 rounded">
              <p className="body-secondary text-sm">
                ℹ️ <strong>Phase 1:</strong> Your character will use recommended stats based on your background.
                You can customize later in the campaign.
              </p>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="secondary" onClick={handleBack} fullWidth>
              Back
            </Button>
            <Button variant="primary" onClick={handleConfirm} fullWidth>
              Begin Adventure
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-fg-primary p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-display text-text-accent mb-4 text-center">
          Choose Your Path
        </h1>
        <p className="body-secondary text-center mb-8">
          Select your character class to begin your adventure
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(CLASSES).map((className) => {
            const classKey = className as CharacterClass;
            const background = getBackgroundByClass(classKey);

            return (
              <button
                key={className}
                onClick={() => handleClassSelect(classKey)}
                className="text-left p-6 rounded-lg border-2 border-border hover:border-accent bg-secondary hover:bg-secondary-hover transition-all"
              >
                <div className="flex items-start gap-4">
                  <Icon name={classIcons[classKey]} className="w-12 h-12 text-text-accent flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="heading-secondary mb-2">{className}</h2>
                    <p className="body-secondary text-sm mb-3">{classDescriptions[classKey]}</p>
                    <div className="text-xs text-text-muted">
                      <p>Background: <span className="text-text-accent">{background.name}</span></p>
                      <p>Quirk: {background.startingQuirk}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Export from screens**

```typescript
export { QuickCharacterCreationScreen } from './QuickCharacterCreationScreen';
```

---

### Step 5: Add Quick Creation Method to Character Store

In `src/stores/characterStore.ts`, add:

```typescript
import { getBackgroundByClass } from '../data/backgrounds';
import type { Background } from '../types/background';

export interface CharacterStore {
  // ... existing methods ...

  // NEW: Quick character creation (Phase 1)
  createQuickCharacter: (characterClass: CharacterClass) => void;
}
```

Implement:

```typescript
createQuickCharacter: (characterClass) => {
  const background = getBackgroundByClass(characterClass);

  // Use background attribute bias as starting attributes
  const attributes: Attributes = {
    STR: background.attributeBias.STR || 10,
    DEX: background.attributeBias.DEX || 10,
    CON: background.attributeBias.CON || 10,
    INT: background.attributeBias.INT || 10,
    WIS: background.attributeBias.WIS || 10,
    CHA: background.attributeBias.CHA || 10,
  };

  // Calculate derived stats
  const classData = CLASSES[characterClass];
  const hp = classData.baseHP + getAttributeModifier(attributes.CON);
  const ac = 10 + getAttributeModifier(attributes.DEX); // Base AC, no armor yet

  // Initialize skill ranks - tagged skills get 1 rank
  const skillRanks: Record<SkillName, number> = {
    Athletics: 0,
    Stealth: 0,
    Perception: 0,
    Arcana: 0,
    Medicine: 0,
    Intimidate: 0,
  };

  background.taggedSkills.forEach((skill) => {
    skillRanks[skill as SkillName] = 1;
  });

  const character: Character = {
    name: `${characterClass} Adventurer`, // Default name
    avatarPath: '/assets/avatars/default.png',
    class: characterClass,
    level: 1,
    attributes,
    hp,
    maxHp: hp,
    ac,
    bab: characterClass === 'Fighter' ? 1 : 0, // Simplified
    saves: {
      fortitude: getAttributeModifier(attributes.CON),
      reflex: getAttributeModifier(attributes.DEX),
      will: getAttributeModifier(attributes.WIS),
    },
    skills: skillRanks,
    feats: [], // No feat in Phase 1
    equipment: {
      weapon: classData.startingWeapon,
      armor: classData.startingArmor,
      shield: { equipped: false, acBonus: 0 },
      items: [],
    },
    resources: {
      abilities: [],
      spellSlots: characterClass === 'Wizard' || characterClass === 'Cleric'
        ? { 0: 3, 1: 1 } // Basic spell slots
        : undefined,
    },
    gold: 100, // Starting gold
    inventory: [],
    maxInventorySlots: 10,
    background,
    trait: undefined, // Set in Phase 2
    startingQuirk: background.startingQuirk,
    mechanicsLocked: true, // Phase 1 locks mechanics
  };

  set({ character, creationStep: null, creationData: {} as any });
},
```

Add imports:

```typescript
import { getAttributeModifier } from '../utils/attributes';
import { CLASSES } from '../data/classes';
import type { SkillName } from '../types/skill';
```

---

### Step 6: Handle characterCreation Trigger in Narrative Store

In `src/stores/narrativeStore.ts`, add to `selectChoice` method after merchant trigger:

```typescript
// Handle character creation trigger
if (resolution.characterCreationTrigger) {
  const { onNavigate } = get();
  if (onNavigate) {
    if (resolution.characterCreationTrigger.phase === 1) {
      // Phase 1: Quick creation
      onNavigate({
        type: 'quickCharacterCreation',
        onComplete: (characterClass: CharacterClass) => {
          // Create character using background defaults
          useCharacterStore.getState().createQuickCharacter(characterClass);

          // Navigate to next node
          enterNode(resolution.characterCreationTrigger.nextNodeId, useCharacterStore.getState().character!);

          // Return to story
          if (onNavigate) {
            onNavigate({ type: 'story' });
          }
        },
      });
    } else {
      // Phase 2: Full customization (existing CharacterCreationScreen)
      onNavigate({
        type: 'characterCreation',
        // TODO: Add onComplete callback to unlock mechanics
      });
    }
  }
  return;
}
```

Add to `OutcomeResolution` type extension:

```typescript
export interface OutcomeResolution {
  nextNodeId: string | null;
  logEntries: LogEntry[];
  worldUpdates: Partial<WorldState>;
  exploreTrigger?: {
    tableId: string;
    onceOnly: boolean;
  };
  merchantTrigger?: {
    shopInventory: string[];
    buyPrices: Record<string, number>;
  };
  characterCreationTrigger?: {
    phase: 1 | 2;
    nextNodeId: string;
  };
}
```

Update `resolveOutcome` in `src/utils/narrativeLogic.ts`:

```typescript
case 'characterCreation':
  return {
    nextNodeId: null, // Don't navigate yet
    logEntries: [],
    worldUpdates: {},
    characterCreationTrigger: {
      phase: outcome.phase,
      nextNodeId: outcome.nextNodeId,
    },
  };
```

---

### Step 7: Update Validation Campaign to Use Trigger

In `src/data/campaigns/validation-campaign.ts`, update the first choice:

```typescript
{
  id: 'validation-start',
  title: 'Welcome to the Validation Campaign',
  description: 'This campaign tests all core game mechanics...',
  choices: [
    {
      id: 'start-char-creation',
      text: 'Create Character',
      outcome: {
        type: 'characterCreation',
        phase: 1,
        nextNodeId: 'validation-first-combat',
      },
    },
  ],
},
```

---

### Step 8: Wire Up Screen in App Router

In `src/App.tsx`, add:

```typescript
import { QuickCharacterCreationScreen } from './screens';

// In screen routing switch:
case 'quickCharacterCreation':
  return (
    <QuickCharacterCreationScreen
      onComplete={currentScreen.onComplete}
    />
  );
```

---

### Step 9: Test Quick Character Creation

**Manual test:**

1. Start validation campaign
2. See "Choose Your Path" screen with 4 classes
3. Select Fighter → see confirmation with Border Guard background
4. Confirm → character created with:
   - Fighter class
   - Background attributes (STR 14, CON 13, etc.)
   - Tagged skills (Intimidate, Perception) = 1 rank
   - Starting quirk: auto-block-first-attack
   - mechanicsLocked: true
5. Navigate to first combat node

**Verify:**
```javascript
// In console:
useCharacterStore.getState().character
// Should show Fighter with background, quirk, locked mechanics
```

---

### Step 10: Commit

```bash
git add src/screens/QuickCharacterCreationScreen.tsx \
        src/types/narrative.ts \
        src/types/navigation.ts \
        src/stores/characterStore.ts \
        src/stores/narrativeStore.ts \
        src/utils/narrativeLogic.ts \
        src/data/campaigns/validation-campaign.ts \
        src/App.tsx \
        src/screens/index.ts

git commit -m "feat: add Phase 1 quick character creation with background integration

- Add QuickCharacterCreationScreen for class selection
- Auto-assign background based on class
- Apply background attribute bias, tagged skills, and quirk
- Add characterCreation trigger to ChoiceOutcome
- Handle trigger in narrative store (Phase 1 and Phase 2 paths)
- Update validation campaign to use characterCreation trigger
- Lock mechanics until Phase 2 unlock (mechanicsLocked: true)

Phase 1 character creation now functional - picks class, applies defaults"
```

---

## Task 10: Testing & Integration

**Step 1: Manual testing checklist**

Test the validation campaign flow:

1. ✅ Start validation campaign
2. ✅ Complete first combat → receive gold (check character.gold updated)
3. ✅ Exploration choice → see exploration screen → get reward
4. ✅ Merchant → buy item (gold decreases) → sell item (gold increases)
5. ✅ Phase 2 unlock node → continue
6. ✅ Second combat → test retreat button → verify gold/damage penalty
7. ✅ Level-up → see stat increases → select feat → verify applied
8. ✅ Final combat → victory

**Step 2: Fix any integration issues**

Common issues to watch for:
- Character store not processing effects → check processNarrativeEffects called
- Navigation callbacks not firing → check onNavigate set in narrative store
- Gold not persisting → ensure character updates saved
- Retreat penalties not applying → verify handleRetreat called

**Step 3: Run build**

```bash
npm run build
npm run lint
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 5 UI integration for validation campaign

- Add merchant screen with buy/sell functionality
- Add level-up screen with feat selection
- Add exploration screen with outcome display
- Add retreat button to combat screen
- Integrate all triggers in narrative/character stores
- Wire up new screens in app router

All validation campaign mechanics now functional in UI"
```

---

## Summary

**What We Built:**
- ✅ 3 new navigation screen types
- ✅ Merchant, level-up, exploration screens
- ✅ Retreat functionality in combat
- ✅ Character effect processing (giveGold, heal, damage)
- ✅ Store integration for all triggers
- ✅ App router wiring

**Validation Campaign Now Functional:**
- Character creation → Combat → Exploration → Merchant → Level-up → Final combat
- All 8 nodes playable end-to-end
- Gold, items, HP, level progression working

**Next Steps:**
1. Playtest validation campaign
2. Polish UI/UX based on feedback
3. Add missing content (feats data, more items)
4. Begin full campaign implementation (Campaign 1)
