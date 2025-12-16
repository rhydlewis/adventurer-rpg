import { describe, it, expect } from 'vitest';
import { enemies, getEnemy } from '../../data/enemies';

describe('Enemy Database', () => {
  it('should have a bandit enemy definition', () => {
    const bandit = enemies['bandit'];
    expect(bandit).toBeDefined();
    expect(bandit.name).toBe('Bandit');
    expect(bandit.hp).toBeGreaterThan(0);
    expect(bandit.maxHp).toBeGreaterThan(0);
    expect(bandit.ac).toBeGreaterThan(0);
  });

  it('should have a skeleton enemy definition', () => {
    const skeleton = enemies['skeleton'];
    expect(skeleton).toBeDefined();
    expect(skeleton.name).toBe('Skeleton');
    expect(skeleton.hp).toBeGreaterThan(0);
    expect(skeleton.avatarPath).toBeDefined();
  });

  it('should return all required Creature fields', () => {
    const skeleton = enemies['skeleton'];
    expect(skeleton).toHaveProperty('name');
    expect(skeleton).toHaveProperty('hp');
    expect(skeleton).toHaveProperty('maxHp');
    expect(skeleton).toHaveProperty('ac');
    expect(skeleton).toHaveProperty('bab');
    expect(skeleton).toHaveProperty('attributes');
    expect(skeleton).toHaveProperty('saves');
    expect(skeleton).toHaveProperty('avatarPath');
  });

  it('should return enemy by id via getEnemy function', () => {
    const bandit = getEnemy('bandit');
    expect(bandit).toBeDefined();
    expect(bandit?.name).toBe('Bandit');
  });

  it('should return null for invalid enemy id', () => {
    const invalid = getEnemy('invalid-enemy-id');
    expect(invalid).toBeNull();
  });

  it('should return a deep copy to prevent mutations', () => {
    const skeleton1 = getEnemy('skeleton');
    const skeleton2 = getEnemy('skeleton');

    expect(skeleton1).not.toBe(skeleton2);
    expect(skeleton1?.attributes).not.toBe(skeleton2?.attributes);
  });
});

describe('Enemies with Taunts', () => {
  it('should have taunts for all validation campaign enemies', () => {
    expect(enemies.skeleton.taunts).toBeDefined();
    expect(enemies.wraith).toBeDefined();
    expect(enemies.wraith.taunts).toBeDefined();
  });

  it('should have taunts for all trigger types', () => {
    const wraith = enemies.wraith;

    expect(wraith.taunts?.onCombatStart).toBeDefined();
    expect(wraith.taunts?.onPlayerMiss).toBeDefined();
    expect(wraith.taunts?.onEnemyHit).toBeDefined();
    expect(wraith.taunts?.onLowHealth).toBeDefined();
  });

  it('should have wraith as level 1 with high AC', () => {
    expect(enemies.wraith.level).toBe(1);
    expect(enemies.wraith.ac).toBeGreaterThanOrEqual(13); // Harder than basic enemies
  });
});
