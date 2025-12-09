import { describe, it, expect } from 'vitest';
import { createCharacter, calculateHP, calculateAC, calculateSaves } from '../../utils/characterCreation';
import type { Attributes, SkillRanks } from '../../types';

describe('utils/characterCreation', () => {
  const testAttributes: Attributes = {
    STR: 16,
    DEX: 12,
    CON: 14,
    INT: 10,
    WIS: 10,
    CHA: 8,
  };

  describe('calculateHP', () => {
    it('calculates Fighter HP correctly (base 15 for level 1)', () => {
      const hp = calculateHP('Fighter', 1, testAttributes);
      // Fighter: baseHP 15 (already includes CON bonus from plan)
      expect(hp).toBe(15);
    });

    it('calculates Rogue HP correctly (base 13 for level 1)', () => {
      const hp = calculateHP('Rogue', 1, testAttributes);
      expect(hp).toBe(13);
    });

    it('calculates Wizard HP correctly (base 10 for level 1)', () => {
      const hp = calculateHP('Wizard', 1, testAttributes);
      expect(hp).toBe(10);
    });

    it('calculates Cleric HP correctly (base 13 for level 1)', () => {
      const hp = calculateHP('Cleric', 1, testAttributes);
      expect(hp).toBe(13);
    });
  });

  describe('calculateAC', () => {
    it('calculates Fighter AC correctly (chainmail + shield + DEX)', () => {
      const fighterAttributes: Attributes = {
        STR: 16,
        DEX: 12, // +1 modifier
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      };
      const ac = calculateAC('Fighter', fighterAttributes);
      // Chainmail (16) + Shield (2) + DEX mod (+1, capped at +2 by medium armor) = 19
      expect(ac).toBe(19);
    });

    it('calculates Rogue AC correctly (leather + DEX)', () => {
      const rogueAttributes: Attributes = {
        STR: 10,
        DEX: 16, // +3 modifier
        CON: 12,
        INT: 14,
        WIS: 12,
        CHA: 10,
      };
      const ac = calculateAC('Rogue', rogueAttributes);
      // Leather (12) + DEX mod (+3, no cap) = 15
      expect(ac).toBe(15);
    });

    it('calculates Wizard AC correctly (no armor + DEX)', () => {
      const wizardAttributes: Attributes = {
        STR: 8,
        DEX: 14, // +2 modifier
        CON: 12,
        INT: 16,
        WIS: 12,
        CHA: 10,
      };
      const ac = calculateAC('Wizard', wizardAttributes);
      // No armor (10) + DEX mod (+2, no cap) = 12
      expect(ac).toBe(12);
    });

    it('respects armor DEX cap for medium armor', () => {
      const highDexFighter: Attributes = {
        STR: 14,
        DEX: 18, // +4 modifier, but capped at +2 by chainmail
        CON: 14,
        INT: 10,
        WIS: 10,
        CHA: 8,
      };
      const ac = calculateAC('Fighter', highDexFighter);
      // Chainmail (16) + Shield (2) + DEX mod (+2 capped, not +4) = 20
      expect(ac).toBe(20);
    });
  });

  describe('calculateSaves', () => {
    it('calculates Fighter saves correctly (good Fort, poor Ref/Will)', () => {
      const saves = calculateSaves('Fighter', testAttributes);
      // Fort: base 2 + CON mod (+2) = 4
      // Ref: base 0 + DEX mod (+1) = 1
      // Will: base 0 + WIS mod (0) = 0
      expect(saves.fortitude).toBe(4);
      expect(saves.reflex).toBe(1);
      expect(saves.will).toBe(0);
    });

    it('calculates Rogue saves correctly (good Ref, poor Fort/Will)', () => {
      const rogueAttributes: Attributes = {
        STR: 10,
        DEX: 16, // +3
        CON: 12, // +1
        INT: 14,
        WIS: 12, // +1
        CHA: 10,
      };
      const saves = calculateSaves('Rogue', rogueAttributes);
      // Fort: base 0 + CON mod (+1) = 1
      // Ref: base 2 + DEX mod (+3) = 5
      // Will: base 0 + WIS mod (+1) = 1
      expect(saves.fortitude).toBe(1);
      expect(saves.reflex).toBe(5);
      expect(saves.will).toBe(1);
    });

    it('calculates Wizard saves correctly (good Will, poor Fort/Ref)', () => {
      const wizardAttributes: Attributes = {
        STR: 8,
        DEX: 14, // +2
        CON: 12, // +1
        INT: 16,
        WIS: 12, // +1
        CHA: 10,
      };
      const saves = calculateSaves('Wizard', wizardAttributes);
      // Fort: base 0 + CON mod (+1) = 1
      // Ref: base 0 + DEX mod (+2) = 2
      // Will: base 2 + WIS mod (+1) = 3
      expect(saves.fortitude).toBe(1);
      expect(saves.reflex).toBe(2);
      expect(saves.will).toBe(3);
    });

    it('calculates Cleric saves correctly (good Fort/Will, poor Ref)', () => {
      const clericAttributes: Attributes = {
        STR: 14,
        DEX: 10, // +0
        CON: 14, // +2
        INT: 10,
        WIS: 16, // +3
        CHA: 8,
      };
      const saves = calculateSaves('Cleric', clericAttributes);
      // Fort: base 1 + CON mod (+2) = 3
      // Ref: base 0 + DEX mod (+0) = 0
      // Will: base 1 + WIS mod (+3) = 4
      expect(saves.fortitude).toBe(3);
      expect(saves.reflex).toBe(0);
      expect(saves.will).toBe(4);
    });
  });

  describe('createCharacter', () => {
    it('creates a Fighter with all correct stats', () => {
      const skills: SkillRanks = {
        Athletics: 4,
        Stealth: 0,
        Perception: 0,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 1,
      };

      const fighter = createCharacter({
        name: 'Test Fighter',
        class: 'Fighter',
        attributes: testAttributes,
        skillRanks: skills,
        selectedFeat: 'Weapon Focus',
      });

      expect(fighter.name).toBe('Test Fighter');
      expect(fighter.class).toBe('Fighter');
      expect(fighter.level).toBe(1);
      expect(fighter.hp).toBe(15);
      expect(fighter.maxHp).toBe(15);
      expect(fighter.ac).toBe(19);
      expect(fighter.bab).toBe(1);
      expect(fighter.saves.fortitude).toBe(4);
      expect(fighter.skills).toEqual(skills);
      expect(fighter.feats).toHaveLength(1);
      expect(fighter.feats[0].name).toBe('Weapon Focus');
      expect(fighter.equipment.weapon.name).toBe('Longsword');
      expect(fighter.equipment.armor.name).toBe('Chainmail');
      expect(fighter.equipment.shield.equipped).toBe(true);
    });

    it('creates a Rogue with correct equipment and no feats', () => {
      const skills: SkillRanks = {
        Athletics: 0,
        Stealth: 4,
        Perception: 4,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 0,
      };

      const rogue = createCharacter({
        name: 'Test Rogue',
        class: 'Rogue',
        attributes: {
          STR: 10,
          DEX: 16,
          CON: 12,
          INT: 14,
          WIS: 12,
          CHA: 10,
        },
        skillRanks: skills,
      });

      expect(rogue.class).toBe('Rogue');
      expect(rogue.feats).toHaveLength(0); // Rogue doesn't get feat at level 1
      expect(rogue.equipment.weapon.name).toBe('Rapier');
      expect(rogue.equipment.weapon.finesse).toBe(true);
      expect(rogue.equipment.armor.name).toBe('Leather');
      expect(rogue.equipment.shield.equipped).toBe(false);
      expect(rogue.equipment.items).toHaveLength(2); // 1 potion item (qty 2) + 1 smoke bomb
      expect(rogue.equipment.items[0].quantity).toBe(2); // Healing potions
      expect(rogue.equipment.items[1].name).toBe('Smoke Bomb');
    });

    it('creates a Wizard with spell slots', () => {
      const skills: SkillRanks = {
        Athletics: 0,
        Stealth: 0,
        Perception: 0,
        Arcana: 4,
        Medicine: 0,
        Intimidate: 0,
      };

      const wizard = createCharacter({
        name: 'Test Wizard',
        class: 'Wizard',
        attributes: {
          STR: 8,
          DEX: 14,
          CON: 12,
          INT: 16,
          WIS: 12,
          CHA: 10,
        },
        skillRanks: skills,
      });

      expect(wizard.class).toBe('Wizard');
      expect(wizard.resources.spellSlots).toBeDefined();
      expect(wizard.resources.spellSlots?.level1.max).toBe(2);
      expect(wizard.resources.spellSlots?.level1.current).toBe(2);
      expect(wizard.equipment.items).toHaveLength(2); // 1 potion item (qty 2) + 1 scroll item (qty 2)
      expect(wizard.equipment.items[0].quantity).toBe(2); // Healing potions
      expect(wizard.equipment.items[1].name).toBe('Arcane Scroll');
      expect(wizard.equipment.items[1].quantity).toBe(2); // Scrolls
    });

    it('creates a Cleric with divine abilities', () => {
      const skills: SkillRanks = {
        Athletics: 0,
        Stealth: 0,
        Perception: 0,
        Arcana: 0,
        Medicine: 4,
        Intimidate: 0,
      };

      const cleric = createCharacter({
        name: 'Test Cleric',
        class: 'Cleric',
        attributes: {
          STR: 14,
          DEX: 10,
          CON: 14,
          INT: 10,
          WIS: 16,
          CHA: 8,
        },
        skillRanks: skills,
      });

      expect(cleric.class).toBe('Cleric');
      expect(cleric.resources.spellSlots).toBeDefined();
      expect(cleric.resources.spellSlots?.level1.max).toBe(2);
      expect(cleric.resources.abilities).toContainEqual(
        expect.objectContaining({ name: 'Channel Energy' })
      );
      expect(cleric.resources.abilities).toContainEqual(
        expect.objectContaining({ name: 'Turn Undead' })
      );
    });
  });
});
