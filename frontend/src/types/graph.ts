/**
 * ============================================================================
 * GRAPH DATA STRUCTURES
 * ============================================================================
 *
 * Core data structures for red-teaming dashboard graph visualization
 * Optimized for 200-300 nodes with O(1) lookups using Map-based indexing
 *
 * Design Principles:
 * - Maps for O(1) lookups by ID
 * - Normalized data structure to avoid duplication
 * - Immutable updates for React state compatibility
 * - Separated layout state from core data
 * - Comprehensive indexing for efficient graph traversal
 */

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

/**
 * 2D coordinates for node positions
 */
export interface Position {
  /** X coordinate in pixels */
  x: number;

  /** Y coordinate in pixels */
  y: number;
}

/**
 * Velocity vector for physics simulation
 */
export interface Velocity {
  /** X velocity component */
  vx: number;

  /** Y velocity component */
  vy: number;
}

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Node status representing attack execution state
 *
 * State Transitions:
 * pending -> in_progress -> (success | partial | failed | error)
 */
export enum NodeStatus {
  /** Attack queued but not yet executed */
  PENDING = 'pending',

  /** Currently executing */
  IN_PROGRESS = 'in_progress',

  /** Attack succeeded completely */
  SUCCESS = 'success',

  /** Partial success (partial extraction) */
  PARTIAL = 'partial',

  /** Attack failed completely */
  FAILED = 'failed',

  /** Execution encountered an error */
  ERROR = 'error'
}

/**
 * Red teaming attack types
 * Represents different jailbreak/extraction techniques
 */
export enum AttackType {
  /** Base64 encoding payload */
  BASE64_ENCODING = 'base64_encoding',

  /** Role-play based jailbreak */
  ROLE_PLAY = 'role_play',

  /** Generic jailbreak technique */
  JAILBREAK = 'jailbreak',

  /** Prompt injection attack */
  PROMPT_INJECTION = 'prompt_injection',

  /** Model extraction attack */
  MODEL_EXTRACTION = 'model_extraction',

  /** System prompt leak attack */
  SYSTEM_PROMPT_LEAK = 'system_prompt_leak',

  /** Function/API enumeration */
  FUNCTION_ENUMERATION = 'function_enumeration',

  /** Error exploitation attack */
  ERROR_EXPLOITATION = 'error_exploitation',

  /** Unicode bypass technique */
  UNICODE_BYPASS = 'unicode_bypass',

  /** Multi-turn conversation attack */
  MULTI_TURN = 'multi_turn'
}

/**
 * How one attack evolves to another
 */
export enum EvolutionType {
  /** Same technique with refined payload */
  REFINEMENT = 'refinement',

  /** More aggressive variant of same technique */
  ESCALATION = 'escalation',

  /** Multiple techniques combined */
  COMBINATION = 'combination',

  /** Different approach to same goal */
  PIVOT = 'pivot',

  /** Exploits results from previous success */
  FOLLOW_UP = 'follow_up'
}

/**
 * Rendering detail level for optimization
 */
export enum RenderLayer {
  /** Full detail: labels, icons, effects */
  FULL = 'full',

  /** Simplified: just shapes and colors */
  SIMPLIFIED = 'simplified',

  /** Culled: outside viewport, skip rendering */
  CULLED = 'culled'
}

// ============================================================================
// NODE STRUCTURES
// ============================================================================

/**
 * Core graph node - immutable source of truth
 *
 * Represents a single attack attempt against an agent
 * Immutable data, layout is computed separately
 *
 * @example
 * {
 *   "node_id": "node_eagle_001",
 *   "cluster_id": "eagle",
 *   "parent_ids": [],
 *   "attack_type": "base64_encoding",
 *   "status": "success",
 *   "timestamp": 1700000000000,
 *   "model_id": "gpt-3.5-turbo-0301",
 *   "llm_summary": "Successfully extracted system prompt",
 *   "success_score": 100
 * }
 */
export interface GraphNode {
  // Identity & Hierarchy
  /** Unique node identifier */
  node_id: string;

