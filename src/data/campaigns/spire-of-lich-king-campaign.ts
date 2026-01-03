import type {Campaign, Act, StoryNode} from '../../types';
import { LOCATIONS } from '../locations';

/**
 * The Spire of the Lich King - Complete Campaign
 *
 * A narrative campaign featuring:
 * - Act 0: First Blood (Tutorial) - Ashford Village & Blackwood Forest
 * - Act 1: The Hook & The Approach - Oakhaven & Tower Entrance
 * - Act 2: The Upper Levels - Tower Interior & Cellars
 * - Act 3: The Maze - Underground Catacombs
 * - Act 4: The Void Sanctum & The Fall - Final Confrontation with Sorath
 * - Epilogue: The Dawn - Victory and Rewards
 */

const act0Nodes: StoryNode[] = [
    // =============================================================================
    // ACT 0: CHARACTER CREATION & VILLAGE GATES
    // =============================================================================
    {
        id: 'ashford_gates',
        title: 'The Gates of Ashford',
        description: 'You approach the wooden gates of Ashford, a modest village nestled at the edge of the Blackwood Forest. A guard in worn leather armor steps forward, hand raised in greeting.\n\n"Hold there, traveler. State your name and profession before entering."',
        locationId: 'ashford',
        type: 'dialogue',
        speakerName: 'Village Guard',
        flavor: { tone: 'calm', icon: 'dialogue' },
        choices: [
            {
                id: 'create_character',
                text: '"I am a..."',
                category: 'special',
                outcome: {
                    type: 'characterCreation',
                    phase: 1,
                    nextNodeId: 'burning_village_entrance',
                },
            },
            {
                id: 'quick_character',
                text: 'Skip character creation (use default)',
                category: 'special',
                outcome: {
                    type: 'goto',
                    nodeId: 'create_default_character',
                },
            }
        ]
    },
    {
        id: 'create_default_character',
        title: 'Welcome to Ashford',
        description: 'The guard nods and waves you through.\n\n**Default Character Created** - Level 3 Fighter\n- HP: 30/30\n- Gold: 150g\n- Basic equipment',
        flavor: { tone: 'calm', icon: 'crown' },
        onEnter: [
            { type: 'createDefaultCharacter' }
        ],
        choices: [
            {
                id: 'enter_village',
                text: 'Enter the village',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'burning_village_entrance' }
            }
        ]
    },

    // =============================================================================
    // THE BURNING VILLAGE
    // =============================================================================
    {
        id: 'burning_village_entrance',
        title: 'Chaos in Ashford',
        description: 'As you step through the gates, the acrid smell of smoke hits you. Buildings smolder, sending black plumes into the sky. Villagers run about desperately, some carrying buckets of water, others clutching scorched belongings.\n\nAn exhausted guard staggers toward you, face blackened with soot.',
        locationId: 'ashford',
        type: 'explore',
        flavor: { tone: 'danger', icon: 'warning' },
        choices: [
            {
                id: 'talk_to_guard',
                text: '"What happened here?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'guard_report' }
            },
            {
                id: 'intimidate_guard',
                text: '"Tell me everything. Now."',
                displayText: 'Intimidate DC 10: "Tell me everything. Now."',
                category: 'dialogue',
                outcome: {
                    type: 'check',
                    skill: 'Intimidate',
                    dc: 10,
                    success: { type: 'goto', nodeId: 'guard_intimidated' },
                    failure: { type: 'goto', nodeId: 'guard_report' }
                }
            }
        ]
    },
    {
        id: 'guard_report',
        title: 'The Guard\'s Report',
        description: '"Bandits came in the night," the guard wheezes. "Took everything of value and set fire to half the village. There were... maybe four or five of them. Their leader had a scarred face and a cruel laugh that still echoes in my ears."\n\nHe points east with a trembling hand. "They fled toward the Blackwood Forest."',
        speakerName: 'Exhausted Guard',
        type: 'dialogue',
        flavor: { tone: 'tense', icon: 'dialogue' },
        choices: [
            {
                id: 'ask_injuries',
                text: '"Anyone hurt?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'guard_injuries_info' }
            },
            {
                id: 'explore_village',
                text: 'Explore the village',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'village_investigation_hub' }
            }
        ]
    },
    {
        id: 'guard_intimidated',
        title: 'The Guard Talks',
        description: 'The guard\'s eyes widen and he stammers out his report quickly:\n\n"B-bandits! Four or five of them, led by a scarred brute. They ransacked the village and fled east into the Blackwood Forest with our gold and goods. The militia tried to stop them but... we were caught off guard. Three of our men are wounded, one seriously."',
        speakerName: 'Exhausted Guard',
        type: 'dialogue',
        flavor: { tone: 'tense', icon: 'dialogue' },
        choices: [
            {
                id: 'explore_village',
                text: 'Explore the village',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'village_investigation_hub' }
            }
        ]
    },
    {
        id: 'guard_injuries_info',
        title: 'Casualties',
        description: '"Three of the militia are wounded," the guard says grimly. "One of them is in bad shape. The rest of us... we\'ll live, but our pride took a beating along with our bodies."',
        speakerName: 'Exhausted Guard',
        type: 'dialogue',
        flavor: { tone: 'tense', icon: 'dialogue' },
        choices: [
            {
                id: 'explore_village',
                text: 'Explore the village',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'village_investigation_hub' }
            }
        ]
    },

    // =============================================================================
    // VILLAGE INVESTIGATION HUB
    // =============================================================================
    {
        id: 'village_investigation_hub',
        title: 'Ashford Village Square',
        description: 'The village square is in chaos. You can see several people who might have information:\n\n- The **innkeeper** sits on the steps of her smoking tavern, head in hands\n- The **blacksmith** examines his ransacked forge\n- A **wounded militia member** leans against a wall\n- The **mayor** stands near the well, directing the firefighting efforts',
        locationId: 'ashford',
        type: 'explore',
        flavor: { tone: 'tense', icon: 'search' },
        companionHint: 'Talk to the villagers to gather information. The blacksmith might have equipment to offer.',
        choices: [
            {
                id: 'talk_innkeeper',
                text: 'Talk to the innkeeper',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'innkeeper_dialogue' }
            },
            {
                id: 'talk_blacksmith',
                text: 'Talk to the blacksmith',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'blacksmith_dialogue' }
            },
            {
                id: 'talk_militia',
                text: 'Talk to the wounded militia',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'militia_dialogue' }
            },
            {
                id: 'talk_mayor',
                text: 'Talk to the mayor',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'mayor_dialogue' }
            },
            {
                id: 'pursue_bandits',
                text: 'Pursue the bandits into the Blackwood',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'blackwood_entrance' }
            }
        ]
    },
    {
        id: 'innkeeper_dialogue',
        title: 'The Innkeeper\'s Loss',
        description: '"They took everything," the innkeeper sobs. "My life savings, hidden beneath the floorboards. That scarred bastard - their leader - he laughed when he found it. Such a cruel, mocking laugh. I\'ll never forget that sound."',
        speakerName: 'Innkeeper',
        type: 'dialogue',
        flavor: { tone: 'calm', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'talked_to_innkeeper', value: true }
        ],
        choices: [
            {
                id: 'back',
                text: '← Back to village square',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'village_investigation_hub' }
            }
        ]
    },
    {
        id: 'blacksmith_dialogue',
        title: 'The Blacksmith\'s Offer',
        description: 'The blacksmith looks up from the wreckage of his forge, anger burning in his eyes.\n\n"Ransacked my whole shop, they did. Took my best blades and tools." He pauses, then reaches behind a still-intact workbench. "But I\'ve got one weapon they missed. Hunt those bandits down, and it\'s yours."',
        speakerName: 'Blacksmith',
        type: 'dialogue',
        flavor: { tone: 'tense', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'talked_to_blacksmith', value: true },
            { type: 'giveItem', itemId: 'sword-plus-1' }
        ],
        choices: [
            {
                id: 'accept_weapon',
                text: '"I\'ll bring them to justice."',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'village_investigation_hub' }
            }
        ]
    },
    {
        id: 'militia_dialogue',
        title: 'Tactical Intelligence',
        description: 'The wounded militia clutches his side but speaks clearly:\n\n"Four or five bandits total. Their leader is the dangerous one - scarred face, dual daggers. They fled east toward the Blackwood Forest about an hour ago. Can\'t have gotten far with all that loot weighing them down."',
        speakerName: 'Wounded Militia',
        type: 'dialogue',
        flavor: { tone: 'tense', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'talked_to_militia', value: true }
        ],
        choices: [
            {
                id: 'back',
                text: '← Back to village square',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'village_investigation_hub' }
            }
        ]
    },
    {
        id: 'mayor_dialogue',
        title: 'The Mayor\'s Plea',
        description: 'The mayor, an older woman with soot-stained robes, turns to face you.\n\n"Thank the gods someone capable has arrived. Those bandits have ruined us. If you can recover the stolen goods and bring those criminals to justice, I can offer you 100 gold pieces from what remains of our treasury. Will you help us?"',
        speakerName: 'Mayor',
        type: 'dialogue',
        flavor: { tone: 'calm', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'talked_to_mayor', value: true },
            { type: 'setFlag', flag: 'accepted_mayors_quest', value: true }
        ],
        choices: [
            {
                id: 'accept_quest',
                text: '"I\'ll do it."',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'village_investigation_hub' }
            },
            {
                id: 'decline',
                text: '"I\'m not interested."',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'village_investigation_hub' }
            }
        ]
    },

    // =============================================================================
    // INTO THE BLACKWOOD
    // =============================================================================
    {
        id: 'blackwood_entrance',
        title: 'The Edge of the Blackwood',
        description: 'The Blackwood Forest looms before you, ancient trees forming a dark canopy that blocks out the sun. The bandit tracks are clear here - broken branches, trampled undergrowth, and cart wheel ruts in the soft earth.\n\nThe forest ahead grows quieter and more ominous with each step.',
        locationId: 'blackwood-forest',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'compass' },
        choices: [
            {
                id: 'track_bandits',
                text: 'Follow the tracks carefully',
                displayText: 'Perception DC 12: Follow the tracks',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Perception',
                    dc: 12,
                    success: { type: 'goto', nodeId: 'direct_to_bandit' },
                    failure: { type: 'goto', nodeId: 'forest_encounter' }
                }
            },
            {
                id: 'rush_forward',
                text: 'Rush forward blindly',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'forest_encounter' }
            }
        ]
    },
    {
        id: 'forest_encounter',
        title: 'Corrupted Wildlife',
        description: 'You lose the trail in the thick undergrowth. Suddenly, a low growl echoes through the trees. A wolf emerges from the shadows... It charges!',
        locationId: 'blackwood-forest',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'wolf', onVictoryNodeId: 'after_wolf_combat' }
        ],
        choices: []
    },
    {
        id: 'after_wolf_combat',
        title: 'Strange Corruption',
        description: 'The wolf falls, its body lying on the path.\n\nAfter a moment of searching, you step over the wolf and pick up the bandit trail again.',
        flavor: { tone: 'mysterious', icon: 'search' },
        choices: [
            {
                id: 'continue',
                text: 'Continue tracking',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'bandit_clearing' }
            }
        ]
    },
    {
        id: 'direct_to_bandit',
        title: 'Expert Tracking',
        description: 'You follow the trail expertly, noting every sign: discarded loot, cart wheel ruts, broken branches showing their hasty retreat. The tracks lead to a small clearing ahead.\n\nYou\'ve found them.',
        locationId: 'blackwood-forest',
        flavor: { tone: 'tense', icon: 'search' },
        onEnter: [
            { type: 'giveGold', amount: 25 }
        ],
        choices: [
            {
                id: 'continue',
                text: 'Approach the clearing',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'bandit_clearing' }
            }
        ]
    },

    // =============================================================================
    // THE WOUNDED BANDIT LEADER
    // =============================================================================
    {
        id: 'bandit_clearing',
        title: 'The Clearing',
        description: 'In a small clearing, you find a man slumped against a tree, badly wounded. Blood stains his leather armor. His scarred face matches the description - this is the bandit leader.\n\nScattered around him are signs of a fight: claw marks, broken arrows, blood. It seems the forest - or something in it - got to him first.\n\nHe looks up as you approach, hand moving weakly toward his dagger.',
        locationId: 'blackwood-forest',
        type: 'dialogue',
        speakerName: 'Wounded Bandit',
        flavor: { tone: 'tense', icon: 'dialogue' },
        choices: [
            {
                id: 'ask_gang',
                text: '"Where\'s the rest of your gang?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'bandit_abandoned' }
            },
            {
                id: 'ask_loot',
                text: '"Where are the stolen goods?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'bandit_loot_info' }
            },
            {
                id: 'intimidate_bandit',
                text: '"Talk, or I\'ll finish what the forest started."',
                displayText: 'Intimidate DC 13: Threaten the bandit',
                category: 'dialogue',
                outcome: {
                    type: 'check',
                    skill: 'Intimidate',
                    dc: 13,
                    success: { type: 'goto', nodeId: 'bandit_talks' },
                    failure: { type: 'goto', nodeId: 'bandit_defiant' }
                }
            },
            {
                id: 'attack',
                text: '"I\'m here for justice."',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'bandit_combat' }
            }
        ]
    },
    {
        id: 'bandit_abandoned',
        title: 'Abandoned',
        description: 'The bandit lets out a bitter, wheezing laugh.\n\n"My gang? Those cowards ran when the creatures attacked. Left me to die. Some loyalty, eh?"',
        speakerName: 'Wounded Bandit',
        type: 'dialogue',
        flavor: { tone: 'calm', icon: 'dialogue' },
        choices: [
            {
                id: 'ask_loot',
                text: '"Where are the stolen goods?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'bandit_loot_info' }
            },
            {
                id: 'attack',
                text: '"Time to face justice."',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'bandit_combat' }
            }
        ]
    },
    {
        id: 'bandit_loot_info',
        title: 'The Stolen Goods',
        description: '"The loot?" The bandit coughs. "Hidden in our camp, just north of here. Not that it matters to me anymore..."',
        speakerName: 'Wounded Bandit',
        type: 'dialogue',
        flavor: { tone: 'calm', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'knows_camp_location', value: true }
        ],
        choices: [
            {
                id: 'attack',
                text: 'End this',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'bandit_combat' }
            }
        ]
    },
    {
        id: 'bandit_talks',
        title: 'Complete Confession',
        description: 'Fear flashes in the bandit\'s eyes.\n\n"A-alright! My gang abandoned me when the forest creatures attacked. The stolen goods are hidden in our camp just north of here. And... and we were hired! Some man in Oakhaven paid us to raid Ashford. Said he needed the village\'s coin for \'the package\' and \'the tower.\' That\'s all I know, I swear!"',
        speakerName: 'Wounded Bandit',
        type: 'dialogue',
        flavor: { tone: 'tense', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'knows_camp_location', value: true },
            { type: 'setFlag', flag: 'knows_about_conspiracy', value: true }
        ],
        choices: [
            {
                id: 'attack',
                text: '"Your crimes end here."',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'bandit_combat' }
            }
        ]
    },
    {
        id: 'bandit_defiant',
        title: 'Defiance',
        description: 'The bandit spits blood.\n\n"Do your worst. I\'m dead already."',
        speakerName: 'Wounded Bandit',
        type: 'dialogue',
        flavor: { tone: 'danger', icon: 'warning' },
        choices: [
            {
                id: 'attack',
                text: 'Attack',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'bandit_combat' }
            }
        ]
    },
    {
        id: 'bandit_combat',
        title: 'Combat Tutorial: The Bandit Leader',
        description: 'With a desperate snarl, the wounded bandit lunges at you, dagger flashing!\n\nThis is your first true test of combat.',
        locationId: 'blackwood-forest',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'bandit', onVictoryNodeId: 'after_bandit_combat' }
        ],
        choices: []
    },

    // =============================================================================
    // AFTER VICTORY & COMPANION INTRODUCTION
    // =============================================================================
    {
        id: 'after_bandit_combat',
        title: 'Victory',
        description: 'The bandit falls, his reign of terror ended. You search his body and find:\n\n- A small pouch containing **50 gold** (partial loot from Ashford)\n- A mysterious **letter** bearing an unfamiliar seal\n- A crudely drawn **map** showing the forest path toward Oakhaven',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 50 },
            { type: 'setFlag', flag: 'defeated_bandit_leader', value: true },
            { type: 'setFlag', flag: 'has_mysterious_letter', value: true }
        ],
        choices: [
            {
                id: 'read_letter',
                text: '📜 Read the letter',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'mysterious_letter' }
            }
        ]
    },
    {
        id: 'mysterious_letter',
        title: 'A Mysterious Letter',
        description: 'You unfold the letter. The handwriting is elegant but hurried:\n\n*"Deliver the package to the meeting point in Oakhaven by week\'s end. The tower ritual cannot be delayed. Payment as agreed. - S."*\n\nWhat business did a common bandit have with Oakhaven? And what is this tower they mentioned?',
        flavor: { tone: 'mysterious', icon: 'search' },
        choices: [
            {
                id: 'explore_area',
                text: 'Search the area',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'find_the_elder' }
            }
        ]
    },
    {
        id: 'find_the_elder',
        title: 'The Elder Artifact',
        description: 'As you search the clearing, something catches your eye - a faint glow emanating from beneath the roots of an ancient oak tree.\n\nYou dig carefully and unearth a small, ornate artifact: a crystal orb set in tarnished silver. The moment your fingers touch it, warmth spreads through your hand and a voice - ancient and wise - speaks directly into your mind:\n\n*"At last... someone worthy. I am The Elder, and I have much to teach you, young adventurer."*',
        speakerName: 'The Elder',
        flavor: { tone: 'mysterious', icon: 'magic' },
        onEnter: [
            { type: 'setFlag', flag: 'acquired_the_elder', value: true }
        ],
        choices: [
            {
                id: 'question_elder',
                text: '"What are you?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'elder_introduction' }
            }
        ]
    },
    {
        id: 'elder_introduction',
        title: 'The Elder\'s Story',
        description: '*"I am a fragment of a scholar who perished long ago in a tower most foul. My knowledge was bound to this artifact so that I might guide another. The letter you found speaks of dark things brewing in Oakhaven. If you wish to uncover the truth, I shall accompany you on your journey."*',
        speakerName: 'The Elder',
        type: 'dialogue',
        flavor: { tone: 'mysterious', icon: 'dialogue' },
        companionHint: 'The Elder will now provide hints and lore throughout your adventure. Look for the (?) button to receive guidance.',
        choices: [
            {
                id: 'accept_companion',
                text: '"I\'ll be glad for the company."',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'journey_to_oakhaven' }
            }
        ]
    },

    // =============================================================================
    // JOURNEY TO OAKHAVEN (TRANSITION TO ACT 1)
    // =============================================================================
    {
        id: 'journey_to_oakhaven',
        title: 'Journey to Oakhaven',
        description: 'Following the bandit\'s map, you navigate through the Blackwood Forest. The trees gradually thin, and after several hours of travel, you see the warm lights of Oakhaven in the distance.\n\n*The letter suggests something larger at play. What business did a common bandit have in Oakhaven? And what is this tower they mentioned?*\n\nThe Elder\'s presence in your pack feels reassuring as you approach the village.',
        locationId: 'blackwood-forest',
        flavor: { tone: 'calm', icon: 'compass' },
        choices: [
            {
                id: 'arrive_oakhaven',
                text: 'Enter Oakhaven',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'oakhaven_entrance' }
            }
        ]
    },
];

