import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCombatStore } from '../../stores/combatStore';
import { rollInitiative } from '../../utils/initiative';
import { resolveCombatRound } from '../../utils/combat';
import type { CombatState } from '../../types';
import type { Character } from '../../types';
import type { Creature } from "../../types/creature";


// Mock dependencies
vi.mock('../../utils/initiative', () => ({
  rollInitiative: vi.fn(),
}));
vi.mock('../../utils/combat', () => ({
  resolveCombatRound: vi.fn(),
}));

const createMockCharacter = (name: string = 'Player', hp: number = 10, _initiative: number = 10): Character => ({
  name,
  avatarPath: 'human_female_00009.png',
  class: 'Fighter',
  level: 1,
  attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  hp,
  maxHp: hp,
  ac: 10,
  bab: 0,
  saves: { fortitude: 0, reflex: 0, will: 0 },
  skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
  feats: [],
  equipment: {
    weapon: { name: 'Longsword', damage: '1d8', damageType: 'slashing', finesse: false, description: '' },
    armor: { name: 'None', baseAC: 10, maxDexBonus: null, description: '' },
    shield: { equipped: false, acBonus: 0 },
    items: [],
  },
  resources: { abilities: [] },
});

const createMockEnemy = (name: string = 'Skeleton', hp: number = 8, _initiative: number = 8): Creature => ({
  name,
  avatarPath: 'human_female_00009.png',
  creatureClass: 'Undead',
  level: 1,
  attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  hp,
  maxHp: hp,
  ac: 10,
  bab: 0,
  saves: { fortitude: 0, reflex: 0, will: 0 },
  skills: { Athletics: 0, Stealth: 0, Perception: 0, Arcana: 0, Medicine: 0, Intimidate: 0 },
  feats: [],
  equipment: {
    weapon: { name: 'Dagger', damage: '1d4', damageType: 'piercing', finesse: true, description: '' },
    armor: { name: 'None', baseAC: 10, maxDexBonus: null, description: '' },
    shield: { equipped: false, acBonus: 0 },
    items: [],
  },
  resources: { abilities: [] },
  lootTableId: 'test_loot'
});

describe('stores/combatStore', () => {
  const player = createMockCharacter();
  const enemy = createMockEnemy();

  beforeEach(() => {
    // Reset the store to its initial state
    useCombatStore.getState().resetCombat();
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should have the correct initial state', () => {
    const { combat } = useCombatStore.getState();
    expect(combat).toBeNull();
  });

  describe('startCombat', () => {
    it('should initialize combat state with player going first if player wins initiative', () => {
      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === player.name) return 12; // Player initiative
        return 10; // Enemy initiative
      });

      useCombatStore.getState().startCombat(player, enemy);

      const { combat } = useCombatStore.getState();
      expect(combat).not.toBeNull();
      expect(combat?.turn).toBe(1);
      expect(combat?.playerCharacter).toEqual(player);
      expect(combat?.enemy).toEqual(enemy);
      expect(combat?.winner).toBeNull();
      expect(combat?.currentActor).toBe('player');
      expect(combat?.initiative?.order).toEqual(['player', 'enemy']);
      expect(combat?.log).toHaveLength(2);
      expect(combat?.log[0].message).toContain('Initiative');
      expect(combat?.log[1].message).toContain(`${player.name} goes first!`);
    });

    it('should initialize combat state with enemy going first if enemy wins initiative', () => {
      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === player.name) return 8; // Player initiative
        return 15; // Enemy initiative
      });

      useCombatStore.getState().startCombat(player, enemy);

      const { combat } = useCombatStore.getState();
      expect(combat).not.toBeNull();
      expect(combat?.currentActor).toBe('enemy');
      expect(combat?.initiative?.order).toEqual(['enemy', 'player']);
      expect(combat?.log[1].message).toContain(`${enemy.name} goes first!`);
    });

    it('should initialize combat state with player going first if initiative is tied', () => {
      vi.mocked(rollInitiative).mockImplementation(() => {
        return 10; // Tied initiative
      });

      useCombatStore.getState().startCombat(player, enemy);

      const { combat } = useCombatStore.getState();
      expect(combat).not.toBeNull();
      expect(combat?.currentActor).toBe('player'); // Player favored on tie
      expect(combat?.initiative?.order).toEqual(['player', 'enemy']);
    });
  });

  describe('executeTurn', () => {
    it('should call resolveCombatRound and update combat state', () => {
      const mockPlayer = createMockCharacter('Hero', 10);
      const mockEnemy = createMockEnemy('Beast', 8);
      const initialCombatState: CombatState = {
        turn: 1,
        playerCharacter: mockPlayer,
        enemy: mockEnemy,
        log: [],
        winner: null,
        initiative: {
          player: { actor: 'player', roll: 10, bonus: 0, total: 10 },
          enemy: { actor: 'enemy', roll: 8, bonus: 0, total: 8 },
          order: ['player', 'enemy'],
        },
        currentActor: 'player',
      };

      // Set initial combat state directly in the store for this test
      useCombatStore.setState({ combat: initialCombatState });

      const mockAction = { type: 'attack' as const, name: 'Attack', description: '', available: true };
      const nextCombatState: CombatState = {
        ...initialCombatState,
        turn: 2,
        playerCharacter: { ...mockPlayer, hp: 8 },
        enemy: { ...mockEnemy, hp: 5 },
        log: [{ turn: 1, actor: 'player', message: 'Attacked!' }],
      };

      vi.mocked(resolveCombatRound).mockReturnValue(nextCombatState);

      useCombatStore.getState().executeTurn(mockAction);

      expect(resolveCombatRound).toHaveBeenCalledWith(initialCombatState, mockAction);
      expect(useCombatStore.getState().combat).toEqual(nextCombatState);
    });

    it('should not execute turn if combat state is null', () => {
      useCombatStore.getState().executeTurn({ type: 'attack' as const, name: 'Attack', description: '', available: true });
      expect(resolveCombatRound).not.toHaveBeenCalled();
    });
  });

  describe('resetCombat', () => {
    it('should set combat state to null', () => {
      useCombatStore.getState().startCombat(player, enemy); // Initialize combat
      expect(useCombatStore.getState().combat).not.toBeNull();

      useCombatStore.getState().resetCombat();
      expect(useCombatStore.getState().combat).toBeNull();
    });
  });
});
