import { describe, it, expect } from 'vitest';
import type { MerchantInventory } from '../../types/merchantInventory';

describe('Merchant Inventory Types', () => {
  it('should create valid merchant inventory', () => {
    const inventory: MerchantInventory = {
      merchantId: 'oakhaven-general',
      locationId: 'act1-oakhaven',
      shopInventory: ['health-potion', 'mana-potion'],
      buyPrices: {
        'health-potion': 50,
        'mana-potion': 50,
      },
    };

    expect(inventory.shopInventory).toHaveLength(2);
    expect(inventory.buyPrices['health-potion']).toBe(50);
  });

  it('should allow empty inventory', () => {
    const inventory: MerchantInventory = {
      merchantId: 'empty-merchant',
      locationId: 'test-location',
      shopInventory: [],
      buyPrices: {},
    };

    expect(inventory.shopInventory).toHaveLength(0);
    expect(Object.keys(inventory.buyPrices)).toHaveLength(0);
  });
});
