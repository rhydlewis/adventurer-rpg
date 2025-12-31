export type SafeHavenType = 'town' | 'sanctuary' | 'inn';

/**
 * Safe haven location where players can rest safely
 */
export interface SafeHaven {
  id: string;
  type: SafeHavenType;
  name: string;
  locationId: string;      // Which story node represents this haven

  // Services available
  merchantId?: string;         // Reference to merchant inventory
  merchantAvailable: boolean;  // Can access merchant here
  questGiverPresent: boolean;
  levelUpAllowed: boolean;

  // Flavor
  description?: string;
  atmosphere?: string;
}

/**
 * Sanctuary rooms in dungeons - special safe rest points
 */
export interface SanctuaryRoom extends SafeHaven {
  type: 'sanctuary';
  oneTimeUse: boolean;     // Can only rest here once
}