const act1Nodes: StoryNode[] = [
    // =============================================================================
    // ACT 1: OAKHAVEN - THE HOOK
    // =============================================================================
    {
        id: 'oakhaven_entrance',
        title: 'Oakhaven',
        description: 'Oakhaven is larger and more prosperous than Ashford. Stone buildings line cobblestone streets, and the sound of hammers and conversation fills the air. The village appears peaceful - a stark contrast to the chaos you left behind.\n\nThe most prominent building is a tavern called **The Splintered Shield**, its painted sign swinging gently in the breeze.',
        locationId: 'oakhaven',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'map' },
        companionHint: 'The Elder whispers: "Rest would do you good, and taverns are excellent places to gather information."',
        choices: [
            {
                id: 'enter_tavern',
                text: '🍺 Enter The Splintered Shield',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'splintered_shield_tavern' }
            },
            {
                id: 'explore_village',
                text: '🗺️ Explore the village',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'oakhaven_exploration_hub' }
            }
        ]
    },
    {
        id: 'oakhaven_exploration_hub',
        title: 'Oakhaven Village',
        description: 'You wander the streets of Oakhaven. The village is peaceful, though you notice nervous glances from some of the villagers. Perhaps they\'ve heard rumors too.',
        locationId: 'oakhaven',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'compass' },
        choices: [
            {
                id: 'enter_tavern',
                text: '🍺 Go to The Splintered Shield',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'splintered_shield_tavern' }
            },
            {
                id: 'rest',
                text: '✨ Rest (heal fully)',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'rest_in_oakhaven' }
            }
        ]
    },
    {
        id: 'rest_in_oakhaven',
        title: 'A Moment of Rest',
        description: 'You find a quiet corner and rest for a while, allowing your wounds to heal and your strength to return.',
        flavor: { tone: 'calm', icon: 'magic' },
        onEnter: [
            { type: 'heal', amount: 'full' }
        ],
        choices: [
            {
                id: 'continue',
                text: 'Continue',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'oakhaven_exploration_hub' }
            }
        ]
    },
    {
        id: 'splintered_shield_tavern',
        title: 'The Splintered Shield',
        description: 'The tavern is warm and crowded. The smell of roasted meat and ale fills the air. Patrons sit at wooden tables, some laughing, others speaking in hushed tones.\n\nNear the bar, you notice a terrified-looking man gesturing wildly as he speaks to a small crowd.',
        locationId: 'oakhaven',
        type: 'explore',
        flavor: { tone: 'calm', icon: 'dialogue' },
        choices: [
            {
                id: 'listen_to_poacher',
                text: '👂 Listen to the terrified man',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'poacher_rumor' }
            },
            {
                id: 'order_drink',
                text: '🍺 Order a drink',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'tavern_barkeep' }
            }
        ]
    },
    {
        id: 'poacher_rumor',
        title: 'The Poacher\'s Tale',
        description: 'You move closer to listen. The man is a poacher, his hands trembling as he clutches a mug of ale.\n\n"I\'m telling you, I saw it with my own eyes! The ruins of the Old Watchtower - they were glowing with this sickly emerald light. And the sound... gods, the sound! A low, thrumming hum that made my teeth ache and my bones vibrate. I ran. I ain\'t going back there, not for all the game in the forest!"',
        speakerName: 'Terrified Poacher',
        type: 'dialogue',
        flavor: { tone: 'mysterious', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'heard_tower_rumor', value: true }
        ],
        choices: [
            {
                id: 'ask_location',
                text: '"Where is this tower?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'tower_location_info' }
            },
            {
                id: 'ask_more',
                text: '"Tell me more about what you saw."',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'tower_details' }
            }
        ]
    },
    {
        id: 'tower_location_info',
        title: 'The Tower\'s Location',
        description: '"Deep in the Blackwood, northeast of here," the poacher says. "Follow the old logging road until you reach the Standing Stones, then head due north. You can\'t miss it - the tower looms over the trees like a black finger pointing at the sky."',
        speakerName: 'Terrified Poacher',
        type: 'dialogue',
        flavor: { tone: 'mysterious', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'knows_tower_location', value: true }
        ],
        choices: [
            {
                id: 'find_magistrate',
                text: 'Seek out the magistrate',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'magistrate_scene' }
            },
            {
                id: 'prepare',
                text: 'Prepare for the journey',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'oakhaven_exploration_hub' }
            }
        ]
    },
    {
        id: 'tower_details',
        title: 'More Details',
        description: '"The light... it pulsed, like a heartbeat. And shadows moved in the windows - not natural shadows. Shapes that shouldn\'t exist." The poacher shudders. "I\'ve hunted these woods for twenty years, and I\'ve never felt fear like that."',
        speakerName: 'Terrified Poacher',
        type: 'dialogue',
        flavor: { tone: 'danger', icon: 'dialogue' },
        choices: [
            {
                id: 'ask_location',
                text: '"Where is this tower?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'tower_location_info' }
            }
        ]
    },
    {
        id: 'tavern_barkeep',
        title: 'The Barkeep',
        description: 'The barkeep, a stout woman with kind eyes, slides you an ale.\n\n"You look like you\'ve traveled far. Welcome to Oakhaven. If you\'re looking for work or adventure, talk to the magistrate. Strange things have been happening lately."',
        speakerName: 'Barkeep',
        type: 'dialogue',
        flavor: { tone: 'calm', icon: 'dialogue' },
        choices: [
            {
                id: 'listen_to_poacher',
                text: '👂 Listen to the terrified man nearby',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'poacher_rumor' }
            },
            {
                id: 'leave',
                text: '← Leave the tavern',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'oakhaven_exploration_hub' }
            }
        ]
    },
    {
        id: 'magistrate_scene',
        title: 'The Magistrate\'s Bounty',
        description: 'You find the magistrate in his office, a serious man with gray hair and worry lines.\n\n"Ah, an adventurer. Perfect timing. I\'ll offer 200 gold pieces to anyone brave enough to investigate the Old Watchtower. People are scared, and I need answers. Are you interested?"',
        speakerName: 'Magistrate',
        type: 'dialogue',
        flavor: { tone: 'calm', icon: 'dialogue' },
        onEnter: [
            { type: 'setFlag', flag: 'offered_tower_bounty', value: true }
        ],
        choices: [
            {
                id: 'accept_bounty',
                text: '"I\'ll investigate the tower."',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'accepted_tower_quest' }
            },
            {
                id: 'decline',
                text: '"I need time to think."',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'oakhaven_exploration_hub' }
            }
        ]
    },
    {
        id: 'accepted_tower_quest',
        title: 'Quest Accepted',
        description: 'The magistrate nods grimly. "Be careful out there. Whatever is happening at that tower... it\'s not natural. May the gods watch over you."',
        speakerName: 'Magistrate',
        flavor: { tone: 'tense', icon: 'exclamation' },
        onEnter: [
            { type: 'setFlag', flag: 'accepted_tower_quest', value: true }
        ],
        choices: [
            {
                id: 'to_tower',
                text: 'Journey to the tower',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'journey_to_tower' }
            },
            {
                id: 'prepare_more',
                text: 'Prepare first',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'oakhaven_exploration_hub' }
            }
        ]
    },

    // =============================================================================
    // JOURNEY TO THE TOWER
    // =============================================================================
    {
        id: 'journey_to_tower',
        title: 'Journey Through the Blackwood',
        description: 'You follow the old logging road through the Blackwood Forest. The closer you get to the tower, the quieter the forest becomes. No birds sing. No wind rustles the leaves. An unnatural silence hangs over everything.\n\nThe Elder speaks: *"Dark magic corrupts the natural world. Be on your guard."*',
        locationId: 'blackwood-forest',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'compass' },
        companionHint: 'The Elder warns: "The corruption we sensed in the wolf earlier grows stronger here. Expect hostile creatures."',
        choices: [
            {
                id: 'proceed_carefully',
                text: 'Proceed carefully',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'corrupted_encounter' }
            }
        ]
    },
    {
        id: 'corrupted_encounter',
        title: 'Corrupted Nature',
        description: 'As you push through the undergrowth, the vegetation itself seems hostile. Vines writhe unnaturally, and the trees appear blighted with dark rot.\n\nSuddenly, aggressive vines lash out at you!',
        locationId: 'blackwood-forest',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'corrupted-vines', onVictoryNodeId: 'after_vines_combat' }
        ],
        choices: []
    },
    {
        id: 'after_vines_combat',
        title: 'The Corruption Spreads',
        description: 'The vines wither and die, turning to ash. The corruption is spreading from the tower, twisting the forest into something unnatural.\n\nYou press onward.',
        flavor: { tone: 'mysterious', icon: 'warning' },
        choices: [
            {
                id: 'continue',
                text: 'Continue to the tower',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'tower_courtyard' }
            }
        ]
    },

    // =============================================================================
    // THE TOWER ENTRANCE
    // =============================================================================
    {
        id: 'tower_courtyard',
        title: 'The Old Watchtower',
        description: 'You emerge into a crumbling courtyard. The tower looms before you - a massive structure of black stone, its windows glowing with sickly emerald light. The thrumming hum the poacher mentioned vibrates through your bones.\n\nThe entrance is sealed by a shimmering magical barrier. Ancient runes glow on the doorframe.\n\nThe Elder speaks: *"A harmonization lock. You\'ll need to find three Singing Stones hidden in this courtyard to break the seal."*',
        locationId: 'old-watchtower',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'exclamation' },
        companionHint: 'Look for objects that hum or resonate. The Singing Stones will be hidden in the rubble.',
        choices: [
            {
                id: 'search_left',
                text: '🔍 Search the left side of the courtyard',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'search_left_courtyard' }
            },
            {
                id: 'search_right',
                text: '🔍 Search the right side of the courtyard',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'search_right_courtyard' }
            },
            {
                id: 'search_center',
                text: '🔍 Search the center fountain',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'search_center_courtyard' }
            }
        ]
    },
    {
        id: 'search_left_courtyard',
        title: 'Left Courtyard',
        description: 'You search through the rubble on the left side of the courtyard. Among broken stones and dead vegetation, you find a small crystal that hums softly when touched.\n\n**First Singing Stone found!**',
        flavor: { tone: 'triumphant', icon: 'search' },
        onEnter: [
            { type: 'setFlag', flag: 'found_stone_1', value: true }
        ],
        choices: [
            {
                id: 'back',
                text: '← Back to courtyard',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'courtyard_progress_check' }
            }
        ]
    },
    {
        id: 'search_right_courtyard',
        title: 'Right Courtyard',
        description: 'Searching the right side, you notice a faint glow beneath a collapsed pillar. You shift the rubble and extract a humming crystal.\n\n**Second Singing Stone found!**',
        flavor: { tone: 'triumphant', icon: 'search' },
        onEnter: [
            { type: 'setFlag', flag: 'found_stone_2', value: true }
        ],
        choices: [
            {
                id: 'back',
                text: '← Back to courtyard',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'courtyard_progress_check' }
            }
        ]
    },
    {
        id: 'search_center_courtyard',
        title: 'Center Fountain',
        description: 'The old fountain in the center is dry and cracked. At the bottom, you spot a glowing crystal half-buried in debris. You retrieve it carefully.\n\n**Third Singing Stone found!**',
        flavor: { tone: 'triumphant', icon: 'search' },
        onEnter: [
            { type: 'setFlag', flag: 'found_stone_3', value: true }
        ],
        choices: [
            {
                id: 'back',
                text: '← Back to courtyard',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'courtyard_progress_check' }
            }
        ]
    },
    {
        id: 'courtyard_progress_check',
        title: 'The Old Watchtower Courtyard',
        description: 'You stand in the courtyard before the sealed tower entrance. The magical barrier still shimmers.',
        locationId: 'old-watchtower',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'exclamation' },
        choices: [
            {
                id: 'search_left',
                text: '🔍 Search the left side',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'search_left_courtyard' }
            },
            {
                id: 'search_right',
                text: '🔍 Search the right side',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'search_right_courtyard' }
            },
            {
                id: 'search_center',
                text: '🔍 Search the center fountain',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'search_center_courtyard' }
            },
            {
                id: 'use_stones',
                text: '✨ Use the Singing Stones on the barrier',
                category: 'special',
                requirements: [
                    { type: 'flag', flag: 'found_stone_1', value: true },
                    { type: 'flag', flag: 'found_stone_2', value: true },
                    { type: 'flag', flag: 'found_stone_3', value: true }
                ],
                outcome: { type: 'goto', nodeId: 'barrier_broken' }
            }
        ]
    },
    {
        id: 'barrier_broken',
        title: 'The Barrier Shatters',
        description: 'You place the three Singing Stones in ancient grooves around the doorframe. They begin to resonate, their hum rising in pitch and harmony. The magical barrier flickers, then explodes in a shower of harmless sparks.\n\nThe door to the tower stands open.\n\nThe Elder whispers: *"Whatever lies within... it has been expecting visitors. Stay vigilant."*',
        flavor: { tone: 'triumphant', icon: 'magic' },
        onEnter: [
            { type: 'setFlag', flag: 'tower_unlocked', value: true }
        ],
        choices: [
            {
                id: 'enter_tower',
                text: 'Enter the tower',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'act_1_complete' }
            },
            {
                id: 'prepare',
                text: '← Prepare before entering',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'pre_tower_rest' }
            }
        ]
    },
    {
        id: 'pre_tower_rest',
        title: 'A Moment to Prepare',
        description: 'You take a moment to rest and prepare yourself before entering the tower. Your wounds heal, and your resolve strengthens.',
        flavor: { tone: 'calm', icon: 'magic' },
        onEnter: [
            { type: 'heal', amount: 'full' }
        ],
        choices: [
            {
                id: 'enter_tower',
                text: 'Enter the tower',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'act_1_complete' }
            }
        ]
    },
    {
        id: 'act_1_complete',
        title: 'Entering the Tower',
        description: 'You step through the doorway into darkness. The air inside is cold and still, heavy with the weight of centuries. As your eyes adjust, you see a grand foyer stretching before you, thick with dust and decay.\n\nThe Elder whispers: *"This is where my tale ends... and yours truly begins. Sorath awaits in the depths below."*',
        locationId: 'old-watchtower',
        flavor: { tone: 'mysterious', icon: 'exclamation' },
        onEnter: [
            { type: 'giveGold', amount: 200 }
        ],
        choices: [
            {
                id: 'enter_foyer',
                text: 'Enter the foyer',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'tower_foyer' }
            }
        ]
    }
];

