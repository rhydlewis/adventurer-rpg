# Enemy Database Overview

The enemy database is located at src/data/enemies.ts. It's a centralized registry where you define all enemies that can appear in combat encounters throughout your narrative.

## Structure

```
export const enemies: Record<string, Creature> = {
    'enemy-id': {
    // Enemy definition
    },
};
```

Each enemy has:
- A key (e.g., 'bandit', 'skeleton') - used in campaign files to reference the enemy
- A Creature object - the full stat block

## How It Works

1. Campaign references enemy by ID: In your campaign file, you use enemyId: 'skeleton'
2. Combat screen loads enemy: getEnemy('skeleton') fetches the definition
3. Combat starts: The enemy stats are used for initiative, attacks, damage, etc.

# Enemy Definition Fields

Here's what each field means and what values are allowed:

## Basic Info

```
name: 'Skeleton',           // Display name shown in combat
avatarPath: '...',          // Image file from /public/assets/creatures/
class: 'Fighter',           // 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric'
level: 1,                   // Enemy level (affects difficulty)
```

## Attributes (Must be uppercase!)

```
attributes: {
    STR: 13,  // Strength (melee attack/damage)
    DEX: 15,  // Dexterity (initiative, AC, ranged attacks)
    CON: 10,  // Constitution (HP, Fortitude saves)
    INT: 6,   // Intelligence
    WIS: 10,  // Wisdom (Will saves, Perception)
    CHA: 3,   // Charisma
},
```

Modifiers: Each attribute gives a modifier (8-9 = -1, 10-11 = 0, 12-13 = +1, 14-15 = +2, etc.)

## Hit Points & Combat Stats

```
hp: 12,        // Current hit points
maxHp: 12,     // Maximum hit points
ac: 15,        // Armor Class (target number to hit)
bab: 1,        // Base Attack Bonus (level-based)
```

AC Calculation: 10 + DEX mod + armor bonus + shield bonus + natural armor

## Saving Throws

```
saves: {
    fortitude: 2,  // Resists poison, disease, physical effects
    reflex: 4,     // Dodges area effects, traps
    will: 2,       // Resists mental effects, spells
},
```

## Skills (All 6 required!)

```
skills: {
    Athletics: 0,    // STR-based physical feats
    Stealth: 0,      // DEX-based sneaking
    Perception: 0,   // WIS-based awareness
    Arcana: 0,       // INT-based magic knowledge
    Medicine: 0,     // WIS-based healing
    Intimidate: 0,   // CHA-based threats
},
```

Values: Base ranks (0-3 typical). Total bonus = ranks + ability modifier.

## Feats (Optional abilities)

`feats: [],  // Array of Feat objects (empty for basic enemies)`

## Equipment

### Weapon

    equipment: {
        weapon: {
            name: 'Dagger',           // 'Longsword' | 'Rapier' | 'Dagger' | 'Mace'
            damage: '1d6',            // Dice notation
            damageType: 'piercing',   // 'slashing' | 'piercing' | 'bludgeoning'
            finesse: true,            // If true, can use DEX instead of STR
            description: 'A short blade',
        },

Available Weapons:
- Longsword - 1d8 slashing
- Rapier - 1d8 piercing, finesse
- Dagger - 1d6 piercing, finesse
- Mace - 1d6 bludgeoning

### Armor

    armor: {
      name: 'Leather',          // 'None' | 'Leather' | 'Chainmail'
      baseAC: 11,               // Base AC this armor provides
      maxDexBonus: null,        // null = unlimited DEX bonus
      description: 'Supple leather armor',
    },

Available Armor:
- None - Base AC 10, no DEX limit
- Leather - Base AC 11, no DEX limit
- Chainmail - Base AC 14, max DEX +2

### Shield

    shield: {
      equipped: true,   // Is the shield being used?
      acBonus: 2,       // Usually +2
    },

### Items

    items: [],  // Array of consumable items (empty for most enemies)
},

## Resources (Class abilities and spells)

resources: {
    abilities: [],        // Class abilities (e.g., Second Wind for Fighter)
    spellSlots: undefined // Spell slots for Wizard/Cleric (undefined for non-casters)
},

# Adding a New Enemy: Step-by-Step Example

Let's add a Goblin enemy to the database.

## Step 1: Add to src/data/enemies.ts


