# Character Creation - Revised Design Specification

## 📋 Document Overview

**Purpose:** Redesign character creation for mobile-first onboarding with immediate identity and deferred mechanical complexity

**Status:** 🟡 PLANNED - For implementation after Phase 1 combat and Phase 2 narrative systems

**Last Updated:** 2025-12-14

**Dependencies:**
- ✅ Phase 1 combat mechanics (all 4 classes functional)
- 🟡 Basic dialogue system (2-3 choice branches)
- 🟡 Simple puzzle mechanics (2-solution puzzles)
- 🟡 Narrative flag system

**Target Phase:** Phase 1.5 or Phase 2 (after combat proven, before full narrative expansion)

---

## 🎯 Core Problem Statement

### Current Approach (Phase 1)
- **Mechanics-first:** Full point-buy, skill allocation, feat selection upfront
- **Abstract:** Numbers before context
- **Slow:** 2-5 minutes before gameplay starts
- **Mobile-unfriendly:** Lots of form fields on small screens

### Player Experience Goal
> **"A player should identify 'this is my character' within 30 seconds and feel that identity in the first encounter."**

### One-Line Success Test
After character creation, the player should be able to say:

> "I'm a cautious street-raised cleric who solves problems with faith and talk first."

**Without mentioning any numbers.**

---

## 🗺️ Revised Character Creation Flow

### Phase 1: Identity First (≤ 30 seconds)

**Player chooses (in order):**

1. **Class** (Fighter / Rogue / Wizard / Cleric)
   - Visual cards with iconic imagery
   - One-sentence fantasy, e.g., "Armored warrior, protects allies"

2. **Background** (1 per class, 4 total)
   - Answers "who were you before?"
   - Examples: Border Guard, Street Urchin, Academy Dropout, Temple Acolyte
   - Shows preview of starting quirk

3. **Defining Trait** (1 of 3 universal options)
   - Orthogonal to class
   - Shows mechanical trade-off explicitly
   - Examples: Bold (+initiative, -defense), Cautious (+defense, -speed)

4. **Avatar** (visual representation)
   - 4-6 portrait options per class
   - Lightly acknowledged in narrative ("The guard eyes your worn cloak...")

5. **Name** (optional, can skip)
   - Defaults to class name ("Fighter", "Rogue", etc.)
   - Allows custom input

**What happens under the hood:**
- Attributes pre-filled with background bias
- Skills tagged based on background
- Starting quirk assigned (visible in first encounter)
- Narrative flags set for dialogue/puzzle checks

**Result:** Player enters gameplay immediately with a character they understand emotionally, not mechanically.

---

### Phase 2: Mechanical Commitment (after first quest/combat)

**Unlocked after ~5-10 minutes of gameplay.**

**Player configures:**

1. **Attribute Point Allocation**
   - Point-buy system (current Phase 1 plan)
   - Pre-filled with background suggestions
   - Can override any allocation

2. **Skill Point Allocation**
   - Standard d20 skill system
   - Tagged skills (from background) highlighted
   - Suggested build shown

3. **Feat Selection**
   - Choose 1 feat at Level 1
   - Recommended feat based on class/background
   - Can choose any available feat

**Why defer this?**
- Numbers make sense now (player has felt combat/checks)
- Avoids overwhelming new players
- Preserves depth for experienced players
- Reduces regret (player knows what they want)

---

## 🎭 Backgrounds System

### Design Principles

1. **One background per class** (keep scope tight)
2. **Each background touches 3 pillars:**
   - Dialogue (social/narrative)
   - Combat (mechanical)
   - Puzzles (exploration)
3. **Backgrounds grant:**
   - Starting quirk (visible in play)
   - Dialogue tags (unlock options)
   - Attribute bias (suggestions)
   - Tagged skills (recommendations)

### Background Definitions

#### Fighter: Border Guard

**Narrative Identity:** "You enforced the law on the kingdom's frontier."