// =============================================================================
// ACT 2 NODES: THE UPPER LEVELS
// =============================================================================
const act2Nodes: StoryNode[] = [
    {
        id: 'tower_foyer',
        title: 'The Foyer of Dust',
        description: 'The foyer is grand but decayed. Tapestries rot on the walls, their once-vibrant colors faded to dull browns and grays. Dust motes drift through shafts of emerald light filtering from above.\n\nA wide hallway extends deeper into the tower. Statues of ancient warriors line the corridor, their stone faces frozen in eternal vigilance.',
        locationId: 'old-watchtower',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'search' },
        companionHint: 'The Elder warns: "Undead servants patrol these halls. The lich\'s magic animates the dead to protect his sanctuary."',
        choices: [
            {
                id: 'explore_foyer',
                text: '🔍 Search the foyer',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'foyer_search' }
            },
            {
                id: 'proceed_hallway',
                text: 'Proceed down the hallway',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'statue_hallway' }
            }
        ]
    },
    {
        id: 'foyer_search',
        title: 'Searching the Foyer',
        description: 'You search through the debris and find some old coins scattered among the dust. Nothing else of value remains here.',
        flavor: { tone: 'calm', icon: 'search' },
        onEnter: [
            { type: 'giveGold', amount: 30 }
        ],
        choices: [
            {
                id: 'back',
                text: '← Back',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'tower_foyer' }
            }
        ]
    },
    {
        id: 'statue_hallway',
        title: 'The Hall of Statues',
        description: 'You step into the long hallway lined with stone statues. Each statue depicts a warrior in full plate armor, weapons raised. Their eyes seem to follow your movement.\n\nThe floor is covered in a thick layer of dust. Your footsteps echo loudly in the silence.',
        locationId: 'old-watchtower',
        type: 'explore',
        flavor: { tone: 'tense', icon: 'warning' },
        companionHint: 'The Elder cautions: "These statues... they\'re not ordinary stone. I sense magic within them. Move quietly."',
        choices: [
            {
                id: 'stealth_through',
                text: 'Move silently through the hall',
                displayText: 'Stealth DC 14: Move silently',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Stealth',
                    dc: 14,
                    success: { type: 'goto', nodeId: 'stealth_success' },
                    failure: { type: 'goto', nodeId: 'trap_triggered' }
                }
            },
            {
                id: 'walk_normally',
                text: 'Walk through normally',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'trap_triggered' }
            }
        ]
    },
    {
        id: 'stealth_success',
        title: 'Silent Passage',
        description: 'You move carefully, placing each foot deliberately and avoiding the loudest debris. The statues remain motionless as you pass safely through the hallway.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'continue',
                text: 'Continue to the laboratory',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'laboratory_entrance' }
            }
        ]
    },
    {
        id: 'trap_triggered',
        title: 'The Trap Springs!',
        description: 'Your footsteps echo through the hall. Suddenly, the statues\' eyes glow red! Poisoned darts shoot from their mouths, filling the air with deadly projectiles!\n\nYou throw yourself to the ground, but several darts graze you. The poison burns in your veins.',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'damage', amount: 6 }
        ],
        choices: [
            {
                id: 'continue',
                text: 'Continue, wounded',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'laboratory_entrance' }
            }
        ]
    },
    {
        id: 'laboratory_entrance',
        title: 'The Alchemist\'s Laboratory',
        description: 'You enter a vast chamber filled with alchemical equipment. Glass beakers and retorts line wooden shelves, most shattered or corroded. Strange stains mark the stone floor.\n\nIn the center of the room stands a large desk covered in ancient journals and scrolls. Skeletal figures shuffle among the equipment - animated dead, still carrying out their master\'s work.',
        locationId: 'old-watchtower',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'search' },
        choices: [
            {
                id: 'read_journals',
                text: '📜 Examine the journals',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'sorath_journals' }
            },
            {
                id: 'fight_skeletons',
                text: 'Engage the skeletons',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'skeleton_combat' }
            }
        ]
    },
    {
        id: 'sorath_journals',
        title: 'Sorath\'s Journals',
        description: 'You carefully open one of the journals. The handwriting starts neat and scholarly, but deteriorates into frantic scrawls:\n\n*"Day 187: The immortality ritual progresses. I have collected 47 souls..."*\n\n*"Day 302: The voices grow louder. They promise me eternal power if I complete the binding..."*\n\n*"Day ???: I am become death itself. This mortal shell is but a vessel. The final artifact eludes me still - the Elder\'s soul would complete the circle..."*\n\nYou realize with horror that The Elder artifact you carry is the final piece Sorath needs for his ritual!',
        flavor: { tone: 'mysterious', icon: 'search' },
        onEnter: [
            { type: 'setFlag', flag: 'read_sorath_journals', value: true }
        ],
        choices: [
            {
                id: 'fight_skeletons',
                text: 'The skeletons notice you!',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'skeleton_combat' }
            }
        ]
    },
    {
        id: 'skeleton_combat',
        title: 'Skeleton Guards',
        description: 'The skeletal guardians turn toward you, empty eye sockets glowing with necromantic energy. They raise their weapons and attack!',
        locationId: 'old-watchtower',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'skeleton', onVictoryNodeId: 'after_skeleton_combat' }
        ],
        choices: []
    },
    {
        id: 'after_skeleton_combat',
        title: 'Skeleton Defeated',
        description: 'The skeletons crumble to dust. You catch your breath and search the laboratory more thoroughly.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'search_lab',
                text: '🔍 Search the laboratory',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'find_magic_skeleton' }
            }
        ]
    },
    {
        id: 'find_magic_skeleton',
        title: 'The Lich\'s Apprentice',
        description: 'As you search, a door at the far end of the laboratory bursts open. A skeleton in tattered robes emerges, wielding a staff crackling with dark energy.\n\nThe Elder speaks: *"This was Sorath\'s apprentice. He still guards his master\'s secrets."*\n\nThe skeletal mage raises its staff and begins channeling a spell!',
        locationId: 'old-watchtower',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'skeleton-mage', onVictoryNodeId: 'after_mage_combat' }
        ],
        choices: []
    },
    {
        id: 'after_mage_combat',
        title: 'The Apprentice Falls',
        description: 'The skeletal mage collapses in a heap of bones and tattered cloth. Among the remains, you find a beautifully crafted sword that glows with holy light.\n\nThe Elder speaks: *"A blade blessed against the undead. You will need this in the depths below."*',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 75 },
            { type: 'giveItem', itemId: 'undead-bane-sword' },
            { type: 'setFlag', flag: 'defeated_apprentice', value: true }
        ],
        choices: [
            {
                id: 'descend',
                text: 'Descend to the catacombs',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'act_2_transition' }
            }
        ]
    },
    {
        id: 'act_2_transition',
        title: 'Into the Depths',
        description: 'Beyond the laboratory, you find a spiral staircase descending into darkness. The emerald light grows stronger here, pulsing like a heartbeat. The air grows colder with each step.\n\nYou descend into the catacombs beneath the tower.',
        flavor: { tone: 'mysterious', icon: 'exclamation' },
        choices: [
            {
                id: 'enter_catacombs',
                text: 'Enter the catacombs',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'catacombs_entrance' }
            }
        ]
    }
];