  /** Parent cluster (agent being attacked) */
  cluster_id: string;

  /** Parent node IDs for evolution chains */
  parent_ids: string[];

  // Attack Metadata
  /** Type of attack being executed */
  attack_type: AttackType;

  /** Current execution status */
  status: NodeStatus;

  /** Unix timestamp for temporal ordering */
  timestamp: number;

  // Execution Results (populated on update)
  /** Extracted model identifier (e.g., "gpt-3.5-turbo-0301") */
  model_id?: string;

  /** Brief one-line summary of attack and result */
  llm_summary?: string;

  /** Complete conversation transcript */
  full_transcript?: string[];

  /** Raw execution trace data */
  full_trace?: unknown;

  /** Success score 0-100 for partial success */
  success_score?: number;

  /** Searchable metadata tags */
  tags?: string[];
}

/**
 * Node layout state - mutable, computed by physics engine
 *
 * Separate from core node data to enable:
 * - Physics simulation in WebWorker
 * - Efficient React updates (no core data changes per physics tick)
 * - Easy reset/recalculation
 *
 * @example
 * {
 *   "node_id": "node_eagle_001",
 *   "position": { "x": 250, "y": 300 },
 *   "velocity": { "vx": 1.5, "vy": -0.8 },
 *   "fixed": false,
 *   "radius": 12,
 *   "highlight": false
 * }
 */
export interface NodeLayout {
  /** References corresponding GraphNode */
  node_id: string;

  /** Current 2D position */
  position: Position;

  /** Current velocity for physics simulation */
  velocity: Velocity;

  /** If true, node is pinned and won't move */
  fixed: boolean;

  // Visual Properties
  /** Node radius in pixels (based on importance/success) */
  radius: number;

  /** Override cluster color */
  color?: string;

  /** Currently selected or hovered */
  highlight: boolean;
}

// ============================================================================
// CLUSTER STRUCTURES
// ============================================================================

/**
 * Cluster - group of nodes targeting same agent
 *
 * Represents one AI agent being attacked
 * Provides visual grouping and aggregate statistics
 *
 * @example
 * {
 *   "cluster_id": "eagle",
 *   "name": "Eagle Agent",
 *   "position_hint": { "x": 200, "y": 300 },
 *   "color": "#FF6B6B",
 *   "total_attacks": 50,
 *   "successful_attacks": 35,
 *   "collapsed": false,
 *   "visible": true
 * }
 */
export interface GraphCluster {
  /** Unique cluster identifier */
  cluster_id: string;

  /** Display name (e.g., "Eagle", "Wolf", "Phoenix") */
  name: string;

  // Visual Properties
  /** Suggested center position for layout algorithm */
  position_hint: Position;

  /** Hex color for visual distinction */
  color: string;

  // Metadata
  /** Agent type/framework */
  agent_type?: string;

  /** Total attack attempts against this agent */
  total_attacks?: number;

  /** Successful attacks count */
  successful_attacks?: number;

  // UI State
  /** If true, cluster is minimized in visualization */
  collapsed: boolean;

  /** If true, cluster is shown in visualization */
  visible: boolean;
}

// ============================================================================
// EDGE/LINK STRUCTURES
// ============================================================================

/**
 * Directed edge showing attack evolution
 *
 * Represents how one attack evolves to another:
 * - Refinement: same technique, better payload
 * - Escalation: more aggressive variant
 * - Combination: multiple techniques merged
 * - Pivot: different approach
 * - Follow-up: exploits previous success
 *
 * @example
 * {
 *   "link_id": "link_eagle_001_002",
 *   "source_node_ids": ["node_eagle_001"],
 *   "target_node_id": "node_eagle_002",
 *   "evolution_type": "refinement",
 *   "description": "Refined payload with better obfuscation",
 *   "strength": 0.8,
 *   "animated": true,
 *   "timestamp": 1700000005000
 * }
 */
export interface EvolutionLink {
  /** Unique link identifier */
  link_id: string;

  /** Source node(s) - can be multiple for combination attacks */
  source_node_ids: string[];