**Mechanical Effects:**
- **Starting Quirk:** Auto-block first incoming attack (+2 AC, turn 1 only)
- **Dialogue Tags:** `authority`, `law`, `military`
- **Attribute Bias:** STR 14, CON 13, WIS 12
- **Tagged Skills:** Intimidate, Perception
- **Puzzle Bonus:** Can use STR for physical shortcuts (break doors, move obstacles)

**First Encounter Hook:**
- Guard recognizes your bearing: "You have the look of a soldier."
- Brigand hesitates on first attack (quirk triggers)

---

#### Rogue: Street Urchin

**Narrative Identity:** "You survived by wit and stealth in the city's shadows."

**Mechanical Effects:**
- **Starting Quirk:** Begins combat hidden (first attack has advantage-equivalent: roll 2d20, keep higher)
- **Dialogue Tags:** `deception`, `streetwise`, `poverty`
- **Attribute Bias:** DEX 14, INT 12, CHA 11
- **Tagged Skills:** Stealth, Sleight of Hand
- **Puzzle Bonus:** Sees lock/mechanism hints (highlighted in UI)

**First Encounter Hook:**
- Merchant distrusts you: "Keep your hands where I can see them."
- Enemy doesn't notice you until you strike (quirk triggers)

---

#### Wizard: Academy Dropout

**Narrative Identity:** "You left formal training but kept the knowledge."

**Mechanical Effects:**
- **Starting Quirk:** Bonus cantrip on turn 1 (cast 2 spells first turn instead of 1)
- **Dialogue Tags:** `arcane`, `academia`, `arrogance`
- **Attribute Bias:** INT 14, WIS 12, CON 10
- **Tagged Skills:** Knowledge (Arcana), Spellcraft
- **Puzzle Bonus:** Sees arcane glyphs/hints in magical puzzles

**First Encounter Hook:**
- Scholar remarks: "You carry yourself like a mage, but no robes?"
- Extra magical energy surges on first spell (quirk triggers)

---

#### Cleric: Temple Acolyte

**Narrative Identity:** "You served the faith and carry its blessing."

**Mechanical Effects:**
- **Starting Quirk:** Passive healing aura (regenerate 1 HP per turn, max 5 HP per combat)
- **Dialogue Tags:** `faith`, `morality`, `healing`
- **Attribute Bias:** WIS 14, CON 12, CHA 11
- **Tagged Skills:** Heal, Sense Motive
- **Puzzle Bonus:** Senses corruption/truth (gets warning dialogue options)

**First Encounter Hook:**
- Villager seeks blessing: "Please, holy one, a prayer for my child."
- Wounds close slowly during fight (quirk triggers)

---

## ⚔️ Defining Traits System

### Design Principles

1. **Universal** (all classes can choose any trait)
2. **Trade-offs** (always one upside, one downside)
3. **Visible** (player notices effect in first encounter)
4. **Simple** (3 options maximum)

### Trait Definitions

#### Bold

**Description:** "You act first, think later."

**Mechanical Effects:**
- ✅ **Upside:** +2 initiative (act first in combat)
- ❌ **Downside:** -2 AC if you act last in turn order

**Narrative Flavor:**
- Dialogue options lean aggressive/impulsive
- NPCs comment on your directness

---

#### Cautious

**Description:** "You observe before committing."

**Mechanical Effects:**
- ✅ **Upside:** +2 AC (harder to hit)
- ❌ **Downside:** -2 initiative (act later in combat)

**Narrative Flavor:**
- Dialogue options lean hesitant/analytical
- NPCs see you as calculating

---

#### Silver-Tongued

**Description:** "You talk your way through trouble."

**Mechanical Effects:**
- ✅ **Upside:** +2 to all Charisma-based checks (Persuade, Bluff, Intimidate)
- ❌ **Downside:** NPC hostility escalates faster on failed social checks

**Narrative Flavor:**
- Unlock additional dialogue options
- Failed persuasion angers NPCs more

---

## 🎨 Starting Quirks System

### Design Philosophy

> **Quirks are discovered, not explained.**

**Anti-Pattern:**
- ❌ Tooltip: "As a Border Guard, you auto-block the first attack."

**Correct Pattern:**
- ✅ Combat starts
- ✅ Enemy attacks
- ✅ Combat log: "Your training kicks in—you deflect the blow! (+2 AC)"
- ✅ Player discovers naturally

