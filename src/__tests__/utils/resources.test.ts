import { describe, it, expect, beforeEach } from 'vitest';
import {
  restoreResources,
  consumeAbilityResource,
  hasAbilityResource,
  consumeSpellSlot,
  hasSpellSlot,
} from '../../utils/resources';
import type { Character } from '../../types/character';

describe('Resource Management', () => {
  let testCharacter: Character;

  beforeEach(() => {
    testCharacter = {
      name: 'Test Character',
      avatarPath: 'test.png',
      class: 'Cleric',
      level: 3,
      attributes: { STR: 14, DEX: 10, CON: 12, INT: 10, WIS: 16, CHA: 12 },
      hp: 20,
      maxHp: 20,
      ac: 15,
      bab: 2,
      saves: { fortitude: 5, reflex: 1, will: 5 },
      skills: {
        Athletics: 0,
        Stealth: 0,
        Perception: 3,
        Arcana: 0,
        Medicine: 3,
        Intimidate: 0,
      },
      feats: [],
      equipment: {
        weapon: null,
        weapons: [],
        armor: null,
        shield: null,
        items: [],
      },
      resources: {
        abilities: [
          {
            name: 'Channel Energy',
            type: 'daily',
            maxUses: 3,
            currentUses: 1,
            description: 'Channel divine energy',
          },
          {
            name: 'Turn Undead',
            type: 'encounter',
            maxUses: 2,
            currentUses: 0,
            description: 'Turn undead creatures',
          },
        ],
        spellSlots: {
          level0: { max: 999, current: 999 },
          level1: { max: 2, current: 1 },
        },
      },
    } as Character;
  });

  describe('restoreResources', () => {
    it('restores all ability resources to maximum', () => {
      const restored = restoreResources(testCharacter);

      const channelEnergy = restored.resources.abilities.find((a) => a.name === 'Channel Energy');
      const turnUndead = restored.resources.abilities.find((a) => a.name === 'Turn Undead');

      expect(channelEnergy?.currentUses).toBe(3);
      expect(turnUndead?.currentUses).toBe(2);
    });

    it('restores all spell slots to maximum', () => {
      const restored = restoreResources(testCharacter);

      expect(restored.resources.spellSlots?.level1.current).toBe(2);
      expect(restored.resources.spellSlots?.level0.current).toBe(999);
    });

    it('does not mutate original character', () => {
      const originalCurrentUses = testCharacter.resources.abilities[0].currentUses;
      const restored = restoreResources(testCharacter);

      expect(testCharacter.resources.abilities[0].currentUses).toBe(originalCurrentUses);
      expect(restored.resources.abilities[0].currentUses).not.toBe(originalCurrentUses);
    });

    it('handles character with no spell slots', () => {
      const fighterCharacter = { ...testCharacter, resources: { abilities: testCharacter.resources.abilities } };

      const restored = restoreResources(fighterCharacter);

      expect(restored.resources.spellSlots).toBeUndefined();
    });
  });

  describe('consumeAbilityResource', () => {
    it('decrements available ability resource by 1', () => {
      const updated = consumeAbilityResource(testCharacter, 'Channel Energy');

      expect(updated).not.toBeNull();
      const channelEnergy = updated!.resources.abilities.find((a) => a.name === 'Channel Energy');
      expect(channelEnergy?.currentUses).toBe(0);
    });

    it('returns null when ability is depleted', () => {
      const updated = consumeAbilityResource(testCharacter, 'Turn Undead');

      expect(updated).toBeNull();
    });

    it('returns null when ability does not exist', () => {
      const updated = consumeAbilityResource(testCharacter, 'Fake Ability');

      expect(updated).toBeNull();
    });

    it('does not mutate original character', () => {
      const originalUses = testCharacter.resources.abilities[0].currentUses;
      consumeAbilityResource(testCharacter, 'Channel Energy');

      expect(testCharacter.resources.abilities[0].currentUses).toBe(originalUses);
    });
  });

  describe('hasAbilityResource', () => {
    it('returns true when ability has uses remaining', () => {
      const hasResource = hasAbilityResource(testCharacter, 'Channel Energy');

      expect(hasResource).toBe(true);
    });

    it('returns false when ability is depleted', () => {
      const hasResource = hasAbilityResource(testCharacter, 'Turn Undead');

      expect(hasResource).toBe(false);
    });

    it('returns false when ability does not exist', () => {
      const hasResource = hasAbilityResource(testCharacter, 'Fake Ability');

      expect(hasResource).toBe(false);
    });

    it('returns true for at-will abilities regardless of uses', () => {
      testCharacter.resources.abilities.push({
        name: 'At-Will Ability',
        type: 'at-will',
        maxUses: 0,
        currentUses: 0,
        description: 'Unlimited use',
      });

      const hasResource = hasAbilityResource(testCharacter, 'At-Will Ability');

      expect(hasResource).toBe(true);
    });
  });

  describe('consumeSpellSlot', () => {
    it('decrements available spell slot by 1', () => {
      const updated = consumeSpellSlot(testCharacter, 1);

      expect(updated).not.toBeNull();
      expect(updated!.resources.spellSlots?.level1.current).toBe(0);
    });

    it('returns null when spell slot is depleted', () => {
      testCharacter.resources.spellSlots!.level1.current = 0;

      const updated = consumeSpellSlot(testCharacter, 1);

      expect(updated).toBeNull();
    });

    it('returns null when character has no spell slots', () => {
      const fighterCharacter = { ...testCharacter, resources: { abilities: [] } };

      const updated = consumeSpellSlot(fighterCharacter, 1);

      expect(updated).toBeNull();
    });

    it('handles cantrip slots (level 0)', () => {
      const updated = consumeSpellSlot(testCharacter, 0);

      expect(updated).not.toBeNull();
      expect(updated!.resources.spellSlots?.level0.current).toBe(998);
    });

    it('does not mutate original character', () => {
      const originalSlots = testCharacter.resources.spellSlots!.level1.current;
      consumeSpellSlot(testCharacter, 1);

      expect(testCharacter.resources.spellSlots!.level1.current).toBe(originalSlots);
    });
  });

  describe('hasSpellSlot', () => {
    it('returns true when spell slot is available', () => {
      const hasSlot = hasSpellSlot(testCharacter, 1);

      expect(hasSlot).toBe(true);
    });

    it('returns false when spell slot is depleted', () => {
      testCharacter.resources.spellSlots!.level1.current = 0;

      const hasSlot = hasSpellSlot(testCharacter, 1);

      expect(hasSlot).toBe(false);
    });

    it('returns false when character has no spell slots', () => {
      const fighterCharacter = { ...testCharacter, resources: { abilities: [] } };

      const hasSlot = hasSpellSlot(fighterCharacter, 1);

      expect(hasSlot).toBe(false);
    });

    it('handles cantrip slots (level 0)', () => {
      const hasSlot = hasSpellSlot(testCharacter, 0);

      expect(hasSlot).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles character with empty abilities array', () => {
      testCharacter.resources.abilities = [];

      const hasResource = hasAbilityResource(testCharacter, 'Channel Energy');
      expect(hasResource).toBe(false);

      const updated = consumeAbilityResource(testCharacter, 'Channel Energy');
      expect(updated).toBeNull();
    });

    it('handles multiple consecutive resource consumption', () => {
      let updated = testCharacter;

      // Consume all 3 Channel Energy uses (1 already used, 2 remaining)
      updated = consumeAbilityResource(updated, 'Channel Energy')!;
      expect(updated).not.toBeNull();

      // Should fail on second attempt (depleted)
      const finalUpdate = consumeAbilityResource(updated, 'Channel Energy');
      expect(finalUpdate).toBeNull();
    });

    it('handles restoring from completely depleted state', () => {
      // Deplete everything
      testCharacter.resources.abilities.forEach((a) => {
        a.currentUses = 0;
      });
      testCharacter.resources.spellSlots!.level1.current = 0;
      testCharacter.resources.spellSlots!.level0.current = 0;

      const restored = restoreResources(testCharacter);

      // All should be restored
      expect(restored.resources.abilities.every((a) => a.currentUses === a.maxUses)).toBe(true);
      expect(restored.resources.spellSlots?.level1.current).toBe(2);
      expect(restored.resources.spellSlots?.level0.current).toBe(999);
    });
  });
});
