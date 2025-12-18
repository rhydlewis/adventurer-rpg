/**
 * Map Visualization Types
 *
 * Defines types for auto-generated campaign maps that visualize
 * the story node graph structure.
 */

export interface NodePosition {
  nodeId: string;
  x: number; // SVG coordinate (0-1000 range)
  y: number; // SVG coordinate (0-1000 range)
  actId: string;
}

export interface NodeConnection {
  from: string; // nodeId
  to: string; // nodeId
  choiceText: string; // Text of the choice that leads here
}

export interface MapGraph {
  nodes: NodePosition[];
  connections: NodeConnection[];
  actId: string;
  actTitle: string;
}

export interface CampaignMap {
  campaignId: string;
  acts: MapGraph[]; // One graph per act
}