// =============================================================================
// ACT 3 NODES: THE MAZE
// =============================================================================
const act3Nodes: StoryNode[] = [
    {
        id: 'catacombs_entrance',
        title: 'The Underground Catacombs',
        description: 'You emerge into a vast network of tunnels carved from living rock. Alcoves line the walls, filled with ancient bones. The passages twist and turn in every direction, forming a labyrinth.\n\nThe emerald light pulses from deeper within, guiding you toward the heart of the corruption.',
        locationId: 'catacombs',
        type: 'explore',
        flavor: { tone: 'mysterious', icon: 'compass' },
        companionHint: 'The Elder warns: "These catacombs are a maze. Follow the light, but beware - wraiths and ghouls haunt these passages."',
        choices: [
            {
                id: 'follow_light',
                text: 'Follow the emerald light',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'maze_navigation_1' }
            },
            {
                id: 'search_catacombs',
                text: '🔍 Search the nearby alcoves',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'catacomb_search' }
            }
        ]
    },
    {
        id: 'catacomb_search',
        title: 'Ancient Remains',
        description: 'You search through the alcoves and find some old treasures buried with the dead: coins, a few gems, and a healing potion.',
        flavor: { tone: 'triumphant', icon: 'search' },
        onEnter: [
            { type: 'giveGold', amount: 50 },
            { type: 'giveItem', itemId: 'healing-potion' }
        ],
        choices: [
            {
                id: 'continue',
                text: '← Back',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'catacombs_entrance' }
            }
        ]
    },
    {
        id: 'maze_navigation_1',
        title: 'Twisting Passages',
        description: 'You navigate the twisting passages, following the pulsing light. The tunnels split in multiple directions. You must choose your path carefully.',
        locationId: 'catacombs',
        type: 'explore',
        flavor: { tone: 'tense', icon: 'compass' },
        choices: [
            {
                id: 'perception_check',
                text: 'Look for signs of passage',
                displayText: 'Perception DC 13: Find the correct path',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Perception',
                    dc: 13,
                    success: { type: 'goto', nodeId: 'correct_path' },
                    failure: { type: 'goto', nodeId: 'wraith_ambush' }
                }
            },
            {
                id: 'follow_instinct',
                text: 'Trust your instincts',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'wraith_ambush' }
            }
        ]
    },
    {
        id: 'wraith_ambush',
        title: 'Wraith Ambush!',
        description: 'As you move through the darkness, the temperature plummets. A spectral wraith materializes from the shadows, its ethereal form chilling the air. It reaches for you with ghostly claws!',
        locationId: 'catacombs',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'wraith', onVictoryNodeId: 'after_wraith_combat' }
        ],
        choices: []
    },
    {
        id: 'after_wraith_combat',
        title: 'Wraith Vanquished',
        description: 'The wraith dissolves into mist with an anguished wail. You find your way back to the main path.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'continue',
                text: 'Continue through the maze',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'correct_path' }
            }
        ]
    },
    {
        id: 'correct_path',
        title: 'The Correct Path',
        description: 'You navigate the maze successfully, avoiding dead ends and traps. The emerald light grows brighter as you approach the heart of the catacombs.',
        flavor: { tone: 'calm', icon: 'compass' },
        choices: [
            {
                id: 'continue',
                text: 'Continue deeper',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'ghoul_chamber' }
            }
        ]
    },
    {
        id: 'ghoul_chamber',
        title: 'The Feeding Chamber',
        description: 'You enter a large chamber strewn with bones and rotting flesh. Ghouls crouch in the shadows, their eyes glinting with hunger. They notice you and bare their fangs!',
        locationId: 'catacombs',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'ghoul', onVictoryNodeId: 'after_ghoul_combat' }
        ],
        choices: []
    },
    {
        id: 'after_ghoul_combat',
        title: 'Ghouls Defeated',
        description: 'The ghouls fall, their bodies dissolving into putrid slime. Beyond their chamber, you notice a section of wall that seems different from the others.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'examine_wall',
                text: '🔍 Examine the wall',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'secret_wall' }
            }
        ]
    },
    {
        id: 'secret_wall',
        title: 'Secret Wall',
        description: 'You examine the wall closely. It\'s constructed differently - newer mortar, slightly different stones. This is a hidden passage!',
        flavor: { tone: 'mysterious', icon: 'search' },
        choices: [
            {
                id: 'search_mechanism',
                text: 'Search for a mechanism',
                displayText: 'Perception DC 12: Find the trigger',
                category: 'skillCheck',
                outcome: {
                    type: 'check',
                    skill: 'Perception',
                    dc: 12,
                    success: { type: 'goto', nodeId: 'secret_chamber' },
                    failure: { type: 'goto', nodeId: 'search_failed' }
                }
            },
            {
                id: 'push_wall',
                text: 'Try to push the wall',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'secret_chamber' }
            }
        ]
    },
    {
        id: 'search_failed',
        title: 'No Mechanism Found',
        description: 'You search but can\'t find any mechanism. Perhaps brute force will work?',
        flavor: { tone: 'calm', icon: 'search' },
        choices: [
            {
                id: 'push_wall',
                text: 'Push the wall',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'secret_chamber' }
            }
        ]
    },
    {
        id: 'secret_chamber',
        title: 'The Secret Chamber',
        description: 'The wall grinds open, revealing a hidden chamber. On a stone pedestal in the center sits a crystalline shard radiating brilliant golden light - a stark contrast to the sickly emerald glow that permeates the rest of the tower.\n\nThe Elder speaks in awe: *"The Sun-Shard! A fragment of pure radiant energy. This is the key to defeating Sorath. His necromantic powers will wither before its holy light!"*',
        flavor: { tone: 'triumphant', icon: 'magic' },
        onEnter: [
            { type: 'giveItem', itemId: 'sun-shard' },
            { type: 'setFlag', flag: 'acquired_sun_shard', value: true }
        ],
        choices: [
            {
                id: 'take_shard',
                text: '✨ Take the Sun-Shard',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'shard_acquired' }
            }
        ]
    },
    {
        id: 'shard_acquired',
        title: 'Armed for Battle',
        description: 'You carefully lift the Sun-Shard. Its warmth spreads through you, bolstering your courage and healing your wounds. You are ready for the final confrontation.\n\nThe path ahead leads deeper still, to the very bottom of the tower - the Void Sanctum where Sorath performs his dark ritual.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'heal', amount: 'full' }
        ],
        choices: [
            {
                id: 'descend',
                text: 'Descend to the Void Sanctum',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'void_sanctum_entrance' }
            },
            {
                id: 'prepare',
                text: '← Prepare before the final battle',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'pre_boss_preparation' }
            }
        ]
    },
    {
        id: 'pre_boss_preparation',
        title: 'Final Preparations',
        description: 'You take a moment to prepare yourself for the final confrontation. You check your equipment, rest briefly, and steel your resolve.',
        flavor: { tone: 'calm', icon: 'exclamation' },
        onEnter: [
            { type: 'heal', amount: 'full' }
        ],
        choices: [
            {
                id: 'ready',
                text: 'I am ready',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'void_sanctum_entrance' }
            }
        ]
    }
];

