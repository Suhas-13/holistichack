/**
 * ============================================================================
 * GRAPH STATE MANAGEMENT & EVENT HANDLERS
 * ============================================================================
 *
 * This file contains:
 * 1. State initialization functions
 * 2. WebSocket event handlers
 * 3. Query functions for data access
 * 4. State update utilities
 */

import {
  GraphState,
  GraphNode,
  GraphCluster,
  EvolutionLink,
  NodeLayout,
  GraphWebSocketEvent,
  NodeDetail,
  NodeFilter,
  GraphStats,
  NodeStatus,
  AttackType,
  Position,
  SerializableGraphState
} from './graph-data-structures';

// ============================================================================
// STATE INITIALIZATION
// ============================================================================

/**
 * Create empty graph state
 */
export function createEmptyGraphState(): GraphState {
  return {
    nodes: new Map(),
    clusters: new Map(),
    links: new Map(),
    nodesByCluster: new Map(),
    nodesByParent: new Map(),
    linksBySource: new Map(),
    linksByTarget: new Map(),
    layout: new Map(),
    selectedNodeId: null,
    hoveredNodeId: null,
    lastUpdateTimestamp: Date.now(),
    totalUpdates: 0
  };
}

/**
 * Deserialize state from JSON (e.g., from server or localStorage)
 */
export function deserializeGraphState(
  serialized: SerializableGraphState
): GraphState {
  const state = createEmptyGraphState();

  // Rebuild clusters
  serialized.clusters.forEach(cluster => {
    state.clusters.set(cluster.cluster_id, cluster);
  });

  // Rebuild nodes and indices
  serialized.nodes.forEach(node => {
    state.nodes.set(node.node_id, node);

    // Index by cluster
    if (!state.nodesByCluster.has(node.cluster_id)) {
      state.nodesByCluster.set(node.cluster_id, new Set());
    }
    state.nodesByCluster.get(node.cluster_id)!.add(node.node_id);

    // Index by parents
    node.parent_ids.forEach(parent_id => {
      if (!state.nodesByParent.has(parent_id)) {
        state.nodesByParent.set(parent_id, new Set());
      }
      state.nodesByParent.get(parent_id)!.add(node.node_id);
    });
  });

  // Rebuild links and indices
  serialized.links.forEach(link => {
    state.links.set(link.link_id, link);

    // Index by source
    link.source_node_ids.forEach(source_id => {
      if (!state.linksBySource.has(source_id)) {
        state.linksBySource.set(source_id, new Set());
      }
      state.linksBySource.get(source_id)!.add(link.link_id);
    });

    // Index by target
    if (!state.linksByTarget.has(link.target_node_id)) {
      state.linksByTarget.set(link.target_node_id, new Set());
    }
    state.linksByTarget.get(link.target_node_id)!.add(link.link_id);
  });

  // Rebuild layout
  serialized.layout.forEach(layout => {
    state.layout.set(layout.node_id, layout);
  });

  state.selectedNodeId = serialized.selectedNodeId;
  state.lastUpdateTimestamp = serialized.timestamp;

  return state;
}

/**
 * Serialize state to JSON
 */
export function serializeGraphState(
  state: GraphState
): SerializableGraphState {
  return {
    nodes: Array.from(state.nodes.values()),
    clusters: Array.from(state.clusters.values()),
    links: Array.from(state.links.values()),
    layout: Array.from(state.layout.values()),
    selectedNodeId: state.selectedNodeId,
    timestamp: state.lastUpdateTimestamp
  };
}

// ============================================================================
// WEBSOCKET EVENT HANDLERS
// ============================================================================

/**
 * Handle cluster_add event
 */
export function handleClusterAdd(
  state: GraphState,
  event: Extract<GraphWebSocketEvent, { type: 'cluster_add' }>
): GraphState {
  const { cluster_id, name, position_hint, color } = event.data;

  // Check if cluster already exists
  if (state.clusters.has(cluster_id)) {
    console.warn(`Cluster ${cluster_id} already exists, skipping`);
    return state;
  }

  // Create new cluster
  const cluster: GraphCluster = {
    cluster_id,
    name,
    position_hint,
    color: color || generateClusterColor(state.clusters.size),
    collapsed: false,
    visible: true,
    total_attacks: 0,
    successful_attacks: 0
  };

  // Create new state (immutable update)
  const newState = { ...state };
  newState.clusters = new Map(state.clusters);
  newState.clusters.set(cluster_id, cluster);
  newState.nodesByCluster = new Map(state.nodesByCluster);
  newState.nodesByCluster.set(cluster_id, new Set());
  newState.lastUpdateTimestamp = Date.now();
  newState.totalUpdates = state.totalUpdates + 1;

  return newState;
}

