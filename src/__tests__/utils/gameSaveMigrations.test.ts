import { describe, it, expect } from 'vitest';
import { migrateToCurrentVersion, CURRENT_VERSION } from '../../utils/gameSaveMigrations';

describe('gameSaveMigrations', () => {
  it('should return save unchanged if version matches current', () => {
    const save = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      character: {} as any,
      narrative: { world: {}, conversation: {}, campaignId: 'test' } as any,
      currentScreen: { type: 'story' as const },
      metadata: {
        characterName: 'Test',
        characterLevel: 1,
        lastPlayedTimestamp: Date.now(),
        playTimeSeconds: 0,
      },
    };

    const result = migrateToCurrentVersion(save);
    expect(result).toEqual(save);
  });

  it('should migrate old version to current', () => {
    const oldSave = {
      version: '0.9.0',
      timestamp: Date.now(),
      character: {} as any,
      narrative: { world: {}, conversation: {}, campaignId: 'test' } as any,
      currentScreen: { type: 'story' as const },
      metadata: {
        characterName: 'Test',
        characterLevel: 1,
        lastPlayedTimestamp: Date.now(),
        // Missing playTimeSeconds field
      },
    };

    const result = migrateToCurrentVersion(oldSave as any);
    expect(result.version).toBe(CURRENT_VERSION);
    expect(result.metadata.playTimeSeconds).toBe(0); // Default value added
  });
});