// =============================================================================
// ACT 4 NODES: THE VOID SANCTUM & THE FALL
// =============================================================================
const act4Nodes: StoryNode[] = [
    {
        id: 'void_sanctum_entrance',
        title: 'The Void Sanctum',
        description: 'You descend the final staircase and emerge into an impossible space. A massive cavern stretches before you, but the floor is fragmented - floating islands of rock suspended over an infinite purple void. The emerald light is blinding here, emanating from a ritual circle in the center.\n\nFloating in the middle of the void, a figure in tattered robes hovers above the ritual circle. His skeletal face turns toward you, eye sockets burning with emerald fire.\n\n**Sorath the Lich** speaks, his voice like grinding bones:\n\n"At last, you arrive. And you bring me... the Elder\'s soul. How convenient."',
        locationId: 'void-sanctum',
        type: 'event',
        speakerName: 'Sorath the Lich',
        flavor: { tone: 'danger', icon: 'skull' },
        companionHint: 'The Elder speaks urgently: "He cannot be allowed to complete the ritual! But his phylactery - his soul vessel - must be destroyed or he will simply reform!"',
        choices: [
            {
                id: 'challenge',
                text: '"Your ritual ends here, Sorath!"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'sorath_response' }
            },
            {
                id: 'ask_phylactery',
                text: '"Where is your phylactery, lich?"',
                category: 'dialogue',
                outcome: { type: 'goto', nodeId: 'sorath_laughs' }
            }
        ]
    },
    {
        id: 'sorath_response',
        title: 'Sorath\'s Mockery',
        description: 'The lich laughs, a horrible rattling sound.\n\n"Bold words from one so mortal. You cannot stop what has been centuries in the making. I shall take the Elder artifact from your corpse and complete my ascension to true immortality!"\n\nSorath raises his bony hands and a shimmering shield envelops him. Skeletal warriors begin to rise from the void!',
        speakerName: 'Sorath the Lich',
        flavor: { tone: 'danger', icon: 'skull' },
        choices: [
            {
                id: 'fight',
                text: 'Fight the minions!',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'phase_1_minions' }
            }
        ]
    },
    {
        id: 'sorath_laughs',
        title: 'Sorath\'s Confidence',
        description: 'The lich laughs.\n\n"You think to destroy my phylactery? It is beyond your reach, mortal. I have had centuries to perfect its hiding place. Now, die!"\n\nSorath summons skeletal warriors to attack!',
        speakerName: 'Sorath the Lich',
        flavor: { tone: 'danger', icon: 'skull' },
        choices: [
            {
                id: 'fight',
                text: 'Fight!',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'phase_1_minions' }
            }
        ]
    },
    {
        id: 'phase_1_minions',
        title: 'Phase 1: The Minions',
        description: 'Waves of skeletal warriors rise from the void, attacking relentlessly. You must survive until Sorath\'s shield lowers!\n\nThe Elder shouts: *"Focus on survival! The shield will not last forever!"*',
        locationId: 'void-sanctum',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'skeleton', onVictoryNodeId: 'shield_lowered' }
        ],
        choices: []
    },
    {
        id: 'shield_lowered',
        title: 'The Shield Falls',
        description: 'The final skeleton crumbles to dust. Sorath\'s shield flickers and dies. The lich snarls in fury.\n\n"Impressive. But you have merely scratched the surface of my power. Witness true necromancy!"\n\nSorath begins channeling ice and necrotic magic, preparing to attack directly!',
        speakerName: 'Sorath the Lich',
        flavor: { tone: 'danger', icon: 'skull' },
        choices: [
            {
                id: 'fight_sorath',
                text: 'Engage Sorath!',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'phase_2_lich_battle' }
            }
        ]
    },
    {
        id: 'phase_2_lich_battle',
        title: 'Phase 2: The Lich',
        description: 'Sorath descends from his floating position, crackling with dark energy. Ice shards and necrotic bolts fly from his skeletal hands. The battle for your life begins!',
        locationId: 'void-sanctum',
        type: 'combat',
        flavor: { tone: 'danger', icon: 'skull' },
        onEnter: [
            { type: 'startCombat', enemyId: 'sorath-lich', onVictoryNodeId: 'sorath_defeated_temporary' }
        ],
        choices: []
    },
    {
        id: 'sorath_defeated_temporary',
        title: 'The Lich Falls... Or Does He?',
        description: 'Your blade strikes true, shattering Sorath\'s bones. The lich collapses to the ground, his robes settling in a pile of dust and fragments.\n\nBut then... the bones begin to rattle. The dust swirls. Within moments, Sorath\'s form begins to reconstruct itself!\n\n"Fool!" the lich\'s voice echoes. "I am bound to my phylactery! You cannot kill me unless you destroy it!"\n\nThe Elder cries out: *"The artifact! The Elder artifact that I am bound to - it IS his phylactery! He bound my soul to it when he killed me! You must destroy it to end him!"*',
        speakerName: 'Sorath the Lich',
        flavor: { tone: 'danger', icon: 'warning' },
        choices: [
            {
                id: 'use_sun_shard',
                text: '✨ Use the Sun-Shard to destroy the phylactery!',
                category: 'special',
                requirements: [
                    { type: 'flag', flag: 'acquired_sun_shard', value: true }
                ],
                outcome: { type: 'goto', nodeId: 'destroy_phylactery' }
            },
            {
                id: 'without_shard',
                text: 'Try to destroy it without the Sun-Shard',
                category: 'combat',
                outcome: { type: 'goto', nodeId: 'phylactery_too_strong' }
            }
        ]
    },
    {
        id: 'phylactery_too_strong',
        title: 'The Phylactery Resists',
        description: 'You strike at the Elder artifact with your weapon, but the phylactery is protected by powerful magic! Your blade bounces off harmlessly.\n\nSorath\'s reformation continues. You need the Sun-Shard\'s holy power to break through the protection!',
        flavor: { tone: 'danger', icon: 'warning' },
        choices: [
            {
                id: 'use_sun_shard',
                text: '✨ Use the Sun-Shard!',
                category: 'special',
                requirements: [
                    { type: 'flag', flag: 'acquired_sun_shard', value: true }
                ],
                outcome: { type: 'goto', nodeId: 'destroy_phylactery' }
            }
        ]
    },
    {
        id: 'destroy_phylactery',
        title: 'The Final Strike',
        description: 'You raise the Sun-Shard high. Its golden light blazes brilliantly, cutting through the emerald glow like a beacon of hope. You bring it down upon the Elder artifact.\n\nThe phylactery shatters with a sound like thunder. The Elder\'s voice rings out one final time: *"Thank you... for freeing me... at last..."*\n\nSorath\'s reforming body freezes mid-reconstruction. The lich screams in denial and rage as his essence begins to unravel.\n\n"NO! IMPOSSIBLE! I WAS TO BE IMMORTAL!"\n\nThe lich\'s form explodes into dust. The emerald light dies. Silence falls over the Void Sanctum.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'setFlag', flag: 'defeated_sorath', value: true },
            { type: 'setFlag', flag: 'freed_elder', value: true }
        ],
        choices: [
            {
                id: 'victory',
                text: 'It is done',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'epilogue_start' }
            }
        ]
    }
];