### Implementation Pattern

```typescript
// utils/quirks.ts
export function applyStartingQuirk(
  character: Character,
  combat: CombatState,
  trigger: 'combat-start' | 'turn-1' | 'first-attack'
): CombatState {
  const quirk = character.background.startingQuirk;

  switch (quirk) {
    case 'auto-block-first-attack':
      if (trigger === 'first-attack' && combat.turn === 1) {
        return {
          ...combat,
          playerACBonus: 2,
          log: [...combat.log, {
            actor: 'system',
            message: "Your guard training kicks in—you deflect the blow!",
            color: 'blue'
          }]
        };
      }
      break;

    case 'start-hidden':
      if (trigger === 'combat-start') {
        return {
          ...combat,
          playerConditions: ['hidden'],
          log: [...combat.log, {
            actor: 'system',
            message: "You blend into the shadows...",
            color: 'blue'
          }]
        };
      }
      break;

    case 'bonus-cantrip-turn-1':
      if (trigger === 'turn-1') {
        return {
          ...combat,
          playerExtraAction: true,
          log: [...combat.log, {
            actor: 'system',
            message: "Arcane energy surges through you!",
            color: 'blue'
          }]
        };
      }
      break;

    case 'healing-aura':
      if (trigger === 'turn-1') {
        const healAmount = Math.min(1, character.maxHp - character.hp);
        return {
          ...combat,
          playerHp: Math.min(combat.playerHp + 1, character.maxHp),
          log: [...combat.log, {
            actor: 'system',
            message: `Your faith sustains you (+${healAmount} HP)`,
            color: 'blue'
          }]
        };
      }
      break;
  }

  return combat;
}
```

---

## 📊 Type System Changes

### New Types Required

```typescript
// types/background.ts
export interface Background {
  id: string;
  name: string;
  class: 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric';

  // Narrative
  description: string;  // "You enforced the law on the kingdom's frontier"
  dialogueTags: string[];  // ['authority', 'law', 'military']

  // Mechanical (Phase 2 pre-fill)
  attributeBias: Partial<Attributes>;  // { str: 14, con: 13, wis: 12 }
  taggedSkills: string[];  // ['Intimidate', 'Perception']

  // Quirks & Abilities
  startingQuirk: StartingQuirk;
  puzzleAbility: string;  // 'physical-shortcut', 'lock-hints', etc.
}

// types/trait.ts
export interface DefiningTrait {
  id: string;
  name: string;
  description: string;

  upside: {
    description: string;  // "+2 initiative"
    effect: (character: Character) => Character;
  };

  downside: {
    description: string;  // "-2 AC if acting last"
    effect: (character: Character, context: CombatState) => Character;
  };
}

// types/quirk.ts
export type StartingQuirk =
  | 'auto-block-first-attack'
  | 'start-hidden'
  | 'bonus-cantrip-turn-1'
  | 'healing-aura';

// types/character.ts (additions)
export interface Character {
  // ... existing fields (attributes, class, hp, etc.)

  // NEW: Phase 1 identity
  background: Background;
  trait: DefiningTrait;
  avatar: string;  // asset path

  // NEW: Phase 2 commitment
  mechanicsLocked: boolean;  // false until Phase 2 complete
  skillPoints?: Record<string, number>;
  feat?: Feat;
}
```

---

## 🎮 UI Component Changes

### Phase 1 Character Creation Screen

**Layout (mobile-optimized):**

