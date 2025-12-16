import type { CharacterClass } from './character';
import type { CreatureClass } from './creature';
import type { Equipment } from './equipment';
import type { SkillRanks } from './skill';
import type { Feat } from './feat';

export interface AttributeRange {
    min: number;
    max: number;
}

export interface EnemyTemplate {
    id: string;
    baseName: string;
    creatureClass: CreatureClass;

    // Multiple avatars for variety
    avatarPaths: string[];

    // Randomization ranges
    levelRange: { min: number; max: number };
    attributeRanges: {
        STR: AttributeRange;
        DEX: AttributeRange;
        CON: AttributeRange;
        INT: AttributeRange;
        WIS: AttributeRange;
        CHA: AttributeRange;
    };

    // Static template data
    baseClass: CharacterClass; // For BAB/save calculations
    equipment: Equipment;
    skills: SkillRanks;
    feats: Feat[];
    taunts?: {
        onCombatStart?: string[];
        onPlayerMiss?: string[];
        onEnemyHit?: string[];
        onLowHealth?: string[];
    };
    lootTableId: string;
}