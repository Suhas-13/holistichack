/**
 * ============================================================================
 * REST API TYPES
 * ============================================================================
 *
 * Type definitions for REST API endpoints
 * Handles request/response payloads for attack management
 *
 * Endpoints:
 * - POST /api/attacks/start - Start new attack campaign
 * - GET /api/attacks/{id}/results - Fetch attack results
 * - GET /api/attacks/{id}/status - Poll attack status
 */

import { AttackType, NodeStatus, EvolutionType } from './graph';

// ============================================================================
// ATTACK INITIATION
// ============================================================================

/**
 * Request to start a new attack campaign
 *
 * POST /api/attacks/start
 * Content-Type: application/json
 *
 * @example
 * {
 *   "targets": [
 *     {
 *       "agent_id": "eagle",
 *       "agent_name": "Eagle Agent",
 *       "endpoint": "https://api.example.com/chat"
 *     }
 *   ],
 *   "attack_types": ["base64_encoding", "role_play"],
 *   "population_size": 50,
 *   "generations": 20,
 *   "config": {
 *     "timeout": 30000,
 *     "max_retries": 3
 *   }
 * }
 */
export interface StartAttackRequest {
  /** Target agents to attack */
  targets: AttackTarget[];

  /** Attack types to use */
  attack_types: AttackType[];

  /** Evolutionary algorithm parameters */
  population_size: number;
  generations: number;

  /** Optional execution configuration */
  config?: AttackConfig;

  /** Optional metadata */
  metadata?: {
    campaign_name?: string;
    operator?: string;
    notes?: string;
  };
}

/**
 * Configuration for target agent
 */
export interface AttackTarget {
  /** Unique agent identifier */
  agent_id: string;

  /** Display name */
  agent_name: string;

  /** API endpoint URL */
  endpoint: string;

  /** Optional API key for authentication */
  api_key?: string;

  /** Optional model override (e.g., "gpt-4") */
  model?: string;

  /** Optional custom parameters */
  parameters?: Record<string, unknown>;
}

/**
 * Execution configuration for attack campaign
 */
export interface AttackConfig {
  /** Request timeout in milliseconds */
  timeout?: number;

  /** Maximum retries on failure */
  max_retries?: number;

  /** Delay between requests in milliseconds */
  request_delay?: number;

  /** Whether to continue on individual failures */
  continue_on_error?: boolean;

  /** Maximum concurrent requests */
  concurrency?: number;

  /** Whether to save transcripts */
  save_transcripts?: boolean;

  /** Random seed for reproducibility */
  random_seed?: number;
}

/**
 * Response from starting an attack
 *
 * HTTP 202 Accepted
 * Returns campaign ID and WebSocket connection details
 *
 * @example
 * {
 *   "attack_id": "atk_67890abc",
 *   "status": "queued",
 *   "websocket_url": "ws://localhost:8000/attacks/atk_67890abc",
 *   "created_at": "2024-11-15T10:30:00Z",
 *   "estimated_completion": "2024-11-15T11:30:00Z"
 * }
 */
export interface StartAttackResponse {
  /** Unique attack campaign identifier */
  attack_id: string;

  /** Current campaign status */
  status: AttackStatus;

  /** WebSocket URL for real-time updates */
  websocket_url: string;

  /** ISO timestamp of creation */
  created_at: string;

  /** Estimated completion time */
  estimated_completion?: string;

  /** Job queue position */
  queue_position?: number;

  /** Optional error message */
  error?: string;
}

/**
 * Attack campaign status enum
 */
export enum AttackStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// ============================================================================
// ATTACK STATUS POLLING
// ============================================================================

/**
 * Response when checking attack status
 *
 * GET /api/attacks/{attack_id}/status
 * HTTP 200 OK
 */
export interface AttackStatusResponse {
  /** Attack ID */
  attack_id: string;

  /** Current status */
  status: AttackStatus;

  /** Progress information */
  progress: {
    /** Current generation being processed */
    current_generation: number;

    /** Total generations planned */
    total_generations: number;

    /** Percentage complete 0-100 */
    percentage: number;

    /** Estimated seconds remaining */
    estimated_seconds_remaining?: number;
  };

