import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the DiceRoller before imports
const mockRollFn = vi.fn();

vi.mock('@dice-roller/rpg-dice-roller', () => {
  return {
    DiceRoller: class MockDiceRoller {
      roll(notation: string) {
        return mockRollFn(notation);
      }
    },
    DiceRoll: class MockDiceRoll {},
  };
});

import {
  roll,
  rollD20,
  rollAttack,
  rollDamage,
  rollWithAdvantage,
  rollWithDisadvantage,
  calculateModifier,
} from '../../utils/dice';

describe('utils/dice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('roll returns total from DiceRoller for a notation', () => {
    mockRollFn.mockReturnValueOnce({ total: 13, output: '1d20: [13] = 13' });
    const total = roll('1d20');
    expect(total).toBe(13);
    expect(mockRollFn).toHaveBeenCalledWith('1d20');
  });

  it('rollD20 formats modifiers correctly (positive, zero, negative)', () => {
    mockRollFn.mockReturnValueOnce({ total: 15, output: '' });
    rollD20(0);
    expect(mockRollFn).toHaveBeenCalledWith('1d20+0');

    mockRollFn.mockReturnValueOnce({ total: 17, output: '' });
    rollD20(3);
    expect(mockRollFn).toHaveBeenCalledWith('1d20+3');

    mockRollFn.mockReturnValueOnce({ total: 7, output: '' });
    rollD20(-2);
    expect(mockRollFn).toHaveBeenCalledWith('1d20-2');
  });

  it('rollAttack returns total, d20Result (from rolls), and output', () => {
    // Simulate a d20 result of 14 with +5 modifier => total 19
    mockRollFn.mockReturnValueOnce({
      total: 19,
      output: '1d20+5: [14]+5 = 19',
      rolls: [{ value: 14 }],
    });
    const res = rollAttack(3, 2); // bab=3, abilityMod=2 → +5
    expect(res.total).toBe(19);
    expect(res.d20Result).toBe(14);
    expect(res.output).toContain('1d20+5');
  });

  it('rollDamage formats weapon dice and returns total/output', () => {
    mockRollFn.mockReturnValueOnce({ total: 9, output: '1d8+1: [8]+1 = 9' });
    const res = rollDamage('1d8', 1);
    expect(mockRollFn).toHaveBeenCalledWith('1d8+1');
    expect(res.total).toBe(9);
    expect(res.output).toContain('1d8+1');
  });

  it('advantage/disadvantage notations are correct', () => {
    mockRollFn.mockReturnValueOnce({ total: 17, output: '2d20kh1+2 = 17' });
    rollWithAdvantage(2);
    expect(mockRollFn).toHaveBeenCalledWith('2d20kh1+2');

    mockRollFn.mockReturnValueOnce({ total: 9, output: '2d20kl1-1 = 9' });
    rollWithDisadvantage(-1);
    expect(mockRollFn).toHaveBeenCalledWith('2d20kl1-1');
  });

  it('calculateModifier handles common boundaries', () => {
    expect(calculateModifier(9)).toBe(-1);
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(11)).toBe(0);
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(1)).toBe(-5);
  });
});
