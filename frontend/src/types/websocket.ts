/**
 * ============================================================================
 * WEBSOCKET EVENT TYPES
 * ============================================================================
 *
 * Real-time WebSocket events for red-teaming dashboard
 * Handles all server-sent events for graph updates
 *
 * Event Flow:
 * 1. cluster_add - New cluster (agent) appears
 * 2. node_add - New attack node created
 * 3. node_update - Attack execution result
 * 4. evolution_link_add - Attack evolution (refinement, escalation, etc.)
 * 5. agent_mapping_update - Agent metadata updates
 * 6. attack_complete - Attack sequence finished
 */

import { AttackType, NodeStatus, EvolutionType, Position } from './graph';

// ============================================================================
// CLUSTER EVENTS
// ============================================================================

/**
 * WebSocket Event: New cluster added
 *
 * Sent when a new AI agent (target) is added to the visualization
 * Defines the cluster's visual properties and initial position
 *
 * @example
 * {
 *   "type": "cluster_add",
 *   "data": {
 *     "cluster_id": "eagle",
 *     "name": "Eagle Agent",
 *     "position_hint": { "x": 200, "y": 300 },
 *     "color": "#FF6B6B"
 *   }
 * }
 */
export interface ClusterAddEvent {
  type: 'cluster_add';
  data: {
    /** Unique identifier for the cluster */
    cluster_id: string;

    /** Display name (e.g., "Eagle", "Wolf", "Phoenix") */
    name: string;

    /** Suggested center position for layout algorithm */
    position_hint: Position;

    /** Hex color for visual distinction */
    color?: string;

    /** Optional agent metadata */
    agent_type?: string;

    /** Server timestamp when cluster was created */
    timestamp?: number;
  };
}

// ============================================================================
// NODE EVENTS
// ============================================================================

/**
 * WebSocket Event: New node added
 *
 * Sent when a new attack attempt is created
 * Node starts in 'pending' status and transitions through execution states
 *
 * @example
 * {
 *   "type": "node_add",
 *   "data": {
 *     "node_id": "node_eagle_001",
 *     "cluster_id": "eagle",
 *     "parent_ids": [],
 *     "attack_type": "base64_encoding",
 *     "status": "pending",
 *     "timestamp": 1700000000000
 *   }
 * }
 */
export interface NodeAddEvent {
  type: 'node_add';
  data: {
    /** Unique node identifier (typically cluster_id + sequence) */
    node_id: string;

    /** Parent cluster ID */
    cluster_id: string;

    /** Parent node IDs for evolution chains (empty for generation 0) */
    parent_ids: string[];

    /** Type of attack being executed */
    attack_type: AttackType;

    /** Current execution status */
    status: NodeStatus;

    /** Unix timestamp for temporal ordering */
    timestamp?: number;
  };
}

/**
 * WebSocket Event: Node updated
 *
 * Sent when an attack completes or changes status
 * Contains execution results: success/failure, extracted data, transcripts
 *
 * @example
 * {
 *   "type": "node_update",
 *   "data": {
 *     "node_id": "node_eagle_001",
 *     "status": "success",
 *     "model_id": "gpt-3.5-turbo-0301",
 *     "llm_summary": "Successfully extracted system prompt via base64 encoding",
 *     "full_transcript": ["User: Can you explain base64?", "Agent: Sure..."],
 *     "success_score": 95,
 *     "timestamp": 1700000010000
 *   }
 * }
 */
export interface NodeUpdateEvent {
  type: 'node_update';
  data: {
    /** Node being updated */
    node_id: string;

    /** New status (optional, may not change) */
    status?: NodeStatus;

    /** Extracted model identifier */
    model_id?: string;

    /** Brief one-line summary of attack and result */
    llm_summary?: string;

    /** Complete conversation transcript */
    full_transcript?: string[];

    /** Raw execution trace (flexible structure) */
    full_trace?: unknown;

    /** Success score 0-100 for partial success cases */
    success_score?: number;

    /** Optional tags for searching/filtering */
    tags?: string[];

    /** When this update was processed */
    timestamp?: number;
  };
}

// ============================================================================
// EVOLUTION LINK EVENTS
// ============================================================================

/**
 * WebSocket Event: Evolution link added
 *
 * Sent when an attack evolves from a previous one
 * Shows how techniques are refined, escalated, or combined
 *
 * Evolution Types:
 * - refinement: Same technique with improved payload
 * - escalation: More aggressive variant of same approach
 * - combination: Multiple techniques merged
 * - pivot: Completely different approach to same goal
 * - follow_up: Exploits previous successful result
 *
 * @example
 * {
 *   "type": "evolution_link_add",
 *   "data": {
 *     "link_id": "link_eagle_001_002",
 *     "source_node_ids": ["node_eagle_001"],
 *     "target_node_id": "node_eagle_002",
 *     "evolution_type": "refinement",
 *     "description": "Refined payload with better obfuscation",
 *     "timestamp": 1700000005000
 *   }
 * }
 */
