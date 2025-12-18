import { Preferences } from '@capacitor/preferences';
import type { GameSave, SaveMetadata } from '../types/gameSave';
import { migrateToCurrentVersion, CURRENT_VERSION } from './gameSaveMigrations';

const SAVE_KEY = 'adventurer-rpg:save';

export class GameSaveManager {
  /**
   * Save game data to persistent storage
   */
  static async save(saveData: GameSave): Promise<void> {
    try {
      // Ensure version is current
      const dataToSave = {
        ...saveData,
        version: CURRENT_VERSION,
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(dataToSave);
      await Preferences.set({
        key: SAVE_KEY,
        value: serialized,
      });

      console.log('[GameSave] Save successful');
    } catch (error) {
      console.error('[GameSave] Save failed:', error);
      // Silent failure - don't throw
    }
  }

  /**
   * Load game data from persistent storage
   * Returns null if no save exists or if corrupted
   */
  static async load(): Promise<GameSave | null> {
    try {
      const { value } = await Preferences.get({ key: SAVE_KEY });

      if (!value) {
        return null;
      }

      const save = JSON.parse(value);

      // Run migrations if needed
      const migratedSave = migrateToCurrentVersion(save);

      return migratedSave;
    } catch (error) {
      console.error('[GameSave] Load failed:', error);
      return null; // Treat as no save exists
    }
  }

  /**
   * Check if a save exists without loading full data
   */
  static async hasSave(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: SAVE_KEY });
      return value !== null;
    } catch (error) {
      console.error('[GameSave] hasSave check failed:', error);
      return false;
    }
  }

  /**
   * Delete saved game
   */
  static async deleteSave(): Promise<void> {
    try {
      await Preferences.remove({ key: SAVE_KEY });
      console.log('[GameSave] Save deleted');
    } catch (error) {
      console.error('[GameSave] Delete failed:', error);
    }
  }

  /**
   * Get save metadata for UI display (fast, doesn't load full save)
   */
  static async getSaveMetadata(): Promise<SaveMetadata | null> {
    try {
      const { value } = await Preferences.get({ key: SAVE_KEY });

      if (!value) {
        return null;
      }

      const save = JSON.parse(value) as GameSave;
      return save.metadata;
    } catch (error) {
      console.error('[GameSave] getSaveMetadata failed:', error);
      return null;
    }
  }

  /**
   * Get current version string
   */
  static getCurrentVersion(): string {
    return CURRENT_VERSION;
  }
}
