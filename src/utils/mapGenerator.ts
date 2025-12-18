/**
 * Map Generator - Auto-generates visual maps from campaign structure
 *
 * Analyzes story node connections and computes 2D positions for visualization.
 * Uses a hierarchical layout algorithm based on graph depth.
 */

import type { Campaign, Act, StoryNode, ChoiceOutcome } from '../types';
import type { MapGraph, NodePosition, NodeConnection, CampaignMap } from '../types';

/**
 * Extract all node-to-node connections from a choice outcome
 * Recursively handles nested outcomes (skill checks, etc.)
 */
function extractConnections(
  nodeId: string,
  choiceText: string,
  outcome: ChoiceOutcome,
  connections: NodeConnection[]
): void {
  switch (outcome.type) {
    case 'goto':
      connections.push({
        from: nodeId,
        to: outcome.nodeId,
        choiceText,
      });
      break;
    case 'check':
      // Recursively extract from success/failure branches
      extractConnections(nodeId, `${choiceText} (success)`, outcome.success, connections);
      extractConnections(nodeId, `${choiceText} (failure)`, outcome.failure, connections);
      break;
    case 'characterCreation':
      // Character creation leads to next node
      connections.push({
        from: nodeId,
        to: outcome.nextNodeId,
        choiceText,
      });
      break;
    case 'loop':
    case 'exit':
    case 'explore':
    case 'merchant':
      // These don't create node-to-node connections
      break;
  }
}

/**
 * Build adjacency map and extract all connections for an act
 */
function buildGraph(act: Act): {
  adjacency: Map<string, string[]>;
  connections: NodeConnection[];
} {
  const adjacency = new Map<string, string[]>();
  const connections: NodeConnection[] = [];

  // Initialize all nodes in adjacency map
  for (const node of act.nodes) {
    adjacency.set(node.id, []);
  }

  // Extract connections from choices
  for (const node of act.nodes) {
    for (const choice of node.choices) {
      extractConnections(node.id, choice.text, choice.outcome, connections);
    }

    // Add onEnter combat connections
    if (node.onEnter) {
      for (const effect of node.onEnter) {
        if (effect.type === 'startCombat') {
          connections.push({
            from: node.id,
            to: effect.onVictoryNodeId,
            choiceText: '(combat victory)',
          });
        }
      }
    }
  }

  // Build adjacency list
  for (const conn of connections) {
    const neighbors = adjacency.get(conn.from);
    if (neighbors && !neighbors.includes(conn.to)) {
      neighbors.push(conn.to);
    }
  }

  return { adjacency, connections };
}

/**
 * Compute node depths using BFS from starting node
 */
function computeDepths(
  startNodeId: string,
  adjacency: Map<string, string[]>,
  allNodeIds: string[]
): Map<string, number> {
  const depths = new Map<string, number>();
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; depth: number }> = [
    { nodeId: startNodeId, depth: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current.nodeId)) {
      continue;
    }

    visited.add(current.nodeId);
    depths.set(current.nodeId, current.depth);

    const neighbors = adjacency.get(current.nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push({ nodeId: neighbor, depth: current.depth + 1 });
      }
    }
  }

  // Handle unreachable nodes (place them at the end)
  for (const nodeId of allNodeIds) {
    if (!depths.has(nodeId)) {
      depths.set(nodeId, 999); // Far away
    }
  }

  return depths;
}

/**
 * Compute 2D positions for nodes using hierarchical layout
 */
function computePositions(
  nodes: StoryNode[],
  startNodeId: string,
  adjacency: Map<string, string[]>
): NodePosition[] {
  const depths = computeDepths(
    startNodeId,
    adjacency,
    nodes.map((n) => n.id)
  );

  // Group nodes by depth
  const depthGroups = new Map<number, string[]>();
  for (const [nodeId, depth] of depths.entries()) {
    if (!depthGroups.has(depth)) {
      depthGroups.set(depth, []);
    }
    depthGroups.get(depth)!.push(nodeId);
  }

  const positions: NodePosition[] = [];
  const maxDepth = Math.max(...Array.from(depths.values()).filter((d) => d < 999));

  // Layout nodes
  for (const [depth, nodeIds] of depthGroups.entries()) {
    const count = nodeIds.length;
    const spacing = 800 / (count + 1); // Leave margins

    nodeIds.forEach((nodeId, index) => {
      const x = 100 + spacing * (index + 1); // Center horizontally
      const y = depth === 999 ? 900 : 100 + (depth * 700) / (maxDepth || 1); // Spread vertically

      positions.push({
        nodeId,
        x,
        y,
        actId: '', // Will be set by caller
      });
    });
  }

  return positions;
}

/**
 * Generate a map graph for a single act
 */
export function generateActMap(act: Act): MapGraph {
  const { adjacency, connections } = buildGraph(act);
  const positions = computePositions(act.nodes, act.startingNodeId, adjacency);

  // Set actId for all positions
  positions.forEach((pos) => {
    pos.actId = act.id;
  });

  return {
    nodes: positions,
    connections,
    actId: act.id,
    actTitle: act.title,
  };
}

/**
 * Generate map for entire campaign (all acts)
 */
export function generateCampaignMap(campaign: Campaign): CampaignMap {
  const acts = campaign.acts.map((act) => generateActMap(act));

  return {
    campaignId: campaign.id,
    acts,
  };
}

/**
 * Get the title for a node (fallback to ID if no title)
 */
export function getNodeTitle(node: StoryNode): string {
  return node.title || node.id;
}
