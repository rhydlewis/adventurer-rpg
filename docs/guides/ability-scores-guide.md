# Ability Scores Guide

This guide explains what each ability score does in Adventurer RPG and how it affects combat, skills, and narrative gameplay.

## The Six Abilities

Every character has six core abilities that determine their strengths and weaknesses:

| Ability | Full Name | Key For |
|---------|-----------|---------|
| **STR** | Strength | Melee attacks, damage, Athletics |
| **DEX** | Dexterity | AC, ranged attacks, Stealth, initiative |
| **CON** | Constitution | Hit points, Fortitude saves |
| **INT** | Intelligence | Arcana, Wizard spells |
| **WIS** | Wisdom | Perception, Medicine, Cleric spells |
| **CHA** | Charisma | Intimidate, social interactions |

## How Ability Modifiers Work

Your ability **score** (8-18) is converted to a **modifier** using this formula:

```
Modifier = (Score - 10) / 2 (rounded down)
```

**Common modifiers:**
- Score 8 = -1 modifier
- Score 10 = +0 modifier
- Score 12 = +1 modifier
- Score 14 = +2 modifier
- Score 16 = +3 modifier
- Score 18 = +4 modifier

---

## Strength (STR)

**What it does:**
- **Melee attack rolls**: d20 + BAB + STR modifier
- **Melee damage**: Weapon damage + STR modifier
- **Athletics skill**: STR modifier + ranks

**Combat usage:**
- Every melee attack (except finesse weapons like rapiers)
- Every melee damage roll adds STR modifier
- Higher STR = hit more often and deal more damage

**Narrative usage:**
- **Athletics checks** (climbing, jumping, swimming, breaking down doors)
- Example: "Climb the cliff" = d20 + Athletics ranks + STR modifier vs DC 15

**Example:**
```
Fighter with STR 16 (+3 modifier):
- Attack roll: 1d20 + 1 (BAB) + 3 (STR) = 1d20+4
- Damage: 1d8+3 (longsword + STR)

vs STR 10 (+0 modifier):
- Attack roll: 1d20 + 1 (BAB) + 0 (STR) = 1d20+1
- Damage: 1d8+0
```

**Who needs it:**
- **Fighter**: Primary stat (melee specialist)
- **Cleric**: Secondary stat (melee + spells)
- **Rogue**: Low (uses DEX instead)
- **Wizard**: Lowest (avoids melee)

---

## Dexterity (DEX)

**What it does:**
- **Armor Class (AC)**: 10 + armor bonus + DEX modifier + shield
- **Initiative**: d20 + DEX modifier (+ other bonuses)
- **Ranged attacks**: d20 + BAB + DEX modifier (bows, thrown weapons)
- **Finesse weapon attacks**: d20 + BAB + DEX modifier (rapier, dagger)
- **Stealth skill**: DEX modifier + ranks

**Combat usage:**
- **AC (Defense)**: Higher DEX = harder to hit
  - Example: Leather armor (AC 12) + DEX 16 (+3) = AC 15
  - Example: Chainmail (AC 16) + DEX 10 (+0) = AC 16
- **Initiative**: Higher DEX = act first in combat
  - Acting first lets you kill enemies before they act
- **Reflex saves**: DEX modifier + reflex save bonus
  - Used to dodge area effects (e.g., Fireball spell)

**Narrative usage:**
- **Stealth checks** (sneaking, hiding, moving silently)
- Example: "Sneak past the guards" = d20 + Stealth ranks + DEX modifier vs DC 14

**Initiative bonuses (from skills):**
- Stealth total bonus ≥5: +2 initiative
- Perception ranks ≥3: +2 initiative

**Example:**
```
Rogue with DEX 16 (+3 modifier):
- AC: 12 (leather) + 3 (DEX) = 15
- Initiative: 1d20 + 3 (DEX) + 2 (Stealth ≥5) = 1d20+5
- Attack with rapier: 1d20 + 0 (BAB) + 3 (DEX) = 1d20+3

vs DEX 10 (+0 modifier):
- AC: 12 (leather) + 0 (DEX) = 12
- Initiative: 1d20 + 0 (DEX) = 1d20
- Easier to hit, acts later in combat
```

**Who needs it:**
- **Rogue**: Primary stat (finesse combat, AC, Stealth)
- **Wizard**: High (compensates for no armor)
- **Fighter**: Moderate (helps AC in heavy armor)
- **Cleric**: Moderate (helps AC in medium armor)

---

## Constitution (CON)

**What it does:**
- **Hit Points**: Max HP = base HP + (CON modifier × level)
- **Fortitude saves**: CON modifier + fortitude save bonus

