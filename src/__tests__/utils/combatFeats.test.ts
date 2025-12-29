import { describe, it, expect, beforeEach } from 'vitest';
import { applyAttackFeat, applyAbilityFeat } from '../../utils/combatFeats';
import type { Character } from '../../types/character';
import type { Condition } from '../../types/condition';

describe('Combat Feats', () => {
  let testCharacter: Character;
  let emptyConditions: Condition[];

  beforeEach(() => {
    testCharacter = {
      name: 'Test Fighter',
      avatarPath: 'fighter.png',
      class: 'Fighter',
      level: 5,
      attributes: { STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 13, CHA: 8 },
      hp: 50,
      maxHp: 50,
      ac: 16,
      bab: 5,
      saves: { fortitude: 6, reflex: 3, will: 2 },
      skills: {
        Athletics: 5,
        Stealth: 0,
        Perception: 2,
        Arcana: 0,
        Medicine: 0,
        Intimidate: 1,
      },
      feats: [],
      equipment: {
        weapon: {
          id: 'longsword',
          name: 'Longsword',
          damage: '1d8',
          damageType: 'slashing',
          finesse: false,
          description: 'A versatile sword',
        },
        weapons: [],
        armor: null,
        shield: null,
        items: [],
      },
      resources: {
        abilities: [
          {
            name: 'Second Wind',
            type: 'encounter',
            maxUses: 1,
            currentUses: 1,
            description: 'Heal yourself',
          },
        ],
      },
    } as Character;
    emptyConditions = [];
  });

  describe('Attack Variant Feats', () => {
    describe('Power Attack', () => {
      it('applies -2 attack penalty and +4 damage bonus', () => {
        const result = applyAttackFeat(testCharacter, 'power_attack', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.attackModifiers).toBeDefined();
        expect(result.attackModifiers?.attackBonus).toBe(-2);
        expect(result.attackModifiers?.damageBonus).toBe(4);
        expect(result.attackModifiers?.label).toBe('Power Attack');
      });

      it('does not consume resources', () => {
        const result = applyAttackFeat(testCharacter, 'power_attack', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.character).toEqual(testCharacter);
        expect(result.log).toHaveLength(0);
      });
    });

    describe('Channel Smite', () => {
      beforeEach(() => {
        testCharacter.class = 'Cleric';
        testCharacter.resources.abilities.push({
          name: 'Channel Energy',
          type: 'daily',
          maxUses: 3,
          currentUses: 3,
          description: 'Channel divine energy',
        });
      });

      it('adds +2d6 holy damage when Channel Energy is available', () => {
        const result = applyAttackFeat(testCharacter, 'channel_smite', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.attackModifiers?.bonusDamage).toBe('2d6');
        expect(result.log.length).toBeGreaterThan(0);
      });

      it('consumes one use of Channel Energy', () => {
        const result = applyAttackFeat(testCharacter, 'channel_smite', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.character).not.toEqual(testCharacter);
        const channelEnergy = result.character.resources.abilities.find(
          (a) => a.name === 'Channel Energy'
        );
        expect(channelEnergy?.currentUses).toBe(2);
      });

      it('fails when Channel Energy is depleted', () => {
        // Deplete Channel Energy
        testCharacter.resources.abilities.find((a) => a.name === 'Channel Energy')!.currentUses = 0;

        const result = applyAttackFeat(testCharacter, 'channel_smite', emptyConditions, 1);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Not enough resources');
      });
    });

    describe('Bloody Assault', () => {
      it('applies Bleeding condition to target on hit', () => {
        const result = applyAttackFeat(testCharacter, 'bloody_assault', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.conditionsToApply).toBeDefined();
        expect(result.conditionsToApply?.length).toBeGreaterThan(0);
        expect(result.conditionsToApply?.[0].type).toBe('Bleeding');
        expect(result.conditionsToApply?.[0].duration).toBe(3);
      });

      it('applies -2 attack penalty', () => {
        const result = applyAttackFeat(testCharacter, 'bloody_assault', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.attackModifiers?.attackBonus).toBe(-2);
      });
    });

    describe('Guided Hand', () => {
      it('allows using WIS for attack rolls', () => {
        const result = applyAttackFeat(testCharacter, 'guided_hand', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.attackModifiers?.useWisForAttack).toBe(true);
      });
    });

    describe('Combat Expertise', () => {
      it('trades -2 attack for +2 AC', () => {
        const result = applyAttackFeat(testCharacter, 'combat_expertise', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.attackModifiers?.attackBonus).toBe(-2);
        expect(result.attackModifiers?.acModifier).toBe(2);
      });
    });
  });

  describe('Ability Feats', () => {
    describe('Defensive Channel', () => {
      beforeEach(() => {
        testCharacter.class = 'Cleric';
        testCharacter.resources.abilities.push({
          name: 'Channel Energy',
          type: 'daily',
          maxUses: 3,
          currentUses: 3,
          description: 'Channel divine energy',
        });
      });

      it('applies Defensive Channel condition when used', () => {
        const result = applyAbilityFeat(testCharacter, 'defensive_channel', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.conditions).toBeDefined();
        expect(result.conditions?.length).toBeGreaterThan(0);

        const defensiveCondition = result.conditions?.find(c => c.type === 'Defensive Channel');
        expect(defensiveCondition).toBeDefined();
        expect(defensiveCondition?.modifiers.acBonus).toBe(4);
      });

      it('consumes one use of Channel Energy', () => {
        const result = applyAbilityFeat(testCharacter, 'defensive_channel', emptyConditions, 1);

        expect(result.success).toBe(true);
        const channelEnergy = result.character.resources.abilities.find(
          (a) => a.name === 'Channel Energy'
        );
        expect(channelEnergy?.currentUses).toBe(2);
      });

      it('fails when Channel Energy is depleted', () => {
        testCharacter.resources.abilities.find((a) => a.name === 'Channel Energy')!.currentUses = 0;

        const result = applyAbilityFeat(testCharacter, 'defensive_channel', emptyConditions, 1);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Not enough resources');
      });

      it('logs feat usage', () => {
        const result = applyAbilityFeat(testCharacter, 'defensive_channel', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.log.length).toBeGreaterThan(0);
        expect(result.log.some(msg => msg.includes('Defensive Channel'))).toBe(true);
      });
    });

    describe('Empower Spell', () => {
      beforeEach(() => {
        testCharacter.class = 'Wizard';
        testCharacter.resources.spellSlots = {
          level0: { max: 999, current: 999 },
          level1: { max: 3, current: 3 },
        };
      });

      it('consumes a level 1 spell slot when used', () => {
        const result = applyAbilityFeat(testCharacter, 'empower_spell', emptyConditions, 1);

        expect(result.success).toBe(true);
        expect(result.character.resources.spellSlots?.level1.current).toBe(2);
      });

      it('fails when no spell slots remain', () => {
        testCharacter.resources.spellSlots!.level1.current = 0;

        const result = applyAbilityFeat(testCharacter, 'empower_spell', emptyConditions, 1);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Not enough resources');
      });
    });
  });

  describe('Error Handling', () => {
    it('returns error for non-existent feat', () => {
      const result = applyAttackFeat(testCharacter, 'fake_feat', emptyConditions, 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Feat not found');
    });

    it('returns error when using attack feat as ability', () => {
      const result = applyAbilityFeat(testCharacter, 'power_attack', emptyConditions, 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not an ability');
    });

    it('returns error when using ability feat as attack', () => {
      testCharacter.resources.abilities.push({
        name: 'Channel Energy',
        type: 'daily',
        maxUses: 3,
        currentUses: 3,
        description: 'Channel divine energy',
      });

      const result = applyAttackFeat(testCharacter, 'defensive_channel', emptyConditions, 1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not an attack variant');
    });
  });
});
