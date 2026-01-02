import { describe, it, expect } from 'vitest';
import {
  checkRequirement,
  checkAllRequirements,
  getAvailableChoices,
  resolveSkillCheck,
  resolveOutcome,
  processNodeEffects,
  getChoiceDisplayText,
  choiceHasSkillCheck,
  formatSkillCheckResult,
  inferNodeType,
  getNodeType,
} from '../../utils/narrativeLogic';
import type { Character } from '../../types';
import type {
  Requirement,
  Choice,
  ChoiceOutcome,
  NodeEffect,
  WorldState,
  StoryNode,
} from '../../types';

// Helper to create a test character
const createTestCharacter = (
  className: Character['class'] = 'Fighter',
  overrides: Partial<Character> = {}
): Character => ({
  name: 'Test Hero',
  avatarPath: 'human_female_00009.png',
  class: className,
  level: 1,
  attributes: { STR: 14, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 12 },
  hp: 12,
  maxHp: 12,
  ac: 16,
  bab: 1,
  saves: { fortitude: 2, reflex: 0, will: 0 },
  skills: {
    Athletics: 1,
    Stealth: 0,
    Perception: 1,
    Arcana: 0,
    Medicine: 0,
    Intimidate: 2,
  },
  feats: [],
  equipment: {
    weapon: {
      name: 'Longsword',
      damage: '1d8',
      damageType: 'slashing',
      description: '',
      finesse: false
    },
    weapons: [{
      name: 'Longsword',
      damage: '1d8',
      damageType: 'slashing',
      description: '',
      finesse: false
    }],
    armor: { name: 'chainmail', baseAC: 16, maxDexBonus: 2, description: '' },
    shield: { equipped: false, acBonus: 0 },
    items: [],
  },
  resources: { abilities: [] },
  ...overrides,
});

// Helper to create a test world state
const createTestWorldState = (
  overrides: Partial<WorldState> = {}
): WorldState => ({
  campaignId: 'test-campaign',
  currentActId: 'test-act-1',
  currentNodeId: 'test-start',
  flags: {},
  visitedNodeIds: ['test-start'],
  inventory: [],
  currentLocationId: null,
  unlockedLocations: [],
  visitedLocations: [],
  unlockedSanctuaries: [],
  ...overrides,
});

