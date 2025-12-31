import { describe, it, expect } from 'vitest';
import type { SafeHaven, SanctuaryRoom } from '../../types/safeHaven';

describe('Safe Haven Types', () => {
  it('should create valid town safe haven', () => {
    const town: SafeHaven = {
      id: 'oakhaven',
      type: 'town',
      name: 'Oakhaven',
      locationId: 'act1-town',
      merchantId: 'oakhaven-general',
      merchantAvailable: true,
      questGiverPresent: true,
      levelUpAllowed: true,
    };

    expect(town.type).toBe('town');
    expect(town.merchantAvailable).toBe(true);
    expect(town.merchantId).toBe('oakhaven-general');
  });

  it('should create valid sanctuary room', () => {
    const sanctuary: SanctuaryRoom = {
      id: 'tower-sanctuary',
      type: 'sanctuary',
      name: 'Ancient Prayer Room',
      locationId: 'tower-level-2',
      merchantAvailable: false,
      questGiverPresent: false,
      levelUpAllowed: false,
      oneTimeUse: true,
    };

    expect(sanctuary.type).toBe('sanctuary');
    expect(sanctuary.oneTimeUse).toBe(true);
    expect(sanctuary.merchantAvailable).toBe(false);
  });

  it('should allow safe haven without merchant', () => {
    const haven: SafeHaven = {
      id: 'small-camp',
      type: 'inn',
      name: 'Traveler\'s Camp',
      locationId: 'forest-camp',
      merchantAvailable: false,
      questGiverPresent: false,
      levelUpAllowed: false,
      description: 'A small camp with a fire',
    };

    expect(haven.merchantId).toBeUndefined();
    expect(haven.merchantAvailable).toBe(false);
    expect(haven.description).toBeDefined();
  });
});
