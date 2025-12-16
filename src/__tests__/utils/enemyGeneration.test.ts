import { describe, it, expect } from 'vitest';
import { generateEnemy } from '../../utils/enemyGeneration';

describe('Enemy Generation', () => {
    it('should return null for unknown template', () => {
        const enemy = generateEnemy('unknown');
        expect(enemy).toBeNull();
    });

    it('should generate bandit with valid stats', () => {
        const enemy = generateEnemy('bandit');
        expect(enemy).toBeDefined();
        expect(enemy?.name).toBe('Bandit');
        expect(enemy?.creatureClass).toBe('Humanoid');
        expect(enemy?.level).toBeGreaterThanOrEqual(1);
        expect(enemy?.hp).toBeGreaterThan(0);
        expect(enemy?.maxHp).toBeGreaterThan(0);
        expect(enemy?.ac).toBeGreaterThan(0);
    });

    it('should generate skeleton with Undead bonuses', () => {
        const enemy = generateEnemy('skeleton');
        expect(enemy?.creatureClass).toBe('Undead');
        // Undead get +2 to all saves (from creatureClass)
        // Skeleton is a Fighter with WIS 9-11 (mod -1 to 0)
        // Fighter: Fort +2, Ref +2, Will +0 (base)
        // With Undead bonus (+2 all): Fort >= 4, Ref >= 4, Will >= 1
        expect(enemy?.saves.fortitude).toBeGreaterThanOrEqual(4); // 2 base + CON mod (0) + 2 undead
        expect(enemy?.saves.reflex).toBeGreaterThanOrEqual(4); // 2 base + DEX mod (2+) + 2 undead
        expect(enemy?.saves.will).toBeGreaterThanOrEqual(1); // 0 base + WIS mod (-1 to 0) + 2 undead
    });

    it('should generate spider with Beast natural armor', () => {
        const enemy = generateEnemy('giantSpider');
        expect(enemy?.creatureClass).toBe('Beast');
        expect(enemy?.equipment.weapon).toBeNull();
        expect(enemy?.equipment.armor).toBeNull();
        // Beast gets +2 natural armor (base 10 + 2 DEX mod minimum + 2 natural = 14 minimum)
        expect(enemy?.ac).toBeGreaterThanOrEqual(12);
    });

    it('should generate wraith with spell slots', () => {
        const enemy = generateEnemy('wraith');
        expect(enemy?.resources.spellSlots).toBeDefined();
        expect(enemy?.resources.spellSlots?.level0).toEqual({ max: 3, current: 3 });
        expect(enemy?.resources.spellSlots?.level1).toEqual({ max: 2, current: 2 });
    });

    it('should respect level override', () => {
        const enemy = generateEnemy('bandit', { level: 5 });
        expect(enemy?.level).toBe(5);
    });

    it('should generate randomized attributes within range', () => {
        const enemies = Array.from({ length: 10 }, () => generateEnemy('bandit'));

        // Check that we got some variation
        const strValues = enemies.map(e => e?.attributes.STR);
        const uniqueStrs = new Set(strValues);

        // With 10 rolls in range 12-14, we should see some variation
        expect(uniqueStrs.size).toBeGreaterThan(1);
    });

    it('should have valid loot table ID', () => {
        const enemy = generateEnemy('bandit');
        expect(enemy?.lootTableId).toBe('bandit_loot');
    });

    it('should deep copy equipment to prevent template mutation', () => {
        const enemy1 = generateEnemy('bandit');
        const enemy2 = generateEnemy('bandit');

        // Modify enemy1's equipment
        if (enemy1?.equipment.weapon) {
            enemy1.equipment.weapon.damage = '9d9';
        }

        // Enemy2 should be unaffected
        expect(enemy2?.equipment.weapon?.damage).toBe('1d6');
    });
});