describe('utils/narrativeLogic', () => {
  describe('checkRequirement', () => {
    const player = createTestCharacter();
    const world = createTestWorldState();

    it('checks flag requirement correctly', () => {
      const worldWithFlag = createTestWorldState({
        flags: { quest_accepted: true },
      });

      const reqTrue: Requirement = {
        type: 'flag',
        flag: 'quest_accepted',
        value: true,
      };
      const reqFalse: Requirement = {
        type: 'flag',
        flag: 'quest_accepted',
        value: false,
      };

      expect(checkRequirement(reqTrue, worldWithFlag, player)).toBe(true);
      expect(checkRequirement(reqFalse, worldWithFlag, player)).toBe(false);
      expect(checkRequirement(reqTrue, world, player)).toBe(false);
    });

    it('checks item requirement correctly', () => {
      const worldWithItem = createTestWorldState({
        inventory: ['magic-key', 'gold-pouch'],
      });

      const req: Requirement = { type: 'item', itemId: 'magic-key' };
      const reqMissing: Requirement = { type: 'item', itemId: 'dragon-scale' };

      expect(checkRequirement(req, worldWithItem, player)).toBe(true);
      expect(checkRequirement(reqMissing, worldWithItem, player)).toBe(false);
      expect(checkRequirement(req, world, player)).toBe(false);
    });

    it('checks attribute requirement correctly', () => {
      const reqStrPass: Requirement = { type: 'attribute', attr: 'STR', min: 14 };
      const reqStrFail: Requirement = { type: 'attribute', attr: 'STR', min: 16 };
      const reqIntFail: Requirement = { type: 'attribute', attr: 'INT', min: 12 };

      expect(checkRequirement(reqStrPass, world, player)).toBe(true);
      expect(checkRequirement(reqStrFail, world, player)).toBe(false);
      expect(checkRequirement(reqIntFail, world, player)).toBe(false);
    });

    it('checks skill requirement correctly', () => {
      const reqIntimidatePass: Requirement = {
        type: 'skill',
        skill: 'Intimidate',
        minRanks: 2,
      };
      const reqIntimidateFail: Requirement = {
        type: 'skill',
        skill: 'Intimidate',
        minRanks: 3,
      };
      const reqArcanaFail: Requirement = {
        type: 'skill',
        skill: 'Arcana',
        minRanks: 1,
      };

      expect(checkRequirement(reqIntimidatePass, world, player)).toBe(true);
      expect(checkRequirement(reqIntimidateFail, world, player)).toBe(false);
      expect(checkRequirement(reqArcanaFail, world, player)).toBe(false);
    });

    it('checks class requirement correctly', () => {
      const reqFighter: Requirement = { type: 'class', class: 'Fighter' };
      const reqRogue: Requirement = { type: 'class', class: 'Rogue' };

      expect(checkRequirement(reqFighter, world, player)).toBe(true);
      expect(checkRequirement(reqRogue, world, player)).toBe(false);

      const roguePlayer = createTestCharacter('Rogue');
      expect(checkRequirement(reqRogue, world, roguePlayer)).toBe(true);
    });

    it('checks nodeVisited requirement correctly', () => {
      const worldWithVisits = createTestWorldState({
        visitedNodeIds: ['test-start', 'test-village'],
      });

      const reqVisited: Requirement = {
        type: 'nodeVisited',
        nodeId: 'test-village',
      };
      const reqNotVisited: Requirement = {
        type: 'nodeVisited',
        nodeId: 'test-forest',
      };

      expect(checkRequirement(reqVisited, worldWithVisits, player)).toBe(true);
      expect(checkRequirement(reqNotVisited, worldWithVisits, player)).toBe(false);
    });

    it('previousChoice requirement always returns true (handled by store)', () => {
      const req: Requirement = {
        type: 'previousChoice',
        choiceId: 'some-choice',
      };
      expect(checkRequirement(req, world, player)).toBe(true);
    });
  });

  describe('checkAllRequirements', () => {
    it('returns true when all requirements are met', () => {
      const player = createTestCharacter('Fighter');
      const world = createTestWorldState({
        flags: { quest_started: true },
        inventory: ['key'],
      });

      const requirements: Requirement[] = [
        { type: 'flag', flag: 'quest_started', value: true },
        { type: 'item', itemId: 'key' },
        { type: 'class', class: 'Fighter' },
      ];

      expect(checkAllRequirements(requirements, world, player)).toBe(true);
    });

    it('returns false when any requirement fails', () => {
      const player = createTestCharacter('Fighter');
      const world = createTestWorldState({
        flags: { quest_started: true },
      });

      const requirements: Requirement[] = [
        { type: 'flag', flag: 'quest_started', value: true },
        { type: 'item', itemId: 'missing-key' }, // This fails
      ];

      expect(checkAllRequirements(requirements, world, player)).toBe(false);
    });

    it('returns true for empty requirements array', () => {
      const player = createTestCharacter();
      const world = createTestWorldState();

      expect(checkAllRequirements([], world, player)).toBe(true);
    });
  });

  describe('getAvailableChoices', () => {
    const player = createTestCharacter('Fighter');
    const world = createTestWorldState({
      flags: { knows_secret: true },
    });

    const choices: Choice[] = [
      {
        id: 'choice-1',
        text: 'Always available',
        outcome: { type: 'goto', nodeId: 'next' },
      },
      {
        id: 'choice-2',
        text: 'Requires flag',
        requirements: [{ type: 'flag', flag: 'knows_secret', value: true }],
        outcome: { type: 'goto', nodeId: 'secret' },
      },
      {
        id: 'choice-3',
        text: 'Requires missing flag',
        requirements: [{ type: 'flag', flag: 'missing_flag', value: true }],
        outcome: { type: 'goto', nodeId: 'hidden' },
      },
      {
        id: 'choice-4',
        text: 'Rogue only',
        requirements: [{ type: 'class', class: 'Rogue' }],
        outcome: { type: 'goto', nodeId: 'rogue-path' },
      },
    ];

    it('filters out choices with unmet requirements', () => {
      const available = getAvailableChoices(choices, world, player);

      expect(available).toHaveLength(2);
      expect(available.map((c) => c.id)).toEqual(['choice-1', 'choice-2']);
    });

    it('includes class-specific choices for matching class', () => {
      const roguePlayer = createTestCharacter('Rogue');
      const available = getAvailableChoices(choices, world, roguePlayer);

      expect(available.map((c) => c.id)).toContain('choice-4');
    });

    it('handles previousChoice requirements with visitedChoiceIds', () => {
      const choicesWithPrevious: Choice[] = [
        {
          id: 'choice-follow-up',
          text: 'Follow-up question',
          requirements: [{ type: 'previousChoice', choiceId: 'choice-ask' }],
          outcome: { type: 'goto', nodeId: 'follow-up' },
        },
      ];

      // Without the previous choice
      const withoutPrevious = getAvailableChoices(
        choicesWithPrevious,
        world,
        player,
        []
      );
      expect(withoutPrevious).toHaveLength(0);

      // With the previous choice
      const withPrevious = getAvailableChoices(
        choicesWithPrevious,
        world,
        player,
        ['choice-ask']
      );
      expect(withPrevious).toHaveLength(1);
    });
  });

  describe('resolveSkillCheck', () => {
    it('returns correct structure with success/failure', () => {
      const player = createTestCharacter('Fighter', {
        skills: {
          Athletics: 0,
          Stealth: 0,
          Perception: 0,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 4, // High intimidate
        },
      });

      // Run multiple times to test both outcomes
      for (let i = 0; i < 20; i++) {
        const result = resolveSkillCheck(player, 'Intimidate', 10);

        expect(result.skill).toBe('Intimidate');
        expect(result.dc).toBe(10);
        expect(result.roll).toBeGreaterThanOrEqual(1);
        expect(result.roll).toBeLessThanOrEqual(20);
        expect(result.modifier).toBeGreaterThanOrEqual(0);
        expect(result.total).toBe(result.roll + result.modifier);
        expect(result.success).toBe(result.total >= result.dc);
      }
    });

    it('uses correct skill modifier', () => {
      const player = createTestCharacter('Fighter', {
        attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 16 },
        skills: {
          Athletics: 0,
          Stealth: 0,
          Perception: 0,
          Arcana: 0,
          Medicine: 0,
          Intimidate: 4, // 4 ranks + class skill (+3) + CHA mod (+3) = 10
        },
      });

      const result = resolveSkillCheck(player, 'Intimidate', 15);

      // Fighter has Intimidate as a class skill
      // Total modifier should be: 4 (ranks) + 3 (class skill) + 3 (CHA 16) = 10
      expect(result.modifier).toBe(10);
    });
  });

  describe('resolveOutcome', () => {
    const player = createTestCharacter();

    it('handles goto outcome', () => {
      const outcome: ChoiceOutcome = { type: 'goto', nodeId: 'next-node' };
      const result = resolveOutcome(outcome, player, 'current-node');

      expect(result.nextNodeId).toBe('next-node');
      expect(result.logEntries).toHaveLength(0);
    });

    it('handles loop outcome', () => {
      const outcome: ChoiceOutcome = { type: 'loop' };
      const result = resolveOutcome(outcome, player, 'current-node');

      expect(result.nextNodeId).toBe('current-node');
    });

    it('handles exit outcome', () => {
      const outcome: ChoiceOutcome = { type: 'exit' };
      const result = resolveOutcome(outcome, player, 'current-node');

      expect(result.nextNodeId).toBeNull();
    });

    it('handles skill check outcome and creates log entry', () => {
      const outcome: ChoiceOutcome = {
        type: 'check',
        skill: 'Intimidate',
        dc: 10,
        success: { type: 'goto', nodeId: 'success-node' },
        failure: { type: 'goto', nodeId: 'failure-node' },
      };

      const result = resolveOutcome(outcome, player, 'current-node');

      // Should have created a skill check log entry
      expect(result.logEntries.length).toBeGreaterThanOrEqual(1);
      expect(result.logEntries[0].type).toBe('skillCheck');

      // Should route to success or failure node
      expect(['success-node', 'failure-node']).toContain(result.nextNodeId);
    });

    it('handles nested skill check outcomes', () => {
      const outcome: ChoiceOutcome = {
        type: 'check',
        skill: 'Perception',
        dc: 5, // Easy check
        success: {
          type: 'check',
          skill: 'Intimidate',
          dc: 5,
          success: { type: 'goto', nodeId: 'double-success' },
          failure: { type: 'goto', nodeId: 'second-fail' },
        },
        failure: { type: 'goto', nodeId: 'first-fail' },
      };

      // Run multiple times to test paths
      for (let i = 0; i < 10; i++) {
        const result = resolveOutcome(outcome, player, 'current-node');

        // Valid end nodes
        expect(['double-success', 'second-fail', 'first-fail']).toContain(
          result.nextNodeId
        );
      }
    });
  });

  describe('processNodeEffects', () => {
    it('processes setFlag effect', () => {
      const world = createTestWorldState();
      const effects: NodeEffect[] = [
        { type: 'setFlag', flag: 'visited_cave', value: true },
      ];

      const result = processNodeEffects(effects, world);

      expect(result.worldUpdates.flags).toEqual({ visited_cave: true });
    });

    it('processes giveItem effect', () => {
      const world = createTestWorldState({ inventory: ['existing-item'] });
      const effects: NodeEffect[] = [{ type: 'giveItem', itemId: 'new-sword' }];

      const result = processNodeEffects(effects, world);

      expect(result.worldUpdates.inventory).toContain('new-sword');
      expect(result.worldUpdates.inventory).toContain('existing-item');
      expect(result.logEntries).toContainEqual({
        type: 'effect',
        message: 'Received: new-sword',
      });
    });

    it('processes removeItem effect', () => {
      const world = createTestWorldState({ inventory: ['key', 'potion'] });
      const effects: NodeEffect[] = [{ type: 'removeItem', itemId: 'key' }];

      const result = processNodeEffects(effects, world);

      expect(result.worldUpdates.inventory).not.toContain('key');
      expect(result.worldUpdates.inventory).toContain('potion');
      expect(result.logEntries).toContainEqual({
        type: 'effect',
        message: 'Lost: key',
      });
    });

    it('processes startCombat effect', () => {
      const world = createTestWorldState();
      const effects: NodeEffect[] = [
        { type: 'startCombat', enemyId: 'skeleton', onVictoryNodeId: 'victory' },
      ];

      const result = processNodeEffects(effects, world);

      expect(result.combatTrigger).toEqual({
        enemyId: 'skeleton',
        onVictoryNodeId: 'victory',
      });
    });

    it('processes heal effect', () => {
      const world = createTestWorldState();
      const effects: NodeEffect[] = [{ type: 'heal', amount: 10 }];

      const result = processNodeEffects(effects, world);

      expect(result.logEntries).toContainEqual({
        type: 'effect',
        message: 'Healed 10 HP',
      });
    });

    it('processes full heal effect', () => {
      const world = createTestWorldState();
      const effects: NodeEffect[] = [{ type: 'heal', amount: 'full' }];

      const result = processNodeEffects(effects, world);

      expect(result.logEntries).toContainEqual({
        type: 'effect',
        message: 'Fully healed!',
      });
    });

    it('processes showCompanionHint effect', () => {
      const world = createTestWorldState();
      const effects: NodeEffect[] = [
        { type: 'showCompanionHint', hint: 'Look behind the waterfall.' },
      ];

      const result = processNodeEffects(effects, world);

      expect(result.logEntries).toContainEqual({
        type: 'companion',
        hint: 'Look behind the waterfall.',
      });
    });

    it('processes multiple effects in order', () => {
      const world = createTestWorldState();
      const effects: NodeEffect[] = [
        { type: 'setFlag', flag: 'entered_dungeon', value: true },
        { type: 'giveItem', itemId: 'torch' },
        { type: 'damage', amount: 5 },
      ];

      const result = processNodeEffects(effects, world);

      expect(result.worldUpdates.flags).toEqual({ entered_dungeon: true });
      expect(result.worldUpdates.inventory).toContain('torch');
      expect(result.logEntries).toHaveLength(2); // giveItem and damage
    });
  });

  describe('helper functions', () => {
    describe('getChoiceDisplayText', () => {
      it('returns displayText if provided', () => {
        const choice: Choice = {
          id: 'test',
          text: 'Regular text',
          displayText: '[Special] Custom display',
          outcome: { type: 'goto', nodeId: 'next' },
        };

        expect(getChoiceDisplayText(choice)).toBe('[Special] Custom display');
      });

      it('auto-generates display text for skill checks', () => {
        const choice: Choice = {
          id: 'test',
          text: 'Threaten the guard',
          outcome: {
            type: 'check',
            skill: 'Intimidate',
            dc: 12,
            success: { type: 'goto', nodeId: 'success' },
            failure: { type: 'goto', nodeId: 'fail' },
          },
        };

        expect(getChoiceDisplayText(choice)).toBe(
          '🎲 Intimidate DC 12 Threaten the guard'
        );
      });

      it('returns plain text for regular choices', () => {
        const choice: Choice = {
          id: 'test',
          text: 'Open the door',
          outcome: { type: 'goto', nodeId: 'next' },
        };

        expect(getChoiceDisplayText(choice)).toBe('Open the door');
      });
    });

    describe('choiceHasSkillCheck', () => {
      it('returns true for skill check choices', () => {
        const choice: Choice = {
          id: 'test',
          text: 'Test',
          outcome: {
            type: 'check',
            skill: 'Perception',
            dc: 10,
            success: { type: 'goto', nodeId: 's' },
            failure: { type: 'goto', nodeId: 'f' },
          },
        };

        expect(choiceHasSkillCheck(choice)).toBe(true);
      });

      it('returns false for regular choices', () => {
        const choice: Choice = {
          id: 'test',
          text: 'Test',
          outcome: { type: 'goto', nodeId: 'next' },
        };

        expect(choiceHasSkillCheck(choice)).toBe(false);
      });
    });

    describe('formatSkillCheckResult', () => {
      it('formats successful check correctly', () => {
        const result = formatSkillCheckResult({
          skill: 'Intimidate',
          roll: 15,
          modifier: 5,
          total: 20,
          dc: 15,
          success: true,
        });

        expect(result).toBe('Intimidate: 15+5 = 20 vs DC 15 - Success!');
      });

      it('formats failed check correctly', () => {
        const result = formatSkillCheckResult({
          skill: 'Perception',
          roll: 5,
          modifier: 2,
          total: 7,
          dc: 12,
          success: false,
        });

        expect(result).toBe('Perception: 5+2 = 7 vs DC 12 - Failed');
      });

      it('handles negative modifiers', () => {
        const result = formatSkillCheckResult({
          skill: 'Arcana',
          roll: 10,
          modifier: -1,
          total: 9,
          dc: 10,
          success: false,
        });

        expect(result).toBe('Arcana: 10-1 = 9 vs DC 10 - Failed');
      });
    });
  });
});

