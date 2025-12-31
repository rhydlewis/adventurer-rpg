export type RestType = 'short' | 'long' | 'safe_haven';

export interface RestRecovery {
  hpPercent: number;        // 0-100, percentage of max HP to restore
  manaPercent: number;      // 0-100, percentage of max mana to restore
  restoreLimitedAbilities: boolean;  // Restore daily/encounter abilities
  guaranteed: boolean;      // If false, random encounter possible
}

export const REST_RECOVERY: Record<RestType, RestRecovery> = {
  short: {
    hpPercent: 50,
    manaPercent: 50,
    restoreLimitedAbilities: false,
    guaranteed: true,  // Short rests never interrupted
  },
  long: {
    hpPercent: 100,
    manaPercent: 100,
    restoreLimitedAbilities: true,
    guaranteed: false,  // Camp events possible
  },
  safe_haven: {
    hpPercent: 100,
    manaPercent: 100,
    restoreLimitedAbilities: true,
    guaranteed: true,  // Towns always safe
  },
};

export interface RestState {
  canRest: boolean;              // Can player rest right now?
  lastRestLocation: string;      // Node ID where player last rested
  restsThisLocation: number;     // Prevent rest spam in one location
  maxRestsPerLocation: number;   // Limit (0 = unlimited)
}