/**
 * Handle node_add event
 */
export function handleNodeAdd(
  state: GraphState,
  event: Extract<GraphWebSocketEvent, { type: 'node_add' }>
): GraphState {
  const { node_id, cluster_id, parent_ids, attack_type, status, timestamp } = event.data;

  // Validation
  if (state.nodes.has(node_id)) {
    console.warn(`Node ${node_id} already exists, skipping`);
    return state;
  }

  if (!state.clusters.has(cluster_id)) {
    console.error(`Cluster ${cluster_id} not found for node ${node_id}`);
    return state;
  }

  // Create new node
  const node: GraphNode = {
    node_id,
    cluster_id,
    parent_ids,
    attack_type,
    status,
    timestamp: timestamp || Date.now(),
    tags: []
  };

  // Create initial layout for node
  const cluster = state.clusters.get(cluster_id)!;
  const layout: NodeLayout = {
    node_id,
    position: calculateInitialPosition(cluster, state),
    velocity: { vx: 0, vy: 0 },
    fixed: false,
    radius: calculateNodeRadius(node),
    highlight: false
  };

  // Immutable state update
  const newState = { ...state };

  // Update nodes
  newState.nodes = new Map(state.nodes);
  newState.nodes.set(node_id, node);

  // Update layout
  newState.layout = new Map(state.layout);
  newState.layout.set(node_id, layout);

  // Update indices
  newState.nodesByCluster = new Map(state.nodesByCluster);
  const clusterNodes = new Set(state.nodesByCluster.get(cluster_id) || []);
  clusterNodes.add(node_id);
  newState.nodesByCluster.set(cluster_id, clusterNodes);

  newState.nodesByParent = new Map(state.nodesByParent);
  parent_ids.forEach(parent_id => {
    const children = new Set(state.nodesByParent.get(parent_id) || []);
    children.add(node_id);
    newState.nodesByParent.set(parent_id, children);
  });

  // Update cluster stats
  newState.clusters = new Map(state.clusters);
  const updatedCluster = { ...cluster };
  updatedCluster.total_attacks = (updatedCluster.total_attacks || 0) + 1;
  newState.clusters.set(cluster_id, updatedCluster);

  newState.lastUpdateTimestamp = Date.now();
  newState.totalUpdates = state.totalUpdates + 1;

  return newState;
}

/**
 * Handle node_update event
 */
export function handleNodeUpdate(
  state: GraphState,
  event: Extract<GraphWebSocketEvent, { type: 'node_update' }>
): GraphState {
  const { node_id, ...updates } = event.data;

  const existingNode = state.nodes.get(node_id);
  if (!existingNode) {
    console.error(`Node ${node_id} not found for update`);
    return state;
  }

  // Merge updates
  const updatedNode: GraphNode = {
    ...existingNode,
    ...updates
  };

  // Check if status changed to success
  const wasSuccess = existingNode.status === NodeStatus.SUCCESS;
  const isSuccess = updatedNode.status === NodeStatus.SUCCESS;

  // Immutable state update
  const newState = { ...state };

  newState.nodes = new Map(state.nodes);
  newState.nodes.set(node_id, updatedNode);

  // Update cluster stats if needed
  if (!wasSuccess && isSuccess) {
    newState.clusters = new Map(state.clusters);
    const cluster = state.clusters.get(existingNode.cluster_id);
    if (cluster) {
      const updatedCluster = { ...cluster };
      updatedCluster.successful_attacks = (updatedCluster.successful_attacks || 0) + 1;
      newState.clusters.set(cluster.cluster_id, updatedCluster);
    }
  }

  // Update layout if node becomes more important
  if (isSuccess && !wasSuccess) {
    newState.layout = new Map(state.layout);
    const existingLayout = state.layout.get(node_id);
    if (existingLayout) {
      newState.layout.set(node_id, {
        ...existingLayout,
        radius: calculateNodeRadius(updatedNode)
      });
    }
  }

  newState.lastUpdateTimestamp = Date.now();
  newState.totalUpdates = state.totalUpdates + 1;

  return newState;
}

