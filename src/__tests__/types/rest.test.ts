import { describe, it, expect } from 'vitest';
import { REST_RECOVERY } from '../../types/rest';

describe('Rest Recovery Constants', () => {
  it('should have short rest restore 50% HP and mana', () => {
    expect(REST_RECOVERY.short.hpPercent).toBe(50);
    expect(REST_RECOVERY.short.manaPercent).toBe(50);
    expect(REST_RECOVERY.short.restoreLimitedAbilities).toBe(false);
  });

  it('should have long rest restore 100% HP and mana', () => {
    expect(REST_RECOVERY.long.hpPercent).toBe(100);
    expect(REST_RECOVERY.long.manaPercent).toBe(100);
    expect(REST_RECOVERY.long.restoreLimitedAbilities).toBe(true);
  });

  it('should have safe haven guarantee safety', () => {
    expect(REST_RECOVERY.safe_haven.guaranteed).toBe(true);
  });

  it('should allow camp events during long rest', () => {
    expect(REST_RECOVERY.long.guaranteed).toBe(false);
  });
});
