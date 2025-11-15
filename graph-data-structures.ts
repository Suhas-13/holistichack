/**
 * ============================================================================
 * REAL-TIME GRAPH VISUALIZATION DATA STRUCTURES
 * ============================================================================
 *
 * Purpose: Efficiently manage real-time clustering/graph visualization
 * Performance Target: 200-300 nodes with smooth rendering
 * Use Case: Red team attack evolution visualization
 *
 * Design Principles:
 * 1. O(1) lookups using Map-based indexing
 * 2. Immutable updates for React state management
 * 3. Normalized data structure to avoid duplication
 * 4. Efficient graph traversal for force-directed layouts
 * 5. Separate computed state (layout) from source data
 */

// ============================================================================
// CORE DATA TYPES
// ============================================================================

/**
 * Position in 2D space (for graph layout)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Velocity for physics simulation (force-directed layout)
 */
export interface Velocity {
  vx: number;
  vy: number;
}

/**
 * Node status representing attack outcome
 */
export enum NodeStatus {
  PENDING = 'pending',           // Attack queued but not executed
  IN_PROGRESS = 'in_progress',   // Currently executing
  SUCCESS = 'success',            // Attack succeeded
  PARTIAL = 'partial',            // Partial success
  FAILED = 'failed',              // Attack failed
  ERROR = 'error'                 // Execution error
}

/**
 * Attack types from red teaming
 */
export enum AttackType {
  BASE64_ENCODING = 'base64_encoding',
  ROLE_PLAY = 'role_play',
  JAILBREAK = 'jailbreak',
  PROMPT_INJECTION = 'prompt_injection',
  MODEL_EXTRACTION = 'model_extraction',
  SYSTEM_PROMPT_LEAK = 'system_prompt_leak',
  FUNCTION_ENUMERATION = 'function_enumeration',
  ERROR_EXPLOITATION = 'error_exploitation',
  UNICODE_BYPASS = 'unicode_bypass',
  MULTI_TURN = 'multi_turn'
}

/**
 * Evolution link types showing attack progression
 */
export enum EvolutionType {
  REFINEMENT = 'refinement',      // Same technique, refined payload
  ESCALATION = 'escalation',      // More aggressive variant
  COMBINATION = 'combination',    // Combines multiple techniques
  PIVOT = 'pivot',                // Different approach to same goal
  FOLLOW_UP = 'follow_up'         // Exploits previous success
}

// ============================================================================
// NODE STRUCTURE
// ============================================================================

/**
 * Core node data (immutable source of truth)
 */
export interface GraphNode {
  // Identity
  node_id: string;
  cluster_id: string;

  // Hierarchy
  parent_ids: string[];           // For tree-like evolution chains

  // Attack metadata
  attack_type: AttackType;
  status: NodeStatus;
  timestamp: number;              // Unix timestamp for temporal ordering

  // Attack details (populated on update)
  model_id?: string;              // Extracted model (e.g., "gpt-3.5-turbo")
  llm_summary?: string;           // Brief attack summary
  full_transcript?: string[];     // Complete conversation log
  full_trace?: unknown;           // Raw trace data (flexible type)

  // Computed metadata
  success_score?: number;         // 0-100 score for partial success
  tags?: string[];                // Searchable tags
}

/**
 * Node layout state (mutable, separate from core data)
 * This is recomputed by the physics simulation
 */
export interface NodeLayout {
  node_id: string;
  position: Position;
  velocity: Velocity;
  fixed: boolean;                 // Pin node in place

  // Visual properties
  radius: number;                 // Node size (based on importance)
  color?: string;                 // Override cluster color
  highlight: boolean;             // Currently selected/hovered
}

// ============================================================================
// CLUSTER STRUCTURE
// ============================================================================

/**
 * Cluster (group of related nodes)
 * Represents each AI agent being attacked
 */
export interface GraphCluster {
  cluster_id: string;
  name: string;                   // e.g., "Eagle", "Wolf"

  // Visual hints
  position_hint: Position;        // Suggested center position
  color: string;                  // Cluster color theme

  // Metadata
  agent_type?: string;            // Agent framework
  total_attacks?: number;         // Stats
  successful_attacks?: number;

  // UI state
  collapsed: boolean;             // Minimize cluster in view
  visible: boolean;               // Show/hide cluster
}

// ============================================================================
// EVOLUTION LINK STRUCTURE
// ============================================================================

/**
 * Directed edge showing attack evolution
 */
export interface EvolutionLink {
  link_id: string;
  source_node_ids: string[];      // Can have multiple sources (combination)
  target_node_id: string;
  evolution_type: EvolutionType;

  // Metadata
  timestamp: number;
  description?: string;           // Why this evolution occurred

  // Visual properties
  strength?: number;              // 0-1, affects line thickness
  animated?: boolean;             // Show flow animation
}

// ============================================================================
// GRAPH STATE (PRIMARY DATA STRUCTURE)
// ============================================================================

/**
 * Main graph state using Maps for O(1) lookups
 * This is the single source of truth for graph data
 */
export interface GraphState {
  // Core data (normalized)
  nodes: Map<string, GraphNode>;
  clusters: Map<string, GraphCluster>;
  links: Map<string, EvolutionLink>;

