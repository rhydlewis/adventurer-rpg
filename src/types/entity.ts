import type { Attributes } from './attributes';
import type { SkillRanks } from './skill';
import type { Feat } from './feat';
import type { Equipment } from './equipment';
import type { Resources } from './resource';

export interface Entity {
    name: string;
    avatarPath: string;
    level: number;
    attributes: Attributes;
    hp: number;
    maxHp: number;
    ac: number;
    bab: number;
    saves: {
        fortitude: number;
        reflex: number;
        will: number;
    };
    skills: SkillRanks;
    feats: Feat[];
    equipment: Equipment;
    resources: Resources; // Spell slots, abilities
}