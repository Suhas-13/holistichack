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
  // Convert Map<string, GraphNode> to ReactFlowNode[]
  const nodes: ReactFlowNode[] = Array.from(graphState.nodes.values()).map((graphNode) => {
    const cluster = graphState.clusters.get(graphNode.data.cluster_id);

    return {
      id: graphNode.id,
      type: 'custom', // Will use custom AttackNode component
      position: graphNode.position,
      data: {
        ...graphNode.data,
        clusterName: cluster?.name || 'Unknown',
        clusterColor: cluster?.color || '#6b7280',
      },
      style: {
        width: 120,
        height: 80,
      },
    };
  });

  // Convert Map<string, GraphEdge> to ReactFlowEdge[]
  const edges: ReactFlowEdge[] = Array.from(graphState.edges.values()).map((graphEdge) => {
    return {
      id: graphEdge.id,
      source: graphEdge.source,
      target: graphEdge.target,
      type: graphEdge.type || 'default',
      animated: graphEdge.animated || false,
      style: {
        stroke: graphEdge.style?.stroke || 'var(--primary-purple)',
        strokeWidth: graphEdge.style?.strokeWidth || 2,
      },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: graphEdge.style?.stroke || 'var(--primary-purple)',
      },
    };
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
    (node) => node.data.cluster_id === clusterId
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

  const runningNodes = nodes.filter((n) => n.data.status === 'running').length;
  const successNodes = nodes.filter((n) => n.data.status === 'success').length;
  const failureNodes = nodes.filter((n) => n.data.status === 'failure').length;
  const pendingNodes = nodes.filter((n) => n.data.status === 'pending').length;

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
    .filter((node) => node.data.status === 'success')
    .sort((a, b) => {
      // Sort by success_score if available, otherwise by timestamp
      if (a.data.success_score !== undefined && b.data.success_score !== undefined) {
        return b.data.success_score - a.data.success_score;
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
  if (!node || !node.data.parent_ids || node.data.parent_ids.length === 0) {
    return [];
  }

  return node.data.parent_ids
    .map((parentId) => graphState.nodes.get(parentId))
    .filter((n): n is GraphNode => n !== undefined);
}

/**
 * Find child nodes of a given node
 */
export function findChildNodes(nodeId: string, graphState: GraphState): GraphNode[] {
  return Array.from(graphState.nodes.values()).filter((node) =>
    node.data.parent_ids?.includes(nodeId)
  );
}

/**
 * Export graph data as JSON
 */
export function exportGraphAsJSON(graphState: GraphState): string {
  const data = {
    nodes: Array.from(graphState.nodes.entries()),
    edges: Array.from(graphState.edges.entries()),
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
  const cluster = node ? graphState.clusters.get(node.data.cluster_id) : undefined;
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