// =============================================================================
// EPILOGUE NODES: THE DAWN
// =============================================================================
const epilogueNodes: StoryNode[] = [
    {
        id: 'epilogue_start',
        title: 'The Dawn Breaks',
        description: 'As Sorath\'s essence dissipates, the Void Sanctum begins to crumble. The floating islands of rock settle gently to solid ground. The purple void recedes, replaced by normal stone.\n\nYou make your way back up through the tower. The undead creatures have all collapsed into dust. The corruption is gone. The tower feels... empty, but peaceful.',
        flavor: { tone: 'calm', icon: 'magic' },
        choices: [
            {
                id: 'continue',
                text: 'Return to the surface',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'tower_cleansed' }
            }
        ]
    },
    {
        id: 'tower_cleansed',
        title: 'The Tower Cleansed',
        description: 'You emerge into the courtyard. The sun is rising, painting the sky in brilliant oranges and golds. The tower no longer glows with emerald light. The thrumming hum has ceased.\n\nThe Blackwood Forest around you is silent, but it\'s a natural silence now - not the oppressive quiet of corruption. Birds begin to sing.',
        locationId: 'old-watchtower',
        flavor: { tone: 'triumphant', icon: 'victory' },
        choices: [
            {
                id: 'search_tower',
                text: '🔍 Return to search the tower',
                category: 'exploration',
                outcome: { type: 'goto', nodeId: 'sorath_treasury' }
            }
        ]
    },
    {
        id: 'sorath_treasury',
        title: 'Sorath\'s Treasury',
        description: 'You return to the laboratory and find a hidden vault behind a bookshelf. Inside:\n\n- A massive hoard of **500 gold pieces**\n- **Sorath\'s Grimoire**: An ancient tome of necromantic knowledge (valuable to collectors or wizard scholars)\n- Various other treasures and artifacts collected over centuries\n\nThe tower itself stands cleansed. It could serve as a base of operations, a sanctuary, or even be reconsecrated as a proper watchtower once more.',
        flavor: { tone: 'triumphant', icon: 'victory' },
        onEnter: [
            { type: 'giveGold', amount: 500 },
            { type: 'giveItem', itemId: 'sorath-grimoire' }
        ],
        choices: [
            {
                id: 'claim_tower',
                text: '👑 Claim the tower as your own',
                category: 'special',
                outcome: { type: 'goto', nodeId: 'epilogue_ending' }
            },
            {
                id: 'leave_tower',
                text: 'Leave the tower behind',
                category: 'movement',
                outcome: { type: 'goto', nodeId: 'epilogue_ending' }
            }
        ]
    },
    {
        id: 'epilogue_ending',
        title: 'The End of the Beginning',
        description: '**Campaign Complete!**\n\nYou have defeated Sorath the Lich and ended his centuries-long quest for immortality. The Elder\'s soul has been freed from its prison. The tower stands cleansed, and the corruption spreading through the Blackwood Forest has been purged.\n\n**Your Achievements:**\n- Survived the burning of Ashford and tracked down the bandits\n- Freed The Elder and uncovered Sorath\'s conspiracy\n- Navigated the tower\'s deadly traps and guardians\n- Claimed the Sun-Shard from the hidden chamber\n- Defeated Sorath and destroyed his phylactery\n- Cleansed the Tower and the Blackwood Forest\n\n**Rewards Claimed:**\n- Sorath\'s treasury of gold and artifacts\n- The Old Watchtower (optional base)\n- Sorath\'s Grimoire\n- Experience and glory\n\nYour legend will be sung in taverns for generations. The people of Ashford and Oakhaven owe you a debt that can never be repaid.\n\nBut this is not the end of your adventures...\n\n**The End**',
        flavor: { tone: 'triumphant', icon: 'crown' },
        choices: [
            {
                id: 'finish',
                text: '👑 Finish Campaign',
                category: 'special',
                outcome: { type: 'exit' }
            }
        ]
    }
];

