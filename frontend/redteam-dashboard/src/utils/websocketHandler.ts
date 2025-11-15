/**
 * WebSocket event handler
 * Processes incoming WebSocket events and updates stores
 */

import type {
  WebSocketEvent,
  ClusterAddEvent,
  NodeAddEvent,
  NodeUpdateEvent,
  EvolutionLinkAddEvent,
  AgentMappingUpdateEvent,
  AttackCompleteEvent,
} from '../types/websocket';
import { useGraphStore } from '../stores/graphStore';
import { useAttackStore } from '../stores/attackStore';
import { useUIStore } from '../stores/uiStore';
import type { GraphNode, GraphEdge, GraphCluster } from '../types/graph';
import { calculateNodePosition, calculateClusterPosition } from './graphTransforms';

/**
 * Main WebSocket event handler
 * Routes events to appropriate handlers
 */
export function handleWebSocketEvent(event: WebSocketEvent): void {
  console.log('[WebSocket] Event received:', event.event_type, event);

  switch (event.event_type) {
    case 'cluster_add':
      handleClusterAdd(event);
      break;
    case 'node_add':
      handleNodeAdd(event);
      break;
    case 'node_update':
      handleNodeUpdate(event);
      break;
    case 'evolution_link_add':
      handleEvolutionLinkAdd(event);
      break;
    case 'agent_mapping_update':
      handleAgentMappingUpdate(event);
      break;
    case 'attack_complete':
      handleAttackComplete(event);
      break;
    default:
      console.warn('[WebSocket] Unknown event type:', (event as any).event_type);
  }
}

/**
 * Handle cluster_add event
 * Creates a new cluster node in the graph
 */
function handleClusterAdd(event: ClusterAddEvent): void {
  const { payload } = event;
  const graphStore = useGraphStore.getState();

  // Calculate position if not provided
  const position = payload.position_hint || calculateClusterPosition(
    graphStore.clusters.size,
    graphStore.clusters.size + 1
  );

  const cluster: GraphCluster = {
    id: payload.cluster_id,
    name: payload.name,
    color: payload.color || generateClusterColor(graphStore.clusters.size),
    position,
  };

  graphStore.addCluster(cluster);
  console.log('[WebSocket] Cluster added:', cluster.id);
}

/**
 * Handle node_add event
 * Creates a new attack node in the graph
 */
function handleNodeAdd(event: NodeAddEvent): void {
  const { payload } = event;
  const graphStore = useGraphStore.getState();

  // Get cluster to determine position
  const cluster = graphStore.clusters.get(payload.cluster_id);
  if (!cluster) {
    console.error('[WebSocket] Cluster not found for node:', payload.cluster_id);
    return;
  }

  // Count nodes in cluster to determine position
  const nodesInCluster = Array.from(graphStore.nodes.values()).filter(
    (n) => n.data.cluster_id === payload.cluster_id
  );

  const position = calculateNodePosition(
    payload.cluster_id,
    nodesInCluster.length,
    graphStore
  );

  const node: GraphNode = {
    id: payload.node_id,
    type: 'custom',
    position,
    data: {
      node_id: payload.node_id,
      cluster_id: payload.cluster_id,
      parent_ids: payload.parent_ids || [],
      attack_type: payload.attack_type,
      status: payload.status || 'pending',
      llm_summary: payload.llm_summary,
      full_transcript: payload.full_transcript,
      full_trace: payload.full_trace,
      success_score: payload.success_score,
    },
  };

  graphStore.addNode(node);
  console.log('[WebSocket] Node added:', node.id, 'Status:', node.data.status);

  // Create edges from parent nodes
  if (payload.parent_ids && payload.parent_ids.length > 0) {
    payload.parent_ids.forEach((parentId, index) => {
      const edge: GraphEdge = {
        id: `${parentId}-${payload.node_id}-${index}`,
        source: parentId,
        target: payload.node_id,
        type: 'default',
        animated: false,
        style: {
          stroke: 'var(--text-dim)',
          strokeWidth: 1,
        },
      };
      graphStore.addEdge(edge);
    });
  }
}

/**
 * Handle node_update event
 * Updates an existing node's status and data
 */
function handleNodeUpdate(event: NodeUpdateEvent): void {
  const { payload } = event;
  const graphStore = useGraphStore.getState();

  const node = graphStore.nodes.get(payload.node_id);
  if (!node) {
    console.error('[WebSocket] Node not found for update:', payload.node_id);
    return;
  }

  // Build update object
  const updates: Partial<GraphNode['data']> = {};

  if (payload.status !== undefined) {
    updates.status = payload.status;
  }

  if (payload.llm_summary !== undefined) {
    updates.llm_summary = payload.llm_summary;
  }

  if (payload.full_transcript !== undefined) {
    updates.full_transcript = payload.full_transcript;
  }

  if (payload.full_trace !== undefined) {
    updates.full_trace = payload.full_trace;
  }

  if (payload.success_score !== undefined) {
    updates.success_score = payload.success_score;
  }

  graphStore.updateNode(payload.node_id, updates);
  console.log('[WebSocket] Node updated:', payload.node_id, 'Status:', payload.status);
}