  /** Execution statistics */
  stats: {
    /** Total nodes processed */
    nodes_processed: number;

    /** Successful attacks */
    successful: number;

    /** Success rate percentage */
    success_rate: number;

    /** Average fitness score */
    avg_fitness?: number;

    /** Best fitness achieved */
    best_fitness?: number;
  };

  /** Timestamp of last update */
  last_update: string;

  /** Any error encountered */
  error?: string;
}

// ============================================================================
// ATTACK RESULTS
// ============================================================================

/**
 * Complete results from finished attack campaign
 *
 * GET /api/attacks/{attack_id}/results
 * HTTP 200 OK
 *
 * Large responses may be paginated
 */
export interface AttackResults {
  /** Campaign metadata */
  campaign: CampaignMetadata;

  /** Summary statistics */
  summary: AttackSummary;

  /** Per-cluster results */
  clusters: ClusterResults[];

  /** All attack nodes (may be paginated) */
  nodes: AttackNode[];

  /** Evolution links */
  links: AttackLink[];

  /** Overall success metrics */
  metrics: AttackMetrics;

  /** Optional export configuration */
  export?: {
    format: 'json' | 'csv' | 'parquet';
    compressed: boolean;
  };
}

/**
 * Campaign metadata
 */
export interface CampaignMetadata {
  /** Unique campaign ID */
  attack_id: string;

  /** Campaign name */
  name?: string;

  /** Operator/researcher */
  operator?: string;

  /** Start timestamp */
  started_at: string;

  /** End timestamp */
  completed_at: string;

  /** Duration in seconds */
  duration_seconds: number;

  /** Campaign notes */
  notes?: string;
}

/**
 * High-level summary of campaign results
 */
export interface AttackSummary {
  /** Total attack attempts */
  total_attacks: number;

  /** Successful attacks */
  successful_attacks: number;

  /** Partial success attacks */
  partial_success_attacks: number;

  /** Failed attacks */
  failed_attacks: number;

  /** Overall success rate percentage */
  success_rate: number;

  /** Fitness distribution stats */
  fitness: {
    average: number;
    median: number;
    min: number;
    max: number;
    std_dev: number;
  };

  /** Evolution depth stats */
  evolution: {
    max_depth: number;
    avg_depth: number;
    num_chains: number;
  };

  /** Top performing attack types */
  top_attack_types: Array<{
    attack_type: AttackType;
    count: number;
    success_rate: number;
  }>;
}

/**
 * Results for single target agent
 */
export interface ClusterResults {
  /** Target agent ID */
  cluster_id: string;

  /** Agent display name */
  agent_name: string;

  /** Total attacks on this agent */
  total: number;

  /** Successful attacks */
  successful: number;

  /** Success rate */
  success_rate: number;

  /** Extracted model if found */
  extracted_model?: string;

  /** Vulnerabilities discovered */
  vulnerabilities: Vulnerability[];

  /** Best payloads */
  best_payloads: Payload[];
}

/**
 * Vulnerability discovered during attacks
 */
export interface Vulnerability {
  /** Vulnerability ID */
  id: string;

  /** Vulnerability type/name */
  type: string;

  /** Severity level */
  severity: 'critical' | 'high' | 'medium' | 'low';

  /** Description */
  description: string;

  /** Number of successful exploits */
  exploits_found: number;

  /** First discovered timestamp */
  discovered_at: string;

  /** Example successful attack node ID */
  example_node_id?: string;
}

/**
 * Successful attack payload
 */
export interface Payload {
  /** Payload content */
  content: string;

  /** Associated attack type */
  attack_type: AttackType;

  /** Success rate of this payload */
  success_rate: number;

  /** Number of successful uses */
  uses: number;

  /** Timestamp when first used successfully */
  first_used: string;
}

/**
 * Single attack node result
 */
export interface AttackNode {
  /** Unique node ID */
  node_id: string;

  /** Target agent cluster */
  cluster_id: string;

  /** Attack type used */
  attack_type: AttackType;

  /** Final status */
  status: NodeStatus;

  /** Fitness/success score */
  fitness: number;

  /** Generation number */
  generation: number;

  /** Parent node IDs */
  parent_ids: string[];

  // Results
  /** Extracted model ID */
  model_id?: string;

  /** Attack summary */
  summary: string;