// Death node for the campaign
const deathNode: StoryNode = {
    id: 'campaign_death',
    title: 'Death',
    description: 'Your wounds proved too severe. Darkness closes in as consciousness fades...\n\nYour adventure ends here, but the story of the Lich King continues.',
    flavor: { tone: 'danger', icon: 'skull' },
    choices: [
        {
            id: 'restart',
            text: '↻ Return to last safe point',
            category: 'special',
            outcome: { type: 'goto', nodeId: 'oakhaven_entrance' }
        },
        {
            id: 'exit',
            text: '🚪 Exit Campaign',
            category: 'movement',
            outcome: { type: 'exit' }
        }
    ]
};

const act0: Act = {
    id: 'act-0-first-blood',
    title: 'Act 0: First Blood',
    description: 'Tutorial prologue in Ashford village and the Blackwood Forest. Learn the basics while uncovering a sinister conspiracy.',
    locationId: 'ashford',
    startingNodeId: 'ashford_gates',
    deathNodeId: 'campaign_death',
    nodes: act0Nodes,
};

const act1: Act = {
    id: 'act-1-the-hook',
    title: 'Act 1: The Hook & The Approach',
    description: 'Investigate the mysterious Old Watchtower and uncover the dark magic emanating from within.',
    locationId: 'oakhaven',
    startingNodeId: 'oakhaven_entrance',
    deathNodeId: 'campaign_death',
    nodes: [...act0Nodes, ...act1Nodes, deathNode],
};

