/**
 * Test Campaign - Exercises all narrative system features
 *
 * This minimal campaign validates the type system with:
 * - Simple narrative nodes with choices
 * - Dialogue nodes with speaker info
 * - Skill checks (Intimidate, Perception)
 * - Requirements (flags, items, class)
 * - Effects (setFlag, giveItem, startCombat)
 * - Companion hints
 * - Loop and exit outcomes
 */

import type { Campaign, Act, StoryNode } from '../../types';

const testNodes: StoryNode[] = [
  // === NODE 1: Opening scene ===
  {
    id: 'test-start',
    title: 'The Crossroads',
    description:
      'You stand at a crossroads. A weathered signpost points in three directions: north toward smoke rising from a village, east into a dark forest, and west toward distant mountains.',
    locationHint: 'The Crossroads - Where your journey begins',
    companionHint:
      'I sense something unusual about the smoke to the north. It may be worth investigating.',
    choices: [
      {
        id: 'choice-village',
        text: 'Head north toward the village',
        outcome: { type: 'goto', nodeId: 'test-village' },
      },
      {
        id: 'choice-forest',
        text: 'Enter the dark forest to the east',
        outcome: { type: 'goto', nodeId: 'test-forest' },
      },
      {
        id: 'choice-examine-signpost',
        text: 'Examine the signpost more closely',
        outcome: { type: 'loop' },
      },
      {
        id: 'choice-touch-signpost',
        text: 'Touch the signpost',
        outcome: { type: 'goto', nodeId: 'test-wraith' },
      },
    ],
  },

  // === NODE 2: Village with NPC dialogue ===
  {
    id: 'test-village',
    title: 'The Burning Village',
    description:
      'The village is in chaos. Buildings smolder, and villagers run about trying to save what they can. A guard blocks your path, looking exhausted and suspicious.',
    locationId: 'town-square', // Override: village scene
    speakerName: 'Village Guard',
    speakerPortrait: 'portraits/guard.png',
    onEnter: [{ type: 'setFlag', flag: 'visited_village', value: true }],
    choices: [
      {
        id: 'choice-ask-guard',
        text: '"What happened here?"',
        outcome: { type: 'goto', nodeId: 'test-guard-explains' },
      },
      {
        id: 'choice-intimidate-guard',
        text: '"Let me through. Now."',
        outcome: {
          type: 'check',
          skill: 'Intimidate',
          dc: 10,
          success: { type: 'goto', nodeId: 'test-guard-intimidated' },
          failure: { type: 'goto', nodeId: 'test-guard-refuses' },
        },
      },
      {
        id: 'choice-leave-village',
        text: 'Leave and return to the crossroads',
        outcome: { type: 'goto', nodeId: 'test-start' },
      },
    ],
  },

  // === NODE 3: Guard explains (simple dialogue) ===
  {
    id: 'test-guard-explains',
    speakerName: 'Village Guard',
    speakerPortrait: 'portraits/guard.png',
    description:
      '"Bandits," he spits. "Came in the night. Took everything of value and set fire to half the village. The mayor is offering a reward for anyone who can track them down."',
    onEnter: [{ type: 'setFlag', flag: 'knows_about_bandits', value: true }],
    companionHint:
      'Bandits rarely work alone. There may be a larger organization behind this.',
    choices: [
      {
        id: 'choice-accept-quest',
        text: '"I\'ll hunt them down."',
        outcome: { type: 'goto', nodeId: 'test-quest-accepted' },
      },
      {
        id: 'choice-ask-more',
        text: '"Where did they go?"',
        outcome: { type: 'goto', nodeId: 'test-guard-directions' },
      },
      {
        id: 'choice-decline-quest',
        text: '"Not my problem."',
        outcome: { type: 'exit' },
      },
    ],
  },

  // === NODE 4: Guard intimidated (skill check success) ===
  {
    id: 'test-guard-intimidated',
    speakerName: 'Village Guard',
    speakerPortrait: 'portraits/guard.png',
    description:
      'The guard pales and steps aside quickly. "O-of course. Go right ahead." He avoids meeting your eyes.',
    onEnter: [
      { type: 'setFlag', flag: 'intimidated_guard', value: true },
      { type: 'giveItem', itemId: 'village-pass' },
    ],
    choices: [
      {
        id: 'choice-enter-village',
        text: 'Enter the village',
        outcome: { type: 'goto', nodeId: 'test-village-interior' },
      },
    ],
  },

  // === NODE 5: Guard refuses (skill check failure) ===
  {
    id: 'test-guard-refuses',
    speakerName: 'Village Guard',
    speakerPortrait: 'portraits/guard.png',
    description:
      'The guard narrows his eyes. "I\'ve dealt with worse than you today. Try that again and you\'ll regret it."',
    flavor: { tone: 'tense', icon: 'warning' },
    choices: [
      {
        id: 'choice-back-down',
        text: 'Back down and ask politely',
        outcome: { type: 'goto', nodeId: 'test-village' },
      },
      {
        id: 'choice-leave-angry',
        text: 'Leave in frustration',
        outcome: { type: 'exit' },
      },
    ],
  },

  // === NODE 6: Guard gives directions ===
  {
    id: 'test-guard-directions',
    speakerName: 'Village Guard',
    speakerPortrait: 'portraits/guard.png',
    description:
      '"They fled east, into the Darkwood Forest. Saw them dragging a cart full of goods. Be careful - the forest is dangerous even without bandits."',
    onEnter: [{ type: 'setFlag', flag: 'knows_bandit_location', value: true }],
    choices: [
      {
        id: 'choice-head-to-forest',
        text: 'Head to the forest immediately',
        outcome: { type: 'goto', nodeId: 'test-forest' },
      },
      {
        id: 'choice-more-questions',
        text: 'Ask more questions',
        outcome: { type: 'goto', nodeId: 'test-guard-explains' },
      },
    ],
  },

  // === NODE 7: Quest accepted ===
  {
    id: 'test-quest-accepted',
    speakerName: 'Village Guard',
    speakerPortrait: 'portraits/guard.png',
    description:
      '"Thank you, stranger. The mayor has authorized me to give you this for supplies." He hands you a small pouch of coins.',
    onEnter: [
      { type: 'setFlag', flag: 'accepted_bandit_quest', value: true },
      { type: 'giveItem', itemId: 'gold-pouch' },
    ],
    choices: [
      {
        id: 'choice-ask-directions',
        text: '"Which way did they go?"',
        outcome: { type: 'goto', nodeId: 'test-guard-directions' },
      },
    ],
  },

  // === NODE 8: Forest with perception check ===
  {
    id: 'test-forest',
    title: 'The Darkwood Forest',
    description:
      'The forest is unnaturally quiet. Twisted trees block out most of the sunlight, and the air feels heavy. You notice disturbed undergrowth - someone passed through here recently.',
    locationHint: 'Darkwood Forest - A place of shadows',
    type: 'explore',
    flavor: { tone: 'mysterious', icon: 'compass' },
    companionHint: 'There are tracks here. A skilled eye might be able to read them.',
    choices: [
      {
        id: 'choice-perception-tracks',
        text: 'Study the tracks carefully',
        outcome: {
          type: 'check',
          skill: 'Perception',
          dc: 12,
          success: { type: 'goto', nodeId: 'test-tracks-found' },
          failure: { type: 'goto', nodeId: 'test-tracks-lost' },
        },
      },
      {
        id: 'choice-follow-path',
        text: 'Follow the main path deeper into the forest',
        outcome: { type: 'goto', nodeId: 'test-forest-deep' },
      },
      {
        id: 'choice-return-crossroads',
        text: 'Return to the crossroads',
        outcome: { type: 'goto', nodeId: 'test-start' },
      },
      // Class-specific choice
      {
        id: 'choice-rogue-stealth',
        text: '[Rogue Only] Use your expertise to move silently',
        requirements: [{ type: 'class', class: 'Rogue' }],
        outcome: { type: 'goto', nodeId: 'test-stealth-approach' },
      },
    ],
  },

  // === NODE 9: Tracks found (perception success) ===
  {
    id: 'test-tracks-found',
    description:
      'You spot multiple sets of bootprints heading northeast, along with deep ruts from a heavy cart. Fresh horse droppings suggest the bandits passed through less than an hour ago.',
    onEnter: [{ type: 'setFlag', flag: 'found_bandit_tracks', value: true }],
    choices: [
      {
        id: 'choice-follow-tracks',
        text: 'Follow the tracks',
        outcome: { type: 'goto', nodeId: 'test-bandit-camp' },
      },
    ],
  },

  // === NODE 10: Tracks lost (perception failure) ===
  {
    id: 'test-tracks-lost',
    description:
      'The tracks are too muddled to follow with confidence. The bandits could have gone in any direction.',
    choices: [
      {
        id: 'choice-try-again',
        text: 'Try searching again',
        outcome: { type: 'goto', nodeId: 'test-forest' },
      },
      {
        id: 'choice-guess-direction',
        text: 'Pick a direction and hope for the best',
        outcome: { type: 'goto', nodeId: 'test-forest-deep' },
      },
    ],
  },

  // === NODE 11: Bandit camp (decision point) ===
  {
    id: 'test-bandit-camp',
    title: 'The Bandit Camp',
    description:
      'You find a crude camp in a forest clearing. A skeletal warrior sits motionless by a dying fire, its empty eye sockets glowing faintly with unholy light.',
    locationId: 'bandit-camp', // Override: specific camp scene
    companionHint: 'That creature is undead. Be careful - they feel no pain and know no fear.',
    choices: [
      {
        id: 'choice-attack-skeleton',
        text: 'Attack the skeleton',
        outcome: { type: 'goto', nodeId: 'test-bandit-camp-fight' },
      },
      {
        id: 'choice-sneak-away',
        text: 'Quietly back away',
        outcome: { type: 'goto', nodeId: 'test-forest' },
      },
      {
        id: 'choice-search-camp',
        text: 'Search the camp while avoiding the skeleton',
        outcome: { type: 'goto', nodeId: 'test-camp-search' },
      },
    ],
  },

  // === NODE 11b: Actually trigger combat ===
  {
    id: 'test-bandit-camp-fight',
    description:
      'You charge forward! The skeleton\'s eyes flare bright as it rises to meet your attack.',
    locationId: 'bandit-camp',
    type: 'combat',
    flavor: { tone: 'danger', icon: 'skull' },
    onEnter: [
      {
        type: 'startCombat',
        enemyId: 'skeleton',
        onVictoryNodeId: 'test-victory',
      },
    ],
    choices: [], // Combat starts immediately
  },

  // === NODE 11c: Search camp without fighting ===
  {
    id: 'test-camp-search',
    description:
      'You carefully search the camp while keeping your distance from the undead guardian. You find nothing of value - the bandits must have taken everything with them.',
    locationId: 'bandit-camp',
    choices: [
      {
        id: 'choice-fight-anyway',
        text: 'Attack the skeleton',
        outcome: { type: 'goto', nodeId: 'test-bandit-camp-fight' },
      },
      {
        id: 'choice-leave-camp',
        text: 'Leave the camp',
        outcome: { type: 'goto', nodeId: 'test-forest' },
      },
    ],
  },

  // === NODE 12: Victory after combat ===
  {
    id: 'test-victory',
    title: 'Victory!',
    description:
      'The skeleton crumbles to dust. Searching the camp, you find the stolen goods from the village, along with a mysterious letter bearing an unfamiliar seal.',
    type: 'event',
    flavor: { tone: 'triumphant', icon: 'victory' },
    onEnter: [
      { type: 'setFlag', flag: 'defeated_bandit', value: true },
      { type: 'giveItem', itemId: 'mysterious-letter' },
      { type: 'heal', amount: 'full' },
    ],
    choices: [
      {
        id: 'choice-return-village',
        text: 'Return to the village with the goods',
        outcome: { type: 'goto', nodeId: 'test-end' },
      },
    ],
  },

  // === NODE 13: Test end ===
  {
    id: 'test-end',
    title: 'Quest Complete',
    description:
      'You return to the village as a hero. The mayor rewards you generously, and the villagers cheer your name. But the mysterious letter hints at a larger conspiracy...',
    locationId: 'rusty-tavern', // Override: celebration scene
    onEnter: [
      { type: 'setFlag', flag: 'completed_test_campaign', value: true },
      { type: 'giveItem', itemId: 'hero-medal' },
    ],
    choices: [
      {
        id: 'choice-end-game',
        text: 'End the adventure',
        outcome: { type: 'exit' },
      },
    ],
  },

  // === Additional nodes for completeness ===
  {
    id: 'test-village-interior',
    description:
      'The village interior is chaotic but people are beginning to rebuild. You notice the mayor\'s house is relatively untouched.',
    choices: [
      {
        id: 'choice-visit-mayor',
        text: 'Visit the mayor',
        requirements: [{ type: 'flag', flag: 'intimidated_guard', value: true }],
        outcome: { type: 'goto', nodeId: 'test-quest-accepted' },
      },
      {
        id: 'choice-leave-interior',
        text: 'Leave',
        outcome: { type: 'exit' },
      },
    ],
  },

  {
    id: 'test-forest-deep',
    description:
      'You wander deeper into the forest. The path becomes increasingly overgrown and difficult to follow.',
    choices: [
      {
        id: 'choice-continue-wandering',
        text: 'Continue wandering',
        outcome: { type: 'goto', nodeId: 'test-forest' },
      },
      {
        id: 'choice-return',
        text: 'Return to the forest entrance',
        outcome: { type: 'goto', nodeId: 'test-forest' },
      },
    ],
  },

  {
    id: 'test-stealth-approach',
    description:
      'Moving silently through the shadows, you find an unguarded approach to what appears to be a bandit camp.',
    choices: [
      {
        id: 'choice-ambush',
        text: 'Launch a surprise attack',
        outcome: { type: 'goto', nodeId: 'test-bandit-camp' },
      },
    ],
  },

  // === Death node for permadeath ===
  {
    id: 'test-death',
    title: 'A Hero Falls',
    description:
      'Your vision fades as you collapse. The forest claims another victim, and your story ends here in the darkness of the Darkwood.',
    choices: [],
  },

  // === NODE TEST: Wraith fight ===
  {
    id: 'test-wraith',
    title: 'Fight a Wraith',
    description:
        'You touch the rune on the signpost. A flash and then... a wraith appears',
    onEnter: [
      {
        type: 'startCombat',
        enemyId: 'wraith',
        onVictoryNodeId: 'test-start',
      },
    ],
    choices: [], // No choices - combat starts immediately
  },
];

const testAct: Act = {
  id: 'test-act-1',
  title: 'Test Act: The Crossroads',
  description: 'A test adventure to validate the narrative system.',
  locationId: 'crossroads', // Default: starts at the crossroads
  startingNodeId: 'test-start',
  deathNodeId: 'test-death',
  nodes: testNodes,
};

export const testCampaign: Campaign = {
  id: 'test-campaign',
  title: 'Test Campaign',
  description: 'A minimal campaign for testing the narrative system.',
  companionName: 'The Guide',
  companionDescription: 'A mysterious voice that offers helpful hints.',
  acts: [testAct],
};
