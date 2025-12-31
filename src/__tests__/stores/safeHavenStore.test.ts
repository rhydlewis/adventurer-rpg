import { describe, it, expect, beforeEach } from 'vitest';
import { useSafeHavenStore } from '../../stores/safeHavenStore';
import type { SafeHaven } from '../../types/safeHaven';

describe('SafeHavenStore', () => {
  const mockTown: SafeHaven = {
    id: 'town1',
    type: 'town',
    name: 'Test Town',
    locationId: 'act1-town',
    merchantId: 'merchant1',
    merchantAvailable: true,
    questGiverPresent: true,
    levelUpAllowed: true,
  };

  beforeEach(() => {
    useSafeHavenStore.setState({
      safeHavens: {},
      visitedSanctuaries: new Set(),
    });
  });

  it('should register safe haven', () => {
    useSafeHavenStore.getState().registerSafeHaven(mockTown);

    expect(useSafeHavenStore.getState().isSafeHaven('act1-town')).toBe(true);
  });

  it('should get safe haven by location', () => {
    useSafeHavenStore.getState().registerSafeHaven(mockTown);

    const haven = useSafeHavenStore.getState().getSafeHaven('act1-town');

    expect(haven?.name).toBe('Test Town');
    expect(haven?.merchantId).toBe('merchant1');
  });

  it('should return null for non-existent location', () => {
    const haven = useSafeHavenStore.getState().getSafeHaven('fake-location');

    expect(haven).toBeNull();
  });

  it('should track one-time sanctuary usage', () => {
    const sanctuary: SafeHaven = {
      id: 'sanc1',
      type: 'sanctuary',
      name: 'Sanctuary',
      locationId: 'dungeon-room',
      merchantAvailable: false,
      questGiverPresent: false,
      levelUpAllowed: false,
    };

    useSafeHavenStore.getState().registerSafeHaven(sanctuary);

    expect(useSafeHavenStore.getState().canUseHaven('sanc1')).toBe(true);

    useSafeHavenStore.getState().markSanctuaryUsed('sanc1');

    expect(useSafeHavenStore.getState().visitedSanctuaries.has('sanc1')).toBe(true);
  });

  it('should allow reuse of non-one-time sanctuaries', () => {
    const sanctuary: SafeHaven = {
      id: 'sanc2',
      type: 'sanctuary',
      name: 'Repeatable Sanctuary',
      locationId: 'safe-room',
      merchantAvailable: false,
      questGiverPresent: false,
      levelUpAllowed: false,
    };

    useSafeHavenStore.getState().registerSafeHaven(sanctuary);
    useSafeHavenStore.getState().markSanctuaryUsed('sanc2');

    // Should still be usable since oneTimeUse is not set
    expect(useSafeHavenStore.getState().canUseHaven('sanc2')).toBe(true);
  });
});
