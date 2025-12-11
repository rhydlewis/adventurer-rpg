import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Character, Creature, CombatState } from '../../types';
import type { AttackAction } from '../../types/action';

// Mock dice utilities
vi.mock('../../utils/dice', () => ({
  rollAttack: vi.fn(),
  rollDamage: vi.fn(),
  calculateModifier: vi.fn(),
  roll: vi.fn(),
}));

// Mock critical utilities
vi.mock('../../utils/criticals', () => ({
  isCriticalHit: vi.fn(),
  isCriticalFumble: vi.fn(),
  calculateCriticalDamage: vi.fn(),
  rollFumbleEffect: vi.fn(),
}));

import { performAttack, resolveCombatRound } from '../../utils/combat';
import { rollAttack, rollDamage, calculateModifier } from '../../utils/dice';
import { isCriticalHit, isCriticalFumble, rollFumbleEffect } from '../../utils/criticals';

// Test fixtures
const createTestCharacter = (overrides?: Partial<Character>): Character => ({
  name: 'Test Hero',
  class: 'Fighter',
  level: 1,
  attributes: {
    STR: 16,
    DEX: 12,
    CON: 14,
    INT: 10,
    WIS: 10,
    CHA: 8,
  },
  hp: 15,
  maxHp: 15,
  ac: 18,
  bab: 1,
  saves: {
    fortitude: 2,
    reflex: 0,
    will: 0,
  },
  skills: {
    Athletics: 0,
    Stealth: 0,
    Perception: 0,
    Arcana: 0,
    Medicine: 0,
    Intimidate: 0,
  },
  feats: [],
  equipment: {
    weapon: {
      name: 'Longsword',
      damage: '1d8',
      damageType: 'slashing',
      finesse: false,
      description: 'A standard longsword',
    },
    armor: {
      name: 'Chainmail',
      baseAC: 16,
      maxDexBonus: 2,
      description: 'Standard chainmail armor',
    },
    shield: {
      equipped: true,
      acBonus: 2,
    },
    items: [],
  },
  resources: {
    abilities: [],
  },
  ...overrides,
});

const createTestEnemy = (overrides?: Partial<Creature>): Creature => ({
  name: 'Goblin',
  class: 'Fighter',
  level: 1,
  attributes: {
    STR: 12,
    DEX: 14,
    CON: 10,
    INT: 8,
    WIS: 8,
    CHA: 6,
  },
  hp: 8,
  maxHp: 8,
  ac: 15,
  bab: 1,
  saves: {
    fortitude: 0,
    reflex: 2,
    will: 0,
  },
  skills: {
    Athletics: 0,
    Stealth: 0,
    Perception: 0,
    Arcana: 0,
    Medicine: 0,
    Intimidate: 0,
  },
  feats: [],
  equipment: {
    weapon: {
      name: 'Dagger',
      damage: '1d4',
      damageType: 'piercing',
      finesse: true,
      description: 'A small dagger',
    },
    armor: {
      name: 'Leather',
      baseAC: 12,
      maxDexBonus: null,
      description: 'Light leather armor',
    },
    shield: {
      equipped: false,
      acBonus: 0,
    },
    items: [],
  },
  resources: {
    abilities: [],
  },
  ...overrides,
});

// Default attack action for tests
const attackAction: AttackAction = {
  type: 'attack',
  name: 'Attack',
  description: 'Basic attack',
  available: true,
};

