export interface TranscriptTurn {
  role: "attacker" | "model";
  content: string;
  timestamp: string;
}

export interface AttackTrace {
  verification_prompt_to_llama_guard?: string | null;
  verification_response_raw?: string | null;
  judgement: "success" | "failure" | "error";
  verification_metadata: Record<string, any>;
}

export interface AttackNode {
  node_id: string;
  cluster_id: string;
  parent_ids: string[];
  attack_type: string;
  status: "pending" | "running" | "success" | "failure" | "error";
  initial_prompt: string;
  response?: string | null;
  num_turns: number;
  full_transcript: TranscriptTurn[];
  model_id?: string | null;
  llm_summary?: string | null;
  full_trace?: AttackTrace | null;
  attack_style?: string | null;
  risk_category?: string | null;
  success: boolean;
  fitness_score: number;
  llama_guard_score: number;
  generation: number;
  metadata: Record<string, any>;
  created_at: string;
  completed_at?: string | null;
  cost_usd: number;
  latency_ms: number;
  position?: { x: number; y: number };
}

export interface ClusterData {
  cluster_id: string;
  name: string;
  description?: string | null;
  position_hint: { x: number; y: number };
  node_ids: string[];
  parent_cluster_ids: string[];
  created_at: string;
  nodes?: AttackNode[];
  color?: string;
}

export interface EvolutionLink {
  link_id: string;
  source_node_ids: string[];
  target_node_id: string;
  evolution_type: "breeding" | "mutation" | "crossover";
  created_at: string;
}

export type WebSocketEventType =
  | "agent_mapping_update"
  | "cluster_add"
  | "node_add"
  | "node_update"
  | "evolution_link_add"
  | "attack_complete";

export interface AgentMappingUpdatePayload {
  status: string;
  message: string;
}

export interface ClusterAddPayload {
  cluster_id: string;
  name: string;
}

export interface NodeAddPayload {
  node_id: string;
  cluster_id: string;
  parent_ids: string[];
  attack_type: string;
  status: string;
}

export interface NodeUpdatePayload {
  node_id: string;
  status: string;
  model_id?: string | null;
  llm_summary?: string | null;
  full_transcript: TranscriptTurn[];
  full_trace?: AttackTrace | null;
}

export interface EvolutionLinkAddPayload {
  link_id: string;
  source_node_ids: string[];
  target_node_id: string;
  evolution_type: string;
}

export interface AttackCompletePayload {
  attack_id: string;
  message: string;
  results_url: string;
}

export interface EvolutionConfig {
  modelEndpoint: string;
  goals?: string[];
  seedAttacks?: number;
}
