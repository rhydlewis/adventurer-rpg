import type {Campaign, Act, StoryNode} from '../../types';
import type { CampEventTable } from '../../types/campEvents';
import type { SafeHaven, SanctuaryRoom } from '../../types/safeHaven';
import { useSafeHavenStore } from '../../stores/safeHavenStore';
import { useCampEventStore } from '../../stores/campEventStore';

/**
 * Single Node Campaign - Comprehensive Testing Suite
 *
 * A test campaign with a central hub that branches to different test scenarios.
 * Tests all supported encounter types, node flavors, choice outcomes, and mechanics.
 */

// =============================================================================
// PHASE 3: REST & RESOURCE MANAGEMENT DATA
// =============================================================================

/**
 * Camp Event Tables - Random encounters during long rests
 */
const campEventTables: CampEventTable[] = [
    {
        locationId: 'wilderness',
        rollChance: 60, // 60% chance of event
        events: [
            {
                id: 'wolf_howl',
                type: 'story',
                weight: 30,
                repeatable: true,
                title: 'Distant Howls',
                description: 'As you settle in for the night, you hear wolves howling in the distance. The sound is unsettling, but they don\'t seem to be approaching.',
                choices: [
                    {
                        id: 'stay_alert',
                        text: 'Stay alert and keep watch',
                        requirements: [],
                        outcome: { type: 'continue' }
                    },
                    {
                        id: 'ignore',
                        text: 'Ignore it and rest',
                        requirements: [],
                        outcome: { type: 'continue' }
                    }
                ]
            },
            {
                id: 'bandit_ambush',
                type: 'ambush',
                weight: 20,
                repeatable: true,
                title: 'Bandit Ambush!',
                description: 'You wake to the sound of footsteps! Bandits have found your camp!',
                choices: [
                    {
                        id: 'fight',
                        text: 'Fight them off!',
                        requirements: [],
                        outcome: {
                            type: 'combat',
                            enemyId: 'bandit',
                            onVictoryReturn: 'rest'
                        }
                    }
                ]
            },
            {
                id: 'mysterious_trader',
                type: 'discovery',
                weight: 25,
                repeatable: false,
                title: 'Mysterious Trader',
                description: 'A hooded figure approaches your camp. "Care to trade?" they ask, revealing a collection of potions.',
                choices: [
                    {
                        id: 'trade',
                        text: 'See what they have',
                        requirements: [],
                        outcome: {
                            type: 'interrupt',
                            effect: [
                                { type: 'giveItem', itemId: 'healing-potion' }
                            ]
                        }
                    },
                    {
                        id: 'decline',
                        text: 'Politely decline',
                        requirements: [],
                        outcome: { type: 'continue' }
                    }
                ]
            },
            {
                id: 'strange_lights',
                type: 'story',
                weight: 25,
                repeatable: true,
                title: 'Strange Lights',
                description: 'Eerie lights dance in the distance. They seem almost magical...',
                choices: [
                    {
                        id: 'investigate',
                        text: 'Investigate the lights',
                        requirements: [],
                        outcome: {
                            type: 'interrupt',
                            effect: [
                                { type: 'giveGold', amount: 25 }
                            ]
                        }
                    },
                    {
                        id: 'ignore',
                        text: 'Ignore them',
                        requirements: [],
                        outcome: { type: 'continue' }
                    }
                ]
            }
        ]
    }
];

/**
 * Safe Haven Definitions - Towns and sanctuary rooms
 */
const safeHavens: (SafeHaven | SanctuaryRoom)[] = [
    {
        id: 'test-hub-town',
        type: 'town',
        name: 'Testing Hub Town',
        locationId: 'test_hub',
        merchantId: 'test-merchant',
        merchantAvailable: true,
        questGiverPresent: false,
        levelUpAllowed: true,
        description: 'The central testing hub, now designated as a safe town.'
    } as SafeHaven,
    {
        id: 'sanctuary-room',
        type: 'sanctuary',
        name: 'Blessed Sanctuary',
        locationId: 'test_sanctuary',
        merchantAvailable: false,
        questGiverPresent: false,
        levelUpAllowed: false,
        oneTimeUse: true,
        description: 'A one-time safe haven room for testing.'
    } as SanctuaryRoom
];

// TODO: Merchant inventories will be used when we integrate merchant data persistence
// For now, merchant data is defined directly in story nodes

/**
 * Initialize Phase 3 data
 * Call this when the campaign loads to register safe havens and camp events
 */
export function initializePhase3Data() {
    // Register all safe havens
    safeHavens.forEach(haven => {
        useSafeHavenStore.getState().registerSafeHaven(haven);
    });

    // Register all camp event tables
    campEventTables.forEach(table => {
        useCampEventStore.getState().loadEventTable(table);
    });
}