/**
 * Handle evolution_link_add event
 */
export function handleEvolutionLinkAdd(
  state: GraphState,
  event: Extract<GraphWebSocketEvent, { type: 'evolution_link_add' }>
): GraphState {
  const { link_id, source_node_ids, target_node_id, evolution_type, description, timestamp } = event.data;

  // Validation
  if (state.links.has(link_id)) {
    console.warn(`Link ${link_id} already exists, skipping`);
    return state;
  }

  // Verify all nodes exist
  const allNodesExist = source_node_ids.every(id => state.nodes.has(id)) &&
                        state.nodes.has(target_node_id);
  if (!allNodesExist) {
    console.error(`Some nodes not found for link ${link_id}`);
    return state;
  }

  // Create new link
  const link: EvolutionLink = {
    link_id,
    source_node_ids,
    target_node_id,
    evolution_type,
    timestamp: timestamp || Date.now(),
    description,
    strength: 0.7,
    animated: false
  };

  // Immutable state update
  const newState = { ...state };

  newState.links = new Map(state.links);
  newState.links.set(link_id, link);

  // Update indices
  newState.linksBySource = new Map(state.linksBySource);
  source_node_ids.forEach(source_id => {
    const sourceLinks = new Set(state.linksBySource.get(source_id) || []);
    sourceLinks.add(link_id);
    newState.linksBySource.set(source_id, sourceLinks);
  });

  newState.linksByTarget = new Map(state.linksByTarget);
  const targetLinks = new Set(state.linksByTarget.get(target_node_id) || []);
  targetLinks.add(link_id);
  newState.linksByTarget.set(target_node_id, targetLinks);

  newState.lastUpdateTimestamp = Date.now();
  newState.totalUpdates = state.totalUpdates + 1;

  return newState;
}

/**
 * Main event dispatcher
 */
