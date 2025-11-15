/**
 * ============================================================================
 * TYPE DEFINITIONS EXPORT
 * ============================================================================
 *
 * Central export point for all type definitions used in the dashboard
 * Organizes types into logical modules for easy importing
 *
 * Usage:
 * import {
 *   GraphNode, GraphState, NodeStatus,
 *   WebSocketEvent, ClusterAddEvent,
 *   StartAttackRequest, AttackResults
 * } from '@/types';
 */

// ============================================================================
// GRAPH TYPES
// ============================================================================

export type {
  // Primitive Types
  Position,
  Velocity,

  // Enums
  NodeStatus,
  AttackType,
  EvolutionType,
  RenderLayer,

  // Node Types
  GraphNode,
  NodeLayout,

  // Cluster Types
  GraphCluster,

  // Link Types
  EvolutionLink,
  GraphEdge,

  // State Types
  GraphState,
  SerializableGraphState,

  // Query Types
  NodeFilter,
  NodeDetail,
  GraphStats,

  // Layout Types
  ForceLayoutConfig,
  NodeRenderState,

  // Helper Types
  GraphUpdate,
  GraphExport,

  // Viewport
  Viewport
} from './graph';

export { DEFAULT_LAYOUT_CONFIG } from './graph';

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export type {
  // Event Types
  ClusterAddEvent,
  NodeAddEvent,
  NodeUpdateEvent,
  EvolutionLinkAddEvent,
  AgentMappingUpdateEvent,
  AttackCompleteEvent,

  // Union Types
  WebSocketEvent,
  WebSocketMessage,

  // Error Types
  WebSocketError
};

export {
  // Type Guards
  isClusterAddEvent,
  isNodeAddEvent,
  isNodeUpdateEvent,
  isEvolutionLinkAddEvent,
  isAgentMappingUpdateEvent,
  isAttackCompleteEvent
} from './websocket';

// ============================================================================
// API TYPES
// ============================================================================

export type {
  // Attack Initiation
  StartAttackRequest,
  AttackTarget,
  AttackConfig,
  StartAttackResponse,

  // Status Polling
  AttackStatusResponse,

  // Results
  AttackResults,
  CampaignMetadata,
  AttackSummary,
  ClusterResults,
  Vulnerability,
  Payload,
  AttackNode,
  AttackLink,
  AttackMetrics,

  // Pagination
  PaginatedResults,

  // Errors
  ApiError,

  // Export
  ExportFormat,
  ExportRequest,
  ExportResponse,

  // Batch Operations
  BatchAttackRequest,
  BatchAttackResponse
} from './api';

// Export enum separately (not as type-only export)
export { AttackStatus } from './api';

// ============================================================================
// TYPE ALIASES FOR CONVENIENCE
// ============================================================================

/**
 * Convenience alias: Node + its metadata
 */
export type NodeWithLayout = [GraphNode, NodeLayout];

/**
 * Convenience alias: Complete graph snapshot
 */
export type GraphSnapshot = {
  state: GraphState;
  timestamp: number;
  version: string;
};

/**
 * Convenience alias: Attack in progress
 */
export type ActiveAttack = {
  id: string;
  status: AttackStatus;
  progress: {
    current_generation: number;
    total_generations: number;
    percentage: number;
  };
};

// ============================================================================
// UTILITY TYPE FUNCTIONS
// ============================================================================

/**
 * Extract node data without layout info
 */
export type WithoutLayout<T extends { layout?: any }> = Omit<T, 'layout'>;

/**
 * Mark all fields as optional
 */
export type Partial<T> = {
  [K in keyof T]?: T[K];
};

/**
 * Mark all fields as required
 */
export type Required<T> = {
  [K in keyof T]-?: T[K];
};

/**
 * Extract keys of specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
