import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRestStore } from '../../stores/restStore';
import { useCharacterStore } from '../../stores/characterStore';
import type { Character } from '../../types/character';

// Mock character store
vi.mock('../../stores/characterStore', () => ({
  useCharacterStore: {
    getState: vi.fn(),
  },
}));

// Mock narrative store
vi.mock('../../stores/narrativeStore', () => ({
  useNarrativeStore: {
    getState: vi.fn(() => ({
      world: { currentNodeId: 'test-node' },
    })),
  },
}));

describe('RestStore', () => {
  const mockCharacter: Partial<Character> = {
    id: 'test',
    name: 'Test',
    hp: 10,
    maxHp: 30,
    mana: 4,
    maxMana: 12,
  };

  beforeEach(() => {
    // Reset store
    useRestStore.getState().resetRestTracking();

    // Mock character store
    vi.mocked(useCharacterStore.getState).mockReturnValue({
      character: mockCharacter as Character,
      updateCharacter: vi.fn(),
    } as any);
  });

  it('should calculate recovery on initiateRest', () => {
    const recovery = useRestStore.getState().initiateRest('short');

    expect(recovery).toBeDefined();
    expect(recovery?.hpRestored).toBe(15);
    expect(recovery?.newHp).toBe(25);
  });

  it('should track rest location', () => {
    useRestStore.getState().initiateRest('short');

    const state = useRestStore.getState();
    expect(state.lastRestLocation).toBe('test-node');
    expect(state.restsThisLocation).toBe(1);
  });

  it('should increment rest count at same location', () => {
    useRestStore.getState().initiateRest('short');
    useRestStore.getState().initiateRest('short');

    const state = useRestStore.getState();
    expect(state.restsThisLocation).toBe(2);
  });

  it('should allow unlimited rests by default', () => {
    const state = useRestStore.getState();

    expect(state.canRestAtLocation('any-node')).toBe(true);
  });

  it('should update character HP and mana on completeRest', () => {
    const recovery = {
      hpRestored: 15,
      manaRestored: 6,
      newHp: 25,
      newMana: 10,
      abilitiesRestored: false,
    };

    useRestStore.getState().completeRest(recovery);

    expect(useCharacterStore.getState().updateCharacter).toHaveBeenCalledWith({
      hp: 25,
      mana: 10,
    });
  });
});