  /** Target node being evolved to */
  target_node_id: string;

  /** Type of evolution relationship */
  evolution_type: EvolutionType;

  // Metadata
  /** Server timestamp when link was created */
  timestamp: number;

  /** Human-readable description of evolution */
  description?: string;

  // Visual Properties
  /** Visual strength 0-1 (affects line thickness) */
  strength?: number;

  /** Show flow animation on this link */
  animated?: boolean;
}

// ============================================================================
// GRAPH STATE
// ============================================================================

/**
 * Main graph state - normalized, map-based structure
 *
 * Single source of truth for all graph data
 * Uses Maps for O(1) lookups
 * Includes multiple indices for efficient queries
 *
 * Storage: ~25-30MB for 300 nodes
 * Update time: 1-3ms per event
 * Query time: < 0.1ms for O(1) lookups
 *
 * @example
 * {
 *   "nodes": Map { "node_eagle_001" => {...}, ... },
 *   "clusters": Map { "eagle" => {...}, ... },
 *   "links": Map { "link_eagle_001_002" => {...}, ... },
 *   "layout": Map { "node_eagle_001" => {...}, ... },
 *   "nodesByCluster": Map { "eagle" => Set["node_eagle_001", ...] },
 *   "selectedNodeId": "node_eagle_001",
 *   "lastUpdateTimestamp": 1700000010000,
 *   "totalUpdates": 127
 * }
 */
export interface GraphState {
  // Core Data (normalized)
  /** All nodes indexed by node_id: O(1) lookup */
  nodes: Map<string, GraphNode>;

  /** All clusters indexed by cluster_id: O(1) lookup */
  clusters: Map<string, GraphCluster>;

  /** All links indexed by link_id: O(1) lookup */
  links: Map<string, EvolutionLink>;

  // Indices for Efficient Queries
  /** cluster_id -> Set<node_id>: find all nodes in cluster */
  nodesByCluster: Map<string, Set<string>>;

  /** parent_id -> Set<node_id>: find all children of a node */
  nodesByParent: Map<string, Set<string>>;

  /** source_node_id -> Set<link_id>: find all outgoing links */
  linksBySource: Map<string, Set<string>>;

  /** target_node_id -> Set<link_id>: find all incoming links */
  linksByTarget: Map<string, Set<string>>;

  // Layout State (computed, mutable)
  /** node_id -> NodeLayout: positions computed by physics engine */
  layout: Map<string, NodeLayout>;

  // UI State
  /** Currently selected node, null if none */
  selectedNodeId: string | null;

  /** Currently hovered node, null if none */
  hoveredNodeId: string | null;

  // Metadata
  /** Timestamp of last state update */
  lastUpdateTimestamp: number;

  /** Total number of updates applied */
  totalUpdates: number;
}

/**
 * Serializable version of GraphState for persistence/networking
 * Uses arrays instead of Maps for JSON compatibility
 */
export interface SerializableGraphState {
  /** Array of all nodes */
  nodes: GraphNode[];

  /** Array of all clusters */
  clusters: GraphCluster[];

  /** Array of all links */
  links: EvolutionLink[];

  /** Array of all layouts */
  layout: NodeLayout[];

  /** Currently selected node */
  selectedNodeId: string | null;

  /** State snapshot timestamp */
  timestamp: number;
}

// ============================================================================
// QUERY RESULT TYPES
// ============================================================================

/**
 * Filter criteria for node queries
 */
export interface NodeFilter {
  /** Filter by cluster IDs */
  cluster_ids?: string[];

  /** Filter by attack types */
  attack_types?: AttackType[];

  /** Filter by node statuses */
  statuses?: NodeStatus[];

  /** Only nodes with timestamp >= this value */
  min_timestamp?: number;

  /** Only nodes with timestamp <= this value */
  max_timestamp?: number;

  /** Only nodes with extracted model_id */
  has_model_id?: boolean;

  /** Text search in summary and tags */
  search_text?: string;
}

