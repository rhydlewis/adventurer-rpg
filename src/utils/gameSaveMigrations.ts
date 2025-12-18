import type { GameSave } from '../types/gameSave';

export const CURRENT_VERSION = '1.0.0';

type MigrationFunction = (save: any) => any;

const migrations: Record<string, MigrationFunction> = {
  '1.0.0': (save: any): GameSave => {
    // Migration from pre-1.0.0 to 1.0.0
    return {
      ...save,
      version: '1.0.0',
      metadata: {
        ...save.metadata,
        playTimeSeconds: save.metadata?.playTimeSeconds ?? 0,
      },
    };
  },
};

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

export function migrateToCurrentVersion(save: any): GameSave {
  let currentSave = save;
  const versions = Object.keys(migrations).sort(compareVersions);

  for (const version of versions) {
    if (compareVersions(currentSave.version || '0.0.0', version) < 0) {
      console.log(`[Migration] Migrating from ${currentSave.version} to ${version}`);
      currentSave = migrations[version](currentSave);
      currentSave.version = version;
    }
  }

  return currentSave as GameSave;
}