**Combat usage:**
- **Max HP**: More CON = survive more hits
  - Fighter with CON 14 (+2): 15 base + 2 = 17 HP at level 1
  - Fighter with CON 10 (+0): 15 base + 0 = 15 HP at level 1
- **HP per level**: Gain CON modifier each level
  - Level 2: +hitDie + CON modifier (e.g., +10 + 2 = 12 HP gained)
- **Fortitude saves**: Resist poison, disease, death effects
  - Example: "Resist poison" = d20 + Fort save + CON modifier vs DC

**Example:**
```
Level 2 Fighter with CON 14 (+2):
- Base HP: 15 (level 1)
- Level 2 gain: 1d10+2 (e.g., 10+2 = 12)
- Total HP: 27

vs CON 10 (+0):
- Base HP: 15
- Level 2 gain: 1d10+0 (e.g., 10+0 = 10)
- Total HP: 25
```

**Who needs it:**
- **Everyone**: Affects survival for all classes
- **Fighter/Cleric**: High CON for frontline survivability
- **Rogue/Wizard**: Moderate CON (less HP from hit die, need CON to compensate)

---

## Intelligence (INT)

**What it does:**
- **Arcana skill**: INT modifier + ranks
- **Wizard spell DC**: 10 + spell level + INT modifier
- **Wizard spells per day**: Higher INT = bonus spell slots (not implemented yet)

**Combat usage:**
- **Wizard spells**: Higher INT = harder to resist
  - Fireball DC: 10 + 3 (spell level) + 3 (INT 16) = DC 16
  - Enemies roll d20 + Reflex save vs DC 16 (fail = full damage)

**Narrative usage:**
- **Arcana checks** (identify magic, recall magical lore, decipher runes)
- Example: "Decipher the magical rune" = d20 + Arcana ranks + INT modifier vs DC 22

**Example:**
```
Wizard with INT 16 (+3 modifier):
- Magic Missile: Always hits, damage 1d4+1 per missile
- Fireball: DC 16 Reflex save or take 5d6 damage

vs INT 12 (+1 modifier):
- Magic Missile: Same effect (no save)
- Fireball: DC 14 Reflex save (easier for enemies to dodge)
```

**Who needs it:**
- **Wizard**: Primary stat (spell power)
- **Rogue**: Secondary stat (high skill points, helps Arcana)
- **Fighter/Cleric**: Low priority

---

## Wisdom (WIS)

**What it does:**
- **Perception skill**: WIS modifier + ranks
- **Medicine skill**: WIS modifier + ranks
- **Cleric spell DC**: 10 + spell level + WIS modifier
- **Will saves**: WIS modifier + will save bonus

**Combat usage:**
- **Initiative bonus**: Perception ranks ≥3 gives +2 initiative
- **Will saves**: Resist mind-affecting spells (charm, fear, etc.)
- **Cleric spells**: Higher WIS = harder to resist
  - Cure Light Wounds: No save, heals 1d8+1
  - Command: DC = 10 + 1 (spell level) + WIS modifier

**Narrative usage:**
- **Perception checks** (spot traps, notice details, find hidden paths)
  - Example: "Spot the hidden trap" = d20 + Perception ranks + WIS modifier vs DC 13
- **Medicine checks** (heal wounds, diagnose illness, stabilize dying allies)

**Example:**
```
Cleric with WIS 16 (+3 modifier):
- Perception total: 3 (ranks) + 3 (WIS) + 3 (class skill) = +9
- Initiative: 1d20 + 0 (DEX) + 2 (Perception ≥3) = 1d20+2
- Spell DC: 10 + spell level + 3 (WIS)

vs WIS 10 (+0 modifier):
- Perception: 0 (ranks) + 0 (WIS) = +0
- No initiative bonus
- Spell DC: 10 + spell level + 0 (WIS) = easier to resist
```

**Who needs it:**
- **Cleric**: Primary stat (spell power)
- **Rogue**: Moderate (helps Perception, a class skill)
- **Fighter/Wizard**: Moderate (helps Will saves)

---

## Charisma (CHA)

**What it does:**
- **Intimidate skill**: CHA modifier + ranks
- **Social interactions**: Persuade, deceive, charm NPCs (narrative)

**Combat usage:**
- **Intimidate**: Demoralize enemies (not implemented yet)
- Currently the least impactful combat stat

**Narrative usage:**
- **Intimidate checks** (threaten, coerce, force compliance)
  - Example: "Intimidate the guard" = d20 + Intimidate ranks + CHA modifier vs DC
- **Social choices**: Some dialogue options may require high CHA or Intimidate

**Example:**
```
Fighter with CHA 8 (-1 modifier):
- Intimidate: 2 (ranks) - 1 (CHA) + 3 (class skill) = +4
- Social interactions may be harder

vs CHA 14 (+2 modifier):
- Intimidate: 2 (ranks) + 2 (CHA) + 3 (class skill) = +7
- Better at social manipulation
```

