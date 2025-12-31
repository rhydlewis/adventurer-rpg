/**
 * Merchant inventory data structure
 * Used to define what items a merchant sells and at what prices
 */
export interface MerchantInventory {
  merchantId: string;
  locationId: string;        // Which safe haven location has this merchant
  shopInventory: string[];   // Item IDs available for purchase
  buyPrices: Record<string, number>;  // Item ID -> gold price
}