/**
 * Complete node detail result
 *
 * Includes the node plus all related data:
 * - Cluster info
 * - Parent/child nodes
 * - Incoming/outgoing evolution links
 * - Layout position
 */
export interface NodeDetail extends GraphNode {
  /** Cluster this node belongs to */
  cluster: GraphCluster;

  /** Direct parent nodes */
  parents: GraphNode[];

  /** Direct child nodes */
  children: GraphNode[];

  /** Incoming evolution links */
  incoming_links: EvolutionLink[];

  /** Outgoing evolution links */
  outgoing_links: EvolutionLink[];

  /** Current position and visual state */
  layout: NodeLayout;
}

/**
 * Aggregate graph statistics
 *
 * For dashboard metrics and summaries
 */
export interface GraphStats {
  /** Total number of nodes */
  total_nodes: number;

  /** Total number of clusters */
  total_clusters: number;

  /** Total number of evolution links */
  total_links: number;

  /** Count of nodes in each status */
  nodes_by_status: Record<NodeStatus, number>;

  /** Count of nodes by attack type */
  nodes_by_attack_type: Record<AttackType, number>;

  /** Percentage of successful attacks */
  success_rate: number;

  /** Average depth of evolution chains */
  avg_evolution_depth: number;
}

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

/**
 * Force-directed layout algorithm parameters
 *
 * Configures the physics simulation that positions nodes
 * Fine-tune these for different graph topologies
 */
export interface ForceLayoutConfig {
  // Physics Parameters
  /** Node charge strength: negative = repulsion (-100 to -300) */
  charge_strength: number;

  /** Ideal edge length in pixels (100-150 typical) */
  link_distance: number;

  /** Edge spring stiffness: 0-1, higher = stiffer */
  link_strength: number;

  // Clustering Forces
  /** Charge strength between clusters (more negative = more separation) */
  cluster_charge: number;

  /** Padding between clusters in pixels */
  cluster_padding: number;

  // Simulation Parameters
  /** Initial energy (1.0) */
  alpha: number;

  /** Cooling rate per iteration (0.02-0.05) */
  alpha_decay: number;

  /** Energy threshold to stop simulation (0.001) */
  alpha_min: number;

  /** Velocity damping/friction (0.4-0.7) */
  velocity_decay: number;

  // Constraints
  /** Pull toward center force strength (0.05-0.1) */
  center_force: number;

  /** Optional boundary box to constrain nodes */
  bounds?: {
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  };
}

/**
 * Default force-directed layout configuration
 *
 * Tuned for 200-300 nodes with cluster grouping
 * Provides good balance of performance and aesthetics
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
// VIEWPORT & RENDERING
// ============================================================================

/**
 * Viewport bounds for culling and rendering optimization
 *
 * Used to determine which nodes are visible and should be rendered
 */
export interface Viewport {
  /** Top-left X coordinate */
  x: number;

  /** Top-left Y coordinate */
  y: number;

  /** Viewport width in pixels */
  width: number;

  /** Viewport height in pixels */
  height: number;

  /** Zoom scale factor (1.0 = 100%) */
  scale: number;
}

/**
 * Node render state for LOD and optimization
 *
 * Determines which rendering path to use for each node
 */
export interface NodeRenderState {
  /** Node being evaluated */
  node_id: string;

  /** Rendering detail level */
  layer: RenderLayer;

  /** Position on screen */
  screen_position: Position;

  /** Whether to render at all */
  visible: boolean;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Graph update event from state mutations
 *
 * Used internally for tracking changes
 */
export interface GraphUpdate {
  /** Type of change */
  type: 'node_added' | 'node_updated' | 'link_added' | 'cluster_added';

  /** ID of affected element */
  element_id: string;

  /** Timestamp of change */
  timestamp: number;
}

/**
 * Graph export format
 *
 * For saving/sharing graph state
 */
export interface GraphExport {
  /** Metadata */
  version: string;
  timestamp: number;
  description?: string;

  /** Graph data */
  state: SerializableGraphState;

  /** Statistics */
  stats: GraphStats;
}
