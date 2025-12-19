# Revised Game Objects for Adventurer RPG

**Date:** 2025-12-19
**Purpose:** Combat-focused items aligned with game design (undead, humanoid, beast enemies; healing/offensive focus)

---

## Weapons (Legendary/Magic)

These are high-tier weapons for future phases. All fit the game's combat focus and enemy types.

```json
[
  {
    "name": "Holy Avenger",
    "damage": "1d8",
    "damageType": "slashing",
    "finesse": false,
    "description": "A legendary longsword that glows with divine light, especially effective against undead.",
    "proficiencyRequired": "martial",
    "special": "Extra damage vs undead"
  },
  {
    "name": "Frost Brand",
    "damage": "1d8",
    "damageType": "slashing",
    "finesse": false,
    "description": "A longsword wreathed in ice that sheds freezing fog in battle.",
    "proficiencyRequired": "martial",
    "special": "Extra cold damage"
  },
  {
    "name": "Sun Blade",
    "damage": "1d8",
    "damageType": "slashing",
    "finesse": true,
    "description": "A golden hilt that emits a blade of pure radiant light, devastating to undead.",
    "proficiencyRequired": "martial-finesse",
    "special": "Extra radiant damage vs undead"
  },
  {
    "name": "Mace of Disruption",
    "damage": "1d6",
    "damageType": "bludgeoning",
    "finesse": false,
    "description": "A holy mace that channels divine energy to shatter undead creatures.",
    "proficiencyRequired": "simple",
    "special": "Can destroy undead on critical hits"
  },
  {
    "name": "Flame Tongue",
    "damage": "1d8",
    "damageType": "slashing",
    "finesse": false,
    "description": "A longsword that bursts into flames on command, dealing extra fire damage.",
    "proficiencyRequired": "martial",
    "special": "Extra fire damage when activated"
  },
  {
    "name": "Dagger of Venom",
    "damage": "1d4",
    "damageType": "piercing",
    "finesse": true,
    "description": "A black blade coated with a supernatural poison that never dries.",
    "proficiencyRequired": "simple",
    "special": "Poison damage on hit"
  },
  {
    "name": "Defender",
    "damage": "1d8",
    "damageType": "slashing",
    "finesse": false,
    "description": "A protective longsword that can transfer its magic bonus to the wielder's AC.",
    "proficiencyRequired": "martial",
    "special": "Can trade attack bonus for AC bonus"
  },
  {
    "name": "Oathbow",
    "damage": "1d8",
    "damageType": "piercing",
    "finesse": false,
    "description": "A longbow that allows you to swear vengeance against a chosen foe.",
    "proficiencyRequired": "martial",
    "special": "Massive damage against sworn enemy"
  },
  {
    "name": "Staff of Striking",
    "damage": "1d6",
    "damageType": "bludgeoning",
    "finesse": false,
    "description": "A quarterstaff that can expend charges to deal devastating force damage.",
    "proficiencyRequired": "simple",
    "special": "Spend charges for extra force damage"
  },
  {
    "name": "Scimitar of Speed",
    "damage": "1d6",
    "damageType": "slashing",
    "finesse": true,
    "description": "An exceptionally light blade that allows an extra attack each round.",
    "proficiencyRequired": "martial-finesse",
    "special": "Grants extra attack action"
  }
]
```

**Changes from original:**
- Removed "Vorpal Sword" (too specific, beheading mechanics)
- Removed "Luck Blade" (less recognizable)
- Removed "Hammer of Thunderbolts" (too high-tier, Thor reference)
- Removed "Staff of Power" (too generic)
- Added "Frost Brand", "Defender", "Oathbow", "Staff of Striking" (all iconic D&D weapons)

---

## Potions & Elixirs

Combat-focused potions for healing, buffs, and tactical advantages.

