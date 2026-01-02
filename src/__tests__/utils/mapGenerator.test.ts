import { describe, it, expect } from 'vitest';
import { generateActMap, generateCampaignMap, getNodeTitle } from '../../utils/mapGenerator';
import type { Act, Campaign, StoryNode } from '../../types';

describe('mapGenerator', () => {
  describe('generateActMap', () => {
    it('should generate positions for a simple linear path', () => {
      const nodes: StoryNode[] = [
        {
          id: 'node1',
          title: 'Start',
          description: 'Beginning',
          choices: [
            {
              id: 'choice1',
              text: 'Go to node2',
              outcome: { type: 'goto', nodeId: 'node2' },
            },
          ],
        },
        {
          id: 'node2',
          title: 'Middle',
          description: 'Middle point',
          choices: [
            {
              id: 'choice2',
              text: 'Go to node3',
              outcome: { type: 'goto', nodeId: 'node3' },
            },
          ],
        },
        {
          id: 'node3',
          title: 'End',
          description: 'Final node',
          choices: [
            {
              id: 'choice3',
              text: 'Exit',
              outcome: { type: 'exit' },
            },
          ],
        },
      ];

      const act: Act = {
        id: 'test-act',
        title: 'Test Act',
        startingNodeId: 'node1',
        nodes,
      };

      const map = generateActMap(act);

      expect(map.actId).toBe('test-act');
      expect(map.actTitle).toBe('Test Act');
      expect(map.nodes).toHaveLength(3);
      expect(map.connections).toHaveLength(2);

      // Check connections
      expect(map.connections).toContainEqual({
        from: 'node1',
        to: 'node2',
        choiceText: 'Go to node2',
      });
      expect(map.connections).toContainEqual({
        from: 'node2',
        to: 'node3',
        choiceText: 'Go to node3',
      });

      // Verify positions exist for all nodes
      const nodeIds = map.nodes.map((n) => n.nodeId);
      expect(nodeIds).toContain('node1');
      expect(nodeIds).toContain('node2');
      expect(nodeIds).toContain('node3');

      // Verify positions have coordinates
      for (const pos of map.nodes) {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.actId).toBe('test-act');
      }
    });

    it('should handle branching paths', () => {
      const nodes: StoryNode[] = [
        {
          id: 'start',
          description: 'Start',
          choices: [
            {
              id: 'c1',
              text: 'Left',
              outcome: { type: 'goto', nodeId: 'left' },
            },
            {
              id: 'c2',
              text: 'Right',
              outcome: { type: 'goto', nodeId: 'right' },
            },
          ],
        },
        {
          id: 'left',
          description: 'Left path',
          choices: [],
        },
        {
          id: 'right',
          description: 'Right path',
          choices: [],
        },
      ];

      const act: Act = {
        id: 'branch-act',
        title: 'Branch Act',
        startingNodeId: 'start',
        nodes,
      };

      const map = generateActMap(act);

      expect(map.nodes).toHaveLength(3);
      expect(map.connections).toHaveLength(2);

      // Both branches should connect from start
      expect(map.connections).toContainEqual({
        from: 'start',
        to: 'left',
        choiceText: 'Left',
      });
      expect(map.connections).toContainEqual({
        from: 'start',
        to: 'right',
        choiceText: 'Right',
      });
    });

    it('should handle skill check outcomes', () => {
      const nodes: StoryNode[] = [
        {
          id: 'check',
          description: 'Skill check',
          choices: [
            {
              id: 'c1',
              text: 'Attempt',
              outcome: {
                type: 'check',
                skill: 'Perception',
                dc: 10,
                success: { type: 'goto', nodeId: 'success' },
                failure: { type: 'goto', nodeId: 'failure' },
              },
            },
          ],
        },
        {
          id: 'success',
          description: 'Success',
          choices: [],
        },
        {
          id: 'failure',
          description: 'Failure',
          choices: [],
        },
      ];

      const act: Act = {
        id: 'check-act',
        title: 'Check Act',
        startingNodeId: 'check',
        nodes,
      };

      const map = generateActMap(act);

      expect(map.connections).toHaveLength(2);
      expect(map.connections).toContainEqual({
        from: 'check',
        to: 'success',
        choiceText: 'Attempt (success)',
      });
      expect(map.connections).toContainEqual({
        from: 'check',
        to: 'failure',
        choiceText: 'Attempt (failure)',
      });
    });

    it('should handle combat victory connections', () => {
      const nodes: StoryNode[] = [
        {
          id: 'combat-start',
          description: 'Combat begins',
          choices: [],
          onEnter: [
            {
              type: 'startCombat',
              enemyId: 'goblin',
              onVictoryNodeId: 'victory',
            },
          ],
        },
        {
          id: 'victory',
          description: 'Victory',
          choices: [],
        },
      ];

      const act: Act = {
        id: 'combat-act',
        title: 'Combat Act',
        startingNodeId: 'combat-start',
        nodes,
      };

      const map = generateActMap(act);

      expect(map.connections).toContainEqual({
        from: 'combat-start',
        to: 'victory',
        choiceText: '(combat victory)',
      });
    });

    it('should handle loop and exit outcomes without creating connections', () => {
      const nodes: StoryNode[] = [
        {
          id: 'main',
          description: 'Main',
          choices: [
            {
              id: 'c1',
              text: 'Loop',
              outcome: { type: 'loop' },
            },
            {
              id: 'c2',
              text: 'Exit',
              outcome: { type: 'exit' },
            },
          ],
        },
      ];

      const act: Act = {
        id: 'loop-act',
        title: 'Loop Act',
        startingNodeId: 'main',
        nodes,
      };

      const map = generateActMap(act);

      expect(map.connections).toHaveLength(0);
    });
  });

  describe('generateCampaignMap', () => {
    it('should generate maps for all acts in a campaign', () => {
      const act1: Act = {
        id: 'act1',
        title: 'Act 1',
        startingNodeId: 'a1-start',
        nodes: [
          {
            id: 'a1-start',
            description: 'Act 1 start',
            choices: [
              {
                id: 'c1',
                text: 'Next',
                outcome: { type: 'goto', nodeId: 'a1-end' },
              },
            ],
          },
          {
            id: 'a1-end',
            description: 'Act 1 end',
            choices: [],
          },
        ],
      };

      const act2: Act = {
        id: 'act2',
        title: 'Act 2',
        startingNodeId: 'a2-start',
        nodes: [
          {
            id: 'a2-start',
            description: 'Act 2 start',
            choices: [],
          },
        ],
      };

      const campaign: Campaign = {
        id: 'test-campaign',
        title: 'Test Campaign',
        description: 'Test',
        companionName: 'Guide',
        companionDescription: 'Helper',
        acts: [act1, act2],
        locations: [],
        startingLocationId: 'crossroads',
        initialUnlockedLocations: ['crossroads'],
      };

      const map = generateCampaignMap(campaign);

      expect(map.campaignId).toBe('test-campaign');
      expect(map.acts).toHaveLength(2);
      expect(map.acts[0].actId).toBe('act1');
      expect(map.acts[1].actId).toBe('act2');
    });
  });

  describe('getNodeTitle', () => {
    it('should return node title if present', () => {
      const node: StoryNode = {
        id: 'node1',
        title: 'My Title',
        description: 'Description',
        choices: [],
      };

      expect(getNodeTitle(node)).toBe('My Title');
    });

    it('should return node ID if title is missing', () => {
      const node: StoryNode = {
        id: 'node1',
        description: 'Description',
        choices: [],
      };

      expect(getNodeTitle(node)).toBe('node1');
    });
  });
});
