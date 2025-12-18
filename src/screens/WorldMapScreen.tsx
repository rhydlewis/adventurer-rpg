import { useState, useMemo } from 'react';
import { useNarrativeStore } from '../stores/narrativeStore';
import { generateCampaignMap, getNodeTitle } from '../utils/mapGenerator';
import { Card, Button, Icon } from '../components';
import type { StoryNode, MapGraph } from '../types';

interface WorldMapScreenProps {
  /**
   * Callback to return to the story
   */
  onReturnToStory: () => void;
}

/**
 * WorldMapScreen - Visual representation of the campaign's story node graph
 *
 * Features:
 * - Auto-generated node graph from campaign structure
 * - Current position highlighted
 * - Visited nodes shown in full color
 * - Unvisited nodes dimmed
 * - Click nodes to see details
 * - Act-based views (one graph per act)
 *
 * @example
 * <WorldMapScreen onReturnToStory={() => setScreen('story')} />
 */
export function WorldMapScreen({ onReturnToStory }: WorldMapScreenProps) {
  const { campaign, world, conversation } = useNarrativeStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedActIndex, setSelectedActIndex] = useState<number>(0);

  // Generate map from campaign
  const campaignMap = useMemo(() => {
    if (!campaign) return null;
    return generateCampaignMap(campaign);
  }, [campaign]);

  if (!campaign || !world || !conversation || !campaignMap) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card variant="neutral" padding="spacious">
          <p className="text-fg-primary body-primary text-center">
            No active campaign. Cannot display map.
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={onReturnToStory}
            className="mt-4"
          >
            Return
          </Button>
        </Card>
      </div>
    );
  }

  // Get current act map
  const currentActMap = campaignMap.acts[selectedActIndex];
  if (!currentActMap) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card variant="neutral" padding="spacious">
          <p className="text-fg-primary body-primary text-center">
            Act not found. This is a bug.
          </p>
        </Card>
      </div>
    );
  }

  // Find selected node details
  const selectedNode = selectedNodeId
    ? campaign.acts
        .flatMap((act) => act.nodes)
        .find((node) => node.id === selectedNodeId)
    : null;

  return (
    <div className="min-h-screen bg-primary flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        <Card variant="neutral" padding="compact">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Map" className="text-player" />
              <div>
                <h1 className="heading-primary text-h1 text-fg-primary">
                  World Map
                </h1>
                <p className="text-xs text-fg-muted label-secondary">
                  {campaign.title}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={onReturnToStory}
              icon={<Icon name="ArrowLeft" />}
            >
              Return to Story
            </Button>
          </div>
        </Card>
      </div>

      {/* Act Selector (if multiple acts) */}
      {campaignMap.acts.length > 1 && (
        <div className="mb-4">
          <Card variant="neutral" padding="compact">
            <div className="flex gap-2 overflow-x-auto">
              {campaignMap.acts.map((act, index) => (
                <Button
                  key={act.actId}
                  variant={index === selectedActIndex ? 'primary' : 'secondary'}
                  onClick={() => setSelectedActIndex(index)}
                >
                  {act.actTitle}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Map Visualization */}
        <Card variant="neutral" className="flex-1 overflow-auto">
          <MapVisualization
            mapGraph={currentActMap}
            currentNodeId={conversation.currentNodeId}
            visitedNodeIds={world.visitedNodeIds}
            onNodeClick={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
          />
        </Card>

        {/* Node Details Sidebar */}
        {selectedNode && (
          <Card variant="neutral" padding="spacious" className="w-80 overflow-auto">
            <NodeDetails node={selectedNode} onClose={() => setSelectedNodeId(null)} />
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * SVG visualization of the node graph
 */
function MapVisualization({
  mapGraph,
  currentNodeId,
  visitedNodeIds,
  onNodeClick,
  selectedNodeId,
}: {
  mapGraph: MapGraph;
  currentNodeId: string;
  visitedNodeIds: string[];
  onNodeClick: (nodeId: string) => void;
  selectedNodeId: string | null;
}) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    >
      {/* Draw connections first (background) */}
      {mapGraph.connections.map((conn, index) => {
        const fromPos = mapGraph.nodes.find((n) => n.nodeId === conn.from);
        const toPos = mapGraph.nodes.find((n) => n.nodeId === conn.to);

        if (!fromPos || !toPos) return null;

        const isVisited =
          visitedNodeIds.includes(conn.from) && visitedNodeIds.includes(conn.to);

        return (
          <line
            key={`${conn.from}-${conn.to}-${index}`}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke={isVisited ? '#4a5568' : '#2d3748'}
            strokeWidth="2"
            opacity={isVisited ? 0.6 : 0.3}
            markerEnd="url(#arrowhead)"
          />
        );
      })}

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          fill="#4a5568"
        >
          <polygon points="0 0, 10 3, 0 6" />
        </marker>
      </defs>

      {/* Draw nodes */}
      {mapGraph.nodes.map((pos) => {
        const isCurrent = pos.nodeId === currentNodeId;
        const isVisited = visitedNodeIds.includes(pos.nodeId);
        const isSelected = pos.nodeId === selectedNodeId;

        // Color scheme
        let fillColor = '#2d3748'; // Unvisited (dark gray)
        let strokeColor = '#4a5568'; // Default border
        let strokeWidth = 2;

        if (isCurrent) {
          fillColor = '#3182ce'; // Current (blue)
          strokeColor = '#63b3ed';
          strokeWidth = 4;
        } else if (isVisited) {
          fillColor = '#4a5568'; // Visited (gray)
          strokeColor = '#718096';
        }

        if (isSelected) {
          strokeColor = '#f6e05e'; // Selected (yellow border)
          strokeWidth = 4;
        }

        return (
          <g
            key={pos.nodeId}
            onClick={() => onNodeClick(pos.nodeId)}
            style={{ cursor: 'pointer' }}
          >
            {/* Node circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isCurrent ? 20 : 15}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={isVisited || isCurrent ? 1 : 0.4}
            >
              {isCurrent && (
                <animate
                  attributeName="r"
                  values={`${isCurrent ? 20 : 15};${isCurrent ? 24 : 18};${isCurrent ? 20 : 15}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>

            {/* Node ID label (simplified) */}
            <text
              x={pos.x}
              y={pos.y - 25}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="12"
              opacity={isVisited || isCurrent ? 0.8 : 0.4}
              pointerEvents="none"
            >
              {pos.nodeId.split('-').pop()?.substring(0, 8)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Node details panel
 */
function NodeDetails({ node, onClose }: { node: StoryNode; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h2 className="heading-secondary text-fg-primary">
          {getNodeTitle(node)}
        </h2>
        <button
          onClick={onClose}
          className="text-fg-muted hover:text-fg-primary"
          aria-label="Close"
        >
          <Icon name="X" />
        </button>
      </div>

      {node.locationHint && (
        <p className="text-xs text-fg-muted label-secondary italic">
          {node.locationHint}
        </p>
      )}

      <div className="body-primary text-fg-secondary">
        {node.description}
      </div>

      {node.speakerName && (
        <div className="border-t border-border pt-2">
          <p className="text-sm text-fg-muted label-secondary">
            Speaker: {node.speakerName}
          </p>
        </div>
      )}

      {node.choices.length > 0 && (
        <div className="border-t border-border pt-2">
          <p className="text-sm text-fg-muted label-secondary mb-2">
            Choices ({node.choices.length}):
          </p>
          <ul className="space-y-1">
            {node.choices.map((choice) => (
              <li key={choice.id} className="text-xs text-fg-secondary body-secondary">
                • {choice.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
