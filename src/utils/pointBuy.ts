import type { Attributes } from '../types/attributes';

// Point buy cost table (27-point buy)
// Based on standard d20 point buy system
const ATTRIBUTE_COSTS: Record<number, number> = {
  7: -4,
  8: -2,
  9: -1,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 5,
  15: 7,
  16: 10,
  17: 13,
  18: 17,
};

const POINT_BUY_TOTAL = 27;
const MIN_ATTRIBUTE = 7;
const MAX_ATTRIBUTE = 18;

/**
 * Get the point cost for a given attribute value
 * @param value Attribute value (7-18)
 * @returns Point cost (negative values give points back)
 * @throws Error if value is outside valid range
 */
export function getAttributeCost(value: number): number {
  if (value < MIN_ATTRIBUTE || value > MAX_ATTRIBUTE) {
    throw new Error(
      `Attribute value must be between ${MIN_ATTRIBUTE} and ${MAX_ATTRIBUTE}, got ${value}`
    );
  }
  return ATTRIBUTE_COSTS[value];
}

/**
 * Calculate total points spent on attributes
 * @param attributes Character attributes
 * @returns Total points spent
 */
export function getPointsSpent(attributes: Attributes): number {
  return (
    getAttributeCost(attributes.STR) +
    getAttributeCost(attributes.DEX) +
    getAttributeCost(attributes.CON) +
    getAttributeCost(attributes.INT) +
    getAttributeCost(attributes.WIS) +
    getAttributeCost(attributes.CHA)
  );
}

/**
 * Calculate remaining points available for allocation
 * @param attributes Current attribute allocation
 * @returns Remaining points (negative if over budget)
 */
export function getRemainingPoints(attributes: Attributes): number {
  const spent = getPointsSpent(attributes);
  return POINT_BUY_TOTAL - spent;
}

/**
 * Check if an attribute allocation is valid
 * @param attributes Character attributes
 * @returns true if valid, false otherwise
 */
export function isValidAllocation(attributes: Attributes): boolean {
  const values = [
    attributes.STR,
    attributes.DEX,
    attributes.CON,
    attributes.INT,
    attributes.WIS,
    attributes.CHA,
  ];

  // Check all values are integers in valid range
  for (const value of values) {
    if (!Number.isInteger(value)) return false;
    if (value < MIN_ATTRIBUTE || value > MAX_ATTRIBUTE) return false;
  }

  // Check within point budget
  const remaining = getRemainingPoints(attributes);
  return remaining >= 0;
}