```json
[
  {
    "id": "p-01",
    "name": "Potion of Healing",
    "description": "A red vial that restores 2d4+2 hit points.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "heal", "amount": "2d4+2" },
    "value": 25
  },
  {
    "id": "p-02",
    "name": "Potion of Greater Healing",
    "description": "A vibrant crimson liquid that restores 4d4+4 hit points.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "heal", "amount": "4d4+4" },
    "value": 100
  },
  {
    "id": "p-03",
    "name": "Potion of Giant Strength",
    "description": "Drinking this causes your muscles to swell with raw power.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "buff", "stat": "STR", "bonus": 4, "duration": 10 },
    "value": 200
  },
  {
    "id": "p-04",
    "name": "Potion of Heroism",
    "description": "Golden liquid that fills you with courage and vigor.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "buff", "stat": "HP_TEMP", "bonus": 10, "duration": 10 },
    "value": 150
  },
  {
    "id": "p-05",
    "name": "Potion of Fire Breath",
    "description": "Orange swirling liquid that allows you to exhale a cone of flames.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "damage", "amount": "4d6" },
    "value": 150
  },
  {
    "id": "p-06",
    "name": "Potion of Resistance",
    "description": "Grants resistance to one damage type for 1 hour.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "buff", "stat": "RESISTANCE", "bonus": 1, "duration": 60 },
    "value": 100
  },
  {
    "id": "p-07",
    "name": "Antidote",
    "description": "Clear liquid that neutralizes poison in the bloodstream.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "remove-condition", "condition": "poisoned" },
    "value": 50
  },
  {
    "id": "p-08",
    "name": "Potion of Speed",
    "description": "Quicksilver liquid that makes everything seem to move in slow motion.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "buff", "stat": "DEX", "bonus": 4, "duration": 10 },
    "value": 250
  },
  {
    "id": "p-09",
    "name": "Potion of Protection",
    "description": "Shimmering white liquid that hardens your skin like stone.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "buff", "stat": "AC", "bonus": 2, "duration": 10 },
    "value": 120
  },
  {
    "id": "p-10",
    "name": "Elixir of Health",
    "description": "Removes all diseases and conditions affecting you.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "remove-condition", "condition": "all" },
    "value": 150
  }
]
```