```
┌─────────────────────────────┐
│   Choose Your Class         │
├─────────────────────────────┤
│  [Fighter] [Rogue]          │
│  [Wizard]  [Cleric]         │
│                             │
│  Selected: Fighter          │
│  "Armored warrior,          │
│   protects allies"          │
└─────────────────────────────┘
        ↓ (Next)
┌─────────────────────────────┐
│   Your Past                 │
├─────────────────────────────┤
│  [Border Guard]             │
│   ✓ Auto-block first attack │
│   ✓ Authority in dialogue   │
│   ✓ Break obstacles         │
└─────────────────────────────┘
        ↓ (Next)
┌─────────────────────────────┐
│   Defining Trait            │
├─────────────────────────────┤
│  [ Bold ]                   │
│   +Initiative / -AC late    │
│  [ Cautious ]               │
│   +AC / -Initiative         │
│  [ Silver-Tongued ]         │
│   +Charisma / -Failed check │
└─────────────────────────────┘
        ↓ (Next)
┌─────────────────────────────┐
│   Choose Avatar             │
│  [img] [img] [img] [img]    │
└─────────────────────────────┘
        ↓ (Next)
┌─────────────────────────────┐
│   Name (Optional)           │
│  [____________] or Skip     │
└─────────────────────────────┘
        ↓ (Start Adventure)
```

**Total clicks:** 5 (class → background → trait → avatar → skip name)
**Time target:** ≤ 30 seconds

---

### Phase 2 Unlock Screen

**Trigger:** After first quest completion (narrative flag: `first_quest_complete`)

**UI:**

```
┌─────────────────────────────────────┐
│  You feel ready to refine your      │
│  skills and abilities.              │
│                                     │
│  [Customize Your Build] [Later]     │
└─────────────────────────────────────┘
```

**If clicked "Customize":**
- Show point-buy screen (pre-filled with background bias)
- Show skill allocation (tagged skills highlighted)
- Show feat selection (recommended feat marked)

**If clicked "Later":**
- Use default build (background suggestions)
- Can access later via menu

---

## 📦 Data Content Files

### New Files Required

```
src/data/
├── backgrounds.ts      # 4 background definitions
├── traits.ts           # 3 defining trait definitions
├── quirks.ts           # Quirk behavior implementations
└── avatars.ts          # Avatar asset mappings
```

### Example: backgrounds.ts

```typescript
import { Background } from '@/types/background';

export const BACKGROUNDS: Record<string, Background> = {
  'border-guard': {
    id: 'border-guard',
    name: 'Border Guard',
    class: 'Fighter',
    description: "You enforced the law on the kingdom's frontier.",
    dialogueTags: ['authority', 'law', 'military'],
    attributeBias: { str: 14, con: 13, wis: 12, dex: 10, int: 8, cha: 9 },
    taggedSkills: ['Intimidate', 'Perception'],
    startingQuirk: 'auto-block-first-attack',
    puzzleAbility: 'physical-shortcut'
  },

  'street-urchin': {
    id: 'street-urchin',
    name: 'Street Urchin',
    class: 'Rogue',
    description: "You survived by wit and stealth in the city's shadows.",
    dialogueTags: ['deception', 'streetwise', 'poverty'],
    attributeBias: { dex: 14, int: 12, cha: 11, con: 10, str: 8, wis: 9 },
    taggedSkills: ['Stealth', 'Sleight of Hand'],
    startingQuirk: 'start-hidden',
    puzzleAbility: 'lock-hints'
  },

  'academy-dropout': {
    id: 'academy-dropout',
    name: 'Academy Dropout',
    class: 'Wizard',
    description: "You left formal training but kept the knowledge.",
    dialogueTags: ['arcane', 'academia', 'arrogance'],
    attributeBias: { int: 14, wis: 12, con: 10, dex: 11, str: 8, cha: 9 },
    taggedSkills: ['Knowledge (Arcana)', 'Spellcraft'],
    startingQuirk: 'bonus-cantrip-turn-1',
    puzzleAbility: 'arcane-sight'
  },

  'temple-acolyte': {
    id: 'temple-acolyte',
    name: 'Temple Acolyte',
    class: 'Cleric',
    description: "You served the faith and carry its blessing.",
    dialogueTags: ['faith', 'morality', 'healing'],
    attributeBias: { wis: 14, con: 12, cha: 11, str: 10, dex: 9, int: 8 },
    taggedSkills: ['Heal', 'Sense Motive'],
    startingQuirk: 'healing-aura',
    puzzleAbility: 'sense-corruption'
  }
};

// Helper to get background by class
export function getBackgroundByClass(
  className: 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric'
): Background {
  return Object.values(BACKGROUNDS).find(bg => bg.class === className)!;
}
```

