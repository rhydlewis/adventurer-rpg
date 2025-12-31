import { create } from 'zustand';
import type { SafeHaven, SanctuaryRoom } from '../types/safeHaven';

interface SafeHavenStore {
  safeHavens: Record<string, SafeHaven>;
  visitedSanctuaries: Set<string>;  // Track one-time use sanctuaries

  // Actions
  registerSafeHaven: (haven: SafeHaven) => void;
  isSafeHaven: (locationId: string) => boolean;
  getSafeHaven: (locationId: string) => SafeHaven | null;
  canUseHaven: (havenId: string) => boolean;
  markSanctuaryUsed: (sanctuaryId: string) => void;
}

export const useSafeHavenStore = create<SafeHavenStore>((set, get) => ({
  safeHavens: {},
  visitedSanctuaries: new Set(),

  registerSafeHaven: (haven: SafeHaven) => {
    set(state => ({
      safeHavens: {
        ...state.safeHavens,
        [haven.locationId]: haven,
      },
    }));
  },

  isSafeHaven: (locationId: string) => {
    return !!get().safeHavens[locationId];
  },

  getSafeHaven: (locationId: string) => {
    return get().safeHavens[locationId] || null;
  },

  canUseHaven: (havenId: string) => {
    const haven = Object.values(get().safeHavens).find(h => h.id === havenId);
    if (!haven) return false;

    // Check if sanctuary is one-time use and already visited
    if (haven.type === 'sanctuary') {
      const sanctuary = haven as SanctuaryRoom;
      if (sanctuary.oneTimeUse && get().visitedSanctuaries.has(havenId)) {
        return false;
      }
    }

    return true;
  },

  markSanctuaryUsed: (sanctuaryId: string) => {
    set(state => ({
      visitedSanctuaries: new Set([...state.visitedSanctuaries, sanctuaryId]),
    }));
  },
}));