**Changes from original:**
- Removed "Potion of Invisibility" (STEALTH isn't a combat stat in your game)
- Removed "Potion of Flying" (scene modification, changes movement)
- Removed "Potion of Gaseous Form" (scene modification)
- Removed "Philter of Love" (not combat relevant)
- Removed "Potion of Water Breathing" (scene modification)
- Removed "Oil of Slipperiness" (niche utility)
- Added "Potion of Greater Healing", "Potion of Heroism", "Potion of Fire Breath", "Potion of Resistance", "Potion of Protection", "Elixir of Health"
- Changed effects to use actual game stats (STR, DEX, CON, AC, HP)

---

## Equipment & Magic Items

Combat-relevant equipment that provides buffs, protection, or tactical advantages.

```json
[
  {
    "id": "i-01",
    "name": "Bag of Holding",
    "description": "A seemingly ordinary sack with an interior space larger than its outside dimensions.",
    "type": "equipment",
    "usableInCombat": false,
    "value": 500
  },
  {
    "id": "i-02",
    "name": "Cloak of Protection",
    "description": "A weathered cloak that wards away both blades and spells.",
    "type": "equipment",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "AC", "bonus": 1, "duration": 9999 },
    "value": 800
  },
  {
    "id": "i-03",
    "name": "Ring of Protection",
    "description": "A simple silver band inscribed with protective runes.",
    "type": "equipment",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "AC", "bonus": 1, "duration": 9999 },
    "value": 800
  },
  {
    "id": "i-04",
    "name": "Boots of Speed",
    "description": "Winged boots that allow you to move with supernatural swiftness.",
    "type": "equipment",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "DEX", "bonus": 2, "duration": 9999 },
    "value": 1200
  },
  {
    "id": "i-05",
    "name": "Amulet of Health",
    "description": "A golden amulet that fortifies your body against harm.",
    "type": "equipment",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "CON", "bonus": 2, "duration": 9999 },
    "value": 2000
  },
  {
    "id": "i-06",
    "name": "Gauntlets of Ogre Power",
    "description": "Iron gauntlets that grant immense strength to the wearer.",
    "type": "equipment",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "STR", "bonus": 4, "duration": 9999 },
    "value": 2000
  },
  {
    "id": "i-07",
    "name": "Cloak of Displacement",
    "description": "Illusion magic makes you appear to be standing in a slightly different location.",
    "type": "equipment",
    "usableInCombat": true,
    "effect": { "type": "buff", "stat": "AC", "bonus": 2, "duration": 9999 },
    "value": 1200
  },
  {
    "id": "i-08",
    "name": "Bracers of Defense",
    "description": "Leather bracers studded with protective sigils.",
    "type": "equipment",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "AC", "bonus": 2, "duration": 9999 },
    "value": 1000
  },
  {
    "id": "i-09",
    "name": "Periapt of Wound Closure",
    "description": "A pendant that stabilizes the dying and doubles natural healing.",
    "type": "equipment",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "HEAL_BONUS", "bonus": 2, "duration": 9999 },
    "value": 800
  },
  {
    "id": "i-10",
    "name": "Ring of Spell Storing",
    "description": "A band that can hold up to five levels of spells for later use.",
    "type": "equipment",
    "usableInCombat": true,
    "value": 2000
  }
]
```

**Changes from original:**
- Kept "Bag of Holding" (too iconic to remove)
- Removed "Portable Hole" (less recognizable, utility)
- Removed "Immovable Rod" (utility/puzzle solving)
- Removed "Boots of Elvenkind" (niche stealth buff)
- Removed "Helm of Brilliance" (not recognizable, too complex)
- Removed "Decanter of Endless Water" (scene modification)
- Removed "Dust of Appearance" (niche)
- Removed "Robes of Useful Items" (scene modification, too random)
- Added "Cloak of Protection", "Ring of Protection", "Boots of Speed", "Amulet of Health", "Bracers of Defense", "Periapt of Wound Closure", "Ring of Spell Storing" (all iconic D&D items)

---

## Scrolls & Spell Scrolls

Combat-focused scrolls for damage and healing, no scene modifications.

```json
[
  {
    "id": "s-01",
    "name": "Scroll of Fireball",
    "description": "Incantation that creates a massive explosion of flame.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "damage", "amount": "8d6" },
    "value": 150
  },
  {
    "id": "s-02",
    "name": "Scroll of Magic Missile",
    "description": "Conjures unerring darts of magical force.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "damage", "amount": "3d4+3" },
    "value": 50
  },
  {
    "id": "s-03",
    "name": "Scroll of Cure Wounds",
    "description": "Divine magic that mends flesh and bone.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "heal", "amount": "1d8+4" },
    "value": 50
  },
  {
    "id": "s-04",
    "name": "Scroll of Lightning Bolt",
    "description": "A stroke of lightning forming a line 100 feet long.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "damage", "amount": "8d6" },
    "value": 150
  },
  {
    "id": "s-05",
    "name": "Scroll of Bless",
    "description": "Divine favor that grants bonuses to attacks and saving throws.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "buff", "stat": "BAB", "bonus": 1, "duration": 10 },
    "value": 50
  },
  {
    "id": "s-06",
    "name": "Scroll of Shield",
    "description": "Creates an invisible barrier of magical force.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "buff", "stat": "AC", "bonus": 5, "duration": 1 },
    "value": 100
  },
  {
    "id": "s-07",
    "name": "Scroll of Burning Hands",
    "description": "Shoots flames from your fingertips in a cone.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "damage", "amount": "3d6" },
    "value": 50
  },
  {
    "id": "s-08",
    "name": "Scroll of Hold Person",
    "description": "Paralyzes a humanoid target with magical force.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "spell", "spellName": "Hold Person" },
    "value": 150
  },
  {
    "id": "s-09",
    "name": "Scroll of Spiritual Weapon",
    "description": "Creates a floating weapon made of divine force.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "damage", "amount": "1d8+4" },
    "value": 100
  },
  {
    "id": "s-10",
    "name": "Scroll of Healing Word",
    "description": "Speak a word of divine power to restore hit points.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "heal", "amount": "1d4+4" },
    "value": 50
  }
]
```

**Changes from original:**
- Removed "Scroll of Wish" (way too powerful, reality-altering)
- Removed "Scroll of Identify" (utility, not combat)
- Removed "Scroll of Misty Step" (movement utility)
- Removed "Scroll of Fly" (scene modification)
- Removed "Scroll of Raise Dead" (very powerful, death mechanics not fully implemented)
- Removed "Scroll of Counterspell" (reactive, complex mechanics)
- Added "Scroll of Lightning Bolt", "Scroll of Bless", "Scroll of Shield", "Scroll of Burning Hands", "Scroll of Spiritual Weapon", "Scroll of Healing Word"
- All scrolls now focus on damage or healing

---

## Legendary & Quest Items

High-value items for quest rewards and treasure, avoiding reality-altering effects.

```json
[
  {
    "id": "l-01",
    "name": "Platinum Piece",
    "description": "A rare coin worth 10 gold pieces.",
    "type": "quest",
    "usableInCombat": false,
    "value": 10,
    "quantity": 1
  },
  {
    "id": "l-02",
    "name": "Golden Idol",
    "description": "A heavy golden statuette depicting an ancient deity.",
    "type": "quest",
    "usableInCombat": false,
    "value": 500
  },
  {
    "id": "l-03",
    "name": "Diamond (500gp)",
    "description": "A flawless diamond suitable for resurrection magic.",
    "type": "quest",
    "usableInCombat": false,
    "value": 500
  },
  {
    "id": "l-04",
    "name": "Ancient Spellbook",
    "description": "Leather-bound tome containing rare arcane formulae.",
    "type": "quest",
    "usableInCombat": false,
    "value": 250
  },
  {
    "id": "l-05",
    "name": "Manual of Gainful Exercise",
    "description": "A book of exercises that permanently increases Strength.",
    "type": "consumable",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "STR", "bonus": 2, "duration": 999999 },
    "value": 5000
  },
  {
    "id": "l-06",
    "name": "Tome of Understanding",
    "description": "A book of philosophy that permanently increases Wisdom.",
    "type": "consumable",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "WIS", "bonus": 2, "duration": 999999 },
    "value": 5000
  },
  {
    "id": "l-07",
    "name": "Figurine of Wondrous Power (Serpentine Owl)",
    "description": "A stone owl that transforms into a giant owl companion.",
    "type": "equipment",
    "usableInCombat": true,
    "value": 1500
  },
  {
    "id": "l-08",
    "name": "Horn of Valhalla (Silver)",
    "description": "Summons warrior spirits to fight beside you.",
    "type": "equipment",
    "usableInCombat": true,
    "value": 3000
  },
  {
    "id": "l-09",
    "name": "Ioun Stone (Insight)",
    "description": "A deep blue sphere that orbits your head, granting wisdom.",
    "type": "equipment",
    "usableInCombat": false,
    "effect": { "type": "buff", "stat": "WIS", "bonus": 2, "duration": 9999 },
    "value": 2500
  },
  {
    "id": "l-10",
    "name": "Holy Symbol of Ravenkind",
    "description": "A powerful relic that channels divine energy against undead.",
    "type": "equipment",
    "usableInCombat": true,
    "value": 5000
  }
]
```

**Changes from original:**
- Removed "Deck of Many Things" (reality-altering, too chaotic)
- Removed "Ring of Three Wishes" (way too powerful)
- Changed "Polished Diamond" to "Diamond (500gp)" with appropriate value
- Added "Tome of Understanding" (companion to Manual)
- Added "Horn of Valhalla" (summons allies, fits combat focus)
- Added "Holy Symbol of Ravenkind" (perfect for undead-heavy game)
- Changed "Figurine of Wondrous Power" to specific type (Serpentine Owl)

---

## Summary of Changes

### Removed Items (and why):

**Scene Modifications:**
- Potion of Flying, Gaseous Form, Water Breathing
- Portable Hole, Immovable Rod, Decanter of Endless Water
- Robes of Useful Items, Dust of Appearance
- Scroll of Fly, Misty Step

**Reality-Altering:**
- Scroll of Wish
- Ring of Three Wishes
- Deck of Many Things

**Non-Combat:**
- Philter of Love
- Scroll of Identify

**Less Recognizable:**
- Vorpal Sword, Luck Blade, Hammer of Thunderbolts
- Helm of Brilliance, Boots of Elvenkind

### Added Items (iconic D&D):

**Weapons:**
- Frost Brand, Defender, Oathbow, Staff of Striking

**Potions:**
- Greater Healing, Heroism, Fire Breath, Resistance, Protection, Elixir of Health

**Equipment:**
- Cloak/Ring of Protection, Boots of Speed, Amulet of Health, Bracers of Defense, Periapt of Wound Closure, Ring of Spell Storing

**Scrolls:**
- Lightning Bolt, Bless, Shield, Burning Hands, Spiritual Weapon, Healing Word

**Legendary:**
- Tome of Understanding, Horn of Valhalla, Holy Symbol of Ravenkind

---

## Integration Notes

These items are designed to work with your existing equipment system:

1. **Stat References** - All use actual game stats (STR, DEX, CON, INT, WIS, CHA, AC, BAB, HP)
2. **Effect Types** - Match your current ItemEffect types (heal, buff, damage, spell, remove-condition)
3. **Proficiency System** - Weapons include proficiencyRequired field
4. **Combat Focus** - All items support healing or offensive play
5. **Enemy Alignment** - Multiple items specifically target undead (Holy Avenger, Sun Blade, Mace of Disruption, Holy Symbol)

No items require unimplemented mechanics like:
- Underwater movement
- Flight systems
- Love/charm mechanics
- Reality warping
- Extensive puzzle solving
