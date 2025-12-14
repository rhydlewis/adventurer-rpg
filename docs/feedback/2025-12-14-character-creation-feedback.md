What’s missing from character creation isn’t *options*, it’s **immediate identity and feedback**.
We should have a goal of allowing a player to idenitfy that *“this is my character in 30 seconds”* goal. We need a **fast emotional anchoring + visible consequence**.

## What’s currently over-serving the goal

These are fine systems, but they **don’t help first-minute identity**:
* 6 attributes (d20 style)
* Skill point allocation
* Feat selection
They matter later, but they’re abstract and slow on mobile.

## What’s missing (high impact, low complexity)

### 1. A **Background / Origin Choice** (critical)

One short choice that says *who you were before the game*.

Examples:

* Street Urchin
* Temple Acolyte
* Border Guard
* Disgraced Noble

**Why it matters:**

* Immediately narrative
* Can grant:

  * One dialogue tag
  * One small mechanical bonus
  * One puzzle shortcut

This does more for identity than 10 stat points.

### 2. A **Defining Trait / Flaw**

A single adjective with a trade-off.

Examples:

* **Hot-headed** (+attack on first turn, −dialogue patience)
* **Cautious** (+defence, slower actions)
* **Charming** (+social checks, enemies target you more)

**Rule:** one upside, one downside.

This creates a *playstyle* instantly.

### 3. A **Visible Starting Quirk**

Something the player sees *immediately in play*.

Examples:

* Fighter always blocks first attack
* Rogue starts combat hidden
* Wizard sees magical puzzle hints
* Cleric can sense corruption in dialogue

**Key point:**
The player should notice this within the first encounter without reading a tooltip.

### 4. A **Personal Hook**

One sentence that ties them to the world.

Examples:

* “You’re looking for someone who betrayed you.”
* “You owe a debt to the temple.”
* “You fled after something went wrong.”

This can just set a flag — no branching explosion needed.

## Avatar: how to make it matter

Choosing an image is good, but give it **one small gameplay or narrative effect**:

* NPCs react slightly differently
* Certain dialogue options unlock
* Enemies underestimate or target you

Even subtle acknowledgement makes it feel real.

## How to restructure for 30 seconds (important)

For mobile, consider:

**Phase 1 (10–15 seconds):**

* Class
* Background
* Avatar
* Name (optional / skippable)

**Phase 2 (later, after first encounter):**

* Attribute fine-tuning
* Skills
* Feats

This preserves depth without killing momentum.

## One-line test

After character creation, the player should be able to say:

> “I’m a cautious street-raised cleric who solves problems with faith and talk first.”

If they can’t say that without mentioning numbers, you’re not there yet.

If you want, I can:

# Character Creation Revised Design

This a **practical, mobile-first design** that keeps your existing systems intact and offers:

- 4 backgrounds per class that reuse content
- collapse stats/skills/feats into a single early choice
- a revised first-five-minutes onboarding flow

## 1. Phase-Split Character Creation (the core change)

### Phase 1: **Identity First** (≤ 30 seconds)

This is what the player must do before play starts.

**Player chooses:**

1. **Class** (Fighter / Rogue / Wizard / Cleric)
2. **Background** (1 per class, 4 total)
3. **Defining Trait** (1 of 3)
4. **Avatar** (visual only, lightly acknowledged)
5. **Name** (optional / skip)

**What this immediately sets (under the hood):**

* Pre-filled attribute bias
* 1–2 tagged skills
* A starting quirk visible in first encounter
* Narrative flags

👉 The player *plays immediately* after this.

### Phase 2: **Mechanical Commitment** (after first quest/combat)

Unlocked after ~5–10 minutes.

**Player configures:**

* Attribute point allocation
* Skill point allocation
* Feat choice

Now these numbers make sense because the player has *felt* the character.

## 2. Backgrounds (reused across systems)

One background per class to keep scope tight.

### Fighter

**Border Guard**

* Dialogue: authority / law
* Combat: +block on first hit
* Puzzle: physical shortcuts

### Rogue

**Street Urchin**

* Dialogue: deception / intimidation
* Combat: starts hidden
* Puzzle: lock / mechanism hints

### Wizard

**Academy Dropout**

* Dialogue: arcane knowledge, arrogance
* Combat: bonus spell on first turn
* Puzzle: magical insight

### Cleric

**Temple Acolyte**

* Dialogue: faith / morality
* Combat: passive healing aura (minor)
* Puzzle: sense corruption or truth

**Note:**
Each background touches **dialogue, combat, puzzles** — this is what creates identity.

## 3. Defining Traits (orthogonal to class)

Choose **one**, applies globally.

### Examples

* **Bold**

  * +initiative
  * −defence if acting last

* **Cautious**

  * +defence
  * −movement or slower actions

* **Silver-tongued**

  * +dialogue success
  * NPC hostility escalates faster on failure

Keep these few and visible.

## 4. Starting Quirks (no UI explanation)

Hard-coded behaviours noticed in play.

* Fighter auto-blocks first incoming attack
* Rogue begins encounters in stealth
* Wizard sees arcane UI glyphs on puzzles
* Cleric occasionally gets warning dialogue options

Players discover these naturally.

## 5. How Phase 1 Maps to Phase 2 (important)

Phase 1 choices **pre-fill** Phase 2, they do not lock it.

Example:

* Street Urchin Rogue starts with:

  * Dex slightly higher
  * Stealth + Sleight tagged
  * Suggested feat highlighted later

When Phase 2 unlocks:

* Player sees “Suggested” allocations
* Can override everything

This avoids regret while preserving identity.

## 6. Collapsing Early Complexity (stats / skills / feats)

### Early abstraction

During Phase 1, the game internally uses:

* **Power**
* **Survivability**
* **Influence**

These are derived from class + background + trait.

Combat and checks reference these only.

### Later expansion

In Phase 2:

* Power → Str / Dex / Int
* Survivability → Con / Wis
* Influence → Cha + social skills

This makes the system *feel deeper* without changing the math.

## 7. First 5 Minutes: Vertical Slice

**Minute 0–1**

* Phase 1 character creation

**Minute 1–3**

* Short narrative intro
* One dialogue choice (background-aware)

**Minute 3–4**

* First combat (quirk visible)

**Minute 4–5**

* Simple puzzle with 2 solutions

End with:

> “You feel ready to refine your skills.”

Phase 2 unlocks shortly after.

## 8. Implementation Hint (for a React-style app)

* Store Phase 1 choices as **tags + biases**
* Delay numerical systems behind a feature flag
* Drive dialogue/combat modifiers off tags, not stats

This keeps your logic clean.

## 9. One sentence design rule

> Phase 1 answers *who am I?*
> Phase 2 answers *how exactly do I do it?*