---

## 🔄 Integration with Existing Systems

### Combat System Integration

**In `utils/combat.ts::resolveCombatRound()`:**

```typescript
export function resolveCombatRound(state: CombatState): CombatState {
  // NEW: Apply starting quirks on appropriate triggers
  if (state.turn === 1) {
    state = applyStartingQuirk(state.player, state, 'turn-1');
  }

  // Existing initiative logic
  const playerInitiative = rollInitiative(state.player);
  const enemyInitiative = rollInitiative(state.enemy);

  // NEW: Apply trait modifiers to initiative
  const playerInitMod = state.player.trait.id === 'bold' ? 2 :
                        state.player.trait.id === 'cautious' ? -2 : 0;

  // ... rest of combat logic
}
```

### Dialogue System Integration (Phase 2)

**In narrative nodes:**

```typescript
// types/narrative.ts
interface DialogueChoice {
  id: string;
  text: string;

  // NEW: Background/trait gating
  requiredTags?: string[];  // ['authority', 'law']
  forbiddenTags?: string[];  // ['deception']

  outcome: Outcome;
}

// Example usage in campaign data:
{
  id: 'guard-confrontation',
  text: "A guard blocks your path. 'State your business.'",
  choices: [
    {
      id: 'authority',
      text: "[Border Guard] I served at the northern wall. Let me pass.",
      requiredTags: ['authority'],
      outcome: { type: 'goto', nodeId: 'passage-granted' }
    },
    {
      id: 'sneak',
      text: "[Street Urchin] Slip past while distracted",
      requiredTags: ['streetwise'],
      outcome: { type: 'check', skill: 'Stealth', dc: 12 }
    },
    {
      id: 'generic',
      text: "I'm just passing through.",
      outcome: { type: 'goto', nodeId: 'guard-suspicious' }
    }
  ]
}
```

### Puzzle System Integration (Phase 2)

**In puzzle nodes:**

```typescript
interface PuzzleSolution {
  id: string;
  description: string;

  // Standard approach
  check?: { skill: string; dc: number };

  // NEW: Background shortcuts
  backgroundShortcut?: {
    ability: string;  // 'physical-shortcut', 'arcane-sight', etc.
    autoSuccess: boolean;
  };
}

// Example:
{
  id: 'locked-door',
  description: "A heavy iron door blocks the passage.",
  solutions: [
    {
      id: 'pick-lock',
      description: "Pick the lock",
      check: { skill: 'Open Lock', dc: 15 }
    },
    {
      id: 'break-door',
      description: "Force the door open",
      check: { skill: 'Strength', dc: 18 },
      backgroundShortcut: {
        ability: 'physical-shortcut',
        autoSuccess: true  // Border Guard succeeds automatically
      }
    },
    {
      id: 'magical-unlock',
      description: "Use magic to unlock",
      backgroundShortcut: {
        ability: 'arcane-sight',
        autoSuccess: false  // Shows hint, still needs spell
      }
    }
  ]
}
```

---

## 🧪 Testing Strategy

### Unit Tests Required

**Background system:**
```typescript
// __tests__/data/backgrounds.test.ts
describe('Backgrounds', () => {
  it('should have exactly one background per class', () => {
    const classes = ['Fighter', 'Rogue', 'Wizard', 'Cleric'];
    classes.forEach(cls => {
      const bg = getBackgroundByClass(cls);
      expect(bg).toBeDefined();
      expect(bg.class).toBe(cls);
    });
  });

  it('should have valid attribute biases', () => {
    Object.values(BACKGROUNDS).forEach(bg => {
      const total = Object.values(bg.attributeBias).reduce((a, b) => a + b, 0);
      expect(total).toBe(62); // Standard point-buy total
    });
  });
});
```

