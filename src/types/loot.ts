export interface LootEntry {
    type: 'gold' | 'item' | 'weapon' | 'armor';
    chance: number; // 0.0 to 1.0 (e.g., 0.8 = 80%)

    // For gold
    goldRange?: { min: number; max: number };

    // For items/equipment
    itemId?: string;
    quantity?: number; // Default 1
}

export interface LootTable {
    id: string;
    entries: LootEntry[];
}

export interface LootDrop {
    type: 'gold' | 'item' | 'weapon' | 'armor';
    amount?: number; // For gold
    itemId?: string; // For items/equipment
    quantity?: number; // For items
}
