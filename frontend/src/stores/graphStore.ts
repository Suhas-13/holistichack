import { create } from 'zustand';
import {
  GraphState,
  GraphNode,
  GraphCluster,
  EvolutionLink,
  GraphWebSocketEvent,
  createEmptyGraphState,
  handleWebSocketEvent,
  calculateStats,
  getNodeDetail,
  queryNodes,
  NodeFilter,
  GraphStats,
  NodeDetail
} from '../types/graph-state-management';

interface GraphStore extends GraphState {
  // Actions
  handleEvent: (event: GraphWebSocketEvent) => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;

  // Queries
  getNodeDetail: (nodeId: string) => NodeDetail | null;
  queryNodes: (filter: NodeFilter) => GraphNode[];
  getStats: () => GraphStats;

  // Utilities
  reset: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  ...createEmptyGraphState(),

  // Handle WebSocket events
  handleEvent: (event: GraphWebSocketEvent) => {
    const currentState = get();
    const newState = handleWebSocketEvent(currentState, event);
    set(newState);
  },

  // Select a node
  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  // Hover a node
  hoverNode: (nodeId: string | null) => {
    set({ hoveredNodeId: nodeId });
  },

  // Get full node details
  getNodeDetail: (nodeId: string) => {
    const state = get();
    return getNodeDetail(state, nodeId);
  },

  // Query nodes with filters
  queryNodes: (filter: NodeFilter) => {
    const state = get();
    return queryNodes(state, filter);
  },

  // Get statistics
  getStats: () => {
    const state = get();
    return calculateStats(state);
  },

  // Reset state
  reset: () => {
    set(createEmptyGraphState());
  }
}));