```
export const enemies: Record<string, Creature> = {
    bandit: { /* existing */ },
    skeleton: { /* existing */ },

    // NEW ENEMY
    goblin: {
      name: 'Goblin',
      avatarPath: CREATURE_AVATARS['Goblin'] || DEFAULT_CREATURE_AVATAR,
      class: 'Rogue',
      level: 1,

      attributes: {
        STR: 8,   // -1 (weak)
        DEX: 16,  // +3 (very agile)
        CON: 10,  // +0 (average)
        INT: 10,  // +0 (average)
        WIS: 12,  // +1 (alert)
        CHA: 6,   // -2 (unpleasant)
      },

      hp: 8,
      maxHp: 8,
      ac: 15,  // 10 + 3 DEX + 2 leather
      bab: 0,  // Level 1 Rogue has BAB +0

      saves: {
        fortitude: 0,  // 0 (Rogue base) + 0 CON
        reflex: 5,     // 2 (Rogue base) + 3 DEX
        will: 1,       // 0 (Rogue base) + 1 WIS
      },

      skills: {
        Athletics: 0,
        Stealth: 7,      // 4 ranks + 3 DEX (sneaky!)
        Perception: 3,   // 2 ranks + 1 WIS (alert)
        Arcana: 0,
        Medicine: 0,
        Intimidate: 0,
      },

      feats: [],

      equipment: {
        weapon: {
          name: 'Dagger',
          damage: '1d4',  // Smaller weapon
          damageType: 'piercing',
          finesse: true,  // Uses DEX for attacks
          description: 'Crude iron dagger',
        },
        armor: {
          name: 'Leather',
          baseAC: 11,
          maxDexBonus: null,
          description: 'Tattered leather armor',
        },
        shield: {
          equipped: false,
          acBonus: 0,
        },
        items: [],
      },

      resources: {
        abilities: [],
        spellSlots: undefined,
      },
    },
};
```

## Step 2: Add avatar to src/data/creatureAvatars.ts

    type CreatureName = 'Skeleton' | 'Bandit' | 'Goblin' | /* ... */;
    
    export const CREATURE_AVATARS: Partial<Record<CreatureName, string>> = {
        Skeleton: 'monster_skeleton_00009.png',
        Bandit: 'human_bandit.png',
        Goblin: 'goblin_warrior.png',  // Add your image to /public/assets/creatures/
        // ...
    };

### Step 3: Use in a campaign

In your campaign file (e.g., src/data/campaigns/test-campaign.ts):

    {
        id: 'goblin-ambush',
        title: 'Goblin Ambush!',
        description: 'A goblin leaps from the shadows!',
        onEnter: [
            {
                type: 'startCombat',
                enemyId: 'goblin',  // References the enemy database key
                onVictoryNodeId: 'after-goblin-fight',
            },
        ],
        choices: [],
    },

Step 4: Test your enemy

1. Run dev server: npm run dev
2. Navigate to the combat node in your story
3. Verify:
   - Initiative shows Goblin <number> (not NaN)
   - Combat screen displays goblin stats
   - Attack button works
   - Victory/defeat flow works

# Design Tips

## Enemy Difficulty by Level

Level 1 Enemies (for Level 1 party):
- HP: 6-12
- AC: 11-15
- Attack Bonus: +0 to +3
- Damage: 1d4-1d8

Weak Enemy (Goblin):
- Lower HP (6-8)
- Higher AC (15+) from DEX
- Lower damage (1d4)
- Relies on Stealth/special abilities

Balanced Enemy (Bandit):
- Average HP (10)
- Medium AC (13)
- Average damage (1d6)
- Versatile skills

Tough Enemy (Skeleton):
- Higher HP (12+)
- High AC (15+)
- Good damage (1d6+)
- Better saves

# Class Choice Affects Combat

- Fighter: High HP, high BAB, good Fortitude
- Rogue: High DEX, high Reflex, Stealth bonus
- Wizard: Spells (if you add spellSlots), low HP
- Cleric: Healing abilities, medium stats

# Common Mistakes to Avoid

1. ❌ Lowercase attributes: str: 13 → ✅ STR: 13
2. ❌ Missing skills: Must define all 6 skills
3. ❌ Invalid weapon names: 'Sword' → ✅ 'Longsword'
4. ❌ Null equipment: shield: null → ✅ shield: { equipped: false, acBonus: 0 }
5. ❌ Wrong Resources structure: classAbilities: {} → ✅ abilities: []

# Adding New Weapon/Armor Types

If you want to add new weapon or armor types (e.g., "Crossbow", "Plate Mail"), you need to:

1. Update type definitions in src/types/equipment.ts:
   
`export type WeaponType = 'Longsword' | 'Rapier' | 'Dagger' | 'Mace' | 'Crossbow';`

2. Add to equipment data in src/data/equipment.ts if it exists, or document the stats in comments.

# Quick Reference: Enemy Template

Copy-paste this template when adding a new enemy:

```json
  'enemy-id': {
    name: 'Enemy Name',
    avatarPath: CREATURE_AVATARS['EnemyName'] || DEFAULT_CREATURE_AVATAR,
    class: 'Fighter',  // or Rogue, Wizard, Cleric
    level: 1,
    attributes: {
      STR: 10, DEX: 10, CON: 10,
      INT: 10, WIS: 10, CHA: 10,
    },
    hp: 10,
    maxHp: 10,
    ac: 10,
    bab: 0,
    saves: { fortitude: 0, reflex: 0, will: 0 },
    skills: {
      Athletics: 0, Stealth: 0, Perception: 0,
      Arcana: 0, Medicine: 0, Intimidate: 0,
    },
    feats: [],
    equipment: {
      weapon: {
        name: 'Dagger',
        damage: '1d4',
        damageType: 'piercing',
        finesse: true,
        description: '',
      },
      armor: {
        name: 'None',
        baseAC: 10,
        maxDexBonus: null,
        description: '',
      },
      shield: { equipped: false, acBonus: 0 },
      items: [],
    },
    resources: { abilities: [], spellSlots: undefined },
  },
```