const testNodes: StoryNode[] = [
    // =============================================================================
    // CHARACTER CREATION ENTRY
    // =============================================================================
    {
        id: 'test_start',
        title: 'Testing Suite - Setup',
        description: 'Welcome to the Testing Suite! Before we begin, let\'s set up your test character.',
        locationId: 'crossroads',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'crown' },
        choices: [
            {
                id: 'create_character',
                text: 'Create Character (Full Process)',
                category: 'special',
                outcome: {
                    type: 'characterCreation',
                    phase: 1,
                    nextNodeId: 'test_hub',
                },
            },
            {
                id: 'quick_character',
                text: 'Use Default Test Character (Instant)',
                category: 'special',
                outcome: {
                    type: 'goto',
                    nodeId: 'create_default_character',
                },
            },
            {
                id: 'wizard_character',
                text: 'Eldric Starweave - Level 3 Wizard',
                category: 'special',
                outcome: {
                    type: 'goto',
                    nodeId: 'create_wizard_character',
                },
            },
            {
                id: 'cleric_character',
                text: 'Brother Bosnod - Level 4 Cleric',
                category: 'special',
                outcome: {
                    type: 'goto',
                    nodeId: 'create_cleric_character',
                },
            }
        ]
    },
    {
        id: 'create_default_character',
        title: 'Character Created!',
        description: 'A default test character has been created for you:\n\n**Test Character** - Level 3 Fighter\n- HP: 30/30\n- Gold: 150g\n- Balanced stats for testing all mechanics\n\nReady to begin testing!',
        flavor: { tone: 'triumphant', icon: 'crown' },
        onEnter: [
            { type: 'createDefaultCharacter' }
        ],
        choices: [
            {
                id: 'begin_testing',
                text: 'Begin Testing',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'create_wizard_character',
        title: 'Eldric Starweave - Wizard',
        description: 'You are now **Eldric Starweave**, a brilliant elven wizard!\n\n**Level 3 Wizard**\n- High INT (16) and DEX (14)\n- Spell Slots: 2 Level 1 slots\n- Cantrips: Ray of Frost, Acid Splash\n- Level 1 Spells: Magic Missile, Shield\n\nPerfect for testing wizard spellcasting!',
        flavor: { tone: 'triumphant', icon: 'magic' },
        onEnter: [
            { type: 'createWizard' }
        ],
        choices: [
            {
                id: 'begin_testing',
                text: 'Begin Testing',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'create_cleric_character',
        title: 'Brother Bosnod - Cleric',
        description: 'You are now **Brother Bosnod**, a devout dwarf cleric of the light!\n\n**Level 4 Cleric**\n- High WIS (16) and CON (14)\n- Spell Slots: 2 Level 1 slots\n- Cantrips: Sacred Flame, Light\n- Level 1 Spells: Cure Wounds, Shield of Faith, Bless Weapon\n\nPerfect for testing cleric spellcasting and healing!',
        flavor: { tone: 'triumphant', icon: 'magic' },
        onEnter: [
            { type: 'createCleric' }
        ],
        choices: [
            {
                id: 'begin_testing',
                text: 'Begin Testing',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },

    // =============================================================================
    // CENTRAL HUB - Testing Menu
    // =============================================================================
    {
        id: 'test_hub',
        title: 'Testing Hub',
        description: 'Welcome to the comprehensive testing suite. Choose which mechanic you want to test.',
        locationId: 'crossroads',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'map' },
        choices: [
            {
                id: 'test_skill_checks',
                text: 'Test Skill Checks',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'skill_check_hub' }
            },
            {
                id: 'test_combat',
                text: 'Test Combat',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'combat_hub' }
            },
            {
                id: 'test_nested_outcomes',
                text: 'Test Nested Outcomes',
                category: 'skillCheck',
                outcome: { type: 'goto', nodeId: 'nested_outcomes_hub' }
            },
            {
                id: 'test_node_effects',
                text: 'Test Node Effects',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'node_effects_hub' }
            },
            {
                id: 'test_exploration',
                text: 'Test Exploration Tables',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'exploration_hub' }
            },
            {
                id: 'test_dialogue',
                text: 'Test Dialogue & Speakers',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'dialogue_hub' }
            },
            {
                id: 'test_requirements',
                text: 'Test Requirements',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'requirements_hub' }
            },
            {
                id: 'test_merchant',
                text: 'Test Merchant',
                category: 'merchant',
                outcome: {
                    type: 'merchant',
                    shopInventory: ['healing-potion', 'antidote', 'sword-plus-1'],
                    buyPrices: {
                        'healing-potion': 50,
                        'antidote': 25,
                        'sword-plus-1': 300
                    }
                }
            },
            {
                id: 'test_puzzles',
                text: 'Test Puzzles',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'puzzle_hub' }
            },
            {
                id: 'test_rest_system',
                text: 'Test Rest System',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            },
            {
                id: 'test_death_system',
                text: 'Test Death System',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'death_test_node' }
            },
            {
                id: 'exit_tests',
                text: 'Exit',
                category: 'movement',
                outcome: { type: 'exit' }
            }
        ]
    },

    // =============================================================================
    // SKILL CHECKS TESTING
    // =============================================================================
    {
        id: 'skill_check_hub',
        title: 'Skill Check Tests',
        description: 'Test different skill checks with varying DCs and outcomes.',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'question' },
        choices: [
            {
                id: 'easy_check',
                text: '🎲 Easy Check (DC 8)',
                displayText: '🎲 Perception DC 8: Spot the obvious trap',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Perception',
                    dc: 8,
                    success: { type: 'goto', nodeId: 'check_success' },
                    failure: { type: 'goto', nodeId: 'check_failure' }
                }
            },
            {
                id: 'medium_check',
                text: '🎲 Medium Check (DC 15)',
                displayText: '🎲 Athletics DC 15: Climb the cliff',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Athletics',
                    dc: 15,
                    success: { type: 'goto', nodeId: 'check_success' },
                    failure: { type: 'goto', nodeId: 'check_failure' }
                }
            },
            {
                id: 'hard_check',
                text: '🎲 Hard Check (DC 22)',
                displayText: '🎲 Arcana DC 22: Decipher ancient runes',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Arcana',
                    dc: 22,
                    success: { type: 'goto', nodeId: 'check_success' },
                    failure: { type: 'goto', nodeId: 'check_failure' }
                }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'check_success',
        title: 'Success!',
        description: 'Your skill check succeeded! Well done.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 25 }
        ],
        choices: [
            {
                id: 'back_to_skill_hub',
                text: 'Try another check',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'skill_check_hub' }
            },
            {
                id: 'back_to_main',
                text: 'Back to Main Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'check_failure',
        title: 'Failure',
        description: 'Your skill check failed. Better luck next time.',
        flavor: { tone: 'danger', icon: 'warning' },
        choices: [
            {
                id: 'back_to_skill_hub',
                text: 'Try another check',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'skill_check_hub' }
            },
            {
                id: 'back_to_main',
                text: 'Back to Main Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },

    // =============================================================================
    // COMBAT TESTING
    // =============================================================================
    {
        id: 'combat_hub',
        title: 'Combat Tests',
        description: 'Choose an enemy to fight.',
        type: 'combat',
        flavor: { tone: 'tense', icon: 'sword' },
        choices: [
            {
                id: 'fight_random',
                text: 'Fight Random Enemy',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'random_enemy_combat' }
            },
            {
                id: 'fight_bandit',
                text: 'Fight a Bandit',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'bandit_combat' }
            },
            {
                id: 'fight_skeleton',
                text: 'Fight a Skeleton',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'skeleton_combat' }
            },
            {
                id: 'fight_wraith',
                text: 'Fight a Wraith',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'wraith_combat' }
            },
            {
                id: 'fight_lich',
                text: 'Fight a Lich',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'lich_combat' }
            },
            {
                id: 'fight_spider',
                text: 'Fight a Giant Spider',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'giantSpider_combat' }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'random_enemy_combat',
        title: 'Random Encounter',
        description: 'A mysterious figure emerges from the shadows!',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'random', onVictoryNodeId: 'combat_victory' }
        ],
        choices: []
    },
    {
        id: 'bandit_combat',
        title: 'Bandit Encounter',
        description: 'A bandit steps from the shadows, dagger drawn!',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'bandit', onVictoryNodeId: 'combat_victory' }
        ],
        choices: []
    },
    {
        id: 'skeleton_combat',
        title: 'Skeleton Encounter',
        description: 'Bones rattle as an undead skeleton emerges, wielding a rusty mace!',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'skeleton', onVictoryNodeId: 'combat_victory' }
        ],
        choices: []
    },
    {
        id: 'wraith_combat',
        title: 'Wraith Encounter',
        description: 'A spectral wraith materializes from the shadows, its ethereal form chilling the air!',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'wraith', onVictoryNodeId: 'combat_victory' }
        ],
        choices: []
    },
    {
        id: 'lich_combat',
        title: 'Lich Encounter',
        description: 'The air turns to frostbite bloom and your bones know death has just stepped into the room—a lich unravels reality with a single, silent breath of eternal cold.',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'lich', onVictoryNodeId: 'combat_victory' }
        ],
        choices: []
    },
    {
        id: 'giantSpider_combat',
        title: 'Giant Spider Encounter',
        description: 'A massive spider drops from above, fangs dripping with venom!',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'giantSpider', onVictoryNodeId: 'combat_victory' }
        ],
        choices: []
    },
    {
        id: 'combat_victory',
        title: 'Victory!',
        description: 'The bandit falls defeated. You search the body and find some gold.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 50 },
            { type: 'setFlag', flag: 'defeated_bandit', value: true }
        ],
        choices: [
            {
                id: 'back_to_combat_hub',
                text: 'Fight another enemy',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'combat_hub' }
            },
            {
                id: 'back_to_main',
                text: 'Back to Main Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },

    // =============================================================================
    // NESTED OUTCOMES TESTING
    // =============================================================================
    {
        id: 'nested_outcomes_hub',
        title: 'Nested Outcomes Test',
        description: 'Test check-within-check scenarios: success/failure leads to another check.',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'search' },
        choices: [
            {
                id: 'trapped_hallway',
                text: '🎲 Navigate Trapped Hallway',
                displayText: '🎲 Perception DC 13: Spot the trap, then Stealth DC 15: Disarm it',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Perception',
                    dc: 13,
                    success: {
                        // Spotted the trap! Now disarm it
                        type: 'check',
                        skill: 'Stealth',
                        dc: 15,
                        success: { type: 'goto', nodeId: 'trap_disarmed' },
                        failure: { type: 'goto', nodeId: 'trap_triggered_partial' }
                    },
                    failure: { type: 'goto', nodeId: 'trap_triggered_full' }
                }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'trap_disarmed',
        title: 'Trap Disarmed',
        description: 'You carefully disable the blade trap. Safe passage achieved!',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 100 }
        ],
        choices: [
            {
                id: 'back_to_nested',
                text: '← Try again',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'nested_outcomes_hub' }
            },
            {
                id: 'back_to_main',
                text: 'Back to Main Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'trap_triggered_partial',
        title: 'Partial Damage',
        description: 'You spotted the trap but failed to disarm it! Blades swing out, grazing you.',
        flavor: { tone: 'danger', icon: 'warning' },
        onEnter: [
            { type: 'damage', amount: 4 }
        ],
        choices: [
            {
                id: 'back_to_nested',
                text: '← Try again',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'nested_outcomes_hub' }
            },
            {
                id: 'back_to_main',
                text: 'Back to Main Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'trap_triggered_full',
        title: 'Trap Triggered!',
        description: 'Blades swing from the walls! You barely dodge, but not fast enough.',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'damage', amount: 8 }
        ],
        choices: [
            {
                id: 'back_to_nested',
                text: '← Try again',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'nested_outcomes_hub' }
            },
            {
                id: 'back_to_main',
                text: 'Back to Main Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },

    // =============================================================================
    // NODE EFFECTS TESTING
    // =============================================================================
    {
        id: 'node_effects_hub',
        title: 'Node Effects Test',
        description: 'Test different onEnter effects: damage, healing, items, gold, flags.',
        type: 'event',
        flavor: { tone: 'calm', icon: 'magic' },
        choices: [
            {
                id: 'test_damage',
                text: 'Test Damage (-8 HP)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'damage_node' }
            },
            {
                id: 'test_healing',
                text: 'Test Healing (+10 HP)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'healing_node' }
            },
            {
                id: 'test_full_heal',
                text: 'Test Full Heal',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'full_heal_node' }
            },
            {
                id: 'test_gold',
                text: 'Test Gold (+75g)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'gold_node' }
            },
            {
                id: 'test_items',
                text: 'Test Items (potion + antidote)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'items_node' }
            },
            {
                id: 'test_flags',
                text: 'Test Flags',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'flags_node' }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'damage_node',
        title: 'Damage Test',
        description: 'You trigger a poison dart trap! You take 8 damage.',
        onEnter: [
            { type: 'damage', amount: 8 }
        ],
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'node_effects_hub' }
            }
        ]
    },
    {
        id: 'healing_node',
        title: 'Healing Test',
        description: 'A warm light washes over you. You heal 10 HP.',
        onEnter: [
            { type: 'heal', amount: 10 }
        ],
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'node_effects_hub' }
            }
        ]
    },
    {
        id: 'full_heal_node',
        title: 'Full Heal Test',
        description: 'Divine energy surrounds you! Your wounds close completely.',
        onEnter: [
            { type: 'heal', amount: 'full' }
        ],
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'node_effects_hub' }
            }
        ]
    },
    {
        id: 'gold_node',
        title: 'Gold Test',
        description: 'You find a hidden stash! You gain 75 gold.',
        onEnter: [
            { type: 'giveGold', amount: 75 }
        ],
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'node_effects_hub' }
            }
        ]
    },
    {
        id: 'items_node',
        title: 'Items Test',
        description: 'You discover a chest containing a healing potion and an antidote!',
        onEnter: [
            { type: 'giveItem', itemId: 'healing-potion' },
            { type: 'giveItem', itemId: 'antidote' }
        ],
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'node_effects_hub' }
            }
        ]
    },
    {
        id: 'flags_node',
        title: 'Flags Test',
        description: 'You set a test flag. This can be used for requirements.',
        onEnter: [
            { type: 'setFlag', flag: 'test_flag_activated', value: true }
        ],
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'node_effects_hub' }
            }
        ]
    },

    // =============================================================================
    // EXPLORATION TABLES TESTING
    // =============================================================================
    {
        id: 'exploration_hub',
        title: 'Exploration Tables Test',
        description: 'Test random exploration encounters from weighted tables.',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'compass' },
        choices: [
            {
                id: 'explore_forest',
                text: '🌲 Explore the Forest',
                category: 'exploration',
                outcome: {
                    type: 'explore',
                    tableId: 'forest-exploration',
                    onceOnly: false
                }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },

    // =============================================================================
    // DIALOGUE & SPEAKERS TESTING
    // =============================================================================
    {
        id: 'dialogue_hub',
        title: 'Dialogue Test',
        description: 'Test dialogue nodes with different speakers and tones.',
        speakerName: 'Narrator',
        type: 'dialogue',
        flavor: { tone: 'calm', icon: 'speech' },
        choices: [
            {
                id: 'meet_guard',
                text: '💬 Talk to the Guard',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'guard_dialogue' }
            },
            {
                id: 'meet_merchant',
                text: '💬 Talk to the Merchant',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'merchant_dialogue' }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'guard_dialogue',
        title: 'The Gate Guard',
        description: '"Halt! State your business."',
        speakerName: 'Gate Guard',
        type: 'dialogue',
        flavor: { tone: 'tense', icon: 'dialogue' },
        choices: [
            {
                id: 'intimidate',
                text: '💪 "I don\'t answer to you."',
                displayText: '🎲 Intimidate DC 15: "I don\'t answer to you."',
                category: 'dialogue',
                outcome: {
                    type: 'check',
                    skill: 'Intimidate',
                    dc: 15,
                    success: { type: 'goto', nodeId: 'guard_cowed' },
                    failure: { type: 'goto', nodeId: 'guard_angry' }
                }
            },
            {
                id: 'be_polite',
                text: '😊 "I mean no harm, just passing through."',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'guard_friendly' }
            },
            {
                id: 'act_suspicious',
                text: '😐 "That\'s none of your concern."',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'guard_suspicious' }
            },
            {
                id: 'back',
                text: 'Back',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'dialogue_hub' }
            }
        ]
    },
    {
        id: 'guard_cowed',
        title: 'The Gate Guard',
        description: 'The guard steps back, intimidated. "R-right. Move along then."',
        speakerName: 'Gate Guard',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'setFlag', flag: 'intimidated_guard', value: true }
        ],
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'dialogue_hub' }
            }
        ]
    },
    {
        id: 'guard_angry',
        title: 'The Gate Guard',
        description: 'The guard\'s face reddens. "How dare you! You\'ll regret that!"',
        speakerName: 'Gate Guard',
        flavor: { tone: 'danger', icon: 'warning' },
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'dialogue_hub' }
            }
        ]
    },
    {
        id: 'guard_friendly',
        title: 'The Gate Guard',
        description: 'The guard relaxes and smiles. "Well met, traveler. Safe journeys to you."',
        speakerName: 'Gate Guard',
        flavor: { tone: 'calm', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'guard_friendly', value: true }
        ],
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'dialogue_hub' }
            }
        ]
    },
    {
        id: 'guard_suspicious',
        title: 'The Gate Guard',
        description: 'The guard eyes you warily. "Hmm. I\'ll be watching you."',
        speakerName: 'Gate Guard',
        flavor: { tone: 'tense', icon: 'warning' },
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'dialogue_hub' }
            }
        ]
    },
    {
        id: 'merchant_dialogue',
        title: 'The Traveling Merchant',
        description: '"Greetings, friend! Care to see my wares?"',
        speakerName: 'Merchant',
        type: 'dialogue',
        flavor: { tone: 'calm', icon: 'dialogue' },
        choices: [
            {
                id: 'browse',
                text: '🏪 "Show me what you have."',
                category: 'merchant',
                outcome: {
                    type: 'merchant',
                    shopInventory: ['healing-potion', 'antidote'],
                    buyPrices: {
                        'healing-potion': 50,
                        'antidote': 25
                    }
                }
            },
            {
                id: 'leave',
                text: '"Not interested."',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'dialogue_hub' }
            },
            {
                id: 'back',
                text: 'Back',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'dialogue_hub' }
            }
        ]
    },

    // =============================================================================
    // REQUIREMENTS TESTING
    // =============================================================================
    {
        id: 'requirements_hub',
        title: 'Requirements Test',
        description: 'Test different choice requirements: flags, items, attributes, skills, class.',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'exclamation' },
        companionHint: 'Some choices require specific flags, items, or stats. Try setting flags in the Node Effects test first!',
        choices: [
            {
                id: 'requires_flag',
                text: '🚩 This requires test_flag_activated',
                category: 'special',
                requirements: [{ type: 'flag', flag: 'test_flag_activated', value: true }],
                outcome: { type: 'goto', nodeId: 'flag_requirement_met' }
            },
            {
                id: 'requires_item',
                text: '🎁 This requires healing-potion',
                category: 'special',
                requirements: [{ type: 'item', itemId: 'healing-potion' }],
                outcome: { type: 'goto', nodeId: 'item_requirement_met' }
            },
            {
                id: 'requires_str',
                text: '💪 This requires STR 14+',
                category: 'special',
                requirements: [{ type: 'attribute', attr: 'STR', min: 14 }],
                outcome: { type: 'goto', nodeId: 'attribute_requirement_met' }
            },
            {
                id: 'requires_skill',
                text: '🎲 This requires Stealth 5+',
                category: 'special',
                requirements: [{ type: 'skill', skill: 'Stealth', minRanks: 5 }],
                outcome: { type: 'goto', nodeId: 'skill_requirement_met' }
            },
            {
                id: 'requires_fighter',
                text: '⚔️ This requires Fighter class',
                category: 'combat',
                requirements: [{ type: 'class', class: 'Fighter' }],
                outcome: { type: 'goto', nodeId: 'class_requirement_met' }
            },
            {
                id: 'requires_wizard',
                text: '🔮 This requires Wizard class',
                category: 'combat',
                requirements: [{ type: 'class', class: 'Wizard' }],
                outcome: { type: 'goto', nodeId: 'class_requirement_met' }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'flag_requirement_met',
        title: 'Flag Requirement Met',
        description: 'Success! You had the required flag.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'requirements_hub' }
            }
        ]
    },
    {
        id: 'item_requirement_met',
        title: 'Item Requirement Met',
        description: 'Success! You had the required item.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'requirements_hub' }
            }
        ]
    },
    {
        id: 'attribute_requirement_met',
        title: 'Attribute Requirement Met',
        description: 'Success! Your strength was sufficient.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'requirements_hub' }
            }
        ]
    },
    {
        id: 'skill_requirement_met',
        title: 'Skill Requirement Met',
        description: 'Success! Your skill ranks were high enough.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'requirements_hub' }
            }
        ]
    },
    {
        id: 'class_requirement_met',
        title: 'Class Requirement Met',
        description: 'Success! You are the correct class.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'back',
                text: 'Back',
                outcome: { type: 'goto', nodeId: 'requirements_hub' }
            }
        ]
    },

    // =============================================================================
    // PUZZLE TESTING
    // =============================================================================
    {
        id: 'puzzle_hub',
        title: 'Puzzle Tests',
        description: 'Test all 5 puzzle mini-game types. Each puzzle routes to success or failure based on performance.',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'magic' },
        companionHint: 'Test all available puzzle types! Each has unique mechanics and difficulty configurations.',
        choices: [
            {
                id: 'timing_puzzle',
                text: 'Timing Puzzle - Synchronize the Grid',
                category: 'special',
                outcome: {
                    type: 'puzzle',
                    puzzleType: 'timing',
                    config: {
                        gridSize: 2,
                        tickInterval: 2000,
                        lockDuration: 6000
                    },
                    successNodeId: 'puzzle_success',
                    failureNodeId: 'puzzle_failure'
                }
            },
            {
                id: 'sliding_puzzle',
                text: 'Sliding Puzzle - Match the Symbols',
                category: 'special',
                outcome: {
                    type: 'puzzle',
                    puzzleType: 'sliding',
                    config: {
                        gridSize: 4,
                        targetLength: 4
                    },
                    successNodeId: 'puzzle_success',
                    failureNodeId: 'puzzle_failure'
                }
            },
            {
                id: 'rotation_puzzle',
                text: 'Rotation Puzzle - Align the Runes',
                category: 'special',
                outcome: {
                    type: 'puzzle',
                    puzzleType: 'rotation',
                    config: {
                        gridSize: 3
                    },
                    successNodeId: 'puzzle_success',
                    failureNodeId: 'puzzle_failure'
                }
            },
            {
                id: 'tumbler_puzzle_easy',
                text: 'Lock Tumbler - Easy (Independent Dials)',
                category: 'special',
                outcome: {
                    type: 'puzzle',
                    puzzleType: 'tumbler',
                    config: {
                        dialCount: 3,
                        symbolsPerDial: 6,
                        linkedDials: false
                    },
                    successNodeId: 'puzzle_success',
                    failureNodeId: 'puzzle_failure'
                }
            },
            {
                id: 'tumbler_puzzle_hard',
                text: 'Lock Tumbler - Hard (Linked Dials)',
                category: 'special',
                outcome: {
                    type: 'puzzle',
                    puzzleType: 'tumbler',
                    config: {
                        dialCount: 3,
                        symbolsPerDial: 6,
                        linkedDials: true
                    },
                    successNodeId: 'puzzle_success',
                    failureNodeId: 'puzzle_failure'
                }
            },
            {
                id: 'pressure_puzzle',
                text: 'Pressure Plates - Step in Sequence',
                category: 'special',
                outcome: {
                    type: 'puzzle',
                    puzzleType: 'pressure',
                    config: {
                        gridSize: 3,
                        togglePattern: 'cross'
                    },
                    successNodeId: 'puzzle_success',
                    failureNodeId: 'puzzle_failure'
                }
            },
            {
                id: 'auto_puzzle',
                text: 'Auto-Trigger Timing Puzzle (Node Effect)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'auto_puzzle_node' }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'auto_puzzle_node',
        title: 'Magical Trap!',
        description: 'As you step forward, ancient runes on the floor begin to glow! You must synchronize the symbols quickly or face the consequences!',
        type: 'event',
        flavor: { tone: 'urgent', icon: 'warning' },
        onEnter: [
            {
                type: 'startPuzzle',
                puzzleType: 'timing',
                config: {
                    gridSize: 2,
                    tickInterval: 1500,
                    lockDuration: 4000
                },
                successNodeId: 'puzzle_success',
                failureNodeId: 'puzzle_failure'
            }
        ],
        choices: [] // No choices - puzzle starts immediately
    },
    {
        id: 'puzzle_success',
        title: 'Puzzle Solved!',
        description: 'The symbols align perfectly, and you hear a satisfying click. You\'ve solved the puzzle! A hidden compartment opens, revealing treasure.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 100 },
            { type: 'setFlag', flag: 'solved_puzzle', value: true }
        ],
        choices: [
            {
                id: 'back_to_puzzle_hub',
                text: 'Try another puzzle',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'puzzle_hub' }
            },
            {
                id: 'back_to_main',
                text: 'Back to Main Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'puzzle_failure',
        title: 'Puzzle Failed',
        description: 'The symbols fade away, and you realize you couldn\'t solve it in time. Perhaps you\'ll try again later.',
        flavor: { tone: 'danger', icon: 'warning' },
        choices: [
            {
                id: 'back_to_puzzle_hub',
                text: 'Try another puzzle',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'puzzle_hub' }
            },
            {
                id: 'back_to_main',
                text: 'Back to Main Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },

    // =============================================================================
    // DEATH SYSTEM TESTING
    // =============================================================================
    {
        id: 'death_test_node',
        title: 'Death Trap',
        description: 'You enter a dark corridor. Ancient pressure plates line the floor, and you can see massive blade mechanisms built into the walls. This looks extremely dangerous.',
        type: 'explore',
        flavor: { tone: 'danger', icon: 'skull' },
        choices: [
            {
                id: 'impossible_perception',
                text: '🎲 Try to spot the safe path',
                displayText: '🎲 Perception DC 30: Try to spot the safe path (impossible)',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Perception',
                    dc: 30,
                    success: { type: 'goto', nodeId: 'death_avoided' },
                    failure: { type: 'goto', nodeId: 'instant_death_trap' }
                }
            },
            {
                id: 'trigger_trap',
                text: '💀 Walk straight through (instant death)',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'instant_death_trap' }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub (safe)',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'instant_death_trap',
        title: 'Lethal Trap!',
        description: 'You step on a pressure plate. Massive blades swing from every direction! The trap is impossibly deadly.',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'damage', amount: 50 } // Lethal damage - will kill most characters
        ],
        choices: []
    },
    {
        id: 'death_avoided',
        title: 'Miraculous Perception!',
        description: 'Against all odds, your eyes pick out the ONE safe tile in the entire corridor. You carefully step across and make it through unharmed!',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 500 } // Reward for the impossible
        ],
        choices: [
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },

    // =============================================================================
    // REST SYSTEM TESTING
    // =============================================================================
    {
        id: 'rest_test_hub',
        title: 'Rest System Tests',
        description: 'Test the rest system with different scenarios: safe havens, wilderness camps, and resource recovery.',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'map' },
        companionHint: 'Test short rests (50% HP), long rests (100% HP + abilities), safe havens (guaranteed), and wilderness camps (possible events).',
        choices: [
            {
                id: 'test_safe_rest',
                text: '🏠 Rest in Safe Haven (test_hub)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'safe_haven_rest' }
            },
            {
                id: 'test_wilderness_rest',
                text: '🌲 Rest in Wilderness (camp events possible)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'wilderness_rest' }
            },
            {
                id: 'test_sanctuary',
                text: '✨ Rest in Sanctuary (one-time use)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'sanctuary_rest' }
            },
            {
                id: 'take_damage_first',
                text: '💥 Take Damage First (to test recovery)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'damage_before_rest' }
            },
            {
                id: 'back_to_hub',
                text: 'Back to Hub',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            }
        ]
    },
    {
        id: 'damage_before_rest',
        title: 'Preparation',
        description: 'You take some damage to test the recovery mechanics.',
        flavor: { tone: 'tense', icon: 'warning' },
        onEnter: [
            { type: 'damage', amount: 15 }
        ],
        choices: [
            {
                id: 'now_rest',
                text: 'Now try resting',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            }
        ]
    },
    {
        id: 'safe_haven_rest',
        title: 'Testing Hub - Safe Haven',
        description: 'You are in the Testing Hub, a safe town. Here you can rest with guaranteed safety, visit the merchant, or continue your adventure.',
        locationId: 'test_hub',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'location' },
        choices: [
            {
                id: 'short_rest',
                text: '☕ Short Rest (50% HP recovery, instant)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'short_rest_recovery' }
            },
            {
                id: 'long_rest',
                text: '🌙 Long Rest (100% HP + abilities, safe)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'long_rest_recovery' }
            },
            {
                id: 'visit_merchant',
                text: '🏪 Visit Merchant',
                category: 'merchant',
                outcome: {
                    type: 'merchant',
                    shopInventory: ['healing-potion', 'antidote', 'sword-plus-1'],
                    buyPrices: {
                        'healing-potion': 50,
                        'antidote': 25,
                        'sword-plus-1': 300
                    }
                }
            },
            {
                id: 'back',
                text: 'Back to Rest Tests',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            }
        ]
    },
    {
        id: 'wilderness_rest',
        title: 'Wilderness Camp',
        description: 'You make camp in the wilderness. The area seems relatively safe, but you never know what might happen during the night...',
        locationId: 'wilderness',
        type: 'explore',
        flavor: { tone: 'tense', icon: 'location' },
        companionHint: 'Long rests in the wilderness have a chance of triggering camp events!',
        choices: [
            {
                id: 'short_rest',
                text: '☕ Short Rest (50% HP, no events)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'short_rest_recovery' }
            },
            {
                id: 'long_rest',
                text: '🌙 Long Rest (100% HP, possible camp events)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'wilderness_long_rest' }
            },
            {
                id: 'back',
                text: 'Back to Rest Tests',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            }
        ]
    },
    {
        id: 'sanctuary_rest',
        title: 'Blessed Sanctuary',
        description: 'You discover a small sanctuary room, its walls covered in holy symbols. This is a one-time safe haven - once you rest here, its power will be spent.',
        locationId: 'test_sanctuary',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'magic' },
        companionHint: 'Sanctuary rooms provide guaranteed safety but can only be used once!',
        choices: [
            {
                id: 'use_sanctuary',
                text: '✨ Rest in Sanctuary (one-time use)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'sanctuary_rest_recovery' }
            },
            {
                id: 'save_for_later',
                text: 'Save it for later',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            }
        ]
    },
    {
        id: 'short_rest_recovery',
        title: 'Short Rest Complete',
        description: 'You take a brief rest, tending to your wounds and catching your breath. You recover 50% of your HP.',
        flavor: { tone: 'calm', icon: 'reward' },
        onEnter: [
            // TODO: Implement short rest effect
            { type: 'heal', amount: 10 }
        ],
        choices: [
            {
                id: 'continue',
                text: 'Continue',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            }
        ]
    },
    {
        id: 'long_rest_recovery',
        title: 'Long Rest Complete',
        description: 'You sleep through the night peacefully. You wake refreshed, with all your HP and abilities restored!',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'heal', amount: 'full' },
            { type: 'restoreSpellSlots' }
        ],
        choices: [
            {
                id: 'continue',
                text: 'Continue',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            }
        ]
    },
    {
        id: 'wilderness_long_rest',
        title: 'Wilderness Long Rest',
        description: 'You settle in for a long rest in the wilderness. Roll for camp events...',
        locationId: 'wilderness',
        flavor: { tone: 'tense', icon: 'location' },
        onEnter: [
            { type: 'heal', amount: 'full' },
            { type: 'restoreSpellSlots' }
            // TODO: Trigger camp event check
        ],
        choices: [
            {
                id: 'continue',
                text: 'Continue',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            }
        ]
    },
    {
        id: 'sanctuary_rest_recovery',
        title: 'Sanctuary Rest Complete',
        description: 'Divine energy washes over you as you rest in the sanctuary. You are fully healed and restored. The holy symbols on the walls fade - this sanctuary has served its purpose.',
        flavor: { tone: 'triumphant', icon: 'magic' },
        onEnter: [
            { type: 'heal', amount: 'full' },
            { type: 'restoreSpellSlots' }
            // TODO: Mark sanctuary as used
        ],
        choices: [
            {
                id: 'continue',
                text: 'Continue',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'rest_test_hub' }
            }
        ]
    },

    // =============================================================================
    // DEATH NODE
    // =============================================================================
    {
        id: 'test_death',
        title: 'Death',
        description: 'Your wounds were too severe. Darkness closes in around you as your vision fades... But this is just a test, so let\'s bring you back!',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'heal', amount: 'full' } // Resurrect for testing purposes
        ],
        choices: [
            {
                id: 'restart',
                text: '↻ Return to Hub (Resurrected)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'test_hub' }
            },
            {
                id: 'exit',
                text: '🚪 Exit Testing Suite',
                category: 'movement',
                outcome: { type: 'exit' }
            }
        ]
    }
]

const testAct: Act = {
    id: 'test-act-1',
    title: 'Testing Suite Act',
    description: 'Comprehensive test suite for all narrative system features.',
    locationId: 'crossroads',
    startingNodeId: 'test_start',
    deathNodeId: 'test_death',
    nodes: testNodes,
};

export const singleNodeCampaign: Campaign = {
    id: 'single-node-campaign',
    title: 'Testing Suite',
    description: 'A comprehensive testing campaign covering all encounter types, node flavors, choice outcomes, and game mechanics. Navigate from a central hub to test different features.',
    companionName: 'Test Guide',
    companionDescription: 'Your guide through the testing suite. Use the companion hint button (?) for helpful information about each test.',
    acts: [testAct],
};