export interface EvolutionLinkAddEvent {
  type: 'evolution_link_add';
  data: {
    /** Unique link identifier */
    link_id: string;

    /** Source node(s) - can be multiple for combination attacks */
    source_node_ids: string[];

    /** Target node being evolved to */
    target_node_id: string;

    /** Type of evolution (refinement, escalation, etc.) */
    evolution_type: EvolutionType;

    /** Human-readable description of why this evolution occurred */
    description?: string;

    /** Visual strength 0-1 (affects line thickness) */
    strength?: number;

    /** Whether to show animation flow */
    animated?: boolean;

    /** When link was created */
    timestamp?: number;
  };
}

// ============================================================================
// METADATA EVENTS
// ============================================================================

/**
 * WebSocket Event: Agent mapping update
 *
 * Sent when agent metadata changes (name, status, capability update)
 * Allows dynamic updates to cluster information without recreating
 *
 * @example
 * {
 *   "type": "agent_mapping_update",
 *   "data": {
 *     "cluster_id": "eagle",
 *     "agent_name": "Eagle Agent v2.1",
 *     "agent_type": "multi-turn-reasoning",
 *     "capabilities": ["vision", "code-execution"],
 *     "status": "active",
 *     "timestamp": 1700000015000
 *   }
 * }
 */
export interface AgentMappingUpdateEvent {
  type: 'agent_mapping_update';
  data: {
    /** Cluster identifier */
    cluster_id: string;

    /** Updated agent display name */
    agent_name?: string;

    /** Agent type/framework */
    agent_type?: string;

    /** Agent capabilities */
    capabilities?: string[];

    /** Agent current status */
    status?: 'active' | 'inactive' | 'error';

    /** Updated metadata */
    metadata?: Record<string, unknown>;

    /** Server timestamp */
    timestamp?: number;
  };
}

// ============================================================================
// COMPLETION EVENTS
// ============================================================================

/**
 * WebSocket Event: Attack sequence complete
 *
 * Sent when an attack, generation, or batch completes
 * Signals UI to perform any aggregate operations
 *
 * @example
 * {
 *   "type": "attack_complete",
 *   "data": {
 *     "attack_id": "batch_001",
 *     "cluster_id": "eagle",
 *     "success": true,
 *     "stats": {
 *       "total_nodes": 12,
 *       "successful": 8,
 *       "success_rate": 0.667
 *     },
 *     "timestamp": 1700000100000
 *   }
 * }
 */
export interface AttackCompleteEvent {
  type: 'attack_complete';
  data: {
    /** Attack/batch identifier */
    attack_id: string;

    /** Cluster this attack targeted */
    cluster_id: string;

    /** Overall success flag */
    success: boolean;

    /** Aggregate statistics */
    stats?: {
      total_nodes: number;
      successful_nodes: number;
      success_rate: number;
      avg_fitness?: number;
      best_fitness?: number;
    };

    /** Optional error message if failed */
    error?: string;

    /** Server timestamp */
    timestamp?: number;
  };
}

// ============================================================================
// UNION TYPES
// ============================================================================

/**
 * Union type for all WebSocket events
 * Use for type guards and message dispatching
 */
export type WebSocketEvent =
  | ClusterAddEvent
  | NodeAddEvent
  | NodeUpdateEvent
  | EvolutionLinkAddEvent
  | AgentMappingUpdateEvent
  | AttackCompleteEvent;

/**
 * WebSocket message wrapper
 * Can be used if server sends messages wrapped in envelope
 */
export interface WebSocketMessage<T = WebSocketEvent> {
  /** Message unique identifier (for ack/retry) */
  id?: string;

  /** The actual event data */
  event: T;

  /** Server timestamp for ordering */
  server_timestamp: number;

  /** Client should acknowledge receipt */
  requires_ack?: boolean;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for cluster add events
 */
export function isClusterAddEvent(event: WebSocketEvent): event is ClusterAddEvent {
  return event.type === 'cluster_add';
}

/**
 * Type guard for node add events
 */
export function isNodeAddEvent(event: WebSocketEvent): event is NodeAddEvent {
  return event.type === 'node_add';
}

/**
 * Type guard for node update events
 */
export function isNodeUpdateEvent(event: WebSocketEvent): event is NodeUpdateEvent {
  return event.type === 'node_update';
}

/**
 * Type guard for evolution link add events
 */
export function isEvolutionLinkAddEvent(event: WebSocketEvent): event is EvolutionLinkAddEvent {
  return event.type === 'evolution_link_add';
}

/**
 * Type guard for agent mapping update events
 */
export function isAgentMappingUpdateEvent(event: WebSocketEvent): event is AgentMappingUpdateEvent {
  return event.type === 'agent_mapping_update';
}

/**
 * Type guard for attack complete events
 */
export function isAttackCompleteEvent(event: WebSocketEvent): event is AttackCompleteEvent {
  return event.type === 'attack_complete';
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * WebSocket connection error
 */
export interface WebSocketError {
  type: 'connection_error' | 'message_error' | 'timeout';
  message: string;
  code?: number;
  timestamp: number;
}