export function handleWebSocketEvent(
  state: GraphState,
  event: GraphWebSocketEvent
): GraphState {
  switch (event.type) {
    case 'cluster_add':
      return handleClusterAdd(state, event);
    case 'node_add':
      return handleNodeAdd(state, event);
    case 'node_update':
      return handleNodeUpdate(state, event);
    case 'evolution_link_add':
      return handleEvolutionLinkAdd(state, event);
    default:
      console.warn('Unknown event type:', event);
      return state;
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get complete node details including relationships
 */
export function getNodeDetail(
  state: GraphState,
  node_id: string
): NodeDetail | null {
  const node = state.nodes.get(node_id);
  if (!node) return null;

  const cluster = state.clusters.get(node.cluster_id);
  if (!cluster) return null;

  const layout = state.layout.get(node_id);
  if (!layout) return null;

  // Get parent nodes
  const parents = node.parent_ids
    .map(id => state.nodes.get(id))
    .filter(Boolean) as GraphNode[];

  // Get child nodes
  const childIds = state.nodesByParent.get(node_id) || new Set();
  const children = Array.from(childIds)
    .map(id => state.nodes.get(id))
    .filter(Boolean) as GraphNode[];

  // Get incoming links
  const incomingLinkIds = state.linksByTarget.get(node_id) || new Set();
  const incoming_links = Array.from(incomingLinkIds)
    .map(id => state.links.get(id))
    .filter(Boolean) as EvolutionLink[];

  // Get outgoing links
  const outgoingLinkIds = state.linksBySource.get(node_id) || new Set();
  const outgoing_links = Array.from(outgoingLinkIds)
    .map(id => state.links.get(id))
    .filter(Boolean) as EvolutionLink[];

  return {
    ...node,
    cluster,
    parents,
    children,
    incoming_links,
    outgoing_links,
    layout
  };
}

/**
 * Query nodes with filters
 */
export function queryNodes(
  state: GraphState,
  filter: NodeFilter
): GraphNode[] {
  let nodes = Array.from(state.nodes.values());

  if (filter.cluster_ids) {
    nodes = nodes.filter(n => filter.cluster_ids!.includes(n.cluster_id));
  }

  if (filter.attack_types) {
    nodes = nodes.filter(n => filter.attack_types!.includes(n.attack_type));
  }

  if (filter.statuses) {
    nodes = nodes.filter(n => filter.statuses!.includes(n.status));
  }

  if (filter.min_timestamp) {
    nodes = nodes.filter(n => n.timestamp >= filter.min_timestamp!);
  }

  if (filter.max_timestamp) {
    nodes = nodes.filter(n => n.timestamp <= filter.max_timestamp!);
  }

  if (filter.has_model_id !== undefined) {
    nodes = nodes.filter(n => filter.has_model_id ? !!n.model_id : !n.model_id);
  }

  if (filter.search_text) {
    const search = filter.search_text.toLowerCase();
    nodes = nodes.filter(n =>
      n.llm_summary?.toLowerCase().includes(search) ||
      n.tags?.some(tag => tag.toLowerCase().includes(search))
    );
  }

  return nodes;
}

/**
 * Calculate graph statistics
 */
export function calculateStats(state: GraphState): GraphStats {
  const nodes = Array.from(state.nodes.values());

  const nodes_by_status = nodes.reduce((acc, node) => {
    acc[node.status] = (acc[node.status] || 0) + 1;
    return acc;
  }, {} as Record<NodeStatus, number>);

  const nodes_by_attack_type = nodes.reduce((acc, node) => {
    acc[node.attack_type] = (acc[node.attack_type] || 0) + 1;
    return acc;
  }, {} as Record<AttackType, number>);

  const successCount = nodes_by_status[NodeStatus.SUCCESS] || 0;
  const partialCount = nodes_by_status[NodeStatus.PARTIAL] || 0;
  const success_rate = nodes.length > 0
    ? ((successCount + partialCount * 0.5) / nodes.length) * 100
    : 0;

  // Calculate average evolution depth
  const depths = nodes.map(node => calculateNodeDepth(state, node.node_id));
  const avg_evolution_depth = depths.length > 0
    ? depths.reduce((a, b) => a + b, 0) / depths.length
    : 0;

  return {
    total_nodes: state.nodes.size,
    total_clusters: state.clusters.size,
    total_links: state.links.size,
    nodes_by_status,
    nodes_by_attack_type,
    success_rate,
    avg_evolution_depth
  };
}

/**
 * Calculate node depth in evolution tree (0 = root)
 */
function calculateNodeDepth(state: GraphState, node_id: string): number {
  const node = state.nodes.get(node_id);
  if (!node || node.parent_ids.length === 0) return 0;

  const parentDepths = node.parent_ids.map(parent_id =>
    calculateNodeDepth(state, parent_id)
  );

  return Math.max(...parentDepths) + 1;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate cluster color based on index
 */
function generateClusterColor(index: number): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[index % colors.length];
}

/**
 * Calculate initial position for new node
 */
function calculateInitialPosition(
  cluster: GraphCluster,
  state: GraphState
): Position {
  // Add some randomness around cluster center
  const clusterNodes = state.nodesByCluster.get(cluster.cluster_id) || new Set();
  const radius = 50 + clusterNodes.size * 5;
  const angle = Math.random() * Math.PI * 2;

  return {
    x: cluster.position_hint.x + Math.cos(angle) * radius,
    y: cluster.position_hint.y + Math.sin(angle) * radius
  };
}

/**
 * Calculate node radius based on importance
 */
function calculateNodeRadius(node: GraphNode): number {
  const baseRadius = 8;

  // Larger radius for successful attacks
  if (node.status === NodeStatus.SUCCESS) return baseRadius * 1.5;
  if (node.status === NodeStatus.PARTIAL) return baseRadius * 1.2;

  return baseRadius;
}

/**
 * Get nodes in cluster
 */
export function getClusterNodes(
  state: GraphState,
  cluster_id: string
): GraphNode[] {
  const nodeIds = state.nodesByCluster.get(cluster_id) || new Set();
  return Array.from(nodeIds)
    .map(id => state.nodes.get(id))
    .filter(Boolean) as GraphNode[];
}

/**
 * Get root nodes (nodes with no parents)
 */
export function getRootNodes(state: GraphState): GraphNode[] {
  return Array.from(state.nodes.values())
    .filter(node => node.parent_ids.length === 0);
}

/**
 * Get leaf nodes (nodes with no children)
 */
export function getLeafNodes(state: GraphState): GraphNode[] {
  return Array.from(state.nodes.values())
    .filter(node => {
      const children = state.nodesByParent.get(node.node_id);
      return !children || children.size === 0;
    });
}