/**
 * Handle evolution_link_add event
 * Creates edges showing evolution/breeding between nodes
 */
function handleEvolutionLinkAdd(event: EvolutionLinkAddEvent): void {
  const { payload } = event;
  const graphStore = useGraphStore.getState();

  // Validate source and target nodes exist
  const targetExists = graphStore.nodes.has(payload.target_node_id);
  if (!targetExists) {
    console.error('[WebSocket] Target node not found:', payload.target_node_id);
    return;
  }

  // Create edges from all source nodes to target
  payload.source_node_ids.forEach((sourceId, index) => {
    const sourceExists = graphStore.nodes.has(sourceId);
    if (!sourceExists) {
      console.error('[WebSocket] Source node not found:', sourceId);
      return;
    }

    const edge: GraphEdge = {
      id: payload.link_id ? `${payload.link_id}-${index}` : `${sourceId}-${payload.target_node_id}-evolution`,
      source: sourceId,
      target: payload.target_node_id,
      type: 'default',
      animated: true,
      style: {
        stroke: 'var(--primary-purple)',
        strokeWidth: 2,
      },
      label: payload.evolution_type || 'evolution',
    };

    graphStore.addEdge(edge);
    console.log('[WebSocket] Evolution link added:', edge.id);
  });
}

/**
 * Handle agent_mapping_update event
 * Updates agent information in the attack store
 */
function handleAgentMappingUpdate(event: AgentMappingUpdateEvent): void {
  const { payload } = event;
  const attackStore = useAttackStore.getState();

  // Update agent info in the store
  attackStore.setAgentInfo({
    name: payload.agent_name,
    description: payload.agent_description,
    capabilities: payload.agent_capabilities,
  });

  console.log('[WebSocket] Agent mapping updated:', payload.agent_name);
}

/**
 * Handle attack_complete event
 * Shows results modal and updates attack status
 */
function handleAttackComplete(event: AttackCompleteEvent): void {
  const { payload } = event;
  const attackStore = useAttackStore.getState();
  const uiStore = useUIStore.getState();

  // Update attack status
  attackStore.setStatus('completed');
  attackStore.setAttackId(payload.attack_id);

  // Fetch results if URL provided
  if (payload.results_url) {
    fetchAttackResults(payload.results_url);
  }

  // Show results modal
  uiStore.setShowResultsModal(true);

  console.log('[WebSocket] Attack complete:', payload.attack_id);
}

/**
 * Fetch attack results from API
 */
async function fetchAttackResults(resultsUrl: string): Promise<void> {
  try {
    const attackStore = useAttackStore.getState();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const fullUrl = resultsUrl.startsWith('http') ? resultsUrl : `${baseUrl}${resultsUrl}`;

    console.log('[API] Fetching results from:', fullUrl);

    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.statusText}`);
    }

    const results = await response.json();
    attackStore.setResults(results);

    console.log('[API] Results fetched successfully');
  } catch (error) {
    console.error('[API] Failed to fetch results:', error);
  }
}

/**
 * Generate a color for a cluster based on index
 */
function generateClusterColor(index: number): string {
  const colors = [
    '#00d9ff', // cyan
    '#a78bfa', // purple
    '#00ff88', // green
    '#fbbf24', // yellow
    '#3b82f6', // blue
    '#ec4899', // pink
    '#f59e0b', // orange
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#06b6d4', // cyan-500
  ];

  return colors[index % colors.length];
}

/**
 * Parse WebSocket message
 * Handles JSON parsing and error handling
 */
export function parseWebSocketMessage(message: string): WebSocketEvent | null {
  try {
    const parsed = JSON.parse(message);
    return parsed as WebSocketEvent;
  } catch (error) {
    console.error('[WebSocket] Failed to parse message:', error);
    return null;
  }
}

/**
 * WebSocket message handler (main entry point)
 * Parses message and routes to event handler
 */
export function handleWebSocketMessage(message: MessageEvent): void {
  const event = parseWebSocketMessage(message.data);
  if (event) {
    handleWebSocketEvent(event);
  }
}

/**
 * Handle WebSocket error
 */
export function handleWebSocketError(error: Event): void {
  console.error('[WebSocket] Error:', error);
}

/**
 * Handle WebSocket close
 */
export function handleWebSocketClose(event: CloseEvent): void {
  console.log('[WebSocket] Connection closed:', event.code, event.reason);
}

/**
 * Handle WebSocket open
 */
export function handleWebSocketOpen(event: Event): void {
  console.log('[WebSocket] Connection opened');
}
