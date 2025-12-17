/**
 * Validation Campaign - Mechanical Testing Harness
 *
 * 8-node critical path to validate:
 * 1. Exploration system
 * 2. Inventory/gold/merchant
 * 3. Retreat mechanics
 * 4. Level-up flow
 * 5. Two-phase character creation
 *
 * Total playtime: 15-20 minutes
 */

import type { Campaign, Act, StoryNode } from '../../types';

const validationNodes: StoryNode[] = [
    // === NODE 1: Character Creation Entry Point ===
    {
        id: 'validation-start',
        title: 'Welcome to the Validation Campaign',
        description: 'This campaign tests all core game mechanics in a focused 15-20 minute experience. You will face combat, make choices, explore, trade with merchants, and level up. Let\'s begin by creating your character.',
        choices: [
            {
                id: 'start-char-creation',
                text: 'Create Character',
                category: 'special',
                outcome: {
                    type: 'characterCreation',
                    phase: 1,
                    nextNodeId: 'validation-first-combat',
                },
            },
            {
                id: 'continue-to-merchant',
                text: 'Go to Merchant (test)',
                category: 'movement',
                outcome: {type: 'goto', nodeId: 'validation-merchant'},
            },
            {
                id: 'test-exploration',
                text: '[TEST] Jump to Exploration',
                category: 'exploration',
                outcome: {type: 'goto', nodeId: 'validation-exploration-choice'},
            },
            {
                id: 'test-levelup',
                text: '[TEST] Jump to Level-Up',
                category: 'special',
                outcome: {type: 'goto', nodeId: 'validation-levelup'},
            },
        ],
    },

    // === NODE 2: First Combat (Giant Spider) ===
    {
        id: 'validation-first-combat',
        title: 'Ambush!',
        description: 'As you step onto the forest path, a massive spider drops from the canopy above, its eight eyes gleaming hungrily and mandibles clicking! The creature blocks your path, but perhaps you could slip past it unnoticed...',
        locationId: 'darkwood-forest',
        type: 'event',
        flavor: { tone: 'danger', icon: 'warning' },
        companionHint: 'A stealthy approach might avoid bloodshed... but if you fail, you\'ll have to fight.',
        choices: [
            {
                id: 'attack-spider',
                text: 'Draw your weapon and attack!',
                category: 'combat',
                outcome: {
                    type: 'goto',
                    nodeId: 'validation-spider-combat',
                },
            },
            {
                id: 'sneak-past-spider',
                text: '🎲 Try to sneak past the spider',
                displayText: '🎲 Stealth DC 12: Try to sneak past the spider',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Stealth',
                    dc: 12,
                    success: {
                        type: 'goto',
                        nodeId: 'validation-spider-avoided',
                    },
                    failure: {
                        type: 'goto',
                        nodeId: 'validation-spider-combat',
                    },
                },
            },
        ],
    },

    // === NODE 2a: Spider Combat (triggered by attacking or failing stealth) ===
    {
        id: 'validation-spider-combat',
        title: 'Battle!',
        description: 'The spider lunges at you with venomous fangs! You must fight for your life!',
        locationId: 'darkwood-forest',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'sword' },
        onEnter: [
            {
                type: 'startCombat',
                enemyId: 'giantSpider',
                onVictoryNodeId: 'validation-post-combat-1',
            },
        ],
        choices: [], // Combat starts immediately
    },

    // === NODE 2b: Spider Avoided (stealth success) ===
    {
        id: 'validation-spider-avoided',
        description: 'You move with practiced silence, slipping past the spider as it searches the canopy above. You escape unharmed and continue down the path.',
        locationId: 'darkwood-forest',
        flavor: { tone: 'calm' },
        choices: [
            {
                id: 'continue-after-stealth',
                text: 'Continue down the path',
                category: 'movement',
                outcome: {type: 'goto', nodeId: 'validation-exploration-choice'},
            },
        ],
    },

    // === NODE 2c: Post First Combat ===
    {
        id: 'validation-post-combat-1',
        description: 'The giant spider collapses, its legs curling inward. You catch your breath and search the area, finding a small pouch of coins and a healing potion in an old web-covered pack.',
        type: 'event',
        flavor: { tone: 'triumphant', icon: 'reward' },
        onEnter: [
            {type: 'giveGold', amount: 50},
            {type: 'giveItem', itemId: 'healing-potion'},
        ],
        choices: [
            {
                id: 'continue-to-exploration',
                text: 'Continue down the path',
                category: 'movement',
                outcome: {type: 'goto', nodeId: 'validation-exploration-choice'},
            },
        ],
    },

    // === NODE 3: Exploration Choice ===
    {
        id: 'validation-exploration-choice',
        title: 'A Forest Crossroads',
        description: 'The path continues ahead toward a distant village. To your left, you notice game trails leading deeper into the forest. You could explore the wilderness... or stay on the safe path.',
        locationHint: 'Darkwood Forest - A dense woodland',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'search' },
        companionHint: 'Exploration is risky, but fortune favors the bold. Or does it?',
        choices: [
            {
                id: 'explore-forest',
                text: 'Explore the game trails (risk/reward)',
                category: 'exploration',
                outcome: {
                    type: 'explore',
                    tableId: 'forest-exploration',
                    onceOnly: true,
                },
            },
            {
                id: 'continue-to-merchant',
                text: 'Stay on the main path to the village',
                category: 'movement',
                outcome: {type: 'goto', nodeId: 'validation-merchant'},
            },
        ],
    },

    // === NODE 3b: Exploration Combat Victory (temporary node) ===
    {
        id: 'exploration-combat-victory',
        description: 'You catch your breath after the fight. The creature defeated, you search the remains and find some valuables. Time to continue toward the village.',
        onEnter: [
            // Rewards from exploration combat are applied here
            // These would ideally come from the exploration outcome, but for now hardcoded
            {type: 'giveGold', amount: 30},
        ],
        choices: [
            {
                id: 'continue-after-exploration',
                text: 'Continue to the village',
                category: 'movement',
                outcome: {type: 'goto', nodeId: 'validation-merchant'},
            },
        ],
    },

    // === NODE 4: Merchant ===
    {
        id: 'validation-merchant',
        title: 'The Village Market',
        description: 'You arrive at a small village. A weathered merchant stands behind a wooden cart piled with supplies.',
        speakerName: 'Merchant',
        speakerPortrait: 'portraits/merchant.png',
        locationId: 'village-market',
        flavor: { tone: 'calm', icon: 'dialogue' },
        choices: [
            {
                id: 'browse-wares',
                text: '"Show me your wares."',
                category: 'merchant',
                outcome: {
                    type: 'merchant',
                    shopInventory: ['healing-potion', 'sword-plus-1', 'antidote'],
                    buyPrices: {
                        'healing-potion': 50,
                        'sword-plus-1': 100,
                        'antidote': 30,
                    },
                },
            },
            {
                id: 'leave-merchant',
                text: '"Not interested right now."',
                category: 'dialogue',
                outcome: {type: 'goto', nodeId: 'validation-phase2-unlock'},
            },
        ],
    },

    // === NODE 4b: Phase 2 Character Creation Unlock ===
    {
        id: 'validation-phase2-unlock',
        description: 'You\'ve proven yourself in battle and trade. You feel more confident in your abilities. Perhaps it\'s time to refine your skills and choose how you\'ve grown.',
        locationId: 'character-reflection',
        onEnter: [
            // This would trigger Phase 2 UI (point-buy, skill allocation, feat selection)
            // For now, just a placeholder node effect
            { type: 'setFlag', flag: 'phase2_unlocked', value: true },
        ],
        choices: [
            {
                id: 'customize-character',
                text: 'Refine your abilities (Phase 2 customization)',
                category: 'special',
                outcome: {
                    type: 'characterCreation',
                    phase: 2,
                    nextNodeId: 'validation-second-combat',
                },
            },
            {
                id: 'skip-customization',
                text: 'Use your current build',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'validation-second-combat' },
            },
        ],
    },

    // === NODE 5: Second Combat (Skeleton) with Retreat Option ===
    {
        id: 'validation-second-combat',
        title: 'The Crypt Guardian',
        description: 'You descend into an ancient crypt. A skeletal warrior rises from its resting place, eye sockets glowing with unholy light!',
        locationId: 'crypt',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        companionHint: 'This foe is formidable. If the battle turns against you, retreat is an option.',
        onEnter: [
            {
                type: 'startCombat',
                enemyId: 'skeleton',
                onVictoryNodeId: 'validation-post-combat-2',
            },
        ],
        choices: [],
        // Combat state will include: canRetreat: true, retreatPenalty: { goldLost: 20, damageOnFlee: 5, safeNodeId: 'validation-retreat-safe' }
    },

    // === NODE 5b: Post Second Combat ===
    {
        id: 'validation-post-combat-2',
        description: 'The skeleton crumbles to dust. Among the bones, you find a heavy coin purse and a mysterious amulet.',
        flavor: { tone: 'triumphant', icon: 'treasure' },
        onEnter: [
            { type: 'giveGold', amount: 80 },
            { type: 'giveItem', itemId: 'mysterious-amulet' },
        ],
        choices: [
            {
                id: 'continue-to-levelup',
                text: 'Press onward',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'validation-levelup' },
            },
        ],
    },

    // === NODE 5c: Retreat Safe Zone (if player fled) ===
    {
        id: 'validation-retreat-safe',
        description: 'You flee back up the crypt stairs, breathing heavily. You\'ve lost some gold in the chaos, and your wounds sting. But you\'re alive. You can try again when you\'re ready.',
        flavor: { tone: 'tense', icon: 'warning' },
        choices: [
            {
                id: 'return-to-combat',
                text: 'Steel yourself and return to the crypt',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'validation-second-combat' },
            },
            {
                id: 'skip-to-levelup',
                text: 'Avoid the crypt and continue your journey (skip combat)',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'validation-levelup' },
            },
        ],
    },

    // === NODE 6: Level Up to Level 2 ===
    {
        id: 'validation-levelup',
        title: 'Growth',
        description: 'Your trials have made you stronger. You feel the surge of experience as your skills sharpen and your body becomes more resilient. Choose how you\'ve grown.',
        locationId: 'character-reflection',
        type: 'event',
        flavor: { tone: 'triumphant', icon: 'crown' },
        onEnter: [
            {
                type: 'levelUp',
                newLevel: 2,
                featChoices: ['power-attack', 'improved-initiative', 'weapon-focus'],
            },
        ],
        choices: [
            {
                id: 'continue-to-final',
                text: 'Face the final challenge',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'validation-final-combat' },
            },
        ],
    },

    // === NODE 7: Final Combat (Wraith) ===
    {
        id: 'validation-final-combat',
        title: 'The Wraith',
        description: 'At the deepest chamber, a wraith materializes from the shadows. Its ethereal form flickers between this world and the next. This is the ultimate test of your abilities!',
        locationId: 'void-sanctum',
        type: 'combat',
        flavor: { tone: 'urgent', icon: 'danger' },
        companionHint: 'Use everything you\'ve learned. Items, abilities, tactics—this is your moment.',
        onEnter: [
            {
                type: 'startCombat',
                enemyId: 'wraith',
                onVictoryNodeId: 'validation-end',
            },
        ],
        choices: [],
    },

    // === NODE 8: End Summary ===
    {
        id: 'validation-end',
        title: 'Victory!',
        description: 'The wraith dissipates with an otherworldly scream. You stand victorious, battle-tested and proven. The validation campaign is complete.',
        locationId: 'victory-hall',
        type: 'event',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 100 },
            { type: 'setFlag', flag: 'validation_complete', value: true },
        ],
        choices: [
            {
                id: 'view-summary',
                text: 'View Campaign Summary',
                category: 'special',
                outcome: { type: 'exit' }, // This would show summary screen in full implementation
            },
        ],
    },
    {
        id: 'validation-death',
        title: 'Fallen',
        description: 'You have fallen in battle. Your journey ends here in the darkness of the crypt.',
        locationId: 'shadowed-end',
        choices: [],
    },
];

// Export just the nodes for now, will add full campaign structure later
const validationAct: Act = {
    id: 'validation-act',
    title: 'Validation Campaign',
    description: 'A focused test of all game mechanics',
    locationId: 'darkwood-forest',
    startingNodeId: 'validation-start',
    deathNodeId: 'validation-death', // TODO: Add death node
    nodes: validationNodes,
};

export const validationCampaign: Campaign = {
    id: 'validation-campaign',
    title: 'Mechanical Validation',
    description: '15-20 minute campaign to test exploration, progression, combat polish, and character creation',
    companionName: 'The Guide',
    companionDescription: 'A mysterious voice offering tactical advice',
    acts: [validationAct],
};