import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameSaveManager } from '../../utils/gameSaveManager';
import type { GameSave } from '../../types/gameSave';
import { Preferences } from '@capacitor/preferences';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('GameSaveManager', () => {
  const mockSave: GameSave = {
    version: '1.0.0',
    timestamp: Date.now(),
    character: {
      name: 'TestHero',
      class: 'fighter',
      level: 1,
    } as any,
    narrative: {
      world: { flags: {}, visitedNodes: [] } as any,
      conversation: { currentNodeId: 'start', log: [] } as any,
      campaignId: 'campaign-1',
    },
    currentScreen: { type: 'story' },
    metadata: {
      characterName: 'TestHero',
      characterLevel: 1,
      lastPlayedTimestamp: Date.now(),
      playTimeSeconds: 100,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save game data to Preferences', async () => {
    await GameSaveManager.save(mockSave);

    expect(Preferences.set).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(Preferences.set).mock.calls[0][0];
    expect(callArgs.key).toBe('adventurer-rpg:save');

    // Parse the saved value to check structure (timestamp will be updated)
    const savedData = JSON.parse(callArgs.value);
    expect(savedData.version).toBe('1.0.0');
    expect(savedData.character).toEqual(mockSave.character);
    expect(savedData.narrative).toEqual(mockSave.narrative);
  });

  it('should load game data from Preferences', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({
      value: JSON.stringify(mockSave),
    });

    const result = await GameSaveManager.load();

    expect(Preferences.get).toHaveBeenCalledWith({
      key: 'adventurer-rpg:save',
    });
    expect(result).toEqual(mockSave);
  });

  it('should return null if no save exists', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });

    const result = await GameSaveManager.load();

    expect(result).toBeNull();
  });

  it('should return null if save is corrupted', async () => {
    vi.mocked(Preferences.get).mockResolvedValue({
      value: 'invalid json',
    });

    const result = await GameSaveManager.load();

    expect(result).toBeNull();
  });
});