  // Indexing for fast queries
  nodesByCluster: Map<string, Set<string>>;     // cluster_id -> node_ids
  nodesByParent: Map<string, Set<string>>;      // parent_id -> child_ids
  linksBySource: Map<string, Set<string>>;      // node_id -> outgoing link_ids
  linksByTarget: Map<string, Set<string>>;      // node_id -> incoming link_ids

  // Layout state (separate from core data)
  layout: Map<string, NodeLayout>;

  // Selection/UI state
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  // Metadata
  lastUpdateTimestamp: number;
  totalUpdates: number;
}

/**
 * Serializable state for persistence/network transfer
 */
export interface SerializableGraphState {
  nodes: GraphNode[];
  clusters: GraphCluster[];
  links: EvolutionLink[];
  layout: NodeLayout[];
  selectedNodeId: string | null;
  timestamp: number;
}

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================

/**
 * WebSocket event: Add new cluster
 */
export interface ClusterAddEvent {
  type: 'cluster_add';
  data: {
    cluster_id: string;
    name: string;
    position_hint: Position;
    color?: string;
  };
}

/**
 * WebSocket event: Add new node
 */
export interface NodeAddEvent {
  type: 'node_add';
  data: {
    node_id: string;
    cluster_id: string;
    parent_ids: string[];
    attack_type: AttackType;
    status: NodeStatus;
    timestamp?: number;
  };
}

/**
 * WebSocket event: Update node data
 */
export interface NodeUpdateEvent {
  type: 'node_update';
  data: {
    node_id: string;
    status?: NodeStatus;
    model_id?: string;
    llm_summary?: string;
    full_transcript?: string[];
    full_trace?: unknown;
    success_score?: number;
  };
}

/**
 * WebSocket event: Add evolution link
 */
export interface EvolutionLinkAddEvent {
  type: 'evolution_link_add';
  data: {
    link_id: string;
    source_node_ids: string[];
    target_node_id: string;
    evolution_type: EvolutionType;
    description?: string;
    timestamp?: number;
  };
}

/**
 * Union type for all WebSocket events
 */
export type GraphWebSocketEvent =
  | ClusterAddEvent
  | NodeAddEvent
  | NodeUpdateEvent
  | EvolutionLinkAddEvent;

// ============================================================================
// HELPER TYPES FOR QUERIES
// ============================================================================

/**
 * Filter criteria for node queries
 */
export interface NodeFilter {
  cluster_ids?: string[];
  attack_types?: AttackType[];
  statuses?: NodeStatus[];
  min_timestamp?: number;
  max_timestamp?: number;
  has_model_id?: boolean;
  search_text?: string;
}

/**
 * Result for node detail queries
 */
export interface NodeDetail extends GraphNode {
  cluster: GraphCluster;
  parents: GraphNode[];
  children: GraphNode[];
  incoming_links: EvolutionLink[];
  outgoing_links: EvolutionLink[];
  layout: NodeLayout;
}

/**
 * Statistics for dashboard
 */
export interface GraphStats {
  total_nodes: number;
  total_clusters: number;
  total_links: number;
  nodes_by_status: Record<NodeStatus, number>;
  nodes_by_attack_type: Record<AttackType, number>;
  success_rate: number;
  avg_evolution_depth: number;
}

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

/**
 * Force-directed layout parameters
 */
export interface ForceLayoutConfig {
  // Physics parameters
  charge_strength: number;          // Node repulsion (-100 typical)
  link_distance: number;            // Ideal edge length (100-150)
  link_strength: number;            // Edge rigidity (0-1)

  // Clustering
  cluster_charge: number;           // Inter-cluster repulsion
  cluster_padding: number;          // Space between clusters

  // Simulation
  alpha: number;                    // Initial energy (1.0)
  alpha_decay: number;              // Cooling rate (0.02-0.05)
  alpha_min: number;                // Stop threshold (0.001)
  velocity_decay: number;           // Friction (0.4-0.7)

  // Constraints
  center_force: number;             // Pull toward center (0.1)
  bounds?: {                        // Optional boundary box
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  };
}

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT_CONFIG: ForceLayoutConfig = {
  charge_strength: -150,
  link_distance: 120,
  link_strength: 0.7,
  cluster_charge: -300,
  cluster_padding: 50,
  alpha: 1.0,
  alpha_decay: 0.03,
  alpha_min: 0.001,
  velocity_decay: 0.6,
  center_force: 0.05
};

// ============================================================================
// PERFORMANCE OPTIMIZATION TYPES
// ============================================================================

/**
 * Viewport bounds for culling off-screen nodes
 */
export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

/**
 * Render layer for LOD (Level of Detail)
 */
export enum RenderLayer {
  FULL = 'full',           // Full detail (labels, etc.)
  SIMPLIFIED = 'simplified', // Just shapes, no labels
  CULLED = 'culled'        // Off-screen, skip rendering
}

/**
 * Node render state for optimization
 */
export interface NodeRenderState {
  node_id: string;
  layer: RenderLayer;
  screen_position: Position;
  visible: boolean;
}

export default GraphState;