describe('utils/combat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no crits or fumbles unless specifically testing them
    vi.mocked(isCriticalHit).mockReturnValue(false);
    vi.mocked(isCriticalFumble).mockReturnValue(false);
  });

  describe('performAttack', () => {
    it('calculates hit when attack roll >= AC', () => {
      const attacker = createTestCharacter();
      const defender = createTestEnemy({ ac: 15 });

      vi.mocked(calculateModifier).mockReturnValue(3); // STR 16 = +3
      vi.mocked(rollAttack).mockReturnValue({
        total: 17, // >= AC 15
        d20Result: 13,
        output: '1d20+4: [13]+4 = 17',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 9,
        output: '1d8+3: [6]+3 = 9',
      });

      const result = performAttack(attacker, defender);

      expect(result.hit).toBe(true);
      expect(result.attackTotal).toBe(17);
      expect(result.damage).toBe(9);
      expect(result.output).toContain('HIT!');
      expect(result.output).toContain('vs AC 15');
    });

    it('calculates miss when attack roll < AC', () => {
      const attacker = createTestCharacter();
      const defender = createTestEnemy({ ac: 15 });

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 12, // < AC 15
        d20Result: 8,
        output: '1d20+4: [8]+4 = 12',
      });

      const result = performAttack(attacker, defender);

      expect(result.hit).toBe(false);
      expect(result.damage).toBeUndefined();
      expect(result.output).toContain('MISS!');
      expect(result.output).toContain('vs AC 15');
    });

    it('includes damage only on hit', () => {
      const attacker = createTestCharacter();
      const defender = createTestEnemy();

      // Hit
      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 20,
        d20Result: 16,
        output: '1d20+4: [16]+4 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 7,
        output: '1d8+3: [4]+3 = 7',
      });

      const hitResult = performAttack(attacker, defender);
      expect(hitResult.damage).toBe(7);
      expect(rollDamage).toHaveBeenCalledWith('1d8', 3);

      // Miss
      vi.clearAllMocks();
      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 10,
        d20Result: 6,
        output: '1d20+4: [6]+4 = 10',
      });

      const missResult = performAttack(attacker, defender);
      expect(missResult.damage).toBeUndefined();
      expect(rollDamage).not.toHaveBeenCalled();
    });

    it('uses STR modifier for attack and damage', () => {
      const attacker = createTestCharacter({ attributes: { ...createTestCharacter().attributes, STR: 18 } });
      const defender = createTestEnemy();

      vi.mocked(calculateModifier).mockReturnValue(4); // STR 18 = +4
      vi.mocked(rollAttack).mockReturnValue({
        total: 19,
        d20Result: 14,
        output: '1d20+5: [14]+5 = 19',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 10,
        output: '1d8+4: [6]+4 = 10',
      });

      performAttack(attacker, defender);

      expect(calculateModifier).toHaveBeenCalledWith(18);
      expect(rollAttack).toHaveBeenCalledWith(attacker.bab, 4);
      expect(rollDamage).toHaveBeenCalledWith('1d8', 4);
    });

    it('returns proper d20 result for critical hit checking', () => {
      const attacker = createTestCharacter();
      const defender = createTestEnemy();

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 24,
        d20Result: 20, // Natural 20
        output: '1d20+4: [20]+4 = 24',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 11,
        output: '1d8+3: [8]+3 = 11',
      });

      const result = performAttack(attacker, defender);

      expect(result.attackRoll).toBe(20);
    });
  });

  describe('resolveCombatRound', () => {
    it('player attacks first, then enemy', () => {
      const player = createTestCharacter();
      const enemy = createTestEnemy();
      const state: CombatState = {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: [],
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 20,
        d20Result: 16,
        output: '1d20+4: [16]+4 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 3, // Low damage so both survive
        output: '1d8+3: [0]+3 = 3',
      });

      const result = resolveCombatRound(state, attackAction);

      expect(result.log).toHaveLength(2);
      expect(result.log[0].actor).toBe('player');
      expect(result.log[1].actor).toBe('enemy');
    });

    it('deducts HP on successful hits', () => {
      const player = createTestCharacter();
      const enemy = createTestEnemy({ hp: 10 });
      const state: CombatState = {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: [],
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 20,
        d20Result: 16,
        output: '1d20+4: [16]+4 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 5,
        output: '1d8+3: [2]+3 = 5',
      });

      const result = resolveCombatRound(state, attackAction);

      // Player hits, enemy takes 5 damage (10 - 5 = 5)
      expect(result.enemy.hp).toBe(5);
      // Enemy hits, player takes 5 damage (15 - 5 = 10)
      expect(result.playerCharacter.hp).toBe(10);
    });

    it('sets winner to player when enemy HP <= 0', () => {
      const player = createTestCharacter();
      const enemy = createTestEnemy({ hp: 3 }); // Low HP
      const state: CombatState = {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: [],
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 20,
        d20Result: 16,
        output: '1d20+4: [16]+4 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 8, // Kills enemy
        output: '1d8+3: [5]+3 = 8',
      });

      const result = resolveCombatRound(state, attackAction);

      expect(result.enemy.hp).toBeLessThanOrEqual(0);
      expect(result.winner).toBe('player');
      expect(result.log).toHaveLength(2); // Player attack + defeat message
      expect(result.log[1].actor).toBe('system');
      expect(result.log[1].message).toContain('defeated');
    });

    it('sets winner to enemy when player HP <= 0', () => {
      const player = createTestCharacter({ hp: 3 }); // Low HP
      const enemy = createTestEnemy();
      const state: CombatState = {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: [],
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(1);

      // Player misses
      vi.mocked(rollAttack).mockReturnValueOnce({
        total: 10,
        d20Result: 6,
        output: '1d20+2: [6]+2 = 10',
      });

      // Enemy hits and kills player
      vi.mocked(rollAttack).mockReturnValueOnce({
        total: 20,
        d20Result: 18,
        output: '1d20+2: [18]+2 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 5, // Kills player
        output: '1d6+1: [4]+1 = 5',
      });

      const result = resolveCombatRound(state, attackAction);

      expect(result.playerCharacter.hp).toBeLessThanOrEqual(0);
      expect(result.winner).toBe('enemy');
      expect(result.log[result.log.length - 1].actor).toBe('system');
      expect(result.log[result.log.length - 1].message).toContain('defeated');
    });

    it('increments turn number when both alive', () => {
      const player = createTestCharacter();
      const enemy = createTestEnemy();
      const state: CombatState = {
        turn: 3,
        playerCharacter: player,
        enemy: enemy,
        log: [],
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 20,
        d20Result: 16,
        output: '1d20+4: [16]+4 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 3, // Not enough to kill
        output: '1d8+3: [0]+3 = 3',
      });

      const result = resolveCombatRound(state, attackAction);

      expect(result.turn).toBe(4);
      expect(result.winner).toBeNull();
    });

    it('adds combat log entries with correct turn number', () => {
      const player = createTestCharacter();
      const enemy = createTestEnemy();
      const state: CombatState = {
        turn: 2,
        playerCharacter: player,
        enemy: enemy,
        log: [{ turn: 1, actor: 'system', message: 'Combat start' }],
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 20,
        d20Result: 16,
        output: '1d20+4: [16]+4 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 5,
        output: '1d8+3: [2]+3 = 5',
      });

      const result = resolveCombatRound(state, attackAction);

      expect(result.log).toHaveLength(3); // Existing + player + enemy
      expect(result.log[0].turn).toBe(1); // Preserved
      expect(result.log[1].turn).toBe(2); // Player attack
      expect(result.log[2].turn).toBe(2); // Enemy attack
    });

    it('preserves immutability of original state', () => {
      const player = createTestCharacter();
      const enemy = createTestEnemy();
      const originalLog = [{ turn: 1, actor: 'system' as const, message: 'Start' }];
      const state: CombatState = {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: originalLog,
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 20,
        d20Result: 16,
        output: '1d20+4: [16]+4 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 5,
        output: '1d8+3: [2]+3 = 5',
      });

      const result = resolveCombatRound(state, attackAction);

      // Original state unchanged
      expect(state.log).toHaveLength(1);
      expect(state.log).toBe(originalLog);

      // New state has new log
      expect(result.log).toHaveLength(3);
      expect(result.log).not.toBe(originalLog);
    });

    it('loses turn after drop_weapon fumble', () => {
      const player = createTestCharacter();
      const enemy = createTestEnemy();
      const state: CombatState = {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: [],
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(3);

      // Player fumbles with drop_weapon
      vi.mocked(isCriticalFumble).mockReturnValueOnce(true);
      vi.mocked(rollFumbleEffect).mockReturnValueOnce({
        type: 'drop_weapon',
        description: 'You drop your weapon! Lose next turn picking it up.',
        loseTurn: true,
      });
      vi.mocked(rollAttack).mockReturnValueOnce({
        total: 5,
        d20Result: 1,
        output: '1d20+4: [1]+4 = 5',
      });

      // Enemy attacks normally (no fumble)
      vi.mocked(rollAttack).mockReturnValueOnce({
        total: 15,
        d20Result: 11,
        output: '1d20+1: [11]+1 = 12',
      });
      vi.mocked(rollDamage).mockReturnValueOnce({
        total: 3,
        output: '1d4+1: [2]+1 = 3',
      });

      const round1 = resolveCombatRound(state, attackAction);

      // Player fumbled, fumble effect stored
      expect(round1.fumbleEffects?.player).toBeDefined();
      expect(round1.fumbleEffects?.player?.type).toBe('drop_weapon');
      expect(round1.fumbleEffects?.player?.turnsRemaining).toBe(1);

      // Next round - player should recover instead of attacking
      // Reset fumble check for round 2
      vi.mocked(isCriticalFumble).mockReturnValue(false);
      vi.mocked(rollAttack).mockReturnValue({
        total: 15,
        d20Result: 11,
        output: '1d20+4: [11]+4 = 15',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 5,
        output: '1d8+3: [2]+3 = 5',
      });

      const round2 = resolveCombatRound(round1, attackAction);

      // Player's turn shows recovery message, not attack
      const playerTurn = round2.log.find(entry => entry.turn === 2 && entry.actor === 'player');
      expect(playerTurn?.message).toContain('recovers their weapon');

      // Enemy still attacks normally
      const enemyTurn = round2.log.find(entry => entry.turn === 2 && entry.actor === 'enemy');
      expect(enemyTurn?.message).toContain('vs AC');

      // Fumble effect cleared after recovery
      expect(round2.fumbleEffects?.player).toBeUndefined();
    });

    it('enemy does not attack if defeated by player', () => {
      const player = createTestCharacter();
      const enemy = createTestEnemy({ hp: 3 });
      const state: CombatState = {
        turn: 1,
        playerCharacter: player,
        enemy: enemy,
        log: [],
        winner: null,
        initiative: null,
        currentActor: 'player',
      };

      vi.mocked(calculateModifier).mockReturnValue(3);
      vi.mocked(rollAttack).mockReturnValue({
        total: 20,
        d20Result: 16,
        output: '1d20+4: [16]+4 = 20',
      });
      vi.mocked(rollDamage).mockReturnValue({
        total: 10, // Kills enemy
        output: '1d8+3: [7]+3 = 10',
      });

      const result = resolveCombatRound(state, attackAction);

      // Only 2 log entries: player attack + defeat message
      // No enemy attack
      expect(result.log).toHaveLength(2);
      expect(result.log[0].actor).toBe('player');
      expect(result.log[1].actor).toBe('system');
      expect(result.winner).toBe('player');
    });
  });

  describe('Class Abilities - Integration Tests', () => {
    describe('Fighter: Second Wind', () => {
      it('should heal Fighter and consume resource', () => {
        const fighter = createTestCharacter({
          class: 'Fighter',
          hp: 5,
          maxHp: 12,
          resources: {
            abilities: [
              { name: 'Second Wind', type: 'encounter', maxUses: 1, currentUses: 1, description: 'Heal 1d10+1' },
            ],
          },
        });

        const state: CombatState = {
          playerCharacter: fighter,
          enemy: createTestEnemy(),
          turn: 1,
          log: [],
          winner: null,
          initiative: {
            player: { actor: 'player', total: 10, roll: 8, bonus: 2 },
            enemy: { actor: 'enemy', total: 5, roll: 5, bonus: 0 },
            order: ['player', 'enemy'],
          },
          currentActor: 'player',
        };

        const action = {
          type: 'use_ability' as const,
          name: 'Second Wind',
          description: 'Heal 1d10+1',
          available: true,
          abilityId: 'Second Wind',
        };

        const result = resolveCombatRound(state, action);

        // Resource should be consumed
        const secondWind = result.playerCharacter.resources.abilities.find(a => a.name === 'Second Wind');
        expect(secondWind?.currentUses).toBe(0);

        // Log should show healing (before enemy attack)
        const healingLog = result.log.find(entry => entry.message.includes('Second Wind') && entry.message.includes('HP restored'));
        expect(healingLog).toBeDefined();
        expect(healingLog?.actor).toBe('player');

        // Should have multiple log entries (healing + enemy attack)
        expect(result.log.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Rogue: Dodge', () => {
      it('should activate Dodge and consume resource', () => {
        const rogue = createTestCharacter({
          class: 'Rogue',
          resources: {
            abilities: [
              { name: 'Dodge', type: 'encounter', maxUses: 1, currentUses: 1, description: '+4 AC' },
            ],
          },
        });

        const state: CombatState = {
          playerCharacter: rogue,
          enemy: createTestEnemy(),
          turn: 1,
          log: [],
          winner: null,
          initiative: {
            player: { actor: 'player', total: 10, roll: 8, bonus: 2 },
            enemy: { actor: 'enemy', total: 5, roll: 5, bonus: 0 },
            order: ['player', 'enemy'],
          },
          currentActor: 'player',
          activeConditions: { player: [], enemy: [] },
        };

        const action = {
          type: 'use_ability' as const,
          name: 'Dodge',
          description: '+4 AC until next turn',
          available: true,
          abilityId: 'Dodge',
        };

        const result = resolveCombatRound(state, action);

        // Dodge should be active as a condition
        const dodgeCondition = result.activeConditions?.player.find(c => c.type === 'Dodge');
        expect(dodgeCondition).toBeDefined();
        expect(dodgeCondition?.turnsRemaining).toBe(1);

        // Resource should be consumed
        const dodge = result.playerCharacter.resources.abilities.find(a => a.name === 'Dodge');
        expect(dodge?.currentUses).toBe(0);

        // Log should show activation
        const dodgeLog = result.log.find(entry => entry.message.includes('Dodge'));
        expect(dodgeLog).toBeDefined();
        expect(dodgeLog?.actor).toBe('player');
      });
    });

    describe('Cleric: Channel Energy', () => {
      it('should heal Cleric and consume resource', () => {
        const cleric = createTestCharacter({
          class: 'Cleric',
          hp: 6,
          maxHp: 12,
          resources: {
            abilities: [
              { name: 'Channel Energy', type: 'daily', maxUses: 2, currentUses: 2, description: 'Heal 1d6' },
            ],
            spellSlots: { level0: { current: 0, max: 0 }, level1: { current: 2, max: 2 } },
          },
        });

        const state: CombatState = {
          playerCharacter: cleric,
          enemy: createTestEnemy(),
          turn: 1,
          log: [],
          winner: null,
          initiative: {
            player: { actor: 'player', total: 10, roll: 8, bonus: 2 },
            enemy: { actor: 'enemy', total: 5, roll: 5, bonus: 0 },
            order: ['player', 'enemy'],
          },
          currentActor: 'player',
        };

        const action = {
          type: 'use_ability' as const,
          name: 'Channel Energy',
          description: 'Heal 1d6 HP',
          available: true,
          abilityId: 'Channel Energy',
        };

        const result = resolveCombatRound(state, action);

        // Resource should be consumed (2 -> 1)
        const channelEnergy = result.playerCharacter.resources.abilities.find(a => a.name === 'Channel Energy');
        expect(channelEnergy?.currentUses).toBe(1);

        // Log should show healing (before enemy attack)
        const healingLog = result.log.find(entry => entry.message.includes('Channel Energy') && entry.message.includes('HP restored'));
        expect(healingLog).toBeDefined();
        expect(healingLog?.actor).toBe('player');

        // Should have multiple log entries (healing + enemy attack)
        expect(result.log.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Wizard/Cleric: Cantrips', () => {
      it('should cast damage cantrip (Ray of Frost)', () => {
        const wizard = createTestCharacter({
          class: 'Wizard',
          attributes: { STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 10, CHA: 8 },
          resources: {
            abilities: [],
            spellSlots: { level0: { current: 0, max: 0 }, level1: { current: 2, max: 2 } },
          },
        });

        const state: CombatState = {
          playerCharacter: wizard,
          enemy: createTestEnemy(),
          turn: 1,
          log: [],
          winner: null,
          initiative: {
            player: { actor: 'player', total: 10, roll: 8, bonus: 2 },
            enemy: { actor: 'enemy', total: 5, roll: 5, bonus: 0 },
            order: ['player', 'enemy'],
          },
          currentActor: 'player',
        };

        const action = {
          type: 'cast_spell' as const,
          spellId: 'ray_of_frost',
          name: 'Ray of Frost',
          description: '1d3 cold damage',
          available: true,
          spellLevel: 0,
          requiresSlot: false,
        };

        const result = resolveCombatRound(state, action);

        // Should have spell cast log entry
        const spellLog = result.log.find(entry => entry.message.includes('Ray of Frost'));
        expect(spellLog).toBeDefined();
        expect(spellLog?.actor).toBe('player');

        // Should not consume spell slots (cantrip)
        expect(result.playerCharacter.resources.spellSlots?.level1.current).toBe(2);
      });

      it('should cast buff cantrip (Divine Favor)', () => {
        const cleric = createTestCharacter({
          class: 'Cleric',
          attributes: { STR: 14, DEX: 10, CON: 14, INT: 10, WIS: 16, CHA: 12 },
          resources: {
            abilities: [],
            spellSlots: { level0: { current: 0, max: 0 }, level1: { current: 2, max: 2 } },
          },
        });

        const state: CombatState = {
          playerCharacter: cleric,
          enemy: createTestEnemy(),
          turn: 1,
          log: [],
          winner: null,
          initiative: {
            player: { actor: 'player', total: 10, roll: 8, bonus: 2 },
            enemy: { actor: 'enemy', total: 5, roll: 5, bonus: 0 },
            order: ['player', 'enemy'],
          },
          currentActor: 'player',
          activeConditions: { player: [], enemy: [] },
        };

        const action = {
          type: 'cast_spell' as const,
          spellId: 'divine_favor',
          name: 'Divine Favor',
          description: '+1 to next attack or save',
          available: true,
          spellLevel: 0,
          requiresSlot: false,
        };

        const result = resolveCombatRound(state, action);

        // Should have Divine Favor condition active
        const divineFavorCondition = result.activeConditions?.player.find(c => c.type === 'Divine Favor');
        expect(divineFavorCondition).toBeDefined();
        expect(divineFavorCondition?.turnsRemaining).toBe(1);

        // Should have spell cast log entry
        const spellLog = result.log.find(entry => entry.message.includes('Divine Favor'));
        expect(spellLog).toBeDefined();
      });
    });

    describe('Fighter: Power Attack', () => {
      it('should apply attack penalties and damage bonuses', () => {
        const fighter = createTestCharacter({
          class: 'Fighter',
        });

        const state: CombatState = {
          playerCharacter: fighter,
          enemy: createTestEnemy(),
          turn: 1,
          log: [],
          winner: null,
          initiative: {
            player: { actor: 'player', total: 10, roll: 8, bonus: 2 },
            enemy: { actor: 'enemy', total: 5, roll: 5, bonus: 0 },
            order: ['player', 'enemy'],
          },
          currentActor: 'player',
        };

        const action = {
          type: 'attack' as const,
          variant: 'power_attack' as const,
          name: 'Power Attack',
          description: '-2 to hit, +4 damage',
          available: true,
          attackModifier: -2,
          damageModifier: 4,
        };

        vi.mocked(rollAttack).mockReturnValue({
          total: 18, // High enough to hit even with -2
          d20Result: 14,
          output: '1d20+2: [14]+2 = 16', // -2 penalty applied
        });
        vi.mocked(isCriticalHit).mockReturnValue(false);
        vi.mocked(isCriticalFumble).mockReturnValue(false);
        vi.mocked(rollDamage).mockReturnValue({
          total: 12, // 8 base + 4 Power Attack bonus
          output: '1d8+7: [5]+7 = 12',
        });

        const result = resolveCombatRound(state, action);

        // Should have attack log with Power Attack label
        const attackLog = result.log.find(entry => entry.message.includes('Power Attack'));
        expect(attackLog).toBeDefined();

        // Enemy should take damage
        expect(result.enemy.hp).toBeLessThan(state.enemy.hp);
      });
    });
  });
});
