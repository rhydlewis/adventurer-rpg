import type {Entity} from "./entity";

export type CreatureClass = 'Beast' | 'Humanoid' | 'Undead';

export interface Creature extends Entity {
    creatureClass: CreatureClass;
    taunts?: {
        onCombatStart?: string[];
        onPlayerMiss?: string[];
        onEnemyHit?: string[];
        onLowHealth?: string[];
    };
    lootTableId: string; // Links to loot table for drops
    spellIds?: string[]; // Array of spell IDs for spellcasting creatures
}