**Quirk system:**
```typescript
// __tests__/utils/quirks.test.ts
describe('Starting Quirks', () => {
  it('should apply auto-block on first enemy attack', () => {
    const fighter = createCharacter({ background: BACKGROUNDS['border-guard'] });
    const combat = createCombatState(fighter, mockEnemy);

    const result = applyStartingQuirk(fighter, combat, 'first-attack');

    expect(result.playerACBonus).toBe(2);
    expect(result.log).toContainEqual(expect.objectContaining({
      message: expect.stringContaining('guard training')
    }));
  });

  it('should make rogue hidden at combat start', () => {
    const rogue = createCharacter({ background: BACKGROUNDS['street-urchin'] });
    const combat = createCombatState(rogue, mockEnemy);

    const result = applyStartingQuirk(rogue, combat, 'combat-start');

    expect(result.playerConditions).toContain('hidden');
  });
});
```

**Trait system:**
```typescript
// __tests__/data/traits.test.ts
describe('Defining Traits', () => {
  it('should always have upside and downside', () => {
    Object.values(TRAITS).forEach(trait => {
      expect(trait.upside).toBeDefined();
      expect(trait.downside).toBeDefined();
      expect(typeof trait.upside.effect).toBe('function');
      expect(typeof trait.downside.effect).toBe('function');
    });
  });

  it('Bold trait should modify initiative', () => {
    const character = createCharacter({ trait: TRAITS.bold });
    const initiative = calculateInitiative(character);

    // Should include +2 bonus
    expect(initiative).toBeGreaterThan(rollD20()); // simplified test
  });
});
```

### Integration Tests

**Phase 1 → Phase 2 flow:**
```typescript
describe('Character Creation Flow', () => {
  it('should allow gameplay after Phase 1, then unlock Phase 2', () => {
    // Phase 1: Quick creation
    const character = createCharacterPhase1({
      class: 'Fighter',
      background: 'border-guard',
      trait: 'bold',
      avatar: 'fighter-1',
      name: 'Aldric'
    });

    expect(character.mechanicsLocked).toBe(false);
    expect(character.attributes).toBeDefined(); // Pre-filled
    expect(character.background.attributeBias.str).toBe(14);

    // Can enter combat immediately
    const combat = startCombat(character, mockEnemy);
    expect(combat).toBeDefined();

    // Phase 2: After quest
    const updatedCharacter = unlockPhase2(character);
    expect(updatedCharacter.mechanicsLocked).toBe(true);

    // Can customize or keep defaults
    const customized = customizeAttributes(updatedCharacter, {
      str: 16, dex: 12, con: 14, int: 8, wis: 10, cha: 8
    });
    expect(customized.attributes.str).toBe(16);
  });
});
```

---

## 📅 Implementation Roadmap

### Prerequisites (Must Complete First)

- [x] **Phase 1 Combat** - All 4 classes, spells, combat variety
- [ ] **Basic Dialogue System** - Story nodes with 2-3 choice branches
- [ ] **Basic Puzzle System** - Simple 2-solution puzzles
- [ ] **Narrative Flag System** - Set/check flags for gating content

**Estimated Prerequisites:** Phase 1 complete + 2-3 weeks for basic narrative systems

---

### Phase 1.5: Character Creation Redesign

**Week 1: Foundation**

**Tasks:**
- [ ] Define types (`background.ts`, `trait.ts`, `quirk.ts`)
- [ ] Create background data (4 backgrounds in `data/backgrounds.ts`)
- [ ] Create trait data (3 traits in `data/traits.ts`)
- [ ] Write unit tests for data validation

**Week 2: Quirk System**

**Tasks:**
- [ ] Implement `utils/quirks.ts` with quirk application logic
- [ ] Integrate quirks into combat system (turn triggers)
- [ ] Add combat log messages for quirk discoveries
- [ ] Write unit tests for quirk mechanics

**Week 3: UI Components**

**Tasks:**
- [ ] Build Phase 1 creation screen (class → background → trait → avatar → name)
- [ ] Build Phase 2 unlock notification
- [ ] Build Phase 2 customization screen (point-buy, skills, feats)
- [ ] Mobile responsive testing

**Week 4: Integration & Polish**

**Tasks:**
- [ ] Wire Phase 1 choices to character state
- [ ] Implement Phase 2 unlock trigger (after first quest)
- [ ] Add background tags to dialogue system
- [ ] Add background shortcuts to puzzle system
- [ ] Integration testing
- [ ] User testing on mobile devices

