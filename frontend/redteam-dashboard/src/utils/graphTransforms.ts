/**
 * Graph data transformations
 * Converts GraphState (Maps) to ReactFlow format (arrays)
 */

import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from '@xyflow/react';
import type { GraphNode, GraphEdge, GraphState } from '../types/graph';

/**
 * Transform GraphState to ReactFlow format
 * Converts Map-based storage to arrays for ReactFlow
 */
export function transformGraphStateToReactFlow(graphState: GraphState): {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
} {
  const clusterNodes: ReactFlowNode[] = [];
  const attackNodes: ReactFlowNode[] = [];

  // First, create cluster header nodes
  const clustersArray = Array.from(graphState.clusters.values());
  const clusterSpacing = 1000; // Horizontal spacing between clusters
  const clusterWidth = 800;  // Perfect circle needs equal width/height
  const clusterHeight = 800;

  // Node dimensions
  const nodeWidth = 200;
  const nodeHeight = 140;
  const nodesPerRow = 3;
  const nodePadding = 25;

  // Calculate spacing to center nodes
  const totalNodeWidth = (nodeWidth * nodesPerRow) + (nodePadding * (nodesPerRow - 1));
  const nodeStartX = (clusterWidth - totalNodeWidth) / 2;

  clustersArray.forEach((cluster, index) => {
    // Position clusters in a grid (2 columns for better spacing)
    const col = index % 2;
    const row = Math.floor(index / 2);
    const baseX = col * clusterSpacing;
    const baseY = row * 1100;

    // Create cluster background node
    clusterNodes.push({
      id: `cluster-${cluster.cluster_id}`,
      type: 'group',
      position: { x: baseX, y: baseY },
      data: {
        label: cluster.name,
        color: cluster.color,
        cluster_id: cluster.cluster_id,
      },
      style: {
        width: clusterWidth,
        height: clusterHeight,
      },
    });

    // Get all nodes in this cluster
    const nodesInCluster = Array.from(graphState.nodes.values())
      .filter(n => n.cluster_id === cluster.cluster_id);

    // Layout nodes within cluster - positions are relative to parent
    const startY = 120; // Leave space for cluster heading

    nodesInCluster.forEach((graphNode, nodeIndex) => {
      const col = nodeIndex % nodesPerRow;
      const row = Math.floor(nodeIndex / nodesPerRow);

      attackNodes.push({
        id: graphNode.node_id,
        type: 'custom',
        position: {
          x: nodeStartX + (col * (nodeWidth + nodePadding)),
          y: startY + (row * (nodeHeight + nodePadding)),
        },
        parentNode: `cluster-${cluster.cluster_id}`,
        extent: 'parent',
        data: {
          node_id: graphNode.node_id,
          cluster_id: graphNode.cluster_id,
          parent_ids: graphNode.parent_ids,
          attack_type: graphNode.attack_type,
          status: graphNode.status,
          timestamp: graphNode.timestamp,
          model_id: graphNode.model_id,
          llm_summary: graphNode.llm_summary,
          full_transcript: graphNode.full_transcript,
          success_score: graphNode.success_score,
          clusterName: cluster.name,
          clusterColor: cluster.color,
        },
      });
    });
  });

  const nodes = [...clusterNodes, ...attackNodes];

  // Convert Map<string, EvolutionLink> to ReactFlowEdge[]
  // Note: EvolutionLink can have multiple sources, so we create one edge per source
  const edges: ReactFlowEdge[] = [];
  Array.from(graphState.links.values()).forEach((evolutionLink) => {
    // Get edge styling based on evolution type
    const getEdgeStyle = (type: string) => {
      switch (type) {
        case 'breeding':
        case 'crossover':
          return {
            stroke: 'url(#breeding-gradient)',
            strokeWidth: 3,
            color: '#a78bfa', // purple for breeding
          };
        case 'mutation':
          return {
            stroke: 'url(#mutation-gradient)',
            strokeWidth: 2.5,
            color: '#00d9ff', // cyan for mutation
          };
        default:
          return {
            stroke: 'url(#default-gradient)',
            strokeWidth: 2,
            color: '#6b7280', // gray for unknown
          };
      }
    };

    const edgeStyle = getEdgeStyle(evolutionLink.evolution_type);

    evolutionLink.source_node_ids.forEach((sourceId, index) => {
      edges.push({
        id: `${evolutionLink.link_id}_${index}`,
        source: sourceId,
        target: evolutionLink.target_node_id,
        type: 'smoothstep', // Use smoothstep for organic curves
        animated: true,
        label: evolutionLink.evolution_type === 'breeding' ? '🧬' : '⚡',
        labelStyle: {
          fill: edgeStyle.color,
          fontWeight: 700,
          fontSize: 16,
        },
        labelBgStyle: {
          fill: 'rgba(10, 14, 20, 0.8)',
        },
        style: {
          stroke: edgeStyle.color,
          strokeWidth: edgeStyle.strokeWidth,
          opacity: 0.8,
        },
        markerEnd: {
          type: 'arrowclosed' as const,
          color: edgeStyle.color,
          width: 25,
          height: 25,
        },
      });
    });
  });

  return { nodes, edges };
}

