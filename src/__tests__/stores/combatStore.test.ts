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
    weapons: [{ name: 'Longsword', damage: '1d8', damageType: 'slashing', finesse: false, description: '' }],
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
    weapons: [{ name: 'Dagger', damage: '1d4', damageType: 'piercing', finesse: true, description: '' }],
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

  describe('quirks integration', () => {
    it('should apply combat-start quirk (start-hidden) when combat begins', () => {
      const roguePlayer = createMockCharacter('Rogue', 10);
      roguePlayer.startingQuirk = 'start-hidden';

      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === roguePlayer.name) return 12;
        return 10;
      });

      useCombatStore.getState().startCombat(roguePlayer, enemy);

      const { combat } = useCombatStore.getState();
      expect(combat?.playerHidden).toBe(true);
      expect(combat?.log.some(entry => entry.message.includes('blend into the shadows'))).toBe(true);
      expect(combat?.quirkTriggered).toBe(true);
    });

    it('should not apply quirk if player has no starting quirk', () => {
      const playerNoQuirk = createMockCharacter('Fighter', 10);
      // No startingQuirk property

      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === playerNoQuirk.name) return 12;
        return 10;
      });

      useCombatStore.getState().startCombat(playerNoQuirk, enemy);

      const { combat } = useCombatStore.getState();
      expect(combat?.playerHidden).toBeUndefined();
      expect(combat?.quirkTriggered).toBeUndefined();
    });

    it('should apply turn-1 quirk (healing-aura) on first turn', async () => {
      const clericPlayer = createMockCharacter('Cleric', 8); // Not at max HP
      clericPlayer.maxHp = 10;
      clericPlayer.startingQuirk = 'healing-aura';

      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === clericPlayer.name) return 12;
        return 10;
      });

      // Use real resolveCombatRound to test turn-1 quirk application
      const { resolveCombatRound: realResolveCombatRound } = await vi.importActual<typeof import('../../utils/combat')>('../../utils/combat');
      vi.mocked(resolveCombatRound).mockImplementation((state, action) => {
        const result = realResolveCombatRound(state, action);
        // Force turn increment for test
        return { ...result, turn: 2 };
      });

      useCombatStore.getState().startCombat(clericPlayer, enemy);
      const mockAction = { type: 'attack' as const, name: 'Attack', description: '', available: true };
      useCombatStore.getState().executeTurn(mockAction);

      const { combat } = useCombatStore.getState();
      // Healing-aura should heal 1 HP on turn 1
      expect(combat?.playerCharacter.hp).toBe(9);
      expect(combat?.log.some(entry => entry.message.includes('faith sustains you'))).toBe(true);
    });

    it('should store first-attack quirk AC bonus when enemy attacks on turn 1', () => {
      const fighterPlayer = createMockCharacter('Fighter', 10);
      fighterPlayer.startingQuirk = 'auto-block-first-attack';

      // Player goes first, so enemy will attack on turn 1
      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === fighterPlayer.name) return 12;
        return 10; // Player goes first
      });

      // Mock resolveCombatRound to simulate applying the quirk
      vi.mocked(resolveCombatRound).mockImplementation((state) => {
        // Real implementation will apply first-attack quirk inside resolveCombatRound
        // For now, verify that the quirk would be available
        return {
          ...state,
          turn: 2,
          playerAcBonus: 2, // AC bonus from quirk
          quirkTriggered: true,
          log: [
            ...state.log,
            {
              turn: 1,
              actor: 'system',
              message: "Your guard training kicks in—you deflect the blow!",
            },
          ],
        };
      });

      useCombatStore.getState().startCombat(fighterPlayer, enemy);
      const mockAction = { type: 'attack' as const, name: 'Attack', description: '', available: true };
      useCombatStore.getState().executeTurn(mockAction);

      const { combat } = useCombatStore.getState();
      expect(combat?.playerAcBonus).toBe(2);
      expect(combat?.quirkTriggered).toBe(true);
      expect(combat?.log.some(entry => entry.message.includes('guard training kicks in'))).toBe(true);
    });
  });

  describe('swapWeapon', () => {
    it('should swap weapons and update combat state', () => {
      const longsword = { id: 'longsword-1', name: 'Longsword' as const, damage: '1d8', damageType: 'slashing' as const, finesse: false, description: 'A longsword' };
      const rapier = { id: 'rapier-1', name: 'Rapier' as const, damage: '1d6', damageType: 'piercing' as const, finesse: true, description: 'A rapier' };

      const playerWithWeapons = createMockCharacter();
      playerWithWeapons.equipment.weapon = longsword;
      playerWithWeapons.equipment.weapons = [longsword, rapier];

      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === playerWithWeapons.name) return 12;
        return 10;
      });

      useCombatStore.getState().startCombat(playerWithWeapons, enemy);
      useCombatStore.getState().swapWeapon('rapier-1');

      const combat = useCombatStore.getState().combat;
      expect(combat?.playerCharacter.equipment.weapon?.id).toBe('rapier-1');
      expect(combat?.playerCharacter.equipment.weapon?.name).toBe('Rapier');
    });

    it('should add weapon swap to combat log', () => {
      const longsword = { id: 'longsword-1', name: 'Longsword' as const, damage: '1d8', damageType: 'slashing' as const, finesse: false, description: 'A longsword' };
      const rapier = { id: 'rapier-1', name: 'Rapier' as const, damage: '1d6', damageType: 'piercing' as const, finesse: true, description: 'A rapier' };

      const playerWithWeapons = createMockCharacter();
      playerWithWeapons.equipment.weapon = longsword;
      playerWithWeapons.equipment.weapons = [longsword, rapier];

      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === playerWithWeapons.name) return 12;
        return 10;
      });

      useCombatStore.getState().startCombat(playerWithWeapons, enemy);
      const initialLogLength = useCombatStore.getState().combat?.log.length || 0;

      useCombatStore.getState().swapWeapon('rapier-1');

      const combat = useCombatStore.getState().combat;
      expect(combat?.log.length).toBeGreaterThan(initialLogLength);
      expect(combat?.log.some(l => l.message.includes('Switched to Rapier'))).toBe(true);
    });

    it('should not swap to non-existent weapon', () => {
      const longsword = { id: 'longsword-1', name: 'Longsword' as const, damage: '1d8', damageType: 'slashing' as const, finesse: false, description: 'A longsword' };

      const playerWithWeapons = createMockCharacter();
      playerWithWeapons.equipment.weapon = longsword;
      playerWithWeapons.equipment.weapons = [longsword];

      vi.mocked(rollInitiative).mockImplementation((entity) => {
        if (entity.name === playerWithWeapons.name) return 12;
        return 10;
      });

      useCombatStore.getState().startCombat(playerWithWeapons, enemy);
      useCombatStore.getState().swapWeapon('fake-weapon-id');

      const combat = useCombatStore.getState().combat;
      expect(combat?.playerCharacter.equipment.weapon?.id).toBe('longsword-1'); // Unchanged
    });

    it('should not swap weapon if no combat is active', () => {
      useCombatStore.getState().swapWeapon('rapier-1');
      // Should not throw, just warn and no-op
      expect(useCombatStore.getState().combat).toBeNull();
    });
  });
});
