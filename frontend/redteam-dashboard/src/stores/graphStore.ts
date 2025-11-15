/**
 * ============================================================================
 * GRAPH STORE - Zustand State Management
 * ============================================================================
 *
 * Manages the graph state including nodes, edges, clusters using Map-based
 * data structures for O(1) lookup performance.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type {
  GraphNode,
  GraphCluster,
  EvolutionLink,
  NodeStatus,
  Position
} from '../types';

// Enable Immer MapSet plugin for Map/Set support
enableMapSet();

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface GraphState {
  // Core data (Map-based for O(1) lookups)
  nodes: Map<string, GraphNode>;
  clusters: Map<string, GraphCluster>;
  links: Map<string, EvolutionLink>;

  // Indices for efficient queries
  nodesByCluster: Map<string, Set<string>>;
  nodesByParent: Map<string, Set<string>>;
  linksBySource: Map<string, Set<string>>;
  linksByTarget: Map<string, Set<string>>;

  // Metadata
  lastUpdateTimestamp: number;
  totalUpdates: number;

  // Actions
  addCluster: (cluster: GraphCluster) => void;
  addNode: (node: GraphNode) => void;
  updateNode: (nodeId: string, updates: Partial<GraphNode>) => void;
  addEdge: (link: EvolutionLink) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (linkId: string) => void;

  // Getters
  getNode: (nodeId: string) => GraphNode | undefined;
  getNodesByCluster: (clusterId: string) => GraphNode[];
  getGraphData: () => {
    nodes: GraphNode[];
    edges: EvolutionLink[];
  };

  // Utility
  reset: () => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  nodes: new Map<string, GraphNode>(),
  clusters: new Map<string, GraphCluster>(),
  links: new Map<string, EvolutionLink>(),
  nodesByCluster: new Map<string, Set<string>>(),
  nodesByParent: new Map<string, Set<string>>(),
  linksBySource: new Map<string, Set<string>>(),
  linksByTarget: new Map<string, Set<string>>(),
  lastUpdateTimestamp: Date.now(),
  totalUpdates: 0
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateClusterColor = (index: number): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[index % colors.length];
};

const calculateNodeRadius = (node: GraphNode): number => {
  const baseRadius = 8;
  if (node.status === 'success') return baseRadius * 1.5;
  if (node.status === 'partial') return baseRadius * 1.2;
  return baseRadius;
};

// ============================================================================
// STORE
// ============================================================================

export const useGraphStore = create<GraphState>()(
  immer((set, get) => ({
    ...initialState,

    addCluster: (cluster: GraphCluster) => {
      set((state) => {
        console.log('[GraphStore] Adding cluster:', cluster.cluster_id, cluster.name);
        if (state.clusters.has(cluster.cluster_id)) {
          console.warn(`Cluster ${cluster.cluster_id} already exists`);
          return;
        }

        const clusterWithColor = {
          ...cluster,
          color: cluster.color || generateClusterColor(state.clusters.size)
        };

        state.clusters.set(cluster.cluster_id, clusterWithColor);
        state.nodesByCluster.set(cluster.cluster_id, new Set());
        state.lastUpdateTimestamp = Date.now();
        state.totalUpdates++;
      });
    },

    addNode: (node: GraphNode) => {
      set((state) => {
        console.log('[GraphStore] Adding node:', node.node_id, 'to cluster:', node.cluster_id);
        if (state.nodes.has(node.node_id)) {
          console.warn(`Node ${node.node_id} already exists`);
          return;
        }

        // Auto-create cluster if it doesn't exist (race condition handling)
        let cluster = state.clusters.get(node.cluster_id);
        if (!cluster) {
          console.warn(`Cluster ${node.cluster_id} not found. Auto-creating it.`);
          cluster = {
            cluster_id: node.cluster_id,
            name: `Cluster ${state.clusters.size + 1}`,
            position_hint: { x: 500, y: 500 },
            color: generateClusterColor(state.clusters.size),
            total_attacks: 0,
            successful_attacks: 0,
            collapsed: false,
            visible: true,
          };
          state.clusters.set(node.cluster_id, cluster);
          state.nodesByCluster.set(node.cluster_id, new Set());
        }

        state.nodes.set(node.node_id, node);

        const clusterNodes = state.nodesByCluster.get(node.cluster_id) || new Set();
        clusterNodes.add(node.node_id);
        state.nodesByCluster.set(node.cluster_id, clusterNodes);

        node.parent_ids.forEach((parentId) => {
          const children = state.nodesByParent.get(parentId) || new Set();
          children.add(node.node_id);
          state.nodesByParent.set(parentId, children);
        });

        const updatedCluster = state.clusters.get(node.cluster_id);
        if (updatedCluster) {
          updatedCluster.total_attacks = (updatedCluster.total_attacks || 0) + 1;
        }

        state.lastUpdateTimestamp = Date.now();
        state.totalUpdates++;
      });
    },

    updateNode: (nodeId: string, updates: Partial<GraphNode>) => {
      set((state) => {
        const node = state.nodes.get(nodeId);
        if (!node) {
          console.warn(`Node ${nodeId} not found for update. Skipping.`);
          return;
        }

        const wasSuccess = node.status === 'success';
        const updatedNode = { ...node, ...updates };
        state.nodes.set(nodeId, updatedNode);

        const isSuccess = updatedNode.status === 'success';

        if (!wasSuccess && isSuccess) {
          const cluster = state.clusters.get(node.cluster_id);
          if (cluster) {
            cluster.successful_attacks = (cluster.successful_attacks || 0) + 1;
          }
        }

        state.lastUpdateTimestamp = Date.now();
        state.totalUpdates++;
      });
    },

    addEdge: (link: EvolutionLink) => {
      set((state) => {
        if (state.links.has(link.link_id)) {
          console.warn(`Link ${link.link_id} already exists`);
          return;
        }

        const allNodesExist = link.source_node_ids.every((id) => state.nodes.has(id)) &&
                              state.nodes.has(link.target_node_id);
        if (!allNodesExist) {
          console.error(`Some nodes not found for link ${link.link_id}`);
          return;
        }

        state.links.set(link.link_id, link);

        link.source_node_ids.forEach((sourceId) => {
          const sourceLinks = state.linksBySource.get(sourceId) || new Set();
          sourceLinks.add(link.link_id);
          state.linksBySource.set(sourceId, sourceLinks);
        });

        const targetLinks = state.linksByTarget.get(link.target_node_id) || new Set();
        targetLinks.add(link.link_id);
        state.linksByTarget.set(link.target_node_id, targetLinks);

        state.lastUpdateTimestamp = Date.now();
        state.totalUpdates++;
      });
    },

    removeNode: (nodeId: string) => {
      set((state) => {
        const node = state.nodes.get(nodeId);
        if (!node) return;

        const clusterNodes = state.nodesByCluster.get(node.cluster_id);
        if (clusterNodes) {
          clusterNodes.delete(nodeId);
        }

        node.parent_ids.forEach((parentId) => {
          const children = state.nodesByParent.get(parentId);
          if (children) {
            children.delete(nodeId);
          }
        });

        state.nodesByParent.delete(nodeId);

        const incomingLinks = state.linksByTarget.get(nodeId);
        const outgoingLinks = state.linksBySource.get(nodeId);

        incomingLinks?.forEach((linkId) => state.links.delete(linkId));
        outgoingLinks?.forEach((linkId) => state.links.delete(linkId));

        state.linksByTarget.delete(nodeId);
        state.linksBySource.delete(nodeId);

        state.nodes.delete(nodeId);

        state.lastUpdateTimestamp = Date.now();
        state.totalUpdates++;
      });
    },

    removeEdge: (linkId: string) => {
      set((state) => {
        const link = state.links.get(linkId);
        if (!link) return;

        link.source_node_ids.forEach((sourceId) => {
          const sourceLinks = state.linksBySource.get(sourceId);
          if (sourceLinks) {
            sourceLinks.delete(linkId);
          }
        });

        const targetLinks = state.linksByTarget.get(link.target_node_id);
        if (targetLinks) {
          targetLinks.delete(linkId);
        }

        state.links.delete(linkId);

        state.lastUpdateTimestamp = Date.now();
        state.totalUpdates++;
      });
    },

    getNode: (nodeId: string) => {
      return get().nodes.get(nodeId);
    },

    getNodesByCluster: (clusterId: string) => {
      const state = get();
      const nodeIds = state.nodesByCluster.get(clusterId) || new Set();
      return Array.from(nodeIds)
        .map((id) => state.nodes.get(id))
        .filter(Boolean) as GraphNode[];
    },

    getGraphData: () => {
      const state = get();
      return {
        nodes: Array.from(state.nodes.values()),
        edges: Array.from(state.links.values())
      };
    },

    reset: () => {
      set(initialState);
    }
  }))
);
