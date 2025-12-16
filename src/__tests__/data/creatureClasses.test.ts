import { describe, it, expect } from 'vitest';
import { CREATURE_CLASS_TRAITS, getCreatureClassTraits, applyCreatureClassEffects } from '../../data/creatureClasses';

describe('CreatureClass Traits', () => {
    it('should have traits for all creature classes', () => {
        expect(CREATURE_CLASS_TRAITS.Beast).toBeDefined();
        expect(CREATURE_CLASS_TRAITS.Humanoid).toBeDefined();
        expect(CREATURE_CLASS_TRAITS.Undead).toBeDefined();
    });

    it('should return correct traits for Beast', () => {
        const traits = getCreatureClassTraits('Beast');
        expect(traits.name).toBe('Beast');
        expect(traits.mechanicalEffects.naturalArmorBonus).toBe(2);
    });

    it('should return correct traits for Undead', () => {
        const traits = getCreatureClassTraits('Undead');
        expect(traits.mechanicalEffects.saveBonus).toEqual({
            fortitude: 2,
            reflex: 2,
            will: 2,
        });
        expect(traits.mechanicalEffects.immunities).toContain('poison');
    });

    it('should apply Beast natural armor bonus', () => {
        const baseStats = {
            ac: 12,
            saves: { fortitude: 2, reflex: 3, will: 1 },
        };
        const result = applyCreatureClassEffects(baseStats, 'Beast');
        expect(result.ac).toBe(14); // +2 natural armor
        expect(result.saves).toEqual(baseStats.saves); // No save bonuses
    });

    it('should apply Undead save bonuses', () => {
        const baseStats = {
            ac: 10,
            saves: { fortitude: 0, reflex: 2, will: 0 },
        };
        const result = applyCreatureClassEffects(baseStats, 'Undead');
        expect(result.ac).toBe(10); // No AC bonus
        expect(result.saves).toEqual({
            fortitude: 2,
            reflex: 4,
            will: 2,
        });
    });

    it('should not modify stats for Humanoid', () => {
        const baseStats = {
            ac: 13,
            saves: { fortitude: 2, reflex: 2, will: 1 },
        };
        const result = applyCreatureClassEffects(baseStats, 'Humanoid');
        expect(result).toEqual(baseStats); // No changes
    });
});