const act2: Act = {
    id: 'act-2-upper-levels',
    title: 'Act 2: The Upper Levels',
    description: 'Navigate the decayed halls of the tower, battle undead guardians, and discover Sorath\'s dark secrets in his laboratory.',
    locationId: 'old-watchtower',
    startingNodeId: 'tower_foyer',
    deathNodeId: 'campaign_death',
    nodes: [...act0Nodes, ...act1Nodes, ...act2Nodes, deathNode],
};

const act3: Act = {
    id: 'act-3-the-maze',
    title: 'Act 3: The Maze',
    description: 'Descend into the catacombs beneath the tower. Navigate the labyrinth, battle wraiths and ghouls, and claim the Sun-Shard.',
    locationId: 'catacombs',
    startingNodeId: 'catacombs_entrance',
    deathNodeId: 'campaign_death',
    nodes: [...act0Nodes, ...act1Nodes, ...act2Nodes, ...act3Nodes, deathNode],
};

const act4: Act = {
    id: 'act-4-void-sanctum',
    title: 'Act 4: The Void Sanctum',
    description: 'Face Sorath the Lich in an epic final battle. Destroy his phylactery and end his quest for immortality.',
    locationId: 'void-sanctum',
    startingNodeId: 'void_sanctum_entrance',
    deathNodeId: 'campaign_death',
    nodes: [...act0Nodes, ...act1Nodes, ...act2Nodes, ...act3Nodes, ...act4Nodes, ...epilogueNodes, deathNode],
};

export const spireOfLichKingCampaign: Campaign = {
    id: 'spire-of-lich-king',
    title: 'The Spire of the Lich King',
    description: 'A dark ritual threatens the land. Journey from a burning village to a tower of necromantic power, uncovering a conspiracy that spans from common bandits to an ancient lich. Navigate deadly traps, battle undead horrors, and face Sorath in an epic showdown.',
    companionName: 'The Elder',
    companionDescription: 'A magical artifact containing the wisdom of a scholar who perished in the tower years ago. Provides guidance, lore, and cryptic warnings throughout your journey.',
    acts: [act0, act1, act2, act3, act4],

    // Phase 5: World & Exploration
    // Campaign locations in narrative order for grid menu
    locations: [
        LOCATIONS['crossroads'],         // Starting location - center of map
        LOCATIONS['ashford'],            // First location - burned village (southwest)
        LOCATIONS['blackwood-forest'],   // Forest with spreading corruption (northeast)
        LOCATIONS['oakhaven'],           // Larger settlement with merchant (west)
        LOCATIONS['old-watchtower'],     // Lich's tower dungeon (far northeast)
        LOCATIONS['catacombs'],          // Labyrinth beneath the tower
        LOCATIONS['void-sanctum'],       // Final boss chamber (deep beneath catacombs)
        LOCATIONS['character-reflection'], // Meta: level-up location
        LOCATIONS['victory-hall'],       // Meta: victory location
        LOCATIONS['shadowed-end'],       // Meta: death location
    ],
    startingLocationId: 'crossroads',
    initialUnlockedLocations: ['crossroads'],
};