describe('Node type inference', () => {
  it('infers combat from startCombat effect', () => {
    const node: StoryNode = {
      id: 'fight',
      description: 'Battle!',
      onEnter: [{ type: 'startCombat', enemyId: 'goblin', onVictoryNodeId: 'win' }],
      choices: [],
    };
    expect(inferNodeType(node)).toBe('combat');
  });

  it('infers dialogue from speakerName', () => {
    const node: StoryNode = {
      id: 'talk',
      description: 'Conversation',
      speakerName: 'Guard',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('dialogue');
  });

  it('infers explore from title', () => {
    const node: StoryNode = {
      id: 'location',
      title: 'The Darkwood',
      description: 'A mysterious forest',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('explore');
  });

  it('infers explore from locationHint', () => {
    const node: StoryNode = {
      id: 'location',
      description: 'You arrive',
      locationHint: 'The tavern is warm and noisy',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('explore');
  });

  it('defaults to event when no indicators present', () => {
    const node: StoryNode = {
      id: 'moment',
      description: 'Something happens',
      choices: [],
    };
    expect(inferNodeType(node)).toBe('event');
  });

  it('prioritizes combat over dialogue when both present', () => {
    const node: StoryNode = {
      id: 'ambush',
      description: 'The bandit attacks!',
      speakerName: 'Bandit',
      onEnter: [{ type: 'startCombat', enemyId: 'bandit', onVictoryNodeId: 'win' }],
      choices: [],
    };
    expect(inferNodeType(node)).toBe('combat');
  });
});

describe('getNodeType', () => {
  it('returns explicit type when provided', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'Test',
      speakerName: 'NPC',
      type: 'event', // Explicit override
      choices: [],
    };
    expect(getNodeType(node)).toBe('event');
  });

  it('infers type when not provided', () => {
    const node: StoryNode = {
      id: 'test',
      description: 'Test',
      speakerName: 'NPC',
      choices: [],
    };
    expect(getNodeType(node)).toBe('dialogue');
  });
});
