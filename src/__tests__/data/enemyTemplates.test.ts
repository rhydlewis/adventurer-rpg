import { describe, it, expect } from 'vitest';
import { ENEMY_TEMPLATES, getEnemyTemplate } from '../../data/enemyTemplates';

describe('Enemy Templates', () => {
    it('should have enemy templates defined', () => {
        expect(Object.keys(ENEMY_TEMPLATES).length).toBeGreaterThan(0);
    });

    it('should have bandit template', () => {
        const template = getEnemyTemplate('bandit');
        expect(template).toBeDefined();
        expect(template?.id).toBe('bandit');
        expect(template?.creatureClass).toBe('Humanoid');
    });

    it('should have skeleton template', () => {
        const template = getEnemyTemplate('skeleton');
        expect(template?.creatureClass).toBe('Undead');
    });

    it('should have wraith template with Wizard class', () => {
        const template = getEnemyTemplate('wraith');
        expect(template?.baseClass).toBe('Wizard');
        expect(template?.equipment.weapon).toBeNull(); // Natural attack
    });

    it('should have giantSpider template as Beast', () => {
        const template = getEnemyTemplate('giantSpider');
        expect(template?.creatureClass).toBe('Beast');
        expect(template?.equipment.weapon).toBeNull();
        expect(template?.equipment.armor).toBeNull();
    });

    it('should return null for unknown template', () => {
        const template = getEnemyTemplate('unknown');
        expect(template).toBeNull();
    });

    it('should have valid attribute ranges (min <= max)', () => {
        Object.values(ENEMY_TEMPLATES).forEach(template => {
            Object.values(template.attributeRanges).forEach(range => {
                expect(range.min).toBeLessThanOrEqual(range.max);
                expect(range.min).toBeGreaterThanOrEqual(1);
                expect(range.max).toBeLessThanOrEqual(20);
            });
        });
    });

    it('should have valid level ranges', () => {
        Object.values(ENEMY_TEMPLATES).forEach(template => {
            expect(template.levelRange.min).toBeGreaterThanOrEqual(1);
            expect(template.levelRange.min).toBeLessThanOrEqual(template.levelRange.max);
        });
    });

    it('should have at least one avatar path', () => {
        Object.values(ENEMY_TEMPLATES).forEach(template => {
            expect(template.avatarPaths.length).toBeGreaterThan(0);
        });
    });

    it('should have valid loot table IDs', () => {
        Object.values(ENEMY_TEMPLATES).forEach(template => {
            expect(template.lootTableId).toBeDefined();
            expect(template.lootTableId.length).toBeGreaterThan(0);
        });
    });
});

describe('ENEMY_TEMPLATES equipment resolution', () => {
    it('should resolve weapon reference for bandit', () => {
        const bandit = ENEMY_TEMPLATES['bandit'];
        expect(bandit).toBeDefined();
        expect(bandit.equipment.weapon).toBeDefined();
        expect(bandit.equipment.weapon?.name).toBe('Dagger');
        expect(bandit.equipment.weapon?.damage).toBe('1d4');
    });

    it('should resolve armor reference for hobgoblin', () => {
        const hobgoblin = ENEMY_TEMPLATES['hobgoblin'];
        expect(hobgoblin).toBeDefined();
        expect(hobgoblin.equipment.armor).toBeDefined();
        expect(hobgoblin.equipment.armor?.name).toBe('Chainmail');
        expect(hobgoblin.equipment.armor?.baseAC).toBe(16);
    });

    it('should handle null weaponId (wraith)', () => {
        const wraith = ENEMY_TEMPLATES['wraith'];
        expect(wraith).toBeDefined();
        expect(wraith.equipment.weapon).toBeNull();
    });

    it('should handle null armorId (skeleton)', () => {
        const skeleton = ENEMY_TEMPLATES['skeleton'];
        expect(skeleton).toBeDefined();
        expect(skeleton.equipment.armor).toBeNull();
    });

    it('should populate weapons array from weaponId', () => {
        const bandit = ENEMY_TEMPLATES['bandit'];
        expect(bandit.equipment.weapons).toBeDefined();
        expect(bandit.equipment.weapons?.length).toBeGreaterThan(0);
        expect(bandit.equipment.weapons?.[0]?.name).toBe('Dagger');
    });
});