**Total Estimated Time:** ~4 weeks after prerequisites complete

---

## 🎯 Success Metrics

### Quantitative

- [ ] **Time to gameplay:** ≤ 30 seconds from launch to first encounter
- [ ] **Phase 1 completion rate:** > 95% (very few drop-offs)
- [ ] **Phase 2 unlock rate:** > 80% (players reach customization)
- [ ] **Mobile completion rate:** Same as desktop (validates mobile-first design)

### Qualitative

- [ ] **Identity test:** Playtesters can describe character without mentioning numbers
- [ ] **Quirk discovery:** Players notice starting quirks without tooltips
- [ ] **Background impact:** Players report backgrounds "mattering" in dialogue/puzzles
- [ ] **Deferred complexity:** Players don't feel overwhelmed by Phase 1, appreciate Phase 2 depth

---

## 🚧 Known Limitations & Future Work

### Out of Scope (For Now)

**Multiple backgrounds per class:**
- Current design: 1 background per class (4 total)
- Future: Could expand to 2-3 per class for variety
- Reason deferred: Scope management, test simple version first

**Personal hooks:**
- Feedback suggested: "You're looking for someone who betrayed you"
- Requires: Branching narrative, persistent NPC relationships
- Phase for this: Phase 3-4 (after core narrative proven)

**Avatar gameplay impact:**
- Current: Visual only, lightly acknowledged
- Future: NPCs react differently based on avatar choice
- Requires: More dialogue branches, NPC personality system

### Migration Path from Phase 1

**For players who created characters in Phase 1:**
- Prompt to "update" character with background/trait
- Keep existing attributes/skills
- Apply background tags retroactively
- Mark Phase 2 as already unlocked

**Implementation:**
```typescript
function migratePhase1Character(oldCharacter: Character): Character {
  return {
    ...oldCharacter,
    background: BACKGROUNDS[`default-${oldCharacter.class.toLowerCase()}`],
    trait: TRAITS.cautious, // Safe default
    avatar: `${oldCharacter.class.toLowerCase()}-1`,
    mechanicsLocked: true // Already allocated stats
  };
}
```

---

## 📚 References

### Related Documents

- **Original Feedback:** `/docs/feedback/2025-12-14-character-creation-feedback.md`
- **Current Design Spec:** `/docs/specs/2025-12-08-design-spec.md`
- **Phase 1 Plan:** `/docs/plans/2025-12-09-phase-1.md`
- **Campaign 1 Spec:** `/docs/campaigns/2025-12-08-campaign-1.md`

### Design Inspirations

- **Disco Elysium** - Deferred stat allocation, traits define identity
- **Baldur's Gate 3** - Quick start vs. detailed character creator toggle
- **Hades** - Discover abilities through play, not tooltips
- **Slay the Spire** - Simple starting choice (class) leads to deep builds

---

## ✅ Final Checklist (Before Implementation)

### Design Validation

- [ ] All 4 backgrounds touch dialogue, combat, and puzzles equally
- [ ] All 3 traits have clear upside/downside trade-offs
- [ ] Starting quirks are discoverable without tooltips
- [ ] Phase 1 can complete in ≤ 30 seconds on mobile
- [ ] Phase 2 doesn't invalidate Phase 1 choices (pre-fills, not locks)

### Technical Validation

- [ ] Type system supports all new concepts
- [ ] Combat system can trigger quirks at appropriate moments
- [ ] Dialogue system can check background tags
- [ ] Puzzle system can recognize background shortcuts
- [ ] Save/load system preserves background/trait/quirk data

### Content Validation

- [ ] Test campaign has dialogue using all 4 background tags
- [ ] Test campaign has puzzles with background shortcuts
- [ ] First combat encounter triggers starting quirks visibly
- [ ] Phase 2 unlock happens at natural story beat

---

**Document Status:** Ready for implementation after Phase 1 combat + basic narrative systems complete.

**Next Steps:** Bookmark this spec, focus on Phase 1, revisit when prerequisites met.