/**
 * Calculate position for a new node based on cluster layout
 */
export function calculateNodePosition(
  clusterId: string,
  nodeIndex: number,
  graphState: GraphState
): { x: number; y: number } {
  const cluster = graphState.clusters.get(clusterId);

  if (!cluster) {
    // Fallback: random position
    return {
      x: Math.random() * 800,
      y: Math.random() * 600,
    };
  }

  // Get cluster's base position
  const baseX = cluster.position?.x || 0;
  const baseY = cluster.position?.y || 0;

  // Count existing nodes in this cluster
  const nodesInCluster = Array.from(graphState.nodes.values()).filter(
    (node) => node.cluster_id === clusterId
  );

  // Arrange nodes in a circular pattern within the cluster
  const angle = (nodeIndex / Math.max(nodesInCluster.length, 1)) * 2 * Math.PI;
  const radius = 100 + nodesInCluster.length * 10; // Expand as more nodes are added

  return {
    x: baseX + radius * Math.cos(angle),
    y: baseY + radius * Math.sin(angle),
  };
}

/**
 * Calculate position for a new cluster
 */
export function calculateClusterPosition(
  clusterIndex: number,
  totalClusters: number
): { x: number; y: number } {
  // Arrange clusters in a circle around the center
  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  const angle = (clusterIndex / Math.max(totalClusters, 1)) * 2 * Math.PI;

  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

/**
 * Get status color for a node
 */
export function getNodeStatusColor(status: string): string {
  switch (status) {
    case 'running':
      return 'var(--status-running)';
    case 'success':
      return 'var(--status-success)';
    case 'failure':
      return 'var(--status-failure)';
    case 'pending':
    default:
      return 'var(--status-pending)';
  }
}

/**
 * Get status badge class for a node
 */
export function getNodeStatusBadgeClass(status: string): string {
  switch (status) {
    case 'running':
      return 'badge-running';
    case 'success':
      return 'badge-success';
    case 'failure':
      return 'badge-failure';
    case 'pending':
    default:
      return 'badge-pending';
  }
}

/**
 * Format attack type name for display
 */
export function formatAttackTypeName(attackType: string): string {
  return attackType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Calculate graph statistics
 */
export function calculateGraphStats(graphState: GraphState): {
  totalNodes: number;
  runningNodes: number;
  successNodes: number;
  failureNodes: number;
  pendingNodes: number;
  totalClusters: number;
  successRate: number;
} {
  const nodes = Array.from(graphState.nodes.values());

  const runningNodes = nodes.filter((n) => n.status === 'running').length;
  const successNodes = nodes.filter((n) => n.status === 'success').length;
  const failureNodes = nodes.filter((n) => n.status === 'failure').length;
  const pendingNodes = nodes.filter((n) => n.status === 'pending').length;

  const completedNodes = successNodes + failureNodes;
  const successRate = completedNodes > 0 ? (successNodes / completedNodes) * 100 : 0;

  return {
    totalNodes: nodes.length,
    runningNodes,
    successNodes,
    failureNodes,
    pendingNodes,
    totalClusters: graphState.clusters.size,
    successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Get top successful attacks
 */
export function getTopSuccessfulAttacks(
  graphState: GraphState,
  limit: number = 5
): GraphNode[] {
  const successfulNodes = Array.from(graphState.nodes.values())
    .filter((node) => node.status === 'success')
    .sort((a, b) => {
      // Sort by success_score if available, otherwise by timestamp
      if (a.success_score !== undefined && b.success_score !== undefined) {
        return b.success_score - a.success_score;
      }
      return 0;
    });

  return successfulNodes.slice(0, limit);
}

/**
 * Find parent nodes of a given node
 */
export function findParentNodes(nodeId: string, graphState: GraphState): GraphNode[] {
  const node = graphState.nodes.get(nodeId);
  if (!node || !node.parent_ids || node.parent_ids.length === 0) {
    return [];
  }

  return node.parent_ids
    .map((parentId) => graphState.nodes.get(parentId))
    .filter((n): n is GraphNode => n !== undefined);
}

/**
 * Find child nodes of a given node
 */
export function findChildNodes(nodeId: string, graphState: GraphState): GraphNode[] {
  return Array.from(graphState.nodes.values()).filter((node) =>
    node.parent_ids?.includes(nodeId)
  );
}

/**
 * Export graph data as JSON
 */
export function exportGraphAsJSON(graphState: GraphState): string {
  const data = {
    nodes: Array.from(graphState.nodes.entries()),
    links: Array.from(graphState.links.entries()),
    clusters: Array.from(graphState.clusters.entries()),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Export node details as JSON
 */
export function exportNodeAsJSON(nodeId: string, graphState: GraphState): string {
  const node = graphState.nodes.get(nodeId);
  const cluster = node ? graphState.clusters.get(node.cluster_id) : undefined;
  const parents = findParentNodes(nodeId, graphState);
  const children = findChildNodes(nodeId, graphState);

  const data = {
    node,
    cluster,
    parents,
    children,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}