  /** Conversation transcript */
  transcript: string[];

  /** Detailed analysis */
  analysis?: {
    success_reason?: string;
    failure_reason?: string;
    extracted_data?: Record<string, unknown>;
  };

  /** Execution timestamp */
  timestamp: string;
}

/**
 * Attack evolution link
 */
export interface AttackLink {
  /** Unique link ID */
  link_id: string;

  /** Source nodes */
  source_node_ids: string[];

  /** Target node */
  target_node_id: string;

  /** Evolution type */
  evolution_type: EvolutionType;

  /** Why this evolution occurred */
  description?: string;

  /** Link strength */
  strength: number;
}

/**
 * Comprehensive attack metrics
 */
export interface AttackMetrics {
  // Success Metrics
  /** Overall attack success rate */
  overall_success_rate: number;

  /** Rate of partial successes */
  partial_success_rate: number;

  /** Rate of critical failures */
  critical_failure_rate: number;

  // Effectiveness Metrics
  /** Number of unique vulnerabilities found */
  unique_vulnerabilities: number;

  /** Models extracted */
  models_extracted: number;

  /** System prompts leaked */
  system_prompts_leaked: number;

  // Evolution Metrics
  /** Deepest evolution chain */
  max_evolution_depth: number;

  /** Number of mutation chains */
  num_mutation_chains: number;

  /** Mutation success rate */
  mutation_effectiveness: number;

  // Coverage Metrics
  /** Number of attack types used */
  attack_types_used: number;

  /** Attack type effectiveness ranking */
  attack_type_rankings: Array<{
    type: AttackType;
    success_rate: number;
    count: number;
  }>;

  // Efficiency Metrics
  /** Average requests per successful attack */
  avg_requests_per_success: number;

  /** Total API requests made */
  total_requests: number;

  /** Campaign efficiency score */
  efficiency_score: number;
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Paginated results wrapper
 *
 * Used for large result sets
 */
export interface PaginatedResults<T> {
  /** Results for current page */
  data: T[];

  /** Pagination info */
  pagination: {
    /** Current page (1-indexed) */
    page: number;

    /** Results per page */
    page_size: number;

    /** Total results available */
    total: number;

    /** Total pages */
    total_pages: number;

    /** Whether more results available */
    has_next: boolean;
  };

  /** Links for navigation */
  links?: {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * Standard API error response
 *
 * HTTP error status codes
 */
export interface ApiError {
  /** HTTP status code */
  status: number;

  /** Error code for programmatic handling */
  code: string;

  /** Human-readable message */
  message: string;

  /** Additional details */
  details?: Record<string, unknown>;

  /** Request ID for support */
  request_id?: string;

  /** Timestamp */
  timestamp: string;
}

// ============================================================================
// EXPORT FORMATS
// ============================================================================

/**
 * Format for exporting results
 */
export type ExportFormat = 'json' | 'csv' | 'parquet';

/**
 * Export request
 */
export interface ExportRequest {
  /** Attack ID to export */
  attack_id: string;

  /** Export format */
  format: ExportFormat;

  /** Whether to compress */
  compress?: boolean;

  /** Optional filters */
  filters?: {
    status?: NodeStatus[];
    attack_types?: AttackType[];
  };
}

/**
 * Export response
 */
export interface ExportResponse {
  /** Download URL (valid for 24 hours) */
  download_url: string;

  /** File size in bytes */
  file_size: number;

  /** File format */
  format: ExportFormat;

  /** Expiration time */
  expires_at: string;

  /** Optional checksum for verification */
  checksum?: string;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Batch attack request
 *
 * Start multiple attack campaigns at once
 */
export interface BatchAttackRequest {
  /** Multiple attack configurations */
  campaigns: Array<{
    name: string;
    request: StartAttackRequest;
  }>;

  /** Whether to run sequentially or parallel */
  parallel?: boolean;
}

/**
 * Batch attack response
 */
export interface BatchAttackResponse {
  /** Batch ID */
  batch_id: string;

  /** Status of each campaign */
  campaigns: Array<{
    name: string;
    attack_id: string;
    status: AttackStatus;
  }>;

  /** Overall progress */
  overall_progress: {
    completed: number;
    total: number;
  };
}