**Who needs it:**
- **Fighter**: Moderate (Intimidate is a class skill)
- **Rogue/Wizard/Cleric**: Low priority (no mechanical benefit yet)

---

## Skill-to-Ability Mapping

Every skill is tied to a specific ability:

| Skill | Ability | Used For |
|-------|---------|----------|
| **Athletics** | STR | Climb, jump, swim, break objects |
| **Stealth** | DEX | Sneak, hide, move silently |
| **Perception** | WIS | Spot traps, notice details, search |
| **Arcana** | INT | Magical knowledge, identify spells |
| **Medicine** | WIS | Heal, diagnose, stabilize |
| **Intimidate** | CHA | Threaten, coerce, demoralize |

**Skill check formula:**
```
d20 + skill ranks + ability modifier + class skill bonus
```

**Class skill bonus:** +3 if you have at least 1 rank in a class skill for your class

**Class skills by class:**
- **Fighter**: Athletics, Intimidate
- **Rogue**: Stealth, Perception
- **Wizard**: Arcana
- **Cleric**: Medicine

---

## Saving Throws

Saving throws defend against harmful effects (spells, poison, traps).

| Save Type | Ability | Defends Against |
|-----------|---------|-----------------|
| **Fortitude** | CON | Poison, disease, death, physical effects |
| **Reflex** | DEX | Area spells (Fireball), traps, dodging |
| **Will** | WIS | Mind control, fear, charm, illusions |

**Save formula:**
```
d20 + base save + ability modifier
```

**Base saves by class:**
- **Fighter**: Good Fort (+2), Poor Reflex/Will (+0)
- **Rogue**: Good Reflex (+2), Poor Fort/Will (+0)
- **Wizard**: Good Will (+2), Poor Fort/Reflex (+0)
- **Cleric**: Good Fort/Will (+1 each), Poor Reflex (+0)

**Example:**
```
Wizard casts Fireball (DC 16 Reflex save for half damage):

Rogue with DEX 16 (+3):
- Reflex save: d20 + 2 (base) + 3 (DEX) = d20+5
- Roll 11+ to succeed (50% chance)

Fighter with DEX 10 (+0):
- Reflex save: d20 + 0 (base) + 0 (DEX) = d20
- Roll 16+ to succeed (25% chance)
```

---

## Recommended Ability Scores by Class

### Fighter
- **Primary**: STR 16 (melee attacks/damage)
- **Secondary**: CON 14 (HP), DEX 12 (AC/initiative)
- **Dump**: CHA 8 (low impact)

### Rogue
- **Primary**: DEX 16 (AC, finesse attacks, Stealth)
- **Secondary**: INT 14 (skills), WIS 12 (Perception)
- **Dump**: STR 10 (uses DEX for attacks)

### Wizard
- **Primary**: INT 16 (spell DC, Arcana)
- **Secondary**: DEX 14 (AC, initiative), WIS 12 (Perception, Will saves)
- **Dump**: STR 8 (avoid melee)

### Cleric
- **Primary**: WIS 16 (spell DC, Perception, Medicine)
- **Secondary**: STR 14 (melee), CON 14 (HP)
- **Dump**: CHA 8 (low impact)

---

## Summary: How Abilities Affect Your Rogue

**Your Rogue leveled Athletics 4 → 8 and Stealth 4 → 8:**

### Athletics (STR-based)
Assuming your Rogue has STR 10 (+0 modifier):

**Before:**
- Athletics total: 4 (ranks) + 0 (STR) = +4
- DC 15 climb: Need to roll 11+ (50% chance)
- DC 12 jump: Need to roll 8+ (65% chance)

**After:**
- Athletics total: 8 (ranks) + 0 (STR) = +8
- DC 15 climb: Need to roll 7+ (70% chance)
- DC 12 jump: Need to roll 4+ (85% chance)

### Stealth (DEX-based)
Assuming your Rogue has DEX 16 (+3 modifier):

**Before:**
- Stealth total: 4 (ranks) + 3 (DEX) + 3 (class skill) = +10
- DC 14 sneak: Need to roll 4+ (85% chance)
- Initiative: Already get +2 bonus (Stealth ≥5)

**After:**
- Stealth total: 8 (ranks) + 3 (DEX) + 3 (class skill) = +14
- DC 14 sneak: Auto-succeed (only fail on nat 1!)
- Initiative: Still +2 bonus
- **DC 18 sneak**: Need to roll 4+ (85% chance) - can now attempt very hard checks

**Impact:**
- Turn risky actions into reliable ones
- Unlock harder challenges (DC 18+ checks)
- More narrative options available
- Better success rates = more control over outcomes
